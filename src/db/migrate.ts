import { pool } from './index';
import * as fs from 'fs';
import * as path from 'path';

const TRACKING_TABLE = 'schema_migrations';

const ensureTrackingTable = async (): Promise<void> => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS ${TRACKING_TABLE} (
      id          SERIAL PRIMARY KEY,
      filename    VARCHAR(255) NOT NULL UNIQUE,
      applied_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
    );
  `);
};

const getAppliedMigrations = async (): Promise<Set<string>> => {
  const result = await pool.query(`SELECT filename FROM ${TRACKING_TABLE}`);
  return new Set(result.rows.map((row: { filename: string }) => row.filename));
};

const runMigrations = async () => {
  await ensureTrackingTable();

  const applied = await getAppliedMigrations();

  const migrationsDir = path.join(__dirname, 'migrations');
  const files = fs.readdirSync(migrationsDir)
    .filter((file) => file.endsWith('.sql'))
    .sort();

  if (files.length === 0) {
    console.log('No migration files found.');
    return;
  }

  const pending = files.filter((file) => !applied.has(file));

  if (pending.length === 0) {
    console.log('All migrations already applied. Nothing to do.');
    return;
  }

  console.log(`Found ${pending.length} pending migration(s). Running...`);

  for (const file of pending) {
    const filePath = path.join(migrationsDir, file);
    const sql = fs.readFileSync(filePath, 'utf-8');

    const client = await pool.connect();

    try {
      await client.query('BEGIN');
      await client.query(sql);
      await client.query(
        `INSERT INTO ${TRACKING_TABLE} (filename) VALUES ($1)`,
        [file]
      );
      await client.query('COMMIT');
      console.log(`  ✓ ${file} applied successfully.`);
    } catch (err) {
      await client.query('ROLLBACK');
      console.error(`  ✗ ${file} failed:`, err);
      process.exit(1);
    } finally {
      client.release();
    }
  }

  console.log('All migrations applied.');
};

runMigrations()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Migration runner failed:', err);
    process.exit(1);
  });
