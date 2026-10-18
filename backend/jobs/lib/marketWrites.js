/**
 * SQLite writes for market rows, kept out of the job scripts so the v1 and v2
 * Helix adapters cannot drift in how they persist a row.
 *
 * Each helper is a no-op on an empty batch. Snapshot chain names are lowercased
 * here for the same reason the v1 job does it: Helix casing varies ("Tron" vs
 * "tron") and the market view groups by lowercase.
 */

export function writePriceRows(db, rows) {
  if (!Array.isArray(rows) || !rows.length) return 0;
  const stmt = db.prepare(
    'INSERT INTO prices (coin, ts, price, change_24h, volume_24h_usd) VALUES (@coin, @ts, @price, @change, @volume)'
  );
  const tx = db.transaction((batch) => {
    for (const row of batch) stmt.run(row);
  });
  tx(rows);
  return rows.length;
}

export function writeSnapshotRows(db, rows) {
  if (!Array.isArray(rows) || !rows.length) return 0;
  const stmt = db.prepare(`
    INSERT OR IGNORE INTO snapshots (coin, chain, ts, circulating_usd, delta_24h_usd)
    VALUES (@coin, @chain, @ts, @circulating, @delta)
  `);
  const tx = db.transaction((batch) => {
    for (const row of batch) {
      stmt.run({ ...row, chain: String(row.chain || '').trim().toLowerCase() });
    }
  });
  tx(rows);
  return rows.length;
}

export function upsertMarketRow(db, row) {
  if (!row || row.ts == null) return false;
  if (typeof row.total !== 'number' || !Number.isFinite(row.total) || row.total <= 0) return false;
  db.prepare(
    `INSERT INTO market_snapshots (ts, total_circulating_usd, delta_24h_usd)
     VALUES (?, ?, ?)
     ON CONFLICT(ts) DO UPDATE SET
       total_circulating_usd = excluded.total_circulating_usd,
       delta_24h_usd = excluded.delta_24h_usd`
  ).run(row.ts, row.total, row.delta);
  return true;
}
