import LearnLesson from './LearnLesson.jsx';

/**
 * One collapsible learning module: header toggle, lesson list, optional module link.
 */
export default function LearnModuleCard({ mod, isOpen, onToggle, observationsById }) {
  return (
    <section class={`card learn-module mb-4 ${isOpen ? 'open' : ''}`}>
      <button
        type="button"
        class="learn-module-header"
        onClick={onToggle}
        aria-expanded={isOpen}
      >
        <span>{mod.title}</span>
        <span class="learn-module-expand">›</span>
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
