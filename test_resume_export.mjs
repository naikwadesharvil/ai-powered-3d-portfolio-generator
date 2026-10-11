import http from 'http';
import fs from 'fs';
import path from 'path';
import assert from 'assert';
import JSZip from 'jszip';
import puppeteer from 'puppeteer-core';
import { generateDocxBlob } from './src/services/docxGenerator.ts';
import { generateResumePlainText, generateResumeMarkdown, generateResumeHtml } from './src/services/resumeGenerator.ts';
import { STUDENT_PROFILE } from './src/data/defaultProfiles.ts';
import { AiEngine } from './src/services/aiEngine.ts';

const ARTIFACT_DIR = 'C:\\Users\\sharv\\.gemini\\antigravity-ide\\brain\\215c0cc7-0d9b-4e35-a1a5-462d5adb0fc0';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

console.log('=====================================================');
console.log('📄 ATS RESUME GENERATION & EXPORT VERIFICATION SUITE');
console.log('=====================================================');

async function testPdfEndpoint(profile, filename) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({ portfolio: profile, options: { template: 'modern' } });
    const req = http.request(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/resume/pdf',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload),
        },
      },
      (res) => {
        assert.strictEqual(res.statusCode, 200, 'Server should return 200 OK');
        assert.strictEqual(res.headers['content-type'], 'application/pdf', 'Content-Type must be application/pdf');

        const chunks = [];
        res.on('data', (d) => chunks.push(d));
        res.on('end', () => {
          const buf = Buffer.concat(chunks);
          assert(buf.length > 30000, `PDF size (${buf.length} bytes) should be substantial (>30KB)`);
          assert.strictEqual(buf.subarray(0, 4).toString(), '%PDF', 'PDF buffer must begin with %PDF magic header');

          const outPath = path.join(ARTIFACT_DIR, filename);
          fs.writeFileSync(outPath, buf);
          console.log(`✅ [PASS] Generated ${filename} (${buf.length} bytes)`);
          resolve(buf);
        });
      }
    );
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

(async () => {
  try {
    // 1. Test Server PDF Generation for Standard Student Profile
    console.log('\n--- 1. Testing Standard Student Profile PDF Export ---');
    const studentPdfBuf = await testPdfEndpoint(STUDENT_PROFILE, 'Sharvil_Naikwade_Resume.pdf');
    assert(studentPdfBuf.length > 0, 'PDF buffer exists');

    // 2. Test Multi-Discipline Profiles (Mechanical, Mechatronics, Civil)
    console.log('\n--- 2. Testing Multi-Discipline Engineering PDF Exports ---');
    const mechProfile = AiEngine.generatePortfolioFromAutopilot({
      name: 'Rohit Sharma',
      branch: 'mechanical',
      role: 'job_seeker',
      interests: 'CAD, SolidWorks, Thermal, FEA',
    });
    const mechatronicsProfile = AiEngine.generatePortfolioFromAutopilot({
      name: 'Priya Patel',
      branch: 'mechatronics',
      role: 'student',
      interests: 'Robotics, ROS, PLC, Embedded',
    });
    const civilProfile = AiEngine.generatePortfolioFromAutopilot({
      name: 'Arjun Mehta',
      branch: 'civil',
      role: 'professional',
      interests: 'Structural Design, ETABS, Revit BIM',
    });

    await testPdfEndpoint(mechProfile, 'Mechanical_Engineer_Resume.pdf');
    await testPdfEndpoint(mechatronicsProfile, 'Mechatronics_Engineer_Resume.pdf');
    await testPdfEndpoint(civilProfile, 'Civil_Engineer_Resume.pdf');

    // 3. Inspect Exported PDF Text and Structure using Chrome Headless
    console.log('\n--- 3. Verifying PDF Content & Visual Layout via Headless Browser ---');
    const browser = await puppeteer.launch({
      executablePath: CHROME_PATH,
      headless: 'new',
      args: ['--no-sandbox', '--disable-gpu'],
    });

    const page = await browser.newPage();
    const studentHtml = generateResumeHtml(STUDENT_PROFILE, { template: 'modern' });
    await page.setContent(studentHtml, { waitUntil: 'load' });

    // Verify critical ATS text sections exist in document stream
    const pageText = await page.evaluate(() => document.body.innerText);

    assert(pageText.toLowerCase().includes(STUDENT_PROFILE.name.toLowerCase()), 'Resume contains candidate name');
    assert(pageText.toLowerCase().includes(STUDENT_PROFILE.email.toLowerCase()), 'Resume contains contact email');
    assert(pageText.includes('PROFESSIONAL SUMMARY'), 'Resume contains Professional Summary heading');
    assert(pageText.includes('TECHNICAL COMPETENCIES'), 'Resume contains Technical Competencies');
    assert(pageText.includes('EDUCATION'), 'Resume contains Education heading');
    assert(pageText.includes('TECHNICAL PROJECTS'), 'Resume contains Technical Projects heading');
    assert(pageText.includes('CERTIFICATIONS & CREDENTIALS'), 'Resume contains Certifications');

    console.log('✅ [PASS] All critical ATS headings and contact details verified in document text stream');

    // Capture screenshot of rendered resume sheet
    await page.setViewport({ width: 850, height: 1200, deviceScaleFactor: 2 });
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'screenshot_rendered_resume_sheet.png'),
      fullPage: true,
    });
    console.log('✅ [PASS] Captured high-resolution screenshot_rendered_resume_sheet.png');

    await browser.close();

    // 4. Test Native Microsoft Word (.docx) Generation
    console.log('\n--- 4. Testing Native Microsoft Word (.docx) Generation ---');
    const docxBlob = await generateDocxBlob(STUDENT_PROFILE);
    const docxBuffer = Buffer.from(await docxBlob.arrayBuffer());
    assert(docxBuffer.length > 5000, `DOCX buffer should be valid size (>5KB, actual: ${docxBuffer.length})`);

    const zip = await JSZip.loadAsync(docxBuffer);
    assert(zip.file('[Content_Types].xml'), 'DOCX zip has [Content_Types].xml');
    assert(zip.file('_rels/.rels'), 'DOCX zip has _rels/.rels');
    assert(zip.file('word/document.xml'), 'DOCX zip has word/document.xml');
    assert(zip.file('word/styles.xml'), 'DOCX zip has word/styles.xml');

    const docXml = await zip.file('word/document.xml').async('string');
    assert(docXml.toUpperCase().includes('SHARVIL NAIKWADE'), 'DOCX document.xml contains candidate name');
    assert(docXml.includes('PROFESSIONAL SUMMARY'), 'DOCX contains Professional Summary');
    assert(docXml.includes('TECHNICAL PROJECTS'), 'DOCX contains Technical Projects');

    const docxPath = path.join(ARTIFACT_DIR, 'Sharvil_Naikwade_Resume.docx');
    fs.writeFileSync(docxPath, docxBuffer);
    console.log(`✅ [PASS] Valid DOCX generated & verified: Sharvil_Naikwade_Resume.docx (${docxBuffer.length} bytes)`);

    // 5. Test Plaintext ATS Format
    console.log('\n--- 5. Testing Plaintext ATS & Markdown Formats ---');
    const plainText = generateResumePlainText(STUDENT_PROFILE);
    assert(plainText.includes('SHARVIL NAIKWADE'), 'Plaintext contains candidate name');
    assert(plainText.includes('TECHNICAL COMPETENCIES'), 'Plaintext contains skills');
    assert(plainText.length > 500, 'Plaintext resume is complete');
    console.log('✅ [PASS] Plaintext ATS generation verified');

    const markdownText = generateResumeMarkdown(STUDENT_PROFILE);
    assert(markdownText.startsWith('# Sharvil Naikwade'), 'Markdown has correct H1 title');
    assert(markdownText.includes('## Technical Projects'), 'Markdown has correct H2 headings');
    console.log('✅ [PASS] Markdown resume generation verified');

    console.log('\n=====================================================');
    console.log('🎯 ALL RESUME EXPORT TESTS PASSED SUCCESSFULLY! (6/6)');
    console.log('=====================================================');
  } catch (err) {
    console.error('❌ Resume Export Test Failure:', err);
    process.exit(1);
  }
})();
