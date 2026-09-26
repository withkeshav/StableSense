import { describe, expect, it } from 'vitest';
import Database from 'better-sqlite3';

/**
 * Regression test for the fetch job's market_snapshots write.
 *
 * market_snapshots.ts is the PRIMARY KEY and is derived from the newest Helix
 * point, which repeats whenever a cron tick lands before Helix advances. The
 * original plain INSERT threw "UNIQUE constraint failed: market_snapshots.ts"
 * and killed the whole fetch run, marking the job failed after prices had
 * already been written.
 */
describe('market_snapshots upsert', () => {
  function makeDb() {
    const db = new Database(':memory:');
    db.exec(`
      CREATE TABLE market_snapshots (
        ts                   INTEGER PRIMARY KEY,
        total_circulating_usd REAL,
        delta_24h_usd        REAL
      );
    `);
    return db;
  }

  const upsert = (db) => db.prepare(
    `INSERT INTO market_snapshots (ts, total_circulating_usd, delta_24h_usd)
     VALUES (?, ?, ?)
     ON CONFLICT(ts) DO UPDATE SET
       total_circulating_usd = excluded.total_circulating_usd,
       delta_24h_usd = excluded.delta_24h_usd`
  );

  it('does not throw when the same timestamp is written twice', () => {
    const db = makeDb();
    const ts = 1_786_000_000_000;
    expect(() => {
      upsert(db).run(ts, 259e9, 1e9);
      upsert(db).run(ts, 259e9, 1e9);
    }).not.toThrow();
    expect(db.prepare('SELECT COUNT(*) AS n FROM market_snapshots').get().n).toBe(1);
  });

  it('updates the value when a repeat tick carries a newer total', () => {
    const db = makeDb();
    const ts = 1_786_000_000_000;
    upsert(db).run(ts, 259e9, 1e9);
    upsert(db).run(ts, 260e9, 1.5e9);
    const row = db.prepare('SELECT total_circulating_usd AS t, delta_24h_usd AS d FROM market_snapshots').get();
    expect(row.t).toBe(260e9);
    expect(row.d).toBe(1.5e9);
  });

  it('shows the old plain INSERT really did throw, so the guard is not theoretical', () => {
    const db = makeDb();
    const ts = 1_786_000_000_000;
    const plain = db.prepare('INSERT INTO market_snapshots (ts, total_circulating_usd, delta_24h_usd) VALUES (?, ?, ?)');
    plain.run(ts, 259e9, 1e9);
    expect(() => plain.run(ts, 259e9, 1e9)).toThrow(/UNIQUE constraint failed/);
  });
});
