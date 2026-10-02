- [DEVELOPERS](https://metamask.io/news/developers#latest)

- Copy link


# What is x402?

x402 revives the dormant HTTP 402 status code so servers can request payment and AI agents can settle it inline, with no accounts or checkout flow per call.

- [![MetaMask](https://images.ctfassets.net/clixtyxoaeas/7JHrmjhpiKajxi3VM4wc1Q/2d67492953bf745d38c470f0bd1fa852/avatar.png?w=2048&q=75&fm=avif)\\
\\
MetaMask](https://metamask.io/news/metamask)

7 min

July 14, 2026

![What is x402?](https://images.ctfassets.net/clixtyxoaeas/2KHU7eGhCZX2UDEtEBK3mb/25956d941ab9e81a9f521e0a2ff1666b/MetaMask_Blog_-_What_is_x402___1_.png?w=2048&q=75&fm=avif)

- Copy link


x402 is an open payment protocol that uses the HTTP "402 Payment Required" status code so a server can request payment and a client can respond with a signed payment payload in the same HTTP exchange. For an AI agent, that means paying for APIs, data, and compute without creating an account, storing a card, or stopping for a checkout flow on every call—as long as the agent's wallet already has the authority to spend. [Coinbase built x402](https://www.coinbase.com/blog/coinbase-and-cloudflare-will-launch-x402-foundation), the [Linux Foundation](https://www.linuxfoundation.org/press/linux-foundation-is-launching-the-x402-foundation-and-welcoming-the-contribution-of-the-x402-protocol) now hosts the independent x402 Foundation, and the protocol has become one of the clearest emerging rails for machine-to-machine payments.

Read [What is an agentic wallet?](https://metamask.io/news/what-is-an-agentic-wallet) and [Best agentic wallets in 2026](https://metamask.io/news/best-agentic-wallets-2026) for more on how x402 operates as a distinct layer for agents and agentic wallets to interact with. [Why every AI agent needs a wallet](https://metamask.io/news/why-every-ai-agent-needs-a-wallet) and [How AI agents transact without touching your keys](https://metamask.io/news/how-agent-wallets-work-self-custodial-architecture) explores how the wallet decides custody, permissions, and signing while x402 decides how a payment is priced and settled. This article fills in the gaps by diving deep into what x402 actually is, how the payment flow works, who built and now governs it, and which products support it.

## How an x402 payment works

The current HTTP semantics specification, [RFC 9110](https://datatracker.ietf.org/doc/html/rfc9110#section-15.5.3), still lists 402 Payment Required as reserved for future use. x402 activates that reserved status code with a concrete payment flow: the server states what payment it will accept, the client attaches a signed payment payload, and the server verifies and settles the payment before returning the resource.

A typical exchange runs in a handful of steps, per [x402's client/server documentation](https://docs.x402.org/core-concepts/client-server):

1. A client—a human-operated app or an autonomous agent—requests a resource from a server.

2. The server responds with a 402 Payment Required status and a header describing what it will accept: price, network, and destination address.

3. The client builds a signed payment payload matching one of the accepted options and resubmits the request with that payload attached.

4. The server verifies the payload, either locally or through a facilitator, and settles the payment onchain.

5. The server returns the requested resource, along with a header confirming settlement.


In [x402 V2](https://x402.org/x402-v2-launch), that exchange is standardized around three Base64-encoded JSON headers, replacing the deprecated headers V1 used:

|     |     |     |
| --- | --- | --- |
| **Header** | **Direction** | **What it carries** |
| PAYMENT-REQUIRED | Server to client | Accepted payment options: scheme, network, price, destination |
| PAYMENT-SIGNATURE | Client to server | The client's signed payment payload |
| PAYMENT-RESPONSE | Server to client | The settlement result, success or failure |

Most sellers don't verify and settle payments themselves. A facilitator is an optional but widely used service that checks a payment payload against the server's requirements and submits the settlement onchain on the server's behalf, so the server never needs its own blockchain infrastructure. A facilitator verifies and executes signed payloads—it does not hold buyer funds or act as a custodian. Facilitators are live across Base, Solana, Polygon, Avalanche, and other networks.

Not every x402 payment settles onchain in the same round trip. The protocol supports multiple settlement schemes: exact and upto typically settle immediately, while [batch-settlement](https://docs.x402.org/schemes/batch-settlement) lets a buyer deposit funds into onchain escrow once, sign off-chain vouchers for each request, and let the seller redeem many vouchers in a single onchain transaction later—built for high-volume, metered API calls where settling every request onchain individually would be too slow or too expensive.

## Where x402 came from

Coinbase built x402, drawing on internet payment standards work the company says it has pursued since 2015. [Cloudflare and Coinbase announced their intent to create the x402 Foundation on September 23, 2025](https://blog.cloudflare.com/x402/), with Coinbase framing the goal as establishing x402 as "the universal standard for AI-driven payments" through neutral, open governance rather than a Coinbase-controlled standard. Cloudflare added x402 support to its Agents SDK and MCP servers the same day.

Governance moved a step further on April 2, 2026, when the Linux Foundation formally launched the x402 Foundation at the MCP Dev Summit North America, taking on the protocol as a contribution from Coinbase.

The Foundation launched with initial support from 22 organizations spanning payment networks, cloud providers, and blockchain infrastructure, including Adyen, Amazon Web Services, American Express, Circle, Cloudflare, Fiserv, Google, Mastercard, Microsoft, Polygon Labs, Shopify, Solana Foundation, Stripe, and Visa.

## x402 is a payment rail, not a wallet

x402 and an agent wallet solve different problems, and the distinction matters for anyone building an agent that transacts. The wallet decides who holds the keys, what an agent is allowed to spend, and whether a transaction gets signed at all. x402 decides how a specific payment request gets priced, communicated, and settled once the wallet or agent already has authority to pay. Swapping wallets doesn't change how x402 works, and adopting x402 doesn't change who controls the wallet's keys or spending limits—they're separate layers that happen to show up in the same transaction.

That separation is why x402 support on the buyer side is a wallet feature, not a wallet architecture. MetaMask's [Smart Accounts Kit](https://docs.metamask.io/smart-accounts-kit/guides/x402/overview/) supports x402 payments through [ERC-7710](https://eips.ethereum.org/EIPS/eip-7710) delegations, letting a smart account authorize a facilitator to redeem a signed delegation during settlement instead of signing a fresh token approval for every request. The same docs cover [recurring x402 payments](https://docs.metamask.io/smart-accounts-kit/guides/x402/buyer/recurring-payments/), where a user grants a periodic budget once and an agent reuses that permission for eligible calls until the cap is reached. The custody model, spend limits, and human-escalation rules around that payment are still entirely the wallet's job, covered in full in [How AI agents transact without touching your keys](https://metamask.io/news/how-agent-wallets-work-self-custodial-architecture).

MetaMask and Consensys didn't create x402—Coinbase did. Their role is making the protocol work from self-custodial wallet infrastructure. In ["Self-custody in the era of AI agents,"](https://metamask.io/news/self-custody-in-the-era-of-agents) Consensys publicly committed to supporting x402 and contributing to the spec's evolution, aiming to push it toward multi-asset, multichain payment flows and to pair it with ERC-7710 delegated spending so agents can pay within user-defined limits.

## x402 and AP2: extension, not competitor

x402 isn't the only agent payments protocol, and it's worth being precise about how it relates to the other major one. Google's [Agent Payments Protocol (AP2)](https://cloud.google.com/blog/products/ai-machine-learning/announcing-agents-to-payments-ap2-protocol), announced September 16, 2025 with backing from more than 60 organizations, is a payment-method-agnostic framework: it defines cryptographically signed "Mandates" that prove a user authorized an agent to make a specific purchase, and it works across cards, bank transfers, and stablecoins alike.

x402 can sit inside AP2 as a crypto and stablecoin settlement extension rather than as a rival standard. Google's own announcement says the [A2A x402 extension](https://github.com/google-a2a/a2a-x402) was built "in collaboration with Coinbase, Ethereum Foundation, MetaMask and other leading organizations," and Coinbase describes x402 as one of the first extensions to AP2 and its only stablecoin facilitator.

Marco De Rossi, AI Lead at MetaMask, put the reasoning for participating directly in Google's announcement:

"Blockchains are the natural payment layer for agents, and Ethereum will be the backbone of this. With Agent Payments Protocol (AP2) and x402, MetaMask will deliver maximum interoperability for developers and will enable users to pay agents with full composability and choice—while retaining the security and control of true self-custody."

## Who's building what on x402

x402 support now spans wallets, payment networks, and infrastructure providers well beyond its Coinbase origins.

|     |     |     |
| --- | --- | --- |
| **Organization** | **Role** | **What they've shipped** |
| Coinbase | Creator, founding participant | Created x402, launched AgentKit and the Agent.market x402-paywalled service directory, and helped establish the Foundation path with Cloudflare |
| Cloudflare | Foundation co-founder | x402 support in its Agents SDK and MCP servers, plus a deferred-payments scheme for its Pay Per Crawl beta |
| Linux Foundation | Governance host since April 2, 2026 | Formal steward of the x402 Foundation and the protocol specification |
| Google Cloud | AP2 integration | The A2A x402 extension, built with Coinbase, the Ethereum Foundation, and other organizations (see the AP2 section above for the full collaborator list) |
| MetaMask / Consensys | Wallet-side support, spec contributor | Buyer-side x402 support via Smart Accounts Kit; Consensys has publicly committed to expanding the spec, and says DIN already supports x402 micropayments for RPC access |
| Solana Foundation | Early adopter network | Nearly 65% of x402 transaction volume in 2026, per the Foundation's own April 2026 statement |

Visa, Stripe, Mastercard, American Express, and other payment networks are listed among the x402 Foundation's founding supporters—that reflects Foundation membership, not a confirmed x402 payment implementation on their own rails.

For a full vendor-by-vendor comparison of how agent wallets handle custody and payments in practice, see [Best agentic wallets in 2026](https://metamask.io/news/best-agentic-wallets-2026).

### What is x402? Frequently asked questions[Direct link to What is x402? Frequently asked questions](https://metamask.io/news/what-is-x402\#what-is-x402-frequently-asked-questions)

- What is x402?




x402 is an open payment protocol that activates the HTTP "402 Payment Required" status code so a server can request payment and a client—often an AI agent—can settle it within the same HTTP exchange, without an account, stored card, or checkout flow, as long as the client's wallet already has spending authority.

- How does an x402 payment work?




A client requests a resource, the server responds with a 402 Payment Required status describing what it will accept, the client attaches a signed payment payload matching one of those options, and the server (often through a facilitator) verifies and settles the payment before returning the resource.

- Who created x402, and who governs it now?




Coinbase created x402. Coinbase and Cloudflare announced plans to spin it into an independent foundation on September 23, 2025, and the Linux Foundation formally launched the x402 Foundation on April 2, 2026, taking on the protocol as Coinbase's contribution. Coinbase remains a founding participant but no longer controls the protocol's evolution.

- Is x402 the same thing as an agent wallet?




No. A wallet decides custody, spend limits, and whether a transaction gets signed. x402 decides how a specific payment request is priced, communicated, and settled once the wallet has already agreed to pay. An agent still needs a wallet with its own custody and policy controls regardless of which payment protocol it uses.

- What's the difference between x402 and AP2?




AP2 (Google's Agent Payments Protocol) is a payment-method-agnostic framework covering cards, bank transfers, and stablecoins. x402 can sit inside it as a crypto and stablecoin settlement extension—described by Google as one of the first extensions to AP2 and its only stablecoin facilitator, built through the A2A x402 extension developed with Coinbase, the Ethereum Foundation, and other organizations.

- Does MetaMask support x402?




Yes, on the buyer side. MetaMask's Smart Accounts Kit supports x402 payments through ERC-7710 delegations, including recurring payments against a periodic budget a user grants once. Consensys has also publicly committed to supporting and expanding x402.


## Subscribe to Alpha for market alpha straight to your inbox

Email address\*

Form Name

Learn about our privacy practices in our [Privacy Notice.](https://metamask.io/privacy-notice)

reCAPTCHA

Recaptcha requires verification.

protected by **reCAPTCHA**

SUBSCRIBESUBSCRIBE

Learn about our privacy practices in our [Privacy Notice.](https://metamask.io/privacy-notice)

- [DEVELOPERS](https://metamask.io/news/developers#latest)

- ![MetaMask](https://images.ctfassets.net/clixtyxoaeas/7JHrmjhpiKajxi3VM4wc1Q/2d67492953bf745d38c470f0bd1fa852/avatar.png?w=2048&q=75&fm=avif)

MetaMask





  - [MetaMask's x, Opens in new tab](https://x.com/MetaMask)
  - [MetaMask's linkedin, Opens in new tab](https://www.linkedin.com/company/metamask/)
  - [MetaMask's youtube, Opens in new tab](https://www.youtube.com/@metamask?sub_confirmation=1)
  - [MetaMask's github, Opens in new tab](https://github.com/MetaMask)
  - [MetaMask's instagram, Opens in new tab](https://www.instagram.com/metamask.io/)
  - [MetaMask's discord, Opens in new tab](https://discord.gg/consensys)
  - [MetaMask's reddit, Opens in new tab](https://www.reddit.com/r/Metamask)
  - [MetaMask's tiktok, Opens in new tab](https://www.tiktok.com/@metamask)

MetaMask, formerly Consensys Software Inc, is the world's largest self-custodial financial platform, giving people a single place to hold, spend, save and grow their money across both crypto and traditional assets. The company is building the consumer platform where that happens, bringing payments, savings, investing and digital assets together in one seamless experience. Having grown
from the world's most widely used self-custodial wallet, MetaMask gives users direct control over their money and assets, with reach across approximately 190 countries. MetaMask has played a foundational role in Ethereum's growth since 2016. Today, MetaMask sits at the center of the onchain economy, building the operating system for Open Money and putting people in full control of their
financial lives.

[Read all articles](https://metamask.io/news/metamask)

## Latest articles[Direct link to Latest articles](https://metamask.io/news/what-is-x402\#latest-articles)

[All news](https://metamask.io/news)

- [![User update](https://images.ctfassets.net/clixtyxoaeas/7ESHx2QWQvefcpfx8rzwxA/f5ab770982bbe298e2984948ea450431/MetaMask_Blog.png?w=2048&q=75&fm=avif)\\
\\
**User update** \\
\\
MetaMask is responding to an incident affecting infrastructure. We have identified no immediate threat to MetaMask wallets.](https://metamask.io/news/user-update)
- [GUIDES\\
\\
![Crypto trading explained: self-custodial vs custodial](https://images.ctfassets.net/clixtyxoaeas/5zeI5p8JcjxLXL3mxKl4WZ/2fa2abfa301e601835dd2cc7e2ad7a15/Crypto_trading_self-custodial_vs_custodial.png?w=2048&q=75&fm=avif)\\
\\
**Crypto trading explained: self-custodial vs custodial** \\
\\
Learn the difference between self-custodial and custodial crypto trading, and who controls your Private Keys and assets in both models.](https://metamask.io/news/crypto-trading-explained-self-custodial-vs-custodial)
- [![Privacy preserving features in MetaMask](https://images.ctfassets.net/clixtyxoaeas/1blx5nOhdmOD579dqrhxRU/0869ea5f2085437792980c400e2f8daa/Privacy_preserving_features_in_MetaMask.png?w=2048&q=75&fm=avif)\\
\\
**Privacy preserving features in MetaMask** \\
\\
MetaMask is committed to offering an exceptional, privacy preserving crypto wallet experience that keeps you safe and lets you configure settings based on your preferences.](https://metamask.io/news/product-spotlight-privacy-preserving-features-in-metamask)