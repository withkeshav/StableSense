# Historical price-alert replay

## Collecting new observations

```sh
node scripts/capture-alert-input.mjs https://your-dashboard.example/api/market /private/captures
```

This performs one read and exits. It saves the exact response, its hash, request and receipt times, current rule hashes, price freshness and current alerts in separate files outside the public checkout. HTTP failures and malformed responses are retained as unavailable attempts, never healthy observations. The recorder does not install a schedule or change the hosted app. Repeat captures at a documented cadence to build a prospective record; one capture cannot measure false alarms.

Receipt time means arrival at this recorder, not Helix ingestion or arrival at every user's browser. Keep raw captures private and review redistribution permissions before sharing. Every capture starts unlabelled. An absence of generated warnings does not establish an incident-free period: independent evidence must establish negative labels before calculating false-alarm rates. Preserve repeated polls for delivery analysis; do not treat repeated source timestamps as independent market observations in price replay.

## Replaying observations

Run the current price rules against timestamped USD observations without changing the app or its data:

```sh
node scripts/replay-alerts.mjs input.json output.json
```

The input is an object with `version: 1` and a nonempty `datasets` array. Each dataset has `id`, an active registry `symbol`, `quote: "USD"`, a named `source`, `expectedStepMs`, an evaluation `window` with `start` and `end`, and `observations`. All times are Unix milliseconds; windows include their start and exclude their end. Each observation contains `observedAt` and `price`, with optional `availableAt` for its actual arrival time. Without arrival records, evaluation assumes arrival at observation time and cannot measure historical delivery delays.

Optional `incidents` and `negativeWindows` arrays contain independently evidenced labels with `id`, `start`, `end` and `source`. Negative windows must be independently checked for the absence of the event being scored. They cannot overlap incident windows. Do not label every other hour as incident-free.

The replay imports the app's actual alert rules. Invalid values and conflicting records at the same timestamp are excluded. Unsupported assets are reported separately. Coverage requires at least two observations and no internal or boundary gap above 1.5 times the declared interval. This allowance accommodates timestamp variation; it does not establish continuous monitoring.

Results include warning observations, consecutive warning episodes, incident-window overlap, exclusions and coverage. Episodes follow source observation order and are not counts of notifications sent to users. A `detected` result means at least one warning overlaps the labelled window, not that the system predicted the incident. A miss is reported only for an observable window at the declared sampling interval; otherwise it is unmeasurable. Sparse samples can miss short events even when declared cadence is complete.

The false-alarm rate is the share of fresh observations producing warnings within explicitly labelled negative windows. It is `null` without eligible negative observations. Warnings outside incident windows are reported separately as unmatched, not proven false. Broad incident labels cannot establish onset detection time.

The output records hashes of the input and current rule files and includes a constructed three-hour input-delay sensitivity check. Source timestamps remain unchanged. This checks stale-input rejection, not a recorded historical outage. The tool evaluates price deviations only, not supply rules, venue-specific prices, historical provider availability or end-to-end notification delivery. Preserve provenance and redistribution permissions for any data supplied separately.
