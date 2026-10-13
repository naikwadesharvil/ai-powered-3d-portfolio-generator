import assert from 'assert';
import http from 'http';
import puppeteer from 'puppeteer-core';
import { spawn } from 'child_process';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 5000;

function fetchJson(url, options = {}) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const req = http.request(
      {
        hostname: u.hostname,
        port: u.port,
        path: u.pathname,
        method: options.method || 'GET',
        headers: options.headers || {},
      },
      (res) => {
        let body = '';
        res.on('data', (c) => (body += c));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(body), raw: body });
          } catch {
            resolve({ status: res.statusCode, raw: body });
          }
        });
      }
    );
    req.on('error', reject);
    if (options.body) req.write(options.body);
    req.end();
  });
}

function fetchHtml(url) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const req = http.get({ hostname: u.hostname, port: u.port, path: u.pathname }, (res) => {
      let body = '';
      res.on('data', (c) => (body += c));
      res.on('end', () => resolve({ status: res.statusCode, html: body, headers: res.headers }));
    });
    req.on('error', reject);
  });
}

async function waitForServer(port = PORT, maxWaitMs = 15000) {
  const start = Date.now();
  while (Date.now() - start < maxWaitMs) {
    try {
      const res = await fetchJson(`http://localhost:${port}/api/health`);
      if (res.status === 200) return true;
    } catch {}
    await new Promise((r) => setTimeout(r, 400));
  }
  return false;
}

async function runPrivacyProof() {
  console.log('===============================================================');
  console.log('🛡️ END-TO-END PRIVACY & NOINDEX VERIFICATION PROOF');
  console.log('===============================================================\n');

  let proc = null;
  const isUp = await waitForServer(PORT, 1000);
  if (!isUp) {
    console.log(`Starting server on port ${PORT}...`);
    proc = spawn('npx', ['tsx', 'server/index.ts'], { shell: true, stdio: 'pipe' });
    const ready = await waitForServer(PORT, 15000);
    assert(ready, 'Failed to start server');
  }

  try {
    const rawPhone = '+1 555-987-6543';
    const rawEmail = 'stealth.developer@secret-corp.io';

    const testPayload = {
      name: 'Alex Mercer',
      tagline: 'Stealth Cryptography Specialist',
      bio: 'Working on high-assurance confidential computation.',
      role: 'professional',
      branch: 'software',
      phone: rawPhone,
      email: rawEmail,
      hidePhone: true,
      hideEmail: true,
      noIndex: true,
      privacy: {
        hidePhone: true,
        hideEmail: true,
        noIndex: true,
      },
      skills: [{ name: 'Rust', level: 95 }, { name: 'Zero Knowledge Proofs', level: 90 }],
      projects: [],
      experiences: [],
      educations: [],
      sectionVisibility: {
        hero: true,
        about: true,
        projects: true,
        experience: true,
        skills: true,
        education: true,
        contact: true,
        services: false,
        testimonials: false,
        certifications: false,
      },
      sectionOrder: ['hero', 'about', 'skills', 'contact'],
    };

    // 1. Publish Portfolio
    console.log('Step 1: Publishing portfolio with hidePhone=true, hideEmail=true, noIndex=true...');
    const publishRes = await fetchJson(`http://localhost:${PORT}/api/portfolios`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testPayload),
    });

    assert.strictEqual(publishRes.status, 201, 'Publishing must return HTTP 201');
    const { slug, ownerToken } = publishRes.data;
    console.log(`  -> Published successfully with slug: ${slug}`);

    // 2. Fetch Public API: GET /api/portfolios/:slug
    console.log(`\nStep 2: Fetching public JSON API at GET /api/portfolios/${slug}...`);
    const apiRes = await fetchJson(`http://localhost:${PORT}/api/portfolios/${slug}`);
    assert.strictEqual(apiRes.status, 200, 'Public API must return HTTP 200');

    const jsonString = apiRes.raw;
    const phoneInJson = jsonString.includes(rawPhone);
    const emailInJson = jsonString.includes(rawEmail);

    console.log(`  -> Raw phone "${rawPhone}" present in public JSON: ${phoneInJson}`);
    console.log(`  -> Raw email "${rawEmail}" present in public JSON: ${emailInJson}`);
    console.log(`  -> portfolio.phone value: "${apiRes.data.portfolio.phone}"`);
    console.log(`  -> portfolio.email value: "${apiRes.data.portfolio.email}"`);
    console.log(`  -> portfolio.hidePhone flag: ${apiRes.data.portfolio.hidePhone}`);
    console.log(`  -> portfolio.hideEmail flag: ${apiRes.data.portfolio.hideEmail}`);
    console.log(`  -> portfolio.noIndex flag: ${apiRes.data.portfolio.noIndex}`);

    assert.strictEqual(phoneInJson, false, 'PROVED: Phone number is completely absent from public JSON');
    assert.strictEqual(emailInJson, false, 'PROVED: Email address is completely absent from public JSON');
    assert.strictEqual(apiRes.data.portfolio.phone, '', 'PROVED: portfolio.phone is empty string');
    assert.strictEqual(apiRes.data.portfolio.email, '', 'PROVED: portfolio.email is empty string');
    assert.strictEqual(apiRes.data.portfolio.noIndex, true, 'PROVED: portfolio.noIndex is true');

    // 3. Fetch Server Raw HTML: GET /p/:slug
    console.log(`\nStep 3: Fetching raw HTML at GET /p/${slug}...`);
    const htmlRes = await fetchHtml(`http://localhost:${PORT}/p/${slug}`);
    assert.strictEqual(htmlRes.status, 200, 'GET /p/:slug must return HTTP 200');

    const html = htmlRes.html;
    const phoneInHtml = html.includes(rawPhone);
    const emailInHtml = html.includes(rawEmail);
    const hasNoIndexTag = html.includes('<meta name="robots" content="noindex, nofollow" />');

    console.log(`  -> Raw phone "${rawPhone}" present in raw HTML: ${phoneInHtml}`);
    console.log(`  -> Raw email "${rawEmail}" present in raw HTML: ${emailInHtml}`);
    console.log(`  -> <meta name="robots" content="noindex, nofollow" /> present in raw HTML: ${hasNoIndexTag}`);

    assert.strictEqual(phoneInHtml, false, 'PROVED: Phone number is completely absent from raw HTML');
    assert.strictEqual(emailInHtml, false, 'PROVED: Email address is completely absent from raw HTML');
    assert.strictEqual(hasNoIndexTag, true, 'PROVED: <meta name="robots" content="noindex, nofollow" /> is directly present in raw HTML');

    // 4. Fetch Client Page in Headless Chrome to inspect full rendered DOM
    console.log(`\nStep 4: Loading rendered DOM in headless Chrome at http://localhost:${PORT}/p/${slug}...`);
    const browser = await puppeteer.launch({
      executablePath: CHROME_PATH,
      headless: 'new',
      args: ['--no-sandbox', '--disable-gpu'],
    });

    try {
      const page = await browser.newPage();
      await page.goto(`http://localhost:${PORT}/p/${slug}`, { waitUntil: 'domcontentloaded', timeout: 15000 });
      await new Promise((r) => setTimeout(r, 1500));

      const pageContent = await page.content();
      const phoneInDOM = pageContent.includes(rawPhone);
      const emailInDOM = pageContent.includes(rawEmail);
      const domMetaRobots = await page.$eval('meta[name="robots"]', (el) => el.getAttribute('content')).catch(() => null);

      console.log(`  -> Raw phone "${rawPhone}" present in rendered DOM: ${phoneInDOM}`);
      console.log(`  -> Raw email "${rawEmail}" present in rendered DOM: ${emailInDOM}`);
      console.log(`  -> Rendered DOM meta[name="robots"] content: "${domMetaRobots}"`);

      assert.strictEqual(phoneInDOM, false, 'PROVED: Phone number is completely absent from rendered DOM');
      assert.strictEqual(emailInDOM, false, 'PROVED: Email address is completely absent from rendered DOM');
      assert.strictEqual(domMetaRobots, 'noindex, nofollow', 'PROVED: Rendered DOM contains meta robots noindex, nofollow');
    } finally {
      await browser.close();
    }

    // 5. Cleanup: DELETE /api/portfolios/:slug
    console.log(`\nStep 5: Cleaning up test portfolio /p/${slug}...`);
    const deleteRes = await fetchJson(`http://localhost:${PORT}/api/portfolios/${slug}`, {
      method: 'DELETE',
      headers: { 'x-owner-token': ownerToken },
    });
    assert.strictEqual(deleteRes.status, 200, 'DELETE must succeed with owner token');
    console.log('  -> Deleted test portfolio successfully.');

    console.log('\n===============================================================');
    console.log('🎉 ALL END-TO-END PRIVACY & NOINDEX PROOFS VERIFIED (100% PASS)');
    console.log('===============================================================');
  } finally {
    if (proc) {
      if (process.platform === 'win32') {
        const cp = await import('child_process');
        try { cp.execSync(`taskkill /PID ${proc.pid} /T /F`, { stdio: 'ignore' }); } catch {}
      } else {
        proc.kill('SIGTERM');
      }
    }
  }
}

runPrivacyProof().catch((err) => {
  console.error('❌ Privacy proof failed:', err);
  process.exit(1);
});
