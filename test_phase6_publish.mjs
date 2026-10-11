import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const API_SERVER = 'http://localhost:5000';
const CLIENT_SERVER = 'http://localhost:5173';
const SCREENSHOT_DIR = path.resolve('screenshots');

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

function logPass(msg) {
  console.log(`\x1b[32m✔ PASS:\x1b[0m ${msg}`);
}

function logFail(msg, err) {
  console.error(`\x1b[31m✖ FAIL:\x1b[0m ${msg}`, err || '');
}

const mockPortfolio = {
  id: 'portfolio-phase6-test',
  version: 2,
  name: 'Alex Rivera',
  role: 'professional',
  branch: 'cs_it',
  branchName: 'Distributed Systems & AI',
  tagline: 'Architecting ultra-resilient distributed computing clusters.',
  shortBio: 'Systems engineer specializing in high-throughput microkernels and distributed databases.',
  fullBio: 'Systems engineer with 7+ years of experience engineering real-time kernels, concurrent pipeline schedulers, and zero-trust cloud architectures.',
  location: 'San Francisco, CA',
  email: 'alex.rivera@example.com',
  phone: '+1 555-019-2834',
  github: 'https://github.com/alexrivera',
  linkedin: 'https://linkedin.com/in/alexrivera',
  twitter: 'https://x.com/alexrivera',
  theme: 'cyberpunk_neon',
  profile: {
    name: 'Alex Rivera',
    targetRole: 'Principal Systems Architect',
    tagline: 'Architecting ultra-resilient distributed computing clusters.',
    avatarUrl: '/assets/profile.png',
    location: 'San Francisco, CA',
  },
  summary: {
    shortBio: 'Systems engineer specializing in high-throughput microkernels.',
    fullBio: 'Systems engineer with 7+ years of experience engineering real-time kernels.',
  },
  contact: {
    email: 'alex.rivera@example.com',
    location: 'San Francisco, CA',
    github: 'https://github.com/alexrivera',
    linkedin: 'https://linkedin.com/in/alexrivera',
  },
  sectionVisibility: {
    hero: true,
    welcome: true,
    about: true,
    skills: true,
    projects: true,
    experience: true,
    education: true,
    certifications: true,
    publications: true,
    services: false,
    testimonials: false,
    contact: true,
  },
  skills: [
    { name: 'Rust', category: 'Systems' },
    { name: 'Go', category: 'Backend' },
    { name: 'Distributed Consensus', category: 'Architecture' },
    { name: 'eBPF', category: 'Kernel' },
  ],
  projects: [
    {
      title: 'Aether Consensus Kernel',
      description: 'Byzantine fault tolerant consensus library with sub-millisecond p99 commit latency.',
      tools: ['Rust', 'Raft', 'eBPF'],
      metrics: '1.2M ops/sec throughput',
      githubUrl: 'https://github.com/alexrivera/aether-kernel',
      demoUrl: 'https://aether.example.com',
    },
    {
      title: 'Vortex Stream Router',
      description: 'Zero-copy UDP message broker utilizing kernel bypass network interfaces.',
      tools: ['C++', 'DPDK', 'ZeroMQ'],
      metrics: '42ns packet jitter',
      githubUrl: 'https://github.com/alexrivera/vortex-router',
    },
  ],
  experience: [
    {
      role: 'Staff Infrastructure Architect',
      company: 'OmniCloud Networks',
      period: '2022 - PRESENT',
      description: 'Led core data plane team handling 40 Tbps of edge traffic.',
    },
  ],
  education: [
    {
      degree: 'B.S. in Computer Engineering',
      institution: 'Carnegie Mellon University',
      period: '2016 - 2020',
      score: 'Summa Cum Laude',
    },
  ],
};

async function runTests() {
  console.log('===============================================================');
  console.log('🚀 Phase 6 Publish & Security Verification Test Suite');
  console.log('===============================================================\n');

  let passedCount = 0;
  let totalCount = 7;
  let createdSlug = null;

  // -------------------------------------------------------------------------
  // TEST 1: Publish Valid Portfolio (POST /api/portfolios)
  // -------------------------------------------------------------------------
  try {
    const res = await fetch(`${API_SERVER}/api/portfolios`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mockPortfolio),
    });

    const body = await res.json();
    if (res.status === 201 && body.success && body.slug && body.slug.length === 12) {
      createdSlug = body.slug;
      logPass(`TEST 1: Portfolio published successfully with unguessable 12-char slug "${createdSlug}"`);
      passedCount++;
    } else {
      throw new Error(`Unexpected response: ${res.status} ${JSON.stringify(body)}`);
    }
  } catch (err) {
    logFail('TEST 1: Failed to publish valid portfolio', err);
  }

  // -------------------------------------------------------------------------
  // TEST 2: Fetch Published Portfolio (GET /api/portfolios/:slug)
  // -------------------------------------------------------------------------
  try {
    if (!createdSlug) throw new Error('No slug from Test 1');
    const res = await fetch(`${API_SERVER}/api/portfolios/${createdSlug}`);
    const body = await res.json();

    if (res.status === 200 && body.success && body.portfolio && body.portfolio.name === mockPortfolio.name) {
      logPass(`TEST 2: GET /api/portfolios/${createdSlug} returned validated portfolio data`);
      passedCount++;
    } else {
      throw new Error(`Invalid fetch response: ${res.status} ${JSON.stringify(body)}`);
    }
  } catch (err) {
    logFail('TEST 2: Failed to fetch published portfolio', err);
  }

  // -------------------------------------------------------------------------
  // Browser Tests Setup (Puppeteer)
  // -------------------------------------------------------------------------
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    // -----------------------------------------------------------------------
    // TEST 3: Public Route /p/:slug Read-Only Rendering & Open Graph Tags
    // -----------------------------------------------------------------------
    try {
      if (!createdSlug) throw new Error('No slug available');
      await page.goto(`${CLIENT_SERVER}/p/${createdSlug}`, { waitUntil: 'domcontentloaded', timeout: 15000 });
      await page.waitForSelector('main', { timeout: 10000 });
      await new Promise((r) => setTimeout(r, 600));

      // Verify title & meta description
      const title = await page.title();
      const metaDesc = await page.$eval('meta[name="description"]', (el) => el.content).catch(() => null);
      const ogTitle = await page.$eval('meta[property="og:title"]', (el) => el.content).catch(() => null);
      const ogDesc = await page.$eval('meta[property="og:description"]', (el) => el.content).catch(() => null);
      const ogUrl = await page.$eval('meta[property="og:url"]', (el) => el.content).catch(() => null);

      if (!title.includes('Alex Rivera')) {
        throw new Error(`Expected title to contain "Alex Rivera", got "${title}"`);
      }
      if (!metaDesc || !ogTitle || !ogDesc || !ogUrl) {
        throw new Error(`Missing meta/OG tags: desc=${metaDesc}, ogTitle=${ogTitle}`);
      }

      // Verify Read-Only Mode: STUDIO floating button and role switcher MUST NOT be present
      const studioButtonText = await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        return buttons.some((b) => b.textContent && b.textContent.includes('STUDIO'));
      });

      if (studioButtonText) {
        throw new Error('Studio button should NOT be visible in read-only public route');
      }

      // Verify preview sections exist
      const heroPresent = await page.$('#hero');
      const aboutPresent = await page.$('#about');
      const projectsPresent = await page.$('#projects');
      const contactPresent = await page.$('#contact');

      if (!heroPresent || !aboutPresent || !projectsPresent || !contactPresent) {
        throw new Error('Key section components missing in public portfolio rendering');
      }

      const screenshotPath = path.join(SCREENSHOT_DIR, 'phase6_public_portfolio.png');
      await page.screenshot({ path: screenshotPath });

      logPass(`TEST 3: Public route /p/${createdSlug} rendered read-only with title, meta tags, OG tags, and no studio UI. Screenshot saved.`);
      passedCount++;
    } catch (err) {
      logFail('TEST 3: Public route rendering verification failed', err);
    }

    // -----------------------------------------------------------------------
    // TEST 4: Friendly 404 for Unknown Slug (/p/nonexistent-slug-xyz)
    // -----------------------------------------------------------------------
    try {
      await page.goto(`${CLIENT_SERVER}/p/nonexistent-slug-xyz`, { waitUntil: 'networkidle2', timeout: 15000 });

      // Check for 404 page elements
      const bodyText = await page.evaluate(() => document.body.innerText);
      if (!bodyText.includes('404') || !bodyText.includes('Published Portfolio Not Found')) {
        throw new Error(`Expected friendly 404 text, got: ${bodyText.slice(0, 200)}`);
      }

      const screenshot404 = path.join(SCREENSHOT_DIR, 'phase6_404_page.png');
      await page.screenshot({ path: screenshot404 });

      logPass('TEST 4: Unknown slug /p/nonexistent-slug-xyz rendered friendly 404 page with return home action.');
      passedCount++;
    } catch (err) {
      logFail('TEST 4: Friendly 404 verification failed', err);
    }

    // -----------------------------------------------------------------------
    // TEST 5: Security & Malicious Input Sanitization (<script> & javascript: URLs)
    // -----------------------------------------------------------------------
    try {
      const maliciousPortfolio = {
        ...mockPortfolio,
        name: 'Evil Hacker <script>window.__XSS_TRIGGERED = true;</script>',
        tagline: 'XSS Injection <script>alert(1)</script>',
        fullBio: 'Testing stored XSS payload <script>alert("bio pwned")</script>',
        github: 'javascript:alert("pwned_github")',
        linkedin: 'javascript:window.__XSS_LINKEDIN = true;',
        projects: [
          {
            title: 'Malicious Project <script>alert("proj")</script>',
            description: 'Injected script test',
            tools: ['Security'],
            githubUrl: 'javascript:alert("project_github")',
            demoUrl: 'javascript:alert("project_demo")',
          },
        ],
      };

      const res = await fetch(`${API_SERVER}/api/portfolios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(maliciousPortfolio),
      });

      const body = await res.json();
      if (!body.success) throw new Error(`Publish failed: ${JSON.stringify(body)}`);

      const malSlug = body.slug;

      // Navigate to the malicious portfolio page
      await page.goto(`${CLIENT_SERVER}/p/${malSlug}`, { waitUntil: 'domcontentloaded', timeout: 15000 });
      await page.waitForSelector('main', { timeout: 10000 });
      await new Promise((r) => setTimeout(r, 600));

      // Verify no script executed
      const xssTriggered = await page.evaluate(() => window.__XSS_TRIGGERED);
      if (xssTriggered) {
        throw new Error('SECURITY VULNERABILITY: <script> tag executed in browser context!');
      }

      // Check all rendered anchor links to verify javascript: URLs were neutralized to '#'
      const hrefs = await page.evaluate(() => {
        const anchors = Array.from(document.querySelectorAll('a'));
        return anchors.map((a) => a.getAttribute('href') || '');
      });

      const dangerousHrefs = hrefs.filter((h) => h.toLowerCase().startsWith('javascript:'));
      if (dangerousHrefs.length > 0) {
        throw new Error(`SECURITY VULNERABILITY: Found dangerous javascript: URLs in DOM: ${dangerousHrefs.join(', ')}`);
      }

      logPass('TEST 5: Malicious input sanitized cleanly. <script> tags neutralized and javascript: URLs converted to safe anchors (#).');
      passedCount++;
    } catch (err) {
      logFail('TEST 5: Security sanitization test failed', err);
    }

    // -----------------------------------------------------------------------
    // TEST 6: Oversized Payload & Large Base64 Handling
    // -----------------------------------------------------------------------
    try {
      // Case A: Payload over 2MB limit
      const giantString = 'A'.repeat(2.5 * 1024 * 1024); // 2.5 MB
      const oversizedPayload = {
        ...mockPortfolio,
        fullBio: giantString,
      };

      const resOver = await fetch(`${API_SERVER}/api/portfolios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(oversizedPayload),
      });

      // Expect HTTP 413 Payload Too Large
      if (resOver.status === 413) {
        logPass('TEST 6A: Oversized payload (> 2MB) correctly rejected with HTTP 413.');
      } else {
        throw new Error(`Expected HTTP 413 for oversized payload, got status ${resOver.status}`);
      }

      // Case B: Base64 image over 200KB is stripped
      const largeBase64 = 'data:image/png;base64,' + 'B'.repeat(300000); // ~300KB
      const base64Payload = {
        ...mockPortfolio,
        profile: {
          ...mockPortfolio.profile,
          avatarUrl: largeBase64,
        },
      };

      const resB64 = await fetch(`${API_SERVER}/api/portfolios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(base64Payload),
      });

      const bodyB64 = await resB64.json();
      if (!bodyB64.success) throw new Error('Base64 portfolio publish failed');

      // Fetch saved portfolio to check avatarUrl was stripped
      const fetchB64 = await fetch(`${API_SERVER}/api/portfolios/${bodyB64.slug}`);
      const savedB64 = await fetchB64.json();

      if (savedB64.portfolio.profile.avatarUrl === '') {
        logPass('TEST 6B: Oversized base64 image string (> 200KB) successfully stripped from storage.');
      } else {
        throw new Error('Oversized base64 was not stripped');
      }

      passedCount++;
    } catch (err) {
      logFail('TEST 6: Oversized payload handling test failed', err);
    }

    // -----------------------------------------------------------------------
    // TEST 7: Unpublish Flow (DELETE /api/portfolios/:slug)
    // -----------------------------------------------------------------------
    try {
      if (!createdSlug) throw new Error('No slug from Test 1');

      // Call DELETE
      const deleteRes = await fetch(`${API_SERVER}/api/portfolios/${createdSlug}`, {
        method: 'DELETE',
      });
      const deleteBody = await deleteRes.json();

      if (deleteRes.status !== 200 || !deleteBody.success) {
        throw new Error(`Unpublish failed: ${deleteRes.status} ${JSON.stringify(deleteBody)}`);
      }

      // Verify subsequent GET returns 404
      const getAfterDelete = await fetch(`${API_SERVER}/api/portfolios/${createdSlug}`);
      if (getAfterDelete.status === 404) {
        logPass(`TEST 7: Portfolio "${createdSlug}" unpublished successfully; subsequent fetch returns 404.`);
        passedCount++;
      } else {
        throw new Error(`Expected HTTP 404 after unpublish, got ${getAfterDelete.status}`);
      }
    } catch (err) {
      logFail('TEST 7: Unpublish test failed', err);
    }
  } finally {
    await browser.close();
  }

  console.log('\n===============================================================');
  console.log(`📊 Phase 6 Test Summary: ${passedCount}/${totalCount} PASSED`);
  console.log('===============================================================');

  if (passedCount === totalCount) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
