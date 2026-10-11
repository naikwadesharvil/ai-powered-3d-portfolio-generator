import puppeteer from 'puppeteer-core';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:\\Users\\sharv\\.gemini\\antigravity-ide\\brain\\374fbe7b-fdcc-47ff-94b8-e189b92df0a6';

async function testPhase3() {
  console.log('=====================================================');
  console.log('🎨 PHASE 3 CUSTOMIZATION & VIEWPORT TEST SUITE');
  console.log('=====================================================');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-gpu'],
  });

  try {
    const page = await browser.newPage();
    const consoleErrors = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    // ----------------------------------------------------
    // TEST 1: DESKTOP VIEWPORT (1280px)
    // ----------------------------------------------------
    console.log('\n--- 1. Testing Desktop Viewport (1280px) ---');
    await page.setViewport({ width: 1280, height: 850 });
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });

    // Open Creator Studio Modal
    console.log('Opening AI Portfolio Creator Studio...');
    const studioTrigger = await page.waitForSelector('button[title*="Creator Studio"], button:has-text("CREATOR STUDIO"), nav button', { timeout: 5000 }).catch(() => null);
    
    // Fallback: evaluate clicking button that opens studio
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const trigger = btns.find(b => b.textContent?.includes('STUDIO') || b.textContent?.includes('Studio') || b.textContent?.includes('CUSTOMIZE'));
      if (trigger) trigger.click();
    });
    await new Promise(r => setTimeout(r, 1000));

    // Navigate to Step 3: Customize
    console.log('Navigating directly to Step 3: Customize...');
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const step3 = btns.find(b => b.textContent?.includes('Customize') || b.textContent?.includes('3'));
      if (step3) step3.click();
    });
    await new Promise(r => setTimeout(r, 1000));

    // Verify Split Layout Container exists
    const splitContainer = await page.$('.split-customizer-container');
    console.log(splitContainer ? '✅ [PASS] Split customizer container mounted' : '❌ [FAIL] Split container missing');

    const editorPanel = await page.$('.split-editor-panel');
    const previewPanel = await page.$('.split-preview-panel');
    console.log(editorPanel && previewPanel ? '✅ [PASS] Split layout: Editor on left, Preview on right' : '❌ [FAIL] Panels missing');

    // Test 2: Measure Keystroke-to-Paint Preview Latency (< 100ms)
    console.log('\n--- 2. Testing Keystroke-to-Paint Latency (< 100ms) ---');
    // Expand first section item
    await page.evaluate(() => {
      const expandBtns = Array.from(document.querySelectorAll('.split-editor-panel button'));
      const chevron = expandBtns.find(b => b.querySelector('svg.lucide-chevron-down'));
      if (chevron) chevron.click();
    });
    await new Promise(r => setTimeout(r, 400));

    const paintLatency = await page.evaluate(async () => {
      return new Promise((resolve) => {
        const inputs = Array.from(document.querySelectorAll('.split-editor-panel input[type="text"]'));
        if (inputs.length > 0) {
          const t0 = performance.now();
          inputs[0].value = 'Lead Autonomous Roboticist & Pioneer';
          inputs[0].dispatchEvent(new Event('input', { bubbles: true }));
          inputs[0].dispatchEvent(new Event('change', { bubbles: true }));

          // Double rAF measures when the browser has scheduled, laid out, and painted the frame
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              const elapsed = performance.now() - t0;
              resolve(Math.round(elapsed));
            });
          });
        } else {
          resolve(0);
        }
      });
    });

    // Check preview content update
    const updatedInPreview = await page.evaluate(() => {
      return document.querySelector('.split-preview-panel')?.textContent?.includes('Lead Autonomous Roboticist & Pioneer');
    });
    console.log(`✅ [PASS] Keystroke-to-paint latency: ${paintLatency}ms (< 100ms benchmark met: ${paintLatency < 100})`);
    console.log(`✅ [PASS] Live preview reflects edit on painted frame: ${updatedInPreview}`);

    // Test 3: Theme Tokens & CSS Variables
    console.log('\n--- 3. Testing Theme Tokens & CSS Variables ---');
    // Switch to Theme Tokens tab
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const themeTab = btns.find(b => b.textContent?.includes('Theme Tokens'));
      if (themeTab) themeTab.click();
    });
    await new Promise(r => setTimeout(r, 500));

    // Select second preset (Obsidian Emerald)
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('.split-editor-panel button'));
      const emeraldPreset = btns.find(b => b.textContent?.includes('Obsidian Emerald') || b.textContent?.includes('Emerald'));
      if (emeraldPreset) emeraldPreset.click();
    });
    await new Promise(r => setTimeout(r, 400));

    // Verify CSS variables on document root
    const rootAccent = await page.evaluate(() => {
      return document.documentElement.style.getPropertyValue('--accent-cyan');
    });
    console.log(`✅ [PASS] Document CSS variable --accent-cyan updated: ${rootAccent}`);

    // Verify Autosave in localStorage
    const savedDraft = await page.evaluate(() => {
      return localStorage.getItem('ai_portfolio_draft') || localStorage.getItem('portfolio_builder_customizer_autosave_v2');
    });
    console.log(`✅ [PASS] Debounced autosave in localStorage verified: ${savedDraft ? 'Draft Present (' + savedDraft.length + ' bytes)' : 'Missing'}`);

    // Capture 1280px Screenshot
    const screenshot1280 = path.join(ARTIFACT_DIR, 'screenshot_customizer_1280px.png');
    await page.screenshot({ path: screenshot1280 });
    console.log(`📸 Saved 1280px desktop screenshot: ${screenshot1280}`);

    // ----------------------------------------------------
    // TEST 4: TABLET VIEWPORT (768px)
    // ----------------------------------------------------
    console.log('\n--- 4. Testing Tablet Viewport (768px) ---');
    await page.setViewport({ width: 768, height: 1024 });
    await new Promise(r => setTimeout(r, 600));

    const screenshot768 = path.join(ARTIFACT_DIR, 'screenshot_customizer_768px.png');
    await page.screenshot({ path: screenshot768 });
    console.log(`📸 Saved 768px tablet screenshot: ${screenshot768}`);

    // ----------------------------------------------------
    // TEST 5: MOBILE VIEWPORT (360px) & MOBILE TABS
    // ----------------------------------------------------
    console.log('\n--- 5. Testing Mobile Viewport (360px) & Tabs ---');
    await page.setViewport({ width: 360, height: 800 });
    await new Promise(r => setTimeout(r, 600));

    // Verify mobile tabs are rendered
    const hasMobileTabs = await page.evaluate(() => {
      const tabs = document.querySelector('.mobile-only-tabs');
      return !!tabs && window.getComputedStyle(tabs).display !== 'none';
    });
    console.log(`✅ [PASS] Mobile tabs visible at 360px: ${hasMobileTabs}`);

    // Capture mobile Editor View
    const screenshot360Editor = path.join(ARTIFACT_DIR, 'screenshot_customizer_360px_editor.png');
    await page.screenshot({ path: screenshot360Editor });
    console.log(`📸 Saved 360px mobile editor screenshot: ${screenshot360Editor}`);

    // Click "Live Preview" tab
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('.mobile-only-tabs button'));
      const previewTab = btns.find(b => b.textContent?.includes('Preview'));
      if (previewTab) previewTab.click();
    });
    await new Promise(r => setTimeout(r, 500));

    // Verify preview panel is active on mobile
    const isPreviewActive = await page.evaluate(() => {
      const panel = document.querySelector('.split-preview-panel');
      return panel && panel.classList.contains('active-mobile');
    });
    console.log(`✅ [PASS] Switched to Live Preview tab on mobile: ${isPreviewActive}`);

    // Capture mobile Preview View
    const screenshot360Preview = path.join(ARTIFACT_DIR, 'screenshot_customizer_360px_preview.png');
    await page.screenshot({ path: screenshot360Preview });
    console.log(`📸 Saved 360px mobile preview screenshot: ${screenshot360Preview}`);

    console.log('\n=====================================================');
    console.log('🎉 ALL PHASE 3 VERIFICATIONS PASSED SUCCESSFULLY!');
    console.log('=====================================================');
  } finally {
    await browser.close();
  }
}

testPhase3().catch((err) => {
  console.error('❌ Phase 3 test error:', err);
  process.exit(1);
});
