import assert from 'assert';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { SqlitePortfolioStorage } from './server/services/portfolioStorage.ts';

async function testSqliteStorage() {
  console.log('Testing 7b SQLite Storage and Migration...');

  const testDbPath = path.resolve('scratch/test_portfolios.db');
  if (fs.existsSync(testDbPath)) fs.unlinkSync(testDbPath);

  const storage = new SqlitePortfolioStorage(testDbPath);

  // 1. Test Save & Get
  const testSlug = 'sqlite-test-slug';
  const ownerToken = 'secret-token-12345';
  const ownerTokenHash = crypto.createHash('sha256').update(ownerToken).digest('hex');
  const testData = { name: 'Sharvil Naikwade', role: 'student', skills: ['TypeScript', 'SQLite'] };

  const saved = await storage.save(testSlug, ownerTokenHash, testData);
  assert.strictEqual(saved.slug, testSlug);
  console.log('✅ [PASS] save() stored record in SQLite');

  const retrieved = await storage.get(testSlug);
  assert.ok(retrieved, 'get() must return stored record');
  assert.strictEqual(retrieved.slug, testSlug);
  assert.strictEqual(retrieved.ownerTokenHash, ownerTokenHash);
  assert.strictEqual(retrieved.data.name, 'Sharvil Naikwade');
  console.log('✅ [PASS] get() retrieved record accurately');

  // 2. Test Update
  const updatedData = { ...testData, tagline: 'Autonomous Systems Engineer' };
  const updated = await storage.update(testSlug, ownerTokenHash, updatedData);
  assert.ok(updated);
  assert.strictEqual(updated.data.tagline, 'Autonomous Systems Engineer');

  const checkUpdated = await storage.get(testSlug);
  assert.strictEqual(checkUpdated.data.tagline, 'Autonomous Systems Engineer');
  console.log('✅ [PASS] update() modified record in SQLite');

  // 3. Test Migration of JSON files
  const mockJsonDir = path.resolve('scratch/mock_legacy_portfolios');
  if (!fs.existsSync(mockJsonDir)) fs.mkdirSync(mockJsonDir, { recursive: true });

  const legacySlug = 'legacy-migrated-slug';
  const legacyTokenHash = crypto.createHash('sha256').update('legacy-token').digest('hex');
  fs.writeFileSync(
    path.join(mockJsonDir, `${legacySlug}.json`),
    JSON.stringify({
      slug: legacySlug,
      ownerTokenHash: legacyTokenHash,
      name: 'Legacy User',
      skills: ['C++'],
      publishedAt: '2026-01-01T00:00:00.000Z',
    })
  );

  const count = await storage.migrateFromJsonFiles(mockJsonDir);
  assert.strictEqual(count, 1, 'Should have migrated 1 file');

  const migratedRecord = await storage.get(legacySlug);
  assert.ok(migratedRecord, 'Migrated record must exist in SQLite');
  assert.strictEqual(migratedRecord.slug, legacySlug);
  assert.strictEqual(migratedRecord.data.name, 'Legacy User');
  console.log('✅ [PASS] migrateFromJsonFiles() imported legacy JSON portfolio');

  // 4. Test Idempotency of Migration
  const countAgain = await storage.migrateFromJsonFiles(mockJsonDir);
  assert.strictEqual(countAgain, 0, 'Second migration run should migrate 0 files');
  console.log('✅ [PASS] Migration is idempotent');

  // 5. Test Delete
  const deleted = await storage.delete(testSlug);
  assert.strictEqual(deleted, true);
  const checkDeleted = await storage.get(testSlug);
  assert.strictEqual(checkDeleted, null);
  console.log('✅ [PASS] delete() removed record from SQLite');

  storage.close();
  if (fs.existsSync(testDbPath)) fs.unlinkSync(testDbPath);
  fs.rmSync(mockJsonDir, { recursive: true, force: true });

  // 6. Verify Git Ignore for SQLite
  const gitignore = fs.readFileSync('.gitignore', 'utf-8');
  assert.ok(gitignore.includes('*.db'), '.gitignore must ignore *.db');
  assert.ok(gitignore.includes('*.sqlite'), '.gitignore must ignore *.sqlite');
  console.log('✅ [PASS] .gitignore strictly keeps database files out of git');

  console.log('\n🎉 ALL 7B SQLITE STORAGE TESTS PASSED!');
}

testSqliteStorage().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
