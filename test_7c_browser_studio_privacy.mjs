import puppeteer from 'puppeteer-core';
import http from 'http';
import { spawn, execSync } from 'child_process';

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

async function waitForUrl(url, maxWaitMs = 15000, intervalMs = 600) {
  const start = Date.now();
  while (Date.now() - start < maxWaitMs) {
    if (await checkUrl(url)) return true;
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  return false;
}

function killProcessTree(proc) {
  if (!proc || !proc.pid) return;
  try {
    if (process.platform === 'win32') {
      execSync(`taskkill /PID ${proc.pid} /T /F`, { stdio: 'ignore' });
    } else {
      proc.kill('SIGTERM');
    }
  } catch {}
}

async function testBrowserPrivacyUI() {
  console.log('Testing Studio Step 4 Privacy Controls in Browser...');

  let previewProc = null;
  const isRunning = await checkUrl(`http://localhost:${CLIENT_PORT}`);
  if (!isRunning) {
    console.log(`Starting vite preview on port ${CLIENT_PORT}...`);
    previewProc = spawn('npx', ['vite', 'preview', '--port', String(CLIENT_PORT)], {
      shell: true,
      stdio: 'pipe',
    });
    const ready = await waitForUrl(`http://localhost:${CLIENT_PORT}`, 15000);
    if (!ready) {
      throw new Error(`Failed to start preview on port ${CLIENT_PORT}`);
    }
  }

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-gpu'],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 900 });
    await page.goto(`http://localhost:${CLIENT_PORT}`, { waitUntil: 'networkidle2' });

    // Open studio
    const launchBtn = await page.waitForSelector('#launch-studio-btn', { timeout: 10000 });
    await launchBtn.click();
    await page.waitForSelector('#creator-studio-modal', { timeout: 10000 });

    // Jump to Step 4 via stepper tab
    await page.evaluate(() => {
      const tabs = Array.from(document.querySelectorAll('.stepper-container button[role="tab"]'));
      if (tabs[3]) tabs[3].click();
    });

    await page.waitForSelector('#publish-privacy-notice', { timeout: 5000 });
    const noticeText = await page.$eval('#publish-privacy-notice', el => el.textContent);
    console.log('Notice text:', noticeText);
    if (!noticeText.includes('Notice: Anyone with the link can view this portfolio once published.')) {
      throw new Error('Notice text mismatch');
    }

    // Check toggles exist
    const hidePhone = await page.waitForSelector('#toggle-hide-phone');
    const hideEmail = await page.waitForSelector('#toggle-hide-email');
    const noIndex = await page.waitForSelector('#toggle-no-index');

    // Click them
    await hidePhone.click();
    await hideEmail.click();
    await noIndex.click();

    const checkedStates = await page.evaluate(() => ({
      phone: document.querySelector('#toggle-hide-phone')?.checked,
      email: document.querySelector('#toggle-hide-email')?.checked,
      noIndex: document.querySelector('#toggle-no-index')?.checked,
    }));

    console.log('Checked states:', checkedStates);
    if (!checkedStates.phone || !checkedStates.email || !checkedStates.noIndex) {
      throw new Error('Toggles failed to activate');
    }

    console.log('✅ [PASS] Studio Step 4 Privacy Notice & Toggles verified in live browser UI!');
  } finally {
    await browser.close();
    if (previewProc) {
      killProcessTree(previewProc);
    }
  }
}

testBrowserPrivacyUI().catch((err) => {
  console.error('❌ Browser privacy test failed:', err);
  process.exit(1);
});
