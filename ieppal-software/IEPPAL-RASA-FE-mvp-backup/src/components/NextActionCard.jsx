import React, { useState } from 'react';
import { Check, X, ArrowRight, Eye, Plus, Loader2, CheckCircle2 } from 'lucide-react';
import { apiClient } from '../apiClient';

const VERB_TONE = {
  KEEP: 'from-emerald-500 to-teal-500',
  ADVANCE: 'from-pink-500 to-orange-500',
  CHANGE: 'from-amber-500 to-orange-500',
  STOP: 'from-rose-500 to-red-500',
  COLLECT_MORE_DATA: 'from-neutral-500 to-neutral-700',
};

const VERB_LABEL = {
  KEEP: 'Keep going',
  ADVANCE: 'Level up',
  CHANGE: 'Change approach',
  STOP: 'Stop and diagnose',
  COLLECT_MORE_DATA: 'Collect more data',
};

function Bucket({ icon: Icon, title, items, tint, empty }) {
  const shown = Array.isArray(items) ? items.filter(Boolean) : [];
  if (shown.length === 0 && !empty) return null;
  return (
    <div className="rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 p-4">
      <div className={`flex items-center gap-2 mb-2 ${tint}`}>
        <Icon className="w-4 h-4" />
        <span className="text-[11px] font-semibold uppercase tracking-wide">{title}</span>
      </div>
      {shown.length > 0 ? (
        <ul className="space-y-1.5">
          {shown.map((item, i) => (
            <li key={i} className="text-sm text-neutral-700 dark:text-neutral-200 leading-relaxed flex gap-2">
              <span className="text-neutral-300 dark:text-neutral-600 shrink-0">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-neutral-400 dark:text-neutral-500 italic">{empty}</p>
      )}
    </div>
  );
}

function StrategySuggestion({ suggestion, goalId, onAssigned }) {
  const [state, setState] = useState('idle');
  const [error, setError] = useState('');

  async function handleAssign() {
    if (!suggestion.id) return;
    setState('loading');
    setError('');
    try {
      await apiClient.assignStrategyToGoal(goalId, suggestion.id);
      setState('assigned');
      if (onAssigned) onAssigned(suggestion);
    } catch (e) {
      setState('idle');
      setError(e?.message || 'Could not assign');
    }
  }

  return (
    <div className="rounded-xl border border-pink-200 dark:border-pink-500/30 bg-white dark:bg-neutral-800 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="font-serif text-base text-neutral-900 dark:text-neutral-100 leading-snug">{suggestion.strategyName}</p>
          {suggestion.strategyCategory && (
            <p className="text-[11px] font-medium uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mt-1">
              {suggestion.strategyCategory}
            </p>
          )}
        </div>
        {suggestion.id ? (
          state === 'assigned' ? (
            <span className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-xs font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Assigned
            </span>
          ) : (
            <button
              type="button"
              onClick={handleAssign}
              disabled={state === 'loading'}
              className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-white text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {state === 'loading' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
              Assign to this goal
            </button>
          )
        ) : (
          <span className="shrink-0 inline-flex items-center px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300 text-[11px]">
            Not in library
          </span>
        )}
      </div>
      {suggestion.briefOverview && (
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2 leading-relaxed line-clamp-2">
          {suggestion.briefOverview}
        </p>
      )}
      {suggestion.whyItFits && (
        <div className="mt-3 rounded-lg bg-pink-50 dark:bg-pink-500/10 px-3 py-2 border border-pink-100 dark:border-pink-500/20">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-pink-700 dark:text-pink-300 mb-0.5">Why it fits this student</p>
          <p className="text-xs text-neutral-700 dark:text-neutral-200 leading-relaxed">{suggestion.whyItFits}</p>
        </div>
      )}
      {error && <p className="text-xs text-rose-600 dark:text-rose-400 mt-2">{error}</p>}
    </div>
  );
}

export default function NextActionCard({ action, goalId }) {
  if (!action) return null;
  const tone = VERB_TONE[action.verb] || 'from-pink-500 to-orange-500';
  const verbLabel = VERB_LABEL[action.verb] || action.verb || 'Review';
  const oneLine = action.oneLineWhy || action.justification;

  const hasStructuredBuckets =
    Array.isArray(action.continue) || Array.isArray(action.stop) ||
    Array.isArray(action.tryNext) || Array.isArray(action.watchFor);

  const suggestedStrategies = Array.isArray(action.suggestedStrategies) ? action.suggestedStrategies : [];

  return (
    <div className="rounded-2xl bg-gradient-to-br from-pink-50 to-orange-50 dark:from-pink-500/10 dark:to-orange-500/10 border border-pink-200 dark:border-pink-500/30 p-6 shadow-sm space-y-5">
      <div>
        <span className="text-xs font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Recommended next move</span>
      </div>

      <div>
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-white text-xs font-semibold bg-gradient-to-r ${tone}`}>
          {verbLabel}
        </span>
        <p className="font-serif text-xl text-neutral-900 dark:text-neutral-100 leading-snug mt-3">{action.summary}</p>
        {oneLine && (
          <p className="text-sm text-neutral-600 dark:text-neutral-300 mt-2 leading-relaxed">{oneLine}</p>
        )}
      </div>

      {hasStructuredBuckets && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Bucket
            icon={Check}
            title="Keep doing"
            items={action.continue}
            tint="text-emerald-600 dark:text-emerald-400"
            empty="Nothing to flag as a win yet."
          />
          <Bucket
            icon={X}
            title="Stop doing"
            items={action.stop}
            tint="text-rose-600 dark:text-rose-400"
          />
          <Bucket
            icon={ArrowRight}
            title="Try next"
            items={action.tryNext}
            tint="text-pink-600 dark:text-pink-400"
            empty="No new moves to add right now."
          />
          <Bucket
            icon={Eye}
            title="Watch for"
            items={action.watchFor}
            tint="text-amber-600 dark:text-amber-400"
            empty="No specific signals flagged."
          />
        </div>
      )}

      {suggestedStrategies.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Plus className="w-4 h-4 text-pink-600 dark:text-pink-400" />
            <span className="text-[11px] font-semibold uppercase tracking-wide text-pink-700 dark:text-pink-300">
              Suggested new strategies
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {suggestedStrategies.map((s, i) => (
              <StrategySuggestion key={s.id || s.strategyName || i} suggestion={s} goalId={goalId} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
