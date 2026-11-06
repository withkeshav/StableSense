import { useEffect, useMemo, useState } from 'preact/hooks';
import { buildFreshness } from '../../lib/freshness.js';
import { buildLearnObservations } from '../../lib/insights.js';
import { MODULES } from '../Learn/modules.js';
import LearnHero from '../Learn/LearnHero.jsx';
import LearnPrimer from '../Learn/LearnPrimer.jsx';
import LearnModuleCard from '../Learn/LearnModuleCard.jsx';
import LearnGlossary from '../Learn/LearnGlossary.jsx';
import LearnSources from '../Learn/LearnSources.jsx';
import LearnDisclaimer from '../Learn/LearnDisclaimer.jsx';

export default function LearnTab({ data, alerts }) {
  const [openModule, setOpenModule] = useState(MODULES[0]?.id || null);

  const observationsById = useMemo(() => {
    const map = {};
    const state = buildFreshness({ spotObservedAt: data?.spotObservedAt, supplyObservedAt: data?.supplyObservedAt, complete: data?.coverage?.complete }).overallState;
    if (state !== 'Current') return map;
    for (const obs of buildLearnObservations(data, alerts)) map[obs.id] = { ...obs, observedAt: data?.observedAt ?? data?.supplyObservedAt };
    return map;
  }, [data, alerts]);

  useEffect(() => {
    let timer;
    const followHash = () => {
      const hash = window.location.hash;
      if (!hash.startsWith('#lesson-')) return;
      const lessonId = hash.slice('#lesson-'.length);
      const module = MODULES.find((m) => m.lessons.some((l) => l.id === lessonId));
      if (!module) return;
      setOpenModule(module.id);
      clearTimeout(timer);
      timer = setTimeout(() => document.getElementById(`lesson-${lessonId}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0);
    };
    followHash();
    const followClick = (event) => {
      const link = event.target.closest?.('a[href^="#lesson-"]');
      if (link) setTimeout(followHash, 0);
    };
    window.addEventListener('hashchange', followHash);
    document.addEventListener('click', followClick);
    return () => { clearTimeout(timer); window.removeEventListener('hashchange', followHash); document.removeEventListener('click', followClick); };
  }, []);

  return (
    <div class="tab-content active">
      <LearnHero />
      <LearnPrimer />

      {MODULES.map((mod, index) => (
        <LearnModuleCard
          mod={mod}
          index={String(index + 1).padStart(2, '0')}
          isOpen={openModule === mod.id}
          onToggle={() => setOpenModule(openModule === mod.id ? null : mod.id)}
          observationsById={observationsById}
          key={mod.id}
        />
      ))}

      <LearnGlossary />
      <LearnSources />
      <LearnDisclaimer />
    </div>
  );
}
