// src/components/BarChartContent.jsx
import React, { useState, useRef } from "react";
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

const BAR_COLOR = "#ec4899";

export default function BarChartContent({
  initialTitle,
  initialXLabel,
  initialYLabel,
  initialCategories,
  onDataChange,
}) {
  const chartRef = useRef(null);
  const [title, setTitle] = useState(initialTitle || "Bar Chart");
  const [xLabel, setXLabel] = useState(initialXLabel || "Category");
  const [yLabel, setYLabel] = useState(initialYLabel || "Value");

  const [categories, setCategories] = useState(
    Array.isArray(initialCategories) ? initialCategories : []
  );

  const [newLabel, setNewLabel] = useState("");
  const [newValue, setNewValue] = useState("");

  const notifyChange = (updated) => {
    if (onDataChange) onDataChange(updated);
  };

  const handleAdd = () => {
    const trimmed = newLabel.trim();
    const num = parseFloat(newValue);
    if (!trimmed || isNaN(num)) return;

    const updated = [...categories, { label: trimmed, value: num }];
    setCategories(updated);
    setNewLabel("");
    setNewValue("");
    notifyChange(updated);
  };

  const handleRemove = (index) => {
    const updated = categories.filter((_, i) => i !== index);
    setCategories(updated);
    notifyChange(updated);
  };

  const chartData = {
    labels: categories.map((c) => c.label),
    datasets: [
      {
        label: yLabel,
        data: categories.map((c) => c.value),
        backgroundColor: BAR_COLOR,
        borderColor: "#171717",
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
        barPercentage: 0.65,
        categoryPercentage: 0.75,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    layout: { padding: { top: 8, right: 4, bottom: 0, left: 0 } },
    plugins: {
      legend: { display: false },
      tooltip: {
        intersect: false,
        mode: "nearest",
        position: "nearest",
        backgroundColor: "#171717",
        cornerRadius: 6,
        padding: { top: 8, bottom: 8, left: 12, right: 12 },
        displayColors: false,
        titleFont: { size: 13, weight: "600", family: "'Georgia', serif" },
        bodyFont: { size: 12, family: "'Georgia', serif" },
        titleColor: "#fff",
        bodyColor: "rgba(255,255,255,0.75)",
        callbacks: {
          title(items) {
            return items[0]?.label || "";
          },
          label(context) {
            return `${yLabel}: ${context.parsed.y}`;
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
        border: { display: false, dash: [3, 3] },
        title: {
          display: true,
          text: yLabel,
          color: "#a3a3a3",
          font: { size: 11, style: "italic", family: "'Georgia', serif" },
        },
        beginAtZero: true,
      },
    },
  };

  return (
    <div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Chart */}
        <div
          className="lg:col-span-2 bg-white border border-neutral-200 rounded-xl p-6 flex flex-col"
          style={{ minHeight: 380 }}
        >
          <p className="font-serif text-neutral-700 text-base mb-4 tracking-tight">{title}</p>

          {categories.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <p className="text-neutral-400 text-sm font-serif italic">No data yet</p>
                <p className="text-neutral-300 text-xs mt-1">Add a bar using the panel on the right</p>
              </div>
            </div>
          ) : (
            <div className="flex-1">
              <Bar ref={chartRef} data={chartData} options={options} />
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="bg-white border border-neutral-200 rounded-xl p-5 flex flex-col gap-4 min-w-0 overflow-hidden">
          {/* Title input */}
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

          {/* Add Data */}
          <div className="pt-3 border-t border-neutral-100 min-w-0">
            <label className="text-xs text-neutral-400 uppercase tracking-wide">
              Add a Bar
            </label>
            <div className="flex flex-col gap-2 mt-1 min-w-0">
              <input
                type="text"
                placeholder={`Name (e.g. "${xLabel}")`}
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                className="w-full min-w-0 box-border border border-neutral-300 px-3 py-2 rounded-lg text-sm text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-neutral-400"
              />
              <input
                type="number"
                placeholder={`${yLabel} (number)`}
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                className="w-full min-w-0 box-border border border-neutral-300 px-3 py-2 rounded-lg text-sm text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-neutral-400"
              />
            </div>

            <button
              onClick={handleAdd}
              className="mt-2 w-full py-2 rounded-lg bg-neutral-800 text-white text-sm hover:bg-neutral-900 transition-colors"
            >
              Add
            </button>
          </div>

          {/* Entry list */}
          {categories.length > 0 && (
            <div className="pt-3 border-t border-neutral-100 min-w-0">
              <label className="text-xs text-neutral-400 uppercase tracking-wide">
                Entries ({categories.length})
              </label>
              <div className="mt-2 flex flex-col gap-1.5 max-h-48 overflow-y-auto">
                {categories.map((cat, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-1.5 text-sm text-neutral-700 group"
                  >
                    <span className="flex items-center gap-2 min-w-0 truncate">
                      <span
                        className="w-2.5 h-2.5 rounded flex-shrink-0"
                        style={{ backgroundColor: BAR_COLOR }}
                      />
                      <span className="truncate font-medium">{cat.label}</span>
                      <span className="text-neutral-400 flex-shrink-0">
                        {cat.value}
                      </span>
                    </span>
                    <button
                      onClick={() => handleRemove(i)}
                      className="ml-2 flex-shrink-0 opacity-0 group-hover:opacity-100 w-5 h-5 flex items-center justify-center rounded text-neutral-400 hover:text-red-500 transition-all"
                      aria-label={`Remove ${cat.label}`}
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
