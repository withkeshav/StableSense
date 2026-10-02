# StableSense Research Recovery Implementation Plan

> For Hermes: execute the approved recovery with native Kanban and existing research skills. Do not introduce custom launchers or monitoring code.

Goal: finish the existing stablecoin research as a corrected, source-traceable package for operator review, without changing or publishing the website.

Architecture: native Kanban owns durable task state, dependency gates, worker attempts and recovery. Existing model routes supply researchers; the lead verifies evidence and presents the result. Native Runs is an optional observation/control surface, not a second scheduler for the same work.

Tech stack: installed Hermes CLI, gateway Kanban dispatcher, LiteLLM dedicated free Bunny VB alias, authorized free Nous reviewer, existing local research captures.

Status: APPROVED by operator instruction "procced". Execute native recovery only; no publication approval.
Routing: DECIDED for Bunny. Native Bunny Kanban smoke t_1f6499a2 completed and its session usage confirms the dedicated LiteLLM alias. Free Nous LongCat live pricing rechecked at zero prompt/completion; native reviewer smoke t_dac7756d is the reviewer gate. Retry recovery remains untested; do not call this an end-to-end validated pipeline.

Approved fallback exception: operator explicitly authorized temporarily disabling the default profile's main local fallback during this research, then restoring it. Readback is fallback_providers=[]. Primary model and other profiles unchanged. Restore [{provider: ollama-tower, model: 'ornith-9b:64k'}] only when the research workers settle.

Native cards: R1=t_c88a2124; R2=t_acfe23ef (depends on R1 and LongCat smoke); R3=t_88335186 (depends on R1 and R2). All share the durable repository directory with separate writer/reviewer boundaries and explicit per-card model/provider pins.

## What was measured in this planning turn

- Native delegate listing: no live subagents.
- The temporary custom monitoring job 4de29bb6b8b3 is paused. Its scheduled execution was never demonstrated; do not claim it protected a real batch.
- LiteLLM /model/info returned HTTP 200 and exactly one dedicated space-bunny-free-vb deployment, upstream openai/space-bunny-free. /key/info confirms the current caller may use that alias.
- Earlier in this session, a forced tool-call smoke on the dedicated alias returned HTTP 200 and correct record_ok arguments, with x-litellm-model-name=openai/space-bunny-free. This is measured serving evidence, not merely a configuration label.
- The corrected native delegation spawn was listed as space-bunny-free-vb. It was subsequently interrupted on operator instruction; it did not finish the package.
- Current delegation provider/model: custom:litellm / space-bunny-free-vb. Delegation fallbacks were disabled. The default profile's separate main fallback list still contains local Ollama, so delegation-only settings do not establish that a Kanban worker has no fallback.
- Native CLI provides kanban create --model/--provider, request-review, request-changes, reclaim, log and runs.
- Installed dispatcher source hermes_cli/kanban_db_dispatch.py:2761-2766 passes task-specific model/provider overrides into the actual worker command. This differs from the installed delegate handler, which ignored the advertised per-task fields in the failed attempt.
- Default board is empty. Existing default profile is available. No new profile or specialist bot is required.
- Gateway service is active. Kanban configuration enables in-gateway dispatch and review dispatch. This is not a completed worker smoke test.
- Installed Runs API provides /v1/runs and status/events/steer/stop endpoints. The API is listening on its configured interface and returned HTTP 401 to an unauthenticated capabilities request. The current CLI environment lacks its API key. Authenticated Runs capabilities are UNMEASURED, not unavailable or broken.
- There is no top-level hermes runs CLI command in this installation. Native CLI attempt history is hermes kanban runs TASK_ID. Neither hermes-runs nor hermes-kanban was found as an executable on this shell's PATH. Do not infer that a desktop pane or API feature is absent from those PATH checks.
- The repository contains the original research passes, LongCat review, Firecrawl recovery and Laguna report plus parent reviews. Neither final-bunny nor final-bunny-routed contains completed top-level deliverables. Captures within interrupted work remain leads until checked.
- Software license changes and research/legal drafts remain uncommitted. Preserve them; no commit, push or deployment is authorized.

## Mistakes to rectify

1. Record that malformed provider IDs, wrong alias requests and key restrictions did not establish VB provider unavailability.
2. Record the misrouted DeepSeek attempt as interrupted and outside the intended researcher routing. Determine the actual served upstream from existing logs if available; do not invent a monetary cost or claim no paid calls.
3. Preserve interrupted artifacts, but never count interrupted Step, DeepSeek or Bunny attempts as completed independent reviews.
4. Remove the custom monitor from the approved execution path. Keep its job paused. Retain history; do not delete evidence or tracked records just to make the tree look clean.
5. Correct contradictory skill guidance: native configuration first, verify actual spawned model, use Kanban task overrides only where the installed dispatcher honors them, and distinguish native liveness from substantive progress. The skill update must not prescribe another monitoring framework.
6. Correct substantive research defects using primary captures, not by trusting another agent's summary.

## Scope and exclusions

Finish: current stablecoin landscape; Open USD/OpenStandard thesis; RWA economic depth; economic impact and US debt exposure; x402 and agent-payment measurement; data-validation methodology; competing narratives and falsifiers.

No new broad research wave. Reuse existing captures and fetch only missing evidence necessary to settle consequential claims. No paid researcher, paid fallback, OpenRouter, credential harvesting, browser extensions, custom execution code or new bots. No website edits, deployment, version changes, git commits or Plan 2.

Privacy/disclaimer/contributor preparation is a separate appendix with explicit operator inputs. Unknown operator identity, contact address or retention does not block finishing the core stablecoin report. No claim of legal compliance or a new research license.

## Execution plan

### Phase A: minimal cleanup and native worker proof

The lead records the recovery corrections, updates the existing relevant skills, and confirms the custom job remains paused. No further gateway model changes are needed: the dedicated free alias already exists and serves.

Use the existing default profile with per-card model/provider overrides. Before research cards execute, prove that the worker's effective primary and fallback routes remain within permission. The default profile has a local fallback, so this must not be hand-waved away. If no supported task-scoped fallback override exists, bring the operator one explicit choice before changing shared profile fallback settings. Never change another profile or silently weaken unrelated sessions. Gateway fallbacks must also remain disabled for the dedicated research route.

Create a small native smoke card assigned to default, model space-bunny-free-vb, provider custom:litellm, local-only completion. Have it read a known non-secret repository file and return a checked fact. Inspect task readback, worker log, actual serving route and run outcome. Inspect installed native reclaim/retry behavior; do not claim recovery coverage merely from its setting. If the worker route is wrong, reclaim/block this card and do not launch research.

Avoid goal mode and automatic decomposition here: their judge/specifier routes have not been established as free. No hidden paid routing introduced to simplify the board.

### Phase B: bounded native task graph

Use three research cards, following the successful smoke. Assign all to the existing default profile with task-specific overrides; no new profiles.

R1: recover, correct and synthesize, Bunny VB.
- Read the existing intake, all original passes, captures and parent reviews.
- Inventory material claims and open defects. Copy no cache-only references into the final ledger.
- Fetch only missing primary passages needed to settle those defects.
- Produce a proposed final package in docs/research/2026-10-01-state-of-stablecoins/final/.
- Save work incrementally. Do not add custom checkpoints or monitoring scripts.
- Return exact paths and tool-checked counts. A complete provisional synthesis may retain clearly labelled unresolved facts; it may not disguise them as established claims.

R2: independent challenge, authorized free Nous LongCat, depends on R1.
- Freshly verify free pricing, tools and effective fallback policy before dispatching this reviewer.
- Read R1's proposed text and original stored primary captures. Challenge source fidelity, numeric scope, causal overreach, omitted alternatives and planted-claim disposition.
- Write review output separately in final-review/. Do not edit R1's files.
- Return findings with exact supporting passages and required corrections.
- If the reviewer route fails, block/reassign through an already verified authorized free lane. No paid fallback and no restart of a broad research collection wave.

R3: reconcile and deliver, Bunny VB, depends on R2 and R1.
- Resolve each review finding against original captures, explicitly recording corrected, excluded or unresolved status.
- Complete the final synthesis, claim ledger, evidence manifest, review disposition and limitations.
- Request operator review, not publication approval. Do not represent a board completion as operator acceptance.

Parent gates are stored in the cards, not merely written in their prose. Use workspace_kind=dir with the absolute StableSense repository path; do not choose ephemeral scratch for durable captures or create a worktree from uncommitted research and then omit that research. Assign disjoint output paths. Cards use idempotency keys to avoid duplicate dispatch.

### Phase C: native observation and intervention

Kanban is the sole owner of execution. Use native board state, task logs, task attempt history and native worker heartbeats. The lead checks actual completed tools, saved evidence and provider errors, not just running status. A heartbeat alone does not prove useful work.

If a provider is repeatedly retrying without substantive work, reclaim the affected card through native recovery, preserve partial artifacts and hand off from its durable context. Never silently wait for hours or restart the full research. Do not promise that the existing stale-claim detector catches every heartbeat-advancing retry loop; that path needs a specific smoke before an automatic-stall guarantee.

Native Runs may supply events/steer/stop if authenticated access is already available and verified at execution. Do not expose an API, request unrelated credentials or build a client to unlock it. If authentication is not available, proceed with Kanban's own logs/runs/reclaim. Do not launch duplicate Runs jobs for work already owned by Kanban.

### Phase D: lead verification and operator handoff

The lead checks each load-bearing correction directly against its stored primary passage and executes all arithmetic. Programmatically verify unique claim IDs, source path resolution, hashes, exact quoted passage matches and declared counts. These are mechanical checks, not a new framework. Report missing evidence as UNKNOWN or UNRESOLVED.

Run npm test and npm run build for the pending repository changes, plus git diff --check and a prohibited-dash check on final deliverables. Those checks establish repo integrity, not factual accuracy.

Present a plain summary of the actual corrected findings, bounded narratives, unresolved gaps and proposed additions. Stop at operator review. Restore task-specific temporary settings to their measured pre-run values, while leaving the authorized dedicated Bunny alias intact. Never restore a paid/shared route while free-only workers are still active.

## Required consequential corrections

- KC Fed conditional Treasury-demand example: verify actual bank/issuer allocations and net arithmetic. Do not turn a scenario into a universal measured effect or cap.
- GENIUS reserve eligibility: use the statutory asset list, not T-bills-only prose.
- Open USD: distinguish token-holder rights, issuer custody, reserve assets, marketing commitments and observed adoption.
- Reserve-yield distribution: compare actual Circle/Coinbase arrangements before claiming OUSD is structurally unique.
- RWA: validate idle-value definition, distinguish fund shares from asset ownership, and avoid asserting no economic substitution solely from legal form.
- BUIDL: use dated issuer evidence or explicitly retain the AUM gap.
- x402: align chain scope, date windows, denominators and commerce/bot/bridge filters. Do not subtract a chain-specific percentage from a cross-chain total.
- IMF paper: verify the metric in the original PDF; do not relabel payment-firm market-cap results as Treasury demand.
- Firecrawl: replace non-verbatim supposed quotes with actual text or labelled paraphrases; repair locators and keep capture provenance.
- Privacy appendix: correct universal DPO claims, ungrounded lawful-basis/commencement assertions, missing Cloudflare and contribution PII, and conclusions inferred from sample nginx or missing config. Unknowns stay explicit.

## Expected deliverables

Under docs/research/2026-10-01-state-of-stablecoins/final/:
- synthesis.md
- claims.json
- evidence-manifest.json and durable evidence/
- review-disposition.json
- verification.json
- limitations-and-next-update.md
- operator-handoff.md
- legal-and-contribution-readiness.md, explicitly separate from core research and not a compliance claim

Under final-review/: the independent challenge and its source-backed findings.

Existing raw passes, captures, legal drafts, license files and interrupted-attempt history remain preserved.

## Approval and honest validation boundary

This plan validates that the installed native mechanisms exist and that the dedicated Bunny route is configured and has served tools in this session. It does not claim that the new Kanban worker, reviewer route, native retry recovery or authenticated Runs path has passed execution testing. Those are explicit first-execution gates, not hidden assumptions.

Recommended approval: execute this native recovery plan, with no custom tooling and no publication. Resolve any shared-profile fallback change explicitly before dispatch; no other expansion is authorized. No completion-time promise is justified by the observed provider variability. Speed comes from reusing evidence and closing named defects, not multiplying agents or weakening verification.
