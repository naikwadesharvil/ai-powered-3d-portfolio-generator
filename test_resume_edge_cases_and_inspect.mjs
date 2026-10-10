import fs from 'fs';
import path from 'path';
import assert from 'assert';
import puppeteer from 'puppeteer-core';
import JSZip from 'jszip';
import { STUDENT_PROFILE } from './src/data/defaultProfiles.ts';
import { generateResumeHtml, generateResumePlainText, generateResumeMarkdown } from './src/services/resumeGenerator.ts';
import { generateDocxBlob } from './src/services/docxGenerator.ts';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:\\Users\\sharv\\.gemini\\antigravity-ide\\brain\\374fbe7b-fdcc-47ff-94b8-e189b92df0a6';

// 1. Create Minimal / Short Profile with missing optional fields
const MINIMAL_SHORT_PROFILE = {
  id: 'minimal-user',
  name: 'Aarav Patel',
  role: 'student',
  tagline: 'Aspiring Mechanical Engineer',
  email: 'aarav.patel@eng.edu',
  location: 'Pune, Maharashtra',
  // Missing phone, linkedin, github, bio
  bio: '',
  fullBio: '',
  skills: [
    { name: 'AutoCAD', category: 'CAD/Design', level: 'Intermediate' },
    { name: 'MATLAB', category: 'Computation', level: 'Beginner' },
  ],
  education: [
    {
      institution: 'Pune Institute of Engineering',
      degree: 'B.E. Mechanical Engineering',
      period: '2023 - 2027',
      // Missing score
    },
  ],
  projects: [
    {
      id: 'proj-1',
      title: 'Four-Bar Linkage Simulation',
      description: 'Kinematic simulation of planar four-bar mechanism verifying Grashof condition.',
      tags: ['MATLAB', 'Kinematics'],
      // Missing metrics, highlights, isAIIdea
    },
  ],
  experience: [],
  certifications: [],
  publications: [],
  interests: ['Machine Design'],
  theme: 'cyberpunk_neon',
  canvasMode: 'hero_360',
  sectionVisibility: {
    hero: true,
    welcome: true,
    about: true,
    projects: true,
    experience: false,
    publications: false,
    contact: true,
  },
};

// 2. Create Long / Comprehensive Profile (Multi-Page Stress Test)
const COMPREHENSIVE_LONG_PROFILE = {
  ...STUDENT_PROFILE,
  name: 'Dr. Vikramaditya Joshi',
  tagline: 'Principal Robotics Systems Architect & Senior Automation Specialist',
  phone: '+91 98220 12345',
  email: 'vikram.joshi@robotics-lab.org',
  location: 'Bengaluru, Karnataka, India',
  linkedin: 'linkedin.com/in/dr-vikram-joshi',
  github: 'github.com/vjoshi-robotics',
  fullBio:
    'Distinguished roboticist with 12+ years of experience leading multi-disciplinary teams in autonomous mobile robotics, industrial kinematic calibration, and real-time embedded control. Proven track record in deploying ROS2-based perception pipelines across hazardous industrial manufacturing plants, authoring 8 peer-reviewed publications, and securing 3 international automation patents.',
  skills: [
    { name: 'C++20', category: 'Languages', level: 'Expert' },
    { name: 'Python 3.12', category: 'Languages', level: 'Expert' },
    { name: 'Rust', category: 'Languages', level: 'Intermediate' },
    { name: 'ROS2 Humble', category: 'Robotics', level: 'Expert' },
    { name: 'Gazebo & MoveIt2', category: 'Robotics', level: 'Advanced' },
    { name: 'SLAM (Cartographer)', category: 'Robotics', level: 'Advanced' },
    { name: 'PyTorch', category: 'AI/Perception', level: 'Advanced' },
    { name: 'YOLOv10 & TensorRT', category: 'AI/Perception', level: 'Advanced' },
    { name: 'SolidWorks 2024', category: 'Mechanical CAD', level: 'Expert' },
    { name: 'ANSYS Mechanical FEA', category: 'Simulation', level: 'Advanced' },
    { name: 'MATLAB & Simulink', category: 'Control Systems', level: 'Expert' },
    { name: 'FreeRTOS & STM32', category: 'Embedded Systems', level: 'Advanced' },
    { name: 'CANbus & EtherCAT', category: 'Industrial Comm', level: 'Advanced' },
    { name: 'Docker & Kubernetes', category: 'DevOps', level: 'Intermediate' },
    { name: 'Git & CI/CD', category: 'Tools', level: 'Advanced' },
  ],
  experiences: [
    {
      id: 'exp-long-1',
      role: 'Principal Robotics Architect',
      company: 'Zenith Autonomy Systems Corp',
      period: 'Jan 2023 - Present',
      location: 'Bengaluru, India',
      points: [],
      isVerified: true,
      description:
        'Architected end-to-end autonomous navigation stack for 200+ fleet automated guided vehicles (AGVs) across semiconductor wafer fabrication facilities.',
      highlights: [
        'Reduced positioning localization variance to under 1.2mm using custom sensor fusion with EKF',
        'Led team of 14 robotics, mechanical, and firmware engineers through ISO 3691-4 industrial safety certification',
      ],
    },
    {
      id: 'exp-long-2',
      role: 'Senior Mechatronics Engineer',
      company: 'RoboDynamics India Ltd',
      period: 'Jul 2018 - Dec 2022',
      location: 'Pune, India',
      points: [],
      isVerified: true,
      description:
        'Designed robotic end-effectors with multi-axis force/torque feedback for precision aerospace component deburring.',
      highlights: [
        'Engineered 6-DOF admittance control loop operating at 1 kHz over EtherCAT',
        'Awarded Corporate Engineering Excellence Award 2021 for zero-defect machining prototype',
      ],
    },
    {
      id: 'exp-long-3',
      role: 'Robotics Research Engineer',
      company: 'Centre for Advanced Automation',
      period: 'Aug 2014 - Jun 2018',
      location: 'Hyderabad, India',
      points: [],
      isVerified: true,
      description:
        'Conducted applied research on cable-driven parallel robots for heavy cargo stabilization during offshore crane maneuvers.',
    },
  ],
  education: [
    {
      degree: 'Ph.D. in Robotics & Mechanical Engineering',
      institution: 'Indian Institute of Science (IISc)',
      period: '2014 - 2018',
      score: 'Distinction (CPI: 9.6/10)',
    },
    {
      degree: 'M.Tech in Mechatronics & Automation',
      institution: 'Indian Institute of Technology (IIT) Bombay',
      period: '2012 - 2014',
      score: 'First Class with Distinction (CPI: 9.4/10)',
    },
    {
      degree: 'B.Tech in Mechanical Engineering',
      institution: 'College of Engineering Pune (COEP)',
      period: '2008 - 2012',
      score: 'Gold Medalist (CGPA: 9.8/10)',
    },
  ],
  projects: [
    {
      id: 'proj-long-1',
      title: 'Autonomous Mobile Inspection Robot (AMIR-4)',
      description:
        'Four-wheeled skid-steer field robot equipped with 3D LiDAR, thermal imaging, and methane sensors for oil refinery hazard inspection.',
      tags: ['ROS2', 'C++', 'SolidWorks', 'LiDAR', 'SLAM'],
      metrics: '500+ hours autonomous mission validation across explosive-zone refinery areas',
    },
    {
      id: 'proj-long-2',
      title: 'High-Precision 6-DOF Delta Robot Manipulator',
      description:
        'Parallel kinematic delta robot engineered for 120 picks-per-minute pharmaceutical pill blistering line.',
      tags: ['Kinematics', 'MATLAB', 'STM32', 'FEA'],
      metrics: 'Achieved +/- 0.05mm repeatability at 10G peak acceleration',
    },
    {
      id: 'proj-long-3',
      title: 'Haptic Teleoperation Master-Slave Arm for Minimally Invasive Surgery',
      description:
        'Bilateral telemanipulator with impedance reflection providing surgeon realistic tactile palpation sensations during soft-tissue incision.',
      tags: ['Haptics', 'Control Theory', 'Force Sensing'],
      metrics: 'Sub-millisecond loop latency over dedicated deterministic Ethernet',
    },
    {
      id: 'proj-long-4',
      title: 'Subsea Inspection Autonomous Underwater Vehicle (AUV)',
      description:
        'Deep-water torpedo-class AUV hull optimized via CFD for pipeline cathodic protection surveying.',
      tags: ['CFD', 'Navier-Stokes', 'SolidWorks Flow', 'Acoustic Comms'],
      metrics: 'Tested to 300m hydrostatic pressure rating with zero hull deformation',
    },
  ],
  certifications: [
    { name: 'Certified Functional Safety Engineer (TÜV Rheinland)', issuer: 'TÜV Rheinland', period: '2022' },
    { name: 'Project Management Professional (PMP)', issuer: 'PMI', period: '2020' },
    { name: 'SolidWorks Expert Mechanical Design (CSWE)', issuer: 'Dassault Systèmes', period: '2019' },
  ],
  publications: [
    {
      title: 'Admittance Control Strategy for Contact Stability in High-Speed Robot Machining',
      publisher: 'IEEE Transactions on Robotics (T-RO), Vol. 39, Issue 4, pp. 2841-2856 (2023)',
    },
    {
      title: 'Kinematic Calibration of Non-Orthogonal Serial Manipulators using Laser Tracker Measurements',
      publisher: 'Mechanism and Machine Theory, Elsevier, Vol. 162, pp. 104-121 (2021)',
    },
  ],
};

async function testPdfGenerationViaBackend(profile, filename) {
  const html = generateResumeHtml(profile, { template: 'modern', fontSize: 'standard' });
  const res = await fetch('http://localhost:5000/api/resume/pdf', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      portfolio: profile,
      html,
      filename,
    }),
  });

  assert.strictEqual(res.status, 200, `Backend PDF export should return 200 for ${filename}`);
  const buffer = Buffer.from(await res.arrayBuffer());
  assert(buffer.length > 50000, `PDF size should be substantial (>50KB, actual: ${buffer.length})`);
  assert.strictEqual(buffer.slice(0, 4).toString(), '%PDF', 'Output must be a genuine binary PDF');

  const filePath = path.join(ARTIFACT_DIR, filename);
  fs.writeFileSync(filePath, buffer);
  console.log(`✅ [PASS] Exported genuine PDF: ${filename} (${buffer.length} bytes)`);
  return { buffer, filePath };
}

async function runEdgeCasesAndDeepInspection() {
  console.log('=====================================================');
  console.log('🔬 DEEP INSPECTION & EDGE-CASE RESUME VERIFICATION');
  console.log('=====================================================');

  // Test 1: Minimal Short Profile Export (Missing Optional Fields)
  console.log('\n--- Test 1: Minimal Short Profile (No Phone, No Social, Empty Bio) ---');
  const shortResult = await testPdfGenerationViaBackend(MINIMAL_SHORT_PROFILE, 'Minimal_Short_Resume.pdf');

  // Test 2: Long Comprehensive Profile Export (Multi-Page Stress Test)
  console.log('\n--- Test 2: Multi-Page Comprehensive Profile (Multi-Page Stress Test) ---');
  const longResult = await testPdfGenerationViaBackend(COMPREHENSIVE_LONG_PROFILE, 'Comprehensive_Long_Resume.pdf');

  // Test 3: Inspect Minimal Profile Layout in Headless Chrome
  console.log('\n--- Test 3: Verifying Minimal Profile Layout & Contact Formatting ---');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-gpu'],
  });

  const page = await browser.newPage();
  const minimalHtml = generateResumeHtml(MINIMAL_SHORT_PROFILE, { template: 'modern' });
  await page.setContent(minimalHtml, { waitUntil: 'load' });

  const minimalText = await page.evaluate(() => document.body.innerText);
  assert(minimalText.includes('AARAV PATEL'), 'Short resume contains candidate name');
  assert(minimalText.includes('aarav.patel@eng.edu'), 'Short resume contains email');
  assert(minimalText.includes('Pune, Maharashtra'), 'Short resume contains location');
  // Confirm that missing fields do NOT produce undefined, null, or trailing separators
  assert(!minimalText.includes('undefined'), 'No undefined text in minimal resume');
  assert(!minimalText.includes('null'), 'No null text in minimal resume');
  assert(!minimalText.includes('N/A'), 'No N/A placeholders in minimal resume');

  // Capture screenshot of minimal resume
  await page.setViewport({ width: 850, height: 1100, deviceScaleFactor: 2 });
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'screenshot_minimal_resume.png'),
    fullPage: true,
  });
  console.log('✅ [PASS] Verified minimal resume text and captured screenshot_minimal_resume.png');

  // Test 4: Inspect Comprehensive Long Profile Layout & Page Break Integrity
  console.log('\n--- Test 4: Verifying Long Profile Layout, Multi-Page Pagination & Headings ---');
  const longHtml = generateResumeHtml(COMPREHENSIVE_LONG_PROFILE, { template: 'engineering' });
  await page.setContent(longHtml, { waitUntil: 'load' });

  const longText = await page.evaluate(() => document.body.innerText);
  assert(longText.includes('DR. VIKRAMADITYA JOSHI'), 'Long resume contains name');
  assert(longText.includes('Principal Robotics Architect'), 'Long resume contains experience');
  assert(longText.includes('Autonomous Mobile Inspection Robot (AMIR-4)'), 'Long resume contains projects');
  assert(longText.includes('IEEE Transactions on Robotics'), 'Long resume contains publications');
  assert(longText.includes('Certified Functional Safety Engineer'), 'Long resume contains certifications');

  // Check that sections have break-inside: avoid styling
  const hasPageBreakRules = await page.evaluate(() => {
    const items = document.querySelectorAll('.resume-item, .project-card, .education-item');
    for (const item of items) {
      const style = window.getComputedStyle(item);
      if (style.breakInside !== 'avoid' && style.pageBreakInside !== 'avoid') {
        return false;
      }
    }
    return true;
  });
  assert(hasPageBreakRules, 'Resume items must enforce break-inside: avoid for clean pagination');
  console.log('✅ [PASS] Verified page-break safety rules on all resume item containers');

  // Capture screenshot of long resume
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'screenshot_long_resume.png'),
    fullPage: true,
  });
  console.log('✅ [PASS] Captured screenshot_long_resume.png');

  await browser.close();

  // Test 5: DOCX Generation & OpenXML Structure for Short & Long Profiles
  console.log('\n--- Test 5: Verifying DOCX OpenXML Integrity for Short & Long Profiles ---');
  for (const [prof, name] of [
    [MINIMAL_SHORT_PROFILE, 'Minimal_Short_Resume.docx'],
    [COMPREHENSIVE_LONG_PROFILE, 'Comprehensive_Long_Resume.docx'],
  ]) {
    const docxBlob = await generateDocxBlob(prof);
    const docxBuffer = Buffer.from(await docxBlob.arrayBuffer());
    assert(docxBuffer.length > 5000, `DOCX buffer should be valid size for ${name}`);

    const zip = await JSZip.loadAsync(docxBuffer);
    assert(zip.file('[Content_Types].xml'), 'Valid OpenXML Content Types');
    assert(zip.file('word/document.xml'), 'Valid OpenXML Document XML');
    assert(zip.file('word/styles.xml'), 'Valid OpenXML Styles XML');

    const documentXml = await zip.file('word/document.xml').async('string');
    assert(documentXml.includes(prof.name), `DOCX document.xml contains candidate name ${prof.name}`);
    assert(!documentXml.includes('undefined'), `DOCX document.xml has no undefined strings`);
    assert(!documentXml.includes('null'), `DOCX document.xml has no null strings`);

    fs.writeFileSync(path.join(ARTIFACT_DIR, name), docxBuffer);
    console.log(`✅ [PASS] Verified valid OpenXML DOCX: ${name} (${docxBuffer.length} bytes)`);
  }

  console.log('\n=====================================================');
  console.log('🎉 ALL EDGE-CASE & DEEP RESUME TESTS PASSED (5/5)');
  console.log('=====================================================');
}

runEdgeCasesAndDeepInspection().catch((err) => {
  console.error('Deep Inspection Test Failed:', err);
  process.exit(1);
});
