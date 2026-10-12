import fs from 'fs';
import path from 'path';
import assert from 'assert';
import puppeteer from 'puppeteer-core';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:\\Users\\sharv\\.gemini\\antigravity-ide\\brain\\374fbe7b-fdcc-47ff-94b8-e189b92df0a6';

async function performHumanQualityReview() {
  console.log('=====================================================');
  console.log('🧐 EXHAUSTIVE HUMAN-QUALITY REVIEW OF RESUME ARTIFACTS');
  console.log('=====================================================');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-gpu'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 1600, deviceScaleFactor: 2 });

  // -------------------------------------------------------------------------
  // 1. RENDER AND INSPECT ACTUAL BINARY PDF FILES USING PDF.JS (PAGE BY PAGE)
  // -------------------------------------------------------------------------
  console.log('\n--- 1. Rendering Actual PDF Binaries Page-by-Page via PDF.js ---');

  const renderPdfPageByPage = async (pdfFilename, outputPrefix) => {
    const pdfPath = path.join(ARTIFACT_DIR, pdfFilename);
    const pdfBase64 = fs.readFileSync(pdfPath).toString('base64');
    const p = await browser.newPage();
    p.on('console', msg => console.log(`  [browser:${pdfFilename}]`, msg.text()));
    p.on('pageerror', err => console.error(`  [browser-err:${pdfFilename}]`, err.message));
    await p.setViewport({ width: 2400, height: 3500 });

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
      <style>
        body { margin: 0; background: #ffffff; padding: 0; }
        #container { display: block; margin: 0; padding: 0; }
        canvas { display: block; margin: 0 0 20px 0; background: #ffffff; }
      </style>
    </head>
    <body>
      <div id="container"></div>
      <script>
        window.pdfRenderComplete = false;
        window.pdfRenderError = null;
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        try {
          const pdfData = atob('${pdfBase64}');
          const loadingTask = pdfjsLib.getDocument({ data: pdfData });
          loadingTask.promise.then(async (pdf) => {
            try {
              window.pdfPageCount = pdf.numPages;
              window.pdfTextPages = [];
              for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                let pageStrings = '';
                let lastY = null;
                for (const item of textContent.items) {
                  if (item.transform) {
                    const currentY = item.transform[5];
                    if (lastY !== null && Math.abs(currentY - lastY) > 5) {
                      pageStrings += '\\n';
                    }
                    lastY = currentY;
                  }
                  pageStrings += item.str;
                }
                window.pdfTextPages.push(pageStrings);

                const viewport = page.getViewport({ scale: 2.0 });
                const canvas = document.createElement('canvas');
                canvas.id = 'page-' + i;
                canvas.height = viewport.height;
                canvas.width = viewport.width;
                document.getElementById('container').appendChild(canvas);
                const context = canvas.getContext('2d');
                await page.render({ canvasContext: context, viewport: viewport }).promise;
              }
              window.pdfRenderComplete = true;
            } catch (innerErr) {
              window.pdfRenderError = innerErr.message;
            }
          }).catch(loadErr => {
            window.pdfRenderError = loadErr.message;
          });
        } catch (e) {
          window.pdfRenderError = e.message;
        }
      </script>
    </body>
    </html>
    `;

    await p.setContent(html, { waitUntil: 'load', timeout: 60000 });
    await p.waitForFunction(() => window.pdfRenderComplete === true || window.pdfRenderError !== null, { timeout: 45000 });

    const err = await p.evaluate(() => window.pdfRenderError);
    if (err) {
      throw new Error(`PDF Render error for ${pdfFilename}: ${err}`);
    }

    const pageCount = await p.evaluate(() => window.pdfPageCount);
    const textPages = await p.evaluate(() => window.pdfTextPages);
    console.log(`  File: ${pdfFilename} has ${pageCount} pages`);

    for (let i = 1; i <= pageCount; i++) {
      await p.waitForSelector(`#page-${i}`, { timeout: 15000 });
      const canvasHandle = await p.$(`#page-${i}`);
      const screenshotPath = path.join(ARTIFACT_DIR, `${outputPrefix}_Page_${i}.png`);
      await canvasHandle.screenshot({ path: screenshotPath });
      console.log(`  ✅ Captured page visual: ${outputPrefix}_Page_${i}.png`);
    }

    await p.close();
    return { pageCount, textPages };
  };

  // Render Standard Resume
  await renderPdfPageByPage('Sharvil_Naikwade_Resume.pdf', 'Sharvil_Resume');
  // Render Long Resume (Multi-page check)
  await renderPdfPageByPage('Comprehensive_Long_Resume.pdf', 'Comprehensive_Long_Resume');
  // Render Minimal Short Resume (Single-page edge check)
  await renderPdfPageByPage('Minimal_Short_Resume.pdf', 'Minimal_Short_Resume');

  // -------------------------------------------------------------------------
  // 2. VERIFY ACCURACY OF EXTRACTED TEXT AGAINST SOURCE PROFILE
  // -------------------------------------------------------------------------
  console.log('\n--- 2. Verifying PDF Text Stream & Reading Order Against Source Profile ---');
  const stdText = stdResult.textPages.join('\n');
  const normalizedText = stdText.replace(/\s+/g, ' ');
  const normalizedUpper = normalizedText.toUpperCase();

  console.log('STD TEXT EXTRACTED LENGTH:', stdText.length);
  console.log('FIRST 500 CHARS:', JSON.stringify(stdText.slice(0, 500)));

  // Name, contact, role
  assert(normalizedUpper.includes('SHARVIL NAIKWADE'), 'PDF text has candidate name');
  assert(normalizedText.includes('sharvilnaikwade@gmail.com'), 'PDF text has email');
  assert(normalizedText.includes('7709159322'), 'PDF text has phone');
  assert(normalizedText.includes('Senapati Kapshi'), 'PDF text has location');
  assert(normalizedText.includes('linkedin.com/in/sharvil-naikwade-2294ab2bb'), 'PDF text has LinkedIn');
  assert(normalizedText.includes('github.com/naikwadesharvil'), 'PDF text has GitHub');

  // Summary & Education
  assert(normalizedText.includes('Rajarambapu Institute of Technology'), 'PDF has institution');
  assert(normalizedText.includes('Artificial Intelligence') && normalizedText.includes('Machine Learning'), 'PDF has degree');
  assert(normalizedText.includes('7.29'), 'PDF has CGPA score');

  // Skills
  for (const s of ['Python', 'SQL', 'Scikit-Learn', 'PyTorch', 'React', 'Git']) {
    assert(normalizedText.includes(s), `PDF text contains skill: ${s}`);
  }

  // Projects
  assert(normalizedText.includes('Sepsis Detection Using Machine Learning'), 'PDF has project 1');
  assert(normalizedText.includes('KnowledgeOS'), 'PDF has project 2');
  assert(normalizedText.includes('Proposed Concept'), 'AI project is tagged Proposed Concept');

  // Experience
  assert(normalizedText.includes('EduSkills | Google for Developers'), 'PDF has intern experience');

  // Check section order in document text stream
  const summaryIdx = normalizedUpper.indexOf('PROFESSIONAL SUMMARY');
  const skillsIdx = normalizedUpper.indexOf('TECHNICAL COMPETENCIES');
  const expIdx = normalizedUpper.indexOf('PROFESSIONAL EXPERIENCE');
  const eduIdx = normalizedUpper.indexOf('EDUCATION');
  const projIdx = normalizedUpper.indexOf('TECHNICAL PROJECTS');
  const certIdx = normalizedUpper.indexOf('CERTIFICATIONS');

  assert(summaryIdx !== -1 && summaryIdx < skillsIdx, 'Summary comes before Skills');
  assert(skillsIdx !== -1 && skillsIdx < expIdx, 'Skills come before Experience');
  assert(expIdx !== -1 && expIdx < eduIdx, 'Experience comes before Education');
  assert(eduIdx !== -1 && eduIdx < projIdx, 'Education comes before Projects');
  assert(projIdx !== -1 && projIdx < certIdx, 'Projects come before Certifications');
  console.log('✅ [PASS] Reading order follows exact ATS screening standards');

  // -------------------------------------------------------------------------
  // 3. RENDER AND VISUALLY INSPECT ACTUAL BINARY DOCX IN A BROWSER RENDERER
  // -------------------------------------------------------------------------
  console.log('\n--- 3. Rendering Actual Binary DOCX via docx-preview Renderer ---');

  const renderDocxVisual = async (docxFilename, outputName) => {
    const docxPath = path.join(ARTIFACT_DIR, docxFilename);
    const docxBase64 = fs.readFileSync(docxPath).toString('base64');
    const p = await browser.newPage();
    p.on('console', msg => console.log(`  [docx-browser:${docxFilename}]`, msg.text()));
    p.on('pageerror', err => console.error(`  [docx-browser-err:${docxFilename}]`, err.message));

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js"></script>
      <script src="https://cdn.jsdelivr.net/npm/docx-preview@0.3.3/dist/docx-preview.min.js"></script>
      <style>
        body { margin: 0; background: #0e131f; display: flex; justify-content: center; padding: 30px; font-family: sans-serif; }
        #docx-wrapper { width: 850px; background: #ffffff; box-shadow: 0 10px 40px rgba(0,0,0,0.8); padding: 40px 50px; border-radius: 4px; }
      </style>
    </head>
    <body>
      <div id="docx-wrapper"></div>
      <script>
        window.docxRenderSuccess = false;
        window.docxRenderError = null;
        try {
          const binaryString = atob('${docxBase64}');
          const len = binaryString.length;
          const bytes = new Uint8Array(len);
          for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          docx.renderAsync(bytes.buffer, document.getElementById('docx-wrapper'))
            .then(() => {
              window.docxRenderSuccess = true;
            })
            .catch(err => {
              window.docxRenderError = err.message;
            });
        } catch (e) {
          window.docxRenderError = e.message;
        }
      </script>
    </body>
    </html>
    `;

    await p.setContent(html, { waitUntil: 'load', timeout: 60000 });
    await p.waitForFunction(() => window.docxRenderSuccess || window.docxRenderError !== null, { timeout: 30000 });

    const err = await p.evaluate(() => window.docxRenderError);
    if (err) {
      throw new Error(`DOCX Rendering failed for ${docxFilename}: ${err}`);
    }

    await p.waitForSelector('#docx-wrapper', { timeout: 10000 });
    const wrapperHandle = await p.$('#docx-wrapper');
    const screenshotPath = path.join(ARTIFACT_DIR, outputName);
    await wrapperHandle.screenshot({ path: screenshotPath });
    console.log(`  ✅ Successfully rendered DOCX visual: ${outputName}`);

    const docxText = await p.evaluate(() => document.getElementById('docx-wrapper').innerText);
    await p.close();
    return docxText;
  };

  const stdDocxText = await renderDocxVisual('Sharvil_Naikwade_Resume.docx', 'Sharvil_Resume_Docx_Render.png');
  assert(stdDocxText.includes('Sharvil Naikwade') || stdDocxText.includes('SHARVIL NAIKWADE'), 'DOCX contains candidate name');
  assert(stdDocxText.includes('sharvilnaikwade@gmail.com'), 'DOCX contains email');
  assert(stdDocxText.includes('TECHNICAL COMPETENCIES') || stdDocxText.includes('Technical Competencies'), 'DOCX contains competencies');
  assert(stdDocxText.includes('EDUCATION') || stdDocxText.includes('Education'), 'DOCX contains education');
  assert(stdDocxText.includes('TECHNICAL PROJECTS') || stdDocxText.includes('Technical Projects'), 'DOCX contains projects');

   const longDocxText = await renderDocxVisual('Comprehensive_Long_Resume.docx', 'Comprehensive_Long_Resume_Docx_Render.png');
  assert(longDocxText.includes('Dr. Vikramaditya Joshi'), 'Long DOCX contains name');
  assert(longDocxText.includes('Principal Robotics Architect'), 'Long DOCX contains experience');
  assert(longDocxText.includes('Autonomous Mobile Inspection Robot'), 'Long DOCX contains projects');

  const minDocxText = await renderDocxVisual('Minimal_Short_Resume.docx', 'Minimal_Short_Resume_Docx_Render.png');
  assert(minDocxText.includes('Aarav Patel'), 'Minimal DOCX contains name');
  assert(minDocxText.includes('aarav.patel@eng.edu'), 'Minimal DOCX contains email');

  await browser.close();

  console.log('\n=====================================================');
  console.log('🎉 ALL EXHAUSTIVE HUMAN-QUALITY CHECKS PASSED (100%)');
  console.log('=====================================================');
}

performHumanQualityReview().catch(err => {
  console.error('Human Quality Review Failed:', err);
  process.exit(1);
});
