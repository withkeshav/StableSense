const OBSERVATION_NOTE = 'Live, computed from this dashboard\'s data - not AI-generated.';

/**
 * One lesson body: prose, optional sources, optional hub link, optional open question,
 * and an optional live observation computed from the dashboard's own data.
 */
export default function LearnLesson({ lesson, observation }) {
  return (
    <div class="learn-lesson" id={`lesson-${lesson.id}`}>
      <div class="learn-lesson-title">
        {lesson.title}
        {lesson.lastUpdated ? <span class="learn-lesson-date">Updated {lesson.lastUpdated}</span> : null}
      </div>
      <p class="text-muted small mb-0">{lesson.body}</p>
      {lesson.sources && lesson.sources.length ? (
        <p class="learn-observation-note mb-0">
          Sources:{' '}
          {lesson.sources.map((s, i) => (
            <span key={s.href}>
              {i > 0 ? ' | ' : null}
              <a href={s.href} target="_blank" rel="noopener noreferrer" style="text-decoration:underline">
                {s.label}
              </a>
            </span>
          ))}
        </p>
      ) : null}
      {lesson.hubLink ? (
        <p class="mb-0" style="margin-top:6px">
          <a class="learn-link-btn" href={lesson.hubLink.href} target="_blank" rel="noopener noreferrer">
            {lesson.hubLink.label} &rsaquo;
          </a>
        </p>
      ) : null}
      {lesson.unknown ? (
        <p class="text-muted small mb-0" style="margin-top:6px">
          <strong>Open question:</strong> {lesson.unknown}
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
