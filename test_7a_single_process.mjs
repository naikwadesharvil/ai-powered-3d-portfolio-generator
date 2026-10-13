import http from 'http';
import { spawn } from 'child_process';
import assert from 'assert';

function get(path, port = 5000) {
  return new Promise((resolve, reject) => {
    const req = http.get(`http://localhost:${port}${path}`, (res) => {
      let body = '';
      res.on('data', (c) => (body += c));
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body }));
    });
    req.on('error', reject);
    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error(`Timeout fetching ${path}`));
    });
  });
}

async function waitForServer(port = 5000, maxWaitMs = 15000) {
  const start = Date.now();
  while (Date.now() - start < maxWaitMs) {
    try {
      const res = await get('/api/health', port);
      if (res.status === 200) return true;
    } catch {
      // not yet up
    }
    await new Promise((r) => setTimeout(r, 400));
  }
  return false;
}

async function main() {
  const isAlreadyRunning = await waitForServer(5000, 1000);
  let proc = null;
  if (!isAlreadyRunning) {
    console.log('Starting server via tsx server/index.ts...');
    proc = spawn('npx', ['tsx', 'server/index.ts'], {
      shell: true,
      stdio: 'pipe',
    });
    const ready = await waitForServer(5000, 15000);
    assert.ok(ready, 'Server failed to start within 15 seconds');
  } else {
    console.log('Server is already running on port 5000.');
  }

  try {
    console.log('Testing unified single-process production behavior...');

    // 1. Check API Health
    const health = await get('/api/health');
    assert.strictEqual(health.status, 200, 'Health check must return 200');
    const healthJson = JSON.parse(health.body);
    assert.strictEqual(healthJson.status, 'ok', 'Health status must be ok');
    console.log('✅ [PASS] /api/health returned 200 OK');

    // 2. Check Root Serves index.html
    const root = await get('/');
    assert.strictEqual(root.status, 200, 'Root must return 200');
    assert.ok(root.headers['content-type']?.includes('text/html'), 'Root must serve HTML');
    assert.ok(root.body.includes('<div id="root">'), 'Root must contain #root app container');
    console.log('✅ [PASS] GET / serves built dist/index.html');

    // 3. Check SPA fallback for /p/:slug
    const spaFallback = await get('/p/test-slug-1234');
    assert.strictEqual(spaFallback.status, 200, '/p/:slug must return 200 via SPA fallback');
    assert.ok(spaFallback.headers['content-type']?.includes('text/html'), '/p/:slug must serve HTML');
    assert.ok(spaFallback.body.includes('<div id="root">'), '/p/:slug must contain #root app container');
    console.log('✅ [PASS] GET /p/:slug serves built dist/index.html (SPA fallback for refresh)');

    // 4. Check API 404 does NOT return HTML
    const badApi = await get('/api/nonexistent-endpoint-xyz');
    assert.strictEqual(badApi.status, 404, 'Unknown API route must return 404');
    assert.ok(badApi.headers['content-type']?.includes('application/json'), 'API 404 must be JSON');
    const badApiJson = JSON.parse(badApi.body);
    assert.strictEqual(badApiJson.error, 'Not Found', 'API error must be Not Found');
    console.log('✅ [PASS] GET /api/* 404 returns strict JSON (never HTML)');

    console.log('\n🎉 ALL 7A SINGLE-PROCESS TESTS PASSED!');
  } finally {
    if (proc) {
      console.log('Stopping test server...');
      if (process.platform === 'win32') {
        const cp = await import('child_process');
        try { cp.execSync(`taskkill /PID ${proc.pid} /T /F`, { stdio: 'ignore' }); } catch {}
      } else {
        proc.kill('SIGTERM');
      }
    }
  }
}

main().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
