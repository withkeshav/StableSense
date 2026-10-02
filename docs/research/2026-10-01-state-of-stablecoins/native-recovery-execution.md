# Native recovery execution record

Status: approved recovery executing through native Kanban. No publication approval.

## Corrections to prior execution claims

- VB was configured in LiteLLM under a shared alias. Malformed provider IDs, unsupported aliases and key-model restrictions did not establish upstream provider unavailability.
- The installed delegate handler did not honor advertised per-task model/provider fields in the first replacement spawn. That child was stopped when the native listing showed DeepSeek. Its monetary cost and actual served upstream are not established here; do not assert that no paid requests occurred.
- Interrupted Step, misrouted DeepSeek and operator-stopped Bunny attempts are preserved as partial work, not completed independent reviews.
- The custom monitoring experiment is excluded from execution. Job 4de29bb6b8b3 remains paused. Test fixtures are not evidence of real-batch protection; its periodic execution was not demonstrated.
- Native Kanban owns durable work, model pins, dependencies, worker logs and attempt history. No new launcher, monitor or bot was introduced for this approved recovery.

## Measured native route checks

Bunny smoke task t_1f6499a2 completed. Its persisted session 20261001_232048_df687f has model-usage records for space-bunny-free-vb, provider custom, billing endpoint the existing local LiteLLM gateway. The dedicated alias maps only to openai/space-bunny-free via the existing VB credential reference. Parent independently checked package.json, src/config.js and vite.config.js. The source fallback version literal is stale, while Vite injects the package version; this is outside the research-only change scope and was not edited.

LongCat smoke task t_dac7756d completed. Its persisted session 20261001_232349_28e751 has usage records for meituan/longcat-2.5-preview:free, provider nous, endpoint https://inference-api.nousresearch.com/v1. Live Nous pricing was re-fetched and both prompt/completion prices were zero. Parent independently confirmed the smoke's package fields. Usage cost_status is unknown for both sessions; zero cost fields do not establish measured cost.

The operator explicitly approved temporarily setting only default-profile main fallback_providers to []. Readback confirmed it. The original main fallback was [{provider: ollama-tower, model: 'ornith-9b:64k'}]. R3 must restore that setting after these research workers settle, without changing the primary model, dedicated Bunny alias, other profiles or paused custom job.

## Native task chain

- t_c88a2124: R1, Bunny, evidence correction and synthesis; depends on completed Bunny smoke.
- t_acfe23ef: R2, free Nous LongCat, independent source-fidelity challenge; depends on R1 and completed LongCat smoke.
- t_88335186: R3, Bunny, reconciliation and checked operator handoff; depends on R1 and R2.

Task readback confirmed model/provider pins, dependency edges and preserved directory workspaces. R1 was running at the latest native listing; R2/R3 were dependency-gated. No task completion is operator acceptance. Human-facing delivery from this plain CLI has not been configured; native task/run history remains the status record.

## Parent baseline verification

Executed npm test: 203 tests passed in 12 test files. Executed npm run build: Vite production build succeeded. Executed git diff --check: exited successfully. These establish software/tree integrity at this point, not research factual accuracy or final package completion. R3 must repeat the checks after final reconciliation.

## Remaining gates

The core final package remains pending. Parent must verify material source passages, arithmetic, capture hashes/path locators and review dispositions before reporting completion. Native automatic retry-only stall intervention is not proven; a working heartbeat alone is not a progress verdict. Authenticated Runs API access is unmeasured and is not required for this Kanban chain.
