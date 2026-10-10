import puppeteer from 'puppeteer-core';
import path from 'path';

const ARTIFACT_DIR = 'C:\\Users\\sharv\\.gemini\\antigravity-ide\\brain\\374fbe7b-fdcc-47ff-94b8-e189b92df0a6';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

console.log('🚀 Starting Chrome Headless Browser Automation Test (Multi-Discipline Suite)...');

(async () => {
  let browser;
  try {
    browser = await puppeteer.launch({
      executablePath: CHROME_PATH,
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
      defaultViewport: { width: 1440, height: 900, deviceScaleFactor: 1 },
    });

    const page = await browser.newPage();
    const consoleErrors = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        // filter benign React three fiber / webgl warning in headless
        if (!msg.text().includes('WebGL') && !msg.text().includes('THREE')) {
          consoleErrors.push(msg.text());
          console.error('Browser console error:', msg.text());
        }
      }
    });
    page.on('pageerror', (err) => {
      consoleErrors.push(err.message);
      console.error('Browser uncaught error:', err.message);
    });

    console.log('Navigating to http://localhost:5173/ ...');
    await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await new Promise((r) => setTimeout(r, 2000));

    // 1. Screenshot Hero
    console.log('Capturing Hero Section Screenshot...');
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'screenshot_hero.png'),
    });

    // 2. Screenshot #welcome
    console.log('Navigating to #welcome...');
    await page.evaluate(() => {
      document.querySelector('#welcome')?.scrollIntoView({ behavior: 'instant' });
    });
    await new Promise((r) => setTimeout(r, 800));
    console.log('Capturing Welcome Section Screenshot...');
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'screenshot_welcome.png'),
    });

    // 3. Screenshot #about
    console.log('Navigating to #about...');
    await page.evaluate(() => {
      document.querySelector('#about')?.scrollIntoView({ behavior: 'instant' });
    });
    await new Promise((r) => setTimeout(r, 800));
    console.log('Capturing About Bento Grid Screenshot...');
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'screenshot_about.png'),
    });

    // 4. Screenshot #projects
    console.log('Navigating to #projects...');
    await page.evaluate(() => {
      document.querySelector('#projects')?.scrollIntoView({ behavior: 'instant' });
    });
    await new Promise((r) => setTimeout(r, 800));
    console.log('Capturing Selected Works Screenshot...');
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'screenshot_projects.png'),
    });

    // 4b. Screenshot #contact (3D Telephone interactive stage)
    console.log('Navigating to #contact...');
    await page.evaluate(() => {
      document.querySelector('#contact')?.scrollIntoView({ behavior: 'instant' });
    });
    await new Promise((r) => setTimeout(r, 800));
    console.log('Capturing Contact 3D Telephone Stage Screenshot...');
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'screenshot_contact.png'),
    });

    // 5. Open Creator Studio Modal
    console.log('Opening Creator Studio Modal...');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const studioBtn = buttons.find((b) => b.textContent?.includes('STUDIO'));
      if (studioBtn) studioBtn.click();
    });
    await new Promise((r) => setTimeout(r, 1000));
    console.log('Capturing Studio Modal Step 1 (Enter Details) Screenshot...');
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'screenshot_studio.png'),
    });

    // 6. Test Multi-Discipline Branch Selection: Select Mechanical Engineering
    console.log('Selecting Mechanical Engineering branch in Creator Studio...');
    const branchSelected = await page.evaluate(() => {
      const allDivs = Array.from(document.querySelectorAll('div'));
      const mechCard = allDivs.find((c) => c.textContent?.includes('Mechanical Engineering') && c.textContent?.includes('Core Engineering'));
      if (mechCard) {
        mechCard.click();
        return true;
      }
      return false;
    });
    console.log('Mechanical branch clicked:', branchSelected);
    await new Promise((r) => setTimeout(r, 600));

    // 7. Click a recommended Mechanical interest
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const cadBtn = buttons.find((b) => b.textContent?.includes('CAD') || b.textContent?.includes('FEA') || b.textContent?.includes('Thermal'));
      if (cadBtn) cadBtn.click();
    });
    await new Promise((r) => setTimeout(r, 400));

    // 8. Test Step 2: Generate Portfolio Tab
    console.log('Navigating to Step 2: Generate (AI Autopilot) Tab...');
    const tabClicked = await page.evaluate(() => {
      const tabBtns = Array.from(document.querySelectorAll('button'));
      const genTab = tabBtns.find((b) => b.textContent?.includes('2. Generate') || b.textContent?.includes('Generate (AI Autopilot)'));
      if (genTab) {
        genTab.click();
        return true;
      }
      return false;
    });
    console.log('Step 2 Tab clicked:', tabClicked);
    await new Promise((r) => setTimeout(r, 1000));

    // 9. Click "GENERATE ... PORTFOLIO" button
    console.log('Triggering AI Portfolio Generation...');
    const genTriggered = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const triggerBtn = buttons.find((b) => b.textContent?.includes('GENERATE') && b.textContent?.includes('PORTFOLIO'));
      if (triggerBtn) {
        triggerBtn.click();
        return true;
      }
      return false;
    });
    console.log('Generation triggered:', genTriggered);
    // Wait for generation animation and completion
    await new Promise((r) => setTimeout(r, 2600));

    console.log('Capturing Studio Generated Recommendations & AI Suggestions Screenshot...');
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'screenshot_studio_recommendations.png'),
    });

    // 10. Test Step 3: Sections & AI Rewriter Tab
    console.log('Navigating to Step 3: Sections & AI Rewriter Tab...');
    await page.evaluate(() => {
      const tabBtns = Array.from(document.querySelectorAll('button'));
      const secTab = tabBtns.find((b) => b.textContent?.includes('Sections & AI Rewriter'));
      if (secTab) secTab.click();
    });
    await new Promise((r) => setTimeout(r, 800));
    console.log('Capturing Studio Sections & Rewriter Screenshot...');
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'screenshot_studio_sections.png'),
    });

    // 11. Test Step 4: Conversational Co-Pilot Tab
    console.log('Navigating to Step 4: Conversational Editor Tab...');
    await page.evaluate(() => {
      const tabBtns = Array.from(document.querySelectorAll('button'));
      const chatTab = tabBtns.find((b) => b.textContent?.includes('Conversational Editor'));
      if (chatTab) chatTab.click();
    });
    await new Promise((r) => setTimeout(r, 800));
    console.log('Capturing Studio Conversational Co-Pilot Screenshot...');
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'screenshot_studio_chat.png'),
    });

    // 12. Close Studio modal and inspect live preview with updated mechanical profile
    console.log('Closing Studio modal to inspect live site preview...');
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const xBtn = btns.find((b) => b.querySelector('svg.lucide-x') || b.innerHTML.includes('lucide-x'));
      if (xBtn) xBtn.click();
    });
    await new Promise((r) => setTimeout(r, 1000));

    // Scroll to #about to view Mechanical Bento Cards
    await page.evaluate(() => {
      document.querySelector('#about')?.scrollIntoView({ behavior: 'instant' });
    });
    await new Promise((r) => setTimeout(r, 800));

    console.log('Capturing Updated Live Site Bento Screenshot (Mechanical)...');
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'screenshot_updated_site.png'),
    });

    // 13. Test Mobile Responsiveness & Navigation Drawer
    console.log('Testing Mobile Viewport (390 x 844)...');
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true });
    await page.evaluate(() => window.scrollTo(0, 0));
    await new Promise((r) => setTimeout(r, 800));
    console.log('Capturing Mobile Viewport Hero Screenshot...');
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'screenshot_mobile_hero.png'),
    });

    console.log('Opening Mobile Hamburger Menu...');
    await page.evaluate(() => {
      const toggle = document.querySelector('.mobile-menu-toggle');
      if (toggle) toggle.click();
    });
    await new Promise((r) => setTimeout(r, 600));
    console.log('Capturing Mobile Navigation Drawer Screenshot...');
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'screenshot_mobile_drawer.png'),
    });

    // Close mobile menu
    await page.evaluate(() => {
      const closeBtn = document.querySelector('[aria-label="Close navigation menu"]');
      if (closeBtn) closeBtn.click();
    });
    await new Promise((r) => setTimeout(r, 400));

    console.log('✅ Browser tests completed successfully!');
    console.log('Total Console Errors Recorded:', consoleErrors.length);
    if (consoleErrors.length > 0) {
      console.log('Console Errors:', consoleErrors);
    }
  } catch (err) {
    console.error('Browser automation test error:', err);
    process.exitCode = 1;
  } finally {
    if (browser) await browser.close();
  }
})();
