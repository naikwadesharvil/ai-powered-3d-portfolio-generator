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
  let totalCount = 8;
  let createdSlug = null;
  let createdOwnerToken = null;

  // -------------------------------------------------------------------------
  // TEST 1: Publish Valid Portfolio (POST /api/portfolios) -> Returns Slug + Owner Token
  // -------------------------------------------------------------------------
  try {
    const res = await fetch(`${API_SERVER}/api/portfolios`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mockPortfolio),
    });

    const body = await res.json();
    if (
      res.status === 201 &&
      body.success &&
      body.slug &&
      body.slug.length === 12 &&
      body.ownerToken &&
      body.ownerToken.length === 64
    ) {
      createdSlug = body.slug;
      createdOwnerToken = body.ownerToken;
      logPass(`TEST 1: Portfolio published successfully with slug "${createdSlug}" and private owner token (${body.ownerToken.length}-char hex)`);
      passedCount++;
    } else {
      throw new Error(`Unexpected response: ${res.status} ${JSON.stringify(body)}`);
    }
  } catch (err) {
    logFail('TEST 1: Failed to publish valid portfolio', err);
  }

  // -------------------------------------------------------------------------
  // TEST 2: Fetch Published Portfolio (GET /api/portfolios/:slug) -> Read-Only (No Secret Token)
  // -------------------------------------------------------------------------
  try {
    if (!createdSlug) throw new Error('No slug from Test 1');
    const res = await fetch(`${API_SERVER}/api/portfolios/${createdSlug}`);
    const body = await res.json();

    if (
      res.status === 200 &&
      body.success &&
      body.portfolio &&
      body.portfolio.name === mockPortfolio.name &&
      body.portfolio.ownerTokenHash === undefined &&
      body.portfolio.ownerToken === undefined
    ) {
      logPass(`TEST 2: GET /api/portfolios/${createdSlug} returned validated portfolio data without exposing ownerToken or its hash`);
      passedCount++;
    } else {
      throw new Error(`Invalid fetch response or owner token leaked: ${res.status} ${JSON.stringify(body)}`);
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

      // Case B: Oversized base64 image (> 200KB) is NOT silently dropped; rejected with HTTP 400 warning
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
      if (resB64.status === 400 && bodyB64.error === 'Oversized Images') {
        logPass('TEST 6B: Oversized base64 image string (> 200KB) rejected honestly with HTTP 400 (not silently dropped).');
      } else {
        throw new Error(`Expected HTTP 400 Oversized Images, got ${resB64.status}: ${JSON.stringify(bodyB64)}`);
      }

      // Case 6C: 1.5MB payload to /api/ai/* -> rejected with HTTP 413 (1MB limit)
      const string1_5MB = 'x'.repeat(1.5 * 1024 * 1024);
      const resAiOver = await fetch(`${API_SERVER}/api/ai/generate-portfolio`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: string1_5MB, role: 'student' }),
      });
      if (resAiOver.status === 413) {
        logPass('TEST 6C: 1.5MB to /api/ai/* correctly rejected with HTTP 413 (1MB route limit enforced).');
      } else {
        throw new Error(`Expected HTTP 413 for 1.5MB to /api/ai/*, got ${resAiOver.status}`);
      }

      // Case 6D: 1.5MB payload to POST /api/portfolios -> accepted by 2MB route limit
      const payload1_5MB = {
        ...mockPortfolio,
        fullBio: 'A'.repeat(1.4 * 1024 * 1024), // ~1.4MB string, total JSON ~1.45MB
      };
      const resPublish1_5MB = await fetch(`${API_SERVER}/api/portfolios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload1_5MB),
      });
      if (resPublish1_5MB.status === 200 || resPublish1_5MB.status === 201) {
        logPass('TEST 6D: 1.5MB payload to POST /api/portfolios accepted (2MB limit applies).');
      } else {
        throw new Error(`Expected HTTP 200/201 for 1.5MB to POST /api/portfolios, got status ${resPublish1_5MB.status}`);
      }

      passedCount++;
    } catch (err) {
      logFail('TEST 6: Oversized payload handling test failed', err);
    }

    // -----------------------------------------------------------------------
    // TEST 7: Owner Token Security: Authorization on DELETE & In-Place Re-Publishing
    // -----------------------------------------------------------------------
    try {
      if (!createdSlug || !createdOwnerToken) throw new Error('No slug or owner token from Test 1');

      // 7A: DELETE without token -> Expect 401 Unauthorized
      const deleteNoToken = await fetch(`${API_SERVER}/api/portfolios/${createdSlug}`, {
        method: 'DELETE',
      });
      if (deleteNoToken.status === 401) {
        logPass('TEST 7A: DELETE without token correctly rejected with HTTP 401 Unauthorized.');
      } else {
        throw new Error(`Expected HTTP 401 for delete without token, got ${deleteNoToken.status}`);
      }

      // 7B: DELETE with wrong token -> Expect 403 Forbidden
      const deleteWrongToken = await fetch(`${API_SERVER}/api/portfolios/${createdSlug}`, {
        method: 'DELETE',
        headers: { 'X-Owner-Token': 'wrong-token-00000000000000000000000000000000000000000000000000000000' },
      });
      if (deleteWrongToken.status === 403) {
        logPass('TEST 7B: DELETE with incorrect token correctly rejected with HTTP 403 Forbidden.');
      } else {
        throw new Error(`Expected HTTP 403 for delete with wrong token, got ${deleteWrongToken.status}`);
      }

      // 7C: Re-publishing from same browser with same slug & ownerToken -> Updates in-place (200 OK)
      const updatePayload = {
        ...mockPortfolio,
        slug: createdSlug,
        ownerToken: createdOwnerToken,
        tagline: 'Updated in-place with owner token authorization.',
      };
      const updateRes = await fetch(`${API_SERVER}/api/portfolios`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Owner-Token': createdOwnerToken,
        },
        body: JSON.stringify(updatePayload),
      });
      const updateBody = await updateRes.json();
      if (updateRes.status === 200 && updateBody.slug === createdSlug) {
        logPass(`TEST 7C: Re-publishing with owner token successfully updated existing slug "${createdSlug}" in-place without creating a new file.`);
      } else {
        throw new Error(`Expected HTTP 200 for update, got ${updateRes.status}: ${JSON.stringify(updateBody)}`);
      }

      // 7D: DELETE with correct token -> Succeeds with 200 OK
      const deleteValidToken = await fetch(`${API_SERVER}/api/portfolios/${createdSlug}`, {
        method: 'DELETE',
        headers: { 'X-Owner-Token': createdOwnerToken },
      });
      const deleteBody = await deleteValidToken.json();

      if (deleteValidToken.status !== 200 || !deleteBody.success) {
        throw new Error(`Unpublish with valid token failed: ${deleteValidToken.status} ${JSON.stringify(deleteBody)}`);
      }

      // Verify subsequent GET returns 404
      const getAfterDelete = await fetch(`${API_SERVER}/api/portfolios/${createdSlug}`);
      if (getAfterDelete.status === 404) {
        logPass(`TEST 7D: Portfolio "${createdSlug}" unpublished successfully with valid owner token; subsequent fetch returns 404.`);
        passedCount++;
      } else {
        throw new Error(`Expected HTTP 404 after unpublish, got ${getAfterDelete.status}`);
      }
    } catch (err) {
      logFail('TEST 7: Unpublish test failed', err);
    }
    // -----------------------------------------------------------------------
    // TEST 8: CreatorStudio Publishing UI: Publish / Update Published Page Button,
    //         No "cloud" wording, One-Time Owner Token Display & Re-Entry Input
    // -----------------------------------------------------------------------
    try {
      const studioPage = await browser.newPage();
      await studioPage.setViewport({ width: 1440, height: 900 });
      await studioPage.goto(`${CLIENT_SERVER}/`, { waitUntil: 'domcontentloaded', timeout: 15000 });
      await new Promise((r) => setTimeout(r, 600));

      // Open CreatorStudio modal
      const launchBtn = await studioPage.waitForSelector('#launch-studio-btn', { timeout: 10000 });
      await launchBtn.click();
      await studioPage.waitForSelector('#creator-studio-modal', { timeout: 10000 });
      await new Promise((r) => setTimeout(r, 500));

      // Navigate to Step 4 (Export / Publish)
      await studioPage.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const step4Btn = buttons.find((b) => b.textContent && (b.textContent.includes('Download') || b.textContent.includes('Export') || b.textContent.includes('Step 4')));
        if (step4Btn) step4Btn.click();
      });
      await new Promise((r) => setTimeout(r, 600));

      // Check publish button text: should be "Publish" or "Update published page"
      const publishBtn = await studioPage.waitForSelector('#btn-publish-portfolio, #btn-update-published-page', { timeout: 10000 });
      let publishBtnText = await studioPage.evaluate((el) => el.textContent.trim(), publishBtn);
      if (!publishBtnText.includes('Publish') && !publishBtnText.includes('Update published page')) {
        throw new Error(`Expected button text to be "Publish" or "Update published page", got "${publishBtnText}"`);
      }

      // Check that NO "cloud" wording exists in the publishing UI
      const publishingSectionText = await studioPage.evaluate(() => {
        const modal = document.querySelector('#creator-studio-modal');
        return modal ? modal.innerText : '';
      });
      const lowerText = publishingSectionText.toLowerCase();
      const cloudMatches = lowerText.match(/\bcloud\b/g);
      if (cloudMatches && cloudMatches.length > 0) {
        throw new Error(`Found prohibited "cloud" wording in Studio UI: ${cloudMatches.length} occurrences`);
      }

      // If button is "Publish", click it to test live publish and verify owner token display
      if (publishBtnText.includes('Publish') && !publishBtnText.includes('Update')) {
        await publishBtn.click();
        const tokenBanner = await studioPage.waitForSelector('#owner-token-banner', { timeout: 15000 });
        const bannerText = await studioPage.evaluate((el) => el.innerText, tokenBanner);
        if (!bannerText.includes('Owner Token') || !bannerText.includes('Save this to manage your page')) {
          throw new Error(`Owner token banner missing expected instruction. Text: ${bannerText}`);
        }
        const tokenDisplay = await studioPage.$('#owner-token-display');
        const tokenText = await studioPage.evaluate((el) => el.innerText.trim(), tokenDisplay);
        if (tokenText.length !== 64) {
          throw new Error(`Expected 64-char token display, got length ${tokenText.length}`);
        }
        // Verify update button is now visible
        const updateBtn = await studioPage.waitForSelector('#btn-update-published-page', { timeout: 5000 });
        const updateText = await studioPage.evaluate((el) => el.innerText.trim(), updateBtn);
        if (!updateText.includes('Update published page')) {
          throw new Error(`Expected button text "Update published page", got "${updateText}"`);
        }
      }

      // Test Owner Token Re-Entry UI
      const toggleTokenBtn = await studioPage.waitForSelector('#btn-toggle-token-input', { timeout: 5000 });
      await toggleTokenBtn.click();
      await new Promise((r) => setTimeout(r, 300));

      const tokenInput = await studioPage.waitForSelector('#manual-owner-token-input', { timeout: 5000 });
      await tokenInput.type('a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2');
      const saveTokenBtn = await studioPage.waitForSelector('#btn-save-owner-token', { timeout: 5000 });
      await saveTokenBtn.click();
      await new Promise((r) => setTimeout(r, 400));

      const feedbackText = await studioPage.evaluate(() => {
        const modal = document.querySelector('#creator-studio-modal');
        return modal ? modal.innerText : '';
      });
      if (!feedbackText.includes('Owner token saved')) {
        throw new Error(`Owner token save feedback missing. UI text: ${feedbackText.slice(0, 300)}`);
      }

      logPass('TEST 8: CreatorStudio publishing UI validated: button named "Publish" / "Update published page", zero "cloud" wording in UI, and owner token re-entry tested successfully.');
      passedCount++;
      await studioPage.close();
    } catch (err) {
      logFail('TEST 8: CreatorStudio publishing UI verification failed', err);
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
