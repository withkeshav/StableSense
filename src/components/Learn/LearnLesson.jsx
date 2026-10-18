const OBSERVATION_NOTE = 'Live, computed from this dashboard\'s data - not AI-generated.';

/**
 * One lesson: a core idea, the explanation, a dated example, the limit of the
 * claim, an optional self-check and any live observation or source links.
 */
export default function LearnLesson({ lesson, observation }) {
  return (
    <div class="learn-lesson" id={`lesson-${lesson.id}`}>
      <div class="learn-lesson-head">
        <h3 class="learn-lesson-title">{lesson.title}</h3>
        {lesson.lastUpdated ? <span class="learn-lesson-date">Updated {lesson.lastUpdated}</span> : null}
      </div>
      {lesson.core ? <p class="learn-core">{lesson.core}</p> : null}
      <p class="learn-body">{lesson.body}</p>
      {lesson.example ? (
        <div class="learn-example">
          <span>Example</span>
          <p>{lesson.example}</p>
        </div>
      ) : null}
      {lesson.caveat ? (
        <p class="learn-caveat"><strong>What this does not prove:</strong> {lesson.caveat}</p>
      ) : null}
      {lesson.unknown ? (
        <p class="learn-caveat"><strong>Open question:</strong> {lesson.unknown}</p>
      ) : null}
      {lesson.check ? (
        <details class="learn-check">
          <summary>Check yourself</summary>
          <p><strong>{lesson.check.q}</strong> {lesson.check.a}</p>
        </details>
      ) : null}
      {lesson.sources && lesson.sources.length ? (
        <p class="learn-sources-line">
          Sources:{' '}
          {lesson.sources.map((source, index) => (
            <span key={source.href}>
              {index > 0 ? ' | ' : null}
              <a href={source.href} target="_blank" rel="noopener noreferrer">{source.label}</a>
            </span>
          ))}
        </p>
      ) : null}
      {lesson.hubLink ? (
        <p class="mb-0" style="margin-top:8px">
          <a class="learn-link-btn" href={lesson.hubLink.href} target="_blank" rel="noopener noreferrer">
            {lesson.hubLink.label} &rsaquo;
          </a>
        </p>
      ) : null}
      {observation ? (
        <div class="learn-observation">
          <div class="learn-observation-label">Live observation</div>
          <p class="mb-0">{observation.text}</p>
          <p class="learn-observation-note mb-0">{OBSERVATION_NOTE}</p>
        </div>
      ) : null}
    </div>
  );
}
