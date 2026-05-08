// src/components/ProgressTimelineChart.jsx
import React, { useMemo } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  TimeScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";
import "chartjs-adapter-date-fns";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  TimeScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

const LINE_COLOR = "#ec4899";
const PHASE_PALETTE = [
  { fill: "rgba(148, 163, 184, 0.14)", strip: "rgba(148, 163, 184, 0.28)", label: "#475569" },
  { fill: "rgba(236, 72, 153, 0.12)",  strip: "rgba(236, 72, 153, 0.25)",  label: "#be185d" },
  { fill: "rgba(245, 158, 11, 0.12)",  strip: "rgba(245, 158, 11, 0.25)",  label: "#b45309" },
  { fill: "rgba(16, 185, 129, 0.12)",  strip: "rgba(16, 185, 129, 0.25)",  label: "#047857" },
  { fill: "rgba(59, 130, 246, 0.12)",  strip: "rgba(59, 130, 246, 0.25)",  label: "#1d4ed8" },
  { fill: "rgba(139, 92, 246, 0.12)",  strip: "rgba(139, 92, 246, 0.25)",  label: "#6d28d9" },
];

export default function ProgressTimelineChart({ extract, report }) {
  const phases = extract?.phases || [];

  const points = useMemo(
    () =>
      phases.flatMap((p) =>
        (p.values || []).map((v) => ({
          x: new Date(v.tIsoDate).valueOf(),
          y: v.composite,
          phase: p.label,
        }))
      ),
    [phases]
  );

  // Each phase spans from its first dot to the next phase's first dot (so bands touch seamlessly).
  const phaseRanges = useMemo(() => {
    const ranges = phases
      .map((p) => {
        const vs = p.values || [];
        return {
          label: p.label,
          x1: vs[0] ? new Date(vs[0].tIsoDate).valueOf() : null,
          x2: vs[vs.length - 1] ? new Date(vs[vs.length - 1].tIsoDate).valueOf() : null,
          n: vs.length,
        };
      })
      .filter((r) => r.x1 != null && r.x2 != null);
    for (let i = 0; i < ranges.length - 1; i++) {
      const midpoint = (ranges[i].x2 + ranges[i + 1].x1) / 2;
      ranges[i].x2End = midpoint;
      ranges[i + 1].x1Start = midpoint;
    }
    if (ranges.length) {
      if (ranges[0].x1Start == null) ranges[0].x1Start = ranges[0].x1;
      if (ranges[ranges.length - 1].x2End == null) ranges[ranges.length - 1].x2End = ranges[ranges.length - 1].x2;
    }
    return ranges;
  }, [phases]);

  if (!points.length) {
    return (
      <div className="h-72 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl p-6 flex items-center justify-center">
        <p className="text-neutral-400 dark:text-neutral-500 text-sm font-serif italic">
          Not enough survey responses to plot a timeline yet.
        </p>
      </div>
    );
  }

  const scaleMin = extract?.scaleMin ?? 1;
  const scaleMax = extract?.scaleMax ?? 5;

  const chartData = {
    datasets: [
      {
        label: "Composite score",
        data: points,
        parsing: false,
        borderColor: LINE_COLOR,
        backgroundColor: LINE_COLOR,
        borderWidth: 2.5,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: "#fff",
        pointBorderColor: LINE_COLOR,
        pointBorderWidth: 2,
        tension: 0.25,
        clip: false,
      },
    ],
  };

  const Y_PAD = (scaleMax - scaleMin) * 0.08;
  const dataMinX = points.reduce((m, p) => (p.x < m ? p.x : m), points[0].x);
  const dataMaxX = points.reduce((m, p) => (p.x > m ? p.x : m), points[0].x);
  const xRange = Math.max(dataMaxX - dataMinX, 1);
  const X_PAD = xRange * 0.03;

  // Decide the verdict banner above the chart based on the latest phase + analyzer output.
  const currentPhase = phases[phases.length - 1];
  const currentStrategyLabel =
    currentPhase && currentPhase.label !== 'Baseline' ? currentPhase.label : null;
  const verbLookup = {
    'keep-current':    { tone: 'emerald', text: (s) => `${s} is helping — keep going` },
    'advance-difficulty': { tone: 'emerald', text: (s) => `${s} is working — ready to level up` },
    'change-strategy': { tone: 'amber',   text: (s) => `${s} is not moving the needle — try a different approach` },
    'stop-and-diagnose': { tone: 'rose',  text: (s) => `${s} may be hurting progress — pause and review` },
    'scaffold-more':   { tone: 'amber',   text: (s) => `${s} needs more scaffolding before it can work` },
  };
  let banner = null;
  if (!currentStrategyLabel) {
    banner = {
      tone: 'neutral',
      text: 'No strategy assigned yet — this is just the baseline.',
      reason: 'Every survey response so far was recorded before any strategy had its "start date" set on this goal.',
    };
  } else if (report?.recommendedAction && verbLookup[report.recommendedAction]) {
    const v = verbLookup[report.recommendedAction];
    banner = { tone: v.tone, text: v.text(currentStrategyLabel), reason: report.tierReason };
  } else {
    banner = {
      tone: 'neutral',
      text: `${currentStrategyLabel} is being tracked — not enough data yet for a verdict.`,
      reason: 'At least 2 responses per phase and a pattern we can actually measure are needed before we call it.',
    };
  }
  const bannerTone = {
    emerald: 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-500/10 dark:border-emerald-500/30 dark:text-emerald-300',
    amber:   'bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-500/10 dark:border-amber-500/30 dark:text-amber-300',
    rose:    'bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-500/10 dark:border-rose-500/30 dark:text-rose-300',
    neutral: 'bg-neutral-100 border-neutral-200 text-neutral-700 dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-200',
  }[banner.tone];

  // Fill each phase band inside the chart area AND draw a labeled strip in the padding
  // ABOVE the plot (so dots near the top of the scale can never overlap the strip).
  const STRIP_H = 22;
  const STRIP_GAP = 10; // gap between strip bottom and chartArea top

  const phaseShadingPlugin = {
    id: "phaseShading",
    beforeDatasetsDraw(chart) {
      const { ctx, chartArea, scales } = chart;
      if (!chartArea || !scales?.x) return;
      const xScale = scales.x;
      ctx.save();

      phaseRanges.forEach((r, i) => {
        const palette = PHASE_PALETTE[i % PHASE_PALETTE.length];
        const bandLeft = Math.max(chartArea.left, xScale.getPixelForValue(r.x1Start));
        const bandRight = Math.min(chartArea.right, xScale.getPixelForValue(r.x2End));
        if (bandRight <= bandLeft) return;

        // Fill behind the plotted line (inside chart area)
        ctx.fillStyle = palette.fill;
        ctx.fillRect(bandLeft, chartArea.top, bandRight - bandLeft, chartArea.bottom - chartArea.top);

        // Vertical divider between phases, inside chart area
        if (i > 0) {
          ctx.strokeStyle = "rgba(0,0,0,0.15)";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(bandLeft + 0.5, chartArea.top);
          ctx.lineTo(bandLeft + 0.5, chartArea.bottom);
          ctx.stroke();
        }

        // Labeled strip ABOVE the chart area, inside the top layout padding
        const stripTop = chartArea.top - STRIP_GAP - STRIP_H;
        if (stripTop < 0) return; // not enough padding
        ctx.fillStyle = palette.strip;
        ctx.beginPath();
        const radius = 5;
        const w = bandRight - bandLeft;
        ctx.moveTo(bandLeft + radius, stripTop);
        ctx.arcTo(bandLeft + w, stripTop, bandLeft + w, stripTop + STRIP_H, radius);
        ctx.arcTo(bandLeft + w, stripTop + STRIP_H, bandLeft, stripTop + STRIP_H, radius);
        ctx.arcTo(bandLeft, stripTop + STRIP_H, bandLeft, stripTop, radius);
        ctx.arcTo(bandLeft, stripTop, bandLeft + w, stripTop, radius);
        ctx.closePath();
        ctx.fill();

        // Phase label
        if (w > 40) {
          ctx.save();
          ctx.beginPath();
          ctx.rect(bandLeft + 4, stripTop, w - 8, STRIP_H);
          ctx.clip();
          ctx.fillStyle = palette.label;
          ctx.font = "600 10px 'Inter', system-ui, sans-serif";
          ctx.textBaseline = "middle";
          ctx.textAlign = "center";
          ctx.fillText(r.label.toUpperCase(), bandLeft + w / 2, stripTop + STRIP_H / 2);
          ctx.restore();
        }
      });

      ctx.restore();
    },
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    layout: { padding: { top: STRIP_H + STRIP_GAP + 6, right: 12, bottom: 0, left: 0 } },
    plugins: {
      legend: { display: false },
      tooltip: {
        mode: "nearest",
        intersect: false,
        position: "nearest",
        backgroundColor: "#171717",
        cornerRadius: 8,
        padding: { top: 10, bottom: 10, left: 14, right: 14 },
        displayColors: false,
        titleFont: { size: 13, weight: "600", family: "'Georgia', serif" },
        bodyFont: { size: 12, family: "'Georgia', serif" },
        titleColor: "#fff",
        bodyColor: "rgba(255,255,255,0.78)",
        callbacks: {
          title(items) {
            const raw = items[0]?.raw;
            if (!raw?.x) return "";
            const d = new Date(raw.x);
            return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
          },
          label(ctx) {
            const raw = ctx.raw || {};
            return [`Average score: ${Number(raw.y).toFixed(2)} / ${scaleMax}`, raw.phase ? `Strategy phase: ${raw.phase}` : ''].filter(Boolean);
          },
        },
      },
    },
    scales: {
      x: {
        type: "time",
        min: dataMinX - X_PAD,
        max: dataMaxX + X_PAD,
        time: {
          tooltipFormat: "PP",
          displayFormats: {
            day: "MMM d",
            week: "MMM d",
            month: "MMM yyyy",
          },
        },
        title: {
          display: true,
          text: "Date of survey response",
          color: "#525252",
          font: { size: 12, weight: "600", family: "'Inter', system-ui, sans-serif" },
          padding: { top: 10 },
        },
        ticks: {
          color: "#525252",
          font: { size: 10 },
          maxRotation: 0,
          autoSkip: true,
          autoSkipPadding: 12,
        },
        grid: {
          display: true,
          color: "rgba(229,229,229,0.7)",
          drawBorder: false,
          lineWidth: 1,
          drawTicks: true,
        },
        border: { color: "#e5e5e5" },
      },
      y: {
        min: scaleMin - Y_PAD,
        max: scaleMax + Y_PAD,
        title: {
          display: true,
          text: `Average score (${scaleMin} = struggling  →  ${scaleMax} = mastered)`,
          color: "#525252",
          font: { size: 12, weight: "600", family: "'Inter', system-ui, sans-serif" },
          padding: { bottom: 10 },
        },
        ticks: {
          color: "#525252",
          font: { size: 11 },
          stepSize: 1,
          precision: 0,
          callback: (v) => (Number.isInteger(v) && v >= scaleMin && v <= scaleMax ? v : ''),
        },
        grid: {
          color: "rgba(229,229,229,0.9)",
          drawBorder: false,
          lineWidth: 1,
        },
        border: { display: false },
      },
    },
  };

  return (
    <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl p-6">
      <div className="mb-4">
        <p className="text-[11px] font-medium text-neutral-400 dark:text-neutral-500 uppercase tracking-wide mb-1.5">Progress over time</p>
        <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
          Each dot is one weekly survey response. The dot's height is the <em>average</em> of the 1-to-{scaleMax} scores the teacher recorded on that date across every rating-scale item in this goal's survey. A rising line means the student is getting better at this goal; a flat line means no real change; falling means getting worse.
        </p>
      </div>

      {banner && (
        <div className={`rounded-xl border px-4 py-3 mb-4 ${bannerTone}`}>
          <p className="text-sm font-semibold leading-snug">{banner.text}</p>
          {banner.reason && (
            <p className="text-xs mt-1.5 leading-relaxed opacity-80">
              <span className="font-semibold">How this was decided: </span>{banner.reason}
            </p>
          )}
        </div>
      )}

      <div className="h-80">
        <Line data={chartData} options={options} plugins={[phaseShadingPlugin]} />
      </div>

      {phaseRanges.length > 0 && (
        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-700">
          {phaseRanges.map((r, i) => {
            const palette = PHASE_PALETTE[i % PHASE_PALETTE.length];
            return (
              <span key={i} className="inline-flex items-center gap-1.5 text-[11px] text-neutral-600 dark:text-neutral-300">
                <span className="inline-block w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: palette.strip }} />
                <span className="font-medium">{r.label}</span>
                <span className="text-neutral-400 dark:text-neutral-500">· {r.n} response{r.n === 1 ? '' : 's'}</span>
              </span>
            );
          })}
        </div>
      )}

      <p className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-3 leading-relaxed">
        Data source: this goal's weekly progress survey (rating-scale items only). Colored bands align with each strategy's start and end dates on this goal.
      </p>
    </div>
  );
}
