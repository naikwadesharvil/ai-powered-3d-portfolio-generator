import { spawn, execSync } from 'child_process';
import http from 'http';

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
        (res) => {
          resolve(res.statusCode >= 200 && res.statusCode < 500);
        }
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
    const ok = await checkUrl(url);
    if (ok) return true;
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
  } catch {
    // Process already exited
  }
}

async function main() {
  console.log('===============================================================');
  console.log('🧪 MASTER VERIFICATION RUNNER: Starting Server & Preview Checks');
  console.log('===============================================================\n');

  let serverProc = null;
  let previewProc = null;

  try {
    // 1. Ensure Backend Server is Running (Port 5000)
    const isServerRunning = await checkUrl('http://localhost:5000/api/health');
    if (!isServerRunning) {
      console.log('⚡ Backend server not detected on port 5000. Auto-starting server...');
      serverProc = spawn('npx', ['tsx', 'server/index.ts'], {
        shell: true,
        stdio: 'pipe',
      });
      serverProc.stderr?.on('data', (d) => {
        const str = d.toString();
        if (str.includes('EADDRINUSE')) {
          console.error('⚠️ Server port 5000 already in use:', str.trim());
        }
      });

      const serverReady = await waitForUrl('http://localhost:5000/api/health', 15000);
      if (!serverReady) {
        console.error(
          '\n❌ [VERIFY ERROR] Backend server failed to start on http://localhost:5000.\n' +
          'Please ensure port 5000 is available, or manually run:\n' +
          '  npm run server\n'
        );
        process.exit(1);
      }
      console.log('✅ Backend server active on http://localhost:5000/api/health');
    } else {
      console.log('✅ Backend server already running on http://localhost:5000/api/health');
    }

    // 2. Ensure Frontend Preview is Running (Port 5173)
    const isPreviewRunning = await checkUrl('http://localhost:5173');
    if (!isPreviewRunning) {
      console.log('⚡ Frontend preview not detected on port 5173. Auto-starting preview...');
      previewProc = spawn('npx', ['vite', 'preview', '--port', '5173'], {
        shell: true,
        stdio: 'pipe',
      });

      const previewReady = await waitForUrl('http://localhost:5173', 15000);
      if (!previewReady) {
        console.error(
          '\n❌ [VERIFY ERROR] Frontend preview failed to start on http://localhost:5173.\n' +
          'Please ensure the production build exists and port 5173 is available, or manually run:\n' +
          '  npm run build && npm run preview\n'
        );
        process.exit(1);
      }
      console.log('✅ Frontend preview active on http://localhost:5173');
    } else {
      console.log('✅ Frontend preview already running on http://localhost:5173');
    }

    console.log('\n===============================================================');
    console.log('🚀 Running Test Suite');
    console.log('===============================================================\n');

    const tests = [
      { name: 'test_verification.mjs', cmd: 'node test_verification.mjs' },
      { name: 'test_server_ai.mjs', cmd: 'node test_server_ai.mjs' },
      { name: 'test_resume_export.mjs', cmd: 'node test_resume_export.mjs' },
      { name: 'test_resume_edge_cases_and_inspect.mjs', cmd: 'node test_resume_edge_cases_and_inspect.mjs' },
      { name: 'test_phase3_split_customizer.mjs', cmd: 'node test_phase3_split_customizer.mjs' },
      { name: 'test_phase5_followups.mjs', cmd: 'node test_phase5_followups.mjs' },
      { name: 'test_phase6_publish.mjs', cmd: 'node test_phase6_publish.mjs' },
      { name: 'test_sanitization_proof.ts', cmd: 'npx tsx test_sanitization_proof.ts' },
      { name: 'test_studio_regression.mjs', cmd: 'node test_studio_regression.mjs' },
    ];

    for (const t of tests) {
      console.log(`\n▶ Running ${t.name}...`);
      execSync(t.cmd, { stdio: 'inherit' });
      console.log(`✔ Finished ${t.name}\n`);
    }

    console.log('\n===============================================================');
    console.log('🎉 ALL VERIFICATION TESTS PASSED SUCCESSFULLY!');
    console.log('===============================================================\n');
  } catch (err) {
    console.error('\n❌ Verification failed with error:', err?.message || err);
    process.exit(1);
  } finally {
    if (serverProc) {
      console.log('Stopping auto-started backend server...');
      killProcessTree(serverProc);
    }
    if (previewProc) {
      console.log('Stopping auto-started frontend preview...');
      killProcessTree(previewProc);
    }
  }
}

main();
