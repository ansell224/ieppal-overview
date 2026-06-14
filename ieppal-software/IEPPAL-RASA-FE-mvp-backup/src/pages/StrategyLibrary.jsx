import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search, X, ChevronDown, ChevronUp, ArrowLeft, BookOpen,
  Shield, Heart, Brain, SlidersHorizontal, Users, Eye, Compass, GraduationCap,
  Plus, Trash2, Pencil, HelpCircle,
} from "lucide-react";
import { useStrategies } from "../hooks/useApi";
import { AddStrategyModal, DeleteStrategyModal } from "../components/Modals";
import LoadingSpinner from "../components/LoadingSpinner";
import LucideIcon from "../components/LucideIcon";
import { lucideIconNames } from "../data/lucideIconNames";
import {
  diagnosisGroups,
  getDiagnosisGroup,
} from "../data/strategyFilters";
import { apiClient } from "../apiClient";
import { usePermissions } from "../context/PermissionContext";

const categoryIcons = {
  shield: Shield,
  heart: Heart,
  compass: Compass,
  eye: Eye,
  "book-open": BookOpen,
  "sliders-horizontal": SlidersHorizontal,
  brain: Brain,
  "graduation-cap": GraduationCap,
  users: Users,
};

const categoryColors = {
  red: "bg-red-500",
  orange: "bg-orange-500",
  amber: "bg-amber-500",
  emerald: "bg-emerald-500",
  cyan: "bg-cyan-500",
  blue: "bg-blue-500",
  indigo: "bg-indigo-500",
  violet: "bg-violet-500",
  pink: "bg-pink-500",
};

const fallbackMeta = { iconKey: "book-open", color: "bg-pink-500" };
const categoryColorOptions = Object.keys(categoryColors);
const availableDynamicIconNames = new Set(lucideIconNames);
const standardLucideIconOptions = [...lucideIconNames]
  .map((name) => ({
    key: name,
    label: name.replace(/(^\w|-\w)/g, (match) => match.replace("-", " ").toUpperCase()),
  }))
  .sort((a, b) => a.label.localeCompare(b.label));

function getCategoryVisuals(category) {
  return {
    iconKey: category?.iconKey || fallbackMeta.iconKey,
    color: categoryColors[category?.colorKey] || fallbackMeta.color,
  };
}

function StrategyIcon({ iconKey, className, strokeWidth = 1.5 }) {
  if (categoryIcons[iconKey]) {
    const StaticIcon = categoryIcons[iconKey];
    return <StaticIcon className={className} strokeWidth={strokeWidth} />;
  }

  const resolvedIconKey = availableDynamicIconNames.has(iconKey) ? iconKey : fallbackMeta.iconKey;

  return (
    <LucideIcon name={resolvedIconKey} className={className} strokeWidth={strokeWidth} />
  );
}

// ─── Category Tile ───────────────────────────────────────────────────────────
function CategoryTile({ category, count, onClick }) {
  const meta = getCategoryVisuals(category);
  return (
    <div
      onClick={onClick}
      className="card-hover flex flex-col h-full bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl hover:shadow-lg transition-all duration-300 cursor-pointer group"
    >
      <div className="p-5 flex-1">
        <div className="flex items-start gap-3 mb-3">
          <div className={`w-10 h-10 rounded-xl ${meta.color} flex items-center justify-center text-white flex-shrink-0`}>
            <StrategyIcon iconKey={meta.iconKey} className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-neutral-800 dark:text-neutral-200 text-sm leading-snug break-words hyphens-auto">
              {category.label}
            </h3>
            <p className="text-neutral-400 dark:text-neutral-500 text-xs font-light">
              {count} {count === 1 ? "strategy" : "strategies"}
            </p>
          </div>
        </div>
      </div>
      <div className="px-4 pb-4">
        <div className="w-full py-2 px-4 rounded-lg bg-neutral-50 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 text-xs font-medium text-center group-hover:bg-gradient-to-r group-hover:from-pink-500 group-hover:to-orange-500 group-hover:text-white transition-all duration-300">
          Browse
        </div>
      </div>
    </div>
  );
}

// ─── Strategy Card ───────────────────────────────────────────────────────────
function StrategyCard({ strategy, onClick }) {
  return (
    <div
      onClick={onClick}
      className="card-hover flex flex-col h-full bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl hover:shadow-lg transition-all duration-300 cursor-pointer group p-4"
    >
      <h3 className="font-semibold text-neutral-800 dark:text-neutral-200 text-sm leading-snug line-clamp-2 mb-1.5">
        {strategy.strategyName}
      </h3>
      <p className="text-neutral-400 dark:text-neutral-500 text-xs leading-relaxed line-clamp-2 font-light flex-1">
        {strategy.briefOverview}
      </p>
      <p className="text-neutral-300 dark:text-neutral-600 text-[11px] mt-2 truncate">
        {strategy.author}
      </p>
    </div>
  );
}

// ─── Collapsible Section (accordion) ─────────────────────────────────────────
function Section({ title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  if (!children) return null;
  const content = typeof children === "string" ? children.trim() : children;
  if (!content) return null;

  return (
    <div className="border-b border-neutral-100 dark:border-neutral-700 last:border-b-0">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center justify-between w-full py-3.5 text-left text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
      >
        {title}
        {open ? (
          <ChevronUp className="w-4 h-4 text-neutral-400 dark:text-neutral-500 flex-shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-neutral-400 dark:text-neutral-500 flex-shrink-0" />
        )}
      </button>
      {open && (
        <div className="pb-4 text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed whitespace-pre-line font-light">
          {content}
        </div>
      )}
    </div>
  );
}

// ─── Detail Modal ────────────────────────────────────────────────────────────
function DetailModal({ strategy, onClose, onDelete, onEdit, onAssign }) {
  const { can } = usePermissions();
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const categoryLabel = strategy.categoryMeta?.label || strategy.strategyCategory;
  const diag = getDiagnosisGroup(strategy.primaryDiagnosis);

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-lg w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Gradient header */}
        <div className="bg-gradient-to-r from-pink-500 to-orange-500 px-5 pt-5 pb-4 rounded-t-xl flex-shrink-0">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <span className="inline-block text-xs font-medium px-2.5 py-1 rounded-full bg-white/20 text-white mb-2">
                {categoryLabel}
              </span>
              <h2 className="text-lg font-bold text-white leading-snug">
                {strategy.strategyName}
              </h2>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {can('strategies', 'manage') && (
                <button
                  onClick={() => onAssign(strategy)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-white transition-colors text-sm font-medium"
                  title="Assign strategy to goal"
                >
                  <Plus className="w-4 h-4" />
                  <span>Assign</span>
                </button>
              )}
              <button
                onClick={() => onEdit(strategy)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-white transition-colors text-sm font-medium"
                title="Edit strategy"
              >
                <Pencil className="w-4 h-4" />
                <span>Edit</span>
              </button>
              <button
                onClick={() => onDelete(strategy)}
                className="p-1.5 rounded-lg hover:bg-white/20 text-white/70 hover:text-white transition-colors"
                title="Delete strategy"
              >
                <Trash2 className="w-5 h-5" />
              </button>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-white/20 text-white/70 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-5 py-3 bg-neutral-50 dark:bg-neutral-800 border-b border-neutral-100 dark:border-neutral-700 flex items-center gap-3">
            <BookOpen className="w-4 h-4 text-neutral-400 dark:text-neutral-500 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300 truncate">{strategy.bookTitle}</p>
              <p className="text-xs text-neutral-400 dark:text-neutral-500 font-light">{strategy.author}</p>
            </div>
          </div>

          <div className="px-5 pt-4 pb-2">
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-gradient-to-r from-pink-500 to-orange-500 text-white">
              {diag.label}
            </span>
          </div>

          <div className="px-5 pb-6">
            <Section title="Overview" defaultOpen>{strategy.briefOverview}</Section>
            <Section title="Evidence Base" defaultOpen>{strategy.evidenceBaseSummary}</Section>
            <Section title="Implementation Steps" defaultOpen>{strategy.implementationStepsSummary}</Section>
            <Section title="Other Diagnosis">{strategy.applicableDiagnoses}</Section>
            <Section title="Resources Needed">{strategy.resourcesNeeded}</Section>
            <Section title="Challenges & Solutions">{strategy.challengesSolutionsSummary}</Section>
            <Section title="Case Study">{strategy.caseStudySummary}</Section>
            <Section title="Success Criteria">{strategy.successCriteriaSummary}</Section>
          </div>
        </div>
      </div>
    </div>
  );
}

function AssignStrategyModal({ strategy, isOpen, onClose }) {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [goals, setGoals] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [selectedGoalId, setSelectedGoalId] = useState("");
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [loadingGoals, setLoadingGoals] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [assignedGoalId, setAssignedGoalId] = useState(null);

  useEffect(() => {
    if (!isOpen) {
      setStudents([]);
      setGoals([]);
      setSelectedStudentId("");
      setSelectedGoalId("");
      setError("");
      setAssignedGoalId(null);
      return;
    }

    const loadStudents = async () => {
      setLoadingStudents(true);
      setError("");
      try {
        const data = await apiClient.getStudents();
        setStudents(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message || "Failed to load students");
      } finally {
        setLoadingStudents(false);
      }
    };

    loadStudents();
  }, [isOpen]);

  useEffect(() => {
    if (!selectedStudentId) {
      setGoals([]);
      setSelectedGoalId("");
      return;
    }

    const loadGoals = async () => {
      setLoadingGoals(true);
      setError("");
      try {
        const data = await apiClient.getGoals(selectedStudentId);
        setGoals(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message || "Failed to load goals");
      } finally {
        setLoadingGoals(false);
      }
    };

    loadGoals();
  }, [selectedStudentId]);

  if (!isOpen || !strategy) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-lg max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-neutral-200 dark:border-neutral-700">
          <div>
            <h2 className="text-lg font-semibold text-neutral-800 dark:text-neutral-100">Assign Strategy to Goal</h2>
            <p className="text-sm text-neutral-400 dark:text-neutral-500 mt-1">{strategy.strategyName}</p>
          </div>
          <button onClick={onClose} className="p-1.5 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-5 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-800 dark:text-red-400 font-medium">{error}</p>
            </div>
          )}
          <div>
            <label className="block text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1.5">Student *</label>
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              disabled={loadingStudents}
              className="w-full px-3 py-2.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-100 text-sm focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-500"
            >
              <option value="">{loadingStudents ? 'Loading students...' : 'Select a student'}</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>{student.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1.5">Goal *</label>
            <select
              value={selectedGoalId}
              onChange={(e) => setSelectedGoalId(e.target.value)}
              disabled={!selectedStudentId || loadingGoals}
              className="w-full px-3 py-2.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-100 text-sm focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-500"
            >
              <option value="">
                {!selectedStudentId ? 'Select a student first' : loadingGoals ? 'Loading goals...' : 'Select a goal'}
              </option>
              {goals.map((goal) => (
                <option key={goal.id} value={goal.id}>{goal.title}</option>
              ))}
            </select>
          </div>
        </div>
        {assignedGoalId ? (
          <div className="px-5 py-4 border-t border-neutral-200 dark:border-neutral-700">
            <div className="p-3 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg mb-3">
              <p className="text-sm text-green-800 dark:text-green-400 font-medium">Strategy assigned successfully!</p>
            </div>
            <div className="flex items-center justify-end gap-3">
              <button type="button" onClick={onClose} className="px-4 py-2 bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 rounded-lg text-sm font-medium hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-colors">
                Close
              </button>
              <button
                type="button"
                onClick={() => { onClose(); navigate(`/goal/${assignedGoalId}`); }}
                className="px-4 py-2 bg-neutral-800 dark:bg-neutral-200 text-white dark:text-neutral-900 rounded-lg text-sm font-medium hover:bg-neutral-900 dark:hover:bg-neutral-300 transition-colors"
              >
                Go to Goal
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-neutral-200 dark:border-neutral-700">
            <button type="button" onClick={onClose} disabled={submitting} className="px-4 py-2 bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 rounded-lg text-sm font-medium hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-colors disabled:opacity-50">
              Cancel
            </button>
            <button
              type="button"
              onClick={async () => {
                if (!selectedGoalId) return;
                setSubmitting(true);
                setError("");
                try {
                  await apiClient.assignStrategyToGoal(Number(selectedGoalId), strategy.id);
                  setAssignedGoalId(selectedGoalId);
                } catch (err) {
                  setError(err.message || "Failed to assign strategy");
                } finally {
                  setSubmitting(false);
                }
              }}
              disabled={!selectedGoalId || submitting}
              className="px-4 py-2 bg-neutral-800 dark:bg-neutral-200 text-white dark:text-neutral-900 rounded-lg text-sm font-medium hover:bg-neutral-900 dark:hover:bg-neutral-300 transition-colors disabled:opacity-40"
            >
              {submitting ? 'Assigning...' : 'Assign'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function CategoryFormModal({ isOpen, onClose, onSubmit, initialData = null, loading = false, error = '', iconOptions = [] }) {
  const isEditMode = Boolean(initialData?.id);
  const [formData, setFormData] = useState({
    label: '',
    iconKey: '',
    colorKey: categoryColorOptions[0],
    sortOrder: 0,
  });

  useEffect(() => {
    if (!isOpen) return;
    setFormData({
      label: initialData?.label || '',
      iconKey: initialData?.iconKey || iconOptions[0]?.key || '',
      colorKey: initialData?.colorKey || categoryColorOptions[0],
      sortOrder: initialData?.sortOrder ?? 0,
    });
  }, [iconOptions, initialData, isOpen]);

  if (!isOpen) return null;

  const previewCategory = {
    label: formData.label || 'Category Preview',
    iconKey: formData.iconKey,
    colorKey: formData.colorKey
  };
  const previewMeta = getCategoryVisuals(previewCategory);

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-lg max-w-md w-full" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-neutral-200 dark:border-neutral-700">
          <h2 className="text-lg font-semibold text-neutral-800 dark:text-neutral-100">{isEditMode ? 'Edit Category' : 'Add Category'}</h2>
          <button onClick={onClose} className="p-1.5 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit({
              ...initialData,
              label: formData.label.trim(),
              iconKey: formData.iconKey,
              colorKey: formData.colorKey,
              sortOrder: Number(formData.sortOrder) || 0,
            });
          }}
        >
          <div className="p-5 space-y-4">
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-800 dark:text-red-400 font-medium">{error}</p>
              </div>
            )}

            <div className="rounded-xl border border-neutral-200 dark:border-neutral-700 p-4 bg-neutral-50 dark:bg-neutral-900/30">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl ${previewMeta.color} flex items-center justify-center text-white`}>
                  <StrategyIcon iconKey={previewMeta.iconKey} className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">{previewCategory.label}</p>
                  <p className="text-xs text-neutral-400 dark:text-neutral-500">Live preview</p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1.5">Label *</label>
              <input
                type="text"
                value={formData.label}
                onChange={(e) => setFormData(prev => ({ ...prev, label: e.target.value }))}
                placeholder="e.g. Behavioral"
                className="w-full px-3 py-2.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-100 text-sm focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1.5">Icon *</label>
                <select
                  value={formData.iconKey}
                  onChange={(e) => setFormData(prev => ({ ...prev, iconKey: e.target.value }))}
                  className="w-full px-3 py-2.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-100 text-sm focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-500"
                >
                  <option value="">{iconOptions.length ? 'Select...' : 'No icons available'}</option>
                  {iconOptions.map((icon) => (
                    <option key={icon.id || icon.key} value={icon.key}>{icon.label} ({icon.key})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1.5">Color *</label>
                <select
                  value={formData.colorKey}
                  onChange={(e) => setFormData(prev => ({ ...prev, colorKey: e.target.value }))}
                  className="w-full px-3 py-2.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-100 text-sm focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-500"
                >
                  {categoryColorOptions.map((colorKey) => (
                    <option key={colorKey} value={colorKey}>{colorKey}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1.5">Sort Order</label>
              <input
                type="number"
                value={formData.sortOrder}
                onChange={(e) => setFormData(prev => ({ ...prev, sortOrder: e.target.value }))}
                className="w-full px-3 py-2.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-100 text-sm focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-neutral-200 dark:border-neutral-700">
            <button type="button" onClick={onClose} disabled={loading} className="px-4 py-2 bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 rounded-lg text-sm font-medium hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-colors disabled:opacity-50">
              Cancel
            </button>
            <button type="submit" disabled={loading || !formData.label.trim() || !formData.iconKey} className="px-4 py-2 bg-neutral-800 dark:bg-neutral-200 text-white dark:text-neutral-900 rounded-lg text-sm font-medium hover:bg-neutral-900 dark:hover:bg-neutral-300 transition-colors disabled:opacity-40">
              {loading ? 'Saving...' : isEditMode ? 'Save Changes' : 'Create Category'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DeleteCategoryModal({ isOpen, onClose, onConfirm, category, loading = false, error = '' }) {
  if (!isOpen || !category) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-lg max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 text-center">
          <div className="w-12 h-12 bg-red-100 dark:bg-red-900/40 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">Delete Category</h3>
          <p className="text-neutral-500 dark:text-neutral-400 text-sm font-light">
            Are you sure you want to delete <span className="font-medium text-neutral-700 dark:text-neutral-300">"{category.label}"</span>?
          </p>
          {error && (
            <p className="mt-4 text-sm text-red-700 dark:text-red-400">{error}</p>
          )}
        </div>
        <div className="flex items-center gap-3 px-6 pb-6">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-2.5 bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 rounded-lg text-sm font-medium hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}

function IconFormModal({ isOpen, onClose, onSubmit, initialData = null, loading = false, error = '' }) {
  const isEditMode = Boolean(initialData?.id);
  const [formData, setFormData] = useState({
    key: '',
    label: '',
  });

  useEffect(() => {
    if (!isOpen) return;
    setFormData({
      key: initialData?.key || '',
      label: initialData?.label || '',
    });
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const previewMeta = getCategoryVisuals({ iconKey: formData.key, colorKey: 'pink' });

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-lg max-w-md w-full" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-neutral-200 dark:border-neutral-700">
          <h2 className="text-lg font-semibold text-neutral-800 dark:text-neutral-100">{isEditMode ? 'Edit Icon' : 'Add Icon'}</h2>
          <button onClick={onClose} className="p-1.5 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit({
              ...initialData,
              key: formData.key.trim(),
              label: formData.label.trim(),
            });
          }}
        >
          <div className="p-5 space-y-4">
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-800 dark:text-red-400 font-medium">{error}</p>
              </div>
            )}
            <div className="rounded-xl border border-neutral-200 dark:border-neutral-700 p-4 bg-neutral-50 dark:bg-neutral-900/30">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl ${previewMeta.color} flex items-center justify-center text-white`}>
                  <StrategyIcon iconKey={previewMeta.iconKey} className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">{formData.label || 'Icon Preview'}</p>
                  <p className="text-xs text-neutral-400 dark:text-neutral-500">{formData.key || 'Unknown keys fall back to BookOpen'}</p>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1.5">Icon Key *</label>
              <select
                value={formData.key}
                onChange={(e) => {
                  const selectedOption = standardLucideIconOptions.find((option) => option.key === e.target.value);
                  setFormData(prev => ({
                    ...prev,
                    key: e.target.value,
                    label: !prev.label.trim() || prev.label === initialData?.label ? (selectedOption?.label || prev.label) : prev.label
                  }));
                }}
                className="w-full px-3 py-2.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-100 text-sm focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-500"
                required
              >
                <option value="">Select an icon...</option>
                {standardLucideIconOptions.map((icon) => (
                  <option key={icon.key} value={icon.key}>
                    {icon.label} ({icon.key})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1.5">Label *</label>
              <input
                type="text"
                value={formData.label}
                onChange={(e) => setFormData(prev => ({ ...prev, label: e.target.value }))}
                placeholder="e.g. Book Open"
                className="w-full px-3 py-2.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-100 text-sm focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-500"
                required
              />
            </div>
          </div>
          <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-neutral-200 dark:border-neutral-700">
            <button type="button" onClick={onClose} disabled={loading} className="px-4 py-2 bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 rounded-lg text-sm font-medium hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-colors disabled:opacity-50">
              Cancel
            </button>
            <button type="submit" disabled={loading || !formData.key.trim() || !formData.label.trim()} className="px-4 py-2 bg-neutral-800 dark:bg-neutral-200 text-white dark:text-neutral-900 rounded-lg text-sm font-medium hover:bg-neutral-900 dark:hover:bg-neutral-300 transition-colors disabled:opacity-40">
              {loading ? 'Saving...' : isEditMode ? 'Save Changes' : 'Create Icon'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DeleteIconModal({ isOpen, onClose, onConfirm, icon, loading = false, error = '' }) {
  if (!isOpen || !icon) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-lg max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 text-center">
          <div className="w-12 h-12 bg-red-100 dark:bg-red-900/40 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">Delete Icon</h3>
          <p className="text-neutral-500 dark:text-neutral-400 text-sm font-light">
            Are you sure you want to delete <span className="font-medium text-neutral-700 dark:text-neutral-300">"{icon.label}"</span>?
          </p>
          {error && (
            <p className="mt-4 text-sm text-red-700 dark:text-red-400">{error}</p>
          )}
        </div>
        <div className="flex items-center gap-3 px-6 pb-6">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-2.5 bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 rounded-lg text-sm font-medium hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}

function DiagnosisFormModal({ isOpen, onClose, onSubmit, initialData = null, loading = false, error = '' }) {
  const isEditMode = Boolean(initialData?.id);
  const [formData, setFormData] = useState({
    label: '',
  });

  useEffect(() => {
    if (!isOpen) return;
    setFormData({
      label: initialData?.label || '',
    });
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-lg max-w-md w-full" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-neutral-200 dark:border-neutral-700">
          <h2 className="text-lg font-semibold text-neutral-800 dark:text-neutral-100">{isEditMode ? 'Edit Diagnosis' : 'Add Diagnosis'}</h2>
          <button onClick={onClose} className="p-1.5 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit({
              ...initialData,
              label: formData.label.trim(),
            });
          }}
        >
          <div className="p-5 space-y-4">
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-800 dark:text-red-400 font-medium">{error}</p>
              </div>
            )}
            <div>
              <label className="block text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1.5">Label *</label>
              <input
                type="text"
                value={formData.label}
                onChange={(e) => setFormData(prev => ({ ...prev, label: e.target.value }))}
                placeholder="e.g. ADHD"
                className="w-full px-3 py-2.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-100 text-sm focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-500"
                required
              />
            </div>
          </div>
          <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-neutral-200 dark:border-neutral-700">
            <button type="button" onClick={onClose} disabled={loading} className="px-4 py-2 bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 rounded-lg text-sm font-medium hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-colors disabled:opacity-50">
              Cancel
            </button>
            <button type="submit" disabled={loading || !formData.label.trim()} className="px-4 py-2 bg-neutral-800 dark:bg-neutral-200 text-white dark:text-neutral-900 rounded-lg text-sm font-medium hover:bg-neutral-900 dark:hover:bg-neutral-300 transition-colors disabled:opacity-40">
              {loading ? 'Saving...' : isEditMode ? 'Save Changes' : 'Create Diagnosis'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DeleteDiagnosisModal({ isOpen, onClose, onConfirm, diagnosis, loading = false, error = '' }) {
  if (!isOpen || !diagnosis) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-lg max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 text-center">
          <div className="w-12 h-12 bg-red-100 dark:bg-red-900/40 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">Delete Diagnosis</h3>
          <p className="text-neutral-500 dark:text-neutral-400 text-sm font-light">
            Are you sure you want to delete <span className="font-medium text-neutral-700 dark:text-neutral-300">"{diagnosis.label}"</span>?
          </p>
          {error && (
            <p className="mt-4 text-sm text-red-700 dark:text-red-400">{error}</p>
          )}
        </div>
        <div className="flex items-center gap-3 px-6 pb-6">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-2.5 bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 rounded-lg text-sm font-medium hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}

function ManageCategoriesModal({ isOpen, onClose, categories, counts, onAdd, onEdit, onDelete, onManageIcons, onManageDiagnoses }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-lg max-w-3xl w-full max-h-[85vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-neutral-200 dark:border-neutral-700">
          <div>
            <h2 className="text-lg font-semibold text-neutral-800 dark:text-neutral-100">Manage Categories</h2>
            <p className="text-sm text-neutral-400 dark:text-neutral-500 mt-1">Create, edit, and delete strategy categories.</p>
          </div>
          <button onClick={onClose} className="p-1.5 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-5 overflow-y-auto flex-1">
          <div className="flex justify-end mb-4">
            <button
              onClick={onManageIcons}
              className="flex items-center gap-2 px-3 py-2 mr-2 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 text-neutral-600 dark:text-neutral-300 rounded-lg text-sm font-medium hover:border-neutral-400 dark:hover:border-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-100 transition-colors"
            >
              <Pencil className="w-4 h-4" />
              <span>Manage Icons</span>
            </button>
            <button
              onClick={onManageDiagnoses}
              className="flex items-center gap-2 px-3 py-2 mr-2 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 text-neutral-600 dark:text-neutral-300 rounded-lg text-sm font-medium hover:border-neutral-400 dark:hover:border-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-100 transition-colors"
            >
              <Pencil className="w-4 h-4" />
              <span>Manage Diagnoses</span>
            </button>
            <button
              onClick={onAdd}
              className="flex items-center gap-2 px-3 py-2 bg-neutral-800 dark:bg-neutral-200 text-white dark:text-neutral-900 rounded-lg text-sm font-medium hover:bg-neutral-900 dark:hover:bg-neutral-300 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Category</span>
            </button>
          </div>
          <div className="space-y-3">
            {categories.map((category) => {
              const meta = getCategoryVisuals(category);
              return (
                <div key={category.id || category.key || category.label} className="flex items-center justify-between gap-4 p-4 border border-neutral-200 dark:border-neutral-700 rounded-xl">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-10 h-10 rounded-xl ${meta.color} flex items-center justify-center text-white flex-shrink-0`}>
                      <StrategyIcon iconKey={meta.iconKey} className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">{category.label}</p>
                      <p className="text-xs text-neutral-400 dark:text-neutral-500">
                        {counts[category.label] || 0} strategies · icon `{category.iconKey}` · color `{category.colorKey}`
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => onEdit(category)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-600 text-neutral-600 dark:text-neutral-300 text-sm hover:border-neutral-400 dark:hover:border-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-100 transition-colors"
                    >
                      <Pencil className="w-4 h-4" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => onDelete(category)}
                      className="p-2 rounded-lg border border-red-200 dark:border-red-900/40 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      title="Delete category"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function ManageIconsModal({ isOpen, onClose, icons, onAdd, onEdit, onDelete }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-lg max-w-3xl w-full max-h-[85vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-neutral-200 dark:border-neutral-700">
          <div>
            <h2 className="text-lg font-semibold text-neutral-800 dark:text-neutral-100">Manage Icons</h2>
            <p className="text-sm text-neutral-400 dark:text-neutral-500 mt-1">Add or edit icon keys available for strategy categories.</p>
          </div>
          <button onClick={onClose} className="p-1.5 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-5 overflow-y-auto flex-1">
          <div className="flex justify-end mb-4">
            <button
              onClick={onAdd}
              className="flex items-center gap-2 px-3 py-2 bg-neutral-800 dark:bg-neutral-200 text-white dark:text-neutral-900 rounded-lg text-sm font-medium hover:bg-neutral-900 dark:hover:bg-neutral-300 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Icon</span>
            </button>
          </div>
          <div className="space-y-3">
            {icons.map((icon) => {
              return (
                <div key={icon.id || icon.key} className="flex items-center justify-between gap-4 p-4 border border-neutral-200 dark:border-neutral-700 rounded-xl">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-pink-500 flex items-center justify-center text-white flex-shrink-0">
                      <StrategyIcon iconKey={icon.key} className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">{icon.label}</p>
                      <p className="text-xs text-neutral-400 dark:text-neutral-500">{icon.key}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => onEdit(icon)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-600 text-neutral-600 dark:text-neutral-300 text-sm hover:border-neutral-400 dark:hover:border-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-100 transition-colors"
                    >
                      <Pencil className="w-4 h-4" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => onDelete(icon)}
                      className="p-2 rounded-lg border border-red-200 dark:border-red-900/40 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      title="Delete icon"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function ManageDiagnosesModal({ isOpen, onClose, diagnoses, counts, onAdd, onEdit, onDelete }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-lg max-w-3xl w-full max-h-[85vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-neutral-200 dark:border-neutral-700">
          <div>
            <h2 className="text-lg font-semibold text-neutral-800 dark:text-neutral-100">Manage Diagnoses</h2>
            <p className="text-sm text-neutral-400 dark:text-neutral-500 mt-1">Add or edit diagnoses available in strategy forms.</p>
          </div>
          <button onClick={onClose} className="p-1.5 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-5 overflow-y-auto flex-1">
          <div className="flex justify-end mb-4">
            <button
              onClick={onAdd}
              className="flex items-center gap-2 px-3 py-2 bg-neutral-800 dark:bg-neutral-200 text-white dark:text-neutral-900 rounded-lg text-sm font-medium hover:bg-neutral-900 dark:hover:bg-neutral-300 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Diagnosis</span>
            </button>
          </div>
          <div className="space-y-3">
            {diagnoses.map((diagnosis) => (
              <div key={diagnosis.id || diagnosis.key || diagnosis.label} className="flex items-center justify-between gap-4 p-4 border border-neutral-200 dark:border-neutral-700 rounded-xl">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">{diagnosis.label}</p>
                  <p className="text-xs text-neutral-400 dark:text-neutral-500">
                    {counts[diagnosis.label] || 0} strategies
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => onEdit(diagnosis)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-600 text-neutral-600 dark:text-neutral-300 text-sm hover:border-neutral-400 dark:hover:border-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-100 transition-colors"
                  >
                    <Pencil className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => onDelete(diagnosis)}
                    className="p-2 rounded-lg border border-red-200 dark:border-red-900/40 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    title="Delete diagnosis"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function StrategyLibrary() {
  const navigate = useNavigate();
  const { can } = usePermissions();
  const {
    loading,
    loadStrategies,
    loadStrategyCategories,
    loadStrategyIcons,
    loadStrategyDiagnoses,
    createStrategyIcon,
    updateStrategyIcon,
    deleteStrategyIcon,
    createStrategyDiagnosis,
    updateStrategyDiagnosis,
    deleteStrategyDiagnosis,
    createStrategyCategory,
    updateStrategyCategory,
    deleteStrategyCategory,
    deleteStrategy,
    authReady
  } = useStrategies();
  const [strategies, setStrategies] = useState([]);
  const [categories, setCategories] = useState([]);
  const [icons, setIcons] = useState([]);
  const [diagnoses, setDiagnoses] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [search, setSearch] = useState("");
  const [categorySearch, setCategorySearch] = useState("");
  const [selectedDiagnoses, setSelectedDiagnoses] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showManageCategories, setShowManageCategories] = useState(false);
  const [showManageIcons, setShowManageIcons] = useState(false);
  const [showManageDiagnoses, setShowManageDiagnoses] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [assignTarget, setAssignTarget] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deletingCategory, setDeletingCategory] = useState(null);
  const [editingIcon, setEditingIcon] = useState(null);
  const [deletingIcon, setDeletingIcon] = useState(null);
  const [editingDiagnosis, setEditingDiagnosis] = useState(null);
  const [deletingDiagnosis, setDeletingDiagnosis] = useState(null);
  const [categoryFormError, setCategoryFormError] = useState("");
  const [categoryDeleteError, setCategoryDeleteError] = useState("");
  const [iconFormError, setIconFormError] = useState("");
  const [iconDeleteError, setIconDeleteError] = useState("");
  const [diagnosisFormError, setDiagnosisFormError] = useState("");
  const [diagnosisDeleteError, setDiagnosisDeleteError] = useState("");
  const [categorySubmitting, setCategorySubmitting] = useState(false);

  useEffect(() => {
    if (authReady) {
      Promise.all([loadStrategies(), loadStrategyCategories(), loadStrategyIcons(), loadStrategyDiagnoses()]).then(([strategyData, categoryData, iconData, diagnosisData]) => {
        if (strategyData) setStrategies(strategyData);
        if (categoryData) setCategories(categoryData);
        if (iconData) setIcons(iconData);
        if (diagnosisData) setDiagnoses(diagnosisData);
      });
    }
  }, [authReady]); // eslint-disable-line

  const availableCategories = useMemo(() => {
    return [...categories].sort((a, b) => a.label.localeCompare(b.label));
  }, [categories]);

  const searchResults = useMemo(() => {
    if (!categorySearch.trim()) return null;
    const query = categorySearch.trim().toLowerCase();
    return strategies.filter((s) =>
      [
        s.categoryMeta?.label || s.strategyCategory || "",
        s.strategyName || "",
      ].some((value) => value.toLowerCase().includes(query))
    );
  }, [strategies, categorySearch]);

  const filteredCategoryCards = useMemo(() => {
    if (!categorySearch.trim()) return availableCategories;
    if (!searchResults || searchResults.length === 0) return [];
    const matchedCategoryLabels = new Set(searchResults.map(s => s.categoryMeta?.label || s.strategyCategory));
    return availableCategories.filter((category) => matchedCategoryLabels.has(category.label));
  }, [availableCategories, categorySearch, searchResults]);

  const categoryCounts = useMemo(() => {
    const counts = {};
    for (const category of availableCategories) {
      counts[category.label] = strategies.filter(
        (strategy) => (strategy.categoryMeta?.label || strategy.strategyCategory) === category.label
      ).length;
    }
    return counts;
  }, [availableCategories, strategies]);

  const diagnosisCounts = useMemo(() => {
    const counts = {};
    diagnoses.forEach((diagnosis) => {
      counts[diagnosis.label] = strategies.filter((strategy) => strategy.primaryDiagnosis === diagnosis.label).length;
    });
    return counts;
  }, [diagnoses, strategies]);

  const toggleDiagnosis = useCallback((label) => {
    setSelectedDiagnoses((prev) =>
      prev.includes(label) ? prev.filter((d) => d !== label) : [...prev, label]
    );
  }, []);

  const goBack = useCallback(() => {
    setActiveCategory(null);
    setSearch("");
    setSelectedDiagnoses([]);
  }, []);

  useEffect(() => {
    setSelectedDiagnoses([]);
  }, [activeCategory?.label]);

  const filtered = useMemo(() => {
    if (!activeCategory) return [];
    return strategies.filter((strategy) => {
      if ((strategy.categoryMeta?.label || strategy.strategyCategory) !== activeCategory.label) {
        return false;
      }

      if (search) {
        const q = search.toLowerCase();
        const searchable = (strategy.strategyName || "").toLowerCase();
        if (!searchable.includes(q)) return false;
      }

      if (selectedDiagnoses.length > 0) {
        const primaryDiagnosis = strategy.primaryDiagnosis?.trim();
        if (!primaryDiagnosis || !selectedDiagnoses.includes(primaryDiagnosis)) return false;
      }

      return true;
    });
  }, [activeCategory, search, selectedDiagnoses, strategies]);

  const availableDiagnosisFilters = useMemo(() => {
    if (!activeCategory) return [];

    const diagnosisSet = new Set();
    const categoryStrategies = strategies.filter(
      (strategy) => (strategy.categoryMeta?.label || strategy.strategyCategory) === activeCategory.label
    );

    categoryStrategies.forEach((strategy) => {
      if (strategy.primaryDiagnosis?.trim()) {
        diagnosisSet.add(strategy.primaryDiagnosis.trim());
      }
    });

    return Array.from(diagnosisSet).sort((a, b) => a.localeCompare(b));
  }, [activeCategory, strategies]);

  const handleAddSuccess = async () => {
    const [strategyData, categoryData, iconData, diagnosisData] = await Promise.all([loadStrategies(), loadStrategyCategories(), loadStrategyIcons(), loadStrategyDiagnoses()]);
    if (strategyData) setStrategies(strategyData);
    if (categoryData) setCategories(categoryData);
    if (iconData) setIcons(iconData);
    if (diagnosisData) setDiagnoses(diagnosisData);
  };

  const refreshLibraryData = async (preferredCategoryLabel = activeCategory?.label) => {
    const [strategyData, categoryData, iconData, diagnosisData] = await Promise.all([loadStrategies(), loadStrategyCategories(), loadStrategyIcons(), loadStrategyDiagnoses()]);
    const nextStrategies = strategyData || [];
    const nextCategories = categoryData || [];
    const nextIcons = iconData || [];
    const nextDiagnoses = diagnosisData || [];

    setStrategies(nextStrategies);
    setCategories(nextCategories);
    setIcons(nextIcons);
    setDiagnoses(nextDiagnoses);

    if (!preferredCategoryLabel) return;

    const matchedCategory = nextCategories.find((category) => category.label === preferredCategoryLabel);
    if (matchedCategory) {
      setActiveCategory(matchedCategory);
      return;
    }

    setActiveCategory(null);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await deleteStrategy(deleteTarget.id);
      setStrategies((prev) => prev.filter((s) => s.id !== deleteTarget.id));
      setDeleteTarget(null);
      setSelected(null);
    } catch (err) {
      // error is handled in the modal via useStrategies
    }
  };

  const handleDeleteFromDetail = (strategy) => {
    setSelected(null);
    setDeleteTarget(strategy);
  };

  const handleEditFromDetail = (strategy) => {
    setSelected(null);
    setEditTarget(strategy);
  };

  const handleAssignFromDetail = (strategy) => {
    setSelected(null);
    setAssignTarget(strategy);
  };

  const handleEditSuccess = async () => {
    await refreshLibraryData(activeCategory?.label);
    setEditTarget(null);
  };

  const handleCategorySubmit = async (payload) => {
    try {
      setCategorySubmitting(true);
      setCategoryFormError("");
      if (payload.id) {
        await updateStrategyCategory(payload.id, payload);
      } else {
        await createStrategyCategory(payload);
      }
      await refreshLibraryData(payload.label);
      setEditingCategory(null);
      setShowManageCategories(true);
    } catch (error) {
      setCategoryFormError(error.message || "Failed to save category");
    } finally {
      setCategorySubmitting(false);
    }
  };

  const handleCategoryDeleteConfirm = async () => {
    if (!deletingCategory) return;
    try {
      setCategorySubmitting(true);
      setCategoryDeleteError("");
      await deleteStrategyCategory(deletingCategory.id);
      await refreshLibraryData(activeCategory?.label === deletingCategory.label ? null : activeCategory?.label);
      setDeletingCategory(null);
    } catch (error) {
      setCategoryDeleteError(error.message || "Failed to delete category");
    } finally {
      setCategorySubmitting(false);
    }
  };

  const handleIconSubmit = async (payload) => {
    try {
      setCategorySubmitting(true);
      setIconFormError("");
      if (payload.id) {
        await updateStrategyIcon(payload.id, payload);
      } else {
        await createStrategyIcon(payload);
      }
      await refreshLibraryData(activeCategory?.label);
      setEditingIcon(null);
      setShowManageIcons(true);
    } catch (error) {
      setIconFormError(error.message || "Failed to save icon");
    } finally {
      setCategorySubmitting(false);
    }
  };

  const handleIconDeleteConfirm = async () => {
    if (!deletingIcon) return;
    try {
      setCategorySubmitting(true);
      setIconDeleteError("");
      await deleteStrategyIcon(deletingIcon.id);
      await refreshLibraryData(activeCategory?.label);
      setDeletingIcon(null);
    } catch (error) {
      setIconDeleteError(error.message || "Failed to delete icon");
    } finally {
      setCategorySubmitting(false);
    }
  };

  const handleDiagnosisSubmit = async (payload) => {
    try {
      setCategorySubmitting(true);
      setDiagnosisFormError("");
      if (payload.id) {
        await updateStrategyDiagnosis(payload.id, payload);
      } else {
        await createStrategyDiagnosis(payload);
      }
      await refreshLibraryData(activeCategory?.label);
      setEditingDiagnosis(null);
      setShowManageDiagnoses(true);
    } catch (error) {
      setDiagnosisFormError(error.message || "Failed to save diagnosis");
    } finally {
      setCategorySubmitting(false);
    }
  };

  const handleDiagnosisDeleteConfirm = async () => {
    if (!deletingDiagnosis) return;
    try {
      setCategorySubmitting(true);
      setDiagnosisDeleteError("");
      await deleteStrategyDiagnosis(deletingDiagnosis.id);
      await refreshLibraryData(activeCategory?.label);
      setDeletingDiagnosis(null);
    } catch (error) {
      setDiagnosisDeleteError(error.message || "Failed to delete diagnosis");
    } finally {
      setCategorySubmitting(false);
    }
  };

  const closeManageCategories = useCallback(() => {
    setShowManageCategories(false);
  }, []);

  const openManageIcons = useCallback(() => {
    setShowManageCategories(false);
    setShowManageIcons(true);
  }, []);

  const closeManageIcons = useCallback(() => {
    setShowManageIcons(false);
    setShowManageCategories(true);
  }, []);

  const openManageDiagnoses = useCallback(() => {
    setShowManageCategories(false);
    setShowManageDiagnoses(true);
  }, []);

  const closeManageDiagnoses = useCallback(() => {
    setShowManageDiagnoses(false);
    setShowManageCategories(true);
  }, []);

  if (loading && strategies.length === 0) {
    return <LoadingSpinner />;
  }

  // ── All Categories View ──
  if (!activeCategory) {
    return (
      <>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 sm:mb-10">
          <div>
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-6xl text-neutral-900 dark:text-neutral-100">
              Strategy Library
            </h1>
            <div className="flex items-center gap-3 mt-2">
              <p className="text-neutral-400 dark:text-neutral-500 text-base font-light">
                {strategies.length} evidence-based strategies from{" "}
                {new Set(strategies.map((s) => s.bookTitle)).size} sources
              </p>
              <button
                onClick={() => setShowHelp(true)}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-medium text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:border-neutral-300 dark:hover:border-neutral-600 transition-all"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                How does this work?
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setCategoryFormError("");
                setShowManageCategories(true);
              }}
              className="flex items-center space-x-2 px-3 py-2 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-600 dark:text-neutral-300 hover:text-neutral-800 dark:hover:text-neutral-100 hover:border-neutral-400 dark:hover:border-neutral-500 hover:shadow-sm transition-all text-sm"
            >
              <Pencil className="w-4 h-4" />
              <span>Manage Categories</span>
            </button>
            {can('strategies', 'manage') && (
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center space-x-2 px-3 py-2 bg-neutral-800 dark:bg-neutral-200 text-white dark:text-neutral-900 rounded-lg text-sm font-medium hover:bg-neutral-900 dark:hover:bg-neutral-300 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Strategy</span>
              </button>
            )}
            <button
              onClick={() => navigate("/classrooms")}
              className="flex items-center space-x-2 px-3 py-2 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-600 dark:text-neutral-300 hover:text-neutral-800 dark:hover:text-neutral-100 hover:border-neutral-400 dark:hover:border-neutral-500 hover:shadow-sm transition-all text-sm"
            >
              <span className="text-base leading-none">&lsaquo;</span>
              <span>Back to Classrooms</span>
            </button>
          </div>
        </div>

        <p className="text-xs font-medium text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-4">
          {categorySearch.trim() ? `Results for "${categorySearch}"` : 'Browse by category'}
        </p>
        <div className="relative mb-4">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 dark:text-neutral-500" />
          <input
            type="text"
            placeholder="Search by category name..."
            value={categorySearch}
            onChange={(e) => setCategorySearch(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm text-neutral-800 dark:text-neutral-200 placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-pink-200 dark:focus:ring-pink-500/30 focus:border-transparent transition-all"
          />
          {categorySearch && (
            <button
              onClick={() => setCategorySearch("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        {searchResults && searchResults.length > 0 && (
          <p className="text-xs text-neutral-400 dark:text-neutral-500 mb-3">
            {searchResults.length} matching strategies across {filteredCategoryCards.length} categories
          </p>
        )}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredCategoryCards.map((category) => {
            const matchCount = searchResults ? searchResults.filter(s => (s.categoryMeta?.label || s.strategyCategory) === category.label).length : categoryCounts[category.label] || 0;
            return (
              <CategoryTile
                key={category.id || category.key || category.label}
                category={category}
                count={searchResults ? matchCount : (categoryCounts[category.label] || 0)}
                onClick={() => {
                  setActiveCategory(category);
                  setSearch("");
                  setSelectedDiagnoses([]);
                }}
              />
            );
          })}
        </div>
        {filteredCategoryCards.length === 0 && categorySearch.trim() && (
          <div className="mt-6 text-sm text-neutral-400 dark:text-neutral-500 text-center">
            No strategies found for "{categorySearch}".
          </div>
        )}

        <AddStrategyModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSuccess={handleAddSuccess}
          categoryOptions={categories}
          diagnosisOptions={diagnoses}
        />

        <ManageCategoriesModal
          isOpen={showManageCategories}
          onClose={closeManageCategories}
          categories={categories}
          counts={categoryCounts}
          onAdd={() => {
            setCategoryFormError("");
            setEditingCategory({});
            setShowManageCategories(false);
          }}
          onEdit={(category) => {
            setCategoryFormError("");
            setEditingCategory(category);
            setShowManageCategories(false);
          }}
          onDelete={(category) => {
            setCategoryDeleteError("");
            setDeletingCategory(category);
            setShowManageCategories(false);
          }}
          onManageIcons={openManageIcons}
          onManageDiagnoses={openManageDiagnoses}
        />

        <CategoryFormModal
          isOpen={editingCategory !== null}
          onClose={() => {
            setEditingCategory(null);
            setCategoryFormError("");
          }}
          onSubmit={handleCategorySubmit}
          initialData={editingCategory && editingCategory.id ? editingCategory : null}
          loading={categorySubmitting}
          error={categoryFormError}
          iconOptions={icons}
        />

        <DeleteCategoryModal
          isOpen={!!deletingCategory}
          onClose={() => {
            setDeletingCategory(null);
            setCategoryDeleteError("");
          }}
          onConfirm={handleCategoryDeleteConfirm}
          category={deletingCategory}
          loading={categorySubmitting}
          error={categoryDeleteError}
        />

        <ManageIconsModal
          isOpen={showManageIcons}
          onClose={closeManageIcons}
          icons={icons}
          onAdd={() => {
            setIconFormError("");
            setEditingIcon({});
            setShowManageIcons(false);
          }}
          onEdit={(icon) => {
            setIconFormError("");
            setEditingIcon(icon);
            setShowManageIcons(false);
          }}
          onDelete={(icon) => {
            setIconDeleteError("");
            setDeletingIcon(icon);
            setShowManageIcons(false);
          }}
        />

        <ManageDiagnosesModal
          isOpen={showManageDiagnoses}
          onClose={closeManageDiagnoses}
          diagnoses={diagnoses}
          counts={diagnosisCounts}
          onAdd={() => {
            setDiagnosisFormError("");
            setEditingDiagnosis({});
            setShowManageDiagnoses(false);
          }}
          onEdit={(diagnosis) => {
            setDiagnosisFormError("");
            setEditingDiagnosis(diagnosis);
            setShowManageDiagnoses(false);
          }}
          onDelete={(diagnosis) => {
            setDiagnosisDeleteError("");
            setDeletingDiagnosis(diagnosis);
            setShowManageDiagnoses(false);
          }}
        />

        <IconFormModal
          isOpen={editingIcon !== null}
          onClose={() => {
            setEditingIcon(null);
            setIconFormError("");
          }}
          onSubmit={handleIconSubmit}
          initialData={editingIcon && editingIcon.id ? editingIcon : null}
          loading={categorySubmitting}
          error={iconFormError}
        />

        <DiagnosisFormModal
          isOpen={editingDiagnosis !== null}
          onClose={() => {
            setEditingDiagnosis(null);
            setDiagnosisFormError("");
          }}
          onSubmit={handleDiagnosisSubmit}
          initialData={editingDiagnosis && editingDiagnosis.id ? editingDiagnosis : null}
          loading={categorySubmitting}
          error={diagnosisFormError}
        />

        <DeleteIconModal
          isOpen={!!deletingIcon}
          onClose={() => {
            setDeletingIcon(null);
            setIconDeleteError("");
          }}
          onConfirm={handleIconDeleteConfirm}
          icon={deletingIcon}
          loading={categorySubmitting}
          error={iconDeleteError}
        />

        <DeleteDiagnosisModal
          isOpen={!!deletingDiagnosis}
          onClose={() => {
            setDeletingDiagnosis(null);
            setDiagnosisDeleteError("");
          }}
          onConfirm={handleDiagnosisDeleteConfirm}
          diagnosis={deletingDiagnosis}
          loading={categorySubmitting}
          error={diagnosisDeleteError}
        />

        {showHelp && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowHelp(false)}>
            <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl shadow-lg max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between p-5 border-b border-neutral-200 dark:border-neutral-700">
                <h2 className="text-lg font-semibold text-neutral-800 dark:text-neutral-100">How to Use the Strategy Library</h2>
                <button onClick={() => setShowHelp(false)} className="p-1.5 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-5 space-y-4 text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
                <div>
                  <h3 className="font-semibold text-neutral-800 dark:text-neutral-100 mb-1">Browse by Category</h3>
                  <p className="font-light">Strategies are organized into categories like Behavioral, Emotional Regulation, and Literacy & Reading. Click a category tile to see all strategies in that group.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-800 dark:text-neutral-100 mb-1">Search & Filter</h3>
                  <p className="font-light">Inside a category, use the search bar to find specific strategies by name, author, or keyword. Use the diagnosis filter pills to narrow results by diagnosis (e.g. ADHD, Autism, Dyslexia).</p>
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-800 dark:text-neutral-100 mb-1">View Strategy Details</h3>
                  <p className="font-light">Click any strategy card to open its full detail view with evidence base, implementation steps, case studies, resources needed, and success criteria.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-800 dark:text-neutral-100 mb-1">Assign to Goals</h3>
                  <p className="font-light">From a strategy's detail view, click "Assign" to link it to a student's goal. Select the student and goal, and the strategy will be associated with that goal for tracking.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // ── Category Detail View ──
  const hasFilters = search || selectedDiagnoses.length > 0;

  const activeMeta = getCategoryVisuals(activeCategory);

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 sm:mb-8">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl ${activeMeta.color} flex items-center justify-center text-white flex-shrink-0`}>
            <StrategyIcon iconKey={activeMeta.iconKey} className="w-6 h-6 sm:w-7 sm:h-7" />
          </div>
          <div>
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-neutral-900 dark:text-neutral-100">
              {activeCategory.label}
            </h1>
            <p className="mt-1 text-neutral-400 dark:text-neutral-500 text-base font-light">
              {categoryCounts[activeCategory.label]} strategies
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setCategoryFormError("");
              setEditingCategory(activeCategory);
            }}
            className="flex items-center space-x-2 px-3 py-2 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-600 dark:text-neutral-300 hover:text-neutral-800 dark:hover:text-neutral-100 hover:border-neutral-400 dark:hover:border-neutral-500 hover:shadow-sm transition-all text-sm"
          >
            <Pencil className="w-4 h-4" />
            <span>Edit Category</span>
          </button>
          {can('strategies', 'manage') && (
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center space-x-2 px-3 py-2 bg-neutral-800 dark:bg-neutral-200 text-white dark:text-neutral-900 rounded-lg text-sm font-medium hover:bg-neutral-900 dark:hover:bg-neutral-300 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Strategy</span>
            </button>
          )}
          <button
            onClick={goBack}
            className="flex items-center space-x-2 px-3 py-2 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-600 dark:text-neutral-300 hover:text-neutral-800 dark:hover:text-neutral-100 hover:border-neutral-400 dark:hover:border-neutral-500 hover:shadow-sm transition-all text-sm"
          >
            <span className="text-base leading-none">&lsaquo;</span>
            <span>All Categories</span>
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 dark:text-neutral-500" />
        <input
          type="text"
          placeholder="Search within this category..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-10 py-2.5 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm text-neutral-800 dark:text-neutral-200 placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-pink-200 dark:focus:ring-pink-500/30 focus:border-transparent transition-all"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Diagnosis pills */}
      <div className="flex flex-wrap gap-2 mb-5">
        {availableDiagnosisFilters.map((diagnosis) => {
          const active = selectedDiagnoses.includes(diagnosis);
          return (
            <button
              key={diagnosis}
              onClick={() => toggleDiagnosis(diagnosis)}
              className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-all duration-200 ${
                active
                  ? "bg-gradient-to-r from-pink-500 to-orange-500 text-white border-transparent shadow-sm"
                  : "bg-white dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 border-neutral-200 dark:border-neutral-700 hover:border-pink-300 hover:text-neutral-700 dark:hover:text-neutral-300"
              }`}
            >
              {diagnosis}
            </button>
          );
        })}
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-neutral-400 dark:text-neutral-500 font-light">
          Showing <span className="font-medium text-neutral-600 dark:text-neutral-300">{filtered.length}</span>{" "}
          {filtered.length === 1 ? "strategy" : "strategies"}
        </p>
        {hasFilters && (
          <button
            onClick={() => { setSearch(""); setSelectedDiagnoses([]); }}
            className="text-xs text-neutral-400 dark:text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 underline underline-offset-2 transition-colors"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Cards — 4 per row on large screens */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filtered.map((strategy) => (
            <StrategyCard
              key={strategy.id}
              strategy={strategy}
              onClick={() => setSelected(strategy)}
            />
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center min-h-[30vh]">
          <div className="text-center">
            <div className="w-16 h-16 bg-neutral-100 dark:bg-neutral-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-neutral-300 dark:text-neutral-500" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-700 dark:text-neutral-300 mb-1">No strategies found</h3>
            <p className="text-neutral-400 dark:text-neutral-500 text-sm max-w-xs mx-auto mb-4 font-light">
              Try adjusting your search or diagnosis filters.
            </p>
            <button
              onClick={() => { setSearch(""); setSelectedDiagnoses([]); }}
              className="text-sm font-medium text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-100 underline underline-offset-2 transition-colors"
            >
              Clear filters
            </button>
          </div>
        </div>
      )}

      {selected && (
        <DetailModal
          strategy={selected}
          onClose={() => setSelected(null)}
          onDelete={handleDeleteFromDetail}
          onEdit={handleEditFromDetail}
          onAssign={handleAssignFromDetail}
        />
      )}

      <AssignStrategyModal
        strategy={assignTarget}
        isOpen={!!assignTarget}
        onClose={() => setAssignTarget(null)}
      />

      <AddStrategyModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={handleAddSuccess}
        defaultCategory={activeCategory?.label || ''}
        categoryOptions={categories}
        diagnosisOptions={diagnoses}
      />

      <AddStrategyModal
        isOpen={!!editTarget}
        onClose={() => setEditTarget(null)}
        onSuccess={handleEditSuccess}
        categoryOptions={categories}
        diagnosisOptions={diagnoses}
        initialData={editTarget}
      />

      <ManageCategoriesModal
        isOpen={showManageCategories}
        onClose={closeManageCategories}
        categories={categories}
        counts={categoryCounts}
        onAdd={() => {
          setCategoryFormError("");
          setEditingCategory({});
          setShowManageCategories(false);
        }}
        onEdit={(category) => {
          setCategoryFormError("");
          setEditingCategory(category);
          setShowManageCategories(false);
        }}
        onDelete={(category) => {
          setCategoryDeleteError("");
          setDeletingCategory(category);
          setShowManageCategories(false);
        }}
        onManageIcons={openManageIcons}
        onManageDiagnoses={openManageDiagnoses}
      />

      <CategoryFormModal
        isOpen={editingCategory !== null}
        onClose={() => {
          setEditingCategory(null);
          setCategoryFormError("");
        }}
        onSubmit={handleCategorySubmit}
        initialData={editingCategory && editingCategory.id ? editingCategory : null}
        loading={categorySubmitting}
        error={categoryFormError}
        iconOptions={icons}
      />

      <DeleteCategoryModal
        isOpen={!!deletingCategory}
        onClose={() => {
          setDeletingCategory(null);
          setCategoryDeleteError("");
        }}
        onConfirm={handleCategoryDeleteConfirm}
        category={deletingCategory}
        loading={categorySubmitting}
        error={categoryDeleteError}
      />

      <ManageIconsModal
        isOpen={showManageIcons}
        onClose={closeManageIcons}
        icons={icons}
        onAdd={() => {
          setIconFormError("");
          setEditingIcon({});
          setShowManageIcons(false);
        }}
        onEdit={(icon) => {
          setIconFormError("");
          setEditingIcon(icon);
          setShowManageIcons(false);
        }}
        onDelete={(icon) => {
          setIconDeleteError("");
          setDeletingIcon(icon);
          setShowManageIcons(false);
        }}
      />

      <ManageDiagnosesModal
        isOpen={showManageDiagnoses}
        onClose={closeManageDiagnoses}
        diagnoses={diagnoses}
        counts={diagnosisCounts}
        onAdd={() => {
          setDiagnosisFormError("");
          setEditingDiagnosis({});
          setShowManageDiagnoses(false);
        }}
        onEdit={(diagnosis) => {
          setDiagnosisFormError("");
          setEditingDiagnosis(diagnosis);
          setShowManageDiagnoses(false);
        }}
        onDelete={(diagnosis) => {
          setDiagnosisDeleteError("");
          setDeletingDiagnosis(diagnosis);
          setShowManageDiagnoses(false);
        }}
      />

      <IconFormModal
        isOpen={editingIcon !== null}
        onClose={() => {
          setEditingIcon(null);
          setIconFormError("");
        }}
        onSubmit={handleIconSubmit}
        initialData={editingIcon && editingIcon.id ? editingIcon : null}
        loading={categorySubmitting}
        error={iconFormError}
      />

      <DiagnosisFormModal
        isOpen={editingDiagnosis !== null}
        onClose={() => {
          setEditingDiagnosis(null);
          setDiagnosisFormError("");
        }}
        onSubmit={handleDiagnosisSubmit}
        initialData={editingDiagnosis && editingDiagnosis.id ? editingDiagnosis : null}
        loading={categorySubmitting}
        error={diagnosisFormError}
      />

      <DeleteIconModal
        isOpen={!!deletingIcon}
        onClose={() => {
          setDeletingIcon(null);
          setIconDeleteError("");
        }}
        onConfirm={handleIconDeleteConfirm}
        icon={deletingIcon}
        loading={categorySubmitting}
        error={iconDeleteError}
      />

      <DeleteDiagnosisModal
        isOpen={!!deletingDiagnosis}
        onClose={() => {
          setDeletingDiagnosis(null);
          setDiagnosisDeleteError("");
        }}
        onConfirm={handleDiagnosisDeleteConfirm}
        diagnosis={deletingDiagnosis}
        loading={categorySubmitting}
        error={diagnosisDeleteError}
      />

      <DeleteStrategyModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        strategyName={deleteTarget?.strategyName}
        loading={loading}
      />
    </>
  );
}
