// src/pages/GoalDetail.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FileText, CheckCircle, X, BarChart3, Pencil, Trash2, ChevronDown, ChevronUp, BookOpen, ThumbsUp, ThumbsDown, Sparkles, Check, Info } from "lucide-react";

import ProgressDashboardContent from "../components/ProgressDashboardContent";
import BarChartContent from "../components/BarChartContent";
import StackedBarContent from "../components/StackedBarContent";
import BoxplotContent from "../components/BoxplotContent";
import { apiClient } from '../apiClient';
import LoadingSpinner from '../components/LoadingSpinner';
import AiLoadingAnimation, { AI_STRATEGY_MESSAGES } from '../components/AiLoadingAnimation';
import { useAuth } from '../context/AuthContext';

const LIKERT_OPTIONS = [
  { value: 1, label: "Strongly Disagree" },
  { value: 2, label: "Disagree" },
  { value: 3, label: "Neutral" },
  { value: 4, label: "Agree" },
  { value: 5, label: "Strongly Agree" }
];

function FillSurveyModal({ goalId, onClose, survey, onComplete }) {
  const [responses, setResponses] = useState({});
  const [isCompleted, setIsCompleted] = useState(false);

  const questions = (survey?.questions || []).map((q, i) =>
    typeof q === 'string' ? { id: `q-${i}`, type: 'likert', text: q } : q
  );

  const handleChange = (questionId, value) => {
    setResponses(prev => ({ ...prev, [questionId]: value }));
  };

  const handleCheckboxToggle = (questionId, option, multiSelect) => {
    setResponses(prev => {
      if (multiSelect === false) {
        return { ...prev, [questionId]: prev[questionId] === option ? null : option };
      }
      const current = prev[questionId] || [];
      return { ...prev, [questionId]: current.includes(option) ? current.filter(o => o !== option) : [...current, option] };
    });
  };

  const isFormComplete = questions.every(q => {
    const val = responses[q.id];
    if (q.type === 'text') return val && val.trim();
    if (q.type === 'checkbox') return q.multiSelect === false ? !!val : val && val.length > 0;
    return val !== undefined;
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormComplete) return;
    try {
      const newCheckIn = {
        type: "submission",
        surveyId: survey?.id || "unknown",
        surveyTitle: survey?.title || "Survey",
        submittedAt: new Date().toISOString(),
        responses: questions.map(q => {
          const val = responses[q.id];
          const base = { question: q.text, type: q.type };
          if (q.type === 'likert') {
            const opts = q.likertOptions || LIKERT_OPTIONS;
            return { ...base, value: val, label: opts.find(o => o.value === val)?.label, scale: opts.length };
          }
          return { ...base, value: val };
        })
      };
      await apiClient.updateGoalSurvey(goalId, newCheckIn);
      setIsCompleted(true);
      setTimeout(() => { onComplete(); onClose(); }, 1500);
    } catch (err) {
      console.error("Failed to save survey:", err);
      alert(err.message || "Failed to save survey");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div className="px-6 py-5 border-b border-neutral-200 dark:border-neutral-700 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100">{survey?.title || "Survey"}</h3>
            <p className="text-neutral-400 dark:text-neutral-500 text-sm">{questions.length} questions</p>
          </div>
          <button onClick={onClose} className="p-1 text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {isCompleted ? (
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 text-neutral-400 dark:text-neutral-500 mx-auto mb-3" />
              <h4 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-1">Thank you!</h4>
              <p className="text-neutral-400 dark:text-neutral-500 text-sm">Your response has been recorded.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                {questions.map((q, index) => (
                  <div key={q.id} className="border-b border-neutral-100 dark:border-neutral-700 pb-5 last:border-b-0">
                    <p className="text-neutral-700 dark:text-neutral-300 text-sm font-medium mb-3">{index + 1}. {q.text}</p>
                    {q.type === 'likert' && (
                      <div className="flex flex-wrap gap-2">
                        {(q.likertOptions || LIKERT_OPTIONS).map(option => (
                          <label key={option.value} className={`flex items-center cursor-pointer px-3 py-1.5 rounded-lg border text-sm transition-colors ${responses[q.id] === option.value ? "bg-neutral-800 dark:bg-neutral-200 border-neutral-800 dark:border-neutral-200 text-white dark:text-neutral-900" : "bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:border-neutral-300 dark:hover:border-neutral-600"}`}>
                            <input type="radio" name={`q-${q.id}`} value={option.value} onChange={() => handleChange(q.id, option.value)} className="sr-only" />
                            <span>{option.label}</span>
                          </label>
                        ))}
                      </div>
                    )}
                    {q.type === 'text' && (
                      <textarea value={responses[q.id] || ''} onChange={e => handleChange(q.id, e.target.value)} placeholder="Type your answer..." rows={3} className="w-full p-3 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm text-neutral-800 dark:text-neutral-200 placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-500 resize-none bg-white dark:bg-neutral-800" />
                    )}
                    {q.type === 'checkbox' && (
                      <div className="space-y-2">
                        {(q.options || []).map(option => {
                          const isSelected = q.multiSelect === false ? responses[q.id] === option : (responses[q.id] || []).includes(option);
                          return (
                            <label key={option} className={`flex items-center gap-3 cursor-pointer px-3 py-2 rounded-lg border text-sm transition-colors ${isSelected ? "bg-neutral-800 dark:bg-neutral-200 border-neutral-800 dark:border-neutral-200 text-white dark:text-neutral-900" : "bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:border-neutral-300 dark:hover:border-neutral-600"}`}>
                              <input type={q.multiSelect === false ? "radio" : "checkbox"} checked={isSelected} onChange={() => handleCheckboxToggle(q.id, option, q.multiSelect)} className="sr-only" />
                              <span>{option}</span>
                            </label>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-6 flex justify-between items-center">
                <button type="button" onClick={onClose} className="px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-600 dark:text-neutral-300 text-sm hover:border-neutral-400 dark:hover:border-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-100 transition-colors">Cancel</button>
                <button type="submit" disabled={!isFormComplete} className={`px-5 py-2 rounded-lg text-sm transition-colors ${isFormComplete ? "bg-neutral-800 dark:bg-neutral-200 text-white dark:text-neutral-900 hover:bg-neutral-900 dark:hover:bg-neutral-300" : "bg-neutral-100 dark:bg-neutral-700 text-neutral-400 dark:text-neutral-500 cursor-not-allowed"}`}>
                  {isFormComplete ? "Submit" : `${questions.filter(q => { const v = responses[q.id]; if (q.type === 'text') return !v || !v.trim(); if (q.type === 'checkbox') return q.multiSelect === false ? !v : !v || !v.length; return v === undefined; }).length} remaining`}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function ResponseHistoryModal({ surveyTitle, checkIns, onDelete, onClose }) {
  const [confirmDeleteIdx, setConfirmDeleteIdx] = useState(null);

  const sorted = [...checkIns].sort(
    (a, b) => new Date(b.submittedAt) - new Date(a.submittedAt)
  );

  const renderValue = (resp) => {
    if (resp.type === 'text') return <span className="text-neutral-800 dark:text-neutral-200">{resp.value}</span>;
    if (resp.type === 'checkbox') return <span className="text-neutral-800 dark:text-neutral-200">{Array.isArray(resp.value) ? resp.value.join(', ') : resp.value}</span>;
    return <span className="text-neutral-800 dark:text-neutral-200">{resp.label} ({resp.value}/{resp.scale || 5})</span>;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div className="px-6 py-5 border-b border-neutral-200 dark:border-neutral-700 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100">{surveyTitle}</h3>
            <p className="text-neutral-400 dark:text-neutral-500 text-sm">{sorted.length} response{sorted.length !== 1 ? 's' : ''}</p>
          </div>
          <button onClick={onClose} className="p-1 text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {sorted.length === 0 ? (
            <p className="text-sm text-neutral-400 dark:text-neutral-500 text-center py-8">No responses yet</p>
          ) : (
            <div className="space-y-4">
              {sorted.map((item, index) => (
                <div key={index} className="border border-neutral-200 dark:border-neutral-700 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs text-neutral-400 dark:text-neutral-500">
                      {new Date(item.submittedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                  <div className="space-y-3">
                    {(item.responses || []).map((resp, i) => (
                      <div key={i}>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-0.5">{resp.question}</p>
                        <p className="text-sm font-medium">{renderValue(resp)}</p>
                      </div>
                    ))}
                  </div>
                  {onDelete && (
                    <div className="mt-3 pt-3 border-t border-neutral-100 dark:border-neutral-700">
                      {confirmDeleteIdx === index ? (
                        <div className="flex items-center gap-2">
                          <p className="text-xs text-neutral-500 dark:text-neutral-400 flex-1">Delete this response?</p>
                          <button onClick={() => { onDelete(item.submittedAt); setConfirmDeleteIdx(null); }} className="px-3 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 bg-white dark:bg-neutral-800 border border-red-300 dark:border-red-800 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors">Delete</button>
                          <button onClick={() => setConfirmDeleteIdx(null)} className="px-3 py-1.5 text-xs font-medium text-neutral-600 dark:text-neutral-300 border border-neutral-300 dark:border-neutral-600 rounded-lg hover:border-neutral-400 dark:hover:border-neutral-500 transition-colors">Cancel</button>
                        </div>
                      ) : (
                        <button onClick={() => setConfirmDeleteIdx(index)} className="text-xs text-neutral-400 dark:text-neutral-500 hover:text-red-500 dark:hover:text-red-400 transition-colors">Delete response</button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SurveysSection({ goalId, surveys, surveyHistory, onRefresh }) {
  const navigate = useNavigate();
  const [fillingSurvey, setFillingSurvey] = useState(null);
  const [viewingResponses, setViewingResponses] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [confirmDeleteFinal, setConfirmDeleteFinal] = useState(null);

  const handleDeleteSurvey = async (surveyId) => {
    try {
      const deleteEntry = {
        type: "template",
        action: "delete",
        surveyId,
        updatedAt: new Date().toISOString()
      };
      await apiClient.updateGoalSurvey(goalId, deleteEntry);
      setConfirmDelete(null);
      setConfirmDeleteFinal(null);
      onRefresh();
    } catch (err) {
      console.error('Failed to delete survey:', err);
    }
  };

  const handleDeleteResponse = async (submittedAt) => {
    try {
      await apiClient.updateGoalSurvey(goalId, {
        type: "delete-submission",
        submittedAt,
        deletedAt: new Date().toISOString()
      });
      onRefresh();
    } catch (err) {
      console.error('Failed to delete response:', err);
    }
  };

  return (
    <div className="mt-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-serif text-2xl text-neutral-900 dark:text-neutral-100">Surveys</h2>
        <button onClick={() => navigate(`/goal/${goalId}/survey/new`)} className="px-4 py-2 bg-neutral-800 dark:bg-neutral-200 text-white dark:text-neutral-900 text-sm rounded-lg hover:bg-neutral-900 dark:hover:bg-neutral-300 transition-colors">
            Add Survey
          </button>
      </div>

      {surveys.length > 0 ? (
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          {surveys.map((survey) => {
            const questions = (survey.questions || []).map((q, i) =>
              typeof q === 'string' ? { id: `q-${i}`, type: 'likert', text: q } : q
            );
            const submissions = surveyHistory.filter(s => s.surveyId === survey.id);
            return (
              <div key={survey.id} className="bg-white dark:bg-neutral-800 rounded-xl p-5 border border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-base font-medium text-neutral-900 dark:text-neutral-100">{survey.title}</h3>
                    <p className="text-neutral-400 dark:text-neutral-500 text-sm">{questions.length} question{questions.length !== 1 ? 's' : ''} &middot; {submissions.length} response{submissions.length !== 1 ? 's' : ''}</p>
                  </div>
                  <button onClick={() => { setConfirmDelete(survey.id); setConfirmDeleteFinal(null); }} className="p-1.5 text-neutral-400 dark:text-neutral-500 hover:text-red-500 dark:hover:text-red-400 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {confirmDelete === survey.id && confirmDeleteFinal !== survey.id && (
                  <div className="mb-3 flex items-center gap-2 p-3 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg">
                    <p className="text-sm text-neutral-600 dark:text-neutral-300 flex-1">Delete this survey?</p>
                    <button onClick={() => setConfirmDeleteFinal(survey.id)} className="px-3 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 bg-white dark:bg-neutral-800 border border-red-300 dark:border-red-800 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors">Yes</button>
                    <button onClick={() => setConfirmDelete(null)} className="px-3 py-1.5 text-xs font-medium text-neutral-600 dark:text-neutral-300 border border-neutral-300 dark:border-neutral-600 rounded-lg hover:border-neutral-400 dark:hover:border-neutral-500 transition-colors">Cancel</button>
                  </div>
                )}
                {confirmDeleteFinal === survey.id && (
                  <div className="mb-3 flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-sm text-red-700 dark:text-red-400 flex-1">This cannot be undone.</p>
                    <button onClick={() => handleDeleteSurvey(survey.id)} className="px-3 py-1.5 text-xs font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">Delete</button>
                    <button onClick={() => { setConfirmDelete(null); setConfirmDeleteFinal(null); }} className="px-3 py-1.5 text-xs font-medium text-neutral-600 dark:text-neutral-300 border border-neutral-300 dark:border-neutral-600 rounded-lg hover:border-neutral-400 dark:hover:border-neutral-500 transition-colors">Cancel</button>
                  </div>
                )}

                <div className="flex gap-2">
                  <button onClick={() => setFillingSurvey(survey)} className="flex-1 py-2 bg-neutral-800 dark:bg-neutral-200 text-white dark:text-neutral-900 text-sm rounded-lg hover:bg-neutral-900 dark:hover:bg-neutral-300 transition-colors">Fill Out</button>
                  {submissions.length > 0 && (
                    <button onClick={() => setViewingResponses(survey)} className="px-3 py-2 text-sm text-neutral-600 dark:text-neutral-300 border border-neutral-300 dark:border-neutral-600 rounded-lg hover:border-neutral-400 dark:hover:border-neutral-500 transition-colors" title="View responses">
                      {submissions.length} response{submissions.length !== 1 ? 's' : ''}
                    </button>
                  )}
                  <button onClick={() => navigate(`/goal/${goalId}/survey/edit`, { state: { survey } })} className="px-3 py-2 text-sm text-neutral-600 dark:text-neutral-300 border border-neutral-300 dark:border-neutral-600 rounded-lg hover:border-neutral-400 dark:hover:border-neutral-500 transition-colors" title="Edit survey">
                    <Pencil className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-6 mb-4">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-neutral-100 dark:bg-neutral-700 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5 text-neutral-500 dark:text-neutral-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-base font-medium text-neutral-900 dark:text-neutral-100 mb-1">No Surveys Yet</h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed mb-4">
                Add a survey to start collecting regular check-in responses for this goal.
              </p>
              <button onClick={() => navigate(`/goal/${goalId}/survey/new`)} className="px-4 py-2 bg-neutral-800 dark:bg-neutral-200 text-white dark:text-neutral-900 text-sm rounded-lg hover:bg-neutral-900 dark:hover:bg-neutral-300 transition-colors">
                Create Your First Survey
              </button>
            </div>
          </div>
        </div>
      )}

      {fillingSurvey && (
        <FillSurveyModal
          goalId={goalId}
          survey={fillingSurvey}
          onClose={() => setFillingSurvey(null)}
          onComplete={() => { setFillingSurvey(null); onRefresh(); }}
        />
      )}

      {viewingResponses && (
        <ResponseHistoryModal
          surveyTitle={viewingResponses.title}
          checkIns={surveyHistory.filter(s => s.surveyId === viewingResponses.id)}
          onDelete={handleDeleteResponse}
          onClose={() => setViewingResponses(null)}
        />
      )}
    </div>
  );
}

function AddStrategyToGoalModal({ isOpen, onClose, strategies, assignedStrategyIds, onAssign, goalId }) {
  const [selectedStrategyIds, setSelectedStrategyIds] = useState(() => new Set());
  const [expandedStrategyId, setExpandedStrategyId] = useState('');
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [recs, setRecs] = useState(null);
  const [isLoadingRecs, setIsLoadingRecs] = useState(false);
  const [showAiPicks, setShowAiPicks] = useState(false);
  const availableStrategies = strategies.filter((s) => !assignedStrategyIds.includes(s.id));
  const categories = [...new Set(availableStrategies.map(s => s.categoryMeta?.label || s.strategyCategory).filter(Boolean))].sort();
  const filteredStrategies = availableStrategies.filter((strategy) => {
    if (selectedCategory && (strategy.categoryMeta?.label || strategy.strategyCategory) !== selectedCategory) return false;
    if (!query.trim()) return true;
    return [strategy.strategyName, strategy.strategyCategory, strategy.bookTitle, strategy.author, strategy.briefOverview].join(' ').toLowerCase().includes(query.trim().toLowerCase());
  });

  const toggleStrategy = (id) => {
    setSelectedStrategyIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  useEffect(() => {
    if (!isOpen) {
      setSelectedStrategyIds(new Set());
      setExpandedStrategyId('');
      setQuery('');
      setSelectedCategory('');
      setSubmitting(false);
      setRecs(null);
      setIsLoadingRecs(false);
      setShowAiPicks(false);
    }
  }, [isOpen]);

  const openAiPicks = async () => {
    setShowAiPicks(true);
    if (recs || isLoadingRecs) return;
    setIsLoadingRecs(true);
    try {
      const result = await apiClient.suggestStrategies({ goalId });
      setRecs(result);
    } catch (err) {
      alert(err.message || 'Failed to fetch recommendations');
    } finally {
      setIsLoadingRecs(false);
    }
  };


  if (!isOpen) return null;

  return (
    <>
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl shadow-lg w-full max-w-5xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="px-6 py-5 border-b border-neutral-200 dark:border-neutral-700 flex items-center justify-between shrink-0">
          <div>
            <h3 className="font-serif text-xl text-neutral-900 dark:text-neutral-100">Add Strategy</h3>
            <p className="text-sm text-neutral-400 dark:text-neutral-500 mt-0.5">Browse and select a strategy to assign to this goal.</p>
          </div>
          <button onClick={onClose} className="p-1.5 text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"><X className="w-5 h-5" /></button>
        </div>

        {/* Selected strategies summary */}
        {selectedStrategyIds.size > 0 && (
          <div className="px-6 pt-4 shrink-0">
            <div className="p-3 rounded-xl bg-pink-50 dark:bg-pink-500/5 border border-pink-200 dark:border-pink-500/20">
              <p className="text-[11px] font-medium text-pink-700 dark:text-pink-400 uppercase tracking-wide mb-2">
                {selectedStrategyIds.size} selected
              </p>
              <div className="flex flex-wrap gap-1.5">
                {[...selectedStrategyIds].map((id) => {
                  const s = strategies.find((x) => String(x.id) === String(id));
                  if (!s) return null;
                  return (
                    <span
                      key={id}
                      className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-pink-300 dark:border-pink-500/40"
                    >
                      <span className="max-w-[240px] truncate">{s.strategyName}</span>
                      <button
                        type="button"
                        onClick={() => toggleStrategy(id)}
                        aria-label={`Remove ${s.strategyName}`}
                        className="text-neutral-400 hover:text-rose-500 dark:text-neutral-500 dark:hover:text-rose-400 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* AI entry point */}
        <div className="px-6 pt-4 shrink-0">
          <div className="flex items-center justify-between gap-3 mb-2">
            <span className="text-sm text-neutral-500 dark:text-neutral-400">
              Browse strategies below, or ask AI to pick the best fits for this goal.
            </span>
            <button
              type="button"
              onClick={openAiPicks}
              className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-xl border border-dashed border-pink-300 dark:border-pink-500/40 text-pink-600 dark:text-pink-400 hover:border-pink-400 dark:hover:border-pink-500/70 hover:bg-pink-50 dark:hover:bg-pink-500/10 shrink-0 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              {recs ? 'See AI picks' : 'Recommend strategies'}
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="px-6 pt-1 pb-3 space-y-3 shrink-0">
          <div className="flex flex-wrap gap-2">
            {[{ label: 'All', value: '' }, ...categories.map(c => ({ label: c, value: c }))].map(cat => (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-all duration-200 ${
                  selectedCategory === cat.value
                    ? 'bg-gradient-to-r from-pink-500 to-orange-500 text-white border-transparent shadow-sm'
                    : 'bg-white dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 border-neutral-200 dark:border-neutral-700 hover:border-pink-300 hover:text-neutral-700 dark:hover:text-neutral-300'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search strategies..."
            className="w-full px-3 py-2.5 border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-pink-200 dark:focus:ring-pink-500/30 focus:border-transparent bg-white dark:bg-neutral-800 placeholder-neutral-400 dark:placeholder-neutral-500"
          />
          <p className="text-xs text-neutral-400 dark:text-neutral-500">
            Showing <span className="font-medium text-neutral-600 dark:text-neutral-300">{filteredStrategies.length}</span> strategies
          </p>
        </div>

        {/* Strategy list */}
        <div className="px-6 pb-4 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredStrategies.length > 0 ? filteredStrategies.map((strategy) => {
              const isSelected = selectedStrategyIds.has(strategy.id);
              const isExpanded = String(expandedStrategyId) === String(strategy.id);
              return (
                <div
                  key={strategy.id}
                  className={`relative rounded-xl border-2 transition-all ${isSelected
                    ? 'border-pink-500 bg-pink-50 dark:bg-pink-500/10 ring-2 ring-pink-300 dark:ring-pink-500/40 shadow-sm'
                    : 'border-neutral-200 dark:border-neutral-700 hover:border-pink-300 dark:hover:border-pink-500/50 hover:bg-neutral-50 dark:hover:bg-neutral-700/40'}`}
                >
                  {isSelected && (
                    <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-pink-500 text-white flex items-center justify-center shadow-sm z-10">
                      <Check className="w-3 h-3" strokeWidth={3} />
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => toggleStrategy(strategy.id)}
                    className="w-full text-left p-4"
                  >
                    <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 line-clamp-2 pr-6">{strategy.strategyName}</p>
                    {strategy.author && <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">{strategy.author}</p>}
                    {strategy.briefOverview && (
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1.5 line-clamp-2 font-light">{strategy.briefOverview}</p>
                    )}
                  </button>
                  <div className="px-4 pb-3 flex items-center justify-between">
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-gradient-to-r from-pink-500/10 to-orange-500/10 text-pink-600 dark:from-pink-500/20 dark:to-orange-500/20 dark:text-pink-400">
                      {strategy.categoryMeta?.label || strategy.strategyCategory}
                    </span>
                    <button
                      type="button"
                      onClick={() => setExpandedStrategyId(prev => String(prev) === String(strategy.id) ? '' : String(strategy.id))}
                      className="text-xs text-neutral-400 dark:text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors flex items-center gap-1"
                    >
                      {isExpanded ? 'Less' : 'More'}
                      {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>
                  </div>
                  {isExpanded && (
                    <div className="px-4 pb-4 border-t border-neutral-100 dark:border-neutral-700 pt-3 animate-[fadeIn_0.2s_ease-out]">
                      <StrategyDetailSection title="Overview" defaultOpen>{strategy.briefOverview}</StrategyDetailSection>
                      <StrategyDetailSection title="Evidence Base">{strategy.evidenceBaseSummary}</StrategyDetailSection>
                      <StrategyDetailSection title="Implementation Steps">{strategy.implementationStepsSummary}</StrategyDetailSection>
                      <StrategyDetailSection title="Resources Needed">{strategy.resourcesNeeded}</StrategyDetailSection>
                      <StrategyDetailSection title="Case Study">{strategy.caseStudySummary}</StrategyDetailSection>
                      <StrategyDetailSection title="Success Criteria">{strategy.successCriteriaSummary}</StrategyDetailSection>
                    </div>
                  )}
                </div>
              );
            }) : (
              <div className="col-span-2 text-sm text-neutral-400 dark:text-neutral-500 text-center py-12">No unassigned strategies found.</div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-neutral-200 dark:border-neutral-700 flex items-center justify-between gap-3 shrink-0">
          <span className="text-xs text-neutral-500 dark:text-neutral-400">
            {selectedStrategyIds.size === 0 ? 'No strategies selected' : `${selectedStrategyIds.size} selected`}
          </span>
          <div className="flex items-center gap-3">
            <button onClick={onClose} disabled={submitting} className="px-4 py-2.5 rounded-xl text-sm text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors">Cancel</button>
            <button
              onClick={async () => {
                if (selectedStrategyIds.size === 0) return;
                setSubmitting(true);
                try {
                  for (const id of selectedStrategyIds) {
                    await onAssign(Number(id));
                  }
                  onClose();
                } finally { setSubmitting(false); }
              }}
              disabled={selectedStrategyIds.size === 0 || submitting}
              className="px-5 py-2.5 text-sm font-medium rounded-xl bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200 shadow-sm transition-all disabled:opacity-40"
            >
              {submitting ? 'Adding...' : (selectedStrategyIds.size > 1 ? `Add ${selectedStrategyIds.size} Strategies` : 'Add Strategy')}
            </button>
          </div>
        </div>
      </div>
    </div>

    {showAiPicks && (
      <AiStrategyPicksModal
        isLoading={isLoadingRecs}
        recs={recs}
        selectedStrategyIds={selectedStrategyIds}
        onToggle={toggleStrategy}
        onClose={() => setShowAiPicks(false)}
      />
    )}
    </>
  );
}

function AiStrategyPicksModal({ isLoading, recs, selectedStrategyIds, onToggle, onClose }) {
  const picks = recs?.recommendations || [];
  const [currentIndex, setCurrentIndex] = useState(0);
  const total = picks.length;
  useEffect(() => {
    if (currentIndex >= total) setCurrentIndex(0);
  }, [total, currentIndex]);
  const pick = picks[currentIndex];
  const next = () => setCurrentIndex((i) => (i + 1) % total);
  const prev = () => setCurrentIndex((i) => (i - 1 + total) % total);
  const isSelected = pick ? selectedStrategyIds.has(pick.strategyId) : false;

  return (
    <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="px-8 pt-6 pb-4 flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 shrink-0">
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-pink-500" />
            <h2 className="font-serif text-2xl text-neutral-900 dark:text-neutral-100">AI Strategy Picks</h2>
          </div>
          <div className="flex items-center gap-4">
            {total > 1 && !isLoading && (
              <div className="flex items-center gap-2">
                {picks.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentIndex(i)}
                    aria-label={`Pick ${i + 1}`}
                    className={`h-2 rounded-full transition-all ${currentIndex === i ? 'bg-pink-500 w-6' : 'w-2 bg-neutral-300 dark:bg-neutral-600 hover:bg-neutral-400'}`}
                  />
                ))}
              </div>
            )}
            <button onClick={onClose} className="p-1.5 text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {!isLoading && (
            <details className="mx-8 mt-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 group">
              <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-100 flex items-center gap-2 select-none list-none">
                <Info className="w-4 h-4 text-pink-500" />
                How these picks are chosen
                <ChevronDown className="w-4 h-4 ml-auto text-neutral-400 dark:text-neutral-500 group-open:rotate-180 transition-transform" />
              </summary>
              <div className="px-4 pb-4 text-xs text-neutral-600 dark:text-neutral-400 space-y-2.5">
                <p>For each pick, AI works through this pipeline before ranking strategies:</p>
                <ol className="space-y-1.5 pl-4 list-decimal">
                  <li>Reads the focal goal: title, description, skill area, and all survey trends tied to it.</li>
                  <li>Pulls context from this student's IEP reports (case history, skills assessment, psychoed findings).</li>
                  <li>Looks at every other goal for this student and which strategies are already working or struggling.</li>
                  <li>Filters the strategy library, excluding strategies previously marked as "didn't work" for this student so they never come back.</li>
                  <li>Scores the remaining candidates against the goal, the student's profile, and evidence from the IEP, then ranks the top 3 to 5.</li>
                  <li>For each ranked pick, writes a specific match rationale, expected impact, and concrete starting steps tied to this student's actual data.</li>
                </ol>
                <p className="pt-1">The picks carousel shows one recommendation at a time so you can weigh it properly. Click Add to selection on any you want, then close this window and use the Add Strategy button below to assign them to the goal.</p>
              </div>
            </details>
          )}
          {isLoading ? (
            <AiLoadingAnimation messages={AI_STRATEGY_MESSAGES} />
          ) : total === 0 ? (
            <p className="text-center text-neutral-400 dark:text-neutral-500 py-16 text-sm">No recommendations returned. Try refreshing or add more data to this goal.</p>
          ) : (
            <div className="ai-fade-in p-8" key={currentIndex}>
              <div className="flex items-center gap-3 mb-3">
                <span className="shrink-0 w-9 h-9 rounded-full bg-gradient-to-r from-pink-500 to-orange-500 text-white text-sm font-semibold flex items-center justify-center">{pick.rank || currentIndex + 1}</span>
                <div>
                  <p className="text-xs text-neutral-400 dark:text-neutral-500">Pick {currentIndex + 1} of {total}</p>
                  <h3 className="font-serif text-2xl text-neutral-900 dark:text-neutral-100 leading-tight">{pick.strategyName}</h3>
                </div>
              </div>

              {pick.strategyCategory && (
                <span className="inline-block text-[10px] font-medium px-2 py-0.5 rounded-full bg-pink-50 dark:bg-pink-500/10 text-pink-600 dark:text-pink-400 border border-pink-200 dark:border-pink-500/30 mb-5">
                  {pick.strategyCategory}
                </span>
              )}

              {pick.briefOverview && (
                <div className="mb-5">
                  <p className="text-[11px] font-medium text-neutral-400 dark:text-neutral-500 uppercase tracking-wide mb-1">Overview</p>
                  <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">{pick.briefOverview}</p>
                </div>
              )}

              {pick.whyBestFit && (
                <div className="mb-5 p-4 rounded-xl bg-pink-50 dark:bg-pink-500/5 border border-pink-200 dark:border-pink-500/20">
                  <p className="text-[11px] font-medium text-pink-700 dark:text-pink-400 uppercase tracking-wide mb-1.5 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Why this is the best fit
                  </p>
                  <p className="text-sm text-neutral-800 dark:text-neutral-200 leading-relaxed">{pick.whyBestFit}</p>
                </div>
              )}

              {pick.evidenceFromStudent && (
                <div className="mb-5">
                  <p className="text-[11px] font-medium text-neutral-400 dark:text-neutral-500 uppercase tracking-wide mb-1">Evidence from this student</p>
                  <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">{pick.evidenceFromStudent}</p>
                </div>
              )}

              {pick.expectedImpact && (
                <div className="mb-5">
                  <p className="text-[11px] font-medium text-neutral-400 dark:text-neutral-500 uppercase tracking-wide mb-1">Expected impact</p>
                  <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">{pick.expectedImpact}</p>
                </div>
              )}

              {pick.implementationNotes && (
                <div className="mb-2">
                  <p className="text-[11px] font-medium text-neutral-400 dark:text-neutral-500 uppercase tracking-wide mb-1">How to start</p>
                  <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">{pick.implementationNotes}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {!isLoading && pick && (
          <div className="px-8 py-5 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-2">
              {total > 1 && (
                <>
                  <button onClick={prev} className="px-3 py-2 text-sm text-neutral-600 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">&larr;</button>
                  <button onClick={next} className="px-3 py-2 text-sm text-neutral-600 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">&rarr;</button>
                </>
              )}
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-neutral-500 dark:text-neutral-400">
                {selectedStrategyIds.size === 0 ? 'None selected yet' : `${selectedStrategyIds.size} selected`}
              </span>
              <button
                onClick={() => onToggle(pick.strategyId)}
                className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all shadow-sm ${
                  isSelected
                    ? 'bg-white dark:bg-neutral-800 border border-pink-500 text-pink-600 dark:text-pink-400'
                    : 'bg-gradient-to-r from-pink-500 to-orange-500 text-white hover:from-pink-600 hover:to-orange-600'
                }`}
              >
                {isSelected ? 'Selected ✓' : 'Add to selection'}
              </button>
              <button
                onClick={onClose}
                disabled={selectedStrategyIds.size === 0}
                className="px-5 py-2.5 rounded-xl text-sm font-medium bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200 shadow-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StrategyDetailSection({ title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  if (!children) return null;
  const content = typeof children === 'string' ? children.trim() : children;
  if (!content) return null;

  return (
    <div className="border-b border-neutral-100 dark:border-neutral-700 last:border-b-0">
      <button onClick={() => setOpen(v => !v)} className="flex items-center justify-between w-full py-2.5 text-left text-sm font-medium text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors">
        {title}
        {open ? <ChevronUp className="w-3.5 h-3.5 text-neutral-400 dark:text-neutral-500" /> : <ChevronDown className="w-3.5 h-3.5 text-neutral-400 dark:text-neutral-500" />}
      </button>
      {open && <div className="pb-3 text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed whitespace-pre-line font-light">{content}</div>}
    </div>
  );
}

function StrategyModal({ strategy, canManage, removing, confirmRemove, setConfirmRemove, onRemove, onClose }) {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-neutral-100 dark:border-neutral-700 shrink-0">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h2 className="font-serif text-xl text-neutral-900 dark:text-neutral-100 leading-snug">{strategy.strategyName}</h2>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs text-neutral-400 dark:text-neutral-500">{strategy.strategyCategory}</span>
                {strategy.primaryDiagnosis && (
                  <>
                    <span className="text-neutral-300 dark:text-neutral-600">·</span>
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gradient-to-r from-pink-500/10 to-orange-500/10 text-pink-600 dark:from-pink-500/20 dark:to-orange-500/20 dark:text-pink-400">
                      {strategy.primaryDiagnosis}
                    </span>
                  </>
                )}
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {strategy.bookTitle && (
            <div className="flex items-center gap-2 mb-4 pb-4 border-b border-neutral-100 dark:border-neutral-700">
              <BookOpen className="w-4 h-4 text-neutral-400 dark:text-neutral-500 shrink-0" />
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                <span className="font-medium text-neutral-600 dark:text-neutral-300">{strategy.bookTitle}</span>
                {strategy.author ? ` — ${strategy.author}` : ''}
              </p>
            </div>
          )}

          <StrategyDetailSection title="Overview" defaultOpen>{strategy.briefOverview}</StrategyDetailSection>
          <StrategyDetailSection title="Evidence Base">{strategy.evidenceBaseSummary}</StrategyDetailSection>
          <StrategyDetailSection title="Implementation Steps">{strategy.implementationStepsSummary}</StrategyDetailSection>
          <StrategyDetailSection title="Resources Needed">{strategy.resourcesNeeded}</StrategyDetailSection>
          <StrategyDetailSection title="Challenges & Solutions">{strategy.challengesSolutionsSummary}</StrategyDetailSection>
          <StrategyDetailSection title="Case Study">{strategy.caseStudySummary}</StrategyDetailSection>
          <StrategyDetailSection title="Success Criteria">{strategy.successCriteriaSummary}</StrategyDetailSection>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-neutral-100 dark:border-neutral-700 shrink-0 flex items-center justify-between">
          {canManage ? (
            confirmRemove ? (
              <div className="flex items-center gap-3">
                <p className="text-sm text-neutral-500 dark:text-neutral-400">Remove this strategy?</p>
                <button onClick={() => setConfirmRemove(false)} className="px-3 py-1.5 text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors">
                  No
                </button>
                <button
                  onClick={onRemove}
                  disabled={removing}
                  className="px-4 py-1.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50"
                >
                  {removing ? 'Removing...' : 'Yes, remove'}
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmRemove(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Remove from goal
              </button>
            )
          ) : <div />}
          <button onClick={onClose} className="px-4 py-2 bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 rounded-lg text-sm font-medium hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

const EFFECTIVENESS_OPTIONS = [
  { value: 'WORKED', icon: ThumbsUp, label: 'Worked', colour: 'text-emerald-400' },
  { value: 'DIDNT_WORK', icon: ThumbsDown, label: "Didn't work", colour: 'text-rose-400' },
];

function ExpandableStrategyCard({ strategy, goalId, canManage, onRefresh }) {
  const [open, setOpen] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [effectiveness, setEffectiveness] = useState(strategy.effectiveness ?? null);
  const [pending, setPending] = useState(false);

  const markEffectiveness = async (e, value) => {
    e.stopPropagation();
    setPending(true);
    try {
      // Clicking the currently active rating clears it back to null.
      const next = effectiveness === value ? null : value;
      const updated = await apiClient.updateStrategyEffectiveness(goalId, strategy.id, { effectiveness: next });
      setEffectiveness(updated.effectiveness);
    } catch (err) {
      alert(err.message || 'Failed to update strategy status');
    } finally {
      setPending(false);
    }
  };

  return (
    <>
      {/* Card — compact, clickable */}
      <div
        onClick={() => setOpen(true)}
        className="card-hover bg-white dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700/50 rounded-2xl p-4 cursor-pointer transition-all hover:border-neutral-300 dark:hover:border-neutral-600"
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">{strategy.strategyName}</h3>
            <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">
              {strategy.strategyCategory}{strategy.author ? ` · ${strategy.author}` : ''}
            </p>
            {strategy.briefOverview && (
              <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1.5 line-clamp-2 font-light">{strategy.briefOverview}</p>
            )}
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {EFFECTIVENESS_OPTIONS.map(({ value, icon: Icon, label, colour }) => {
              const active = effectiveness === value;
              return (
                <button
                  key={value}
                  type="button"
                  aria-label={label}
                  title={label}
                  onClick={(e) => markEffectiveness(e, value)}
                  disabled={pending}
                  className={`p-1.5 rounded-md transition-colors ${active ? `${colour} bg-white/10` : 'text-zinc-500 hover:text-zinc-200 hover:bg-white/5'} disabled:opacity-50`}
                >
                  <Icon size={16} />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Modal overlay */}
      {open && (
        <StrategyModal
          strategy={strategy}
          goalId={goalId}
          canManage={canManage}
          removing={removing}
          confirmRemove={confirmRemove}
          setConfirmRemove={setConfirmRemove}
          onRemove={async () => {
            setRemoving(true);
            try {
              await apiClient.removeStrategyFromGoal(goalId, strategy.id);
              setOpen(false);
              onRefresh();
            } catch (error) {
              console.error('Failed to remove strategy:', error);
            } finally {
              setRemoving(false);
              setConfirmRemove(false);
            }
          }}
          onClose={() => { setOpen(false); setConfirmRemove(false); }}
        />
      )}
    </>
  );
}

function GoalStrategiesSection({ goalId, strategies, allStrategies, canManage, onRefresh }) {
  const [showAddModal, setShowAddModal] = useState(false);

  return (
    <div className="mt-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-serif text-2xl text-neutral-900 dark:text-neutral-100">Strategies</h2>
        {canManage && (
          <button onClick={() => setShowAddModal(true)} className="px-4 py-2 bg-neutral-800 dark:bg-neutral-200 text-white dark:text-neutral-900 text-sm rounded-lg hover:bg-neutral-900 dark:hover:bg-neutral-300 transition-colors">
            Add Strategy
          </button>
        )}
      </div>

      {strategies.length > 0 ? (
        <div className="space-y-3">
          {strategies.map((strategy) => (
            <ExpandableStrategyCard
              key={strategy.id}
              strategy={strategy}
              goalId={goalId}
              canManage={canManage}
              onRefresh={onRefresh}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-6">
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            No strategies assigned to this goal yet.
          </p>
        </div>
      )}

      <AddStrategyToGoalModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        strategies={allStrategies}
        assignedStrategyIds={strategies.map((strategy) => strategy.id)}
        goalId={goalId}
        onAssign={async (strategyId) => {
          await apiClient.assignStrategyToGoal(goalId, strategyId);
          onRefresh();
        }}
      />
    </div>
  );
}

export default function GoalDetail() {
  const { goalId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [goalData, setGoalData] = useState({});
  const [studentName, setStudentName] = useState("");
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [editError, setEditError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDeleteFinal, setShowDeleteFinal] = useState(false);
  const [standardsMetadata, setStandardsMetadata] = useState([]);
  const [allStrategies, setAllStrategies] = useState([]);
  const [hasInsights, setHasInsights] = useState(null); // null = unknown, false = none yet, true = exists

  useEffect(() => {
    let cancelled = false;
    async function check() {
      try {
        const cached = await apiClient.getCachedGoalInsights(goalId);
        if (!cancelled) setHasInsights(!!(cached && cached.narrative));
      } catch {
        if (!cancelled) setHasInsights(false);
      }
    }
    check();
    return () => { cancelled = true; };
  }, [goalId]);

  useEffect(() => {
    fetchGoalDetail(goalId);
  }, [goalId]);

  useEffect(() => {
    const loadStandardsMetadata = async () => {
      try {
        const data = await apiClient.getStandardsMetadata();
        setStandardsMetadata(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching standards metadata:', error);
        setStandardsMetadata([]);
      }
    };
    loadStandardsMetadata();
  }, []);

  useEffect(() => {
    const loadStrategies = async () => {
      try {
        const data = await apiClient.getStrategies();
        setAllStrategies(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching strategies:', error);
        setAllStrategies([]);
      }
    };
    loadStrategies();
  }, []);

  const fetchGoalDetail = async (id) => {
    try {
      const data = await apiClient.getGoal(id);
      setGoalData(data);
      if (data.studentId) {
        const student = await apiClient.getStudent(data.studentId);
        setStudentName(student.name || "");
      }
    } catch (error) {
      console.error('Error fetching goal:', error);
    } finally {
      setLoading(false);
    }
  };

  const parsedSurveyEntries = React.useMemo(() => {
    if (!goalData?.survey) return [];
    try {
      const parsed = JSON.parse(goalData.survey);
      return parsed.checkIns || [];
    } catch {
      return [];
    }
  }, [goalData]);

  const surveys = React.useMemo(() => {
    const templatesById = {};

    parsedSurveyEntries.forEach((entry) => {
      if (entry?.type === "template" && entry?.surveyId) {
        if (entry.action === "delete") {
          delete templatesById[entry.surveyId];
        } else {
          templatesById[entry.surveyId] = {
            id: entry.surveyId,
            title: entry.title || "Untitled Survey",
            questions: Array.isArray(entry.questions) && entry.questions.length
              ? entry.questions
              : []
          };
        }
      }
    });

    return Object.values(templatesById);
  }, [parsedSurveyEntries]);

  const surveyHistory = React.useMemo(() => {
    const deletedTimestamps = new Set(
      parsedSurveyEntries
        .filter(e => e?.type === "delete-submission")
        .map(e => e.submittedAt)
    );

    return parsedSurveyEntries
      .filter((entry) => !entry?.type || entry.type === "submission")
      .map((entry) => {
        if (entry?.type === "submission") return entry;
        return {
          type: "submission",
          surveyId: "legacy",
          surveyTitle: "Check-in",
          submittedAt: entry.submittedAt,
          responses: entry.responses || []
        };
      })
      .filter(entry => !deletedTimestamps.has(entry.submittedAt));
  }, [parsedSurveyEntries]);

  const visualisations = React.useMemo(() => {
    if (!goalData?.visualiserData) return [];
    try {
      const raw = typeof goalData.visualiserData === 'string'
        ? JSON.parse(goalData.visualiserData)
        : goalData.visualiserData;
      // Backwards compat: old single-viz shape
      if (raw.visualisations) return raw.visualisations;
      if (raw.xLabel) return [{ ...raw, id: 'migrated-1', type: 'line' }];
      return [];
    } catch {
      return [];
    }
  }, [goalData]);

  const selectedStandardDescription = React.useMemo(() => {
    if (!goalData?.skill?.trim() || !standardsMetadata.length) return '';
    const matchedStandard = standardsMetadata.find((standard) =>
      standard?.name?.trim().toLowerCase() === goalData.skill.trim().toLowerCase()
    );
    return matchedStandard?.description?.trim() || '';
  }, [goalData?.skill, standardsMetadata]);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 sm:mb-10">
        <div>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-6xl text-neutral-900 dark:text-neutral-100">{goalData.title}</h1>
          <p className="mt-2 text-neutral-400 dark:text-neutral-500 text-base font-light">
            {studentName && <>{studentName} &middot; </>}
            {goalData.skill}
            {goalData.createdAt && (
              <span>
                {" "}&middot; Started {new Date(goalData.createdAt).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {!isEditing && (
            <button
              type="button"
              onClick={() => navigate(`/student/${goalData.studentId}/goal/${goalId}/insights`)}
              className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-xl bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200 shadow-sm transition-all"
            >
              {hasInsights === false ? <Sparkles className="w-4 h-4" /> : <BarChart3 className="w-4 h-4" />}
              {hasInsights === false ? 'Create progress insights' : 'Progress insights'}
            </button>
          )}
          {!isEditing && goalData.status === 'ACTIVE' && (
            <button
              onClick={async () => {
                try {
                  await apiClient.updateGoal(goalId, { status: 'COMPLETED' });
                  fetchGoalDetail(goalId);
                } catch (err) {
                  console.error('Failed to complete goal:', err);
                }
              }}
              className="flex items-center space-x-2 px-3 py-2 bg-neutral-800 dark:bg-neutral-200 text-white dark:text-neutral-900 rounded-lg hover:bg-neutral-900 dark:hover:bg-neutral-300 transition-colors text-sm"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Complete Goal</span>
            </button>
          )}
          {!isEditing && goalData.status === 'COMPLETED' && (
            <button
              onClick={async () => {
                try {
                  await apiClient.updateGoal(goalId, { status: 'ACTIVE' });
                  fetchGoalDetail(goalId);
                } catch (err) {
                  console.error('Failed to reactivate goal:', err);
                }
              }}
              className="flex items-center space-x-2 px-3 py-2 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-600 dark:text-neutral-300 hover:text-neutral-800 dark:hover:text-neutral-100 hover:border-neutral-400 dark:hover:border-neutral-500 hover:shadow-sm transition-all text-sm"
            >
              <span>Reactivate</span>
            </button>
          )}
          {!isEditing && (
            <button
              onClick={() => {
                setEditForm({
                  title: goalData.title || '',
                  description: goalData.description || '',
                  skill: goalData.skill || '',
                  targetDate: goalData.targetDate ? new Date(goalData.targetDate).toLocaleDateString('en-GB') : '',
                });
                setEditError('');
                setIsEditing(true);
              }}
              className="flex items-center space-x-2 px-3 py-2 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-600 dark:text-neutral-300 hover:text-neutral-800 dark:hover:text-neutral-100 hover:border-neutral-400 dark:hover:border-neutral-500 hover:shadow-sm transition-all text-sm"
            >
              <Pencil className="w-4 h-4" />
              <span>Edit Goal</span>
            </button>
          )}
          {!isEditing && (
            <button
              onClick={() => { setShowDeleteConfirm(true); setShowDeleteFinal(false); }}
              className="p-2 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-400 dark:text-neutral-500 hover:text-red-500 dark:hover:text-red-400 hover:border-red-300 dark:hover:border-red-800 transition-all"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => navigate(user?.role === 'STUDENT' ? '/my-profile' : `/student/${goalData.studentId}`)}
            className="flex items-center space-x-2 px-3 py-2 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-600 dark:text-neutral-300 hover:text-neutral-800 dark:hover:text-neutral-100 hover:border-neutral-400 dark:hover:border-neutral-500 hover:shadow-sm transition-all text-sm"
          >
            <span className="text-base leading-none">&lsaquo;</span>
            <span>{user?.role === 'STUDENT' ? 'Back to My Profile' : 'Back to Student'}</span>
          </button>
        </div>
      </div>

      {/* Delete Confirmation — Step 1 */}
      {showDeleteConfirm && !showDeleteFinal && (
        <div className="flex items-center gap-3 p-4 mb-8 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl">
          <p className="text-sm text-neutral-600 dark:text-neutral-300 flex-1">Are you sure you want to delete this goal?</p>
          <button
            onClick={() => setShowDeleteFinal(true)}
            className="px-4 py-1.5 text-sm font-medium text-red-600 dark:text-red-400 bg-white dark:bg-neutral-800 border border-red-300 dark:border-red-800 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
          >
            Yes, delete
          </button>
          <button
            onClick={() => setShowDeleteConfirm(false)}
            className="px-4 py-1.5 text-sm text-neutral-600 dark:text-neutral-300 border border-neutral-300 dark:border-neutral-600 rounded-lg hover:border-neutral-400 dark:hover:border-neutral-500 transition-colors"
          >
            Cancel
          </button>
        </div>
      )}
      {/* Delete Confirmation — Step 2 */}
      {showDeleteFinal && (
        <div className="flex items-center gap-3 p-4 mb-8 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl">
          <p className="text-sm text-red-700 dark:text-red-400 flex-1">This cannot be undone. Are you absolutely sure?</p>
          <button
            onClick={async () => {
              try {
                await apiClient.deleteGoal(goalId);
                navigate(user?.role === 'STUDENT' ? '/my-profile' : `/student/${goalData.studentId}`);
              } catch (err) {
                console.error('Failed to delete goal:', err);
              }
            }}
            className="px-4 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
          >
            Delete permanently
          </button>
          <button
            onClick={() => { setShowDeleteConfirm(false); setShowDeleteFinal(false); }}
            className="px-4 py-1.5 text-sm text-neutral-600 dark:text-neutral-300 border border-neutral-300 dark:border-neutral-600 rounded-lg hover:border-neutral-400 dark:hover:border-neutral-500 transition-colors"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Inline Edit Form */}
      {isEditing ? (
        <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-6 mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1">Title</label>
              <input
                type="text"
                value={editForm.title}
                onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-500 bg-white dark:bg-neutral-800"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1">Standard (Optional)</label>
              <select
                value={editForm.skill}
                onChange={(e) => setEditForm(prev => ({ ...prev, skill: e.target.value }))}
                className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-500 bg-white dark:bg-neutral-800"
              >
                <option value="">None</option>
                {standardsMetadata.map((standard) => (
                  <option key={standard.id || standard.name} value={standard.name}>
                    {standard.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1">Target Date (DD/MM/YYYY)</label>
              <input
                type="text"
                value={editForm.targetDate}
                onChange={(e) => setEditForm(prev => ({ ...prev, targetDate: e.target.value }))}
                placeholder="DD/MM/YYYY"
                className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-500 bg-white dark:bg-neutral-800"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1">Description</label>
              <textarea
                value={editForm.description}
                onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                rows="3"
                className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-500 resize-none bg-white dark:bg-neutral-800"
              />
            </div>
          </div>
          {editError && (
            <p className="text-red-600 dark:text-red-400 text-sm mb-3">{editError}</p>
          )}
          <div className="flex items-center gap-2">
            <button
              onClick={async () => {
                if (!editForm.title?.trim() || !editForm.description?.trim() || !editForm.targetDate?.trim()) {
                  setEditError('Please fill in all fields.');
                  return;
                }
                try {
                  setEditError('');
                  await apiClient.updateGoal(goalId, editForm);
                  setIsEditing(false);
                  fetchGoalDetail(goalId);
                } catch (err) {
                  setEditError('Failed to save: ' + (err.message || 'Unknown error'));
                }
              }}
              className="px-4 py-2 bg-neutral-800 dark:bg-neutral-200 text-white dark:text-neutral-900 text-sm rounded-lg hover:bg-neutral-900 dark:hover:bg-neutral-300 transition-colors"
            >
              Save Changes
            </button>
            <button
              onClick={() => { setIsEditing(false); setEditError(''); }}
              className="px-4 py-2 text-sm text-neutral-600 dark:text-neutral-300 border border-neutral-300 dark:border-neutral-600 rounded-lg hover:border-neutral-400 dark:hover:border-neutral-500 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        (selectedStandardDescription || goalData.description) && (
          <div className="mb-8 space-y-4">
            {selectedStandardDescription && (
              <div>
                <h3 className="text-xs font-medium text-neutral-400 dark:text-neutral-500 uppercase tracking-wide mb-1.5">Standard</h3>
                <p className="text-neutral-600 dark:text-neutral-300 text-base leading-relaxed">
                  {selectedStandardDescription}
                </p>
              </div>
            )}
            {goalData.description && (
              <div>
                <h3 className="text-xs font-medium text-neutral-400 dark:text-neutral-500 uppercase tracking-wide mb-1.5">Goal Description</h3>
                <p className="text-neutral-600 dark:text-neutral-300 text-base leading-relaxed">
                  {goalData.description}
                </p>
              </div>
            )}
          </div>
        )
      )}

      <GoalStrategiesSection
        goalId={goalId}
        strategies={goalData.assignedStrategies || []}
        allStrategies={allStrategies}
        canManage={user?.role !== 'STUDENT'}
        onRefresh={() => fetchGoalDetail(goalId)}
      />

      <SurveysSection
        goalId={goalId}
        surveys={surveys}
        surveyHistory={surveyHistory}
        onRefresh={() => fetchGoalDetail(goalId)}
      />

      <VisualisationsSection
        goalId={goalId}
        visualisations={visualisations}
        onRefresh={() => fetchGoalDetail(goalId)}
      />
    </>
  );
}

function VizIcon({ type }) {
  const cls = "w-5 h-5 text-neutral-500 dark:text-neutral-400";
  if (type === 'line') return (
    <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="4,18 8,14 12,16 16,8 20,6" />
      <circle cx="8" cy="14" r="1" fill="currentColor" stroke="none" />
      <circle cx="12" cy="16" r="1" fill="currentColor" stroke="none" />
      <circle cx="16" cy="8" r="1" fill="currentColor" stroke="none" />
      <circle cx="20" cy="6" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
  if (type === 'bar') return (
    <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="14" width="4" height="6" rx="0.5" fill="currentColor" opacity="0.3" />
      <rect x="10" y="8" width="4" height="12" rx="0.5" fill="currentColor" opacity="0.5" />
      <rect x="17" y="4" width="4" height="16" rx="0.5" fill="currentColor" opacity="0.7" />
    </svg>
  );
  if (type === 'stacked') return (
    <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="14" width="4" height="6" rx="0.5" fill="currentColor" opacity="0.25" />
      <rect x="3" y="10" width="4" height="4" rx="0.5" fill="currentColor" opacity="0.6" />
      <rect x="10" y="12" width="4" height="8" rx="0.5" fill="currentColor" opacity="0.25" />
      <rect x="10" y="6" width="4" height="6" rx="0.5" fill="currentColor" opacity="0.6" />
      <rect x="17" y="10" width="4" height="10" rx="0.5" fill="currentColor" opacity="0.25" />
      <rect x="17" y="4" width="4" height="6" rx="0.5" fill="currentColor" opacity="0.6" />
    </svg>
  );
  if (type === 'boxplot') return (
    <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="7" y1="4" x2="7" y2="7" />
      <rect x="4" y="7" width="6" height="8" rx="0.5" fill="currentColor" opacity="0.15" />
      <line x1="4" y1="11" x2="10" y2="11" strokeWidth="2" />
      <line x1="7" y1="15" x2="7" y2="20" />
      <line x1="17" y1="3" x2="17" y2="6" />
      <rect x="14" y="6" width="6" height="10" rx="0.5" fill="currentColor" opacity="0.15" />
      <line x1="14" y1="10" x2="20" y2="10" strokeWidth="2" />
      <line x1="17" y1="16" x2="17" y2="20" />
    </svg>
  );
  return null;
}

const VIZ_TYPES = [
  { id: 'line', label: 'Line Chart', desc: 'Track trends over time with data points and a goal line.' },
  { id: 'bar', label: 'Bar Chart', desc: 'Compare values across different categories.' },
  { id: 'stacked', label: 'Stacked Bar', desc: 'See how sub-groups contribute to totals.' },
  { id: 'boxplot', label: 'Boxplot', desc: 'View the spread and distribution of data.' },
];

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function VisualisationsSection({ goalId, visualisations, onRefresh }) {
  const [showPicker, setShowPicker] = useState(false);
  const [setupType, setSetupType] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [confirmDeleteFinal, setConfirmDeleteFinal] = useState(null);

  const handleCreate = async (viz) => {
    try {
      await apiClient.createVisualisation(goalId, viz);
      setSetupType(null);
      setShowPicker(false);
      onRefresh();
    } catch (err) {
      console.error('Failed to create visualisation:', err);
    }
  };

  const handleUpdate = async (vizId, updatedViz) => {
    try {
      await apiClient.updateVisualisation(goalId, vizId, updatedViz);
    } catch (err) {
      console.error('Failed to update visualisation:', err);
    }
  };

  const handleDelete = async (vizId) => {
    try {
      await apiClient.deleteVisualisation(goalId, vizId);
      setConfirmDelete(null);
      onRefresh();
    } catch (err) {
      console.error('Failed to delete visualisation:', err);
    }
  };

  return (
    <div className="mt-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-serif text-2xl text-neutral-900 dark:text-neutral-100">Data Visualisations</h2>
        {!showPicker && !setupType && (
          <button
            onClick={() => setShowPicker(true)}
            className="px-4 py-2 bg-neutral-800 dark:bg-neutral-200 text-white dark:text-neutral-900 text-sm rounded-lg hover:bg-neutral-900 dark:hover:bg-neutral-300 transition-colors"
          >
            Add Visualisation
          </button>
        )}
      </div>

      {/* Type picker */}
      {showPicker && !setupType && (
        <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-6 mb-4">
          <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-4">What type of chart do you want to create?</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {VIZ_TYPES.map(type => (
              <button
                key={type.id}
                onClick={() => setSetupType(type.id)}
                className="flex items-start gap-4 text-left p-4 border border-neutral-200 dark:border-neutral-700 rounded-xl hover:border-neutral-400 dark:hover:border-neutral-500 hover:shadow-sm transition-all group"
              >
                <div className="w-10 h-10 rounded-lg bg-neutral-100 dark:bg-neutral-700 group-hover:bg-neutral-200 dark:group-hover:bg-neutral-600 transition-colors flex items-center justify-center shrink-0">
                  <VizIcon type={type.id} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-0.5">{type.label}</p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">{type.desc}</p>
                </div>
              </button>
            ))}
          </div>
          <button onClick={() => setShowPicker(false)} className="mt-4 px-4 py-2 text-sm text-neutral-600 dark:text-neutral-300 border border-neutral-300 dark:border-neutral-600 rounded-lg hover:border-neutral-400 dark:hover:border-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-100 transition-colors">Cancel</button>
        </div>
      )}

      {/* Setup forms */}
      {setupType === 'line' && (
        <LineSetupForm onSave={handleCreate} onCancel={() => { setSetupType(null); setShowPicker(false); }} />
      )}
      {setupType === 'bar' && (
        <SimpleSetupForm type="bar" onSave={handleCreate} onCancel={() => { setSetupType(null); setShowPicker(false); }} />
      )}
      {setupType === 'stacked' && (
        <SimpleSetupForm type="stacked" onSave={handleCreate} onCancel={() => { setSetupType(null); setShowPicker(false); }} />
      )}
      {setupType === 'boxplot' && (
        <SimpleSetupForm type="boxplot" onSave={handleCreate} onCancel={() => { setSetupType(null); setShowPicker(false); }} />
      )}

      {/* Existing visualisations */}
      {visualisations.map((viz) => (
        <div key={viz.id} className="mb-8">
          <div className="flex items-center justify-end mb-2">
            <button
              onClick={() => { setConfirmDelete(viz.id); setConfirmDeleteFinal(null); }}
              className="px-3 py-1.5 text-xs font-medium text-neutral-500 dark:text-neutral-400 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-lg hover:border-neutral-400 dark:hover:border-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 transition-all"
            >
              Remove
            </button>
          </div>
          {confirmDelete === viz.id && confirmDeleteFinal !== viz.id && (
            <div className="mb-3 flex items-center gap-2 p-3 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg">
              <p className="text-sm text-neutral-600 dark:text-neutral-300 flex-1">Remove this visualisation?</p>
              <button onClick={() => setConfirmDeleteFinal(viz.id)} className="px-3 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 bg-white dark:bg-neutral-800 border border-red-300 dark:border-red-800 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors">Yes, remove</button>
              <button onClick={() => setConfirmDelete(null)} className="px-3 py-1.5 text-xs font-medium text-neutral-600 dark:text-neutral-300 border border-neutral-300 dark:border-neutral-600 rounded-lg hover:border-neutral-400 dark:hover:border-neutral-500 transition-colors">Cancel</button>
            </div>
          )}
          {confirmDeleteFinal === viz.id && (
            <div className="mb-3 flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-700 dark:text-red-400 flex-1">This cannot be undone. Are you absolutely sure?</p>
              <button onClick={() => handleDelete(viz.id)} className="px-3 py-1.5 text-xs font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">Delete permanently</button>
              <button onClick={() => { setConfirmDelete(null); setConfirmDeleteFinal(null); }} className="px-3 py-1.5 text-xs font-medium text-neutral-600 dark:text-neutral-300 border border-neutral-300 dark:border-neutral-600 rounded-lg hover:border-neutral-400 dark:hover:border-neutral-500 transition-colors">Cancel</button>
            </div>
          )}
          <SingleVisualisation viz={viz} goalId={goalId} onUpdate={handleUpdate} />
        </div>
      ))}

      {/* Empty state */}
      {visualisations.length === 0 && !showPicker && !setupType && (
        <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-neutral-100 dark:bg-neutral-700 flex items-center justify-center shrink-0">
              <BarChart3 className="w-5 h-5 text-neutral-500 dark:text-neutral-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-base font-medium text-neutral-900 dark:text-neutral-100 mb-1">Track Progress with Data</h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed mb-4">
                This goal supports data tracking. Add a visualisation to start recording
                measurements and see trends, comparisons, or distributions over time.
              </p>
              <button
                onClick={() => setShowPicker(true)}
                className="px-4 py-2 bg-neutral-800 dark:bg-neutral-200 text-white dark:text-neutral-900 text-sm rounded-lg hover:bg-neutral-900 dark:hover:bg-neutral-300 transition-colors"
              >
                Add Your First Visualisation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SingleVisualisation({ viz, goalId, onUpdate }) {
  if (viz.type === 'line') {
    return (
      <ProgressDashboardContent
        initialTitle={viz.title || `${viz.xLabel} vs ${viz.yLabel} (Weekly)`}
        initialXLabel={viz.xLabel}
        initialYLabel={viz.yLabel}
        initialGoalScore={viz.goalScore}
        initialGoalWeek={viz.goalWeek}
        initialDataPoints={viz.dataPoints || []}
        onAddDataPoint={async (updatedPoints) => {
          const updated = { ...viz, dataPoints: updatedPoints };
          await onUpdate(viz.id, updated);
        }}
        onDeleteDataPoint={async (updatedPoints) => {
          await onUpdate(viz.id, { ...viz, dataPoints: updatedPoints });
        }}
      />
    );
  }

  if (viz.type === 'bar') {
    return (
      <BarChartContent
        initialTitle={viz.title}
        initialXLabel={viz.xLabel}
        initialYLabel={viz.yLabel}
        initialCategories={viz.categories || []}
        onDataChange={async (categories) => {
          await onUpdate(viz.id, { ...viz, categories });
        }}
      />
    );
  }

  if (viz.type === 'stacked') {
    return (
      <StackedBarContent
        initialTitle={viz.title}
        initialXLabel={viz.xLabel}
        initialYLabel={viz.yLabel}
        initialLabels={viz.labels || []}
        initialDatasets={viz.datasets || []}
        onDataChange={async ({ labels, datasets }) => {
          await onUpdate(viz.id, { ...viz, labels, datasets });
        }}
      />
    );
  }

  if (viz.type === 'boxplot') {
    return (
      <BoxplotContent
        initialTitle={viz.title}
        initialXLabel={viz.xLabel}
        initialYLabel={viz.yLabel}
        initialGroups={viz.groups || []}
        onDataChange={async (groups) => {
          await onUpdate(viz.id, { ...viz, groups });
        }}
      />
    );
  }

  return <p className="text-neutral-400 dark:text-neutral-500 text-sm">Unknown visualisation type: {viz.type}</p>;
}

function LineSetupForm({ onSave, onCancel }) {
  const [config, setConfig] = useState({ title: '', xLabel: '', yLabel: '', goalScore: '', goalWeek: '' });
  const [error, setError] = useState('');
  const inputClass = "w-full px-3 py-2.5 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-500 transition-colors bg-white dark:bg-neutral-800";

  return (
    <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-6 mb-4">
      <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-1">Set Up Line Chart</p>
      <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-5">Track two values over weekly intervals. The chart draws a trend line and tells you if you're on track.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide mb-1">Chart title</label>
          <input type="text" value={config.title} onChange={e => setConfig(p => ({ ...p, title: e.target.value }))} className={inputClass} placeholder="e.g. Study Time vs Test Score" />
        </div>
        <div>
          <label className="block text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide mb-1">What are you measuring? (X axis)</label>
          <input type="text" value={config.xLabel} onChange={e => setConfig(p => ({ ...p, xLabel: e.target.value }))} className={inputClass} placeholder="e.g. Pomodoro mins/day" />
        </div>
        <div>
          <label className="block text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide mb-1">What outcome? (Y axis)</label>
          <input type="text" value={config.yLabel} onChange={e => setConfig(p => ({ ...p, yLabel: e.target.value }))} className={inputClass} placeholder="e.g. Test Score" />
        </div>
        <div>
          <label className="block text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide mb-1">Target score</label>
          <input type="number" value={config.goalScore} onChange={e => setConfig(p => ({ ...p, goalScore: e.target.value }))} className={inputClass} placeholder="e.g. 90" />
        </div>
        <div>
          <label className="block text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide mb-1">By which week?</label>
          <input type="number" min="1" value={config.goalWeek} onChange={e => setConfig(p => ({ ...p, goalWeek: e.target.value }))} className={inputClass} placeholder="e.g. 12" />
        </div>
      </div>
      {error && <p className="text-red-600 dark:text-red-400 text-sm mb-3">{error}</p>}
      <div className="flex gap-2">
        <button onClick={() => {
          if (!config.xLabel.trim() || !config.yLabel.trim() || !config.goalScore || !config.goalWeek) { setError('Please fill in all fields.'); return; }
          onSave({ id: generateId(), type: 'line', title: config.title.trim() || `${config.xLabel} vs ${config.yLabel}`, xLabel: config.xLabel.trim(), yLabel: config.yLabel.trim(), goalScore: Number(config.goalScore), goalWeek: Number(config.goalWeek), dataPoints: [] });
        }} className="px-5 py-2 bg-neutral-800 dark:bg-neutral-200 text-white dark:text-neutral-900 text-sm rounded-lg hover:bg-neutral-900 dark:hover:bg-neutral-300 transition-colors">Create Chart</button>
        <button onClick={onCancel} className="px-4 py-2 text-sm text-neutral-600 dark:text-neutral-300 border border-neutral-300 dark:border-neutral-600 rounded-lg hover:border-neutral-400 dark:hover:border-neutral-500 transition-colors">Cancel</button>
      </div>
    </div>
  );
}

function SimpleSetupForm({ type, onSave, onCancel }) {
  const [config, setConfig] = useState({ title: '', xLabel: '', yLabel: '' });
  const [error, setError] = useState('');
  const inputClass = "w-full px-3 py-2.5 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-500 transition-colors bg-white dark:bg-neutral-800";
  const typeLabel = VIZ_TYPES.find(t => t.id === type)?.label || type;

  return (
    <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-6 mb-4">
      <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-1">Set Up {typeLabel}</p>
      <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-5">Give your chart a title and label the axes. You'll add the actual data after creating it.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide mb-1">Chart title</label>
          <input type="text" value={config.title} onChange={e => setConfig(p => ({ ...p, title: e.target.value }))} className={inputClass} placeholder={`e.g. ${type === 'bar' ? 'Subject Scores' : type === 'stacked' ? 'Quarterly Breakdown' : 'Score Distribution'}`} />
        </div>
        <div>
          <label className="block text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide mb-1">X-Axis label</label>
          <input type="text" value={config.xLabel} onChange={e => setConfig(p => ({ ...p, xLabel: e.target.value }))} className={inputClass} placeholder={`e.g. ${type === 'boxplot' ? 'Category' : 'Subject'}`} />
        </div>
        <div>
          <label className="block text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide mb-1">Y-Axis label</label>
          <input type="text" value={config.yLabel} onChange={e => setConfig(p => ({ ...p, yLabel: e.target.value }))} className={inputClass} placeholder="e.g. Score" />
        </div>
      </div>
      {error && <p className="text-red-600 dark:text-red-400 text-sm mb-3">{error}</p>}
      <div className="flex gap-2">
        <button onClick={() => {
          if (!config.title.trim() || !config.xLabel.trim() || !config.yLabel.trim()) { setError('Please fill in all fields.'); return; }
          const base = { id: generateId(), type, title: config.title.trim(), xLabel: config.xLabel.trim(), yLabel: config.yLabel.trim() };
          if (type === 'bar') base.categories = [];
          if (type === 'stacked') { base.labels = []; base.datasets = []; }
          if (type === 'boxplot') base.groups = [];
          onSave(base);
        }} className="px-5 py-2 bg-neutral-800 dark:bg-neutral-200 text-white dark:text-neutral-900 text-sm rounded-lg hover:bg-neutral-900 dark:hover:bg-neutral-300 transition-colors">Create Chart</button>
        <button onClick={onCancel} className="px-4 py-2 text-sm text-neutral-600 dark:text-neutral-300 border border-neutral-300 dark:border-neutral-600 rounded-lg hover:border-neutral-400 dark:hover:border-neutral-500 transition-colors">Cancel</button>
      </div>
    </div>
  );
}
