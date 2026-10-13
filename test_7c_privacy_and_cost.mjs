/**
 * Phase 7c Verification: Privacy Toggles & OpenAI Cost Caps
 */

import http from 'http';
import { portfolioStorage } from './server/services/portfolioStorage.ts';
import { aiRateLimiter } from './server/services/aiRateLimiter.ts';
import { normalizePortfolioData } from './src/types/portfolioSchema.ts';
import { generateStaticHtml } from './src/services/staticExport.ts';

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    process.exit(1);
  }
  console.log(`✔ PASS: ${message}`);
}

async function runTests() {
  console.log('===============================================================');
  console.log('🔒 Phase 7c Privacy & Cost Controls Verification Suite');
  console.log('===============================================================');

  // TEST 1: Schema normalization & defaults
  const defaultNorm = normalizePortfolioData({ name: 'Test Engineer' });
  assert(defaultNorm.hidePhone === false, 'Default hidePhone is false');
  assert(defaultNorm.hideEmail === false, 'Default hideEmail is false');
  assert(defaultNorm.noIndex === false, 'Default noIndex is false');

  const privateNorm = normalizePortfolioData({
    name: 'Private Engineer',
    email: 'private@test.io',
    phone: '+1 555-0199',
    hidePhone: true,
    hideEmail: true,
    noIndex: true,
  });
  assert(privateNorm.hidePhone === true, 'hidePhone parses true');
  assert(privateNorm.hideEmail === true, 'hideEmail parses true');
  assert(privateNorm.noIndex === true, 'noIndex parses true');
  assert(privateNorm.privacy.hidePhone === true, 'nested privacy.hidePhone matches');

  // TEST 2: Static Export includes noindex meta and scrubs email
  const staticHtml = generateStaticHtml(privateNorm);
  assert(
    staticHtml.includes('<meta name="robots" content="noindex, nofollow" />'),
    'Static HTML export includes robots noindex meta tag'
  );
  assert(
    !staticHtml.includes('mailto:private@test.io'),
    'Static HTML export does not leak mailto link when hideEmail is true'
  );

  // TEST 3: SQLite Storage & Public Route Sanitization
  const testSlug = 'privatetest7c' + Date.now().toString(36);
  const testOwnerTokenHash = 'testhash7c1234567890abcdef';
  await portfolioStorage.save(testSlug, testOwnerTokenHash, privateNorm);

  const storedRecord = await portfolioStorage.get(testSlug);
  assert(storedRecord !== null, 'Saved private portfolio in SQLite');
  assert(storedRecord.data.phone === '+1 555-0199', 'Database preserves raw phone for owner');
  assert(storedRecord.data.email === 'private@test.io', 'Database preserves raw email for owner');

  // Test Public Endpoint scrubbing via API
  const testPort = 5008;
  const { default: express } = await import('express');
  const { portfoliosRouter } = await import('./server/routes/portfolios.ts');
  const app = express();
  app.use(express.json());
  app.use('/api/portfolios', portfoliosRouter);

  const server = app.listen(testPort);

  try {
    const res = await fetch(`http://127.0.0.1:${testPort}/api/portfolios/${testSlug}`);
    const data = await res.json();
    assert(data.success === true, 'Fetched portfolio via public GET');
    assert(data.portfolio.phone === '', 'Public GET scrubs phone when hidePhone is true');
    assert(data.portfolio.email === '', 'Public GET scrubs email when hideEmail is true');
    assert(data.portfolio.hidePhone === true, 'Public GET preserves hidePhone boolean flag');
    assert(data.portfolio.hideEmail === true, 'Public GET preserves hideEmail boolean flag');
    assert(data.portfolio.noIndex === true, 'Public GET preserves noIndex boolean flag');
    assert(!('ownerTokenHash' in data.portfolio), 'Owner token hash is strictly stripped');
  } finally {
    server.close();
    await portfolioStorage.delete(testSlug);
  }

  // TEST 4: OpenAI Rate Limiter Caps & Offline Fallback
  aiRateLimiter._resetForTesting();
  const testIp = '192.168.1.100';

  // Consume up to IP cap (default 20, or override via env)
  process.env.OPENAI_DAILY_CAP_IP = '2';
  const q1 = aiRateLimiter.consumeQuota(testIp);
  assert(q1.allowed === true, 'First quota request allowed');

  const q2 = aiRateLimiter.consumeQuota(testIp);
  assert(q2.allowed === true, 'Second quota request allowed');

  const q3 = aiRateLimiter.consumeQuota(testIp);
  assert(q3.allowed === false, 'Third quota request rejected by per-IP cap');
  assert(q3.reason === 'ip', 'Quota rejection reason is ip');

  const friendlyMsg = aiRateLimiter.getFriendlyCapMessage(q3.reason, q3.limit);
  assert(
    friendlyMsg.includes('Daily personal AI generation limit reached'),
    'Friendly cap message correctly generated'
  );

  // Test global cap
  process.env.OPENAI_DAILY_CAP_IP = '20';
  process.env.OPENAI_DAILY_CAP_GLOBAL = '1';
  aiRateLimiter._resetForTesting();

  const g1 = aiRateLimiter.consumeQuota('10.0.0.1');
  assert(g1.allowed === true, 'First global request allowed');

  const g2 = aiRateLimiter.consumeQuota('10.0.0.2');
  assert(g2.allowed === false, 'Second global request rejected by global cap');
  assert(g2.reason === 'global', 'Quota rejection reason is global');

  // Cleanup test env
  delete process.env.OPENAI_DAILY_CAP_IP;
  delete process.env.OPENAI_DAILY_CAP_GLOBAL;
  aiRateLimiter._resetForTesting();

  console.log('===============================================================');
  console.log('🎉 ALL PHASE 7c PRIVACY & COST VERIFICATIONS PASSED (100%)');
  console.log('===============================================================');
}

runTests().catch((err) => {
  console.error('Test error:', err);
  process.exit(1);
});
