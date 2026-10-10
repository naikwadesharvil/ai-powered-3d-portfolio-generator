import puppeteer from 'puppeteer-core';
import path from 'path';
import assert from 'assert';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:\\Users\\sharv\\.gemini\\antigravity-ide\\brain\\374fbe7b-fdcc-47ff-94b8-e189b92df0a6';

async function runBrowserE2E() {
  console.log('🚀 Starting Browser E2E Inspection...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-gpu'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  // 1. Visit http://localhost:5173/#projects
  console.log('Navigating to http://localhost:5173/#projects...');
  await page.goto('http://localhost:5173/#projects', { waitUntil: 'networkidle0' });

  // Capture projects view
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'e2e_projects_section.png'),
  });
  console.log('✅ Captured e2e_projects_section.png');

  // 2. Click "RESUME" in Navbar to open Resume Studio Modal
  console.log('Testing Resume Studio Modal Trigger...');
  const buttons = await page.$$('button');
  let resumeBtn = null;
  let studioBtn = null;
  for (const btn of buttons) {
    const text = await page.evaluate(el => el.innerText, btn);
    const title = await page.evaluate(el => el.getAttribute('title'), btn);
    if (text.includes('RESUME')) {
      console.log(`Found resume button candidate: text="${text.trim()}", title="${title}"`);
      if (!resumeBtn) resumeBtn = btn;
    }
    if (text.includes('AUTOPILOT')) {
      studioBtn = btn;
    }
  }

  assert(resumeBtn, 'Resume button should exist in Navbar');
  await page.evaluate(el => el.click(), resumeBtn);
  await new Promise(r => setTimeout(r, 2000));

  // Verify modal is open and has iframe preview
  const modalText = await page.evaluate(() => document.body.innerText);
  assert(modalText.includes('ATS RESUME STUDIO & PREVIEW'), 'Resume Studio Modal should be visible with title');
  const iframePreview = await page.$('iframe[title="ATS Resume Preview"]');
  assert(iframePreview, 'A4 Live Preview iframe must be present');

  // Capture screenshot of the ATS Resume Studio Modal
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'e2e_resume_modal.png'),
  });
  console.log('✅ Captured e2e_resume_modal.png');

  // 3. Test changing template in Resume Studio Modal
  const classicBtn = await page.$('button[title*="Classic"]');
  if (classicBtn) {
    await classicBtn.click();
    await new Promise(r => setTimeout(r, 600));
  }

  // 4. Close Resume Modal
  const closeBtn = await page.$('button[title*="Close"]');
  if (closeBtn) {
    await closeBtn.click();
    await page.waitForSelector('iframe[title="ATS Resume Preview"]', { hidden: true });
    await new Promise(r => setTimeout(r, 600));
  }

  // 5. Scroll to About section and test Bento "DOWNLOAD RESUME" trigger
  await page.evaluate(() => {
    const el = document.getElementById('about');
    if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
  });
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'e2e_about_bento.png'),
  });
  console.log('✅ Captured e2e_about_bento.png');

  // 6. Test Creator Studio Generation Modal
  if (studioBtn) {
    await studioBtn.click();
    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'e2e_creator_studio_modal.png'),
    });
    console.log('✅ Captured e2e_creator_studio_modal.png');
  }

  await browser.close();
  console.log('\nConsole error count:', consoleErrors.length);
  if (consoleErrors.length > 0) {
    console.log('Console errors:', consoleErrors);
  }
  console.log('🎉 Browser E2E Inspection Complete!');
}

runBrowserE2E().catch(err => {
  console.error('E2E Test Failed:', err);
  process.exit(1);
});
