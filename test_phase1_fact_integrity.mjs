import assert from 'assert';
import JSZip from 'jszip';
import { AiEngine } from './src/services/aiEngine.ts';
import {
  generateResumeHtml,
  generateResumePlainText,
  generateResumeMarkdown,
} from './src/services/resumeGenerator.ts';
import { generateDocxBuffer } from './src/services/docxGenerator.ts';

console.log('======================================================================');
console.log('🛡️  PHASE 1 REGRESSION TEST SUITE: FACT INTEGRITY & STRICT PROVENANCE');
console.log('======================================================================\n');

let totalTests = 0;
let passedTests = 0;

function runCheck(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`✅ [PASS] ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`❌ [FAIL] ${name}`);
    console.error(`   Error: ${err.message}`);
    process.exitCode = 1;
  }
}

async function runAsyncCheck(name, fn) {
  totalTests++;
  try {
    await fn();
    console.log(`✅ [PASS] ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`❌ [FAIL] ${name}`);
    console.error(`   Error: ${err.message}`);
    process.exitCode = 1;
  }
}

(async () => {
  // --------------------------------------------------------------------------
  // 1. Empty education input never creates a fictional institution, degree, or grade
  // --------------------------------------------------------------------------
  console.log('--- 1. Education Fact Integrity ---');
  const roles = ['student', 'job_seeker', 'professional', 'freelancer'];
  for (const role of roles) {
    runCheck(`Empty education input preserves empty state for role: ${role}`, () => {
      const p = AiEngine.generatePortfolioFromAutopilot({
        name: 'Jane Doe',
        role,
        branch: 'cs_it',
        interests: 'Systems Programming',
      });
      assert(Array.isArray(p.education), 'Education is an array');
      assert.strictEqual(p.education.length, 0, `Education must be empty array, got ${p.education.length}`);
    });
  }

  runCheck('No fabricated institution strings like "Engineering & Technology Institute" appear', () => {
    const p = AiEngine.generatePortfolioFromAutopilot({
      name: 'Taylor Swift',
      role: 'student',
      branch: 'mechanical',
      interests: 'Thermal Systems',
      education: [],
    });
    const serialized = JSON.stringify(p.education);
    assert(!serialized.includes('Engineering & Technology Institute'), 'No fake institution');
    assert(!serialized.includes('First Class / Distinction'), 'No fake grades/scores');
    assert.strictEqual(p.education.length, 0, 'Explicit empty education remains empty');
  });

  // --------------------------------------------------------------------------
  // 2. Empty project input never creates completed projects marked isAiIdea: false
  // --------------------------------------------------------------------------
  console.log('\n--- 2. Project Fact Integrity & Completed Work Provenance ---');
  const branches = ['cs_it', 'mechanical', 'mechatronics', 'civil', 'electrical_ece', 'custom'];
  for (const branch of branches) {
    runCheck(`Empty project input creates ZERO completed projects (isAiIdea: false) for branch: ${branch}`, () => {
      const p = AiEngine.generatePortfolioFromAutopilot({
        name: 'Sam Altman',
        role: 'student',
        branch,
        customBranchName: branch === 'custom' ? 'Aerospace Propulsion' : undefined,
        interests: 'Propulsion, Dynamics',
      });
      const verifiedProjects = p.projects.filter((proj) => proj.isAiIdea === false);
      assert.strictEqual(
        verifiedProjects.length,
        0,
        `Expected 0 projects marked isAiIdea: false, found ${verifiedProjects.length}`
      );
      assert(
        p.projects.every((proj) => proj.isAiIdea === true),
        'All projects in empty-input generation must be explicitly tagged isAiIdea: true'
      );
    });
  }

  // --------------------------------------------------------------------------
  // 3. Empty experience input never inserts mock employers or employment history
  // --------------------------------------------------------------------------
  console.log('\n--- 3. Experience Fact Integrity ---');
  for (const role of roles) {
    runCheck(`Empty experience input preserves empty state for role: ${role}`, () => {
      const p = AiEngine.generatePortfolioFromAutopilot({
        name: 'Alex Rivera',
        role,
        branch: 'cs_it',
        interests: 'Distributed Cache',
      });
      const exps = p.experiences || p.experience || [];
      assert.strictEqual(exps.length, 0, `Experience must be empty array for ${role}, got ${exps.length}`);
    });
  }

  runCheck('No mock employers appear in unprovided experience', () => {
    const p = AiEngine.generatePortfolioFromAutopilot({
      name: 'Morgan Freeman',
      role: 'job_seeker',
      branch: 'mechanical',
      interests: 'FEA',
      experiences: [],
    });
    const serialized = JSON.stringify(p.experiences);
    assert(!serialized.includes('TechCorp'), 'No TechCorp');
    assert(!serialized.includes('Google'), 'No Google');
    assert(!serialized.includes('Stripe'), 'No Stripe');
    assert.strictEqual(p.experiences.length, 0, 'Experiences array is empty');
  });

  // --------------------------------------------------------------------------
  // 4. AI project suggestions remain explicitly marked as suggestions
  // --------------------------------------------------------------------------
  console.log('\n--- 4. AI Suggestions Explicit Tagging ---');
  runCheck('Discipline proposals and AI suggestions carry isAiIdea: true', () => {
    const p = AiEngine.generatePortfolioFromAutopilot({
      name: 'Ravi Kumar',
      role: 'student',
      branch: 'mechanical',
      interests: 'CAD, SolidWorks, Thermal, FEA',
    });
    assert(p.projects.length > 0, 'Projects array has items');
    p.projects.forEach((proj, idx) => {
      assert.strictEqual(
        proj.isAiIdea,
        true,
        `Project #${idx + 1} (${proj.title}) must have isAiIdea: true`
      );
    });
    assert(p.aiProjectSuggestions.length > 0, 'aiProjectSuggestions array has items');
    p.aiProjectSuggestions.forEach((sug, idx) => {
      assert.strictEqual(
        sug.isAiIdea,
        true,
        `Suggestion #${idx + 1} (${sug.title}) must have isAiIdea: true`
      );
    });
  });

  // --------------------------------------------------------------------------
  // 5. Genuine user-provided records survive generation and export
  // --------------------------------------------------------------------------
  console.log('\n--- 5. Preservation of Genuine User Records ---');
  const userRealEducation = [
    {
      id: 'edu-user-1',
      institution: 'Indian Institute of Technology Bombay',
      degree: 'B.Tech in Mechanical Engineering',
      period: '2020 – 2024',
      score: '8.92 CGPA',
      details: 'Specialization in Computational Fluid Dynamics',
    },
  ];
  const userRealExperience = [
    {
      id: 'exp-user-1',
      company: 'Tata Advanced Systems',
      role: 'Aerospace Engineering Intern',
      period: 'Jan 2024 – Jun 2024',
      location: 'Hyderabad, India',
      description: 'Aerodynamic simulation of composite wing surfaces.',
      highlights: ['Modeled transonic airflow using ANSYS Fluent', 'Validated wind tunnel pressure tap sensors'],
    },
  ];
  const userRealProject = {
    id: 'proj-user-1',
    title: 'Autonomous Solar UAV Airframe',
    description: 'Designed and composite-manufactured a 3.2m wingspan solar UAV.',
    tags: ['SolidWorks', 'ANSYS Composite PrepPost', 'CFD'],
    role: 'Chief Airframe Engineer',
    metrics: 'Achieved 8.2 hours continuous flight endurance',
    isAiIdea: false,
  };

  const userPortfolio = AiEngine.generatePortfolioFromAutopilot({
    name: 'Rohit Deshmukh',
    branch: 'mechanical',
    role: 'job_seeker',
    interests: 'Aerospace, CFD, FEA',
    education: userRealEducation,
    experiences: userRealExperience,
    projects: [userRealProject],
  });

  runCheck('User-provided education survives in generated portfolio', () => {
    assert.strictEqual(userPortfolio.education.length, 1);
    assert.strictEqual(userPortfolio.education[0].institution, 'Indian Institute of Technology Bombay');
    assert.strictEqual(userPortfolio.education[0].score, '8.92 CGPA');
  });

  runCheck('User-provided experience survives in generated portfolio', () => {
    assert.strictEqual(userPortfolio.experiences.length, 1);
    assert.strictEqual(userPortfolio.experiences[0].company, 'Tata Advanced Systems');
    assert.strictEqual(userPortfolio.experiences[0].role, 'Aerospace Engineering Intern');
  });

  runCheck('User-provided project is preserved as verified completed work (isAiIdea: false)', () => {
    const verified = userPortfolio.projects.filter((p) => !p.isAiIdea);
    assert.strictEqual(verified.length, 1);
    assert.strictEqual(verified[0].title, 'Autonomous Solar UAV Airframe');
    assert.strictEqual(verified[0].isAiIdea, false);
  });

  runCheck('AI ideas accompany verified project without contaminating its status', () => {
    const ideas = userPortfolio.projects.filter((p) => p.isAiIdea === true);
    assert(ideas.length > 0, 'AI suggestions are present');
    assert(ideas.every((i) => i.isAiIdea === true), 'All suggestions marked isAiIdea: true');
  });

  runCheck('User-provided records appear faithfully in HTML, Plaintext, and Markdown resume exports', () => {
    const html = generateResumeHtml(userPortfolio, { template: 'classic' });
    assert(html.includes('Indian Institute of Technology Bombay'), 'HTML has user education institution');
    assert(html.includes('Tata Advanced Systems'), 'HTML has user company');
    assert(html.includes('Autonomous Solar UAV Airframe'), 'HTML has user project title');

    const plaintext = generateResumePlainText(userPortfolio);
    assert(plaintext.includes('Indian Institute of Technology Bombay'), 'Plaintext has user education');
    assert(plaintext.includes('Tata Advanced Systems'), 'Plaintext has user company');
    assert(plaintext.includes('AUTONOMOUS SOLAR UAV AIRFRAME'), 'Plaintext has user project');

    const markdown = generateResumeMarkdown(userPortfolio);
    assert(markdown.includes('Indian Institute of Technology Bombay'), 'Markdown has user education');
    assert(markdown.includes('Tata Advanced Systems'), 'Markdown has user company');
    assert(markdown.includes('Autonomous Solar UAV Airframe'), 'Markdown has user project');
  });

  await runAsyncCheck('User-provided records appear faithfully in DOCX export', async () => {
    const docxBuf = await generateDocxBuffer(userPortfolio);
    assert(docxBuf.length > 5000, 'DOCX buffer is substantial');
    const zip = await JSZip.loadAsync(docxBuf);
    const docXml = await zip.file('word/document.xml').async('string');
    assert(docXml.includes('Indian Institute of Technology Bombay'), 'DOCX has user education');
    assert(docXml.includes('Tata Advanced Systems'), 'DOCX has user experience');
    assert(docXml.includes('Autonomous Solar UAV Airframe'), 'DOCX has user project');
  });

  // --------------------------------------------------------------------------
  // 6. Missing sections are omitted from resume output
  // --------------------------------------------------------------------------
  console.log('\n--- 6. Clean Section Omission in Resume Output ---');
  // Candidate with NO education, NO experience, NO verified projects
  const blankCandidate = AiEngine.generatePortfolioFromAutopilot({
    name: 'Aiden Cooper',
    role: 'student',
    branch: 'cs_it',
    interests: 'Distributed Systems, Rust',
  });

  runCheck('HTML resume omits missing Education, Experience, and Technical Projects', () => {
    const html = generateResumeHtml(blankCandidate, { template: 'classic' });
    assert(!html.includes('<h2 class="section-title">Education</h2>'), 'Education section heading omitted in HTML');
    assert(!html.includes('<h2 class="section-title">Professional Experience</h2>'), 'Experience heading omitted in HTML');
    assert(!html.includes('<h2 class="section-title">Technical Projects</h2>'), 'Projects heading omitted in HTML');
  });

  runCheck('Plaintext resume omits missing Education, Experience, and Technical Projects', () => {
    const plaintext = generateResumePlainText(blankCandidate);
    assert(!plaintext.includes('EDUCATION\n====='), 'Education section omitted in Plaintext');
    assert(!plaintext.includes('PROFESSIONAL EXPERIENCE'), 'Experience section omitted in Plaintext');
    assert(!plaintext.includes('TECHNICAL PROJECTS\n====='), 'Projects section omitted in Plaintext');
  });

  runCheck('Markdown resume omits missing Education, Experience, and Technical Projects', () => {
    const markdown = generateResumeMarkdown(blankCandidate);
    assert(!markdown.includes('## Education'), 'Education section omitted in Markdown');
    assert(!markdown.includes('## Professional Experience'), 'Experience section omitted in Markdown');
    assert(!markdown.includes('## Technical Projects'), 'Projects section omitted in Markdown');
  });

  await runAsyncCheck('DOCX resume omits missing Education, Experience, and Technical Projects', async () => {
    const docxBuf = await generateDocxBuffer(blankCandidate);
    const zip = await JSZip.loadAsync(docxBuf);
    const docXml = await zip.file('word/document.xml').async('string');
    assert(!docXml.includes('EDUCATION'), 'Education heading omitted in DOCX XML');
    assert(!docXml.includes('PROFESSIONAL EXPERIENCE'), 'Experience heading omitted in DOCX XML');
    assert(!docXml.includes('TECHNICAL PROJECTS'), 'Projects heading omitted in DOCX XML');
  });

  // --------------------------------------------------------------------------
  // 7. Strict Provenance: AI suggestions are never presented on resumes as completed work
  // --------------------------------------------------------------------------
  console.log('\n--- 7. Resume Strict Provenance: Suggestions Never Treated as Completed Work ---');
  runCheck('Resume exports strictly include only verified projects (isAiIdea: false)', () => {
    // Portfolio with 1 verified project and 2 AI suggestions
    const mixedPortfolio = {
      ...blankCandidate,
      projects: [
        {
          id: 'v-1',
          title: 'Production Billing Microservice',
          description: 'Built high-throughput payment settlement engine.',
          tags: ['Go', 'PostgreSQL'],
          isAiIdea: false,
        },
        {
          id: 'sug-1',
          title: 'Quantum Key Distribution Simulator [AI Idea]',
          description: 'Unbuilt concept for simulating QKD photons.',
          tags: ['Python', 'Simulation'],
          isAiIdea: true,
        },
      ],
    };

    const html = generateResumeHtml(mixedPortfolio, { template: 'classic' });
    assert(html.includes('Production Billing Microservice'), 'Verified project rendered in HTML');
    assert(!html.includes('Quantum Key Distribution Simulator'), 'AI idea omitted from HTML resume');

    const plaintext = generateResumePlainText(mixedPortfolio);
    assert(plaintext.includes('PRODUCTION BILLING MICROSERVICE'), 'Verified project rendered in Plaintext');
    assert(!plaintext.includes('Quantum Key Distribution Simulator'), 'AI idea omitted from Plaintext resume');

    const markdown = generateResumeMarkdown(mixedPortfolio);
    assert(markdown.includes('Production Billing Microservice'), 'Verified project rendered in Markdown');
    assert(!markdown.includes('Quantum Key Distribution Simulator'), 'AI idea omitted from Markdown resume');
  });

  // --------------------------------------------------------------------------
  // 8. Persona, discipline, and fallback regression check
  // --------------------------------------------------------------------------
  console.log('\n--- 8. Persona & Discipline Non-Regression ---');
  runCheck('Student persona sets role, themes, and education section visibility', () => {
    const p = AiEngine.generatePortfolioFromAutopilot({ name: 'Student Test', role: 'student', interests: 'AI' });
    assert.strictEqual(p.role, 'student');
    assert.strictEqual(p.theme, 'cyberpunk_neon');
    assert.strictEqual(p.sectionVisibility.education, true);
    assert.strictEqual(p.sectionVisibility.services, false);
  });

  runCheck('Job Seeker persona sets role, themes, and experience section visibility', () => {
    const p = AiEngine.generatePortfolioFromAutopilot({ name: 'Seeker Test', role: 'job_seeker', interests: 'React' });
    assert.strictEqual(p.role, 'job_seeker');
    assert.strictEqual(p.theme, 'obsidian_stealth');
    assert.strictEqual(p.sectionVisibility.experience, true);
  });

  runCheck('Professional persona defaults to hologram_core and obsidian_stealth', () => {
    const p = AiEngine.generatePortfolioFromAutopilot({ name: 'Pro Test', role: 'professional', interests: 'Architecture' });
    assert.strictEqual(p.role, 'professional');
    assert.strictEqual(p.hero3DMode, 'hologram_core');
    assert.strictEqual(p.theme, 'obsidian_stealth');
  });

  runCheck('Freelancer persona enables services and testimonials', () => {
    const p = AiEngine.generatePortfolioFromAutopilot({ name: 'Freelancer Test', role: 'freelancer', interests: 'UI/UX' });
    assert.strictEqual(p.role, 'freelancer');
    assert.strictEqual(p.sectionVisibility.services, true);
    assert.strictEqual(p.sectionVisibility.testimonials, true);
    assert(p.sectionOrder.includes('services'));
  });

  // --------------------------------------------------------------------------
  // 9. Name & Identity Fact Integrity (Zero Fabricated Names)
  // --------------------------------------------------------------------------
  console.log('\n--- 9. Name & Identity Fact Integrity ---');
  runCheck('Empty input does not produce a fabricated identity', () => {
    const p = AiEngine.generatePortfolioFromAutopilot({});
    assert.strictEqual(p.name, '', 'Name must remain empty string, never Alex Chen');
    assert.strictEqual(p.profile.name, '', 'Profile name must remain empty string');
    assert(!p.fullBio.includes('Alex Chen'), 'Bio must not contain Alex Chen');
    assert(!p.fullBio.includes('Engineer is an'), 'Bio must not contain synthetic fallback name');
    assert(!p.id.includes('alex_chen'), 'ID must not contain alex_chen');
    assert(!p.telemetry.session.includes('ALEX'), 'Telemetry session must not contain ALEX');
  });

  runCheck('Missing names remain missing through portfolio generation', () => {
    const p1 = AiEngine.generatePortfolioFromAutopilot({ name: '', role: 'student', branch: 'cs_it' });
    assert.strictEqual(p1.name, '', 'Empty string name remains empty');
    assert.strictEqual(p1.profile.name, '', 'Profile name remains empty');

    const p2 = AiEngine.generatePortfolioFromAutopilot({ name: '   \t  \n  ', role: 'job_seeker' });
    assert.strictEqual(p2.name, '', 'Whitespace-only name remains empty');
    assert.strictEqual(p2.profile.name, '', 'Profile name for whitespace remains empty');
  });

  runCheck('Valid user-provided names remain unchanged', () => {
    const p = AiEngine.generatePortfolioFromAutopilot({ name: 'Devon Lee', role: 'student', branch: 'cs_it' });
    assert.strictEqual(p.name, 'Devon Lee', 'Genuine user name preserved in root');
    assert.strictEqual(p.profile.name, 'Devon Lee', 'Genuine user name preserved in profile');
    assert(p.fullBio.includes('Devon Lee'), 'Full bio references user name');
    assert(p.telemetry.session.includes('DEVON'), 'Telemetry session includes user name initial');
  });

  runCheck('Partial profiles still generate safely without crashing or hallucinations', () => {
    const p = AiEngine.generatePortfolioFromAutopilot({ branch: 'mechanical', interests: 'Thermodynamics, FEA' });
    assert.strictEqual(p.name, '', 'Name remains uninvented');
    assert.strictEqual(p.branch, 'mechanical', 'Discipline branch set correctly');
    assert(p.skills.length > 0, 'Discipline skills populated');
    assert.strictEqual(p.education.length, 0, 'No fake education invented');
    assert.strictEqual(p.experience.length, 0, 'No fake experience invented');
  });

  runCheck('Existing persona behavior does not regress when name is missing', () => {
    const personas = ['student', 'job_seeker', 'professional', 'freelancer'];
    for (const role of personas) {
      const p = AiEngine.generatePortfolioFromAutopilot({ role, branch: 'cs_it' });
      assert.strictEqual(p.role, role, `Role ${role} preserved`);
      assert.strictEqual(p.name, '', `Name empty for ${role}`);
      assert(typeof p.fullBio === 'string' && p.fullBio.length > 20, `Bio generated cleanly for ${role}`);
      assert(!p.fullBio.includes('Alex Chen'), `No Alex Chen in bio for ${role}`);
    }
  });

  runCheck('AI provider failure and offline fallback does not introduce fictional names', () => {
    const p = AiEngine.generatePortfolioFromAutopilot({
      name: '',
      role: 'student',
      branch: 'cs_it',
      projects: [],
      education: [],
      experiences: [],
    });
    assert.strictEqual(p.name, '', 'Offline fallback preserves empty name');
    assert(!p.fullBio.includes('Alex Chen'), 'Offline bio contains no fictional identity');

    // Verify resume export uses clearly labeled Candidate placeholder, never Alex Chen
    const htmlResume = generateResumeHtml(p);
    assert(!htmlResume.includes('Alex Chen'), 'HTML resume contains no fictional identity');
    assert(htmlResume.includes('Candidate'), 'HTML resume uses generic Candidate placeholder');

    const plaintextResume = generateResumePlainText(p);
    assert(!plaintextResume.includes('Alex Chen'), 'Plaintext resume contains no fictional identity');
    assert(plaintextResume.includes('CANDIDATE'), 'Plaintext resume uses generic CANDIDATE placeholder');

    const mdResume = generateResumeMarkdown(p);
    assert(!mdResume.includes('Alex Chen'), 'Markdown resume contains no fictional identity');
    assert(mdResume.includes('Candidate'), 'Markdown resume uses generic Candidate placeholder');
  });

  console.log('\n======================================================================');
  console.log(`🎯 TOTAL CHECKS: ${totalTests} | PASSED: ${passedTests} | FAILED: ${totalTests - passedTests}`);
  console.log('======================================================================\n');

  if (totalTests !== passedTests) {
    process.exit(1);
  }
})();
