import puppeteer from 'puppeteer-core';
import assert from 'assert';
import http from 'http';
import { sanitizeUrl, sanitizeHtmlText } from './src/utils/sanitize';
import { generateStaticHtml } from './src/services/staticExport';
import { generateResumeHtml } from './src/services/resumeGenerator';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const API_PORT = 5000;
const CLIENT_PORT = 5173;

function logPass(msg: string) {
  console.log(`\x1b[32m✔ PASS:\x1b[0m ${msg}`);
}

function logFail(msg: string, err?: any) {
  console.error(`\x1b[31m✖ FAIL:\x1b[0m ${msg}`, err || '');
}

async function isPortOpen(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const req = http.get(`http://localhost:${port}/api/health`, (res) => {
      resolve(res.statusCode === 200);
    });
    req.on('error', () => resolve(false));
    req.setTimeout(1000, () => {
      req.destroy();
      resolve(false);
    });
  });
}

const maliciousPortfolio: any = {
  id: 'portfolio-xss-test',
  version: 2,
  name: 'Jane Doe <script>window.__EVIL_SCRIPT=1</script>',
  role: 'professional',
  branch: 'cs_it',
  branchName: 'R&D Computer Systems',
  tagline: 'Engineering C++ <T> with <img src=x onerror="window.__EVIL_IMG=1">',
  shortBio: 'C++ <T> compiler developer with R&D specialization',
  fullBio: 'Pioneering C++ <T> generic algorithms."><svg onload="window.__EVIL_SVG=1">',
  location: 'Zurich, Switzerland',
  email: 'jane@example.com',
  phone: '+41 79 123 4567',
  github: 'javascript:window.__EVIL_JS_GIT=1',
  linkedin: '//evil.com/phishing',
  twitter: 'data:text/html,<script>window.__EVIL_TWIT=1</script>',
  theme: 'cyberpunk_neon',
  profile: {
    name: 'Jane Doe <script>window.__EVIL_SCRIPT=1</script>',
    targetRole: 'Staff Systems Architect',
    tagline: 'Engineering C++ <T> with <img src=x onerror="window.__EVIL_IMG=1">',
    avatarUrl: '/assets/profile.png',
    location: 'Zurich, Switzerland',
  },
  contact: {
    email: 'jane@example.com',
    location: 'Zurich, Switzerland',
    github: 'javascript:window.__EVIL_JS_GIT=1',
    linkedin: '//evil.com/phishing',
    twitter: 'data:text/html,<script>window.__EVIL_TWIT=1</script>',
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
    { name: 'C++ <T>', category: 'R&D Competency' },
    { name: '<script>window.__EVIL_SKILL=1</script>', category: 'Core' },
  ],
  projects: [
    {
      title: 'High-Speed C++ <T> Engine',
      description: 'Zero-overhead abstractions for R&D systems. <img src=x onerror="window.__EVIL_PROJ_IMG=1">',
      tools: ['C++ <T>', 'R&D Tools'],
      metrics: '2.5M ops/sec with <script>window.__EVIL_METRIC=1</script>',
      githubUrl: 'javascript:window.__EVIL_PROJ_GIT=1',
      demoUrl: '//evil.com/fake-demo',
    },
  ],
  experience: [
    {
      role: 'Principal R&D Architect',
      company: 'Quantum Core Labs <script>window.__EVIL_EXP_CO=1</script>',
      period: '2021 - PRESENT',
      description: 'Building C++ <T> kernel modules with R&D telemetry.',
      companyUrl: 'javascript:window.__EVIL_EXP_URL=1',
      bullets: ['Scaled C++ <T> pipelines by 300%', 'Filed 3 R&D patents'],
    },
    {
      role: 'Staff Systems Architect',
      company: 'Vortex Cloud Inc',
      period: '2019 - 2021',
      description: 'Zero-copy kernel bypass networking.',
      companyUrl: '//evil.com/fake-company',
      bullets: ['DPDK pipeline optimization', 'Sub-microsecond latency'],
    },
    {
      role: 'Senior Kernel Engineer',
      company: 'Apex Systems',
      period: '2017 - 2019',
      description: 'eBPF observability infrastructure.',
      companyUrl: 'https://example.com/apex-systems',
      bullets: ['eBPF observability pipeline'],
    },
  ],
  education: [
    {
      degree: 'M.S. in Computer Science (R&D Track)',
      institution: 'ETH Zurich',
      period: '2018 - 2020',
      score: 'GPA 4.0 in C++ <T> Systems',
    },
  ],
  certifications: [
    {
      name: 'Advanced C++ <T> Certified Engineer',
      issuer: 'Systems Institute',
      date: '2022',
      credentialUrl: '//evil.com/fake-cert',
    },
  ],
  publications: [
    {
      title: 'Formal Verification of C++ <T> Templates in R&D Environments',
      publisher: 'IEEE Systems',
      date: '2023',
      award: 'Best R&D Paper',
      link: 'javascript:window.__EVIL_PUB_LINK=1',
    },
  ],
};

async function runSanitizationProof() {
  console.log('===============================================================');
  console.log('🛡️ Comprehensive Sanitization Proof & Output Surface Audit');
  console.log('===============================================================\n');

  let passedTests = 0;
  let totalTests = 5;

  // -------------------------------------------------------------------------
  // SURFACE 1: Direct sanitizeUrl & sanitizeHtmlText Validation
  // -------------------------------------------------------------------------
  console.log('--- TEST 1: URL Sanitization Protocol & Attack Vector Rejection ---');
  try {
    // Protocol-relative attack vectors
    assert.strictEqual(sanitizeUrl('//evil.com'), '#', 'Must reject //evil.com');
    assert.strictEqual(sanitizeUrl('//evil.com/path'), '#', 'Must reject //evil.com/path');
    assert.strictEqual(sanitizeUrl('/\\evil.com'), '#', 'Must reject /\\evil.com');
    assert.strictEqual(sanitizeUrl('\\evil.com'), '#', 'Must reject \\evil.com');
    assert.strictEqual(sanitizeUrl(' //evil.com '), '#', 'Must reject trimmed //evil.com');

    // Script & Data execution vectors
    assert.strictEqual(sanitizeUrl('javascript:alert(1)'), '#', 'Must reject javascript:');
    assert.strictEqual(sanitizeUrl('JAVASCRIPT:alert(1)'), '#', 'Must reject case-insensitive javascript:');
    assert.strictEqual(sanitizeUrl('data:text/html,<script>alert(1)</script>'), '#', 'Must reject data: URLs');
    assert.strictEqual(sanitizeUrl('vbscript:msgbox(1)'), '#', 'Must reject vbscript:');
    assert.strictEqual(sanitizeUrl('"><svg onload=alert(1)>'), '#', 'Must reject svg breakout payload');
    assert.strictEqual(sanitizeUrl('<script>alert(1)</script>'), '#', 'Must reject script tag');

    // Valid URLs must be preserved
    assert.strictEqual(sanitizeUrl('https://github.com/user/repo'), 'https://github.com/user/repo');
    assert.strictEqual(sanitizeUrl('http://example.com/demo'), 'http://example.com/demo');
    assert.strictEqual(sanitizeUrl('mailto:test@example.com'), 'mailto:test@example.com');
    assert.strictEqual(sanitizeUrl('#projects'), '#projects');

    // Text escaping must preserve character semantics on output
    const escapedCode = sanitizeHtmlText('C++ <T> & R&D');
    assert.strictEqual(escapedCode, 'C++ &lt;T&gt; &amp; R&amp;D', 'Must escape brackets and ampersand');

    logPass('TEST 1: sanitizeUrl strictly rejects protocol-relative //host, javascript:, data:, and HTML injections while preserving safe URLs.');
    passedTests++;
  } catch (err) {
    logFail('TEST 1 failed', err);
  }

  // -------------------------------------------------------------------------
  // SURFACE 2: Static HTML ZIP Export Sanitization & Legitimate Text Output
  // -------------------------------------------------------------------------
  console.log('\n--- TEST 2: Static HTML Package Export Output Surface ---');
  try {
    const staticHtml = generateStaticHtml(maliciousPortfolio);

    // Verify dangerous strings are NOT present unescaped
    assert(!staticHtml.includes('<script>window.__EVIL_SCRIPT=1</script>'), 'Static export must not contain unescaped script tag');
    assert(!staticHtml.includes('<img src=x onerror='), 'Static export must not contain unescaped img onerror');
    assert(!staticHtml.includes('<svg onload='), 'Static export must not contain unescaped svg onload');
    assert(!staticHtml.includes('href="javascript:'), 'Static export must not contain javascript: href');
    assert(!staticHtml.includes('href="//evil.com'), 'Static export must not contain protocol-relative href');
    assert(!staticHtml.includes('href="data:text/html'), 'Static export must not contain data: href');

    // Verify legitimate text is preserved and properly escaped on output
    assert(staticHtml.includes('C++ &lt;T&gt;'), 'Static export must properly escape C++ <T> on output');
    assert(staticHtml.includes('R&amp;D'), 'Static export must properly escape R&D on output');

    logPass('TEST 2: Static HTML export safely escapes all malicious tags and dangerous URLs while cleanly rendering "C++ <T>" and "R&D".');
    passedTests++;
  } catch (err) {
    logFail('TEST 2 failed', err);
  }

  // -------------------------------------------------------------------------
  // SURFACE 3: Resume ATS HTML Export Output Surface
  // -------------------------------------------------------------------------
  console.log('\n--- TEST 3: Resume ATS HTML Export Output Surface ---');
  try {
    const resumeHtml = generateResumeHtml(maliciousPortfolio);

    // Verify dangerous strings are NOT present unescaped
    assert(!resumeHtml.includes('<script>window.__EVIL_SCRIPT=1</script>'), 'Resume must not contain unescaped script tag');
    assert(!resumeHtml.includes('<img src=x onerror='), 'Resume must not contain unescaped img onerror');
    assert(!resumeHtml.includes('<svg onload='), 'Resume must not contain unescaped svg onload');
    assert(!resumeHtml.includes('href="javascript:'), 'Resume must not contain javascript: href');

    // Verify legitimate text is preserved and properly escaped on output
    assert(resumeHtml.includes('C++ &lt;T&gt;'), 'Resume must properly escape C++ <T> on output');
    assert(resumeHtml.includes('R&amp;D'), 'Resume must properly escape R&D on output');

    logPass('TEST 3: Resume HTML export neutralizes malicious script/svg tags and properly escapes "C++ <T>" and "R&D" on output.');
    passedTests++;
  } catch (err) {
    logFail('TEST 3 failed', err);
  }

  // -------------------------------------------------------------------------
  // SURFACE 4: Server Input Ingestion & Non-Mangling of Legitimate Text
  // -------------------------------------------------------------------------
  console.log('\n--- TEST 4: Express Server Input Ingestion & Non-Mangling ---');
  let publishedSlug: string | null = null;
  let ownerToken: string | null = null;
  try {
    const isApiUp = await isPortOpen(API_PORT);
    if (!isApiUp) {
      console.log(`⚠️ API server on port ${API_PORT} not running. Starting test express server or skipping live fetch...`);
    }

    const res = await fetch(`http://localhost:${API_PORT}/api/portfolios`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(maliciousPortfolio),
    });

    const body = await res.json();
    assert.strictEqual(res.status, 201, `Expected HTTP 201, got ${res.status}`);
    publishedSlug = body.slug;
    ownerToken = body.ownerToken;
    assert(ownerToken, 'Owner token must be returned by publish endpoint');

    // Fetch the published data to verify server did NOT mangle C++ <T> or R&D
    const getRes = await fetch(`http://localhost:${API_PORT}/api/portfolios/${publishedSlug}`);
    const getBody = await getRes.json();
    assert.strictEqual(getRes.status, 200, `Expected HTTP 200, got ${getRes.status}`);

    const savedSkills = getBody.portfolio.skills || [];
    const cppSkill = savedSkills.find((s: any) => s.name.includes('C++'));
    assert(cppSkill, 'C++ skill must exist in saved portfolio');
    assert.strictEqual(cppSkill.name, 'C++ <T>', 'Server MUST preserve raw "C++ <T>" untouched without mangling');
    assert.strictEqual(cppSkill.category, 'R&D Competency', 'Server MUST preserve "R&D Competency" without mangling');

    logPass(`TEST 4: Server stored portfolio without mangling "C++ <T>" or "R&D" (slug: ${publishedSlug}).`);
    passedTests++;
  } catch (err) {
    logFail('TEST 4 failed', err);
  }

  // -------------------------------------------------------------------------
  // SURFACE 5: React Public Page & ALL 6 Link-Rendering Components
  // -------------------------------------------------------------------------
  console.log('\n--- TEST 5: React Public Page & ALL 6 Link-Rendering Components in Browser ---');
  console.log('Auditing link components: 1. Contact, 2. SelectedWorks, 3. Footer, 4. Experience, 5. Certifications/Publications, 6. About');
  if (publishedSlug) {
    try {
      const browser = await puppeteer.launch({
        executablePath: CHROME_PATH,
        headless: 'new',
        args: ['--no-sandbox', '--disable-gpu'],
      });

      const page = await browser.newPage();
      await page.setViewport({ width: 1280, height: 900 });

      // Navigate to the published portfolio public page
      await page.goto(`http://localhost:${CLIENT_PORT}/p/${publishedSlug}`, {
        waitUntil: 'domcontentloaded',
        timeout: 20000,
      });
      await page.waitForSelector('main', { timeout: 15000 });
      await new Promise((r) => setTimeout(r, 800));

      // 1. Verify ZERO XSS payloads executed in window context
      const xssExecutionResults = await page.evaluate(() => {
        return {
          evilScript: (window as any).__EVIL_SCRIPT,
          evilImg: (window as any).__EVIL_IMG,
          evilSvg: (window as any).__EVIL_SVG,
          evilJsGit: (window as any).__EVIL_JS_GIT,
          evilTwit: (window as any).__EVIL_TWIT,
          evilSkill: (window as any).__EVIL_SKILL,
          evilProjImg: (window as any).__EVIL_PROJ_IMG,
          evilProjGit: (window as any).__EVIL_PROJ_GIT,
          evilExpCo: (window as any).__EVIL_EXP_CO,
          evilExpUrl: (window as any).__EVIL_EXP_URL,
          evilPubLink: (window as any).__EVIL_PUB_LINK,
        };
      });

      for (const [key, val] of Object.entries(xssExecutionResults)) {
        assert.strictEqual(val, undefined, `XSS payload "${key}" MUST NOT have executed in DOM!`);
      }

      // 2. Audit ALL 6 Link Components: inspect all <a> elements inside each component section
      const linkAudit: any = await page.evaluate(`(() => {
        function checkHrefs(selector) {
          const section = document.querySelector(selector);
          if (!section) return { found: false, links: [] };
          const anchors = Array.from(section.querySelectorAll('a'));
          return {
            found: true,
            links: anchors.map((a) => ({
              text: a.innerText.trim(),
              href: a.getAttribute('href') || '',
            })),
          };
        }

        return {
          contact: checkHrefs('#contact'),
          selectedWorks: checkHrefs('#projects'),
          footer: checkHrefs('footer'),
          experience: checkHrefs('#experience') || checkHrefs('#services'),
          certificationsPublications: checkHrefs('#credentials'),
          about: checkHrefs('#about'),
        };
      })()`);

      // Verify each component is present and free of malicious hrefs
      for (const [componentName, data] of Object.entries(linkAudit)) {
        assert(data.found, `Component "${componentName}" must be present in DOM`);
        for (const link of data.links) {
          const href = link.href.toLowerCase();
          assert(
            !href.startsWith('javascript:'),
            `Component "${componentName}" contains dangerous javascript: link "${link.href}"`
          );
          assert(
            !href.startsWith('data:'),
            `Component "${componentName}" contains dangerous data: link "${link.href}"`
          );
          assert(
            !href.startsWith('//evil.com') && !href.startsWith('http://evil.com') && !href.startsWith('https://evil.com'),
            `Component "${componentName}" contains unsanitized evil.com link "${link.href}"`
          );
        }
      }

      console.log('  -> Audited link components summary:');
      console.log(`     • Contact links checked: ${linkAudit.contact.links.length}`);
      console.log(`     • SelectedWorks links checked: ${linkAudit.selectedWorks.links.length}`);
      console.log(`     • Footer links checked: ${linkAudit.footer.links.length}`);
      console.log(`     • Experience links checked: ${linkAudit.experience.links.length}`);
      console.log(`     • Certifications/Publications links checked: ${linkAudit.certificationsPublications.links.length}`);
      console.log(`     • About links checked: ${linkAudit.about.links.length}`);

      assert(linkAudit.experience.links.length > 0, 'Experience section must have checked links > 0');

      await browser.close();

      logPass('TEST 5: React public page successfully neutralizes all XSS injection vectors across ALL 6 link-rendering components in the browser.');
      passedTests++;
    } catch (err) {
      logFail('TEST 5 failed', err);
    }
  } else {
    console.log('Skipping TEST 5 browser audit due to TEST 4 failure.');
  }

  console.log('\n===============================================================');
  console.log(`Summary: ${passedTests}/${totalTests} sanitization surfaces verified.`);
  console.log('===============================================================\n');

  if (passedTests < totalTests) {
    process.exit(1);
  }
}

runSanitizationProof().catch((e) => {
  console.error(e);
  process.exit(1);
});
