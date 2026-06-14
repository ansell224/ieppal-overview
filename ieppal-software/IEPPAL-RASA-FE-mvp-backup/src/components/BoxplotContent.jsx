// src/components/BoxplotContent.jsx
import React, { useState, useCallback } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import {
  BoxPlotController,
  BoxAndWiskers,
} from "@sgratzl/chartjs-chart-boxplot";
import { Chart } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  BoxPlotController,
  BoxAndWiskers
);

function calcStats(arr) {
  if (!arr.length) return null;
  const sorted = [...arr].sort((a, b) => a - b);
  const n = sorted.length;
  return {
    min: sorted[0],
    q1: sorted[Math.floor(n * 0.25)],
    median: sorted[Math.floor(n * 0.5)],
    q3: sorted[Math.floor(n * 0.75)],
    max: sorted[n - 1],
    mean: +(arr.reduce((a, b) => a + b, 0) / n).toFixed(1),
    count: n,
  };
}

export default function BoxplotContent({
  initialTitle,
  initialXLabel,
  initialYLabel,
  initialGroups,
  onDataChange,
}) {
  const [title, setTitle] = useState(initialTitle || "Score Distribution");
  const [xLabel, setXLabel] = useState(initialXLabel || "Groups");
  const [yLabel, setYLabel] = useState(initialYLabel || "Value");

  const [groups, setGroups] = useState(
    initialGroups != null ? initialGroups : []
  );
  const [activeIndex, setActiveIndex] = useState(
    initialGroups && initialGroups.length > 0 ? 0 : -1
  );

  const [newGroupName, setNewGroupName] = useState("");
  const [newValue, setNewValue] = useState("");

  const emitChange = useCallback(
    (updated) => {
      if (onDataChange) onDataChange(updated);
    },
    [onDataChange]
  );

  const handleAddGroup = () => {
    const name = newGroupName.trim();
    if (!name) return;
    if (groups.some((g) => g.name === name)) return;

    const updated = [...groups, { name, values: [] }];
    setGroups(updated);
    setActiveIndex(updated.length - 1);
    setNewGroupName("");
    emitChange(updated);
  };

  const handleRemoveGroup = (idx) => {
    const updated = groups.filter((_, i) => i !== idx);
    setGroups(updated);
    if (activeIndex >= updated.length) setActiveIndex(Math.max(0, updated.length - 1));
    if (updated.length === 0) setActiveIndex(-1);
    emitChange(updated);
  };

  const handleAddValue = () => {
    const num = parseFloat(newValue);
    if (isNaN(num) || activeIndex < 0) return;

    const updated = groups.map((g, i) =>
      i === activeIndex ? { ...g, values: [...g.values, num] } : g
    );
    setGroups(updated);
    setNewValue("");
    emitChange(updated);
  };

  const handleRemoveValue = (valueIndex) => {
    const updated = groups.map((g, i) =>
      i === activeIndex
        ? { ...g, values: g.values.filter((_, vi) => vi !== valueIndex) }
        : g
    );
    setGroups(updated);
    emitChange(updated);
  };

  const BOX_FILLS = [
    "#ec4899",
    "#f97316",
    "rgba(236,72,153,0.65)",
    "rgba(249,115,22,0.65)",
    "rgba(236,72,153,0.45)",
    "rgba(249,115,22,0.45)",
  ];

  const chartData = {
    labels: groups.map((g) => g.name),
    datasets: [
      {
        label: "Distribution",
        backgroundColor: groups.map((_, i) => BOX_FILLS[i % BOX_FILLS.length]),
        borderColor: "#171717",
        borderWidth: 2,
        whiskerColor: "#171717",
        whiskerWidth: 1,
        lowerBackgroundColor: groups.map((_, i) => BOX_FILLS[i % BOX_FILLS.length]),
        outlierBackgroundColor: "#171717",
        outlierBorderColor: "#171717",
        outlierBorderWidth: 1.5,
        outlierRadius: 5,
        medianColor: "#171717",
        medianWidth: 1,
        itemRadius: 0,
        padding: 20,
        data: groups.map((g) => g.values),
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    layout: { padding: { top: 12, right: 16, bottom: 4, left: 8 } },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#171717",
        cornerRadius: 6,
        padding: { top: 8, bottom: 8, left: 12, right: 12 },
        displayColors: false,
        titleFont: { size: 13, weight: "600", family: "'Georgia', serif" },
        bodyFont: { size: 12, family: "'Georgia', serif" },
        titleColor: "#fff",
        bodyColor: "rgba(255,255,255,0.75)",
        callbacks: {
          label(ctx) {
            const v = ctx.parsed;
            if (!v) return "";
            return [
              `Highest: ${v.max}`,
              `Upper 25%: ${v.q3}`,
              `Middle: ${v.median}`,
              `Lower 25%: ${v.q1}`,
              `Lowest: ${v.min}`,
            ];
          },
        },
      },
    },
    scales: {
      x: {
        ticks: { color: "#a3a3a3", font: { size: 11, family: "'Georgia', serif" } },
        grid: { display: false },
        border: { display: false },
        title: {
          display: true,
          text: xLabel,
          color: "#a3a3a3",
          font: { size: 11, style: "italic", family: "'Georgia', serif" },
          padding: { top: 10 },
        },
      },
      y: {
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

  const activeGroup = activeIndex >= 0 ? groups[activeIndex] : null;
  const stats = activeGroup ? calcStats(activeGroup.values) : null;

  return (
    <div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Chart */}
        <div
          className="lg:col-span-2 bg-white border border-neutral-200 rounded-xl p-6 flex flex-col"
          style={{ minHeight: 380 }}
        >
          <p className="font-serif text-neutral-700 text-base mb-4 tracking-tight">{title}</p>

          {groups.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <p className="text-neutral-400 text-sm font-serif italic">No groups yet</p>
                <p className="text-neutral-300 text-xs mt-1">Create a group and add values to see the distribution</p>
              </div>
            </div>
          ) : (
            <div className="flex-1">
              <Chart type="boxplot" data={chartData} options={options} />
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="bg-white border border-neutral-200 rounded-xl p-5 flex flex-col gap-4 min-w-0 overflow-hidden">
          {/* Title */}
          <div className="min-w-0">
            <label className="text-xs text-neutral-400 uppercase tracking-wide">
              Title
            </label>
            <input
              className="w-full box-border border border-neutral-300 px-3 py-2 rounded-lg text-sm text-neutral-800 mt-1 focus:outline-none focus:border-neutral-400"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Groups */}
          <div className="pt-3 border-t border-neutral-100 min-w-0">
            <label className="text-xs text-neutral-400 uppercase tracking-wide">
              {groups.length === 0 ? "Step 1 — Create a Group" : "Groups"}
            </label>
            {groups.length === 0 && (
              <p className="text-xs text-neutral-400 mt-0.5 mb-1">
                Each group becomes a separate box on the chart.
              </p>
            )}

            {/* Group chips */}
            {groups.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-1.5 mb-2">
                {groups.map((g, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveIndex(i)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors border flex items-center gap-1.5 group ${
                      i === activeIndex
                        ? "bg-neutral-800 text-white border-neutral-800"
                        : "bg-neutral-50 text-neutral-600 border-neutral-200 hover:border-neutral-400"
                    }`}
                  >
                    {g.name}
                    <span className="opacity-60">({g.values.length})</span>
                    <span
                      onClick={(e) => { e.stopPropagation(); handleRemoveGroup(i); }}
                      className={`ml-0.5 opacity-0 group-hover:opacity-100 transition-opacity ${
                        i === activeIndex ? "text-neutral-400 hover:text-white" : "text-neutral-400 hover:text-red-500"
                      }`}
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </span>
                  </button>
                ))}
              </div>
            )}

            <div className="flex gap-2 min-w-0">
              <input
                placeholder="Group name"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddGroup()}
                className="flex-1 min-w-0 box-border border border-neutral-300 px-3 py-2 rounded-lg text-sm text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-neutral-400"
              />
              <button
                onClick={handleAddGroup}
                className="px-4 py-2 rounded-lg bg-neutral-800 text-white text-sm hover:bg-neutral-900 transition-colors whitespace-nowrap"
              >
                Add
              </button>
            </div>
          </div>

          {/* Add Value */}
          {activeGroup && (
            <div className="pt-3 border-t border-neutral-100 min-w-0">
              <label className="text-xs text-neutral-400 uppercase tracking-wide">
                {activeGroup.values.length === 0 ? "Step 2 — " : ""}Add Value to "{activeGroup.name}"
              </label>
              {activeGroup.values.length === 0 && (
                <p className="text-xs text-neutral-400 mt-0.5 mb-1">
                  Add numbers to build the distribution. The more values, the more accurate the box.
                </p>
              )}
              <div className="flex gap-2 mt-1 min-w-0">
                <input
                  type="number"
                  placeholder={`${yLabel} (number)`}
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddValue()}
                  className="flex-1 min-w-0 box-border border border-neutral-300 px-3 py-2 rounded-lg text-sm text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-neutral-400"
                />
                <button
                  onClick={handleAddValue}
                  className="px-4 py-2 rounded-lg bg-neutral-800 text-white text-sm hover:bg-neutral-900 transition-colors"
                >
                  Add
                </button>
              </div>
            </div>
          )}

          {/* Statistics */}
          {stats && (
            <div className="pt-3 border-t border-neutral-100 min-w-0">
              <label className="text-xs text-neutral-400 uppercase tracking-wide">
                Summary — {activeGroup.name}
              </label>
              <div className="grid grid-cols-4 gap-1.5 mt-2">
                {[
                  { label: "Lowest", value: stats.min },
                  { label: "Lower 25%", value: stats.q1 },
                  { label: "Middle", value: stats.median },
                  { label: "Upper 25%", value: stats.q3 },
                  { label: "Highest", value: stats.max },
                  { label: "Average", value: stats.mean },
                  { label: "Total", value: stats.count },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="bg-neutral-50 rounded-lg px-2 py-1.5 text-center"
                  >
                    <p className="text-[10px] text-neutral-400 uppercase tracking-wide leading-tight">
                      {s.label}
                    </p>
                    <p className="text-sm font-medium text-neutral-800">
                      {s.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Value list */}
          {activeGroup && activeGroup.values.length > 0 && (
            <div className="pt-3 border-t border-neutral-100 min-w-0">
              <label className="text-xs text-neutral-400 uppercase tracking-wide">
                Values ({activeGroup.values.length})
              </label>
              <div className="mt-1 max-h-40 overflow-y-auto">
                <div className="flex flex-wrap gap-1.5">
                  {activeGroup.values.map((v, vi) => (
                    <span
                      key={vi}
                      className="inline-flex items-center gap-1 bg-neutral-50 border border-neutral-200 rounded-lg px-2.5 py-1 text-sm text-neutral-700 group"
                    >
                      {v}
                      <button
                        onClick={() => handleRemoveValue(vi)}
                        className="opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-red-500 transition-all"
                      >
                        <svg
                          className="w-3 h-3"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2.5}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
