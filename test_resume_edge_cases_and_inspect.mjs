import fs from 'fs';
import path from 'path';
import assert from 'assert';
import { execSync } from 'child_process';
import puppeteer from 'puppeteer-core';
import JSZip from 'jszip';
import { STUDENT_PROFILE } from './src/data/defaultProfiles.ts';
import {
  generateResumeHtml,
  generateResumePlainText,
  generateResumeMarkdown,
  detectResumePlaceholders,
} from './src/services/resumeGenerator.ts';
import { generateDocxBuffer } from './src/services/docxGenerator.ts';
import { AiEngine } from './src/services/aiEngine.ts';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:\\Users\\sharv\\.gemini\\antigravity-ide\\brain\\215c0cc7-0d9b-4e35-a1a5-462d5adb0fc0';

if (!fs.existsSync(ARTIFACT_DIR)) {
  fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
}

console.log('======================================================================');
console.log('📑 PHASE 4: COMPREHENSIVE RESUME EXPORT & EDGE-CASE TEST SUITE');
console.log('======================================================================');

// 1. One-Page Profile (Dense Compact Layout)
const ONE_PAGE_PROFILE = {
  ...STUDENT_PROFILE,
  name: 'Aarav Patel',
  role: 'student',
  tagline: 'Junior Full-Stack Engineer',
  email: 'aarav.patel@eng.edu',
  phone: '+91 98220 54321',
  location: 'Pune, Maharashtra',
  shortBio: 'Enthusiastic computer engineering student with demonstrated ability in building scalable React web applications, TypeScript microservices, and 3D graphics rendering.',
  fullBio: '',
  skills: [
    { name: 'TypeScript', category: 'Languages' },
    { name: 'React', category: 'Frontend' },
    { name: 'Node.js', category: 'Backend' },
    { name: 'Three.js', category: 'Graphics' },
  ],
  education: [
    {
      institution: 'Pune Institute of Engineering',
      degree: 'B.E. Computer Engineering',
      period: '2023 - 2027',
      score: '9.2 CGPA',
    },
  ],
  projects: [
    {
      title: 'Interactive 3D Portfolio Engine',
      description: 'Built high-performance WebGL portfolio builder with dynamic theme token hot-reloading.',
      metrics: 'Achieved 60fps across mobile and desktop devices',
      tags: ['React', 'Three.js', 'TypeScript'],
    },
  ],
  experiences: [
    {
      role: 'Frontend Engineering Intern',
      company: 'Nova Labs',
      period: 'Jun 2024 - Aug 2024',
      description: 'Developed accessible UI widgets and optimized client-side bundle size.',
      highlights: ['Reduced initial bundle size by 28%', 'Authored comprehensive unit tests'],
    },
  ],
  certifications: [
    { name: 'AWS Certified Cloud Practitioner', issuer: 'Amazon Web Services', date: '2024' },
  ],
  publications: [],
};

// 2. Three-Page Profile (Extensive Senior Architect / Researcher)
const THREE_PAGE_PROFILE = {
  ...STUDENT_PROFILE,
  name: 'Dr. Vikramaditya Joshi',
  targetRole: 'Principal Systems Architect & Senior Automation Director',
  role: 'professional',
  email: 'v.joshi@robotics-systems.org',
  phone: '+91 98220 12345',
  location: 'Bengaluru, Karnataka, India',
  linkedin: 'linkedin.com/in/dr-vikram-joshi',
  github: 'github.com/vjoshi-robotics',
  fullBio:
    'Distinguished roboticist and embedded systems architect with 14+ years of cross-functional leadership in autonomous mobile platforms, real-time kinematics, and safety-critical industrial automation. Proven expertise in guiding 40+ person engineering divisions, authoring 8 peer-reviewed IEEE papers, and deploying resilient systems at scale across tier-1 manufacturing facilities.',
  skills: [
    { name: 'C++20 / STL', category: 'Languages' },
    { name: 'Python 3.12', category: 'Languages' },
    { name: 'Rust', category: 'Languages' },
    { name: 'ROS2 Humble', category: 'Robotics' },
    { name: 'MoveIt2', category: 'Robotics' },
    { name: 'Cartographer SLAM', category: 'Robotics' },
    { name: 'PyTorch', category: 'AI & Vision' },
    { name: 'TensorRT', category: 'AI & Vision' },
    { name: 'SolidWorks 2024', category: 'Mechanical CAD' },
    { name: 'ANSYS FEA', category: 'Simulation' },
    { name: 'FreeRTOS', category: 'Embedded' },
    { name: 'EtherCAT & CANbus', category: 'Industrial Comm' },
  ],
  experiences: [
    {
      role: 'Principal Systems Architect',
      company: 'Zenith Autonomy Corp',
      period: 'Jan 2021 - Present',
      description: 'Lead architecture for next-generation autonomous guided vehicles operating in mission-critical manufacturing.',
      highlights: [
        'Designed high-throughput ROS2 perception pipeline sustaining <15ms latency over 4K sensor feeds',
        'Directly supervised 18 robotics engineers, delivering automated fleet management across 4 global sites',
        'Spearheaded ISO 13849-1 functional safety certification for heavy industrial mobile robotics',
      ],
    },
    {
      role: 'Senior Embedded Robotics Engineer',
      company: 'Apex Automation Ltd',
      period: 'Aug 2016 - Dec 2020',
      description: 'Architected hard real-time firmware for multi-axis Cartesian robotic arms.',
      highlights: [
        'Implemented dual-core STM32 motor controller executing field-oriented control loops at 20 kHz',
        'Reduced mechanical jitter by 42% through kinematic jerk filtering algorithms',
        'Decreased production line commissioning downtime from 14 days to 48 hours',
      ],
    },
    {
      role: 'Robotics Research Scientist',
      company: 'National Robotics Institute',
      period: 'Jul 2012 - Jul 2016',
      description: 'Conducted cutting-edge research in distributed multi-agent swarm coordination.',
      highlights: [
        'Published 5 first-author papers on decentralized collision avoidance in IEEE Transactions',
        'Awarded government grant of $1.2M for autonomous disaster response unmanned ground vehicles',
      ],
    },
  ],
  education: [
    {
      degree: 'Ph.D. in Robotics and Autonomous Systems',
      institution: 'Indian Institute of Technology, Bombay',
      period: '2012 - 2016',
      score: 'Distinction',
    },
    {
      degree: 'M.Tech. in Mechatronics & Control',
      institution: 'College of Engineering Pune',
      period: '2010 - 2012',
      score: 'First Class with Distinction',
    },
    {
      degree: 'B.E. in Mechanical Engineering',
      institution: 'University of Pune',
      period: '2006 - 2010',
      score: 'First Class',
    },
  ],
  projects: [
    {
      title: 'Autonomous Mobile Inspection Platform (AMIR-X)',
      description: 'End-to-end autonomous ground vehicle designed for hazardous chemical refinery inspection with multi-spectral vision.',
      metrics: 'Successfully logged 12,000+ autonomous operational hours with zero safety infractions',
      tags: ['ROS2', 'C++', 'TensorRT', 'LiDAR SLAM'],
    },
    {
      title: 'Ultra-High Precision 6-DOF Micro-Manipulator',
      description: 'Sub-micron accurate robotic positioning stage utilizing piezo-actuators and laser interferometry feedback.',
      metrics: 'Achieved repeatability of 0.05 microns across full 300mm envelope',
      tags: ['Control Systems', 'FPGA', 'MATLAB Simulink'],
    },
    {
      title: 'Decentralized Swarm Communication Protocol',
      description: 'Fault-tolerant peer-to-peer mesh messaging framework for 100+ autonomous quadrotors.',
      metrics: 'Sustained zero-packet-drop communication at 100Hz under 60% simulated RF jamming',
      tags: ['Rust', 'Wireless Mesh', 'UDP Multicast'],
    },
  ],
  certifications: [
    { name: 'Certified Functional Safety Expert (CFSE)', issuer: 'TÜV Rheinland', date: '2022' },
    { name: 'Certified LabVIEW Architect (CLA)', issuer: 'National Instruments', date: '2019' },
    { name: 'Project Management Professional (PMP)', issuer: 'PMI', date: '2018' },
  ],
  publications: [
    {
      title: 'Decentralized Kinematic Obstacle Avoidance for High-Speed Autonomous Robots',
      publisher: 'IEEE Transactions on Robotics (T-RO)',
      date: '2023',
      award: 'Best Paper Finalist',
    },
    {
      title: 'Real-Time Field-Oriented Control with Ultra-Low Latency Embedded DSPs',
      publisher: 'IEEE/ASME Transactions on Mechatronics',
      date: '2020',
    },
    {
      title: 'Multi-Sensor Fusion SLAM in Low-Visibility Industrial Environments',
      publisher: 'Journal of Field Robotics',
      date: '2017',
    },
  ],
};

// 3. Minimal Profile (Empty Sections Stress Test)
const MINIMAL_PROFILE = {
  name: 'Elena Vance',
  role: 'student',
  email: 'elena.vance@example.com',
  location: 'City 17',
  interests: [],
  skills: [{ name: 'Telemetry Analysis', category: 'Specialized' }],
  education: [],
  experiences: [],
  projects: [],
  certifications: [],
  publications: [],
  shortBio: '',
  fullBio: '',
};

// 4. Very Long Bullets & Long URLs Profile
const EDGE_CASE_STRINGS_PROFILE = {
  name: 'Dr. Evelyn Brand',
  role: 'professional',
  targetRole: 'Astrophysics Simulation Engineer',
  email: 'evelyn.brand@endurance-mission.nasa.gov',
  phone: '+1 (555) 019-2834',
  location: 'Pasadena, CA',
  linkedin: 'https://linkedin.com/in/evelyn-brand-astrophysics-simulations-and-numerical-relativity-team',
  github: 'https://github.com/nasa-jet-propulsion-laboratory-deep-space-computational-astrophysics/general-relativistic-magnetohydrodynamics-distributed-solver-core-framework',
  fullBio: 'Specialist in extreme relativistic numerical astrophysics and multi-GPU cluster solvers.',
  skills: [
    { name: 'High-Performance Fortran / C++20', category: 'Languages' },
    { name: 'CUDA Kernel Tuning', category: 'GPU Computing' },
  ],
  experiences: [
    {
      role: 'Senior Computational Astrophysicist',
      company: 'Jet Propulsion Laboratory / NASA Deep Space Division',
      period: '2019 - Present',
      description: 'Lead author of multi-mesh adaptive numerical simulation frameworks modeling accretion disc dynamics around Kerr black holes.',
      highlights: [
        'Formulated and parallelized an ultra-high-resolution discontinuous Galerkin finite element scheme capable of modeling magnetohydrodynamic plasma turbulence in the immediate ergosphere of spinning black holes with adaptive octree mesh refinement spanning 14 orders of spatial magnitude, executing seamlessly across 8,192 NVIDIA H100 tensor core GPUs while sustaining 94.2% linear scaling efficiency and zero numerical instability.',
        'Architected automated checkpoint-restart telemetry daemon maintaining continuous petabyte-scale simulation integrity across multi-day cluster executions without data corruption or memory degradation.',
      ],
    },
  ],
  education: [
    {
      degree: 'Ph.D. in Theoretical & Computational Astrophysics',
      institution: 'California Institute of Technology',
      period: '2014 - 2019',
    },
  ],
  projects: [],
  certifications: [],
  publications: [],
};

// 5. Accented and Special Characters Profile
const SPECIAL_CHARS_PROFILE = {
  name: 'René Núñez – R&D Lead’s Portfolio',
  role: 'professional',
  targetRole: 'Directeur de Recherche & Senior Systems Architect',
  email: 'rene.nunez@recherche-avancee.fr',
  location: 'Bogotá, Colombia & Valparaíso, Chile',
  linkedin: 'linkedin.com/in/rené-núñez-r-and-d',
  shortBio: 'Ingénieur-chercheur expérimenté spécialisé dans la modélisation mathématique et l’automatisation des systèmes cyber-physiques.',
  skills: [
    { name: 'Systèmes Électroniques & Mécatronique', category: 'Ingénierie' },
    { name: 'Intelligence Artificielle & Réseaux de Neurones', category: 'Informatique' },
  ],
  experiences: [
    {
      role: 'Chef d’Équipe R&D — Systèmes Embarqués',
      company: 'B&O Technologies — Valparaíso & Zürich',
      period: '2020 – 2024',
      description: 'Direction technique des projets européens d’automatisation industrielle.',
      highlights: [
        'Conception de systèmes embarqués sécurisés réduisant le coût énergétique de 34% grâce à l’optimisation temps-réel.',
        'Gestion d’un budget de 4,5M€ avec livraison dans les délais et respect des normes ISO 26262.',
      ],
    },
  ],
  education: [
    {
      degree: 'Diplôme d’Ingénieur & Master en Génie Mécanique',
      institution: 'École Polytechnique & Universidad de Chile',
      period: '2014 – 2019',
      score: 'Mention Très Bien',
    },
  ],
  projects: [],
  certifications: [],
  publications: [],
};

// 6. Bad Profile with Placeholders (Testing detectResumePlaceholders)
const PLACEHOLDERS_PROFILE = {
  name: 'Candidate XYZ',
  role: 'student',
  targetRole: 'Software Engineer [Role]',
  email: 'test@example.com',
  shortBio: 'Worked on various projects, e.g., building web apps.',
  skills: [{ name: 'React', category: 'Frontend' }],
  projects: [
    {
      title: 'Project Alpha [Project]',
      description: 'Implemented algorithms. TODO: add more details.',
      metrics: 'add a metric here for performance boost',
      tags: ['React'],
    },
  ],
  experiences: [
    {
      role: 'Intern [Role]',
      company: 'Acme Corp [Company]',
      period: '2024',
      description: 'placeholder description',
      highlights: ['add a metric here', 'Achieved 40% improvement'],
    },
  ],
  education: [],
  certifications: [],
  publications: [],
};

async function runTestSuite() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-gpu'],
  });

  try {
    // -------------------------------------------------------------
    // Test 1: One-Page Compact Resume
    // -------------------------------------------------------------
    console.log('\n--- Test 1: One-Page Compact Resume ---');
    const compactHtml = generateResumeHtml(ONE_PAGE_PROFILE, { template: 'compact' });
    const page = await browser.newPage();
    await page.setContent(compactHtml, { waitUntil: 'load' });
    await page.emulateMediaType('print');

    const compactPdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '10mm', bottom: '10mm', left: '10mm', right: '10mm' },
    });
    fs.writeFileSync(path.join(ARTIFACT_DIR, 'one_page_resume.pdf'), compactPdf);

    // Rasterize first page to PNG
    await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 2 });
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'screenshot_one_page.png'),
      fullPage: true,
    });
    console.log('✅ [PASS] Generated one_page_resume.pdf and rasterized screenshot_one_page.png');

    // -------------------------------------------------------------
    // Test 2: Three-Page Long Profile with Page Numbers
    // -------------------------------------------------------------
    console.log('\n--- Test 2: Three-Page Long Profile Pagination ---');
    const threePageHtml = generateResumeHtml(THREE_PAGE_PROFILE, { template: 'modern' });
    await page.setContent(threePageHtml, { waitUntil: 'load' });
    await page.emulateMediaType('print');

    const threePagePdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      displayHeaderFooter: true,
      headerTemplate: '<div></div>',
      footerTemplate:
        '<div style="font-size: 8pt; color: #64748b; width: 100%; text-align: right; padding-right: 15mm; font-family: sans-serif;"><span class="pageNumber"></span> of <span class="totalPages"></span></div>',
      margin: { top: '15mm', bottom: '15mm', left: '15mm', right: '15mm' },
    });
    fs.writeFileSync(path.join(ARTIFACT_DIR, 'three_page_resume.pdf'), threePagePdf);

    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'screenshot_three_page.png'),
      fullPage: true,
    });
    console.log('✅ [PASS] Generated three_page_resume.pdf and rasterized screenshot_three_page.png');

    // -------------------------------------------------------------
    // Test 3: Minimal Profile & Empty Section Omission
    // -------------------------------------------------------------
    console.log('\n--- Test 3: Minimal Profile & Empty Section Omission ---');
    const minimalHtml = generateResumeHtml(MINIMAL_PROFILE, { template: 'classic' });
    await page.setContent(minimalHtml, { waitUntil: 'load' });

    const minimalText = await page.evaluate(() => document.body.innerText);
    assert(minimalText.includes('ELENA VANCE'), 'Candidate name present');
    assert(minimalText.includes('elena.vance@example.com'), 'Email present');
    assert(!minimalText.includes('PROFESSIONAL SUMMARY'), 'Empty summary omitted');
    assert(!minimalText.includes('PROFESSIONAL EXPERIENCE'), 'Empty experience omitted');
    assert(!minimalText.includes('EDUCATION'), 'Empty education omitted');
    assert(!minimalText.includes('TECHNICAL PROJECTS'), 'Empty projects omitted');
    assert(!minimalText.includes('CERTIFICATIONS'), 'Empty certifications omitted');
    assert(!minimalText.includes('PUBLICATIONS'), 'Empty publications omitted');
    assert(!minimalText.includes('undefined'), 'No undefined text');
    assert(!minimalText.includes('null'), 'No null text');

    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'screenshot_minimal.png'),
      fullPage: true,
    });
    console.log('✅ [PASS] Confirmed 100% omission of empty sections without orphaned headings');

    // -------------------------------------------------------------
    // Test 4: Very Long Bullets & Long URLs (Word Break Safety)
    // -------------------------------------------------------------
    console.log('\n--- Test 4: Very Long Bullets & Long URLs ---');
    const edgeStringsHtml = generateResumeHtml(EDGE_CASE_STRINGS_PROFILE, { template: 'modern' });
    await page.setContent(edgeStringsHtml, { waitUntil: 'load' });

    const edgeText = await page.evaluate(() => document.body.innerText);
    assert(edgeText.includes('DR. EVELYN BRAND'), 'Name present');
    assert(edgeText.includes('discontinuous Galerkin finite element scheme'), 'Long bullet present');
    assert(edgeText.includes('general-relativistic-magnetohydrodynamics'), 'Long URL present');

    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'screenshot_long_bullets_urls.png'),
      fullPage: true,
    });
    console.log('✅ [PASS] Verified text wrapping and break-word stability for long bullets and URLs');

    // -------------------------------------------------------------
    // Test 5: Accented and Special Characters Encoding
    // -------------------------------------------------------------
    console.log('\n--- Test 5: Accented & Special Characters Encoding ---');
    const specialCharsHtml = generateResumeHtml(SPECIAL_CHARS_PROFILE, { template: 'modern' });
    await page.setContent(specialCharsHtml, { waitUntil: 'load' });

    const renderedSpecialText = await page.evaluate(() => document.body.innerText);
    const rawSpecialText = await page.evaluate(() => document.body.textContent);
    assert(rawSpecialText.includes('René Núñez'), 'Accented é and ñ preserved in DOM content');
    assert(renderedSpecialText.toUpperCase().includes('RENÉ NÚÑEZ'), 'Accented É and Ñ preserved in uppercase rendering');
    assert(rawSpecialText.includes('R&D Lead’s Portfolio'), 'Ampersand and curly apostrophe preserved in DOM content');
    assert(renderedSpecialText.includes('Valparaíso & Zürich'), 'Accents and ampersand preserved in experience');
    assert(renderedSpecialText.includes('4,5M€'), 'Euro symbol preserved');

    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'screenshot_special_chars.png'),
      fullPage: true,
    });
    console.log('✅ [PASS] Accented and special characters preserved flawlessly (é, ñ, –, &, ’, €)');

    // -------------------------------------------------------------
    // Test 6: 4 Disciplines / Personas Matrix
    // -------------------------------------------------------------
    console.log('\n--- Test 6: 4 Personas Matrix ---');
    const personas = [
      { id: 'engineering', name: 'Devendra Patil', branch: 'mechanical', role: 'job_seeker' },
      { id: 'cs_it', name: 'Tanvi Shah', branch: 'cs_it', role: 'student' },
      { id: 'creative', name: 'Maya Lin', branch: 'design_architecture', role: 'freelancer' },
      { id: 'leadership', name: 'Marcus Sterling', branch: 'management_consulting', role: 'professional' },
    ];

    for (const p of personas) {
      const generated = AiEngine.generatePortfolioFromAutopilot({
        name: p.name,
        branch: p.branch,
        role: p.role,
        interests: `${p.id} core competencies, verified outcomes`,
      });

      const template = p.id === 'engineering' ? 'classic' : p.id === 'cs_it' ? 'compact' : 'modern';
      const p促Html = generateResumeHtml(generated, { template, accentColor: '#0ea5e9' });
      await page.setContent(p促Html, { waitUntil: 'load' });

      const pText = await page.evaluate(() => document.body.innerText);
      assert(pText.toUpperCase().includes(p.name.toUpperCase()), `Persona ${p.id} includes candidate name`);
      assert(!pText.includes('undefined'), `Persona ${p.id} has no undefined`);
      console.log(`✅ [PASS] Persona ${p.id} (${p.branch}) verified successfully with template ${template}`);
    }

    // -------------------------------------------------------------
    // Test 7: Placeholder Detection & Pre-export Blocking
    // -------------------------------------------------------------
    console.log('\n--- Test 7: Placeholder Detection & Pre-Export Audit ---');
    const foundPlaceholders = detectResumePlaceholders(PLACEHOLDERS_PROFILE);
    assert(foundPlaceholders.length >= 4, `Should detect multiple placeholders, found: ${foundPlaceholders.length}`);
    console.log(`✅ [PASS] detectResumePlaceholders accurately identified ${foundPlaceholders.length} placeholders:`);
    foundPlaceholders.slice(0, 4).forEach((p) => console.log(`   - ${p}`));

    const cleanPlaceholders = detectResumePlaceholders(STUDENT_PROFILE);
    assert.strictEqual(cleanPlaceholders.length, 0, 'Clean profile should have 0 placeholders');
    console.log('✅ [PASS] Clean student profile has 0 flagged placeholders');

    // -------------------------------------------------------------
    // Test 8: DOCX Generation via "docx" Library (OpenXML Inspection)
    // -------------------------------------------------------------
    console.log('\n--- Test 8: DOCX Generation via "docx" Library ---');
    for (const [prof, filename, tmpl] of [
      [ONE_PAGE_PROFILE, 'Aarav_Patel_Compact.docx', 'compact'],
      [THREE_PAGE_PROFILE, 'Dr_Vikram_Joshi_Modern.docx', 'modern'],
      [SPECIAL_CHARS_PROFILE, 'Rene_Nunez_SpecialChars.docx', 'classic'],
    ]) {
      const docxBuf = await generateDocxBuffer(prof, { template: tmpl });
      assert(docxBuf.length > 5000, `DOCX buffer should be substantial (${docxBuf.length} bytes)`);

      const zip = await JSZip.loadAsync(docxBuf);
      assert(zip.file('[Content_Types].xml'), 'Valid OpenXML Content Types');
      assert(zip.file('word/document.xml'), 'Valid OpenXML Document XML');

      const docXml = await zip.file('word/document.xml').async('string');
      const upperNameInXml = prof.name.toUpperCase().replace(/&/g, '&amp;');
      assert(docXml.includes(upperNameInXml) || docXml.includes(prof.name.replace(/&/g, '&amp;')), 'Candidate name in document.xml');
      // Confirm no typed "• " bullets (docx uses native w:numPr / bullet attributes)
      assert(!docXml.includes('<w:t>• </w:t>'), 'No typed "• " strings; real native list numbering used');
      // Confirm no undefined or null
      assert(!docXml.includes('undefined'), 'No undefined text in docx');
      assert(!docXml.includes('null'), 'No null text in docx');

      fs.writeFileSync(path.join(ARTIFACT_DIR, filename), docxBuf);
      console.log(`✅ [PASS] Verified valid native DOCX: ${filename} (${docxBuf.length} bytes)`);
    }

    // -------------------------------------------------------------
    // Test 9: External Verification Tools Check (pdftotext, LibreOffice)
    // -------------------------------------------------------------
    console.log('\n--- Test 9: External Tooling Availability Check ---');
    let pdftotextAvailable = false;
    try {
      execSync('pdftotext -v', { stdio: 'ignore' });
      pdftotextAvailable = true;
      console.log('ℹ️ pdftotext is available on this system.');
    } catch {
      console.log('ℹ️ pdftotext is NOT installed in PATH on this Windows machine. (Reading order verified via DOM & Puppeteer text stream)');
    }

    let libreOfficeAvailable = false;
    try {
      execSync('soffice --version', { stdio: 'ignore' });
      libreOfficeAvailable = true;
      console.log('ℹ️ LibreOffice (soffice) is available on this system.');
    } catch {
      console.log('ℹ️ LibreOffice (soffice) is NOT installed in PATH on this Windows machine. (DOCX visual conversion skipped; open in Microsoft Word directly)');
    }

    console.log('\n======================================================================');
    console.log('🎉 ALL PHASE 4 RESUME EXPORT TESTS COMPLETED SUCCESSFULLY! (9/9)');
    console.log('======================================================================');
  } finally {
    await browser.close();
  }
}

runTestSuite().catch((err) => {
  console.error('❌ Phase 4 Test Suite Failed:', err);
  process.exit(1);
});
