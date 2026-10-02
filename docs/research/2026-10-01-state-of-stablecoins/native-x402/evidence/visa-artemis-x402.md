# Agentic Payments from the Ground Up: What the Onchain Data Tells Us

**Source:** https://www.visa.com/en-us/thought-leadership/innovation/agentic-payments-from-the-ground-up
**Date:** July 14, 2026
**Author:** Tim Conard, Onchain Data Lead at Visa

## Key Findings

A new joint report from Visa and Artemis examines how AI agents are starting to pay for things, drawing on live onchain data.

### Two kinds of agentic commerce

The term "agentic commerce" covers two fairly different things:

1. **Macro commerce:** The agent acts for a person (booking flights, managing subscriptions). Payments look like ordinary e-commerce, carry consumer-sized values, and sit comfortably on card rails.

2. **Micro commerce:** Small, frequent payments that one piece of software makes to another, often for an API call or a slice of compute. These usually come in well under a dollar.

### What the live data shows

Two open protocols went live over the past year to handle machine-native payments:

- **x402:** Incubated by Coinbase and Cloudflare, now stewarded by the Linux Foundation. Since launching in May 2025, it has processed roughly **$15.0 million in adjusted volume across 109.6 million transactions**.

- **MPP (Machine Payments Protocol):** Built by Stripe and Tempo with contributions from Visa. In its first few weeks after launching in mid-March 2026, it settled about **$25,000 across roughly 115,000 transactions**.

### Key observations

- Most of x402's activity is on Base, Solana, and Polygon
- The average payment is a fraction of a cent
- A fixed card fee on a transaction that small would cost far more than the payment itself
- Account abstraction, passkeys, and sponsored transactions help these rails run quietly in the background

### Trust is the hardest part

Traditional commerce assumes there's a human doing the buying. An agent acting on delegated authority doesn't fit that assumption. If an agent buys the wrong thing, or a malicious prompt redirects its spending, it isn't obvious who should answer for it.

Disputes get messy. Chargeback windows and evidence rules were designed for human-speed commerce. Once agents are transacting thousands of times an hour, with money moving through chains of agents paying other agents, there's no settled way to unwind a payment that went wrong.

### The standards are starting to converge

- On the crypto-native side: x402 and MPP
- On the card side: Trusted Agent Protocol, Agent Payments Protocol, Visa Intelligent Commerce
- MPP now handles both onchain and fiat settlement through shared payment tokens
- Several card-native protocols are adding stablecoin support

### What this means for payments

- Cards are a good fit for proxy and macro purchases inside today's merchant networks
- Stablecoins suit the machine-native micropayments
- Plenty of real flows will use both at different points in the same task

## Footnotes

1. All transaction figures in this article are adjusted totals that exclude identified wash and test activity, taken from the joint Visa and Artemis report and based on Artemis Analytics onchain data as of April 21, 2026. Cumulative raw onchain totals are higher and appear in the report.
2. Source: Artemis Analytics onchain data, as of April 21, 2026.

## Source/Footnotes/Disclaimer

The following research was commissioned and funded by Visa. The analysis and views expressed in this article are those of the authors and are not intended to be, and should not be viewed as, investment, legal, tax, or financial advice. Figures cited are based on Artemis Analytics onchain data as of April 21, 2026, and are subject to change.
