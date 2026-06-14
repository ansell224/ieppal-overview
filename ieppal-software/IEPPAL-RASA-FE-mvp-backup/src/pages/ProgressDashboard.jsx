// src/pages/ProgressDashboard.jsx
import React, { useState, useEffect } from "react";
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
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { useNavigate } from "react-router-dom";

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
    ctx.strokeStyle = "rgba(255,255,255,0.65)";
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
      const x = xScale.getPixelForValue(goalWeekLabel);
      ctx.beginPath();
      ctx.moveTo(x, top);
      ctx.lineTo(x, bottom);
      ctx.stroke();
    }

    ctx.restore();
  },
};

ChartJS.register(goalLinesPlugin);

export default function ProgressDashboard() {
  const navigate = useNavigate();

  const [title, setTitle] = useState(
    "Pomodoro Study Time vs Test Score (Weekly)"
  );
  const [xLabel, setXLabel] = useState("POMODORO STUDY (MINS/DAY)");
  const [yLabel, setYLabel] = useState("TEST SCORE");

  const [points, setPoints] = useState([
    { x: 25, label: "Week 1", y: 60 },
    { x: 35, label: "Week 2", y: 63 },
    { x: 40, label: "Week 3", y: 66 },
    { x: 45, label: "Week 4", y: 70 },
    { x: 50, label: "Week 5", y: 72 },
    { x: 55, label: "Week 6", y: 75 },
    { x: 60, label: "Week 7", y: 78 },
    { x: 65, label: "Week 8", y: 80 },
    { x: 70, label: "Week 9", y: 83 },
    { x: 75, label: "Week 10", y: 85 },
  ]);

  const [newX, setNewX] = useState("");
  const [newY, setNewY] = useState("");

  // Goal
  const [goalScore, setGoalScore] = useState(90);
  const [goalWeek, setGoalWeek] = useState(12);

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
  if (regression && scores.length >= 2) {
    predictedAtGoal =
      regression.intercept + regression.slope * numericGoalWeek;
    isOnTrack = predictedAtGoal >= goalScore;
  }

  // Color of regression line based on on-track status
  const regressionColor =
    isOnTrack == null
      ? "#ffffff" // default white (not enough data yet)
      : isOnTrack
      ? "#4ade80" // green if on track
      : "#f97373"; // red if off track

  // -------------------- Datasets ----------------------

  // POINTS: white fill + black border
  const dotsDataset = {
    label: "Weekly Data Points",
    data: actualYs,
    showLine: false,
    pointRadius: 6,
    pointHoverRadius: 7,
    borderWidth: 2,
    tension: 0,
    backgroundColor: labels.map((_, i) =>
      dotVisible[i] ? "rgba(255,255,255,1)" : "rgba(255,255,255,0)"
    ),
    borderColor: labels.map((_, i) =>
      dotVisible[i] ? "rgba(0,0,0,1)" : "rgba(0,0,0,0)"
    ),
    animations: { y: { duration: 0 } },
  };

  // LINE SEGMENTS: WHITE (hidden from legend & tooltip)
  const segCount = Math.max(points.length - 1, 0);
  const segmentDatasets = [];

  for (let i = 0; i < segCount; i++) {
    const segData = actualYs.map((y, idx) =>
      idx === i || idx === i + 1 ? y : NaN
    );
    const progress = segmentProgress[i] ?? 0;

    segmentDatasets.push({
      label: "", // no text label
      _hideInLegend: true,
      data: segData,
      showLine: true,
      pointRadius: 0,
      borderColor: "#ffffff",
      borderWidth: 2,
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

  // REGRESSION LINE: no label, hidden in legend & tooltip text
  const regressionDataset =
    regressionYs.length > 0
      ? {
          label: "", // remove "Average Growth (Fit Line)" text
          _hideInLegend: true,
          data: regressionYs,
          showLine: true,
          pointRadius: 0,
          borderColor: regressionColor,
          borderWidth: 2,
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

        const pillH = 20;
        const gap = 14;

        meta.data.forEach((el, i) => {
          if (i >= points.length) return;
          const pt = points[i];
          if (!pt || isNaN(actualYs[i])) return;

          let above = i % 2 === 0;
          if (above && el.y - gap - pillH < chartArea.top) above = false;
          else if (!above && el.y + gap + pillH > chartArea.bottom) above = true;

          const ly = above ? el.y - gap - pillH / 2 : el.y + gap + pillH / 2;

          const text = `${pt.x}  ·  ${pt.y}`;
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
          ctx.fillStyle = "rgba(15,10,30,0.75)";
          ctx.fillRect(rx, ry, pillW, pillH);
          ctx.strokeStyle = "rgba(255,255,255,0.3)";
          ctx.lineWidth = 1;
          ctx.strokeRect(rx, ry, pillW, pillH);

          // text
          ctx.fillStyle = "#ffffff";
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
        labels: {
          color: "#ffffff",
          filter(item, data) {
            const ds = data.datasets[item.datasetIndex];
            return !ds || ds._hideInLegend !== true;
          },
        },
      },
      tooltip: {
        intersect: false,
        mode: "index",
        displayColors: false,
        backgroundColor: "rgba(25, 12, 40, 0.95)",
        cornerRadius: 12,
        // Only show the main dot dataset in tooltip
        filter: (item) => item.datasetIndex === 0,
        callbacks: {
          title(items) {
            if (!items || !items.length) return "";
            return items[0].label;
          },
          label(context) {
            const i = context.dataIndex;
            if (!points[i]) return "";
            return [
              `Test score: ${points[i].y}`,
              `Pomodoro: ${points[i].x} mins/day`,
            ];
          },
        },
      },
      goalLines: {
        enabled: true,
        goalScore,
        goalWeekLabel: `Week ${numericGoalWeek}`,
      },
    },
    scales: {
      x: {
        ticks: { color: "#ffffff" },
        grid: { color: "rgba(255,255,255,0.18)" },
        title: {
          display: true,
          text: "WEEKS",
          color: "#ffffff",
        },
      },
      y: {
        ticks: { color: "#ffffff" },
        grid: { color: "rgba(255,255,255,0.18)" },
        title: {
          display: true,
          text: yLabel,
          color: "#ffffff",
        },
      },
    },
  };

  // ---------------- UI Handlers -----------------
  const handleAddPoint = () => {
    const xNum = parseFloat(newX);
    const yNum = parseFloat(newY);
    if (isNaN(xNum) || isNaN(yNum)) return;

    const nextWeek = points.length + 1;
    setPoints((prev) => [
      ...prev,
      { x: xNum, label: `Week ${nextWeek}`, y: yNum },
    ]);
    setNewX("");
    setNewY("");
  };

  return (
    <div className="flex h-screen font-sans bg-offwhite">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />

        <div className="px-8 pt-6 pb-4 flex items-center justify-between">
          <h1 className="text-3xl font-extrabold text-neutral-900 dark:text-neutral-100">
            Data Visualiser
          </h1>

          {isOnTrack !== null && (
            <div
              className={`px-4 py-1 rounded-full text-sm font-semibold flex items-center gap-2 ${
                isOnTrack
                  ? "bg-emerald-200 text-emerald-800"
                  : "bg-amber-200 text-amber-800"
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isOnTrack ? "bg-emerald-600" : "bg-amber-600"
                }`}
              />
              {isOnTrack ? "On Track" : "Off Track"}
            </div>
          )}
        </div>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 px-8 pb-8">
          {/* Chart */}
          <div className="lg:col-span-2 bg-gradient-to-tr from-purple-700 via-fuchsia-600 to-pink-500 rounded-3xl shadow-xl p-6 relative overflow-hidden flex flex-col">
            <div className="absolute inset-3 border border-white/40 rounded-3xl pointer-events-none" />

            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white text-xl font-semibold">{title}</h2>
              <span className="text-white/50 text-xs italic">
                Labels: {xLabel} · {yLabel}
              </span>
            </div>

            <div className="flex-1">
              <Line data={chartData} options={options} plugins={[dataLabelsPlugin]} />
            </div>

            {predictedAtGoal !== null && (
              <p className="text-white/80 text-xs text-center mt-3">
                Trend predicts about{" "}
                <span className="font-bold text-white">
                  {predictedAtGoal.toFixed(1)}
                </span>{" "}
                by Week {numericGoalWeek} (goal is{" "}
                <span className="font-bold text-white">{goalScore}</span>).
              </p>
            )}
          </div>

          {/* Controls */}
          <div className="bg-white dark:bg-neutral-800 rounded-3xl shadow p-5 flex flex-col gap-4">
            <div>
              <label className="text-xs text-neutral-500 dark:text-neutral-400">Title</label>
              <input
                className="w-full border border-neutral-200 dark:border-neutral-700 px-3 py-2 rounded-xl text-sm dark:bg-neutral-700 dark:text-neutral-100"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div>
              <label className="text-xs text-neutral-500 dark:text-neutral-400">Goal Score</label>
              <input
                type="number"
                value={goalScore}
                onChange={(e) => setGoalScore(Number(e.target.value))}
                className="w-full border border-neutral-200 dark:border-neutral-700 px-3 py-2 rounded-xl text-sm dark:bg-neutral-700 dark:text-neutral-100"
              />
            </div>

            <div>
              <label className="text-xs text-neutral-500 dark:text-neutral-400">Goal Week</label>
              <input
                type="number"
                min="1"
                value={goalWeek}
                onChange={(e) =>
                  setGoalWeek(Math.max(Number(e.target.value), 1))
                }
                className="w-full border border-neutral-200 dark:border-neutral-700 px-3 py-2 rounded-xl text-sm dark:bg-neutral-700 dark:text-neutral-100"
              />
            </div>

            <div className="pt-3 border-t border-neutral-200 dark:border-neutral-700">
              <label className="text-xs font-semibold dark:text-neutral-100">Add Week</label>
              <div className="flex gap-2 mt-2">
                <input
                  type="number"
                  placeholder="Pomodoro mins/day"
                  value={newX}
                  onChange={(e) => setNewX(e.target.value)}
                  className="flex-1 border border-neutral-200 dark:border-neutral-700 px-3 py-2 rounded-xl text-sm dark:bg-neutral-700 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500"
                />
                <input
                  type="number"
                  placeholder="Test score"
                  value={newY}
                  onChange={(e) => setNewY(e.target.value)}
                  className="flex-1 border border-neutral-200 dark:border-neutral-700 px-3 py-2 rounded-xl text-sm dark:bg-neutral-700 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500"
                />
              </div>

              <button
                onClick={handleAddPoint}
                className="mt-2 w-full py-2 rounded-lg bg-neutral-800 text-white dark:bg-neutral-200 dark:text-neutral-900 text-sm hover:bg-neutral-900 transition-colors"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
