const PATH = [
  { n: '01', title: 'The promise', text: 'A token with a target.', href: '#lesson-what-is' },
  { n: '02', title: 'The peg', text: 'Why the price returns.', href: '#lesson-peg-mechanics' },
  { n: '03', title: 'The backing', text: 'What the claim rests on.', href: '#lesson-collateral-types' },
  { n: '04', title: 'The break', text: 'What a depeg looks like.', href: '#lesson-depeg-causes' },
  { n: '05', title: 'The dashboard', text: 'Read the live signals.', href: '#lesson-read-dashboard' },
];

const OUTCOMES = [
  'Tell a peg target from a market price.',
  'Explain why a coin can trade below $1.',
  'Read supply, market cap and volume correctly.',
  'Separate a chain move from a payment.',
];

export default function LearnHero() {
  return (
    <section class="learn-hero" aria-labelledby="learn-hero-title">
      <div class="learn-hero-copy">
        <p class="learn-eyebrow">Learn with live data</p>
        <h1 id="learn-hero-title">Start with the promise. <em>Then read the price.</em></h1>
        <p class="learn-hero-sub">
          A stablecoin is a token with a target. The target can hold, drift or break. These lessons
          explain what the peg promises, what sits behind it, and how to read this dashboard without
          confusing a market price with a guarantee.
        </p>

        <div class="learn-path" aria-label="Learning path">
          {PATH.map((step) => (
            <a class="learn-step" href={step.href} key={step.n}>
              <span class="learn-step-num">{step.n}</span>
              <span class="learn-step-copy"><b>{step.title}</b><small>{step.text}</small></span>
            </a>
          ))}
        </div>

        <p class="learn-terms">
          Key terms:
          <a href="#term-peg">peg</a>
          <a href="#term-basis-point">bps</a>
          <a href="#term-redemption">redemption</a>
          <a href="#term-collateral">collateral</a>
          <a href="#term-depeg">depeg</a>
          <a href="#term-reserve-attestation">attestation</a>
        </p>
      </div>

      <aside class="learn-hero-side">
        <p class="panel-kicker">What you will be able to do</p>
        <ul>
          {OUTCOMES.map((item) => <li key={item}>{item}</li>)}
        </ul>
        <a class="learn-link-btn" href="#learn-sources">Sources and dates &rsaquo;</a>
      </aside>
    </section>
  );
}
