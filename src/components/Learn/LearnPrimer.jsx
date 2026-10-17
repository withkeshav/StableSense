/**
 * Opening primer card for the Learn tab: what the modules cover and how to read them.
 */
export default function LearnPrimer() {
  return (
    <section class="card mb-4">
      <div class="card-header">
        <div class="card-title">Stablecoins, explained</div>
      </div>
      <div class="card-body">
        <p class="mb-0">
          Everything in StableSense is built on one idea: a stablecoin is a token engineered to hold
          steady value against some reference, usually the US dollar but not always. This dashboard
          tracks five dollar-pegged coins, which is the common case. These modules cover how pegs
          work, how they fail, the wider landscape beyond the dollar, and how the signals here help
          you see stress before it becomes a headline. Where the market is live, the lessons carry a
          small observation computed from this dashboard's data at this moment.
        </p>
        <p class="mt-3 mb-0">
          <a class="learn-link-btn" href="/research/#taxonomy" target="_blank" rel="noopener noreferrer">Read the full research: State of Stablecoins &rsaquo;</a>
        </p>
      </div>
    </section>
  );
}
