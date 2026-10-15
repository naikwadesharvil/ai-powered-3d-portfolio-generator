import puppeteer from 'puppeteer-core';
import assert from 'assert';
import http from 'http';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const CLIENT_PORT = 5173;

function checkUrl(url, timeoutMs = 1500) {
  return new Promise((resolve) => {
    try {
      const u = new URL(url);
      const req = http.get(
        { hostname: u.hostname, port: u.port, path: u.pathname, timeout: timeoutMs },
        (res) => resolve(res.statusCode >= 200 && res.statusCode < 500)
      );
      req.on('error', () => resolve(false));
      req.on('timeout', () => {
        req.destroy();
        resolve(false);
      });
    } catch {
      resolve(false);
    }
  });
}

async function runHologramGenerationTest() {
  console.log('===============================================================');
  console.log('🧪 HologramCard Generation & Data Reflection Test');
  console.log('===============================================================\n');

  const isClientReady = await checkUrl(`http://localhost:${CLIENT_PORT}`);
  if (!isClientReady) {
    console.error(`Client not responding on port ${CLIENT_PORT}.`);
    process.exit(1);
  }

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-gpu'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  try {
    // 1. Load the landing page
    console.log('Navigating to landing page...');
    await page.goto(`http://localhost:${CLIENT_PORT}`, {
      waitUntil: 'domcontentloaded',
      timeout: 15000,
    });
    await new Promise((r) => setTimeout(r, 2000));

    // 2. Verify initial HologramCard in Hero area
    console.log('Verifying initial HologramCard in landing hero...');
    await page.waitForSelector('#hero [data-testid="hologram-card"]', { visible: true, timeout: 10000 });
    const initialName = await page.$eval('#hero [data-testid="hologram-name"]', (el) => el.textContent?.trim());
    console.log(`  Initial Hologram Name: "${initialName}"`);
    assert(initialName && initialName.length > 0, 'Initial hologram card must display a name');

    // Verify prominent "Create My Portfolio" button exists
    const heroBtn = await page.$('#hero-create-portfolio-btn');
    assert(heroBtn, 'Prominent #hero-create-portfolio-btn must exist in landing hero');

    // 3. Click "Create My Portfolio" button to open CreatorStudio
    console.log('Clicking prominent "Create My Portfolio" button (#hero-create-portfolio-btn)...');
    await heroBtn.click();
    await page.waitForSelector('#creator-studio-modal', { visible: true, timeout: 10000 });
    console.log('  ✅ [PASS] CreatorStudio opened via hero prominent button.');

    // 4. Fill in custom visitor details in Step 1
    const testCandidateName = 'Dr. Elena Rostova';
    const testInterests = 'Quantum Cryptography, Holographic Optics, Superconducting Qubits';

    console.log(`Entering candidate name: "${testCandidateName}"...`);
    await page.waitForSelector('input[placeholder*="Alex Chen"]', { timeout: 5000 });
    await page.evaluate((nameVal) => {
      const input = document.querySelector('input[placeholder*="Alex Chen"]');
      if (input) {
        const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
        setter?.call(input, nameVal);
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }, testCandidateName);

    const enteredName = await page.$eval('input[placeholder*="Alex Chen"]', (el) => el.value);
    console.log(`  Verified name in input: "${enteredName}"`);

    console.log(`Entering areas of interest: "${testInterests}"...`);
    await page.waitForSelector('input[placeholder*="Finite Element Analysis"]', { timeout: 5000 });
    await page.evaluate((interestsVal) => {
      const input = document.querySelector('input[placeholder*="Finite Element Analysis"]');
      if (input) {
        const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
        setter?.call(input, interestsVal);
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }, testInterests);

    const enteredInterests = await page.$eval('input[placeholder*="Finite Element Analysis"]', (el) => el.value);
    console.log(`  Verified interests in input: "${enteredInterests}"`);

    // 5. Navigate to Step 2: Generate
    console.log('Navigating to Step 2 (Generate)...');
    await page.evaluate(() => {
      const tabs = Array.from(document.querySelectorAll('.stepper-container button[role="tab"]'));
      if (tabs[1]) tabs[1].click();
    });
    await new Promise((r) => setTimeout(r, 800));

    page.on('console', (msg) => console.log('  [BROWSER]:', msg.type(), msg.text()));
    page.on('pageerror', (err) => console.error('  [PAGE ERROR]:', err));

    // Set up response listener for portfolio generation
    const responsePromise = page.waitForResponse(
      (res) => res.url().includes('/api/ai/generate-portfolio'),
      { timeout: 25000 }
    ).catch(() => null);

    // 6. Click Generate button
    console.log('Triggering portfolio synthesis...');
    const clickedButtonText = await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(
        (b) => b.innerText.includes('3D PORTFOLIO') && b.innerText.includes('GENERATE')
      );
      if (btn) {
        btn.click();
        return btn.innerText.trim();
      }
      return null;
    });
    console.log(`  Clicked synthesis button: "${clickedButtonText}"`);
    assert(clickedButtonText, 'Synthesis button must be found and clicked');

    // Wait for network response if API is called
    const apiRes = await responsePromise;
    if (apiRes) {
      console.log(`  API responded with status: ${apiRes.status()}`);
    }

    // Wait for synthesis to complete (indicated by Next: Customize & Polish button appearing)
    console.log('Waiting for generation synthesis to finish...');
    await page.waitForFunction(
      () => {
        const buttons = Array.from(document.querySelectorAll('button'));
        return buttons.some((b) => b.innerText.includes('Customize & Polish')) ||
               document.body.innerText.includes('ANTI-HALLUCINATION AUDIT');
      },
      { timeout: 25000 }
    );
    console.log('  ✅ [PASS] Generation synthesis completed.');

    // 7. Navigate to Step 3 (Customize) to verify HologramCard in Live Preview
    console.log('Navigating to Step 3 (Customize Live Preview)...');
    await page.evaluate(() => {
      const nextBtn = Array.from(document.querySelectorAll('button')).find((b) =>
        b.innerText.includes('Customize & Polish')
      );
      if (nextBtn) {
        nextBtn.click();
      } else {
        const tabs = Array.from(document.querySelectorAll('.stepper-container button[role="tab"]'));
        if (tabs[2]) tabs[2].click();
      }
    });
    await new Promise((r) => setTimeout(r, 1500));

    // Check HologramCard inside Live Preview
    console.log('Checking HologramCard in Customize Live Preview...');
    await page.waitForSelector('.split-customizer-container [data-testid="hologram-card"]', { visible: true, timeout: 10000 });

    const previewHologramName = await page.$eval(
      '.split-customizer-container [data-testid="hologram-name"]',
      (el) => el.textContent?.trim()
    );
    console.log(`  Preview Hologram Name: "${previewHologramName}"`);
    assert.strictEqual(
      previewHologramName,
      testCandidateName,
      `Preview hologram name must reflect entered name "${testCandidateName}"`
    );

    const previewSkills = await page.$$eval(
      '.split-customizer-container [data-testid="hologram-skills"] .hologram-skill-chip',
      (chips) => chips.map((c) => c.textContent?.trim() || '')
    );
    console.log(`  Preview Hologram Skills Chips (${previewSkills.length}):`, previewSkills);
    assert(previewSkills.length > 0, 'HologramCard must show skills chips');

    // 8. Close Studio modal and verify Landing Hero HologramCard updated
    console.log('Closing Studio modal to inspect landing hero...');
    await page.evaluate(() => {
      const closeBtn = document.querySelector('button[aria-label="Close studio"]') || document.querySelector('.creator-studio-header button');
      if (closeBtn) closeBtn.click();
    });
    await new Promise((r) => setTimeout(r, 800));

    const heroHologramName = await page.$eval('#hero [data-testid="hologram-name"]', (el) => el.textContent?.trim());
    console.log(`  Landing Hero Hologram Name: "${heroHologramName}"`);
    assert.strictEqual(
      heroHologramName,
      testCandidateName,
      `Hero hologram name must reflect generated name "${testCandidateName}"`
    );

    const heroSkills = await page.$$eval(
      '#hero [data-testid="hologram-skills"] .hologram-skill-chip',
      (chips) => chips.map((c) => c.textContent?.trim() || '')
    );
    console.log(`  Landing Hero Hologram Skills Chips (${heroSkills.length}):`, heroSkills);
    assert(heroSkills.length > 0, 'Landing Hero HologramCard must show generated skills chips');

    // 9. Privacy check: verify phone and email are NOT exposed in HologramCard
    const cardText = await page.$eval('#hero [data-testid="hologram-card"]', (el) => el.innerText);
    const hasEmail = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(cardText);
    assert(!hasEmail, 'HologramCard must NOT contain email address');
    assert(!cardText.includes('+91') && !cardText.includes('+1'), 'HologramCard must NOT contain phone number');
    console.log('  ✅ [PASS] Privacy preserved: phone/email not exposed on HologramCard.');

    console.log('\n===============================================================');
    console.log('🎉 ALL HOLOGRAM GENERATION TESTS PASSED SUCCESSFULLY!');
    console.log('===============================================================\n');
  } finally {
    await browser.close();
  }
}

runHologramGenerationTest().catch((err) => {
  console.error('\x1b[31m✖ Hologram Generation Test Failed:\x1b[0m', err);
  process.exit(1);
});
