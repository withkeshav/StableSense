/x402

# x402

An open standard for paying over HTTP — built for agents.

 [Back to home](https://agenteconomy.to/)

What it is

x402 is an open payment standard from Coinbase that revives the dormant HTTP 402 “Payment Required” status code. It lets any client — a person or an AI agent — pay for an API call or a piece of content with stablecoins directly over HTTP, with no account, session, or sign-up.

How it works

01

### 402 Payment Required

The server answers a request with the payment terms attached in a header.

02

### Pay over HTTP

The client returns a signed stablecoin payment in the next request — no account or login.

03

### Facilitators settle

A facilitator verifies and settles on-chain, so the server needs no blockchain infrastructure. Works across EVM chains and Solana.

x402 by the numbers

Live figures from the agent economy dataset, updated as of September 23, 2026 (UTC). Measured from public on-chain activity — see [methodology](https://agenteconomy.to/methodology).

| Cumulative transactions | 188,186,529 |
| USD settlement volume | $41,800,229 |
| Latest daily transactions | 18,3162026-09-23 |
| Facilitators tracked | 18 |
| Chains tracked | 12 |
| Largest chain | Base85,026,747 txs |
| Largest facilitator | PayAI26.7% share |

Current x402 on-chain metrics from agenteconomy.to/data.json

[Browse the data](https://agenteconomy.to/data) [How it's measured →](https://agenteconomy.to/methodology)

Protocol guide

## The shape of x402 in the agent economy.

01 / Why it matters

### x402 makes payment part of the request itself.

x402 is an HTTP-native payment standard for machine-readable resource access. It revives the long-dormant 402 Payment Required status code and gives it a practical flow for APIs, files, inference calls, data feeds, and other resources that can be priced at request time. A client asks for a resource. The server responds with payment requirements. The client signs a stablecoin payment and retries the request with proof of payment. A facilitator verifies the payment and settles it on-chain, while the server can stay focused on the resource it is selling.

The useful change is not just that checkout gets shorter. The useful change is that a web server can quote a price in the same protocol channel where the resource is requested. That matters for agents because an agent cannot reliably use a human checkout page, remember a password, complete a credit-card form, or wait for a sales process before making a small call. It can, however, parse a machine-readable payment requirement, decide whether the terms are acceptable, sign a payment with a wallet it controls, and continue the HTTP flow.

This turns paid access into something composable. A service can expose a specialized endpoint without first building accounts, billing plans, card rails, or a subscription funnel. A client can pay only when it needs the resource. The pattern is especially relevant for small API calls and metered work: one data lookup, one model response, one crawl result, one enriched record, or one gated file. The server prices the resource close to the endpoint; the client evaluates the price close to the task.

The protocol is small by design: request, payment requirement, signed payment, facilitator verification, settlement.

02 / Payment flow

### The 402 response becomes a machine-readable price quote.

In a typical x402 interaction, the first request does not assume the client has an account. The server can answer with HTTP 402 and attach the payment terms needed to unlock the resource. Those terms describe what must be paid, where it should settle, and how the client should present proof. The client then decides whether to proceed. If the price and network are acceptable, it signs the payment and sends a second request carrying the payment proof.

A facilitator sits between the web application and the chain-specific details. Its job is to verify the payment payload, handle the settlement path, and give the server a simpler integration surface. That facilitator role is why the live dashboard tracks facilitator share separately from total transactions and chain distribution. The adoption question is not only how many x402 payments exist; it is also how concentrated the verifying and settling infrastructure is.

The design is useful because it avoids forcing every paid API provider to become a wallet, node, indexing, and settlement operator. Servers can implement payment-gated routes while outsourcing the chain-heavy work. Clients still get a direct payment primitive over HTTP, and facilitators compete on reliability, chain coverage, developer ergonomics, and settlement support.

#### First request

The client asks for a protected resource and receives HTTP 402 payment requirements instead of a checkout page.

#### Second request

The client retries with a signed stablecoin payment or proof that satisfies the quoted terms.

#### Settlement

A facilitator verifies the payload and settles on-chain so the resource server does not need full blockchain infrastructure.

03 / Agent pattern

### Agents can pay for work without a prior billing relationship.

The agent economy needs payment surfaces that do not assume a human buyer is watching every transaction. An agent may need to call a weather API, buy a fresh dataset row, query a specialized search service, pay for a model inference, or retrieve a protected document while completing a larger task. In the old web pattern, each of those services would often require account creation, card entry, a billing portal, or a subscription plan. That is a bad fit for autonomous software.

x402 changes the integration shape. The agent can discover a paid resource, request it, inspect the returned terms, and either pay or decline. The service does not need to know the agent in advance. The agent does not need to negotiate an enterprise contract before a one-off call. This makes per-use pricing viable for narrow services that are valuable in the moment but not important enough to justify a full customer relationship.

The same property also helps human-facing applications that call other services behind the scenes. A product can let agents or automated workflows pay for upstream data as needed, then expose the result to the user. That does not make every settlement an organic end-user purchase, and it does not remove the need for fraud, quota, compliance, or policy controls. It does make the payment instruction legible to software, which is the important primitive.

A useful agent payment protocol does not ask every seller to run a billing company or every buyer to pre-register everywhere.

04 / What Agent Economy tracks

### The live metric follows visible on-chain settlement activity.

Agent Economy tracks x402 through public on-chain settlement activity reflected in the project dataset. The current cumulative transaction count, USD settlement volume, facilitator count, and chain count are published in the live table above — refreshed from data.json on an hourly cycle, each with its own as-of stamp. The dataset also breaks out chain concentration and facilitator share, because the adoption question is not only how many x402 payments exist; it is also where they settle and how concentrated the verifying infrastructure is.

Those numbers are useful because x402 activity leaves a measurable trail. Instead of relying only on announcements or private API logs, the dataset can observe settlement events, aggregate them into \`data.json\`, and separate totals by transaction count, USD volume, facilitator rows, chain rows, daily trends, and monthly trends. The old dashboard route and this apex page use the same underlying x402 fields: \`x402.totalTxs\`, \`x402.totalVolume\`, \`x402.protocols\`, \`x402.chains\`, and the trend arrays used for time-series views.

The source trail matters. The x402 rows are pulled from public Dune dashboards, including @thechriscen / x402 Payment Analytics and @hashed\_official / x402 Analytics, then embedded into the Agent Economy raw dataset by the daily pipeline. This page is not claiming a private measurement feed or an audited revenue number. It is presenting the visible protocol footprint that can be tracked from the available public data.

#### Scale

Total transactions and USD settlement volume show the visible size of x402 settlement activity.

#### Distribution

Chain rows and facilitator share show where usage and infrastructure are concentrated.

#### Source

The route is grounded in public Dune sources and the same Agent Economy \`data.json\` fields used by the dashboard.

05 / Caveats

### Settlement activity is a market signal, not audited commerce.

The honest interpretation is narrower than the headline number. Raw on-chain settlement events can include tests, infrastructure traffic, repeated service calls, self-directed usage, and other activity that is real at the protocol layer but not the same thing as verified organic end-user commerce. A high transaction count shows that the payment path is being exercised. It does not, by itself, prove that every transaction is a distinct paying customer buying a useful service.

That is why Agent Economy keeps x402 as its own protocol row instead of mixing it into a single undifferentiated agent revenue claim. x402 reports settlement transactions and USD volume. ERC-8004 reports registered agent identities. Virtuals ACP reports commerce lifecycle memos. Tempo MPP reports indexed channel and settlement events. Olas reports autonomous agent transactions. These are related signals, but they are not interchangeable units.

The conservative read is also the most useful one for builders. x402 shows that HTTP-native stablecoin payments have an observable deployment footprint across multiple chains and facilitators. The next questions are about composition: which endpoints use it, which clients can pay automatically, whether facilitator share decentralizes over time, how much activity maps to durable API demand, and whether the pattern becomes boring enough that developers treat paid access as another normal HTTP capability.

Read x402 totals as visible protocol activity. Genuine commerce is a subset that requires more context than settlement logs alone can provide.

06 / Positioning

### x402 is one payment primitive in a broader agent stack.

x402 is not the whole agent economy. It is the HTTP payment layer for resource access: a way for clients and servers to exchange payment requirements and proofs around a single resource request. Other protocols solve different problems. ERC-8004 focuses on agent identity, reputation, and validation. Virtuals ACP focuses on agent-to-agent commerce workflows with agreements, deliverables, evaluation, and settlement. Tempo MPP is tracked separately because it points toward a machine payment and channel pattern rather than the same cross-chain x402 measurement surface. Olas is tracked as autonomous service activity.

That separation is important because it prevents category inflation. A registry event is not a payment. A job memo is not necessarily an API call. A channel event is not the same unit as a 402-gated resource. The agent economy will likely use many primitives at once: identity to know who is acting, reputation to decide whether to trust them, payment rails to compensate services, and validation systems to prove work was completed. x402 owns the narrow but powerful slice where a web resource can demand payment directly through HTTP.

For developers, the practical question is whether a resource should be sold per request. If the resource is small, high-frequency, globally accessible, and useful to software, x402 is a natural fit. If the relationship requires long-lived negotiation, escrowed deliverables, complex refunds, or reputation-weighted counterparties, it may need a higher-level commerce protocol around it. The point of tracking x402 separately is to see whether the simple HTTP payment primitive becomes a standard substrate that other agent systems can call when money needs to move.

Frequently asked questions

### What is x402?

x402 is an open payment standard from Coinbase that revives the dormant HTTP 402 “Payment Required” status code. It lets any client — a person or an AI agent — pay for an API call or a piece of content with stablecoins directly over HTTP, with no account, session, or sign-up.

### How many x402 transactions have been processed?

As of September 23, 2026, agent economy tracks 188,186,529 cumulative x402 transactions and $41,800,229 of settled USD volume across 12 chains, measured from public on-chain settlement activity.

### Which chain has the most x402 activity?

Base is currently the largest chain by x402 transactions, with 85,026,747 recorded settlements. PayAI is the largest facilitator at 26.7% share.

### Where do these numbers come from?

Every figure is built from public on-chain activity — decoded events and transactions aggregated by the agent economy pipeline and published in data.json, with per-source provenance and freshness stamps. See the methodology page for how each metric is measured.

Related protocols

[ERC-8004\\
\\
A trust layer for agents — identity, reputation, validation on Ethereum.](https://agenteconomy.to/erc-8004) [Virtuals ACP\\
\\
The commerce layer for autonomous agents.](https://agenteconomy.to/virtuals-acp) [Olas\\
\\
A network for co-owned autonomous agents.](https://agenteconomy.to/olas) [Tempo MPP\\
\\
The Machine Payments Protocol — HTTP 402 payments on Tempo.](https://agenteconomy.to/tempo-mpp) [Masumi\\
\\
Escrow-settled agent payments on Cardano.](https://agenteconomy.to/masumi)