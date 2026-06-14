import React from 'react';
import { ChevronDown } from 'lucide-react';

function Section({ label, children }) {
  if (!children) return null;
  return (
    <div>
      <p className="text-[11px] font-medium text-neutral-400 dark:text-neutral-500 uppercase tracking-wide mb-1.5">{label}</p>
      <div className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed whitespace-pre-line">{children}</div>
    </div>
  );
}

export default function NarrativePanel({ narrative }) {
  if (!narrative) return null;

  // Backwards compatible with the older prompt shape (progressNarrative / frameworkInterpretation)
  const bottomLine = narrative.bottomLine || narrative.progressNarrative;
  const howItsGoing = narrative.howItsGoing || narrative.frameworkInterpretation;
  const statEvidence = narrative.statEvidence;

  return (
    <div className="rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 p-6 space-y-5 shadow-sm">
      <div>
        <span className="text-xs font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400">What the data is saying</span>
      </div>

      {bottomLine && (
        <Section label="Bottom line">{bottomLine}</Section>
      )}
      {howItsGoing && (
        <Section label="How it is going">{howItsGoing}</Section>
      )}
      {narrative.whyThisIsHappening && (
        <Section label="Why this is happening">{narrative.whyThisIsHappening}</Section>
      )}
      {narrative.dataQualityCaveats && (
        <Section label="Worth knowing">{narrative.dataQualityCaveats}</Section>
      )}

      {statEvidence && (
        <details className="group rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900/40">
          <summary className="flex items-center justify-between gap-2 cursor-pointer px-4 py-3 text-xs font-medium text-neutral-600 dark:text-neutral-300 select-none list-none">
            <span>See the math and frameworks behind this</span>
            <ChevronDown className="w-4 h-4 text-neutral-400 group-open:rotate-180 transition-transform" />
          </summary>
          <div className="px-4 pb-4 text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed whitespace-pre-line">
            {statEvidence}
          </div>
        </details>
      )}
    </div>
  );
}
