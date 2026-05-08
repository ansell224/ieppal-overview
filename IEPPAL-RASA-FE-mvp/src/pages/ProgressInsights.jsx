import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { apiClient } from '../apiClient';
import AiLoadingAnimation from '../components/AiLoadingAnimation';
import ProgressTimelineChart from '../components/ProgressTimelineChart';
import StatBadge from '../components/StatBadge';
import NarrativePanel from '../components/NarrativePanel';
import NextActionCard from '../components/NextActionCard';

const INSIGHTS_MESSAGES = [
  "Pulling this goal's survey history...",
  'Splitting responses into baseline and strategy phases...',
  'Running the trend test...',
  'Checking whether the change is bigger than noise...',
  'Framing findings in plain English...',
  'Writing the narrative and recommendation...',
  'Still working...',
];

function formatTrend(d) {
  if (d === 'improving') return 'Scores are rising over time';
  if (d === 'declining') return 'Scores are falling over time';
  if (d === 'flat') return 'Scores are holding steady';
  return '-';
}

function formatEffect(tauU) {
  if (tauU == null) return '-';
  const m = Math.abs(tauU);
  if (m >= 0.6) return 'Large shift from baseline';
  if (m >= 0.2) return 'Moderate shift from baseline';
  return 'Small shift from baseline';
}

function formatReliable(flag) {
  if (flag === true) return 'The improvement is bigger than chance';
  if (flag === false) return 'Could still be chance variation';
  return '-';
}

function formatTier(tier) {
  if (tier === 'Tier 1') return 'On track — keep the current plan';
  if (tier === 'Tier 2') return 'Working, but could be tuned for more gains';
  if (tier === 'Tier 3') return 'Current plan is not enough — change strategy';
  return tier || '-';
}

function tierLabel(tier) {
  if (tier === 'Tier 1') return 'Tier 1 of 3';
  if (tier === 'Tier 2') return 'Tier 2 of 3';
  if (tier === 'Tier 3') return 'Tier 3 of 3';
  return tier || '-';
}

function fmtNum(v, digits = 2) {
  if (v == null || !Number.isFinite(v)) return 'n/a';
  return Number(v).toFixed(digits);
}

function fmtP(p) {
  if (p == null || !Number.isFinite(p)) return 'n/a';
  if (p < 0.001) return '<0.001';
  return p.toFixed(3);
}

function relativeTime(iso) {
  if (!iso) return '';
  const t = new Date(iso).getTime();
  const diff = Date.now() - t;
  const mins = Math.round(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs === 1 ? '' : 's'} ago`;
  const days = Math.round(hrs / 24);
  if (days < 30) return `${days} day${days === 1 ? '' : 's'} ago`;
  return new Date(iso).toLocaleDateString();
}

export default function ProgressInsights() {
  const { goalId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError('');
      try {
        // Cache-first: show the previous insight immediately if we have one.
        const cached = await apiClient.getCachedGoalInsights(goalId).catch(() => null);
        if (cancelled) return;
        if (cached && cached.narrative) {
          setData(cached);
        } else {
          const fresh = await apiClient.getGoalInsights(goalId);
          if (cancelled) return;
          setData(fresh);
        }
      } catch (e) {
        if (!cancelled) setError(e.message || 'Failed to load insights');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [goalId]);

  async function handleRefresh() {
    setRefreshing(true);
    setError('');
    try {
      // User explicitly asked to regenerate, so bypass the fingerprint check.
      const fresh = await apiClient.getGoalInsights(goalId, { force: true });
      setData(fresh);
    } catch (e) {
      setError(e.message || 'Failed to refresh');
    } finally {
      setRefreshing(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 shadow-sm">
          <AiLoadingAnimation messages={INSIGHTS_MESSAGES} hint="First run can take 30 to 60 seconds" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="rounded-2xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 p-6 text-sm text-rose-700 dark:text-rose-300">
          {error}
        </div>
      </div>
    );
  }

  const report = data?.report;
  const narrative = data?.narrative;
  const analysis = data ? { extract: data.extract, goalTitle: data.goalTitle } : null;
  const generatedAt = data?.generatedAt;
  const fromCache = data?.fromCache;

  if (!report) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-8 text-sm text-neutral-500 dark:text-neutral-400">
        No analysis available.
      </div>
    );
  }

  if (report.insufficientData) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-8 space-y-4">
        <button onClick={() => navigate(-1)} className="flex items-center space-x-2 px-3 py-2 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-600 dark:text-neutral-300 hover:text-neutral-800 dark:hover:text-neutral-100 hover:border-neutral-400 dark:hover:border-neutral-500 hover:shadow-sm transition-all text-sm">
          <span className="text-base leading-none">&lsaquo;</span>
          <span>Back</span>
        </button>
        <div className="rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 p-6">
          <p className="text-xs text-pink-600 uppercase tracking-wide mb-2">Progress insights</p>
          <h1 className="font-serif text-2xl text-neutral-900 dark:text-neutral-100 mb-3">Not enough data yet</h1>
          <p className="text-sm text-neutral-600 dark:text-neutral-300">{report.narrativeHint}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
      <button onClick={() => navigate(-1)} className="flex items-center space-x-2 px-3 py-2 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-600 dark:text-neutral-300 hover:text-neutral-800 dark:hover:text-neutral-100 hover:border-neutral-400 dark:hover:border-neutral-500 hover:shadow-sm transition-all text-sm">
        <span className="text-base leading-none">&lsaquo;</span>
        <span>Back</span>
      </button>

      <header className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-pink-500" />
            <span className="text-xs font-medium uppercase tracking-wider text-pink-600 dark:text-pink-400">Progress insights</span>
          </div>
          <h1 className="font-serif text-3xl text-neutral-900 dark:text-neutral-100 leading-tight">
            {narrative?.headline || analysis?.goalTitle || 'Progress analysis'}
          </h1>
          {generatedAt && (
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2">
              {fromCache ? 'Last analyzed' : 'Analyzed'} {relativeTime(generatedAt)}
              {fromCache && ' (cached)'}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={handleRefresh}
          disabled={refreshing}
          title="Re-run the full analysis using the latest survey responses. Takes about 30 to 60 seconds."
          className="shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl border border-dashed border-pink-300 dark:border-pink-500/40 text-pink-600 dark:text-pink-400 text-sm font-medium hover:border-pink-400 dark:hover:border-pink-500/70 hover:bg-pink-50 dark:hover:bg-pink-500/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Sparkles className="w-4 h-4" />
          {refreshing ? 'Rerunning...' : 'Refresh analysis'}
        </button>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <StatBadge
          mathLabel="Trend test (Mann-Kendall)"
          mathValue={`τ = ${fmtNum(report.overall?.trend?.tau)} · p = ${fmtP(report.overall?.trend?.pTwoSided)}`}
          interpretation={formatTrend(report.overall?.trend?.direction)}
          info={{
            title: 'Mann-Kendall trend test',
            whatItIs: 'A simple test that looks at every pair of survey scores in time order and counts how often later scores are higher than earlier ones.',
            howToRead: 'τ (tau) goes from -1 (always getting worse) to +1 (always getting better). 0 means no direction. p is the chance that the pattern is a coincidence — the smaller, the more we trust the trend.',
          }}
        />
        <StatBadge
          mathLabel="Effect size (Tau-U)"
          mathValue={`|τ-U| = ${report.bestStrategy?.tauU != null ? fmtNum(Math.abs(report.bestStrategy.tauU)) : 'n/a'}`}
          interpretation={formatEffect(report.bestStrategy?.tauU)}
          info={{
            title: 'Tau-U effect size',
            whatItIs: 'How much the strategy-phase scores sit above baseline scores. Designed specifically for single-student IEP-style data.',
            howToRead: '|τ-U| ≥ 0.6 = large shift (clearly different), 0.2 to 0.6 = moderate shift, below 0.2 = small shift. Higher = bigger jump between baseline and strategy.',
          }}
        />
        <StatBadge
          mathLabel="Reliable Change Index (RCI)"
          mathValue={`RCI = ${report.bestStrategy?.rci != null ? fmtNum(report.bestStrategy.rci) : 'n/a'} · threshold ±1.96`}
          interpretation={formatReliable(report.bestStrategy?.rciReliable)}
          reliable={report.bestStrategy?.rciReliable}
          info={{
            title: 'Reliable Change Index',
            whatItIs: 'Scores bounce around week to week even when nothing has really changed (mood, measurement error, etc). RCI asks: is the jump we see bigger than that normal wobble?',
            howToRead: '|RCI| ≥ 1.96 means we are 95% confident something actually shifted, not just random variation. Below that, the change could still be coincidence.',
          }}
        />
        <StatBadge
          mathLabel="Support level (RTI framework)"
          mathValue={tierLabel(report.tier)}
          interpretation={formatTier(report.tier)}
          footnote={report.tierReason}
          info={{
            title: 'How this tier is chosen',
            whatItIs: 'RTI tier is picked by running a fixed set of rules in order against the numbers on the other three cards. The first rule that matches wins.',
            howToRead: 'Tier 1 if scores have basically hit the ceiling (mastered) OR no downgrade rule fires. Tier 2 if one strategy is reliably positive (Tau-U > 0 AND RCI ≥ 1.96). Tier 3 if the latest phase is flat with ≥ 6 responses, OR scores are declining with p < 0.05, OR the score is stuck at the floor across ≥ 4 responses. The "how this was decided" line on this card shows which rule actually fired.',
          }}
        />
      </section>

      <ProgressTimelineChart extract={analysis?.extract} report={report} />

      <NarrativePanel narrative={narrative} report={report} />

      <NextActionCard action={narrative?.recommendedAction} goalId={goalId} />
    </div>
  );
}
