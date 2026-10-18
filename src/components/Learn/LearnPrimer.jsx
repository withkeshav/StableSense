/**
 * Short guide to the page. The hero carries the path; this card explains how a
 * lesson is built so the reader knows what to expect.
 */
export default function LearnPrimer() {
  return (
    <section class="learn-how card mb-4">
      <div class="learn-how-copy">
        <p class="panel-kicker">HOW TO USE THIS PAGE</p>
        <h2>One idea, one example, one check.</h2>
        <p>
          Start with Foundations. Each lesson gives the core idea, a dated example, and what it does
          not prove. Open the advanced modules when you need them. Live observations are computed from
          this dashboard; dated examples keep their source date.
        </p>
      </div>
      <div class="learn-how-steps">
        <span><b>1</b>Read the idea.</span>
        <span><b>2</b>Test it on the example.</span>
        <span><b>3</b>Answer the check.</span>
      </div>
    </section>
  );
}
