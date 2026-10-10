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
    console.log(`ℹ️ Generation mode: ${data.liveAi ? 'Live OpenAI' : 'Offline Fallback'} (${data.model})`);
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
    assert(data.portfolio.sectionVisibility.services === true, 'Freelancer enables services');
  } catch (e) {
    assert(false, `Freelancer generation failed: ${e.message}`);
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
    const res = await fetch(`${baseUrl}/api/ai/generate-portfolio`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test',
        role: 'unsupported_role_injection', // Invalid role
      }),
    });
    assert(res.status === 400, 'Invalid role triggers HTTP 400 Bad Request');
    const data = await res.json();
    assert(data.error !== undefined, 'Error message properly formatted');
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
