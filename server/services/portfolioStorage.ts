import { DatabaseSync } from 'node:sqlite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface PortfolioRecord {
  slug: string;
  ownerTokenHash: string;
  data: any;
  publishedAt: string;
  updatedAt: string;
}

export interface IPortfolioStorage {
  get(slug: string): Promise<PortfolioRecord | null>;
  save(
    slug: string,
    ownerTokenHash: string,
    data: any,
    publishedAt?: string,
    updatedAt?: string
  ): Promise<PortfolioRecord>;
  update(
    slug: string,
    ownerTokenHash: string,
    data: any
  ): Promise<PortfolioRecord | null>;
  delete(slug: string): Promise<boolean>;
  exists(slug: string): Promise<boolean>;
  migrateFromJsonFiles(directoryPath?: string): Promise<number>;
  close(): void;
}

export class SqlitePortfolioStorage implements IPortfolioStorage {
  private db: DatabaseSync;
  private dbPath: string;

  constructor(customDbPath?: string) {
    const dataDir = path.resolve(__dirname, '../../server/data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    this.dbPath = customDbPath || process.env.SQLITE_DB_PATH || path.join(dataDir, 'portfolios.db');
    this.db = new DatabaseSync(this.dbPath);

    this.initTables();
    this.autoMigrateLegacyJson();
  }

  private initTables(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS portfolios (
        slug TEXT PRIMARY KEY,
        owner_token_hash TEXT NOT NULL,
        data_json TEXT NOT NULL,
        published_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_portfolios_published_at ON portfolios(published_at);
    `);
  }

  private autoMigrateLegacyJson(): void {
    const legacyDir = path.resolve(__dirname, '../../server/data/portfolios');
    if (fs.existsSync(legacyDir)) {
      try {
        this.migrateFromJsonFilesSync(legacyDir);
      } catch (err: any) {
        console.warn('[Storage Migration Warning] Could not migrate legacy JSON portfolios:', err?.message || err);
      }
    }
  }

  public async get(slug: string): Promise<PortfolioRecord | null> {
    const stmt = this.db.prepare(
      `SELECT slug, owner_token_hash, data_json, published_at, updated_at FROM portfolios WHERE slug = ?`
    );
    const row = stmt.get(slug) as any;
    if (!row) return null;

    try {
      const data = JSON.parse(row.data_json);
      return {
        slug: row.slug,
        ownerTokenHash: row.owner_token_hash,
        data,
        publishedAt: row.published_at,
        updatedAt: row.updated_at,
      };
    } catch (err) {
      console.error(`[Storage Error] Failed to parse JSON for slug ${slug}:`, err);
      return null;
    }
  }

  public async exists(slug: string): Promise<boolean> {
    const stmt = this.db.prepare(`SELECT 1 FROM portfolios WHERE slug = ?`);
    const row = stmt.get(slug);
    return !!row;
  }

  public async save(
    slug: string,
    ownerTokenHash: string,
    data: any,
    publishedAt?: string,
    updatedAt?: string
  ): Promise<PortfolioRecord> {
    const now = new Date().toISOString();
    const pub = publishedAt || now;
    const upd = updatedAt || now;
    const jsonString = typeof data === 'string' ? data : JSON.stringify(data);

    const stmt = this.db.prepare(`
      INSERT INTO portfolios (slug, owner_token_hash, data_json, published_at, updated_at)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(slug) DO UPDATE SET
        owner_token_hash = excluded.owner_token_hash,
        data_json = excluded.data_json,
        updated_at = excluded.updated_at
    `);

    stmt.run(slug, ownerTokenHash, jsonString, pub, upd);

    return {
      slug,
      ownerTokenHash,
      data: typeof data === 'string' ? JSON.parse(data) : data,
      publishedAt: pub,
      updatedAt: upd,
    };
  }

  public async update(
    slug: string,
    ownerTokenHash: string,
    data: any
  ): Promise<PortfolioRecord | null> {
    const existing = await this.get(slug);
    if (!existing) return null;

    const now = new Date().toISOString();
    return await this.save(slug, ownerTokenHash, data, existing.publishedAt, now);
  }

  public async delete(slug: string): Promise<boolean> {
    const stmt = this.db.prepare(`DELETE FROM portfolios WHERE slug = ?`);
    const result = stmt.run(slug);
    return (result as any).changes > 0;
  }

  public migrateFromJsonFilesSync(directoryPath?: string): number {
    const targetDir = directoryPath || path.resolve(__dirname, '../../server/data/portfolios');
    if (!fs.existsSync(targetDir)) return 0;

    let migrated = 0;
    const files = fs.readdirSync(targetDir);

    for (const file of files) {
      if (!file.endsWith('.json')) continue;
      const slug = path.basename(file, '.json');
      const filePath = path.join(targetDir, file);

      try {
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const record = JSON.parse(fileContent);

        const ownerTokenHash = record.ownerTokenHash || '';
        const publishedAt = record.publishedAt || new Date().toISOString();
        const updatedAt = record.updatedAt || publishedAt;

        // Strip internal server fields from the raw portfolio object if present
        const { ownerTokenHash: _h, ...portfolioData } = record;

        // Insert only if not already present in SQLite
        const stmt = this.db.prepare(`SELECT 1 FROM portfolios WHERE slug = ?`);
        const existing = stmt.get(slug);
        if (!existing && ownerTokenHash) {
          const insertStmt = this.db.prepare(`
            INSERT INTO portfolios (slug, owner_token_hash, data_json, published_at, updated_at)
            VALUES (?, ?, ?, ?, ?)
          `);
          insertStmt.run(slug, ownerTokenHash, JSON.stringify(portfolioData), publishedAt, updatedAt);
          migrated++;
        }
      } catch (err) {
        console.warn(`[Storage Migration Warning] Failed to migrate ${file}:`, err);
      }
    }

    if (migrated > 0) {
      console.log(`[Storage] Migrated ${migrated} legacy JSON portfolio(s) into SQLite.`);
    }

    return migrated;
  }

  public async migrateFromJsonFiles(directoryPath?: string): Promise<number> {
    return this.migrateFromJsonFilesSync(directoryPath);
  }

  public close(): void {
    try {
      this.db.close();
    } catch {}
  }
}

// Export default singleton instance
export const portfolioStorage: IPortfolioStorage = new SqlitePortfolioStorage();
