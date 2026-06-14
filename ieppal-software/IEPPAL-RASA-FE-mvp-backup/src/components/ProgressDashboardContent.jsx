// src/components/ProgressDashboardContent.jsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

// ---------- Regression (line of best fit) ----------
function computeRegression(scores) {
  if (!scores || scores.length < 2) return null;
  const n = scores.length;
  let sumX = 0,
    sumY = 0,
    sumXY = 0,
    sumXX = 0;

  for (let i = 0; i < n; i++) {
    const x = i + 1;
    const y = scores[i];
    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumXX += x * x;
  }

  const denom = n * sumXX - sumX * sumX;
  if (denom === 0) return null;

  const slope = (n * sumXY - sumX * sumY) / denom;
  const intercept = (sumY - slope * sumX) / n;
  return { slope, intercept };
}

// ---------- Goal crosshair plugin ----------
const goalLinesPlugin = {
  id: "goalLinesPlugin",
  afterDraw(chart) {
    const opts = chart.options.plugins.goalLines;
    if (!opts || !opts.enabled) return;

    const { goalScore, goalWeekLabel } = opts;
    const { ctx, chartArea, scales } = chart;
    if (!chartArea) return;

    const { top, bottom, left, right } = chartArea;
    const xScale = scales.x;
    const yScale = scales.y;

    ctx.save();
    ctx.strokeStyle = "rgba(163,163,163,0.4)";
    ctx.setLineDash([4, 4]);
    ctx.lineWidth = 1;

    if (goalScore != null) {
      const y = yScale.getPixelForValue(goalScore);
      ctx.beginPath();
      ctx.moveTo(left, y);
      ctx.lineTo(right, y);
      ctx.stroke();
    }

    if (goalWeekLabel != null) {
      const labelIndex = chart.data.labels.indexOf(goalWeekLabel);
      if (labelIndex !== -1) {
        const x = xScale.getPixelForValue(labelIndex);
        ctx.beginPath();
        ctx.moveTo(x, top);
        ctx.lineTo(x, bottom);
        ctx.stroke();
      }
    }

    ctx.restore();
  },
};

ChartJS.register(goalLinesPlugin);

// Sidebar gradient colors: pink-500 → orange-500
const GRADIENT_START = "#ec4899";
const GRADIENT_END = "#f97316";

function createLineGradient(chart) {
  if (!chart?.chartArea) return GRADIENT_END;
  const { top, bottom } = chart.chartArea;
  const ctx = chart.ctx;
  const gradient = ctx.createLinearGradient(0, bottom, 0, top);
  gradient.addColorStop(0, GRADIENT_END);   // orange at bottom
  gradient.addColorStop(1, GRADIENT_START); // pink at top
  return gradient;
}

const DEFAULT_POINTS = [
  { label: "Week 1", y: 60 },
  { label: "Week 2", y: 63 },
  { label: "Week 3", y: 66 },
  { label: "Week 4", y: 70 },
  { label: "Week 5", y: 72 },
  { label: "Week 6", y: 75 },
  { label: "Week 7", y: 78 },
  { label: "Week 8", y: 80 },
  { label: "Week 9", y: 83 },
  { label: "Week 10", y: 85 },
];

export default function ProgressDashboard({
  initialTitle,
  initialXLabel,
  initialYLabel,
  initialGoalScore,
  initialGoalWeek,
  initialDataPoints,
  onAddDataPoint,
  onDeleteDataPoint,
}) {
  const chartRef = useRef(null);
  const [title, setTitle] = useState(
    initialTitle || "Weekly Score Progress"
  );
  const [yLabel, setYLabel] = useState(initialYLabel || "Score");

  const [points, setPoints] = useState(
    initialDataPoints != null ? initialDataPoints : DEFAULT_POINTS
  );

  const [newY, setNewY] = useState("");

  // Goal
  const [goalScore, setGoalScore] = useState(initialGoalScore ?? 90);
  const [goalWeek, setGoalWeek] = useState(initialGoalWeek ?? 12);

  // Animation state
  const [dotVisible, setDotVisible] = useState(points.map(() => false));
  const [segmentProgress, setSegmentProgress] = useState([]);
  const [trendProgress, setTrendProgress] = useState(0);

  const DOT_FADE_DURATION = 800;
  const DOT_STAGGER = 70;
  const SEGMENT_ANIM_DURATION = 400;
  const SEGMENT_STAGGER = 120;

  useEffect(() => {
    const count = points.length;
    if (!count) return;

    setDotVisible(points.map(() => false));
    const segCount = Math.max(count - 1, 0);
    setSegmentProgress(Array(segCount).fill(0));
    setTrendProgress(0);

    const timeouts = [];

    // Dot fade
    points.forEach((_, i) => {
      timeouts.push(
        setTimeout(() => {
          setDotVisible((prev) => {
            const next = [...prev];
            next[i] = true;
            return next;
          });
        }, i * DOT_STAGGER)
      );
    });

    // Segment drawing
    let currentTime = 0;
    const segCount2 = Math.max(points.length - 1, 0);

    for (let i = 0; i < segCount2; i++) {
      const rightDotIndex = i + 1;
      const fadeStart = rightDotIndex * DOT_STAGGER;
      const fadeEnd = fadeStart + DOT_FADE_DURATION;

      const startTime = Math.max(fadeEnd, currentTime) + SEGMENT_STAGGER;
      currentTime = startTime + SEGMENT_ANIM_DURATION;

      timeouts.push(
        setTimeout(() => {
          setSegmentProgress((prev) => {
            const next = [...prev];
            next[i] = 1;
            return next;
          });
        }, startTime)
      );
    }

    timeouts.push(
      setTimeout(() => {
        setTrendProgress(1);
      }, currentTime + 200)
    );

    return () => timeouts.forEach(clearTimeout);
  }, [points]);

  // Derived values
  const numericGoalWeek = Math.max(goalWeek || 1, 1);
  const scores = points.map((p) => p.y);
  const regression = computeRegression(scores);

  const totalWeeks = Math.max(points.length, numericGoalWeek);
  const labels = Array.from({ length: totalWeeks }, (_, i) => `Week ${i + 1}`);

  const actualYs = Array(totalWeeks).fill(NaN);
  for (let i = 0; i < points.length; i++) actualYs[i] = points[i].y;

  const regressionYs =
    regression && scores.length >= 2
      ? Array.from({ length: totalWeeks }, (_, i) => {
          const x = i + 1;
          return regression.intercept + regression.slope * x;
        })
      : [];

  const SEGMENT_STROKE_LENGTH = 220;
  const TREND_STROKE_LENGTH = 600;

  let predictedAtGoal = null,
    isOnTrack = null;
  const latestScore = scores.length > 0 ? scores[scores.length - 1] : null;
  const alreadyHitGoal = latestScore !== null && latestScore >= goalScore;

  if (regression && scores.length >= 2) {
    predictedAtGoal =
      regression.intercept + regression.slope * numericGoalWeek;
    isOnTrack = alreadyHitGoal || predictedAtGoal >= goalScore;
  } else if (alreadyHitGoal) {
    isOnTrack = true;
  }

  // Build gradient from chart ref
  const lineGradient = chartRef.current ? createLineGradient(chartRef.current) : GRADIENT_START;

  // -------------------- Datasets ----------------------

  // POINTS: gradient colored fill
  const dotsDataset = {
    label: "Weekly Data Points",
    data: actualYs,
    showLine: false,
    pointRadius: 5,
    pointHoverRadius: 7,
    borderWidth: 2,
    tension: 0,
    backgroundColor: labels.map((_, i) =>
      dotVisible[i] ? lineGradient : "rgba(0,0,0,0)"
    ),
    borderColor: labels.map((_, i) =>
      dotVisible[i] ? lineGradient : "rgba(0,0,0,0)"
    ),
    animations: { y: { duration: 0 } },
  };

  // LINE SEGMENTS: gradient (hidden from legend & tooltip)
  const segCount = Math.max(points.length - 1, 0);
  const segmentDatasets = [];

  for (let i = 0; i < segCount; i++) {
    const segData = actualYs.map((y, idx) =>
      idx === i || idx === i + 1 ? y : NaN
    );
    const progress = segmentProgress[i] ?? 0;

    segmentDatasets.push({
      label: "",
      _hideInLegend: true,
      data: segData,
      showLine: true,
      pointRadius: 0,
      borderColor: lineGradient,
      borderWidth: 2.5,
      tension: 0,
      borderDash: [SEGMENT_STROKE_LENGTH, 0],
      borderDashOffset: (1 - progress) * SEGMENT_STROKE_LENGTH,
      animations: {
        borderDashOffset: {
          duration: SEGMENT_ANIM_DURATION,
          easing: "linear",
        },
        y: { duration: 0 },
      },
    });
  }

  // REGRESSION LINE: adapts to dark mode
  const isDark = typeof document !== "undefined" && document.documentElement.classList.contains("dark");
  const regressionDataset =
    regressionYs.length > 0
      ? {
          label: "",
          _hideInLegend: true,
          data: regressionYs,
          showLine: true,
          pointRadius: 0,
          borderColor: isDark ? "#e5e5e5" : "#171717",
          borderWidth: 1.5,
          borderDash: [6, 4],
          tension: 0,
          borderDashOffset: (1 - trendProgress) * TREND_STROKE_LENGTH,
          animations: {
            borderDashOffset: {
              duration: 500,
              easing: "linear",
            },
            y: { duration: 0 },
          },
        }
      : null;

  const datasets = [
    dotsDataset,
    ...segmentDatasets,
    regressionDataset,
  ].filter(Boolean);

  // Data labels plugin — shows both values at each point
  const dataLabelsPlugin = {
    id: "customDataLabels",
    afterDatasetsDraw(chart) {
      try {
        const meta = chart.getDatasetMeta(0);
        if (!meta || !meta.data) return;
        const { ctx, chartArea } = chart;
        if (!chartArea) return;

        const dark = document.documentElement.classList.contains("dark");
        const pillH = 20;
        const gap = 14; // gap between dot and pill edge

        meta.data.forEach((el, i) => {
          if (i >= points.length) return;
          const pt = points[i];
          if (!pt || isNaN(actualYs[i])) return;

          // decide above vs below, flip if it would go out of bounds
          let above = i % 2 === 0;
          if (above && el.y - gap - pillH < chartArea.top) above = false;
          else if (!above && el.y + gap + pillH > chartArea.bottom) above = true;

          const ly = above ? el.y - gap - pillH / 2 : el.y + gap + pillH / 2;

          const text = `${pt.y}`;
          ctx.save();
          ctx.font = 'bold 11px Georgia, serif';
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";

          const tw = ctx.measureText(text).width;
          const padX = 8;
          const pillW = tw + padX * 2;
          const rx = Math.max(chartArea.left, Math.min(chartArea.right - pillW, el.x - pillW / 2));
          const ry = ly - pillH / 2;

          // background
          ctx.fillStyle = dark ? "rgba(64,64,64,0.95)" : "rgba(255,255,255,0.97)";
          ctx.fillRect(rx, ry, pillW, pillH);
          ctx.strokeStyle = dark ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.15)";
          ctx.lineWidth = 1;
          ctx.strokeRect(rx, ry, pillW, pillH);

          // text
          ctx.fillStyle = dark ? "#ffffff" : "#374151";
          ctx.fillText(text, rx + pillW / 2, ly);
          ctx.restore();
        });
      } catch (e) {
        // silent fallback
      }
    },
  };

  const chartData = { labels, datasets };

  // ----------------- Chart Options -----------------
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    layout: { padding: { top: 36, bottom: 36 } },
    animation: {
      duration: DOT_FADE_DURATION,
      easing: "easeOutQuad",
      y: { duration: 0 },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        intersect: false,
        mode: "nearest",
        displayColors: false,
        backgroundColor: "#171717",
        cornerRadius: 6,
        padding: { top: 8, bottom: 8, left: 12, right: 12 },
        titleFont: { size: 13, weight: "600", family: "'Georgia', serif" },
        bodyFont: { size: 12, family: "'Georgia', serif" },
        titleColor: "#fff",
        bodyColor: "rgba(255,255,255,0.75)",
        filter: (item) => item.datasetIndex === 0,
        position: "nearest",
        callbacks: {
          title(items) {
            if (!items || !items.length) return "";
            return items[0].label;
          },
          label(context) {
            const i = context.dataIndex;
            if (!points[i]) return "";
            return `${yLabel}: ${points[i].y}`;
          },
        },
      },
      goalLines: {
        enabled: false,
      },
    },
    scales: {
      x: {
        ticks: { color: "#a3a3a3", font: { size: 11, family: "'Georgia', serif" } },
        grid: { display: false },
        border: { display: false },
        title: {
          display: true,
          text: "Weeks",
          color: "#a3a3a3",
          font: { size: 11, style: "italic", family: "'Georgia', serif" },
          padding: { top: 10 },
        },
      },
      y: {
        suggestedMax: undefined,
        ticks: { color: "#b5b5b5", font: { size: 10 }, maxTicksLimit: 6 },
        grid: {
          color: "rgba(212,212,212,0.35)",
          drawBorder: false,
          lineWidth: 0.5,
        },
        border: { display: false },
        title: {
          display: true,
          text: yLabel,
          color: "#a3a3a3",
          font: { size: 11, style: "italic", family: "'Georgia', serif" },
        },
      },
    },
  };

  // ---------------- UI Handlers -----------------
  const handleAddPoint = () => {
    const yNum = parseFloat(newY);
    if (isNaN(yNum)) return;

    const nextWeek = points.length + 1;
    const newPoint = { label: `Week ${nextWeek}`, y: yNum };
    const updatedPoints = [...points, newPoint];
    setPoints(updatedPoints);
    setNewY("");

    if (onAddDataPoint) {
      onAddDataPoint(updatedPoints);
    }
  };

  const handleDeletePoint = (index) => {
    const updatedPoints = points.filter((_, i) => i !== index);
    setPoints(updatedPoints);
    if (onDeleteDataPoint) {
      onDeleteDataPoint(updatedPoints);
    }
  };

  return (
    <div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-6 flex flex-col" style={{ minHeight: 380 }}>
          <div className="flex items-center justify-between mb-4">
            <p className="font-serif text-neutral-700 dark:text-neutral-300 text-base tracking-tight">{title}</p>
            {isOnTrack !== null && (
              <span
                className={`px-3 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 border ${
                  isOnTrack
                    ? "bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400"
                    : "bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400"
                }`}
              >
                {isOnTrack ? (
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
                {alreadyHitGoal ? "Goal Reached" : isOnTrack ? "On Track" : "Off Track"}
              </span>
            )}
          </div>

          <div className="flex items-center gap-5 mb-3">
            <span className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400">
              <span className="w-4 h-0.5 rounded-full bg-gradient-to-r from-pink-500 to-orange-500 inline-block" />
              Score
            </span>
            <span className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400">
              <span className="w-4 h-0 border-t border-dashed border-neutral-800 dark:border-neutral-300 inline-block" />
              Line of Best Fit
            </span>
          </div>

          <div className="flex-1">
            <Line ref={chartRef} data={chartData} options={options} plugins={[dataLabelsPlugin]} />
          </div>

          {alreadyHitGoal ? (
            <p className="text-green-600 dark:text-green-400 text-xs text-center mt-3 font-medium">
              Goal reached! Latest score of{" "}
              <span className="font-semibold">{latestScore}</span>{" "}
              meets the target of{" "}
              <span className="font-semibold">{goalScore}</span>
            </p>
          ) : predictedAtGoal !== null ? (
            <p className="text-neutral-400 dark:text-neutral-500 text-xs text-center mt-3">
              Trend predicts about{" "}
              <span className="font-medium text-neutral-700 dark:text-neutral-300">
                {predictedAtGoal.toFixed(1)}
              </span>{" "}
              by Week {numericGoalWeek} (goal is{" "}
              <span className="font-medium text-neutral-700 dark:text-neutral-300">{goalScore}</span>)
            </p>
          ) : null}
        </div>

        {/* Controls */}
        <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-5 flex flex-col gap-4 min-w-0 overflow-hidden">
          <div className="min-w-0">
            <label className="text-xs text-neutral-400 dark:text-neutral-500 uppercase tracking-wide">Title</label>
            <input
              className="w-full box-border border border-neutral-300 dark:border-neutral-600 px-3 py-2 rounded-lg text-sm text-neutral-800 dark:text-neutral-100 bg-white dark:bg-neutral-700 mt-1 focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-500"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="min-w-0">
            <label className="text-xs text-neutral-400 dark:text-neutral-500 uppercase tracking-wide">Goal Score</label>
            <input
              type="number"
              value={goalScore}
              onChange={(e) => setGoalScore(Number(e.target.value))}
              className="w-full box-border border border-neutral-300 dark:border-neutral-600 px-3 py-2 rounded-lg text-sm text-neutral-800 dark:text-neutral-100 bg-white dark:bg-neutral-700 mt-1 focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-500"
            />
          </div>

          <div className="min-w-0">
            <label className="text-xs text-neutral-400 dark:text-neutral-500 uppercase tracking-wide">Goal Week</label>
            <input
              type="number"
              min="1"
              value={goalWeek}
              onChange={(e) =>
                setGoalWeek(Math.max(Number(e.target.value), 1))
              }
              className="w-full box-border border border-neutral-300 dark:border-neutral-600 px-3 py-2 rounded-lg text-sm text-neutral-800 dark:text-neutral-100 bg-white dark:bg-neutral-700 mt-1 focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-500"
            />
          </div>

          <div className="pt-3 border-t border-neutral-100 dark:border-neutral-700 min-w-0">
            <label className="text-xs text-neutral-400 dark:text-neutral-500 uppercase tracking-wide">Add Week {points.length + 1} Score</label>
            <div className="flex gap-2 mt-1 min-w-0">
              <input
                type="number"
                placeholder="Score"
                value={newY}
                onChange={(e) => setNewY(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleAddPoint(); }}
                className="flex-1 min-w-0 box-border border border-neutral-300 dark:border-neutral-600 px-3 py-2 rounded-lg text-sm text-neutral-800 dark:text-neutral-100 bg-white dark:bg-neutral-700 placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-500"
              />
              <button
                onClick={handleAddPoint}
                className="px-4 py-2 rounded-lg bg-neutral-800 dark:bg-neutral-200 text-white dark:text-neutral-900 text-sm hover:bg-neutral-900 dark:hover:bg-neutral-300 transition-colors"
              >
                Add
              </button>
            </div>
          </div>

          {/* Data entries */}
          {points.length > 0 && (
            <div className="pt-3 border-t border-neutral-100 dark:border-neutral-700">
              <label className="text-xs text-neutral-400 dark:text-neutral-500 uppercase tracking-wide">Entries</label>
              <div className="mt-1 max-h-40 overflow-y-auto space-y-1">
                {points.map((pt, i) => (
                  <div key={i} className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-700 group">
                    <span className="text-xs text-neutral-600 dark:text-neutral-300">
                      <span className="font-medium text-neutral-800 dark:text-neutral-200">{pt.label}</span>
                      {" "}&mdash; {yLabel}: {pt.y}
                    </span>
                    <button
                      onClick={() => handleDeletePoint(i)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-neutral-300 dark:text-neutral-600 hover:text-red-500 dark:hover:text-red-400 transition-all"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
