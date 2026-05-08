import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { X, ChevronLeft, ChevronRight, Calendar, Sparkles, Check, Loader2, BookOpen, ChevronDown, ChevronUp, ExternalLink, Search, Plus, UploadCloud } from 'lucide-react';

import { apiClient } from '../apiClient';
import { usePermissions } from '../context/PermissionContext';
import LoadingSpinner from '../components/LoadingSpinner';
import AiLoadingAnimation, { AI_GOAL_MESSAGES, AI_STRATEGY_MESSAGES } from '../components/AiLoadingAnimation';
import IEPForms from './IEPForms';


// Collapsible section for strategy detail view
function StrategySection({ title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  const content = typeof children === 'string' ? children.trim() : children;
  if (!content) return null;

  return (
    <div className="border-b border-neutral-100 dark:border-neutral-700 last:border-b-0">
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(v => !v); }}
        className="flex items-center justify-between w-full py-2.5 text-left text-xs font-medium text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
      >
        {title}
        {open ? <ChevronUp className="w-3.5 h-3.5 text-neutral-400" /> : <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />}
      </button>
      {open && (
        <div className="pb-3 text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed whitespace-pre-line">
          {content}
        </div>
      )}
    </div>
  );
}

// Clickable strategy card for AI recommendations
function AiStrategyCard({ strategy, index, onNavigateToLibrary }) {
  const [expanded, setExpanded] = useState(false);
  const isLinked = strategy && !strategy.unlinked && strategy.id;
  const name = strategy?.strategyName || strategy;

  return (
    <div
      className={`rounded-xl animate-[fadeIn_0.3s_ease-out] overflow-hidden transition-all ${
        isLinked
          ? 'bg-violet-50 dark:bg-violet-900/20 border border-violet-100 dark:border-violet-800/30 cursor-pointer hover:border-violet-300 dark:hover:border-violet-600'
          : 'bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700'
      }`}
      style={{ animationDelay: `${0.25 + index * 0.05}s`, animationFillMode: 'backwards' }}
      onClick={(e) => { e.stopPropagation(); if (isLinked) setExpanded(v => !v); }}
    >
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-medium ${isLinked ? 'text-violet-700 dark:text-violet-300' : 'text-neutral-500 dark:text-neutral-400'}`}>
              {name}
            </p>
            {isLinked && strategy.strategyCategory && (
              <p className="text-[10px] text-violet-400 dark:text-violet-500 mt-0.5">{strategy.strategyCategory}</p>
            )}
          </div>
          {isLinked && (
            <ChevronDown className={`w-4 h-4 text-violet-400 dark:text-violet-500 shrink-0 transition-transform ${expanded ? 'rotate-180' : ''}`} />
          )}
        </div>

        {/* Brief overview shown when not expanded */}
        {isLinked && !expanded && strategy.briefOverview && (
          <p className="text-xs text-violet-500/70 dark:text-violet-400/60 mt-1.5 line-clamp-2 leading-relaxed">{strategy.briefOverview}</p>
        )}
      </div>

      {/* Expanded detail view */}
      {isLinked && expanded && (
        <div className="border-t border-violet-100 dark:border-violet-800/30 px-4 pb-4">
          {/* Book/author info */}
          {(strategy.bookTitle || strategy.author) && (
            <div className="flex items-center gap-2 py-2.5 border-b border-violet-100/50 dark:border-violet-800/20">
              <BookOpen className="w-3.5 h-3.5 text-violet-400/60 shrink-0" />
              <div className="min-w-0">
                {strategy.bookTitle && <p className="text-xs font-medium text-violet-600 dark:text-violet-300 truncate">{strategy.bookTitle}</p>}
                {strategy.author && <p className="text-[10px] text-violet-400 dark:text-violet-500">{strategy.author}</p>}
              </div>
            </div>
          )}

          {/* Diagnosis badge */}
          {strategy.primaryDiagnosis && (
            <div className="py-2">
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-violet-200/50 dark:bg-violet-800/40 text-violet-600 dark:text-violet-300">
                {strategy.primaryDiagnosis}
              </span>
            </div>
          )}

          {/* Accordion sections */}
          <div className="mt-1">
            <StrategySection title="Overview" defaultOpen>{strategy.briefOverview}</StrategySection>
            <StrategySection title="Evidence Base">{strategy.evidenceBaseSummary}</StrategySection>
            <StrategySection title="Implementation Steps">{strategy.implementationStepsSummary}</StrategySection>
            <StrategySection title="Resources Needed">{strategy.resourcesNeeded}</StrategySection>
            <StrategySection title="Challenges & Solutions">{strategy.challengesSolutionsSummary}</StrategySection>
            <StrategySection title="Case Study">{strategy.caseStudySummary}</StrategySection>
            <StrategySection title="Success Criteria">{strategy.successCriteriaSummary}</StrategySection>
          </div>

          {/* Link to strategy library */}
          <button
            onClick={(e) => { e.stopPropagation(); onNavigateToLibrary(strategy); }}
            className="mt-3 flex items-center gap-1.5 text-[11px] font-medium text-violet-500 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-200 transition-colors"
          >
            <ExternalLink className="w-3 h-3" />
            View in Strategy Library
          </button>
        </div>
      )}
    </div>
  );
}

function AiSuggestionsCarousel({ student, aiLoading, aiError, aiSuggestions, onAccept, onClose }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();
  const suggestions = (aiSuggestions || []).slice(0, 2);
  const suggestion = suggestions[currentIndex];
  const total = suggestions.length;

  const handleNavigateToLibrary = (strategy) => {
    onClose();
    navigate('/strategy-library', { state: { highlightStrategy: strategy.id } });
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="px-8 pt-6 pb-4 flex items-center justify-between shrink-0 border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-violet-500" />
            <h2 className="font-serif text-2xl text-neutral-900 dark:text-neutral-100">AI Goal Suggestions</h2>
          </div>
          <div className="flex items-center gap-4">
            {total > 1 && suggestion && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentIndex(0)}
                  className={`w-2 h-2 rounded-full transition-all ${currentIndex === 0 ? 'bg-violet-500 w-6' : 'bg-neutral-300 dark:bg-neutral-600 hover:bg-neutral-400'}`}
                />
                <button
                  onClick={() => setCurrentIndex(1)}
                  className={`w-2 h-2 rounded-full transition-all ${currentIndex === 1 ? 'bg-violet-500 w-6' : 'bg-neutral-300 dark:bg-neutral-600 hover:bg-neutral-400'}`}
                />
              </div>
            )}
            <button onClick={onClose} className="p-1.5 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {aiLoading && <AiLoadingAnimation messages={AI_GOAL_MESSAGES} />}

          {aiError && (
            <div className="p-8">
              <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl text-sm">
                {aiError}
              </div>
            </div>
          )}

          {suggestion && (
            <div className="p-8" key={currentIndex}>
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                {/* Left side — Goal details */}
                <div className="lg:col-span-3 space-y-5">
                  <div className="animate-[fadeIn_0.3s_ease-out]">
                    <p className="text-xs text-neutral-400 dark:text-neutral-500 mb-2">Option {currentIndex + 1} of {total}</p>
                    <h3 className="font-serif text-2xl text-neutral-900 dark:text-neutral-100 leading-snug">{suggestion.title}</h3>
                  </div>

                  <div className="animate-[fadeIn_0.3s_ease-out]" style={{ animationDelay: '0.05s', animationFillMode: 'backwards' }}>
                    <p className="text-[11px] font-medium text-neutral-400 dark:text-neutral-500 uppercase tracking-wide mb-1">Description</p>
                    <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">{suggestion.description}</p>
                  </div>

                  {suggestion.targetDate && (
                    <div className="animate-[fadeIn_0.3s_ease-out]" style={{ animationDelay: '0.1s', animationFillMode: 'backwards' }}>
                      <p className="text-[11px] font-medium text-neutral-400 dark:text-neutral-500 uppercase tracking-wide mb-1">Target Date</p>
                      <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-300">
                        <Calendar className="w-4 h-4 text-neutral-400" />
                        <span>{new Date(suggestion.targetDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
                      </div>
                      {suggestion.targetDateReasoning && (
                        <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1 ml-6">{suggestion.targetDateReasoning}</p>
                      )}
                    </div>
                  )}

                  {suggestion.reasoning && (
                    <div className="animate-[fadeIn_0.3s_ease-out]" style={{ animationDelay: '0.15s', animationFillMode: 'backwards' }}>
                      <p className="text-[11px] font-medium text-neutral-400 dark:text-neutral-500 uppercase tracking-wide mb-1">Why this goal?</p>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">{suggestion.reasoning}</p>
                    </div>
                  )}

                  {suggestion.evidence && (
                    <details className="mt-3 group">
                      <summary className="cursor-pointer text-xs font-medium text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300 list-none flex items-center gap-1.5 select-none">
                        <ChevronRight className="w-3 h-3 transition-transform group-open:rotate-90" />
                        Evidence
                      </summary>
                      <div className="mt-2 pl-4 space-y-2 text-xs text-neutral-600 dark:text-neutral-400">
                        {suggestion.evidence.fromIEP && (
                          <p><span className="font-medium text-neutral-500 dark:text-neutral-500">From IEP: </span>{suggestion.evidence.fromIEP}</p>
                        )}
                        {suggestion.evidence.fromPastGoals?.length > 0 && (
                          <div>
                            <p className="font-medium text-neutral-500 dark:text-neutral-500">From past goals:</p>
                            <ul className="list-disc pl-4 mt-0.5 space-y-0.5">
                              {suggestion.evidence.fromPastGoals.map((line, i) => <li key={i}>{line}</li>)}
                            </ul>
                          </div>
                        )}
                        {suggestion.evidence.avoidedStrategies?.length > 0 && (
                          <div>
                            <p className="font-medium text-neutral-500 dark:text-neutral-500">Avoiding:</p>
                            <ul className="list-disc pl-4 mt-0.5 space-y-0.5">
                              {suggestion.evidence.avoidedStrategies.map((line, i) => <li key={i} className="line-through">{line}</li>)}
                            </ul>
                          </div>
                        )}
                      </div>
                    </details>
                  )}
                </div>

                {/* Right side — Strategies (clickable) */}
                <div className="lg:col-span-2 animate-[fadeIn_0.3s_ease-out]" style={{ animationDelay: '0.2s', animationFillMode: 'backwards' }}>
                  {suggestion.suggestedStrategies?.length > 0 ? (
                    <div>
                      <p className="text-[11px] font-medium text-neutral-400 dark:text-neutral-500 uppercase tracking-wide mb-3">Recommended Strategies</p>
                      <p className="text-[10px] text-neutral-400 dark:text-neutral-500 mb-3">Click a strategy to see details</p>
                      <div className="space-y-2.5">
                        {suggestion.suggestedStrategies.map((strategy, i) => (
                          <AiStrategyCard
                            key={strategy?.id || i}
                            strategy={strategy}
                            index={i}
                            onNavigateToLibrary={handleNavigateToLibrary}
                          />
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-neutral-50 dark:bg-neutral-800 rounded-xl p-4">
                      <p className="text-sm text-neutral-400 dark:text-neutral-500">No specific strategies recommended.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {aiSuggestions && aiSuggestions.length === 0 && !aiError && !aiLoading && (
            <div className="p-8">
              <p className="text-center text-neutral-400 dark:text-neutral-500 py-8 text-sm">
                No suggestions generated. Try adding more IEP data.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        {suggestion && (
          <div className="px-8 py-5 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-end gap-3 shrink-0">
            {total > 1 && (
              <button
                onClick={() => setCurrentIndex(currentIndex === 0 ? 1 : 0)}
                className="px-4 py-2.5 text-sm text-neutral-600 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
              >
                {currentIndex === 0 ? <>Option 2 &rarr;</> : <>&larr; Option 1</>}
              </button>
            )}
            <button
              onClick={() => onAccept(suggestion)}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 text-white text-sm font-medium hover:from-violet-600 hover:to-purple-600 transition-all"
            >
              Use this goal
            </button>
          </div>
        )}
      </div>
    </div>
  );
}


export default function StudentDetail() {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { can } = usePermissions();

  const iepFillPrefill = location.state?.iepFillPrefill;
  const iepFillFormType = location.state?.iepFillFormType;
  const iepFillSourceDocExtract = location.state?.iepFillSourceDocExtract;
  const [student, setStudent] = useState(null);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [classroomColor, setClassroomColor] = useState('from-pink-500 to-rose-400');

  // IEP editor toggle + goal modal (lifted from GoalsView)
  const [showIEPEditor, setShowIEPEditor] = useState(false);
  const [initialFormType, setInitialFormType] = useState(null);
  const [showGoalModal, setShowGoalModal] = useState(false);

  // AI goal suggestions
  const [aiSuggestions, setAiSuggestions] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const [showAiPanel, setShowAiPanel] = useState(false);
  const [showAiExplainer, setShowAiExplainer] = useState(false);
  const [aiPrefill, setAiPrefill] = useState(null);

  // Student-wide AI strategy recommendations
  const [studentStrategyRecs, setStudentStrategyRecs] = useState(null);
  const [isLoadingStudentStrategyRecs, setIsLoadingStudentStrategyRecs] = useState(false);

  const fetchStudentStrategyRecs = async () => {
    setIsLoadingStudentStrategyRecs(true);
    try {
      const result = await apiClient.suggestStrategies({ studentId });
      setStudentStrategyRecs(result);
    } catch (err) {
      alert(err.message || 'Failed to fetch recommendations');
    } finally {
      setIsLoadingStudentStrategyRecs(false);
    }
  };

  // Page-level IEP data for summary cards
  const [forms, setForms] = useState([]);
  const [reports, setReports] = useState([]);
  const [iepLoading, setIepLoading] = useState(true);

  // Meeting notes
  const [meetingNotes, setMeetingNotes] = useState([]);

  const prevShowIEPEditor = useRef(false);

  // Auto-open IEP editor when arriving from IepFillReview with prefill state.
  // Also clear the history state so back-navigation doesn't re-apply the prefill.
  useEffect(() => {
    if (iepFillPrefill && iepFillFormType) {
      setInitialFormType(iepFillFormType);
      setShowIEPEditor(true);
      window.history.replaceState({}, '');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once on mount

  useEffect(() => {
    const loadStudentData = async () => {
      try {
        const [studentData, allForms, allReports, notes] = await Promise.all([
          apiClient.getStudent(studentId),
          apiClient.getIEPAllForms(),
          apiClient.getStudentReports(studentId),
          apiClient.getMeetingNotes(studentId),
        ]);

        setStudent(studentData);
        setGoals(studentData.goals || []);
        if (studentData.classroom?.color) {
          setClassroomColor(studentData.classroom.color);
        }
        setForms(allForms);
        setReports(allReports);
        setMeetingNotes(notes);
      } catch (error) {
        console.error('Failed to load student data:', error);
      } finally {
        setLoading(false);
        setIepLoading(false);
      }
    };

    if (studentId) {
      loadStudentData();
    }
  }, [studentId]);

  // Refresh reports when closing IEP editor
  useEffect(() => {
    if (prevShowIEPEditor.current && !showIEPEditor && student) {
      const refreshReports = async () => {
        try {
          const allReports = await apiClient.getStudentReports(student.id);
          setReports(allReports);
        } catch (error) {
          console.error('Error refreshing reports:', error);
        }
      };
      refreshReports();
    }
    prevShowIEPEditor.current = showIEPEditor;
  }, [showIEPEditor, student]);

  const handleAiSuggest = async () => {
    setAiLoading(true);
    setAiError('');
    setShowAiPanel(true);
    setAiSuggestions(null);
    try {
      const data = await apiClient.getAIGoalSuggestions(parseInt(studentId));
      setAiSuggestions(data.suggestions || []);
    } catch (error) {
      console.error('AI suggestion error:', error);
      if (error.message === 'AI_NOT_CONFIGURED') {
        setAiError('AI features are not configured. Please contact your administrator.');
      } else if (error.message === 'NO_IEP_DATA') {
        setAiError('This student needs at least one completed IEP report before AI can suggest goals. Create an IEP first.');
      } else if (error.message === 'INSUFFICIENT_IEP_DATA') {
        setAiError('The IEP reports need more information filled in before AI can make useful suggestions. Please complete at least 5 fields in an IEP report.');
      } else {
        setAiError(error.message || 'Failed to generate suggestions. Please try again.');
      }
    } finally {
      setAiLoading(false);
    }
  };

  const handleAcceptSuggestion = (suggestion) => {
    let formattedDate = '';
    if (suggestion.targetDate) {
      const parts = suggestion.targetDate.split('-');
      if (parts.length === 3) {
        formattedDate = `${parts[2]}/${parts[1]}/${parts[0]}`;
      }
    }
    // Extract strategy IDs from AI-suggested strategies (only linked ones with real IDs)
    const aiStrategyIds = (suggestion.suggestedStrategies || [])
      .filter(s => s?.id && !s.unlinked)
      .map(s => s.id);

    setShowAiPanel(false);
    setShowGoalModal(true);
    setAiPrefill({
      title: suggestion.title || '',
      skill: '',
      description: suggestion.description || '',
      targetDate: formattedDate,
      strategyIds: aiStrategyIds,
    });
  };

  const handleBackToSuggestions = () => {
    setShowGoalModal(false);
    setShowAiPanel(true);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!student) {
    return (
      <div className="text-center py-20">
        <h2 className="font-serif text-2xl text-neutral-900 dark:text-neutral-100 mb-2">Student Not Found</h2>
        <p className="text-neutral-400 dark:text-neutral-500 text-sm mb-4">The requested student could not be found.</p>
        <button
          onClick={() => navigate('/classrooms')}
          className="flex items-center space-x-2 px-3 py-2 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-600 dark:text-neutral-300 hover:text-neutral-800 dark:hover:text-neutral-100 hover:border-neutral-400 dark:hover:border-neutral-500 hover:shadow-sm transition-all text-sm"
        >
          <span className="text-base leading-none">&lsaquo;</span>
          <span>Back to Classrooms</span>
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 sm:mb-10">
        <div>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-6xl text-neutral-900 dark:text-neutral-100">{student.name}</h1>
          <p className="mt-2 text-neutral-400 dark:text-neutral-500 text-base font-light">Grade {student.level}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {showIEPEditor ? (
            <button
              onClick={() => { setShowIEPEditor(false); }}
              className="flex items-center space-x-2 px-3 py-2 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-600 dark:text-neutral-300 hover:text-neutral-800 dark:hover:text-neutral-100 hover:border-neutral-400 dark:hover:border-neutral-500 hover:shadow-sm transition-all text-sm"
            >
              <span className="text-base leading-none">&lsaquo;</span>
              <span>Back to Overview</span>
            </button>
          ) : (
            <button
              onClick={() => navigate(`/classroom/${encodeURIComponent(student.classroom?.name)}`)}
              className="flex items-center space-x-2 px-3 py-2 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-600 dark:text-neutral-300 hover:text-neutral-800 dark:hover:text-neutral-100 hover:border-neutral-400 dark:hover:border-neutral-500 hover:shadow-sm transition-all text-sm"
            >
              <span className="text-base leading-none">&lsaquo;</span>
              <span>Back to Classroom</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      {showIEPEditor ? (
        <IEPView2
          student={student}
          initialFormType={initialFormType}
          prefill={iepFillPrefill}
          prefillFormType={iepFillFormType}
          sourceDocExtract={iepFillSourceDocExtract}
        />
      ) : (
        <div className="space-y-8">
          <section className="rounded-3xl border border-neutral-200 bg-white/80 p-5 shadow-sm backdrop-blur-sm dark:border-neutral-700 dark:bg-neutral-800/80 sm:p-6">
            <div className="mb-6">
              <h2 className="font-serif text-2xl text-neutral-900 dark:text-neutral-100">IEPs & Documents</h2>
              <p className="mt-1 text-sm text-neutral-400 dark:text-neutral-500">
                Review completed documents or start a new IEP.
              </p>
            </div>
            {iepLoading ? (
              <LoadingSpinner />
            ) : (
              <IEPSummary
                forms={forms}
                reports={reports}
                canAdd={can('ieps', 'manage')}
                onAddNew={() => { setInitialFormType(null); setShowIEPEditor(true); }}
                onFillFromDoc={() => navigate(`/students/${student.id}/iep/fill`)}
                onOpenEditor={(formType) => {
                  setInitialFormType(formType || null);
                  setShowIEPEditor(true);
                }}
              />
            )}
          </section>

          {can('strategies', 'read') !== false && (
            <section className="rounded-3xl border border-neutral-200 bg-white/80 p-5 shadow-sm backdrop-blur-sm dark:border-neutral-700 dark:bg-neutral-800/80 sm:p-6">
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-serif text-2xl text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-pink-500" />
                    Recommended strategies
                  </h2>
                  <p className="mt-1 text-sm text-neutral-400 dark:text-neutral-500">
                    AI picks strategies across all of this student's active goals.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={fetchStudentStrategyRecs}
                  disabled={isLoadingStudentStrategyRecs}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-pink-300 dark:border-pink-500/40 text-sm text-pink-600 dark:text-pink-400 hover:border-pink-400 dark:hover:border-pink-500/70 hover:bg-pink-50 dark:hover:bg-pink-500/10 disabled:opacity-50 transition-all shrink-0"
                >
                  {isLoadingStudentStrategyRecs ? 'Thinking…' : (studentStrategyRecs ? 'Refresh' : 'Generate')}
                </button>
              </div>
              {!studentStrategyRecs && !isLoadingStudentStrategyRecs && (
                <details className="mb-3 text-xs">
                  <summary className="cursor-pointer text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300 font-medium select-none inline-flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> How this works
                  </summary>
                  <ul className="mt-2 pl-4 space-y-1 list-disc text-neutral-600 dark:text-neutral-400">
                    <li>AI reads this student's IEP reports and all their active goals.</li>
                    <li>It reviews every strategy assigned across all goals plus the effectiveness you've marked on each.</li>
                    <li>It picks 3–5 strategies from the library that fit the student overall, and avoids any marked "didn't work".</li>
                    <li>Strategies are suggestions only — you apply them to specific goals yourself.</li>
                  </ul>
                </details>
              )}

              {isLoadingStudentStrategyRecs ? (
                <AiLoadingAnimation messages={AI_STRATEGY_MESSAGES} compact />
              ) : studentStrategyRecs?.recommendations?.length > 0 ? (
                <div className="ai-fade-in space-y-3">
                  {studentStrategyRecs.recommendations.map((r) => (
                    <div key={r.strategyId} className="p-4 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
                      <div className="flex items-start gap-3">
                        <span className="shrink-0 w-7 h-7 rounded-full bg-gradient-to-r from-pink-500 to-orange-500 text-white text-xs font-semibold flex items-center justify-center">{r.rank}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{r.strategyName}</p>
                          {r.whyBestFit && (
                            <p className="text-xs text-neutral-700 dark:text-neutral-300 mt-2 leading-relaxed"><span className="font-medium text-pink-600 dark:text-pink-400">Why this fit:</span> {r.whyBestFit}</p>
                          )}
                          {r.evidenceFromStudent && (
                            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 leading-relaxed"><span className="font-medium">Evidence:</span> {r.evidenceFromStudent}</p>
                          )}
                          {r.expectedImpact && (
                            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 leading-relaxed"><span className="font-medium">Expected impact:</span> {r.expectedImpact}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-neutral-500 dark:text-neutral-400">Click Generate to see AI-picked strategies for this student.</p>
              )}
            </section>
          )}

          <section className="rounded-3xl border border-neutral-200 bg-white/80 p-5 shadow-sm backdrop-blur-sm dark:border-neutral-700 dark:bg-neutral-800/80 sm:p-6">
            <div className="mb-6">
              <h2 className="font-serif text-2xl text-neutral-900 dark:text-neutral-100">Goals</h2>
              <p className="mt-1 text-sm text-neutral-400 dark:text-neutral-500">
                View current goals and add new ones for this student.
              </p>
            </div>
            <GoalsView
              student={student}
              goals={goals}
              setGoals={setGoals}
              classroomColor={classroomColor}
              onGoalCreated={(newGoal) => setGoals(prev => [...prev, newGoal])}
              showGoalModal={showGoalModal}
              setShowGoalModal={setShowGoalModal}
              hideCreateButton={true}
              canAdd={can('goals', 'manage')}
              aiPrefill={aiPrefill}
              setAiPrefill={setAiPrefill}
              onAiSuggest={handleAiSuggest}
              onAiExplain={() => setShowAiExplainer(true)}
              onBackToSuggestions={aiSuggestions && aiSuggestions.length > 0 ? handleBackToSuggestions : null}
              aiLoading={aiLoading}
              meetingNotes={meetingNotes}
              studentId={studentId}
            />
          </section>

          <section className="rounded-3xl border border-neutral-200 bg-white/80 p-5 shadow-sm backdrop-blur-sm dark:border-neutral-700 dark:bg-neutral-800/80 sm:p-6">
            <div className="mb-6">
              <h2 className="font-serif text-2xl text-neutral-900 dark:text-neutral-100">Meetings</h2>
              <p className="mt-1 text-sm text-neutral-400 dark:text-neutral-500">
                Record meetings and link them to goals or IEPs.
              </p>
            </div>
            <MeetingNotesView
              notes={meetingNotes}
              setNotes={setMeetingNotes}
              canManage={can('meetingNotes', 'manage')}
              navigate={navigate}
              studentId={studentId}
            />
          </section>
        </div>
      )}

      {/* AI Explainer Modal */}
      {showAiExplainer && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => { setShowAiExplainer(false); setShowGoalModal(true); }}>
          <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl shadow-lg max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="shrink-0 text-transparent bg-gradient-to-br from-violet-500 to-purple-500 bg-clip-text">
                  <Sparkles className="w-7 h-7 stroke-violet-500" style={{ filter: 'drop-shadow(0 0 4px rgba(139,92,246,0.3))' }} />
                </span>
                <h3 className="font-serif text-xl text-neutral-900 dark:text-neutral-100">Suggest Goals with AI</h3>
              </div>

              <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed mb-3">
                AI will read through <span className="font-medium text-neutral-700 dark:text-neutral-200">{student.name}'s</span> data and draft 2 personalized goal ideas.
              </p>

              <div className="mb-4 p-3 rounded-xl bg-pink-50 dark:bg-pink-500/5 border border-pink-200 dark:border-pink-500/20">
                <p className="text-xs font-medium text-neutral-900 dark:text-neutral-100 mb-2">How this works</p>
                <ul className="text-xs text-neutral-600 dark:text-neutral-400 space-y-1 list-disc pl-4">
                  <li>Reads all IEP reports, existing goals, survey trends, and meeting notes.</li>
                  <li>Checks each past strategy's effectiveness (your 👍 / 👎 marks).</li>
                  <li>Drafts 2 SMART goals with target dates and suggested strategies.</li>
                  <li>Each suggestion shows an Evidence panel with the signals behind it.</li>
                  <li>Nothing saves until you click "Use this goal".</li>
                </ul>
              </div>

              <p className="text-xs text-neutral-400 dark:text-neutral-500 mb-6">
                Usually takes about 10 seconds.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => { setShowAiExplainer(false); setShowGoalModal(true); }}
                  className="flex-1 px-4 py-2.5 bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 rounded-xl text-sm font-medium hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={() => { setShowAiExplainer(false); handleAiSuggest(); }}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-xl text-sm font-medium hover:from-violet-600 hover:to-purple-600 transition-all flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  Generate
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Suggestions Modal */}
      {showAiPanel && (
        <AiSuggestionsCarousel
          student={student}
          aiLoading={aiLoading}
          aiError={aiError}
          aiSuggestions={aiSuggestions}
          onAccept={handleAcceptSuggestion}
          onClose={() => { setShowAiPanel(false); setShowGoalModal(true); }}
        />
      )}
    </>
  );
}

// Auto-format typed input as DD/MM/YYYY (inserts slashes automatically)
function formatDateInput(raw, prev) {
  // Strip non-digits
  const digits = raw.replace(/\D/g, '').slice(0, 8);
  // If user is deleting, don't auto-format
  if (raw.length < (prev || '').length) {
    return raw;
  }
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return digits.slice(0, 2) + '/' + digits.slice(2);
  return digits.slice(0, 2) + '/' + digits.slice(2, 4) + '/' + digits.slice(4);
}

// Validate a DD/MM/YYYY string — returns error message or null if valid
function validateDate(str) {
  if (!str) return null;
  const match = str.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return 'Use DD/MM/YYYY format';
  const [, dd, mm, yyyy] = match.map(Number);
  if (mm < 1 || mm > 12) return `Month ${mm} doesn't exist`;
  if (dd < 1) return 'Day must be at least 1';
  const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const maxDays = new Date(yyyy, mm, 0).getDate();
  if (dd > maxDays) return `${monthNames[mm - 1]} ${yyyy} only has ${maxDays} days`;
  return null;
}

// Custom date picker matching site style. Value/onChange use DD/MM/YYYY strings.
function DatePicker({ value, onChange, placeholder = 'DD/MM/YYYY', className }) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value || '');
  const [error, setError] = useState(null);
  const [dropUp, setDropUp] = useState(false);
  const ref = useRef(null);
  const inputRef = useRef(null);

  // Sync inputValue when value changes externally (e.g. calendar pick)
  useEffect(() => {
    setInputValue(value || '');
    setError(null);
  }, [value]);

  // Parse DD/MM/YYYY into a Date
  const parseDMY = (str) => {
    if (!str) return null;
    const [d, m, y] = str.split('/').map(Number);
    if (!d || !m || !y) return null;
    const date = new Date(y, m - 1, d);
    if (isNaN(date.getTime())) return null;
    return date;
  };

  const parsed = parseDMY(value);
  const [viewDate, setViewDate] = useState(() => parsed || new Date());

  // Sync viewDate when value changes externally
  useEffect(() => {
    const p = parseDMY(value);
    if (p) setViewDate(p);
  }, [value]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Decide if calendar should open upward based on viewport position
  const openCalendar = () => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      setDropUp(spaceBelow < 330);
    }
    setOpen(true);
  };

  const handleType = (e) => {
    const formatted = formatDateInput(e.target.value, inputValue);
    setInputValue(formatted);
    setError(null);
    // Only validate + push when fully typed
    if (formatted.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
      const err = validateDate(formatted);
      if (err) {
        setError(err);
      } else {
        onChange(formatted);
      }
    }
  };

  const handleBlur = () => {
    if (!inputValue) return;
    const err = validateDate(inputValue);
    if (err || !inputValue.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
      setError(err || 'Incomplete date');
      setTimeout(() => {
        setInputValue(value || '');
        setError(null);
      }, 2000);
    }
  };

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const monthName = viewDate.toLocaleString('default', { month: 'long' });

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

  const selectDay = (day) => {
    const dd = String(day).padStart(2, '0');
    const mm = String(month + 1).padStart(2, '0');
    onChange(`${dd}/${mm}/${year}`);
    setOpen(false);
  };

  const isSelected = (day) => {
    if (!parsed) return false;
    return parsed.getDate() === day && parsed.getMonth() === month && parsed.getFullYear() === year;
  };

  const isToday = (day) => {
    const today = new Date();
    return today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;
  };

  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);

  const defaultClass = 'w-full border border-neutral-200 dark:border-neutral-700 rounded-lg px-3 py-2 text-sm text-neutral-900 dark:text-neutral-100 bg-transparent transition-colors hover:border-neutral-400 dark:hover:border-neutral-500';

  return (
    <div className="relative" ref={ref}>
      <div className={`flex items-center ${className || defaultClass} ${error ? 'border-red-400' : ''}`}>
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleType}
          onFocus={openCalendar}
          onBlur={handleBlur}
          placeholder={placeholder}
          className={`flex-1 bg-transparent outline-none text-sm placeholder:text-neutral-400 dark:placeholder:text-neutral-500 ${error ? 'text-red-500' : 'text-neutral-900 dark:text-neutral-100'}`}
        />
        <button
          type="button"
          onClick={() => open ? setOpen(false) : openCalendar()}
          className="ml-2 text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors shrink-0"
        >
          <Calendar className="w-4 h-4" />
        </button>
      </div>

      {error && (
        <p className="text-red-500 text-xs mt-1">{error}</p>
      )}

      {open && (
        <div className={`absolute z-50 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-lg p-4 w-72 ${dropUp ? 'bottom-full mb-1' : 'top-full mt-1'}`}>
          {/* Month/Year nav */}
          <div className="flex items-center justify-between mb-3">
            <button type="button" onClick={prevMonth} className="p-1 text-neutral-400 dark:text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-100 transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{monthName} {year}</span>
            <button type="button" onClick={nextMonth} className="p-1 text-neutral-400 dark:text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-100 transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 mb-1">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
              <div key={d} className="text-center text-xs font-medium text-neutral-400 dark:text-neutral-500 py-1">{d}</div>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7">
            {days.map((day, i) => (
              <div key={i} className="flex items-center justify-center">
                {day ? (
                  <button
                    type="button"
                    onClick={() => selectDay(day)}
                    className={`w-8 h-8 rounded-lg text-sm transition-colors
                      ${isSelected(day)
                        ? 'bg-neutral-800 dark:bg-neutral-200 text-white dark:text-neutral-900'
                        : isToday(day)
                          ? 'bg-neutral-100 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 font-medium'
                          : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700'
                      }`}
                  >
                    {day}
                  </button>
                ) : (
                  <div className="w-8 h-8" />
                )}
              </div>
            ))}
          </div>

          {/* Today shortcut */}
          <div className="mt-2 pt-2 border-t border-neutral-100 dark:border-neutral-700">
            <button
              type="button"
              onClick={() => {
                const today = new Date();
                setViewDate(today);
                selectDay(today.getDate());
              }}
              className="text-xs text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-100 transition-colors"
            >
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Convert camelCase to Title Case (e.g. "caseHistory" → "Case History")
function MeetingNotesView({ notes, setNotes, canManage, navigate, studentId }) {
  const handleDelete = async (e, id) => {
    e.stopPropagation();
    try {
      await apiClient.deleteMeetingNote(id);
      setNotes(prev => prev.filter(n => n.id !== id));
    } catch (error) {
      console.error('Failed to delete note:', error);
    }
  };

  if (notes.length === 0 && !canManage) {
    return <p className="text-neutral-400 dark:text-neutral-500 text-sm">No meeting notes yet.</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-3">
      {notes.map(note => {
        const d = new Date(note.createdAt);
        const dateStr = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
        const timeStr = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
        return (
          <div
            key={note.id}
            onClick={() => navigate(`/student/${studentId}/meeting-note/${note.id}/edit`)}
            className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 p-4 cursor-pointer hover:shadow-md hover:border-neutral-300 dark:hover:border-neutral-600 transition-all group"
          >
            <h4 className="font-medium text-neutral-900 dark:text-neutral-100 text-sm truncate">{note.title}</h4>
            <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1.5">
              Meeting on {dateStr} at {timeStr}
            </p>
            <div className="flex flex-wrap gap-1.5 mt-3">
              {note.goal && (
                <span className="inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-lg bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400 border border-violet-200 dark:border-violet-800/40">
                  <span className="font-medium">Goal:</span> {note.goal.title}
                </span>
              )}
              {note.report && (
                <span className="inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40">
                  <span className="font-medium">IEP:</span> {formatFormType(note.report.type)}
                </span>
              )}
            </div>
            {canManage && (
              <div className="flex items-center gap-1 mt-3 pt-2 border-t border-neutral-200 dark:border-neutral-700 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => { e.stopPropagation(); navigate(`/student/${studentId}/meeting-note/${note.id}/edit`); }}
                  className="p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                </button>
                <button
                  onClick={(e) => handleDelete(e, note.id)}
                  className="p-1 text-neutral-400 hover:text-red-500 transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
            )}
          </div>
        );
      })}
      {canManage && <AddTile label="Add Meeting" onClick={() => navigate(`/student/${studentId}/meeting-note/new`)} />}
    </div>
  );
}

function formatFormType(str) {
  if (!str) return '';
  const spaced = str
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2');
  const tokens = spaced.split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return '';
  const hasAcronym = tokens.slice(1).some(t => t.length >= 2 && /^[A-Z]+$/.test(t));
  if (hasAcronym) tokens[0] = tokens[0].toUpperCase();
  else tokens[0] = tokens[0].charAt(0).toUpperCase() + tokens[0].slice(1);
  return tokens.join(' ').trim();
}

// IEP Summary cards — shows a grid of form types with report status
function IEPSummary({ forms, reports, onOpenEditor, canAdd, onAddNew, onFillFromDoc }) {
  if (!forms.length) {
    return <p className="text-neutral-400 dark:text-neutral-500 text-sm">No IEP form types available.</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
      {forms.map(form => {
        const latestReport = getLatestReport(reports, form.formType);
        const hasReport = Boolean(latestReport);

        return (
          <div
            key={form.formType}
            onClick={() => onOpenEditor(form.formType)}
            className={`card-hover rounded-xl border p-5 hover:shadow-md transition-all cursor-pointer ${
              hasReport
                ? 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800 hover:border-green-300 dark:hover:border-green-700'
                : 'bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600'
            }`}
          >
            <h3 className="font-medium text-neutral-900 dark:text-neutral-100 mb-1">{formatFormType(form.formType)}</h3>
            {hasReport ? (
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                Last updated on {new Date(latestReport.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
              </p>
            ) : (
              <p className="text-sm text-neutral-400 dark:text-neutral-500">Not yet filled</p>
            )}
          </div>
        );
      })}
      {canAdd && <AddIEPMenu onAddNew={onAddNew} onFillFromDoc={onFillFromDoc} />}
    </div>
  );
}

function AddIEPMenu({ onAddNew, onFillFromDoc }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0, width: 260 });
  const buttonRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (buttonRef.current?.contains(e.target)) return;
      if (menuRef.current?.contains(e.target)) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const updatePosition = () => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const MENU_HEIGHT = 112;
    const MENU_MARGIN = 12;
    const spaceBelow = window.innerHeight - rect.bottom;
    const dropUp = spaceBelow < MENU_HEIGHT + MENU_MARGIN && rect.top > spaceBelow;
    const top = dropUp ? rect.top - MENU_HEIGHT - 8 : rect.bottom + 8;
    setPos({ top, left: rect.left, width: rect.width });
  };

  useEffect(() => {
    if (!open) return;
    updatePosition();
    const handler = () => updatePosition();
    window.addEventListener('resize', handler);
    window.addEventListener('scroll', handler, true);
    return () => {
      window.removeEventListener('resize', handler);
      window.removeEventListener('scroll', handler, true);
    };
  }, [open]);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => {
          if (!open) updatePosition();
          setOpen((o) => !o);
        }}
        className="group w-full rounded-xl border border-dashed border-neutral-300 dark:border-neutral-600 bg-transparent p-5 flex flex-col items-center justify-center text-center min-h-[92px] hover:border-neutral-500 dark:hover:border-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800/60 transition-all"
      >
        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-700 text-neutral-500 dark:text-neutral-400 group-hover:bg-neutral-200 dark:group-hover:bg-neutral-600 group-hover:text-neutral-700 dark:group-hover:text-neutral-200 transition-colors mb-2">
          <Plus className="w-4 h-4" />
        </span>
        <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400 group-hover:text-neutral-700 dark:group-hover:text-neutral-200">Add IEP</span>
      </button>
      {open &&
        createPortal(
          <div
            ref={menuRef}
            className="fixed z-[1000] rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 shadow-xl overflow-hidden"
            style={{ top: pos.top, left: pos.left, width: pos.width }}
          >
            <button
              type="button"
              onClick={() => { setOpen(false); onAddNew?.(); }}
              className="w-full text-left px-4 py-3 text-sm text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-700 flex items-center gap-2.5"
            >
              <Plus className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
              <span>Start from blank template</span>
            </button>
            <button
              type="button"
              onClick={() => { setOpen(false); onFillFromDoc?.(); }}
              className="w-full text-left px-4 py-3 text-sm text-pink-600 dark:text-pink-400 hover:bg-pink-50 dark:hover:bg-pink-500/10 flex items-center gap-2.5 border-t border-neutral-100 dark:border-neutral-700"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Fill from document with AI</span>
            </button>
          </div>,
          document.body,
        )}
    </>
  );
}

function AddTile({ label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="group rounded-xl border border-dashed border-neutral-300 dark:border-neutral-600 bg-transparent p-5 flex flex-col items-center justify-center text-center min-h-[92px] hover:border-neutral-500 dark:hover:border-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800/60 transition-all"
    >
      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-700 text-neutral-500 dark:text-neutral-400 group-hover:bg-neutral-200 dark:group-hover:bg-neutral-600 group-hover:text-neutral-700 dark:group-hover:text-neutral-200 transition-colors mb-2">
        <Plus className="w-4 h-4" />
      </span>
      <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400 group-hover:text-neutral-700 dark:group-hover:text-neutral-200">{label}</span>
    </button>
  );
}

// Full IEP editor view (SideNav + form)
function IEPView2({ student, initialFormType, prefill, prefillFormType, sourceDocExtract }) {
  const [loading, setLoading] = useState(true);
  const [forms, setForms] = useState([]);
  const [activeFormType, setActiveFormType] = useState(initialFormType || null);
  const [reports, setReports] = useState([]);

  useEffect(() => {
    loadIEPData();
  }, [student.id]);

  useEffect(() => {
    if (!forms.length) return;
    if (!activeFormType) {
      setActiveFormType(initialFormType || forms[0].formType);
    }
  }, [forms, activeFormType, initialFormType]);


  const loadIEPData = async () => {
    try {
      const [allForms, allReports] = await Promise.all([
        apiClient.getIEPAllForms(),
        apiClient.getStudentReports(student.id),
      ]);
      setForms(allForms);
      setReports(allReports);
    } catch (error) {
      console.error("Error loading IEP data:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadStudentreports = async () => {
    try {
      const allReports = await apiClient.getStudentReports(student.id);
      setReports(allReports);
    } catch (error) {
      console.error("Error loading student reports:", error);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  const navItems = forms.map(f => ({
    id: f.formType,
    label: formatFormType(f.formType),
  }));

  return (
      <div className="flex flex-col min-h-[60vh]">

      <TopNav
        items={navItems}
        activeView={activeFormType}
        onSelect={setActiveFormType}
      />

      <MainContent
        forms={forms}
        reports={reports}
        activeFormType={activeFormType}
        student={student}
        loadStudentreports={loadStudentreports}
        prefill={prefill}
        prefillFormType={prefillFormType}
        sourceDocExtract={sourceDocExtract}
      />

    </div>
  );

}

function TopNav({ items, activeView, onSelect }) {
  return (
    <nav className="w-full border-b border-neutral-200 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800/50">
      <ul className="px-4 py-3 flex gap-1 overflow-x-auto">
        {items.map(item => (
          <li key={item.id} className="shrink-0">
            <button
              onClick={() => onSelect(item.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors
                ${activeView === item.id
                  ? 'bg-neutral-900 text-white shadow-sm dark:bg-neutral-100 dark:text-neutral-900'
                  : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-700/40'
                }`}
            >
              {item.label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function MainContent({ forms, reports, activeFormType, student, loadStudentreports, prefill, prefillFormType, sourceDocExtract }) {
  const activeForm = forms.find(
    f => f.formType === activeFormType
  );

  if (!activeForm) {
    return (
      <main className="flex-1 p-6">
        <div className="text-neutral-400 dark:text-neutral-500 text-sm">No form selected</div>
      </main>
    );
  }

  const latestReport = getLatestReport(reports, activeFormType);

  return (
    <main className="flex-1 p-6 overflow-auto bg-white dark:bg-neutral-800">
      <DynamicRenderer
        formType={activeForm.formType}
        config={activeForm.config}
        report={latestReport}
        student={student}
        loadStudentreports={loadStudentreports}
        prefill={prefill}
        prefillFormType={prefillFormType}
        sourceDocExtract={sourceDocExtract}
      />
    </main>
  );
}

function getLatestReport(reports, formType) {
  return reports.filter(r => r.type === formType)
    .sort((a, b) => a.version - b.version)
    .at(-1);
}

function DynamicRenderer({ formType, config, report, student, loadStudentreports, prefill, prefillFormType, sourceDocExtract }) {
  const effectiveInitialData = React.useMemo(() => {
    const base = report ? JSON.parse(report.content) : undefined;
    if (!prefill || !prefillFormType || prefillFormType !== formType) return base;
    return { ...(base || {}), ...prefill };
  }, [report, prefill, prefillFormType, formType]);

  const effectiveSourceDocExtract = (sourceDocExtract && prefillFormType === formType) ? sourceDocExtract : null;

  return (
      <IEPForms
        formType={formType}
        config={config}
        initialData={effectiveInitialData}
        reportId={report?.id}
        sourceDocExtract={effectiveSourceDocExtract}
        studentName={student?.name}
        onSubmit={(data) => {
          return apiClient.createReport({
            studentId: student.id,
            studentName: student.name || 'N/A',
            level: student.level || 'N/A',
            content: data,
            type: formType,
            sourceDocExtract: effectiveSourceDocExtract ? JSON.stringify(effectiveSourceDocExtract) : undefined
          });
        }}
        onSaved={loadStudentreports}
      />
  );
}

// Goals Section Component
function GoalsView({ student, goals, setGoals, classroomColor = 'from-pink-500 to-rose-400', onGoalCreated, showGoalModal, setShowGoalModal, hideCreateButton, canAdd, aiPrefill, setAiPrefill, onAiSuggest, onAiExplain, onBackToSuggestions, aiLoading, meetingNotes = [], studentId }) {
  const [editingGoal, setEditingGoal] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [skillSearch, setSkillSearch] = useState('');
  const [showSkillDropdown, setShowSkillDropdown] = useState(false);
  const [standards, setStandards] = useState([]);

  useEffect(() => {
    const loadStandards = async () => {
      try {
        const data = await apiClient.getStandards();
        setStandards(data || []);
      } catch (error) {
        setStandards([]);
      }
    };
    loadStandards();
  }, []);


  const [newGoal, setNewGoal] = useState({
    title: '',
    skill: '',
    description: '',
    targetDate: '',
    colorGradient: 'from-pink-500 to-rose-400',
    strategyIds: [],
  });
  const [createError, setCreateError] = useState('');
  const [editError, setEditError] = useState('');

  // Apply AI prefill data when available
  useEffect(() => {
    if (aiPrefill && showGoalModal) {
      setNewGoal(prev => ({
        ...prev,
        title: aiPrefill.title || prev.title,
        skill: aiPrefill.skill || prev.skill,
        description: aiPrefill.description || prev.description,
        targetDate: aiPrefill.targetDate || prev.targetDate,
        strategyIds: aiPrefill.strategyIds?.length ? aiPrefill.strategyIds : prev.strategyIds,
      }));
      if (setAiPrefill) setAiPrefill(null);
    }
  }, [aiPrefill, showGoalModal, setAiPrefill]);

  const filteredSkills = React.useMemo(() => {
    const filtered = {};
    if(!standards) return filtered;
    if (!skillSearch) return standards;

    Object.entries(standards).forEach(([category, skills]) => {
      const matchingSkills = skills.filter(skill =>
        skill.toLowerCase().startsWith(skillSearch.toLowerCase())
      );
      if (matchingSkills.length > 0) {
        filtered[category] = matchingSkills;
      }
    });
    return filtered;
  }, [skillSearch, standards]);

  const getBestMatch = (input) => {
    if (!input) return '';
    const allSkills = Object.values(standards).flat();
    const exactMatch = allSkills.find(skill => skill.toLowerCase() === input.toLowerCase());
    if (exactMatch) return exactMatch;

    const startsWith = allSkills.filter(skill => skill.toLowerCase().startsWith(input.toLowerCase()));
    return startsWith.length > 0 ? startsWith[0] : input;
  };

  const handleSkillSelect = (skill) => {
    setEditForm(prev => ({ ...prev, skill }));
    setShowSkillDropdown(false);
    setSkillSearch('');
  };

  const activeGoals = goals.filter(goal => goal.status === 'ACTIVE');
  const completedGoals = goals.filter(goal => goal.status === 'COMPLETED');

  const handleSave = async (goalId) => {
    if (!editForm.title?.trim() || !editForm.description?.trim() || !editForm.targetDate?.trim()) {
      setEditError('Please fill in all required fields');
      return;
    }
    const dateErr = validateDate(editForm.targetDate);
    if (dateErr) {
      setEditError(dateErr);
      return;
    }
    try {
      setEditError('');
      await apiClient.updateGoal(goalId, editForm);
      setGoals(prev => prev.map(goal =>
        goal.id === goalId ? { ...goal, ...editForm } : goal
      ));
      setEditingGoal(null);
    } catch (error) {
      console.error('Failed to update goal:', error);
      setEditError('Failed to update goal: ' + (error.response?.data?.message || error.message));
    }
  };


  const navigate = useNavigate();
  const handleViewDetails = (goalId) => {
    navigate(`/goal/${goalId}`);
  };

  const handleCreateGoal = async () => {
    if (!newGoal.title?.trim() || !newGoal.description?.trim() || !newGoal.targetDate?.trim()) {
      setCreateError('Please fill in all required fields');
      return;
    }
    const dateErr = validateDate(newGoal.targetDate);
    if (dateErr) {
      setCreateError(dateErr);
      return;
    }
    try {
      setCreateError('');
      const goalData = {
        studentId: student.id,
        title: newGoal.title,
        skill: newGoal.skill,
        description: newGoal.description,
        targetDate: newGoal.targetDate,
        status: 'ACTIVE',
        strategyIds: newGoal.strategyIds?.length ? newGoal.strategyIds : undefined,
      };
      const createdGoal = await apiClient.createGoal(goalData);
      if (onGoalCreated) {
        onGoalCreated(createdGoal);
      }
      setShowGoalModal(false);
      setCreateError('');
      setNewGoal({
        title: '',
        skill: '',
        description: '',
        targetDate: '',
        colorGradient: 'from-pink-500 to-rose-400',
        strategyIds: [],
      });
    } catch (error) {
      console.error('Failed to create goal:', error);
      setCreateError('Failed to create goal: ' + (error.response?.data?.message || error.message));
    }
  };

  const renderGoalCard = (goal, isCompleted = false) => (
    <div
      key={goal.id}
      className={`bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:shadow-md transition-all duration-200 ${isCompleted ? 'opacity-60' : ''} ${editingGoal !== goal.id ? 'cursor-pointer card-hover' : ''}`}
      onClick={() => handleViewDetails(goal.id)}
    >
      {editingGoal === goal.id ? (
        <EditGoalCard
          editForm={editForm}
          setEditForm={setEditForm}
          goal={goal}
          setEditingGoal={setEditingGoal}
          editError={editError}
          setEditError={setEditError}
          handleSave={handleSave}
          skillSearch={skillSearch}
          setSkillSearch={setSkillSearch}
          showSkillDropdown={showSkillDropdown}
          setShowSkillDropdown={setShowSkillDropdown}
          filteredSkills={filteredSkills}
          getBestMatch={getBestMatch}
          handleSkillSelect={handleSkillSelect}
        />
      ) : (
        <ListGoalCard goal={goal} meetingNotes={meetingNotes.filter(n => n.goalId === goal.id)} studentId={studentId} />
      )}
    </div>
  );

  return (
    <div>
      {!hideCreateButton && (
        <div className="mb-6 flex justify-end">
          <button
            onClick={() => setShowGoalModal(true)}
            className={`px-4 py-2 bg-gradient-to-r ${classroomColor} text-white rounded-lg font-medium hover:shadow-lg transition-all`}
          >
            Create Goals
          </button>
        </div>
      )}

      <div className="space-y-8">
        {/* Active Goals + Add tile */}
        {(activeGoals.length > 0 || canAdd) && (
          <div>
            {activeGoals.length > 0 && (
              <h3 className="text-sm font-medium text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-4">
                Active ({activeGoals.length})
              </h3>
            )}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
              {activeGoals.map(goal => renderGoalCard(goal))}
              {canAdd && <AddTile label="Add Goal" onClick={() => setShowGoalModal(true)} />}
            </div>
          </div>
        )}

        {/* Completed Goals */}
        {completedGoals.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-4">
              Completed ({completedGoals.length})
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
              {completedGoals.map(goal => renderGoalCard(goal, true))}
            </div>
          </div>
        )}

        {goals.length === 0 && !canAdd && (
          <p className="text-sm text-neutral-400 dark:text-neutral-500">No goals yet.</p>
        )}
      </div>

      {/* Create Goal Modal */}
      {showGoalModal && (
        <ShowGoalModal
          newGoal={newGoal}
          setNewGoal={setNewGoal}
          createError={createError}
          setCreateError={setCreateError}
          skillSearch={skillSearch}
          setSkillSearch={setSkillSearch}
          showSkillDropdown={showSkillDropdown}
          setShowSkillDropdown={setShowSkillDropdown}
          filteredSkills={filteredSkills}
          getBestMatch={getBestMatch}
          handleCreateGoal={handleCreateGoal}
          setShowGoalModal={setShowGoalModal}
          onAiSuggest={onAiSuggest}
          onAiExplain={onAiExplain}
          onBackToSuggestions={onBackToSuggestions}
          aiLoading={aiLoading || false}
        />
      )}

    </div>
  );
}

function EditGoalCard({
  editForm,
  setEditForm,
  goal,
  setEditingGoal,
  editError,
  setEditError,
  handleSave,
  skillSearch,
  setSkillSearch,
  showSkillDropdown,
  setShowSkillDropdown,
  filteredSkills,
  getBestMatch,
  handleSkillSelect
}) {
  const inputClass = "w-full border border-neutral-200 dark:border-neutral-700 rounded-lg px-3 py-2 text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-500 transition-colors bg-transparent";

  return (
    <div className="p-5 space-y-3">
      <div>
        <label className="block text-xs font-medium text-neutral-400 dark:text-neutral-500 mb-1">Title</label>
        <input
          type="text"
          value={editForm.title}
          onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
          className={inputClass}
          placeholder="Goal title"
        />
      </div>
      <div className="relative">
        <label className="block text-xs font-medium text-neutral-400 dark:text-neutral-500 mb-1">Standard (Optional)</label>
        <input
          type="text"
          value={editForm.skill}
          onChange={(e) => {
            setEditForm(prev => ({ ...prev, skill: e.target.value }));
            setSkillSearch(e.target.value);
            setShowSkillDropdown(true);
          }}
          onFocus={() => setShowSkillDropdown(true)}
          onBlur={() => {
            const validatedSkill = getBestMatch(editForm.skill);
            setEditForm(prev => ({ ...prev, skill: validatedSkill }));
          }}
          placeholder="Type or select standard"
          className={inputClass}
        />
        {showSkillDropdown && (
          <div className="absolute z-10 w-full mt-1 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {Object.entries(filteredSkills).map(([category, skills]) => (
              <div key={category} className="p-2">
                <div className="text-xs font-medium text-neutral-400 dark:text-neutral-500 px-2 py-1">
                  {category}
                </div>
                {skills.map((skill) => (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => handleSkillSelect(skill)}
                    className="w-full text-left px-3 py-1.5 hover:bg-neutral-50 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 rounded transition-colors text-sm"
                  >
                    {skill}
                  </button>
                ))}
              </div>
            ))}
            {Object.keys(filteredSkills).length === 0 && (
              <div className="p-4 text-neutral-400 dark:text-neutral-500 text-center text-sm">
                No skills found matching "{skillSearch}"
              </div>
            )}
          </div>
        )}
        {showSkillDropdown && (
          <div
            className="fixed inset-0 z-5"
            onClick={() => setShowSkillDropdown(false)}
          />
        )}
      </div>
      <div>
        <label className="block text-xs font-medium text-neutral-400 dark:text-neutral-500 mb-1">Description</label>
        <textarea
          value={editForm.description}
          onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
          className={inputClass}
          rows="2"
          placeholder="Description"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-neutral-400 dark:text-neutral-500 mb-1">Target Date</label>
        <DatePicker
          value={editForm.targetDate}
          onChange={(date) => setEditForm(prev => ({ ...prev, targetDate: date }))}
          className={inputClass + ' flex items-center cursor-pointer'}
        />
      </div>
      {editError && (
        <div className="text-red-600 dark:text-red-400 text-xs">{editError}</div>
      )}
      <div className="flex items-center gap-2 pt-1">
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleSave(goal.id);
          }}
          className="px-3 py-1.5 text-xs font-medium bg-neutral-800 dark:bg-neutral-200 text-white dark:text-neutral-900 rounded-lg hover:bg-neutral-900 dark:hover:bg-neutral-300 transition-colors"
        >
          Save
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setEditingGoal(null);
            setEditError('');
          }}
          className="px-3 py-1.5 text-xs font-medium text-neutral-600 dark:text-neutral-300 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-lg hover:border-neutral-400 dark:hover:border-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-100 transition-all"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

function ListGoalCard({ goal, meetingNotes = [], studentId }) {
  return (
    <div className="p-5">
      <div className="mb-3">
        <h3 className="font-medium text-neutral-900 dark:text-neutral-100 leading-snug">{goal.title}</h3>
      </div>

      {/* Details */}
      <div className="space-y-2">
        <p className="text-sm text-neutral-500 dark:text-neutral-400">{goal.skill}</p>

        {goal.description && (
          <p className="text-sm text-neutral-400 dark:text-neutral-500 line-clamp-2">{goal.description}</p>
        )}

        <div className="flex items-center gap-4 text-xs text-neutral-400 dark:text-neutral-500">
          {goal.targetDate && (
            <span>Target: {new Date(goal.targetDate).toLocaleDateString()}</span>
          )}
          {goal.createdAt && (
            <span>Created: {new Date(goal.createdAt).toLocaleDateString()}</span>
          )}
          {goal.assignedStrategies?.length > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-pink-500/10 to-orange-500/10 text-pink-600 dark:from-pink-500/20 dark:to-orange-500/20 dark:text-pink-400 text-[10px] font-medium">
              {goal.assignedStrategies.length} {goal.assignedStrategies.length === 1 ? 'strategy' : 'strategies'}
            </span>
          )}
        </div>
      </div>

      {/* Linked Meeting Notes */}
      {meetingNotes.length > 0 && (
        <div className="mt-3 pt-3 border-t border-neutral-100 dark:border-neutral-700 space-y-1.5">
          {meetingNotes.map(note => {
            const d = new Date(note.createdAt);
            const dateStr = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
            const timeStr = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
            return (
              <a
                key={note.id}
                href={`/student/${studentId}/meeting-note/${note.id}/edit`}
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 text-amber-700 dark:text-amber-400 text-[11px] hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors"
              >
                <Calendar className="w-3 h-3 shrink-0" />
                <span className="truncate">{note.title} — {dateStr} at {timeStr}</span>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ShowGoalModal({
  setShowGoalModal,
  newGoal,
  setNewGoal,
  createError,
  setCreateError,
  skillSearch,
  setSkillSearch,
  showSkillDropdown,
  setShowSkillDropdown,
  filteredSkills,
  getBestMatch,
  handleCreateGoal,
  onAiSuggest,
  onAiExplain,
  onBackToSuggestions,
  aiLoading
}) {
  const [strategies, setStrategies] = useState([]);
  const [strategySearch, setStrategySearch] = useState('');
  const [strategiesLoading, setStrategiesLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await apiClient.getStrategies();
        setStrategies(data || []);
      } catch { setStrategies([]); }
      finally { setStrategiesLoading(false); }
    };
    load();
  }, []);

  const selectedIds = newGoal.strategyIds || [];

  const toggleStrategy = (id) => {
    setNewGoal(prev => {
      const current = prev.strategyIds || [];
      return {
        ...prev,
        strategyIds: current.includes(id) ? current.filter(sid => sid !== id) : [...current, id],
      };
    });
  };

  const filteredStrategies = strategies.filter(s => {
    if (!strategySearch.trim()) return true;
    const q = strategySearch.toLowerCase();
    return s.strategyName?.toLowerCase().includes(q) || s.strategyCategory?.toLowerCase().includes(q);
  });

  const selectedStrategies = strategies.filter(s => selectedIds.includes(s.id));

  return createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-200 dark:border-neutral-700 shrink-0">
          <h2 className="font-serif text-3xl text-neutral-900 dark:text-neutral-100">Create New Goal</h2>
          <button
            onClick={() => setShowGoalModal(false)}
            className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-neutral-500 dark:text-neutral-400" />
          </button>
        </div>

        {/* Content — two columns */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-0 lg:divide-x divide-neutral-200 dark:divide-neutral-700">
            {/* Left: Goal fields */}
            <div className="lg:col-span-3 p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Goal Title</label>
                <input
                  type="text"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-3 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-500 bg-transparent text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
                  placeholder="Enter goal title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Standard (Optional)</label>
                <div className="relative">
                  <input
                    type="text"
                    value={newGoal.skill}
                    onChange={(e) => {
                      setNewGoal(prev => ({ ...prev, skill: e.target.value }));
                      setSkillSearch(e.target.value);
                      setShowSkillDropdown(true);
                    }}
                    onFocus={() => setShowSkillDropdown(true)}
                    onBlur={() => {
                      const validatedSkill = getBestMatch(newGoal.skill);
                      setNewGoal(prev => ({ ...prev, skill: validatedSkill }));
                    }}
                    className="w-full px-4 py-3 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-500 bg-transparent text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
                    placeholder="Type or select standard"
                  />
                  {showSkillDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {Object.entries(filteredSkills).map(([category, skills]) => (
                        <div key={category} className="p-2">
                          <div className="text-xs font-semibold text-neutral-600 dark:text-neutral-300 px-2 py-1 bg-neutral-50 dark:bg-neutral-700 rounded">
                            {category}
                          </div>
                          {skills.map((skill) => (
                            <button
                              key={skill}
                              type="button"
                              onClick={() => {
                                setNewGoal(prev => ({ ...prev, skill }));
                                setShowSkillDropdown(false);
                                setSkillSearch('');
                              }}
                              className="w-full text-left px-3 py-2 hover:bg-neutral-50 dark:hover:bg-neutral-700 hover:text-neutral-800 dark:hover:text-neutral-100 rounded transition-colors text-sm text-neutral-700 dark:text-neutral-300"
                            >
                              {skill}
                            </button>
                          ))}
                        </div>
                      ))}
                      {Object.keys(filteredSkills).length === 0 && (
                        <div className="p-4 text-neutral-500 dark:text-neutral-400 text-center text-sm">
                          No skills found matching "{skillSearch}"
                        </div>
                      )}
                    </div>
                  )}
                  {showSkillDropdown && (
                    <div className="fixed inset-0 z-5" onClick={() => setShowSkillDropdown(false)} />
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Description</label>
                <textarea
                  value={newGoal.description}
                  onChange={(e) => setNewGoal(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-3 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-500 bg-transparent text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
                  rows="3"
                  placeholder="Describe the goal and strategies"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Target Date</label>
                <DatePicker
                  value={newGoal.targetDate || ''}
                  onChange={(date) => setNewGoal(prev => ({ ...prev, targetDate: date }))}
                  className="w-full px-4 py-3 border border-neutral-300 dark:border-neutral-600 rounded-lg flex items-center cursor-pointer hover:border-neutral-400 dark:hover:border-neutral-500 transition-colors bg-transparent text-neutral-900 dark:text-neutral-100"
                />
              </div>
            </div>

            {/* Right: Strategy picker */}
            <div className="lg:col-span-2 p-6 flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Strategies {selectedIds.length > 0 && <span className="text-neutral-400 dark:text-neutral-500 font-normal">({selectedIds.length} selected)</span>}
                </label>
              </div>

              {/* Selected strategies chips */}
              {selectedStrategies.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {selectedStrategies.map(s => (
                    <span
                      key={s.id}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-neutral-100 dark:bg-neutral-700 text-xs text-neutral-700 dark:text-neutral-300"
                    >
                      {s.strategyName}
                      <button onClick={() => toggleStrategy(s.id)} className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Search */}
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type="text"
                  value={strategySearch}
                  onChange={(e) => setStrategySearch(e.target.value)}
                  placeholder="Search strategies..."
                  className="w-full pl-9 pr-3 py-2.5 border border-neutral-300 dark:border-neutral-600 rounded-lg text-sm focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-500 bg-transparent text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
                />
              </div>

              {/* Strategy list */}
              <div className="overflow-y-auto space-y-1 border border-neutral-200 dark:border-neutral-700 rounded-lg p-2" style={{ height: '338px' }}>
                {strategiesLoading ? (
                  <p className="text-sm text-neutral-400 dark:text-neutral-500 text-center py-4">Loading strategies...</p>
                ) : filteredStrategies.length === 0 ? (
                  <p className="text-sm text-neutral-400 dark:text-neutral-500 text-center py-4">No strategies found</p>
                ) : (
                  filteredStrategies.map(s => {
                    const isSelected = selectedIds.includes(s.id);
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => toggleStrategy(s.id)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${
                          isSelected
                            ? 'bg-neutral-800 dark:bg-neutral-200 text-white dark:text-neutral-900'
                            : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded border-2 shrink-0 flex items-center justify-center ${
                          isSelected ? 'border-white dark:border-neutral-900 bg-white/20' : 'border-neutral-300 dark:border-neutral-600'
                        }`}>
                          {isSelected && <Check className="w-3 h-3" />}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-medium">{s.strategyName}</p>
                          <p className={`text-xs truncate ${isSelected ? 'text-neutral-300 dark:text-neutral-600' : 'text-neutral-400 dark:text-neutral-500'}`}>
                            {s.strategyCategory}
                          </p>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-neutral-200 dark:border-neutral-700 shrink-0">
          {createError && (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm mb-4">
              {createError}
            </div>
          )}
          <div className="flex items-center justify-between">
            {onBackToSuggestions ? (
              <button
                onClick={() => { setShowGoalModal(false); onBackToSuggestions(); }}
                className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-violet-500 to-purple-500 text-white text-sm font-medium rounded-lg hover:from-violet-600 hover:to-purple-600 transition-all"
              >
                <Sparkles className="w-4 h-4" />
                <span>View AI Results</span>
              </button>
            ) : onAiSuggest ? (
              <button
                onClick={() => { setShowGoalModal(false); if (onAiExplain) onAiExplain(); }}
                disabled={aiLoading}
                className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-violet-500 to-purple-500 text-white text-sm font-medium rounded-lg hover:from-violet-600 hover:to-purple-600 transition-all disabled:opacity-60"
              >
                {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                <span>AI Suggest</span>
              </button>
            ) : <div />}
            <div className="flex items-center space-x-3">
              <button
                onClick={() => {
                  setShowGoalModal(false);
                  setCreateError('');
                }}
                className="px-6 py-2 text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-700 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateGoal}
                disabled={!newGoal.title.trim() || !newGoal.description.trim() || !newGoal.targetDate.trim()}
                className="px-5 py-2 bg-neutral-800 dark:bg-neutral-200 text-white dark:text-neutral-900 text-sm rounded-lg hover:bg-neutral-900 dark:hover:bg-neutral-300 disabled:bg-neutral-100 dark:disabled:bg-neutral-700 disabled:text-neutral-400 dark:disabled:text-neutral-500 disabled:cursor-not-allowed transition-colors"
              >
                Create Goal
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
