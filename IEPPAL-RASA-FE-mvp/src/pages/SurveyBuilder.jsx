import { useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { ChevronUp, ChevronDown, Copy, Trash2, X, ArrowLeft, Plus, GripVertical, Type, ListChecks, BarChart3, Sparkles, Check } from "lucide-react";
import { apiClient } from '../apiClient';
import { InlineSpinner } from '../components/LoadingSpinner';
import AiLoadingAnimation, { AI_SURVEY_MESSAGES } from '../components/AiLoadingAnimation';

const DEFAULT_LIKERT = [
  { value: 1, label: 'Strongly Disagree' },
  { value: 2, label: 'Disagree' },
  { value: 3, label: 'Neutral' },
  { value: 4, label: 'Agree' },
  { value: 5, label: 'Strongly Agree' }
];

const typeLabels = { likert: 'Likert Scale', text: 'Text Response', checkbox: 'Checkbox' };
const typeIcons = { likert: BarChart3, text: Type, checkbox: ListChecks };

export default function SurveyBuilder() {
  const { goalId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const initialSurvey = location.state?.survey || null;
  const isEdit = Boolean(initialSurvey);

  const [title, setTitle] = useState(initialSurvey?.title || "");
  const [questions, setQuestions] = useState(() => {
    if (!initialSurvey?.questions?.length) return [{ id: `q-${Date.now()}`, type: 'likert', text: '', likertOptions: DEFAULT_LIKERT.map(o => ({ ...o })) }];
    return initialSurvey.questions.map((q, i) =>
      typeof q === 'string' ? { id: `q-${i}`, type: 'likert', text: q } : { ...q }
    );
  });
  const [isSaving, setIsSaving] = useState(false);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiCount, setAiCount] = useState(5);
  const [aiTypes, setAiTypes] = useState({ likert: true, text: true, checkbox: true });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPreview, setGeneratedPreview] = useState(null); // AI-generated questions awaiting user confirmation
  const [selectedPreviewIdx, setSelectedPreviewIdx] = useState(() => new Set()); // indices of preview questions to keep

  const closeAiModal = () => {
    if (isGenerating) return;
    setAiModalOpen(false);
    setGeneratedPreview(null);
    setSelectedPreviewIdx(new Set());
  };

  const togglePreviewIdx = (idx) => {
    setSelectedPreviewIdx((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const goBack = () => navigate(`/goal/${goalId}`);

  const updateQuestion = (index, field, value) => {
    setQuestions(prev => prev.map((q, i) => {
      if (i !== index) return q;
      const updated = { ...q, [field]: value };
      if (field === 'type' && value === 'checkbox' && !q.options) { updated.options = ['Option 1']; updated.multiSelect = true; }
      if (field === 'type' && value !== 'checkbox') { delete updated.options; delete updated.multiSelect; }
      if (field === 'type' && value === 'likert' && !q.likertOptions) updated.likertOptions = DEFAULT_LIKERT.map(o => ({ ...o }));
      if (field === 'type' && value !== 'likert') delete updated.likertOptions;
      return updated;
    }));
  };

  const addQuestion = (type) => {
    const newQ = { id: `q-${Date.now()}`, type, text: '' };
    if (type === 'checkbox') { newQ.options = ['Option 1']; newQ.multiSelect = true; }
    if (type === 'likert') newQ.likertOptions = DEFAULT_LIKERT.map(o => ({ ...o }));
    setQuestions(prev => [...prev, newQ]);
  };

  const removeQuestion = (index) => {
    setQuestions(prev => prev.filter((_, i) => i !== index));
  };

  const moveQuestion = (index, direction) => {
    setQuestions(prev => {
      const next = [...prev];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const duplicateQuestion = (index) => {
    setQuestions(prev => {
      const src = prev[index];
      const clone = { ...JSON.parse(JSON.stringify(src)), id: `q-${Date.now()}` };
      const next = [...prev];
      next.splice(index + 1, 0, clone);
      return next;
    });
  };

  const addCheckboxOption = (qIndex) => {
    setQuestions(prev => prev.map((q, i) =>
      i === qIndex ? { ...q, options: [...(q.options || []), `Option ${(q.options || []).length + 1}`] } : q
    ));
  };

  const updateCheckboxOption = (qIndex, optIndex, value) => {
    setQuestions(prev => prev.map((q, i) => {
      if (i !== qIndex) return q;
      const opts = [...(q.options || [])];
      opts[optIndex] = value;
      return { ...q, options: opts };
    }));
  };

  const removeCheckboxOption = (qIndex, optIndex) => {
    setQuestions(prev => prev.map((q, i) => {
      if (i !== qIndex) return q;
      return { ...q, options: (q.options || []).filter((_, oi) => oi !== optIndex) };
    }));
  };

  const addLikertOption = (qIndex) => {
    setQuestions(prev => prev.map((q, i) => {
      if (i !== qIndex) return q;
      const opts = q.likertOptions || DEFAULT_LIKERT.map(o => ({ ...o }));
      return { ...q, likertOptions: [...opts, { value: opts.length + 1, label: `Point ${opts.length + 1}` }] };
    }));
  };

  const updateLikertOption = (qIndex, optIndex, label) => {
    setQuestions(prev => prev.map((q, i) => {
      if (i !== qIndex) return q;
      const opts = [...(q.likertOptions || DEFAULT_LIKERT.map(o => ({ ...o })))];
      opts[optIndex] = { ...opts[optIndex], label };
      return { ...q, likertOptions: opts };
    }));
  };

  const removeLikertOption = (qIndex, optIndex) => {
    setQuestions(prev => prev.map((q, i) => {
      if (i !== qIndex) return q;
      const opts = (q.likertOptions || DEFAULT_LIKERT.map(o => ({ ...o }))).filter((_, oi) => oi !== optIndex).map((o, idx) => ({ ...o, value: idx + 1 }));
      return { ...q, likertOptions: opts };
    }));
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const selectedTypes = Object.keys(aiTypes).filter((t) => aiTypes[t]);
      if (selectedTypes.length === 0) {
        alert('Select at least one question type.');
        setIsGenerating(false);
        return;
      }
      const result = await apiClient.generateSurvey(goalId, {
        questionCount: aiCount,
        questionTypes: selectedTypes,
      });
      if (!result.questions?.length) {
        alert('AI returned no questions. Try again.');
        return;
      }
      setGeneratedPreview(result.questions);
      // Default: all questions selected
      setSelectedPreviewIdx(new Set(result.questions.map((_, i) => i)));
    } catch (err) {
      alert(err.message || 'Failed to generate survey');
    } finally {
      setIsGenerating(false);
    }
  };

  const acceptGenerated = () => {
    if (!generatedPreview) return;
    if (selectedPreviewIdx.size === 0) return;
    const now = Date.now();
    const picked = generatedPreview.filter((_, i) => selectedPreviewIdx.has(i));
    const appended = picked.map((q, idx) => ({
      id: `q-ai-${now}-${idx}`,
      ...q,
    }));
    setQuestions((prev) => {
      // Drop any empty placeholder questions that were never filled in
      const nonEmpty = prev.filter((q) => q.text.trim().length > 0);
      return [...nonEmpty, ...appended];
    });
    setGeneratedPreview(null);
    setSelectedPreviewIdx(new Set());
    setAiModalOpen(false);
  };

  const hasTitle = title.trim().length > 0;
  const emptyQuestions = questions.filter(q => !q.text.trim());
  const allQuestionsFilled = questions.length > 0 && emptyQuestions.length === 0;
  const isFormReady = hasTitle && allQuestionsFilled;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormReady) return;
    const cleanQuestions = questions.map(q => ({
      ...q,
      text: q.text.trim(),
      ...(q.type === 'checkbox' ? { options: (q.options || []).filter(o => o.trim()).map(o => o.trim()), multiSelect: q.multiSelect !== false } : {}),
      ...(q.type === 'likert' && q.likertOptions ? { likertOptions: q.likertOptions.filter(o => o.label.trim()).map((o, idx) => ({ value: idx + 1, label: o.label.trim() })) } : {})
    }));
    try {
      setIsSaving(true);
      const surveyId = initialSurvey?.id || `survey-${Date.now().toString(36)}`;
      const templateEntry = {
        type: "template",
        action: initialSurvey?.id ? "update" : "create",
        surveyId,
        title: title.trim(),
        questions: cleanQuestions,
        updatedAt: new Date().toISOString()
      };
      await apiClient.updateGoalSurvey(goalId, templateEntry);
      goBack();
    } catch (err) {
      alert(err.message || "Failed to save survey template");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-32">
      {/* Back button */}
      <button onClick={goBack} className="flex items-center space-x-2 px-3 py-2 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-600 dark:text-neutral-300 hover:text-neutral-800 dark:hover:text-neutral-100 hover:border-neutral-400 dark:hover:border-neutral-500 hover:shadow-sm transition-all text-sm mb-6">
        <span className="text-base leading-none">&lsaquo;</span>
        <span>Back to Goal</span>
      </button>

      <form onSubmit={handleSubmit}>
        {/* Title section */}
        <div className="mb-10">
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder={isEdit ? "Survey title..." : "Untitled Survey"}
            className="w-full bg-transparent border-none outline-none font-serif text-3xl text-neutral-900 dark:text-neutral-100 placeholder-neutral-300 dark:placeholder-neutral-600"
          />
          <p className="text-neutral-400 dark:text-neutral-500 text-sm mt-2">
            {questions.length} question{questions.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Questions */}
        <div className="space-y-5">
          {questions.map((q, index) => {
            const TypeIcon = typeIcons[q.type];
            return (
              <div key={q.id} className="group bg-white dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700/50 rounded-2xl overflow-hidden transition-all hover:border-neutral-300 dark:hover:border-neutral-600">
                {/* Question top section */}
                <div className="p-5 pb-4">
                  {/* Number + type + actions row */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-full bg-neutral-100 dark:bg-neutral-700 flex items-center justify-center text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                        {index + 1}
                      </span>
                      <select
                        value={q.type}
                        onChange={e => updateQuestion(index, 'type', e.target.value)}
                        className="pl-2 pr-7 py-1.5 rounded-lg text-xs font-medium text-neutral-500 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-700 border-none focus:outline-none focus:ring-2 focus:ring-neutral-300 dark:focus:ring-neutral-600 cursor-pointer appearance-none"
                        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 6px center' }}
                      >
                        {Object.entries(typeLabels).map(([val, label]) => (
                          <option key={val} value={val}>{label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button type="button" onClick={() => moveQuestion(index, -1)} disabled={index === 0} className={`p-1.5 rounded-lg transition-colors ${index === 0 ? "text-neutral-200 dark:text-neutral-700 cursor-not-allowed" : "text-neutral-400 dark:text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-700 hover:text-neutral-600 dark:hover:text-neutral-300"}`} title="Move up">
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      <button type="button" onClick={() => moveQuestion(index, 1)} disabled={index === questions.length - 1} className={`p-1.5 rounded-lg transition-colors ${index === questions.length - 1 ? "text-neutral-200 dark:text-neutral-700 cursor-not-allowed" : "text-neutral-400 dark:text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-700 hover:text-neutral-600 dark:hover:text-neutral-300"}`} title="Move down">
                        <ChevronDown className="w-4 h-4" />
                      </button>
                      <button type="button" onClick={() => duplicateQuestion(index)} className="p-1.5 rounded-lg text-neutral-400 dark:text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-700 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors" title="Duplicate">
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button type="button" onClick={() => removeQuestion(index)} disabled={questions.length === 1} className={`p-1.5 rounded-lg transition-colors ${questions.length === 1 ? "text-neutral-200 dark:text-neutral-700 cursor-not-allowed" : "text-neutral-400 dark:text-neutral-500 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 dark:hover:text-red-400"}`} title="Delete">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Question text input (auto-growing textarea so long questions wrap to multiple lines) */}
                  <textarea
                    value={q.text}
                    onChange={e => {
                      updateQuestion(index, 'text', e.target.value);
                      e.target.style.height = 'auto';
                      e.target.style.height = e.target.scrollHeight + 'px';
                    }}
                    ref={(el) => {
                      if (el) {
                        el.style.height = 'auto';
                        el.style.height = el.scrollHeight + 'px';
                      }
                    }}
                    placeholder="Enter your question..."
                    rows={1}
                    className="w-full bg-transparent border-none outline-none text-base text-neutral-900 dark:text-neutral-100 placeholder-neutral-300 dark:placeholder-neutral-600 font-medium resize-none overflow-hidden leading-relaxed"
                  />
                </div>

                {/* Type-specific options */}
                {q.type === 'likert' && (
                  <div className="mx-5 mb-5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-medium text-neutral-400 dark:text-neutral-500 uppercase tracking-wide">
                        {(q.likertOptions || DEFAULT_LIKERT).length}-point scale
                      </span>
                      <button type="button" onClick={() => addLikertOption(index)} className="text-xs text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors">
                        + Add point
                      </button>
                    </div>
                    <div className="space-y-2">
                      {(q.likertOptions || DEFAULT_LIKERT).map((opt, optIdx) => (
                        <div key={optIdx} className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-full bg-white dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 flex items-center justify-center text-[11px] font-semibold text-neutral-400 dark:text-neutral-500 shrink-0">
                            {optIdx + 1}
                          </span>
                          <input
                            type="text"
                            value={opt.label}
                            onChange={e => updateLikertOption(index, optIdx, e.target.value)}
                            className="flex-1 bg-white dark:bg-neutral-700 px-3 py-2 rounded-lg text-sm text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-600 focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-500"
                          />
                          <button
                            type="button"
                            onClick={() => removeLikertOption(index, optIdx)}
                            disabled={(q.likertOptions || DEFAULT_LIKERT).length <= 2}
                            className={`p-1 rounded-lg transition-colors shrink-0 ${(q.likertOptions || DEFAULT_LIKERT).length <= 2 ? "text-neutral-200 dark:text-neutral-700 cursor-not-allowed" : "text-neutral-300 dark:text-neutral-600 hover:text-red-500 dark:hover:text-red-400"}`}
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {q.type === 'checkbox' && (
                  <div className="mx-5 mb-5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-neutral-400 dark:text-neutral-500 uppercase tracking-wide">
                          {(q.options || []).length} option{(q.options || []).length !== 1 ? 's' : ''}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuestion(index, 'multiSelect', !q.multiSelect)}
                          className={`px-2.5 py-1 text-[11px] font-medium rounded-full transition-colors ${
                            q.multiSelect !== false
                              ? "bg-neutral-800 dark:bg-neutral-200 text-white dark:text-neutral-900"
                              : "bg-white dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 text-neutral-500 dark:text-neutral-400"
                          }`}
                        >
                          {q.multiSelect !== false ? "Multi-select" : "Single choice"}
                        </button>
                      </div>
                      <button type="button" onClick={() => addCheckboxOption(index)} className="text-xs text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors">
                        + Add option
                      </button>
                    </div>
                    <div className="space-y-2">
                      {(q.options || []).map((opt, optIdx) => (
                        <div key={optIdx} className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-full bg-white dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 flex items-center justify-center text-[11px] font-semibold text-neutral-400 dark:text-neutral-500 shrink-0">
                            {optIdx + 1}
                          </span>
                          <input
                            type="text"
                            value={opt}
                            onChange={e => updateCheckboxOption(index, optIdx, e.target.value)}
                            className="flex-1 bg-white dark:bg-neutral-700 px-3 py-2 rounded-lg text-sm text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-600 focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-500"
                          />
                          <button
                            type="button"
                            onClick={() => removeCheckboxOption(index, optIdx)}
                            disabled={(q.options || []).length <= 1}
                            className={`p-1 rounded-lg transition-colors shrink-0 ${(q.options || []).length <= 1 ? "text-neutral-200 dark:text-neutral-700 cursor-not-allowed" : "text-neutral-300 dark:text-neutral-600 hover:text-red-500 dark:hover:text-red-400"}`}
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {q.type === 'text' && (
                  <div className="mx-5 mb-5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700 px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-full h-8 rounded-lg bg-white dark:bg-neutral-700 border border-dashed border-neutral-200 dark:border-neutral-600 flex items-center px-3">
                        <span className="text-xs text-neutral-300 dark:text-neutral-600 italic">Respondent types a free-text answer here</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Add question buttons */}
        <div className="mt-6 flex items-center gap-2">
          <button type="button" onClick={() => addQuestion('likert')} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-neutral-300 dark:border-neutral-600 text-sm text-neutral-500 dark:text-neutral-400 hover:border-neutral-400 dark:hover:border-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all">
            <Plus className="w-4 h-4" />
            Likert
          </button>
          <button type="button" onClick={() => addQuestion('text')} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-neutral-300 dark:border-neutral-600 text-sm text-neutral-500 dark:text-neutral-400 hover:border-neutral-400 dark:hover:border-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all">
            <Plus className="w-4 h-4" />
            Text
          </button>
          <button type="button" onClick={() => addQuestion('checkbox')} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-neutral-300 dark:border-neutral-600 text-sm text-neutral-500 dark:text-neutral-400 hover:border-neutral-400 dark:hover:border-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all">
            <Plus className="w-4 h-4" />
            Checkbox
          </button>
          <button
            type="button"
            onClick={() => setAiModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-pink-300 dark:border-pink-500/40 text-sm text-pink-600 dark:text-pink-400 hover:border-pink-400 dark:hover:border-pink-500/70 hover:bg-pink-50 dark:hover:bg-pink-500/10 transition-all ml-auto"
          >
            <Sparkles className="w-4 h-4" />
            Generate with AI
          </button>
        </div>

        {/* Sticky footer */}
        <div className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-lg border-t border-neutral-200 dark:border-neutral-700 z-40">
          <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
            <button type="button" onClick={goBack} className="px-5 py-2.5 rounded-xl text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
              Cancel
            </button>
            <div className="flex items-center gap-3">
              {!isFormReady && (
                <span className="text-xs text-neutral-400 dark:text-neutral-500">
                  {!hasTitle ? "Add a title to continue" : `${emptyQuestions.length} question${emptyQuestions.length !== 1 ? 's' : ''} need${emptyQuestions.length === 1 ? 's' : ''} text`}
                </span>
              )}
              <button
                type="submit"
                disabled={!isFormReady && !isSaving}
                className={`px-6 py-2.5 text-sm font-medium rounded-xl transition-all ${
                  isFormReady || isSaving
                    ? "bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200 shadow-sm"
                    : "bg-neutral-100 dark:bg-neutral-800 text-neutral-300 dark:text-neutral-600 cursor-not-allowed"
                }`}
              >
                {isSaving
                  ? <span className="flex items-center gap-2"><InlineSpinner /> Saving...</span>
                  : isEdit ? "Save Changes" : "Create Survey"
                }
              </button>
            </div>
          </div>
        </div>
      </form>

      {aiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={closeAiModal}>
          <div className="w-full max-w-lg max-h-[85vh] rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 shadow-lg flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-5 border-b border-neutral-200 dark:border-neutral-700 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-pink-500" />
                <h3 className="font-serif text-xl text-neutral-900 dark:text-neutral-100">
                  {generatedPreview ? 'Review AI-generated survey' : 'Generate with AI'}
                </h3>
              </div>
              <button onClick={closeAiModal} disabled={isGenerating} className="p-1.5 text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"><X className="w-5 h-5" /></button>
            </div>

            {isGenerating ? (
              <div className="px-6">
                <AiLoadingAnimation messages={AI_SURVEY_MESSAGES} />
              </div>
            ) : !generatedPreview ? (
              <>
                <div className="px-6 py-5 overflow-y-auto">
                  {/* Explainer */}
                  <div className="mb-5 p-4 rounded-xl bg-pink-50 dark:bg-pink-500/5 border border-pink-200 dark:border-pink-500/20">
                    <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-2">How this works</p>
                    <ul className="text-xs text-neutral-600 dark:text-neutral-400 space-y-1 list-disc pl-4">
                      <li>AI reads this goal's title, skill area, description, and student info.</li>
                      <li>It drafts survey questions to measure progress on the goal.</li>
                      <li>You'll see a preview next. Nothing is saved until you confirm.</li>
                      <li>Accepted questions get added to your survey, where you can edit, reorder, or delete them before saving.</li>
                    </ul>
                  </div>

                  <div className="mb-5">
                    <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">How many questions?</p>
                    <div className="flex flex-wrap gap-1.5">
                      {[3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => setAiCount(n)}
                          className={`w-10 h-10 text-sm font-medium rounded-xl border transition-all ${
                            aiCount === n
                              ? 'bg-gradient-to-r from-pink-500 to-orange-500 text-white border-transparent shadow-sm'
                              : 'bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700 hover:border-pink-300 dark:hover:border-pink-500/40'
                          }`}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Question types</p>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { key: 'likert', label: 'Likert Scale' },
                        { key: 'text', label: 'Text Response' },
                        { key: 'checkbox', label: 'Checkbox' },
                      ].map(({ key, label }) => {
                        const active = aiTypes[key];
                        return (
                          <button
                            key={key}
                            type="button"
                            onClick={() => setAiTypes((prev) => ({ ...prev, [key]: !prev[key] }))}
                            className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-all ${
                              active
                                ? 'bg-gradient-to-r from-pink-500 to-orange-500 text-white border-transparent shadow-sm'
                                : 'bg-white dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 border-neutral-200 dark:border-neutral-700 hover:border-pink-300 hover:text-neutral-700 dark:hover:text-neutral-300'
                            }`}
                          >
                            {label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="px-6 py-4 border-t border-neutral-200 dark:border-neutral-700 flex items-center justify-end gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={closeAiModal}
                    disabled={isGenerating}
                    className="px-4 py-2.5 rounded-xl text-sm text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="px-5 py-2.5 text-sm font-medium rounded-xl bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200 shadow-sm transition-all disabled:opacity-40 flex items-center gap-2"
                  >
                    {isGenerating && <InlineSpinner />}
                    {isGenerating ? 'Generating…' : 'Generate'}
                  </button>
                </div>
              </>
            ) : (
              <div className="ai-fade-in flex flex-col min-h-0 flex-1">
                <div className="px-6 py-5 overflow-y-auto">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                      AI drafted {generatedPreview.length} question{generatedPreview.length !== 1 ? 's' : ''}. Pick the ones to add.
                    </p>
                    <button
                      type="button"
                      onClick={() => setSelectedPreviewIdx(
                        selectedPreviewIdx.size === generatedPreview.length
                          ? new Set()
                          : new Set(generatedPreview.map((_, i) => i))
                      )}
                      className="text-xs text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300 font-medium"
                    >
                      {selectedPreviewIdx.size === generatedPreview.length ? 'Deselect all' : 'Select all'}
                    </button>
                  </div>
                  <ul className="space-y-3">
                    {generatedPreview.map((q, i) => {
                      const picked = selectedPreviewIdx.has(i);
                      return (
                        <li key={i}>
                          <button
                            type="button"
                            onClick={() => togglePreviewIdx(i)}
                            className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                              picked
                                ? 'border-pink-500 bg-pink-50 dark:bg-pink-500/10 ring-2 ring-pink-300 dark:ring-pink-500/30'
                                : 'border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900/40 hover:border-pink-300 dark:hover:border-pink-500/40'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <span className={`shrink-0 w-5 h-5 mt-0.5 rounded-md border-2 flex items-center justify-center transition-all ${
                                picked
                                  ? 'bg-pink-500 border-pink-500'
                                  : 'border-neutral-300 dark:border-neutral-600'
                              }`}>
                                {picked && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                              </span>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="w-6 h-6 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center text-[11px] font-semibold text-neutral-600 dark:text-neutral-300">{i + 1}</span>
                                  <span className="text-[10px] font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">{typeLabels[q.type]}</span>
                                </div>
                                <p className="text-sm text-neutral-900 dark:text-neutral-100 leading-relaxed break-words">{q.text}</p>
                                {q.type === 'checkbox' && q.options?.length > 0 && (
                                  <ul className="mt-2 space-y-0.5 pl-4">
                                    {q.options.map((opt, j) => (
                                      <li key={j} className="text-xs text-neutral-600 dark:text-neutral-400 list-disc">{opt}</li>
                                    ))}
                                  </ul>
                                )}
                                {q.type === 'likert' && q.likertOptions?.length > 0 && (
                                  <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
                                    {q.likertOptions.length}-point scale · {q.likertOptions[0].label} → {q.likertOptions[q.likertOptions.length - 1].label}
                                  </p>
                                )}
                              </div>
                            </div>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>

                <div className="px-6 py-4 border-t border-neutral-200 dark:border-neutral-700 flex items-center justify-between gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={() => { setGeneratedPreview(null); setSelectedPreviewIdx(new Set()); }}
                    className="px-4 py-2.5 rounded-xl text-sm text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                  >
                    Discard &amp; try again
                  </button>
                  <button
                    type="button"
                    onClick={acceptGenerated}
                    disabled={selectedPreviewIdx.size === 0}
                    className="px-5 py-2.5 text-sm font-medium rounded-xl bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200 shadow-sm transition-all disabled:opacity-40"
                  >
                    {selectedPreviewIdx.size === 0
                      ? 'Select questions to add'
                      : `Use ${selectedPreviewIdx.size} question${selectedPreviewIdx.size !== 1 ? 's' : ''}`}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
