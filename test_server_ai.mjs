console.log('=====================================================');
console.log('🧪 RUNNING SERVER AI & BACKEND API TEST SUITE');
console.log('=====================================================');

let passedTests = 0;
let totalTests = 0;

function assert(condition, testName) {
  totalTests++;
  if (condition) {
    console.log(`✅ [PASS] ${testName}`);
    passedTests++;
  } else {
    console.error(`❌ [FAIL] ${testName}`);
    process.exitCode = 1;
  }
}

async function runTests() {
  const baseUrl = 'http://localhost:5000';

  // 1. Health Endpoint Test
  console.log('\n--- 1. Health Endpoint Check ---');
  try {
    const res = await fetch(`${baseUrl}/api/health`);
    const data = await res.json();
    assert(res.status === 200, 'GET /api/health returns HTTP 200');
    assert(data.status === 'ok', 'Health status is ok');
    assert(typeof data.hasOpenAiKey === 'boolean', 'hasOpenAiKey is boolean');
    console.log(`ℹ️ Configured Engine: ${data.configuredEngine} (Model: ${data.model})`);
  } catch (e) {
    assert(false, `GET /api/health failed: ${e.message}`);
  }

  // 2. Generate Portfolio - Student Role
  console.log('\n--- 2. Generation: Student Role ---');
  try {
    const res = await fetch(`${baseUrl}/api/ai/generate-portfolio`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Sharvil Naikwade',
        interests: 'Artificial Intelligence, Computer Vision, Machine Learning',
        role: 'student',
      }),
    });
    const data = await res.json();
    assert(res.status === 200, 'Student portfolio generation returns HTTP 200');
    assert(data.portfolio !== undefined, 'Returned portfolio object exists');
    assert(data.portfolio.role === 'student', 'Portfolio role is student');
    assert(data.portfolio.name.includes('Sharvil'), 'Portfolio name preserved');
    assert(data.portfolio.sectionVisibility.education === true, 'Student enables education section');
    assert(data.portfolio.projects.length > 0, 'Student has projects array');
    assert(data.source === 'ai' || data.source === 'fallback', 'Response includes source: "ai" | "fallback"');
    console.log(`ℹ️ Generation mode: [source: ${data.source}] ${data.liveAi ? 'Live OpenAI' : 'Offline Fallback'} (${data.model})`);
  } catch (e) {
    assert(false, `Student generation failed: ${e.message}`);
  }

  // 3. Generate Portfolio - Job Seeker Role
  console.log('\n--- 3. Generation: Job Seeker Role ---');
  try {
    const res = await fetch(`${baseUrl}/api/ai/generate-portfolio`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Jordan Hayes',
        interests: 'Full Stack Engineering, Cloud Microservices, Python',
        role: 'job_seeker',
      }),
    });
    const data = await res.json();
    assert(res.status === 200, 'Job Seeker generation returns HTTP 200');
    assert(data.portfolio.role === 'job_seeker', 'Role is job_seeker');
    assert(data.source === 'ai' || data.source === 'fallback', 'Job seeker includes source');
    assert(data.portfolio.targetRole.length > 0, 'Target role headline is populated');
  } catch (e) {
    assert(false, `Job Seeker generation failed: ${e.message}`);
  }

  // 4. Generate Portfolio - Working Professional Role
  console.log('\n--- 4. Generation: Working Professional Role ---');
  try {
    const res = await fetch(`${baseUrl}/api/ai/generate-portfolio`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Marcus Vance',
        interests: 'Distributed Systems, High Throughput Architecture',
        role: 'professional',
      }),
    });
    const data = await res.json();
    assert(res.status === 200, 'Professional generation returns HTTP 200');
    assert(data.portfolio.role === 'professional', 'Role is professional');
    assert(data.source === 'ai' || data.source === 'fallback', 'Professional includes source');
  } catch (e) {
    assert(false, `Professional generation failed: ${e.message}`);
  }

  // 5. Generate Portfolio - Freelancer Role
  console.log('\n--- 5. Generation: Freelancer Role ---');
  try {
    const res = await fetch(`${baseUrl}/api/ai/generate-portfolio`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Elena Rostova',
        interests: 'Creative WebGL Development, Brand Systems',
        role: 'freelancer',
      }),
    });
    const data = await res.json();
    assert(res.status === 200, 'Freelancer generation returns HTTP 200');
    assert(data.portfolio.role === 'freelancer', 'Role is freelancer');
    assert(data.source === 'ai' || data.source === 'fallback', 'Freelancer includes source');
    assert(data.portfolio.sectionVisibility.services === true, 'Freelancer enables services');
  } catch (e) {
    assert(false, `Freelancer generation failed: ${e.message}`);
  }

  // 5b. Generate Portfolio - Discipline: Mechanical Engineering
  console.log('\n--- 5b. Generation: Mechanical Engineering Discipline ---');
  try {
    const res = await fetch(`${baseUrl}/api/ai/generate-portfolio`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Vikram Joshi',
        branch: 'mechanical',
        interests: 'CAD Modeling, Finite Element Analysis, SolidWorks, Robotics',
        role: 'student',
      }),
    });
    const data = await res.json();
    assert(res.status === 200, 'Mechanical generation returns HTTP 200');
    assert(data.source === 'ai' || data.source === 'fallback', 'Mechanical includes source');
    assert(data.portfolio.branch === 'mechanical', 'Discipline branch is mechanical');
    assert(data.portfolio.skills.some(s => /cad|ansys|solidworks|fea|thermo|fluid|mechan/i.test(s.name)), 'Mechanical skills populated');
  } catch (e) {
    assert(false, `Mechanical generation failed: ${e.message}`);
  }

  // 5c. Generate Portfolio - Discipline: Civil Engineering
  console.log('\n--- 5c. Generation: Civil Engineering Discipline ---');
  try {
    const res = await fetch(`${baseUrl}/api/ai/generate-portfolio`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Aanya Sharma',
        branch: 'civil',
        interests: 'Structural Dynamics, Seismic Design, STAAD Pro, BIM',
        role: 'job_seeker',
      }),
    });
    const data = await res.json();
    assert(res.status === 200, 'Civil generation returns HTTP 200');
    assert(data.source === 'ai' || data.source === 'fallback', 'Civil includes source');
    assert(data.portfolio.branch === 'civil', 'Discipline branch is civil');
    assert(data.portfolio.skills.some(s => /staad|autocad|revit|etabs|concrete|geo|structur/i.test(s.name)), 'Civil skills populated');
  } catch (e) {
    assert(false, `Civil generation failed: ${e.message}`);
  }

  // 5d. Generate Portfolio - Discipline: Electrical Engineering
  console.log('\n--- 5d. Generation: Electrical Engineering Discipline ---');
  try {
    const res = await fetch(`${baseUrl}/api/ai/generate-portfolio`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'David Kim',
        branch: 'electrical',
        interests: 'Power Grid Modernization, High Voltage Systems, MATLAB Simulink',
        role: 'professional',
      }),
    });
    const data = await res.json();
    assert(res.status === 200, 'Electrical generation returns HTTP 200');
    assert(data.source === 'ai' || data.source === 'fallback', 'Electrical includes source');
    assert(data.portfolio.branch === 'electrical', 'Discipline branch is electrical');
  } catch (e) {
    assert(false, `Electrical generation failed: ${e.message}`);
  }

  // 5e. Generate Portfolio - Custom Discipline: "Marine Engineering"
  console.log('\n--- 5e. Generation: Custom Discipline ("Marine Engineering") ---');
  try {
    const res = await fetch(`${baseUrl}/api/ai/generate-portfolio`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Captain Alistair Finch',
        branch: 'other',
        customBranchName: 'Marine Engineering',
        interests: 'Hydrodynamic Propulsion, Naval Architecture, Diesel Plant Automation',
        role: 'professional',
      }),
    });
    const data = await res.json();
    assert(res.status === 200, 'Marine Engineering custom generation returns HTTP 200');
    assert(data.source === 'ai' || data.source === 'fallback', 'Custom discipline includes source');
    const branchName = data.portfolio.branchName || data.portfolio.disciplineName || '';
    assert(/marine/i.test(branchName) || /marine/i.test(data.portfolio.tagline) || /marine/i.test(data.portfolio.shortBio), 'Marine Engineering terminology synthesized');
  } catch (e) {
    assert(false, `Marine Engineering generation failed: ${e.message}`);
  }

  // 6. Rewrite Section Endpoint
  console.log('\n--- 6. Rewrite Section Check ---');
  try {
    const res = await fetch(`${baseUrl}/api/ai/rewrite-section`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        section: 'shortBio',
        content: 'I do coding and machine learning stuff for web apps.',
        tone: 'professional',
        role: 'student',
      }),
    });
    const data = await res.json();
    assert(res.status === 200, 'Rewrite section returns HTTP 200');
    assert(typeof data.rewritten === 'string', 'Rewritten content is string');
    assert(typeof data.explanation === 'string', 'Rewrite includes explanation');
  } catch (e) {
    assert(false, `Rewrite section failed: ${e.message}`);
  }

  // 7. Recommendations Endpoint
  console.log('\n--- 7. Recommendations Check ---');
  try {
    const res = await fetch(`${baseUrl}/api/ai/recommendations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        role: 'freelancer',
        profile: {
          name: 'Elena Rostova',
          role: 'freelancer',
          email: 'elena@example.com',
          skills: [],
          projects: [],
        },
      }),
    });
    const data = await res.json();
    assert(res.status === 200, 'Recommendations returns HTTP 200');
    assert(Array.isArray(data.recommendedSections), 'recommendedSections is array');
    assert(Array.isArray(data.improvementSuggestions), 'improvementSuggestions is array');
    assert(data.recommendedSections.includes('services'), 'Freelancer recommendations include services');
  } catch (e) {
    assert(false, `Recommendations failed: ${e.message}`);
  }

  // 8. Conversational Chat Co-Pilot Endpoint
  console.log('\n--- 8. Conversational Chat Co-Pilot Check ---');
  try {
    const res = await fetch(`${baseUrl}/api/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        instruction: 'Switch theme to obsidian and prioritize machine learning projects',
        currentProfile: {
          id: 'test_prof',
          name: 'Sharvil Naikwade',
          role: 'student',
          theme: 'cyberpunk_neon',
          projects: [
            { id: '1', title: 'Web App', tags: ['React'] },
            { id: '2', title: 'ML Classifier', tags: ['Python', 'Machine Learning'] },
          ],
          sectionVisibility: { education: true, services: false },
        },
      }),
    });
    const data = await res.json();
    assert(res.status === 200, 'Chat endpoint returns HTTP 200');
    assert(data.updatedProfile !== undefined, 'updatedProfile returned');
    assert(typeof data.explanation === 'string', 'Chat explanation returned');
  } catch (e) {
    assert(false, `Chat co-pilot failed: ${e.message}`);
  }

  // 9. Input Validation and Security Rejection Check (400 Bad Request)
  console.log('\n--- 9. Security & Validation Rejection Check ---');
  try {
    // Missing required name
    const resMissingName = await fetch(`${baseUrl}/api/ai/generate-portfolio`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: '   ', // Empty name
        role: 'student',
      }),
    });
    assert(resMissingName.status === 400, 'Empty name triggers HTTP 400 Bad Request');
    const errMissingName = await resMissingName.json();
    assert(errMissingName.fieldErrors?.name !== undefined, 'fieldErrors.name returned for empty name');

    // Invalid email format
    const resBadEmail = await fetch(`${baseUrl}/api/ai/generate-portfolio`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Valid Name',
        email: 'not-an-email-at-all',
        role: 'student',
      }),
    });
    assert(resBadEmail.status === 400, 'Invalid email triggers HTTP 400 Bad Request');
    const errBadEmail = await resBadEmail.json();
    assert(errBadEmail.fieldErrors?.email !== undefined, 'fieldErrors.email returned for invalid email format');

    // Invalid role injection
    const resBadRole = await fetch(`${baseUrl}/api/ai/generate-portfolio`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test',
        role: 'unsupported_role_injection',
      }),
    });
    assert(resBadRole.status === 400, 'Invalid role triggers HTTP 400 Bad Request');
    const errBadRole = await resBadRole.json();
    assert(errBadRole.fieldErrors?.role !== undefined, 'fieldErrors.role returned for invalid role');
  } catch (e) {
    assert(false, `Validation rejection check failed: ${e.message}`);
  }

  console.log('\n=====================================================');
  console.log(`🎯 SERVER TESTS COMPLETE: ${passedTests} / ${totalTests} PASSED`);
  console.log('=====================================================');

  if (passedTests !== totalTests) {
    process.exit(1);
  }
}

runTests();
