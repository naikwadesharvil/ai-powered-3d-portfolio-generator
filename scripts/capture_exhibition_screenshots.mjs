import puppeteer from 'puppeteer-core';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:\\Users\\sharv\\.gemini\\antigravity-ide\\brain\\8b7b3308-dceb-4da5-a816-7d7c8c3d5f3a';
const URL = 'http://localhost:5173';

async function capture() {
  console.log('Capturing exhibition screenshots...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-gpu'],
  });

  const page = await browser.newPage();

  // Clear storage first so we capture BEFORE generating
  await page.goto(URL, { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {
    localStorage.clear();
  });
  await page.goto(URL, { waitUntil: 'domcontentloaded' });
  await new Promise((r) => setTimeout(r, 2000));

  // 1. Landing Before Generating (1280px)
  await page.setViewport({ width: 1280, height: 800 });
  await new Promise((r) => setTimeout(r, 800));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'landing_before_1280px.png') });
  console.log('✔ Captured landing_before_1280px.png');

  // 2. Landing Before Generating (360px)
  await page.setViewport({ width: 360, height: 740 });
  await new Promise((r) => setTimeout(r, 800));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'landing_before_360px.png') });
  console.log('✔ Captured landing_before_360px.png');

  // Now Open Studio and Generate with "Priya Sharma"
  await page.setViewport({ width: 1280, height: 900 });
  await new Promise((r) => setTimeout(r, 600));

  // Click Launch Studio
  const studioBtn = await page.waitForSelector('#launch-studio-btn', { visible: true });
  await studioBtn.click();
  await page.waitForSelector('#creator-studio-modal', { visible: true });
  await new Promise((r) => setTimeout(r, 600));

  // Click Try an Example to autofill Priya Sharma
  const tryExampleBtn = await page.waitForSelector('#try-example-btn');
  await tryExampleBtn.click();
  await new Promise((r) => setTimeout(r, 400));

  // Navigate to Step 2: Generate
  await page.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll('.stepper-container button[role="tab"]'));
    if (tabs[1]) tabs[1].click();
  });
  await new Promise((r) => setTimeout(r, 600));

  // Click synthesis button
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const genBtn = buttons.find((b) => b.innerText && (b.innerText.includes('GENERATE') || b.innerText.includes('SYNTHESIS')));
    if (genBtn) genBtn.click();
  });

  // Wait for synthesis to complete
  await new Promise((r) => setTimeout(r, 3500));

  // 3. Customize View (1280px)
  await page.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll('.stepper-container button[role="tab"]'));
    if (tabs[2]) tabs[2].click();
  });
  await new Promise((r) => setTimeout(r, 1200));
  await page.setViewport({ width: 1280, height: 900 });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'customize_after_1280px.png') });
  console.log('✔ Captured customize_after_1280px.png');

  // 4. Customize View (360px)
  await page.setViewport({ width: 360, height: 740 });
  await new Promise((r) => setTimeout(r, 800));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'customize_after_360px.png') });
  console.log('✔ Captured customize_after_360px.png');

  // 5. Dashboard View (1280px)
  await page.setViewport({ width: 1280, height: 900 });
  await page.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll('.stepper-container button[role="tab"]'));
    if (tabs[0]) tabs[0].click();
  });
  await new Promise((r) => setTimeout(r, 800));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'dashboard_after_1280px.png') });
  console.log('✔ Captured dashboard_after_1280px.png');

  // 6. Dashboard View (360px)
  await page.setViewport({ width: 360, height: 740 });
  await new Promise((r) => setTimeout(r, 800));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'dashboard_after_360px.png') });
  console.log('✔ Captured dashboard_after_360px.png');

  // Close Studio modal and inspect Landing Hero with Priya Sharma
  await page.evaluate(() => {
    const closeBtn = document.querySelector('#close-studio-btn');
    if (closeBtn) closeBtn.click();
  });
  await new Promise((r) => setTimeout(r, 800));

  // 7. Landing After Generating (1280px)
  await page.setViewport({ width: 1280, height: 800 });
  await new Promise((r) => setTimeout(r, 800));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'landing_after_1280px.png') });
  console.log('✔ Captured landing_after_1280px.png');

  // 8. Landing After Generating (360px)
  await page.setViewport({ width: 360, height: 740 });
  await new Promise((r) => setTimeout(r, 800));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'landing_after_360px.png') });
  console.log('✔ Captured landing_after_360px.png');

  await browser.close();
  console.log('All exhibition screenshots successfully captured!');
}

capture().catch((err) => {
  console.error(err);
  process.exit(1);
});
