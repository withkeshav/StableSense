import DepegCaseStudy from '../Sections/DepegCaseStudy.jsx';
import { RESEARCH_SHELF, DEPEG_CASE_ORDER, AS_OF, REVIEW_AS_OF } from '../../utils/depeg-cases.js';

export default function ResearchTab() {
  const feature = RESEARCH_SHELF.find((t) => t.kind === 'feature');
  const topics = RESEARCH_SHELF.filter((t) => t.kind !== 'feature');

  return (
    <div class="tab-content active research-page">
      <section class="research-library-head">
        <div>
          <p class="eyebrow">STABLESENSE RESEARCH LIBRARY</p>
          <h1>
            Learn the mechanism <em>behind the move.</em>
          </h1>
          <p>
            Short, sourced explainers that make live stablecoin signals easier to interpret.
            The full report lives in the State of Stablecoins hub - this tab opens the same figures, not a second copy.
          </p>
        </div>
        <div class="research-library-stats">
          <div>
            <b>Full</b>
            <span>research hub</span>
          </div>
          <div>
            <b>{String(DEPEG_CASE_ORDER.length).padStart(2, '0')}</b>
            <span>case studies</span>
          </div>
          <div>
            <b>{REVIEW_AS_OF}</b>
            <span>research reviewed as of</span>
          </div>
        </div>
      </section>

      <p class="research-hub-line">
        Read the full sourced report, reviewed as of {REVIEW_AS_OF}, in{' '}
        <a href="/research/" target="_blank" rel="noopener noreferrer">Research Hub →</a>
      </p>

      <section class="research-shelf">
        {feature ? (
          <a class="research-feature glass signal-lens" href={feature.href} target="_blank" rel="noopener noreferrer">
            <span>{feature.kicker}</span>
            <h2>{feature.title}</h2>
            <p>{feature.body}</p>
            <span class="text-btn">Open in research hub →</span>
          </a>
        ) : null}
        {topics.map((t) => (
          <a class="research-topic" key={t.id} href={t.href} target="_blank" rel="noopener noreferrer">
            <div>
              <b>{t.title}</b>
              <span>{t.subtitle}</span>
            </div>
            <span aria-hidden="true">→</span>
          </a>
        ))}
      </section>

      <DepegCaseStudy />

      <p class="text-muted small mt-4 mb-0">
        The {DEPEG_CASE_ORDER.length} case studies above are historical events, fixed at the dates they
        happened. Their figures are as of {AS_OF}. That date is the as-of of the historical price and event
        data only, and it is not the freshness of the research interpreting them: the latest reconciled
        research review is as of {REVIEW_AS_OF}, and several questions it covers remain open, including how much
        net new Treasury demand stablecoins create, the current primary AUM of tokenized funds such as BUIDL, the
        commerce share of agent payment rails, and whether partner incentives change real stablecoin use. The
        hub states those as unresolved rather than filling them with an estimate. Verify any claim against its
        primary source before acting on it.
      </p>
    </div>
  );
}