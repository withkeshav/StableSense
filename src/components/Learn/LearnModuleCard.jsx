import LearnLesson from './LearnLesson.jsx';

/**
 * One collapsible learning module: a numbered header with a summary, then the
 * lessons. The first module starts open.
 */
export default function LearnModuleCard({ mod, index, isOpen, onToggle, observationsById }) {
  return (
    <section id={`module-${mod.id}`} class={`card learn-module mb-4 ${isOpen ? 'open' : ''}`}>
      <button
        type="button"
        class="learn-module-header"
        onClick={onToggle}
        aria-expanded={isOpen}
      >
        <span class="learn-module-number">{index}</span>
        <span class="learn-module-title-wrap">
          <b>{mod.title}</b>
          <small>{mod.summary}</small>
        </span>
        <span class="learn-module-meta">
          {mod.lessons.length} lessons{mod.level ? ` · ${mod.level}` : ''}
        </span>
        <span class="learn-module-expand" aria-hidden="true">›</span>
      </button>
      <div class="learn-module-detail">
        {mod.lessons.map((lesson) => {
          const observation = lesson.observationId ? observationsById[lesson.observationId] : null;
          return <LearnLesson lesson={lesson} observation={observation} key={lesson.id} />;
        })}
        {mod.moduleLink ? (
          <p class="learn-lesson" style="padding-top:8px">
            <a class="learn-link-btn" href={mod.moduleLink.href} target="_blank" rel="noopener noreferrer">{mod.moduleLink.label} &rsaquo;</a>
          </p>
        ) : null}
      </div>
    </section>
  );
}
