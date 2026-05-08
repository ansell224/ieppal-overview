// src/components/StackedBarContent.jsx
import React, { useState, useCallback } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const SEGMENT_FILLS = [
  "rgba(236,72,153,0.75)",
  "rgba(249,115,22,0.75)",
  "rgba(236,72,153,0.55)",
  "rgba(249,115,22,0.55)",
  "rgba(236,72,153,0.40)",
  "rgba(249,115,22,0.40)",
  "rgba(236,72,153,0.65)",
  "rgba(249,115,22,0.65)",
];

export default function StackedBarContent({
  initialTitle,
  initialXLabel,
  initialYLabel,
  initialLabels,
  initialDatasets,
  onDataChange,
}) {
  const [title, setTitle] = useState(initialTitle || "Stacked Bar Chart");
  const [xLabel, setXLabel] = useState(initialXLabel || "Category");
  const [yLabel, setYLabel] = useState(initialYLabel || "Value");

  const [labels, setLabels] = useState(
    Array.isArray(initialLabels) ? initialLabels : []
  );
  const [datasets, setDatasets] = useState(
    Array.isArray(initialDatasets) ? initialDatasets : []
  );

  const [activeIndex, setActiveIndex] = useState(0);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newLabel, setNewLabel] = useState("");
  const [newValue, setNewValue] = useState("");

  const notify = useCallback(
    (nextLabels, nextDatasets) => {
      if (onDataChange) {
        onDataChange({ labels: nextLabels, datasets: nextDatasets });
      }
    },
    [onDataChange]
  );

  const handleAddCategory = () => {
    const name = newCategoryName.trim();
    if (!name) return;
    if (datasets.some((ds) => ds.name === name)) return;
    const next = [...datasets, { name, data: labels.map(() => 0) }];
    setDatasets(next);
    setActiveIndex(next.length - 1);
    setNewCategoryName("");
    notify(labels, next);
  };

  const handleRemoveCategory = (idx) => {
    const next = datasets.filter((_, i) => i !== idx);
    setDatasets(next);
    if (activeIndex >= next.length) setActiveIndex(Math.max(0, next.length - 1));
    notify(labels, next);
  };

  const handleAddData = () => {
    const label = newLabel.trim();
    const value = parseFloat(newValue);
    if (!label || isNaN(value) || datasets.length === 0) return;

    const existingIdx = labels.indexOf(label);

    if (existingIdx !== -1) {
      const nextDatasets = datasets.map((ds, i) =>
        i === activeIndex
          ? { ...ds, data: ds.data.map((v, j) => (j === existingIdx ? value : v)) }
          : ds
      );
      setDatasets(nextDatasets);
      setNewLabel("");
      setNewValue("");
      notify(labels, nextDatasets);
    } else {
      const nextLabels = [...labels, label];
      const nextDatasets = datasets.map((ds, i) => ({
        ...ds,
        data: [...ds.data, i === activeIndex ? value : 0],
      }));
      setLabels(nextLabels);
      setDatasets(nextDatasets);
      setNewLabel("");
      setNewValue("");
      notify(nextLabels, nextDatasets);
    }
  };

  const handleRemoveEntry = (labelIdx) => {
    const nextLabels = labels.filter((_, i) => i !== labelIdx);
    const nextDatasets = datasets.map((ds) => ({
      ...ds,
      data: ds.data.filter((_, i) => i !== labelIdx),
    }));
    setLabels(nextLabels);
    setDatasets(nextDatasets);
    notify(nextLabels, nextDatasets);
  };

  const chartDatasets = datasets.map((ds, i) => ({
    label: ds.name,
    data: ds.data,
    backgroundColor: SEGMENT_FILLS[i % SEGMENT_FILLS.length],
    borderColor: "#171717",
    borderWidth: 2,
    borderRadius: 2,
    borderSkipped: false,
    barPercentage: 0.65,
    categoryPercentage: 0.75,
  }));

  const chartData = { labels, datasets: chartDatasets };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    layout: { padding: { top: 8, right: 4, bottom: 0, left: 0 } },
    plugins: {
      legend: {
        display: datasets.length > 0,
        position: "bottom",
        labels: {
          color: "#737373",
          font: { size: 11, family: "'Georgia', serif" },
          usePointStyle: true,
          pointStyle: "rectRounded",
          padding: 16,
        },
      },
      tooltip: {
        mode: "nearest",
        intersect: false,
        position: "nearest",
        backgroundColor: "#171717",
        cornerRadius: 6,
        padding: { top: 8, bottom: 8, left: 12, right: 12 },
        titleFont: { size: 13, weight: "600", family: "'Georgia', serif" },
        bodyFont: { size: 12, family: "'Georgia', serif" },
        titleColor: "#fff",
        bodyColor: "rgba(255,255,255,0.75)",
      },
    },
    scales: {
      x: {
        stacked: true,
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
        stacked: true,
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

  const activeDataset = datasets[activeIndex] || null;
  const hasData = labels.length > 0;

  return (
    <div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Chart */}
        <div
          className="lg:col-span-2 bg-white border border-neutral-200 rounded-xl p-6 flex flex-col"
          style={{ minHeight: 380 }}
        >
          <p className="font-serif text-neutral-700 text-base mb-4 tracking-tight">{title}</p>

          {datasets.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <p className="text-neutral-400 text-sm font-serif italic">No groups yet</p>
                <p className="text-neutral-300 text-xs mt-1">Create a group first, then add data to it</p>
              </div>
            </div>
          ) : !hasData ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <p className="text-neutral-400 text-sm font-serif italic">No data yet</p>
                <p className="text-neutral-300 text-xs mt-1">Select a group and add data points below</p>
              </div>
            </div>
          ) : (
            <div className="flex-1">
              <Bar data={chartData} options={options} />
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

          {/* Step 1: Create groups */}
          <div className="pt-3 border-t border-neutral-100 min-w-0">
            <label className="text-xs text-neutral-400 uppercase tracking-wide">
              {datasets.length === 0 ? "Step 1 — Create a Group" : "Groups"}
            </label>
            {datasets.length === 0 && (
              <p className="text-xs text-neutral-400 mt-0.5 mb-1">
                Groups are the shaded segments within each bar.
              </p>
            )}

            {/* Group chips */}
            {datasets.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-1.5 mb-2">
                {datasets.map((ds, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveIndex(i)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1.5 group ${
                      i === activeIndex
                        ? "bg-neutral-800 text-white border-neutral-800"
                        : "bg-white text-neutral-600 border-neutral-300 hover:border-neutral-400"
                    }`}
                  >
                    <span
                      className="w-2 h-2 rounded-sm flex-shrink-0"
                      style={{ backgroundColor: SEGMENT_FILLS[i % SEGMENT_FILLS.length] }}
                    />
                    {ds.name}
                    <span
                      onClick={(e) => { e.stopPropagation(); handleRemoveCategory(i); }}
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
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddCategory()}
                className="flex-1 min-w-0 box-border border border-neutral-300 px-3 py-2 rounded-lg text-sm text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-neutral-400"
              />
              <button
                onClick={handleAddCategory}
                className="px-4 py-2 rounded-lg bg-neutral-800 text-white text-sm hover:bg-neutral-900 transition-colors whitespace-nowrap"
              >
                Add
              </button>
            </div>
          </div>

          {/* Step 2: Add data to active group */}
          {datasets.length > 0 && (
            <div className="pt-3 border-t border-neutral-100 min-w-0">
              <label className="text-xs text-neutral-400 uppercase tracking-wide">
                {!hasData ? "Step 2 — " : ""}Add Data to "{activeDataset?.name}"
              </label>
              {!hasData && (
                <p className="text-xs text-neutral-400 mt-0.5 mb-1">
                  Each label becomes a bar. The value goes into the selected group.
                </p>
              )}
              <div className="flex gap-2 mt-1 min-w-0">
                <input
                  placeholder={`Label (e.g. "${xLabel}")`}
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  className="flex-1 min-w-0 box-border border border-neutral-300 px-3 py-2 rounded-lg text-sm text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-neutral-400"
                />
                <input
                  type="number"
                  placeholder={yLabel}
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddData()}
                  className="w-24 min-w-0 box-border border border-neutral-300 px-3 py-2 rounded-lg text-sm text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-neutral-400"
                />
              </div>
              <button
                onClick={handleAddData}
                className="mt-2 w-full py-2 rounded-lg bg-neutral-800 text-white text-sm hover:bg-neutral-900 transition-colors"
              >
                Add
              </button>
            </div>
          )}

          {/* Data entries */}
          {hasData && (
            <div className="pt-3 border-t border-neutral-100 min-w-0">
              <label className="text-xs text-neutral-400 uppercase tracking-wide">
                Data ({labels.length} {labels.length === 1 ? "bar" : "bars"})
              </label>
              <div className="mt-1 space-y-1 max-h-48 overflow-y-auto">
                {labels.map((lbl, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between px-3 py-1.5 rounded-lg hover:bg-neutral-50 transition-colors group"
                  >
                    <div className="text-sm text-neutral-700 truncate min-w-0">
                      <span className="font-medium text-neutral-800">{lbl}</span>
                      <span className="text-neutral-400 ml-1.5">&mdash;</span>
                      {datasets.map((ds, di) => (
                        <span key={di} className="text-neutral-400 ml-1.5 text-xs">
                          <span className={di === activeIndex ? "text-neutral-800 font-medium" : "text-neutral-500"}>
                            {ds.name}: {ds.data[idx]}
                          </span>
                          {di < datasets.length - 1 && ","}
                        </span>
                      ))}
                    </div>
                    <button
                      onClick={() => handleRemoveEntry(idx)}
                      className="ml-2 flex-shrink-0 opacity-0 group-hover:opacity-100 w-5 h-5 flex items-center justify-center rounded text-neutral-400 hover:text-red-500 transition-all"
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
