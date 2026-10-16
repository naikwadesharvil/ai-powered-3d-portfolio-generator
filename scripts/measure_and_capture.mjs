import { spawn, execSync } from 'child_process';
import http from 'http';
import fs from 'fs';
import path from 'path';
import puppeteer from 'puppeteer-core';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:\\Users\\sharv\\.gemini\\antigravity-ide\\brain\\3fe46dcf-0340-4939-a5e9-2e8e5421f87a';

function checkUrl(url, timeoutMs = 1500) {
  return new Promise((resolve) => {
    try {
      const u = new URL(url);
      const req = http.get(
        {
          hostname: u.hostname,
          port: u.port,
          path: u.pathname,
          timeout: timeoutMs,
        },
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

async function main() {
  let previewProc = null;
  try {
    const isRunning = await checkUrl('http://localhost:5173');
    if (!isRunning) {
      console.log('Starting preview server on port 5173...');
      previewProc = spawn('npx', ['vite', 'preview', '--port', '5173'], {
        shell: true,
        stdio: 'pipe',
      });
      const ok = await waitForUrl('http://localhost:5173', 15000);
      if (!ok) {
        console.error('Failed to start preview server.');
        process.exit(1);
      }
    }

    console.log('Running Lighthouse Mobile Performance Audit...');
    const lhOutput = path.resolve('lighthouse_mobile.json');
    try {
      execSync(
        `npx --yes lighthouse http://localhost:5173 --output=json --output-path="${lhOutput}" --only-categories=performance --chrome-flags="--headless --no-sandbox" --form-factor=mobile --screenEmulation.mobile --throttling-method=simulate`,
        { stdio: 'inherit' }
      );
      if (fs.existsSync(lhOutput)) {
        const raw = JSON.parse(fs.readFileSync(lhOutput, 'utf-8'));
        const score = Math.round((raw.categories?.performance?.score ?? 0) * 100);
        console.log(`\n===============================================================`);
        console.log(`⭐ LIGHTHOUSE MOBILE PERFORMANCE SCORE: ${score}/100`);
        console.log(`===============================================================\n`);
      }
    } catch (e) {
      console.error('Lighthouse run encountered an issue:', e.message);
    }

    console.log('Capturing Screenshots at 1280px and 360px mid-scroll...');
    const browser = await puppeteer.launch({
      executablePath: CHROME_PATH,
      headless: 'new',
      args: ['--no-sandbox', '--disable-gpu'],
    });

    // 1. Desktop 1280px Mid-scroll
    const desktopPage = await browser.newPage();
    await desktopPage.setViewport({ width: 1280, height: 900 });
    await desktopPage.goto('http://localhost:5173', { waitUntil: 'networkidle0' });
    await desktopPage.evaluate(() => {
      window.scrollTo(0, 1100);
    });
    await new Promise((r) => setTimeout(r, 700)); // wait for reveal animation
    const shot1280Path = path.resolve('screenshot_1280_mid.png');
    await desktopPage.screenshot({ path: shot1280Path, fullPage: false });
    console.log('Saved 1280px mid-scroll screenshot to:', shot1280Path);

    // 2. Mobile 360px Mid-scroll
    const mobilePage = await browser.newPage();
    await mobilePage.setViewport({ width: 360, height: 740, isMobile: true });
    await mobilePage.goto('http://localhost:5173', { waitUntil: 'networkidle0' });
    await mobilePage.evaluate(() => {
      window.scrollTo(0, 1250);
    });
    await new Promise((r) => setTimeout(r, 700)); // wait for reveal animation
    const shot360Path = path.resolve('screenshot_360_mid.png');
    await mobilePage.screenshot({ path: shot360Path, fullPage: false });
    console.log('Saved 360px mid-scroll screenshot to:', shot360Path);

    await browser.close();

    // Copy to artifact directory
    if (!fs.existsSync(ARTIFACT_DIR)) {
      fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
    }
    fs.copyFileSync(shot1280Path, path.join(ARTIFACT_DIR, 'screenshot_1280_mid.png'));
    fs.copyFileSync(shot360Path, path.join(ARTIFACT_DIR, 'screenshot_360_mid.png'));
    console.log('Copied screenshots to artifact directory for inspection.');
  } finally {
    if (previewProc) {
      killProcessTree(previewProc);
    }
  }
}

main();
