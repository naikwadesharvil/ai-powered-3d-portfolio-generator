import puppeteer from 'puppeteer-core';
import assert from 'assert';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const CLIENT_PORT = 5173;

async function runStudioRegressionTest() {
  console.log('===============================================================');
  console.log('🧪 Lazy CreatorStudio & 4-Step Stepper Flow Regression Test');
  console.log('===============================================================\n');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-gpu'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  try {
    page.on('console', (msg) => console.log('  [BROWSER LOG]:', msg.type(), msg.text()));
    page.on('pageerror', (err) => console.error('  [BROWSER ERROR]:', err));
    page.on('requestfailed', (req) => console.error('  [BROWSER REQ FAILED]:', req.url(), req.failure()?.errorText));
    page.on('response', (res) => {
      if (res.url().includes('CreatorStudio')) {
        console.log('  [BROWSER RES]:', res.url(), res.status());
      }
    });

    await page.evaluateOnNewDocument(() => {
      window.addEventListener('unhandledrejection', (e) => {
        console.error('UNHANDLED REJECTION in page:', e.reason ? (e.reason.stack || e.reason.message || e.reason) : e);
      });
      window.addEventListener('error', (e) => {
        console.error('WINDOW ERROR in page:', e.message, e.filename, e.lineno);
      });
    });

    // 1. Load app
    console.log('Navigating to local client...');
    await page.goto(`http://localhost:${CLIENT_PORT}`, {
      waitUntil: 'domcontentloaded',
      timeout: 15000,
    });
    // Wait for hydration and Three.js canvas setup
    await new Promise((r) => setTimeout(r, 2000));

    // 2. Click the floating Studio button
    console.log('Locating and clicking STUDIO launch button (#launch-studio-btn)...');
    await page.waitForSelector('#launch-studio-btn', { visible: true, timeout: 10000 });
    await page.click('#launch-studio-btn');

    // 3. Wait for Lazy CreatorStudio to suspend, load chunk, and mount
    console.log('Waiting for lazy CreatorStudio modal chunk to mount (#creator-studio-modal)...');
    await page.waitForSelector('#creator-studio-modal', { visible: true, timeout: 20000 });
    console.log('  ✅ [PASS] Lazy CreatorStudio opened and mounted with Suspense boundary.');

    // 4. Verify Step 1: Details
    console.log('Checking Step 1 (Details)...');
    const step1Active = await page.evaluate(() => {
      const tabs = Array.from(document.querySelectorAll('.stepper-container button[role="tab"]'));
      return tabs[0]?.getAttribute('aria-selected') === 'true' || document.body.innerText.includes('PERSONA & DISCIPLINE');
    });
    assert(step1Active, 'Step 1 (Details) must be initially active');
    console.log('  ✅ [PASS] Step 1 (Details) active.');

    // 5. Navigate to Step 2: Generate
    console.log('Navigating to Step 2 (Generate)...');
    await page.evaluate(() => {
      const tabs = Array.from(document.querySelectorAll('.stepper-container button[role="tab"]'));
      if (tabs[1]) tabs[1].click();
    });
    await new Promise((r) => setTimeout(r, 600));

    const step2Active = await page.evaluate(() => {
      return (
        document.body.innerText.includes('Generate Your Tailored 3D Portfolio') ||
        document.body.innerText.includes('SYNTHESIS') ||
        document.body.innerText.includes('AI ARCHITECT') ||
        document.body.innerText.includes('GENERATION MODE')
      );
    });
    assert(step2Active, 'Step 2 (Generate) must display AI synthesis options');
    console.log('  ✅ [PASS] Step 2 (Generate) active.');

    // 6. Navigate to Step 3: Customize (Lazy SplitCustomizer)
    console.log('Navigating to Step 3 (Customize with Lazy SplitCustomizer)...');
    await page.evaluate(() => {
      const tabs = Array.from(document.querySelectorAll('.stepper-container button[role="tab"]'));
      if (tabs[2]) tabs[2].click();
    });

    // Wait for SplitCustomizer to render
    await page.waitForFunction(
      () => {
        return (
          document.body.innerText.includes('Sections & Flow') ||
          document.body.innerText.includes('Theme Tokens') ||
          document.body.innerText.includes('AI Assistant Co-Pilot') ||
          document.querySelector('.split-customizer-container') !== null
        );
      },
      { timeout: 10000 }
    );
    console.log('  ✅ [PASS] Step 3 (SplitCustomizer) mounted successfully.');

    // 7. Navigate to Step 4: Download / Publish
    console.log('Navigating to Step 4 (Download / Publish)...');
    await page.evaluate(() => {
      const tabs = Array.from(document.querySelectorAll('.stepper-container button[role="tab"]'));
      if (tabs[3]) tabs[3].click();
    });
    await new Promise((r) => setTimeout(r, 600));

    const step4Active = await page.evaluate(() => {
      return (
        document.body.innerText.includes('Export & Publish Your Portfolio') ||
        document.body.innerText.includes('Download as static HTML')
      );
    });
    assert(step4Active, 'Step 4 (Download / Publish) must display export options');
    console.log('  ✅ [PASS] Step 4 (Download / Publish) active.');

    console.log('\n===============================================================');
    console.log('🎉 REGRESSION TEST PASSED: Studio opens and navigates all 4 steps!');
    console.log('===============================================================\n');
  } finally {
    await browser.close();
  }
}

runStudioRegressionTest().catch((err) => {
  console.error('\x1b[31m✖ Studio Regression Test Failed:\x1b[0m', err);
  process.exit(1);
});
