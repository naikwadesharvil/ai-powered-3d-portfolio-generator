import { execSync, spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import http from 'http';
import assert from 'assert';
import puppeteer from 'puppeteer-core';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const TEMP_DIR = path.resolve('scratch/fresh_clone');
const TEST_PORT = 5099;

function get(path, port = TEST_PORT) {
  return new Promise((resolve, reject) => {
    const req = http.get(`http://localhost:${port}${path}`, (res) => {
      let body = '';
      res.on('data', (c) => (body += c));
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body }));
    });
    req.on('error', reject);
    req.setTimeout(8000, () => {
      req.destroy();
      reject(new Error(`Timeout fetching ${path}`));
    });
  });
}

async function waitForServer(port = TEST_PORT, maxWaitMs = 20000) {
  const start = Date.now();
  while (Date.now() - start < maxWaitMs) {
    try {
      const res = await get('/api/health', port);
      if (res.status === 200) return true;
    } catch {}
    await new Promise((r) => setTimeout(r, 500));
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
  console.log('===============================================================');
  console.log('📦 FRESH-CLONE AUTOMATED VERIFICATION TEST');
  console.log('===============================================================\n');

  // 1. Clean previous clone if exists
  if (fs.existsSync(TEMP_DIR)) {
    console.log(`Cleaning old temp directory ${TEMP_DIR}...`);
    fs.rmSync(TEMP_DIR, { recursive: true, force: true });
  }

  // 2. Clone repo into temp folder
  console.log('Step 1: Cloning repository into temp directory...');
  execSync(`git clone . "${TEMP_DIR}"`, { stdio: 'inherit' });

  // 3. Copy .env.example to .env with NO key
  console.log('Step 2: Copying .env.example to .env (no OpenAI key)...');
  const envExample = fs.readFileSync(path.join(TEMP_DIR, '.env.example'), 'utf-8');
  let envContent = envExample.replace(/^PORT=.*$/m, `PORT=${TEST_PORT}`);
  fs.writeFileSync(path.join(TEMP_DIR, '.env'), envContent);
  console.log(`  -> Configured .env with PORT=${TEST_PORT} and OPENAI_API_KEY=""`);

  // 4. Run npm ci
  console.log('\nStep 3: Running npm ci in fresh clone...');
  execSync('npm ci', { cwd: TEMP_DIR, stdio: 'inherit' });

  // 5. Run npm run build
  console.log('\nStep 4: Running npm run build in fresh clone...');
  execSync('npm run build', { cwd: TEMP_DIR, stdio: 'inherit' });

  // 6. Launch server using npm run start
  console.log(`\nStep 5: Launching server via npm run start on port ${TEST_PORT}...`);
  const serverProc = spawn('npm', ['run', 'start'], {
    cwd: TEMP_DIR,
    shell: true,
    stdio: 'pipe',
    env: {
      ...process.env,
      PORT: String(TEST_PORT),
      OPENAI_API_KEY: '',
    },
  });

  serverProc.stdout?.on('data', (d) => {
    const s = d.toString();
    if (s.includes('Error') || s.includes('error')) console.log('  [SERVER OUT]:', s.trim());
  });
  serverProc.stderr?.on('data', (d) => {
    console.error('  [SERVER ERR]:', d.toString().trim());
  });

  try {
    const ready = await waitForServer(TEST_PORT, 20000);
    assert.ok(ready, `Server failed to start on port ${TEST_PORT} within 20s`);
    console.log(`✅ Server successfully started and responding on port ${TEST_PORT}`);

    // Test A: /api/health
    console.log('\n--- Test A: GET /api/health ---');
    const health = await get('/api/health');
    console.log(`Status: ${health.status}`);
    console.log('Response Body:', health.body);
    assert.strictEqual(health.status, 200, '/api/health must return HTTP 200');
    const healthJson = JSON.parse(health.body);
    assert.strictEqual(healthJson.status, 'ok');
    assert.strictEqual(healthJson.hasOpenAiKey, false, 'hasOpenAiKey must be false when no key is set');
    assert.strictEqual(healthJson.model, 'offline_fallback', 'model must report offline_fallback');
    console.log('✅ [PASS] /api/health verified in fresh clone');

    // Test B: GET /
    console.log('\n--- Test B: GET / ---');
    const root = await get('/');
    console.log(`Status: ${root.status}`);
    console.log(`Content-Type: ${root.headers['content-type']}`);
    console.log(`Contains #root app container: ${root.body.includes('<div id="root">')}`);
    assert.strictEqual(root.status, 200, 'GET / must return HTTP 200');
    assert.ok(root.headers['content-type']?.includes('text/html'));
    assert.ok(root.body.includes('<div id="root">'));
    console.log('✅ [PASS] GET / verified in fresh clone (served dist/index.html)');

    // Test C: GET /p/<unknown-slug> (Refresh / Direct Load)
    const unknownSlug = 'unknown-slug-test-' + Date.now();
    console.log(`\n--- Test C: GET /p/${unknownSlug} (HTTP Refresh & SPA Fallback) ---`);
    const spaRes = await get(`/p/${unknownSlug}`);
    console.log(`Status: ${spaRes.status}`);
    console.log(`Content-Type: ${spaRes.headers['content-type']}`);
    console.log(`Serves index.html with #root: ${spaRes.body.includes('<div id="root">')}`);
    assert.strictEqual(spaRes.status, 200, 'SPA fallback must return HTTP 200');
    assert.ok(spaRes.headers['content-type']?.includes('text/html'));
    assert.ok(spaRes.body.includes('<div id="root">'));
    console.log('✅ [PASS] GET /p/<unknown-slug> HTTP response verified');

    // Test D: Browser Verification of /p/<unknown-slug> Client Render (404 UI)
    console.log(`\n--- Test D: Browser Client Render & Refresh on /p/${unknownSlug} ---`);
    const browser = await puppeteer.launch({
      executablePath: CHROME_PATH,
      headless: 'new',
      args: ['--no-sandbox', '--disable-gpu'],
    });

    try {
      const page = await browser.newPage();
      page.on('console', (msg) => console.log('  [BROWSER LOG]:', msg.text()));
      page.on('pageerror', (err) => console.log('  [BROWSER ERROR]:', err.message));

      await page.goto(`http://localhost:${TEST_PORT}/p/${unknownSlug}`, {
        waitUntil: 'domcontentloaded',
        timeout: 15000,
      });

      await new Promise((r) => setTimeout(r, 2000));
      const bodyText = await page.evaluate(() => document.body.innerText);
      console.log('  [DOM Text Excerpt]:\n', bodyText.slice(0, 300));

      const has404Text = bodyText.includes('404') || bodyText.includes('NOT FOUND');
      assert.ok(has404Text, 'Browser client must render 404 Not Found UI on unknown slug');
      console.log('✅ [PASS] Browser loaded and cleanly rendered 404 Not Found state for unknown slug');

      // Test page refresh in browser
      console.log('Testing browser page reload (F5 refresh on /p/:slug)...');
      await page.reload({ waitUntil: 'domcontentloaded' });
      await new Promise((r) => setTimeout(r, 1500));
      const reloadText = await page.evaluate(() => document.body.innerText);
      assert.ok(reloadText.includes('404') || reloadText.includes('NOT FOUND'));
      console.log('✅ [PASS] Browser refresh on /p/<unknown-slug> succeeded without 404 server error!');
    } finally {
      await browser.close();
    }

    console.log('\n===============================================================');
    console.log('🎉 ALL FRESH-CLONE TESTS PASSED PERFECTLY (0 FAILURES)');
    console.log('===============================================================');
  } finally {
    console.log('Stopping fresh-clone server process...');
    killProcessTree(serverProc);
    // Cleanup temp directory
    try {
      fs.rmSync(TEMP_DIR, { recursive: true, force: true });
      console.log('Cleaned up fresh-clone temp directory.');
    } catch {}
  }
}

main().catch((err) => {
  console.error('\n❌ Fresh-clone test failed:', err);
  process.exit(1);
});
