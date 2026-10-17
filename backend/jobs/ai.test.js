import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import Database from 'better-sqlite3';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

/**
 * Coverage for buildContext() in backend/jobs/ai.js.
 *
 * buildContext builds the user message sent to the model, so a silent change in
 * its formatting changes what every generated narrative is grounded in. It now
 * takes an injectable data source (default: the module-level db), which lets
 * these tests drive it from a deterministic in-memory database with fixed epoch
 * millisecond timestamps.
 *
 * Schema note: the DDL below mirrors the column definitions of every table
 * buildContext reads in backend/lib/db.js. Only the indexes are omitted (row
 * counts here are single digits and every query has an explicit ORDER BY, so
 * results cannot depend on index choice). Column names and NOT NULL constraints
 * are deliberately copied so a query edit that touches a renamed or missing
 * column fails here rather than in production.
 *
 * Isolation note: this file sets DATA_DIR to a throwaway temp directory before
 * importing the job, so importing it creates its module-level SQLite file there
 * and never reads or writes the repository or deployed data file.
 */

const SCHEMA = `
CREATE TABLE market_snapshots (
  ts                    INTEGER PRIMARY KEY,
  total_circulating_usd REAL,
  delta_24h_usd         REAL
);

CREATE TABLE snapshots (
  coin            TEXT    NOT NULL,
  chain           TEXT    NOT NULL,
  ts              INTEGER NOT NULL,
  circulating_usd REAL    NOT NULL,
  delta_24h_usd   REAL,
  PRIMARY KEY (coin, chain, ts)
) WITHOUT ROWID;

CREATE TABLE prices (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  coin           TEXT    NOT NULL,
  ts             INTEGER NOT NULL,
  price          REAL,
  change_24h     REAL,
  volume_24h_usd REAL
);

CREATE TABLE stress_series (
  ts               INTEGER NOT NULL,
  symbol           TEXT    NOT NULL,
  peg_stress_index REAL    NOT NULL,
  z_score          REAL    NOT NULL,
  raw_delta        REAL    NOT NULL,
  normalized_delta REAL    NOT NULL,
  PRIMARY KEY (ts, symbol)
) WITHOUT ROWID;

CREATE TABLE labels (
  ts          INTEGER NOT NULL,
  symbol      TEXT    NOT NULL,
  alert_type  TEXT    NOT NULL,
  severity    TEXT    NOT NULL,
  explanation TEXT    NOT NULL,
  magnitude   REAL,
  PRIMARY KEY (ts, symbol, alert_type)
) WITHOUT ROWID;

CREATE TABLE alert_events (
  event_id           TEXT PRIMARY KEY,
  rule               TEXT    NOT NULL,
  classification     TEXT    NOT NULL,
  symbol             TEXT    NOT NULL,
  severity           TEXT    NOT NULL,
  state              TEXT    NOT NULL,
  headline           TEXT    NOT NULL,
  explanation        TEXT    NOT NULL,
  magnitude          REAL,
  gross_flow         REAL,
  net_supply_delta   REAL,
  source_ts_current  INTEGER,
  source_ts_previous INTEGER,
  interval_hours     REAL,
  interval_label     TEXT,
  observed_at        INTEGER,
  detected_at        INTEGER,
  published_at       INTEGER,
  involved_chains    TEXT,
  provenance         TEXT,
  confidence         TEXT,
  cadence_valid      INTEGER,
  updated_at         INTEGER NOT NULL
);

CREATE TABLE intelligence (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  ts           INTEGER NOT NULL,
  headline     TEXT,
  narrative    TEXT,
  implications TEXT,
  model        TEXT,
  meta         TEXT
);

CREATE TABLE job_runs (
  job         TEXT PRIMARY KEY,
  run_id      TEXT    NOT NULL,
  started_at  INTEGER NOT NULL,
  finished_at INTEGER,
  ok          INTEGER NOT NULL DEFAULT 0,
  error       TEXT,
  source_ts   INTEGER
);
`;

// Fixed epoch milliseconds. T0 is the newest cycle, T_OLD one day earlier.
const T0 = 1_700_000_000_000;
const T_OLD = T0 - 86_400_000;

const NO_EVENTS_LINE =
  'No persisted alert events yet. The event log starts empty until the first stress job writes rows.';

// buildContext is imported dynamically so DATA_DIR is set first. A static import
// would be hoisted and evaluate lib/db.js against the default data directory.
let buildContext;
let moduleDb;
let tempDir;
let moduleNamespace;

const openDbs = [];

function freshDb() {
  const db = new Database(':memory:');
  db.exec(SCHEMA);
  openDbs.push(db);
  return db;
}

function addMarket(db, ts, total, delta) {
  db.prepare('INSERT INTO market_snapshots (ts, total_circulating_usd, delta_24h_usd) VALUES (?, ?, ?)').run(ts, total, delta);
}

function addChain(db, coin, chain, ts, usd, delta = 0) {
  db.prepare(
    'INSERT INTO snapshots (coin, chain, ts, circulating_usd, delta_24h_usd) VALUES (?, ?, ?, ?, ?)'
  ).run(coin, chain, ts, usd, delta);
}

function addPrice(db, coin, ts, price, change = null) {
  db.prepare('INSERT INTO prices (coin, ts, price, change_24h) VALUES (?, ?, ?, ?)').run(coin, ts, price, change);
}

function addStress(db, symbol, ts, psi, z, normalized) {
  db.prepare(
    'INSERT INTO stress_series (ts, symbol, peg_stress_index, z_score, raw_delta, normalized_delta) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(ts, symbol, psi, z, 0, normalized);
}

function addLabel(db, ts, symbol, alertType, severity, explanation) {
  db.prepare(
    'INSERT INTO labels (ts, symbol, alert_type, severity, explanation) VALUES (?, ?, ?, ?, ?)'
  ).run(ts, symbol, alertType, severity, explanation);
}

function addEvent(db, { id, symbol, rule, severity, state, headline, detectedAt }) {
  db.prepare(
    `INSERT INTO alert_events
       (event_id, rule, classification, symbol, severity, state, headline, explanation, detected_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(id, rule, `${symbol}_${rule}`, symbol, severity, state, headline, `${headline} (detail)`, detectedAt, T0);
}

beforeAll(async () => {
  tempDir = mkdtempSync(path.join(tmpdir(), 'stablesense-ai-test-'));
  process.env.DATA_DIR = tempDir;
  const mod = await import('./ai.js');
  moduleNamespace = mod;
  buildContext = mod.buildContext;
  moduleDb = (await import('../lib/db.js')).default;
});

afterEach(() => {
  while (openDbs.length) openDbs.pop().close();
});

afterAll(() => {
  try {
    moduleDb?.close();
  } finally {
    if (tempDir) rmSync(tempDir, { recursive: true, force: true });
  }
});

describe('buildContext: default path stays the module-level db', () => {
  it('defaults to the module db, which import pointed at the isolated DATA_DIR', () => {
    // Nothing has been written yet, so the default call must report the empty
    // event log rather than a real market reading.
    expect(buildContext()).toBe(NO_EVENTS_LINE);

    addMarket(moduleDb, T0, 259e9, 1.5e9);
    expect(buildContext()).toBe(
      ['Total stablecoin market cap: $259.00B (24h +$1.50B)', NO_EVENTS_LINE].join('\n')
    );
  });

  it('exports buildContext and does not run the CLI body on import', () => {
    expect(typeof buildContext).toBe('function');
    expect(Object.keys(moduleNamespace)).toEqual(['buildContext']);
    // The CLI body would have started a job run and, with OPENAI_API_KEY unset,
    // called process.exit(1). Neither the job marker nor a narrative exists.
    expect(moduleDb.prepare('SELECT COUNT(*) AS n FROM job_runs').get().n).toBe(0);
    expect(moduleDb.prepare('SELECT COUNT(*) AS n FROM intelligence').get().n).toBe(0);
  });
});

describe('buildContext: market cap line', () => {
  it('assembles the full context line by line from seeded rows', () => {
    const db = freshDb();
    addMarket(db, T0, 259e9, 1.5e9);
    addMarket(db, T_OLD, 100e9, -5e9);

    addChain(db, 'USDT', 'Ethereum', T0, 100e9, 1e9);
    addChain(db, 'USDT', 'Tron', T0, 60e9, 500e6);
    addChain(db, 'USDT', 'Solana', T0, 5e9, 0);
    addChain(db, 'USDT', 'Avalanche', T0, 2e9, -250e6);
    addChain(db, 'USDT', 'OldChain', T_OLD, 999e9, 9e9);

    addChain(db, 'USDC', 'Ethereum', T0, 30e9, null);
    addChain(db, 'USDC', 'Base', T0, 4e9, 100e6);

    // PYUSD has supply rows but no price row, so its spot must read n/a.
    addChain(db, 'PYUSD', 'Ethereum', T0, 1e9, 5e6);

    addPrice(db, 'USDT', T0, 1.0002, 0.01);
    addPrice(db, 'USDT', T_OLD, 0.5, 9.9);
    addPrice(db, 'USDC', T0, 0.9998, null);

    addStress(db, 'USDT', T0, 12.34, 1.34, -0.5678);
    addStress(db, 'USDT', T_OLD, 99.9, 9.9, 9.9);

    // Newest open event is second in insertion order, so this also pins ordering.
    addEvent(db, {
      id: 'ev-usdt-spike',
      symbol: 'USDT',
      rule: 'chain_spike',
      severity: 'warn',
      state: 'open',
      headline: 'USDT Ethereum supply spiked',
      detectedAt: T0 + 500_000,
    });
    addEvent(db, {
      id: 'ev-usdc-peg',
      symbol: 'USDC',
      rule: 'peg_drift',
      severity: 'info',
      state: 'open',
      headline: 'USDC peg drifted 3 bps',
      detectedAt: T0 + 600_000,
    });
    addEvent(db, {
      id: 'ev-usdt-resolved',
      symbol: 'USDT',
      rule: 'peg_break',
      severity: 'critical',
      state: 'resolved',
      headline: 'USDT peg break resolved',
      detectedAt: T0 + 700_000,
    });

    const expected = [
      'Total stablecoin market cap: $259.00B (24h +$1.50B)',
      'USDT: total $167.00B. Top chains: Ethereum $100.00B (+$1000M 24h); Tron $60.00B (+$500M 24h); Solana $5.00B (+$0M 24h). Spot $1.0002 (0.01% 24h).',
      'USDC: total $34.00B. Top chains: Ethereum $30.00B (n/a 24h); Base $4.00B (+$100M 24h). Spot $0.9998 (n/a% 24h).',
      'PYUSD: total $1.00B. Top chains: Ethereum $1.00B (+$5M 24h). Spot n/a.',
      'USDT stress: Peg Stress Index 12.34/100, z-score 1.3sigma, normalized delta -0.57%.',
      'Recent alerts:',
      '- USDC peg_drift (info): USDC peg drifted 3 bps',
      '- USDT chain_spike (warn): USDT Ethereum supply spiked',
    ].join('\n');

    expect(buildContext(db)).toBe(expected);
  });

  it('prints a negative market delta as a minus after the dollar sign', () => {
    const db = freshDb();
    addMarket(db, T0, 259e9, -12.5e9);
    expect(buildContext(db)).toBe(
      ['Total stablecoin market cap: $259.00B (24h $-12.50B)', NO_EVENTS_LINE].join('\n')
    );
  });

  it('prints n/a when the 24h market delta is null', () => {
    const db = freshDb();
    addMarket(db, T0, 259e9, null);
    expect(buildContext(db).split('\n')[0]).toBe('Total stablecoin market cap: $259.00B (24h n/a)');
  });

  it('uses only the newest market_snapshots row', () => {
    const db = freshDb();
    addMarket(db, T_OLD, 300e9, 9e9);
    addMarket(db, T0, 259e9, 1.5e9);
    expect(buildContext(db).split('\n')[0]).toBe('Total stablecoin market cap: $259.00B (24h +$1.50B)');
  });

  it('omits the market cap line when market_snapshots is empty', () => {
    const db = freshDb();
    const out = buildContext(db);
    expect(out).not.toContain('Total stablecoin market cap');
    expect(out).toBe(NO_EVENTS_LINE);
  });
});

describe('buildContext: per-coin chain lines', () => {
  it('returns exactly the no-events line for an empty database', () => {
    expect(buildContext(freshDb())).toBe(NO_EVENTS_LINE);
  });

  it('skips a coin that has no snapshot rows', () => {
    const db = freshDb();
    addChain(db, 'USDT', 'Ethereum', T0, 100e9, 1e9);
    const out = buildContext(db);
    expect(out).toContain('USDT: total $100.00B.');
    expect(out).not.toContain('DAI:');
    expect(out).not.toContain('USDC:');
    expect(out).not.toContain('USDE:');
    expect(out).not.toContain('PYUSD:');
    // One line for USDT plus the empty-event-log line.
    expect(out.split('\n')).toHaveLength(2);
  });

  it('reads only the newest snapshots ts for each coin', () => {
    const db = freshDb();
    addChain(db, 'USDT', 'Ethereum', T0, 100e9, 1e9);
    addChain(db, 'USDT', 'LegacyChain', T_OLD, 999e9, 9e9);
    const out = buildContext(db);
    expect(out).toContain('USDT: total $100.00B.');
    expect(out).not.toContain('LegacyChain');
  });

  it('totals every chain row returned by the 5-row query but names only the top 3', () => {
    const db = freshDb();
    addChain(db, 'USDT', 'ChainA', T0, 5e9);
    addChain(db, 'USDT', 'ChainB', T0, 4e9);
    addChain(db, 'USDT', 'ChainC', T0, 3e9);
    addChain(db, 'USDT', 'ChainD', T0, 2e9);
    addChain(db, 'USDT', 'ChainE', T0, 1e9);
    const line = buildContext(db).split('\n')[0];
    expect(line).toContain('USDT: total $15.00B.');
    expect(line).toContain('ChainA $5.00B (+$0M 24h); ChainB $4.00B (+$0M 24h); ChainC $3.00B (+$0M 24h)');
    expect(line).not.toContain('ChainD');
    expect(line).not.toContain('ChainE');
  });

  it('caps the per-coin chain query at 5 rows, dropping the smallest', () => {
    const db = freshDb();
    addChain(db, 'USDT', 'ChainF', T0, 6e9);
    addChain(db, 'USDT', 'ChainE', T0, 5e9);
    addChain(db, 'USDT', 'ChainD', T0, 4e9);
    addChain(db, 'USDT', 'ChainC', T0, 3e9);
    addChain(db, 'USDT', 'ChainB', T0, 2e9);
    addChain(db, 'USDT', 'ChainA', T0, 1e9);
    const line = buildContext(db).split('\n')[0];
    expect(line).toContain('USDT: total $20.00B.');
    expect(line).not.toContain('ChainA');
  });

  it('prints n/a for a null per-chain 24h delta', () => {
    const db = freshDb();
    addChain(db, 'USDT', 'Ethereum', T0, 10e9, null);
    expect(buildContext(db).split('\n')[0]).toContain('Ethereum $10.00B (n/a 24h)');
  });

  it('signs per-chain deltas in millions, keeping +$0M and a minus after the dollar sign', () => {
    const db = freshDb();
    addChain(db, 'USDT', 'Up', T0, 30e9, 2.5e9);
    addChain(db, 'USDT', 'Flat', T0, 20e9, 0);
    addChain(db, 'USDT', 'Down', T0, 10e9, -1.5e9);
    // A negative value carries its own minus, so the sign lands after the '$'
    // (the same shape as the market cap line: "$-12.50B").
    expect(buildContext(db).split('\n')[0]).toContain(
      'Top chains: Up $30.00B (+$2500M 24h); Flat $20.00B (+$0M 24h); Down $10.00B ($-1500M 24h).'
    );
  });

  it('renders a zero price change as 0%, not n/a', () => {
    const db = freshDb();
    addChain(db, 'USDT', 'Ethereum', T0, 10e9);
    addPrice(db, 'USDT', T0, 1.0005, 0);
    expect(buildContext(db).split('\n')[0]).toContain('Spot $1.0005 (0% 24h).');
  });

  it('prints Spot n/a when the coin has no price row', () => {
    const db = freshDb();
    addChain(db, 'USDT', 'Ethereum', T0, 10e9);
    expect(buildContext(db).split('\n')[0]).toContain('Spot n/a.');
  });

  it('prints Spot n/a when the price row exists but price is null', () => {
    const db = freshDb();
    addChain(db, 'USDT', 'Ethereum', T0, 10e9);
    addPrice(db, 'USDT', T0, null, 0.5);
    expect(buildContext(db).split('\n')[0]).toContain('Spot n/a.');
  });
});

describe('buildContext: stress series lines', () => {
  it('prints a stress line only for coins that have a stress row', () => {
    const db = freshDb();
    addChain(db, 'USDT', 'Ethereum', T0, 10e9);
    addChain(db, 'USDC', 'Ethereum', T0, 5e9);
    addStress(db, 'USDC', T0, 60, -2.34, 1.01);
    addStress(db, 'USDC', T_OLD, 90, 4.5, 9.9);
    const lines = buildContext(db).split('\n');
    expect(lines).toContain('USDC stress: Peg Stress Index 60/100, z-score -2.3sigma, normalized delta 1.01%.');
    expect(lines.some((l) => l.startsWith('USDT stress:'))).toBe(false);
    expect(lines.some((l) => l.startsWith('DAI stress:'))).toBe(false);
  });

  // Characterization: the stress columns are NOT NULL in lib/db.js, so
  // buildContext may call toFixed() on a real number. This test exists so that
  // if that assumption ever changes the failure is loud and deliberate.
  it('relies on the NOT NULL stress columns and throws on a null z_score', () => {
    const db = freshDb();
    // Drop the real (NOT NULL) table and recreate the same columns nullable, the
    // one shape the production schema forbids.
    db.exec(`
      DROP TABLE stress_series;
      CREATE TABLE stress_series (ts INTEGER NOT NULL, symbol TEXT NOT NULL, peg_stress_index REAL, z_score REAL, normalized_delta REAL);
    `);
    db.prepare('INSERT INTO stress_series (ts, symbol, peg_stress_index, z_score, normalized_delta) VALUES (?, ?, ?, ?, ?)')
      .run(T0, 'USDT', 10, null, 1);
    expect(() => buildContext(db)).toThrow(/toFixed/);
  });
});

describe('buildContext: alert section', () => {
  it('lists open alert events newest first', () => {
    const db = freshDb();
    addEvent(db, { id: 'e1', symbol: 'USDT', rule: 'chain_spike', severity: 'warn', state: 'open', headline: 'spike one', detectedAt: T0 + 100 });
    addEvent(db, { id: 'e2', symbol: 'USDC', rule: 'peg_drift', severity: 'info', state: 'open', headline: 'drift two', detectedAt: T0 + 300 });
    addEvent(db, { id: 'e3', symbol: 'DAI', rule: 'supply_shift', severity: 'warn', state: 'open', headline: 'shift three', detectedAt: T0 + 200 });
    const lines = buildContext(db).split('\n');
    expect(lines.slice(-4)).toEqual([
      'Recent alerts:',
      '- USDC peg_drift (info): drift two',
      '- DAI supply_shift (warn): shift three',
      '- USDT chain_spike (warn): spike one',
    ]);
  });

  it('caps the alert event list at 5 rows', () => {
    const db = freshDb();
    for (let i = 1; i <= 6; i += 1) {
      addEvent(db, {
        id: `e${i}`,
        symbol: 'USDT',
        rule: `rule_${i}`,
        severity: 'warn',
        state: 'open',
        headline: `headline ${i}`,
        detectedAt: T0 + i * 1000,
      });
    }
    const lines = buildContext(db).split('\n');
    expect(lines.filter((l) => l.startsWith('- '))).toHaveLength(5);
    expect(lines).toContain('- USDT rule_6 (warn): headline 6');
    expect(lines).not.toContain('- USDT rule_1 (warn): headline 1');
  });

  it('ignores non-open events and falls back to the labels table', () => {
    const db = freshDb();
    addEvent(db, { id: 'e1', symbol: 'USDT', rule: 'chain_spike', severity: 'warn', state: 'resolved', headline: 'already resolved', detectedAt: T0 });
    addLabel(db, T_OLD, 'USDC', 'peg_drift', 'info', 'older label');
    addLabel(db, T0, 'DAI', 'supply_shift', 'warn', 'newer label');
    const lines = buildContext(db).split('\n');
    expect(lines.slice(-3)).toEqual([
      'Recent alerts:',
      '- DAI supply_shift (warn): newer label',
      '- USDC peg_drift (info): older label',
    ]);
    expect(lines).not.toContain('- USDT chain_spike (warn): already resolved');
  });

  it('reports the empty event log when no event is open and no label exists', () => {
    const db = freshDb();
    addEvent(db, { id: 'e1', symbol: 'USDT', rule: 'chain_spike', severity: 'warn', state: 'resolved', headline: 'already resolved', detectedAt: T0 });
    expect(buildContext(db)).toBe(NO_EVENTS_LINE);
  });
});
