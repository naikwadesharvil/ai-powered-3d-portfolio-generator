import { AiEngine } from './src/services/aiEngine.ts';
import { STUDENT_PROFILE } from './src/data/defaultProfiles.ts';
import http from 'http';

console.log('=====================================================');
console.log('🤖 RUNNING MASTER VERIFICATION TEST SUITE');
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

// 1. Student Generation
const studentPortfolio = AiEngine.generatePortfolioFromAutopilot({
  name: 'Sharvil Naikwade',
  interests: 'Artificial Intelligence, Computer Vision, Machine Learning',
  role: 'student',
});
assert(studentPortfolio.role === 'student', 'Student portfolio role matches');
assert(studentPortfolio.name === 'Sharvil Naikwade', 'Student portfolio name matches');
assert(studentPortfolio.sectionVisibility.education === true, 'Student portfolio shows Education');
assert(studentPortfolio.sectionVisibility.services === false, 'Student portfolio hides Freelancer Services');
assert(studentPortfolio.sectionOrder.includes('projects'), 'Student portfolio order includes projects');
assert(studentPortfolio.projects.some(p => p.isAiIdea === true), 'Student portfolio contains flagged AI project idea');

// 2. Job Seeker Generation
const seekerPortfolio = AiEngine.generatePortfolioFromAutopilot({
  name: 'Jordan Hayes',
  interests: 'Full Stack Development, Python, Cloud Systems',
  role: 'job_seeker',
});
assert(seekerPortfolio.role === 'job_seeker', 'Job Seeker portfolio role matches');
assert(seekerPortfolio.sectionVisibility.experience === true, 'Job Seeker shows Experience');
assert(seekerPortfolio.targetRole.includes('Full Stack') || seekerPortfolio.targetRole.includes('Software Engineer'), 'Job Seeker target role prioritized');

// 3. Working Professional Generation
const proPortfolio = AiEngine.generatePortfolioFromAutopilot({
  name: 'Marcus Vance',
  interests: 'Distributed Systems, High Throughput Architecture',
  role: 'professional',
});
assert(proPortfolio.role === 'professional', 'Professional role matches');
assert(proPortfolio.hero3DMode === 'hologram_core', 'Professional defaults to hologram_core 3D mode');
assert(proPortfolio.theme === 'obsidian_stealth', 'Professional defaults to obsidian_stealth theme');

// 4. Freelancer Generation
const freelancerPortfolio = AiEngine.generatePortfolioFromAutopilot({
  name: 'Elena Rostova',
  interests: 'Creative Development, Three.js, WebGL',
  role: 'freelancer',
});
assert(freelancerPortfolio.role === 'freelancer', 'Freelancer role matches');
assert(freelancerPortfolio.sectionVisibility.services === true, 'Freelancer enables Services');
assert(freelancerPortfolio.sectionVisibility.testimonials === true, 'Freelancer enables Testimonials');
assert(freelancerPortfolio.sectionOrder.includes('services'), 'Freelancer section order includes services');

// 5. Empty Input Handling & Graceful Fallback
const emptyInputPortfolio = AiEngine.generatePortfolioFromAutopilot({
  name: '',
  interests: '',
  role: 'student',
  currentProfile: STUDENT_PROFILE,
});
assert(Boolean(emptyInputPortfolio.name), 'Empty name falls back gracefully to default');
assert(emptyInputPortfolio.skills.length > 0, 'Empty interests fall back gracefully to default skills');

// 6. Conversational Instruction Engine
const chatResult = AiEngine.applyConversationalInstruction(
  studentPortfolio,
  'Switch theme to sunset titanium and prioritize AI projects'
);
assert(chatResult.updatedProfile.theme === 'sunset_titanium', 'Conversational command switched theme');
assert(chatResult.explanation.length > 0, 'Conversational assistant generated explanation');

// 7. ATS Resume Fact Auditor (Anti-Hallucination)
const sampleResume = `
Sharvil Naikwade
Email: sharvil@example.com | Phone: +91 9876543210
Education: B.Tech in Computer Science, Rajarambapu Institute of Technology
Skills: Python, PyTorch, React, Docker, Machine Learning
Experience: Machine Learning Intern at Google EduSkills
`;
const auditResult = AiEngine.auditResumeText(sampleResume);
assert(auditResult.sectionStatus.contact === 'COMPLETE', 'Resume auditor extracted complete contact info');
assert(auditResult.sectionStatus.education === 'COMPLETE', 'Resume auditor extracted complete education info');
assert(auditResult.supportedKeywords.length > 0, 'Resume auditor extracted ATS keywords');

// 8. Multi-Discipline Engineering Branch Verification
// 8a. Mechanical Engineering
const mechPortfolio = AiEngine.generatePortfolioFromAutopilot({
  name: 'Rohit Sharma',
  branch: 'mechanical',
  role: 'student',
  interests: 'CAD, SolidWorks, Thermal Engineering, FEA',
});
assert(mechPortfolio.branch === 'mechanical', 'Mechanical branch set correctly');
assert(mechPortfolio.skills.some(s => s.name.toLowerCase().includes('solidworks') || s.name.toLowerCase().includes('cad')), 'Mechanical skills include SolidWorks / CAD');
assert(mechPortfolio.projects.some(p => p.tags.some(t => t.toLowerCase().includes('solidworks') || t.toLowerCase().includes('cad') || t.toLowerCase().includes('fea'))), 'Mechanical projects include CAD / FEA');
assert(mechPortfolio.projects.some(p => p.isAiIdea === true), 'Mechanical includes flagged AI project suggestions');
assert(mechPortfolio.careerRecommendations && mechPortfolio.careerRecommendations.length > 0, 'Mechanical includes career recommendations');

// 8b. Mechatronics & Robotics
const mechRobPortfolio = AiEngine.generatePortfolioFromAutopilot({
  name: 'Priya Patel',
  branch: 'mechatronics',
  role: 'job_seeker',
  interests: 'Robotics, ROS, PLC, Embedded Systems',
});
assert(mechRobPortfolio.branch === 'mechatronics', 'Mechatronics branch set correctly');
assert(mechRobPortfolio.skills.some(s => s.name.toLowerCase().includes('ros') || s.name.toLowerCase().includes('plc') || s.name.toLowerCase().includes('embedded')), 'Mechatronics skills include ROS / PLC / Embedded');
assert(mechRobPortfolio.projects.some(p => p.tags.some(t => t.toLowerCase().includes('ros') || t.toLowerCase().includes('robot'))), 'Mechatronics includes robotics projects');

// 8c. Civil Engineering
const civilPortfolio = AiEngine.generatePortfolioFromAutopilot({
  name: 'Arjun Mehta',
  branch: 'civil',
  role: 'professional',
  interests: 'Structural Design, ETABS, Revit BIM',
});
assert(civilPortfolio.branch === 'civil', 'Civil branch set correctly');
assert(civilPortfolio.skills.some(s => s.name.toLowerCase().includes('etabs') || s.name.toLowerCase().includes('revit') || s.name.toLowerCase().includes('civil')), 'Civil skills include structural / BIM software');
assert(civilPortfolio.bentoStats.stat1.title.includes('STRUCTURAL') || civilPortfolio.bentoStats.stat1.value.includes('ETABS'), 'Civil Bento stats tailored to structural analysis');

// 8d. Electrical & Electronics
const eePortfolio = AiEngine.generatePortfolioFromAutopilot({
  name: 'Neha Gupta',
  branch: 'electrical_ece',
  role: 'student',
  interests: 'Power Systems, PCB Design, MATLAB',
});
assert(eePortfolio.branch === 'electrical_ece', 'Electrical/ECE branch set correctly');
assert(eePortfolio.skills.some(s => s.name.toLowerCase().includes('pcb') || s.name.toLowerCase().includes('matlab') || s.name.toLowerCase().includes('circuit')), 'Electrical skills include PCB / MATLAB / Circuits');

// 8e. Custom Branch Input
const customPortfolio = AiEngine.generatePortfolioFromAutopilot({
  name: 'Sarah Lin',
  branch: 'custom',
  customBranchName: 'Industrial Product Design',
  role: 'freelancer',
  interests: 'Ergonomic Design, 3D Rendering',
});
assert(customPortfolio.branch === 'custom', 'Custom branch type set');
assert(customPortfolio.branchName === 'Industrial Product Design', 'Custom branch name preserved');
assert(customPortfolio.tagline.includes('Industrial Product Design'), 'Custom branch name integrated into tagline');

// 8f. Preservation of User-Entered Verified Work (Anti-Hallucination)
const userVerifiedProject = {
  id: 'user-p1',
  title: 'Smart Agricultural Irrigation Valve',
  description: 'Fabricated an automatic solar-powered soil moisture valve.',
  tags: ['Agriculture', 'Solar', 'Valve'],
  role: 'Project Lead',
  metrics: '35% Water Savings',
};
const userCustomPortfolio = AiEngine.generatePortfolioFromAutopilot({
  name: 'Karan Singh',
  branch: 'mechanical',
  role: 'student',
  interests: 'Thermal, CAD',
  projects: [userVerifiedProject],
});
const foundUserProject = userCustomPortfolio.projects.find(p => p.id === 'user-p1');
assert(foundUserProject !== undefined, 'User-provided project is preserved');
assert(foundUserProject.isAiIdea === false, 'User-provided project is strictly marked verified (not AI idea)');

// 9. Test Vite Dev Server Running on 5173
const req = http.get('http://localhost:5173/', (res) => {
  assert(res.statusCode === 200, 'Vite dev server returns HTTP 200 OK');
  console.log('-----------------------------------------------------');
  console.log(`🎯 TOTAL TESTS: ${totalTests} | PASSED: ${passedTests} | FAILED: ${totalTests - passedTests}`);
  console.log('=====================================================');
  process.exit(totalTests === passedTests ? 0 : 1);
});
req.on('error', (err) => {
  console.error('Failed to connect to dev server:', err.message);
  process.exit(1);
});
