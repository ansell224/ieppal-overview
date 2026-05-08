import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { apiClient } from '../apiClient';
import { FiLogOut, FiTrash2, FiMenu, FiEdit2, FiSun, FiMoon } from 'react-icons/fi';
import { ChevronUp, ChevronDown, Trash2, X, Plus, Type, ListChecks, BarChart3, Calendar, Hash } from 'lucide-react';
import { InlineSpinner } from "../components/LoadingSpinner";


const generateId = () => Math.random().toString(36).substring(2, 10);

const FormCustomization = () => {
  const [selectedForm, setSelectedForm] = useState(null);
  const [config, setConfig] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showCreateTemplateModal, setShowCreateTemplateModal] = useState(false);
  const [showDeleteTemplateModal, setShowDeleteTemplateModal] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [templateStartFrom, setTemplateStartFrom] = useState("blank");
  const [templateSource, setTemplateSource] = useState("");
  const [iepForms, setIepForms] = useState([]);
  const [templateNameError, setTemplateNameError] = useState("");
  const canDeleteTemplate = Boolean(selectedForm);


  useEffect(() => {
    loadIEPForms();
  }, []);

  useEffect(() => {
    if (selectedForm) {
      loadConfig(selectedForm);
    }
  }, [selectedForm]);

  const loadIEPForms = async () => {
    try {
      const data = await apiClient.getIEPFormTypes(); 
      const forms = data || [];
      const defaultForm = forms[0]?.formType || 'caseHistory';

      setIepForms(forms);
      setSelectedForm(defaultForm);

    } catch (error) { 
      setIepForms([]);
    }
  };     

/*   const loadConfig = async () => {
    try {
      const data = await apiClient.getFormConfig(selectedForm);
      if (data && data.config) {
        setConfig(JSON.parse(data.config));
      } else {
        setConfig(getDefaultConfig(selectedForm));
      }
    } catch (error) {
      setConfig(getDefaultConfig(selectedForm));
    }
  }; */

const loadConfig = async (formType) => {
  try {
    const data = await apiClient.getFormConfig(formType);
    if (data && data.config) {
      setConfig(JSON.parse(data.config));
    } else {
      setConfig(getDefaultConfig(formType));
    }
  } catch (error) {
    setConfig(getDefaultConfig(formType));
  }
};

  const getDefaultConfig = (formType) => {
    if (formType === 'skillsAssessment') {
      return [
        { id: generateId(), title: "Cognitive–Perceptual", fields: [
          { id: generateId(), type: "text", label: "Attention" },
          { id: generateId(), type: "text", label: "Observation" }
        ]},
        { id: generateId(), title: "Body Awareness", fields: [
          { id: generateId(), type: "text", label: "Body Awareness" }
        ]}
      ];
    } else {
      return [
        { id: generateId(), title: "Identifying Information", fields: [
          { id: generateId(), type: "text", label: "Serial No." },
          { id: generateId(), type: "text", label: "Name" }
        ]},
        { id: generateId(), title: "Family History", fields: [
          { id: generateId(), type: "checkbox", label: "Family History", options: ["Mental Retardation", "Epilepsy"] }
        ]}
      ];
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await apiClient.saveFormConfig(selectedForm, config);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);  
    } catch (error) {
      alert('Failed to save configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTemplate = async () => {
    const normalized = templateName.trim().toLowerCase();
    if (!normalized) return;

    if (iepForms) {
      const isDuplicate = iepForms.some(
        f => f.formType.toLowerCase() === normalized
      );

      if (isDuplicate) {
        setTemplateNameError("A template with this name already exists");
        return;
      }
    }

    const sourceTemplate = templateStartFrom === 'copy'
      ? (templateSource || iepForms[0]?.formType || '')
      : '';
    const nextConfig = sourceTemplate
      ? await (async () => {
          try {
            const data = await apiClient.getFormConfig(sourceTemplate);
            if (data?.config) {
              return JSON.parse(data.config);
            }
          } catch (error) {
            // Fall through to default config below.
          }
          return getDefaultConfig(sourceTemplate || selectedForm || 'caseHistory');
        })()
      : getDefaultConfig(selectedForm || 'caseHistory');

    try {
      await apiClient.saveFormConfig(templateName, nextConfig);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000); 
      await loadIEPForms();
      setSelectedForm(templateName.trim());
      setConfig(nextConfig);
    } catch (error) {
      alert('Failed to save configuration');
      return;
    }

    setTemplateName("");
    setTemplateStartFrom("blank");
    setTemplateSource("");
    setShowCreateTemplateModal(false);
    setTemplateNameError(""); 
  };

  const handleSelectedFormChange = (value) => {
    setSelectedForm(value);
  };

  const handleNameChange = (value) => {
    setTemplateName(value);
    if (templateNameError) {
      setTemplateNameError("");
    }
  };

  const resetCreateTemplateModal = () => {
    setTemplateName("");
    setTemplateStartFrom("blank");
    setTemplateSource("");
    setTemplateNameError("");
    setShowCreateTemplateModal(false);
  };

  const handleDeleteTemplate = async () => {
    if (!canDeleteTemplate) return;

    setLoading(true);
    try {
      await apiClient.deleteFormConfig(selectedForm);
      setSaveSuccess(false);
      setShowDeleteTemplateModal(false);
      await loadIEPForms();
    } catch (error) {
      alert(error?.message || 'Failed to delete template');
    } finally {
      setLoading(false);
    }
  };

  const addSection = () => {
    setConfig([...config, { id: generateId(), title: 'New Section', fields: [] }]);
  };

  const removeSection = (idx) => {
    setConfig(config.filter((_, i) => i !== idx));
  };

  const updateSection = (idx, title) => {
    const updated = [...config];
    updated[idx].title = title;
    setConfig(updated);
  };

  const addField = (sectionIdx, type) => {
    const updated = [...config];
    const newField = {
      id: generateId(),
      label: 'New Field',
      type,
      options: type === 'checkbox' ? ['Option 1'] : undefined,
      points: type === 'likert' ? [
        { id: generateId(), value: 1, label: '1' },
        { id: generateId(), value: 2, label: '2' },
        { id: generateId(), value: 3, label: '3' },
        { id: generateId(), value: 4, label: '4' },
        { id: generateId(), value: 5, label: '5' }
      ] : undefined
    };
    updated[sectionIdx].fields.push(newField);
    setConfig(updated);
  };

  const removeField = (sectionIdx, fieldIdx) => {
    const updated = [...config];
    updated[sectionIdx].fields.splice(fieldIdx, 1);
    setConfig(updated);
  };

  const updateFieldLabel = (sectionIdx, fieldIdx, label) => {
    const updated = [...config];
    updated[sectionIdx].fields[fieldIdx].label = label;
    setConfig(updated);
  };

  const updateCheckboxOption = (sectionIdx, fieldIdx, optIdx, value) => {
    const updated = [...config];
    updated[sectionIdx].fields[fieldIdx].options[optIdx] = value;
    setConfig(updated);
  };

  const addCheckboxOption = (sectionIdx, fieldIdx) => {
    const updated = [...config];
    const field = updated[sectionIdx].fields[fieldIdx];
    field.options.push(`Option ${field.options.length + 1}`);
    setConfig(updated);
  };

  const removeCheckboxOption = (sectionIdx, fieldIdx, optIdx) => {
    const updated = [...config];
    updated[sectionIdx].fields[fieldIdx].options.splice(optIdx, 1);
    setConfig(updated);
  };

  const updateLikertPoints = (sectionIdx, fieldIdx, num) => {
    if (!num || isNaN(num)) return;
    const count = Math.max(2, Math.min(10, parseInt(num, 10)));
    const updated = [...config];
    const field = updated[sectionIdx].fields[fieldIdx];
    const existing = field.points || [];
    field.points = Array.from({ length: count }, (_, i) => ({
      id: existing[i]?.id || generateId(),
      value: i + 1,
      label: existing[i]?.label ?? String(i + 1)
    }));
    setConfig(updated);
  };

  const updateLikertPointLabel = (sectionIdx, fieldIdx, ptIdx, label) => {
    const updated = [...config];
    updated[sectionIdx].fields[fieldIdx].points[ptIdx].label = label;
    setConfig(updated);
  };

  const formatTemplateName = (name) => name ? name.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/^./, c => c.toUpperCase()) : name;

  const fieldTypeLabels = { text: 'Text', date: 'Date', number: 'Number', checkbox: 'Checkbox', likert: 'Likert Scale' };
  const fieldTypeIcons = { text: Type, date: Calendar, number: Hash, checkbox: ListChecks, likert: BarChart3 };

  const moveSection = (index, direction) => {
    const target = index + direction;
    if (target < 0 || target >= config.length) return;
    const updated = [...config];
    [updated[index], updated[target]] = [updated[target], updated[index]];
    setConfig(updated);
  };

  const moveField = (sIdx, fIdx, direction) => {
    const target = fIdx + direction;
    if (target < 0 || target >= config[sIdx].fields.length) return;
    const updated = [...config];
    const fields = [...updated[sIdx].fields];
    [fields[fIdx], fields[target]] = [fields[target], fields[fIdx]];
    updated[sIdx] = { ...updated[sIdx], fields };
    setConfig(updated);
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-10">
        <h2 className="font-serif text-2xl text-neutral-900 dark:text-neutral-100 mb-4">IEP Templates</h2>
        <div className="flex items-center gap-2 flex-wrap mb-3">
          {iepForms.map((form) => (
            <button
              key={form.formType}
              onClick={() => handleSelectedFormChange(form.formType)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                selectedForm === form.formType
                  ? 'bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 shadow-sm'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700 hover:text-neutral-700 dark:hover:text-neutral-200'
              }`}
            >
              {formatTemplateName(form.formType)}
            </button>
          ))}
          <button
            onClick={() => setShowCreateTemplateModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-dashed border-neutral-300 dark:border-neutral-600 text-sm text-neutral-400 dark:text-neutral-500 hover:border-neutral-400 dark:hover:border-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            New
          </button>
        </div>
        <p className="text-neutral-400 dark:text-neutral-500 text-sm">
          {config.length} section{config.length !== 1 ? 's' : ''} · {config.reduce((sum, s) => sum + s.fields.length, 0)} fields
        </p>
      </div>

      {/* Sections */}
      <div className="space-y-5">
        {config.map((section, sIdx) => (
          <div key={section.id || sIdx} className="group/section bg-white dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700/50 rounded-2xl overflow-hidden transition-all hover:border-neutral-300 dark:hover:border-neutral-600">
            {/* Section header */}
            <div className="p-5 pb-4">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="w-7 h-7 rounded-full bg-gradient-to-br from-pink-500 to-orange-400 flex items-center justify-center text-xs font-semibold text-white shrink-0">
                    {sIdx + 1}
                  </span>
                  <input
                    type="text"
                    value={section.title}
                    onChange={(e) => updateSection(sIdx, e.target.value)}
                    className="flex-1 bg-transparent border-b border-dashed border-neutral-300 dark:border-neutral-600 outline-none text-base text-neutral-900 dark:text-neutral-100 font-semibold placeholder-neutral-300 dark:placeholder-neutral-600 py-1 hover:border-pink-400 dark:hover:border-pink-500 focus:border-pink-500 dark:focus:border-pink-400 focus:border-solid transition-colors"
                    placeholder="Section title..."
                  />
                </div>
                <div className="flex items-center gap-0.5 opacity-0 group-hover/section:opacity-100 transition-opacity pointer-events-none group-hover/section:pointer-events-auto">
                  <button onClick={() => moveSection(sIdx, -1)} disabled={sIdx === 0} className={`p-1.5 rounded-lg transition-colors ${sIdx === 0 ? "text-neutral-200 dark:text-neutral-700 cursor-not-allowed" : "text-neutral-400 dark:text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-700 hover:text-neutral-600 dark:hover:text-neutral-300"}`} title="Move up">
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <button onClick={() => moveSection(sIdx, 1)} disabled={sIdx === config.length - 1} className={`p-1.5 rounded-lg transition-colors ${sIdx === config.length - 1 ? "text-neutral-200 dark:text-neutral-700 cursor-not-allowed" : "text-neutral-400 dark:text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-700 hover:text-neutral-600 dark:hover:text-neutral-300"}`} title="Move down">
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  <button onClick={() => removeSection(sIdx)} className="p-1.5 rounded-lg text-neutral-400 dark:text-neutral-500 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 dark:hover:text-red-400 transition-colors" title="Delete section">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <p className="text-neutral-400 dark:text-neutral-500 text-xs ml-10">
                {section.fields.length} field{section.fields.length !== 1 ? 's' : ''}
              </p>
            </div>

            {/* Fields */}
            <div className="px-5 pb-3 space-y-3">
              {section.fields.map((field, fIdx) => {
                const FieldIcon = fieldTypeIcons[field.type] || Type;
                return (
                  <div key={field.id || fIdx} className="group/field rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700 p-4 transition-all hover:border-neutral-200 dark:hover:border-neutral-600">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <span className="w-6 h-6 rounded-full bg-white dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 flex items-center justify-center text-[11px] font-semibold text-neutral-400 dark:text-neutral-500 shrink-0">
                          {fIdx + 1}
                        </span>
                        <input
                          type="text"
                          value={field.label}
                          onChange={(e) => updateFieldLabel(sIdx, fIdx, e.target.value)}
                          className="flex-1 bg-transparent border-b border-dashed border-neutral-200 dark:border-neutral-600 outline-none text-sm text-neutral-900 dark:text-neutral-100 font-medium placeholder-neutral-300 dark:placeholder-neutral-600 py-1 hover:border-pink-400 dark:hover:border-pink-500 focus:border-pink-500 dark:focus:border-pink-400 focus:border-solid transition-colors"
                          placeholder="Field label..."
                        />
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium text-neutral-500 dark:text-neutral-400 bg-white dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600">
                          <FieldIcon className="w-3 h-3" />
                          {fieldTypeLabels[field.type]}
                        </span>
                        <div className="flex items-center gap-0.5 opacity-0 group-hover/field:opacity-100 transition-opacity pointer-events-none group-hover/field:pointer-events-auto">
                          <button onClick={() => moveField(sIdx, fIdx, -1)} disabled={fIdx === 0} className={`p-1 rounded-lg transition-colors ${fIdx === 0 ? "text-neutral-200 dark:text-neutral-700 cursor-not-allowed" : "text-neutral-400 dark:text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-700"}`}>
                            <ChevronUp className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => moveField(sIdx, fIdx, 1)} disabled={fIdx === section.fields.length - 1} className={`p-1 rounded-lg transition-colors ${fIdx === section.fields.length - 1 ? "text-neutral-200 dark:text-neutral-700 cursor-not-allowed" : "text-neutral-400 dark:text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-700"}`}>
                            <ChevronDown className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => removeField(sIdx, fIdx)} className="p-1 rounded-lg text-neutral-300 dark:text-neutral-600 hover:text-red-500 dark:hover:text-red-400 transition-colors">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {field.type === 'checkbox' && (
                      <div className="mt-3 ml-9">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-neutral-400 dark:text-neutral-500 uppercase tracking-wide">
                            {(field.options || []).length} option{(field.options || []).length !== 1 ? 's' : ''}
                          </span>
                        </div>
                        <div className="space-y-2">
                          {(field.options || []).map((opt, optIdx) => (
                            <div key={optIdx} className="flex items-center gap-3">
                              <span className="w-5 h-5 rounded border border-neutral-300 dark:border-neutral-600 shrink-0" />
                              <input
                                type="text"
                                value={opt}
                                onChange={(e) => updateCheckboxOption(sIdx, fIdx, optIdx, e.target.value)}
                                className="flex-1 bg-white dark:bg-neutral-700 px-3 py-2 rounded-lg text-sm text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-600 focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-500"
                                placeholder={`Option ${optIdx + 1}`}
                              />
                              <button onClick={() => removeCheckboxOption(sIdx, fIdx, optIdx)} className="p-1 rounded-lg text-neutral-300 dark:text-neutral-600 hover:text-red-500 dark:hover:text-red-400 transition-colors shrink-0">
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                          <button onClick={() => addCheckboxOption(sIdx, fIdx)} className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm font-medium text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-900/20 border border-dashed border-pink-300 dark:border-pink-700 hover:bg-pink-100 dark:hover:bg-pink-900/30 hover:border-pink-400 dark:hover:border-pink-600 transition-colors">
                            <span className="text-lg leading-none">+</span> Add option
                          </button>
                        </div>
                      </div>
                    )}

                    {field.type === 'likert' && (
                      <div className="mt-3 ml-9">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-neutral-400 dark:text-neutral-500 uppercase tracking-wide">
                            {(field.points || []).length}-point scale
                          </span>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min={2}
                              max={10}
                              value={(field.points || []).length || 5}
                              onChange={(e) => updateLikertPoints(sIdx, fIdx, parseInt(e.target.value, 10))}
                              className="w-14 bg-white dark:bg-neutral-700 px-2 py-1 rounded-lg text-xs text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-600 focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-500 text-center"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          {(field.points || []).map((pt, ptIdx) => (
                            <div key={pt.id} className="flex items-center gap-3">
                              <span className="w-6 h-6 rounded-full bg-white dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 flex items-center justify-center text-[11px] font-semibold text-neutral-400 dark:text-neutral-500 shrink-0">
                                {ptIdx + 1}
                              </span>
                              <input
                                type="text"
                                value={pt.label}
                                onChange={(e) => updateLikertPointLabel(sIdx, fIdx, ptIdx, e.target.value)}
                                className="flex-1 bg-white dark:bg-neutral-700 px-3 py-2 rounded-lg text-sm text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-600 focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-500"
                                placeholder="Label"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {field.type === 'text' && (
                      <div className="mt-3 ml-9">
                        <div className="w-full h-8 rounded-lg bg-white dark:bg-neutral-700 border border-dashed border-neutral-200 dark:border-neutral-600 flex items-center px-3">
                          <span className="text-xs text-neutral-300 dark:text-neutral-600 italic">Text input field</span>
                        </div>
                      </div>
                    )}

                    {field.type === 'date' && (
                      <div className="mt-3 ml-9">
                        <div className="w-full h-10 rounded-lg bg-white dark:bg-neutral-700 border border-dashed border-neutral-200 dark:border-neutral-600 flex items-center px-3">
                          <span className="text-xs text-neutral-300 dark:text-neutral-600 italic">Date field</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Add field buttons */}
            <div className="px-5 pb-5">
              <div className="flex items-center gap-2">
                <button onClick={() => addField(sIdx, 'text')} className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-dashed border-neutral-300 dark:border-neutral-600 text-xs text-neutral-500 dark:text-neutral-400 hover:border-neutral-400 dark:hover:border-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all">
                  <Plus className="w-3.5 h-3.5" /> Text
                </button>
                <button onClick={() => addField(sIdx, 'date')} className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-dashed border-neutral-300 dark:border-neutral-600 text-xs text-neutral-500 dark:text-neutral-400 hover:border-neutral-400 dark:hover:border-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all">
                  <Plus className="w-3.5 h-3.5" /> Date
                </button>
                <button onClick={() => addField(sIdx, 'number')} className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-dashed border-neutral-300 dark:border-neutral-600 text-xs text-neutral-500 dark:text-neutral-400 hover:border-neutral-400 dark:hover:border-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all">
                  <Plus className="w-3.5 h-3.5" /> Number
                </button>
                <button onClick={() => addField(sIdx, 'checkbox')} className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-dashed border-neutral-300 dark:border-neutral-600 text-xs text-neutral-500 dark:text-neutral-400 hover:border-neutral-400 dark:hover:border-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all">
                  <Plus className="w-3.5 h-3.5" /> Checkbox
                </button>
                <button onClick={() => addField(sIdx, 'likert')} className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-dashed border-neutral-300 dark:border-neutral-600 text-xs text-neutral-500 dark:text-neutral-400 hover:border-neutral-400 dark:hover:border-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all">
                  <Plus className="w-3.5 h-3.5" /> Likert
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add section */}
      <div className="mt-6">
        <button onClick={addSection} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-neutral-300 dark:border-neutral-600 text-sm text-neutral-500 dark:text-neutral-400 hover:border-neutral-400 dark:hover:border-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all">
          <Plus className="w-4 h-4" />
          Add Section
        </button>
      </div>

      {/* Footer actions */}
      <div className="mt-8 flex items-center justify-between">
        <button
          onClick={() => setShowDeleteTemplateModal(true)}
          disabled={loading || !canDeleteTemplate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Trash2 className="w-4 h-4" />
          Delete Template
        </button>
        <button
          onClick={handleSave}
          disabled={loading}
          className="px-6 py-2.5 text-sm font-medium rounded-xl bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200 shadow-sm transition-all disabled:opacity-50"
        >
          {loading ? <span className="flex items-center gap-2"><InlineSpinner /> Saving...</span> : 'Save Template'}
        </button>
      </div>

      {saveSuccess && (
        <div className="p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-xl text-green-700 dark:text-green-400 text-sm mt-4">
          Configuration saved successfully!
        </div>
      )}

      {showCreateTemplateModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={resetCreateTemplateModal}>
          <div className="bg-white dark:bg-neutral-800 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl border border-neutral-200 dark:border-neutral-700" onClick={e => e.stopPropagation()}>
            <h3 className="font-serif text-lg text-neutral-900 dark:text-neutral-100 mb-1">New Template</h3>
            <p className="text-neutral-400 dark:text-neutral-500 text-sm mb-6">Start from scratch or copy an existing template.</p>
            <div className="space-y-4">
              {templateNameError && (
                <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-sm text-red-800 dark:text-red-400 font-medium">{templateNameError}</p>
                </div>
              )}
              <div>
                <label className="block text-xs font-medium text-neutral-400 dark:text-neutral-500 mb-1.5 uppercase tracking-wide">Name</label>
                <input type="text" value={templateName} onChange={(e) => handleNameChange(e.target.value)} placeholder="e.g. Case History Intake" className="w-full px-3 py-2.5 bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-neutral-100 text-sm focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-400 dark:text-neutral-500 mb-1.5 uppercase tracking-wide">Start From</label>
                <select value={templateStartFrom} onChange={(e) => setTemplateStartFrom(e.target.value)} className="w-full px-3 py-2.5 bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-neutral-100 text-sm focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-500">
                  <option value="blank">Blank Template</option>
                  <option value="copy">Copy Existing Template</option>
                </select>
              </div>
              {templateStartFrom === 'copy' && (
                <div>
                  <label className="block text-xs font-medium text-neutral-400 dark:text-neutral-500 mb-1.5 uppercase tracking-wide">Copy From</label>
                  <select value={templateSource || iepForms[0]?.formType || ''} onChange={(e) => setTemplateSource(e.target.value)} className="w-full px-3 py-2.5 bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-neutral-100 text-sm focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-500">
                    {iepForms.map((form) => (<option key={form.formType} value={form.formType}>{formatTemplateName(form.formType)}</option>))}
                  </select>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={resetCreateTemplateModal} disabled={loading} className="px-4 py-2.5 rounded-xl text-sm text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors disabled:opacity-50">Cancel</button>
              <button onClick={handleCreateTemplate} disabled={loading || !templateName.trim()} className="px-5 py-2.5 text-sm font-medium rounded-xl bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200 shadow-sm transition-all disabled:opacity-40">{loading ? <span className="flex items-center gap-2"><InlineSpinner /> Creating...</span> : 'Create'}</button>
            </div>
          </div>
        </div>
      )}

      {showDeleteTemplateModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setShowDeleteTemplateModal(false)}>
          <div className="bg-white dark:bg-neutral-800 rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl border border-neutral-200 dark:border-neutral-700" onClick={e => e.stopPropagation()}>
            <div className="text-center">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/40 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">Delete Template</h3>
              <p className="text-neutral-500 dark:text-neutral-400 text-sm">Delete <span className="font-medium text-neutral-700 dark:text-neutral-300">"{formatTemplateName(selectedForm)}"</span>? This can't be undone.</p>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowDeleteTemplateModal(false)} disabled={loading} className="flex-1 px-4 py-2.5 rounded-xl text-sm text-neutral-600 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-colors disabled:opacity-50">Cancel</button>
              <button onClick={handleDeleteTemplate} disabled={loading} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-colors disabled:opacity-50">{loading ? <span className="flex items-center justify-center gap-2"><InlineSpinner /> Deleting...</span> : 'Delete'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

};



export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('sessions');
  const [sessions, setSessions] = useState([]);
  const [allData, setAllData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [exportingData, setExportingData] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalAction, setModalAction] = useState(null);
  const [editUserModal, setEditUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editStandardModal, setEditStandardModal] = useState(false);
  const [editingStandard, setEditingStandard] = useState(null);

  useEffect(() => {
    if (user?.role !== 'ADMIN') return;
    loadAllData();
  }, [user]);

  const loadAllData = async () => {
    try {
      const data = await apiClient.exportAllData();
      setAllData(data);
    } catch (error) {
      console.error('Failed to load data:', error);
      // Mock data for demo
      setAllData({
        users: [],
        students: [],
        classrooms: [],
        iedReports: [],
        goals: [],
        standards: []
      });
    }
  };

  const deactivateUser = (userId, isActive) => {
    if (isActive) {
      setModalAction({ type: 'deactivate', target: 'user', id: userId, title: 'Deactivate User', message: 'Are you sure you want to deactivate this user?' });
    } else {
      setModalAction({ type: 'reactivate', target: 'user', id: userId, title: 'Reactivate User', message: 'Are you sure you want to reactivate this user?' });
    }
    setShowModal(true);
  };

  const deleteUser = (userId) => {
    setModalAction({ type: 'delete', target: 'user', id: userId, title: 'Delete User', message: 'Are you sure you want to delete this user? This will also delete all their classrooms, students, goals, and reports. This action cannot be undone.' });
    setShowModal(true);
  };

  const deactivateStudent = (studentId, isActive) => {
    if (isActive) {
      setModalAction({ type: 'deactivate', target: 'student', id: studentId, title: 'Deactivate Student', message: 'Are you sure you want to deactivate this student?' });
    } else {
      setModalAction({ type: 'reactivate', target: 'student', id: studentId, title: 'Reactivate Student', message: 'Are you sure you want to reactivate this student?' });
    }
    setShowModal(true);
  };

  const deleteStudent = (studentId) => {
    setModalAction({ type: 'delete', target: 'student', id: studentId, title: 'Delete Student', message: 'Are you sure you want to delete this student? This will also delete all their goals and reports. This action cannot be undone.' });
    setShowModal(true);
  };

  const deactivateClassroom = (classroomId, isActive) => {
    if (isActive) {
      setModalAction({ type: 'deactivate', target: 'classroom', id: classroomId, title: 'Deactivate Classroom', message: 'Are you sure you want to deactivate this classroom?' });
    } else {
      setModalAction({ type: 'reactivate', target: 'classroom', id: classroomId, title: 'Reactivate Classroom', message: 'Are you sure you want to reactivate this classroom?' });
    }
    setShowModal(true);
  };

  const deleteClassroom = (classroomId) => {
    setModalAction({ type: 'delete', target: 'classroom', id: classroomId, title: 'Delete Classroom', message: 'Are you sure you want to delete this classroom? This action cannot be undone.' });
    setShowModal(true);
  };

  const deactivateReport = (reportId, isActive) => {
    if (isActive) {
      setModalAction({ type: 'deactivate', target: 'report', id: reportId, title: 'Deactivate Report', message: 'Are you sure you want to deactivate this report?' });
    } else {
      setModalAction({ type: 'reactivate', target: 'report', id: reportId, title: 'Reactivate Report', message: 'Are you sure you want to reactivate this report?' });
    }
    setShowModal(true);
  };

  const deleteReport = (reportId) => {
    setModalAction({ type: 'delete', target: 'report', id: reportId, title: 'Delete Report', message: 'Are you sure you want to delete this report? This action cannot be undone.' });
    setShowModal(true);
  };

  const deleteGoal = (goalId) => {
    setModalAction({ type: 'delete', target: 'goal', id: goalId, title: 'Delete Goal', message: 'Are you sure you want to delete this goal? This action cannot be undone.' });
    setShowModal(true);
  };

  const deactivateAllUsers = () => {
    setModalAction({ type: 'deactivate', target: 'allUsers', title: 'Deactivate All Users', message: 'Are you sure you want to deactivate all users?' });
    setShowModal(true);
  };

  const deactivateAllStudents = () => {
    setModalAction({ type: 'deactivate', target: 'allStudents', title: 'Deactivate All Students', message: 'Are you sure you want to deactivate all students?' });
    setShowModal(true);
  };

  const deactivateAllClassrooms = () => {
    setModalAction({ type: 'deactivate', target: 'allClassrooms', title: 'Deactivate All Classrooms', message: 'Are you sure you want to deactivate all classrooms?' });
    setShowModal(true);
  };

  const deactivateAllReports = () => {
    setModalAction({ type: 'deactivate', target: 'allReports', title: 'Deactivate All Reports', message: 'Are you sure you want to deactivate all reports?' });
    setShowModal(true);
  };

  const deleteAllGoals = () => {
    setModalAction({ type: 'delete', target: 'allGoals', title: 'Delete All Goals', message: 'Are you sure you want to delete all goals? This action cannot be undone.' });
    setShowModal(true);
  };

  const handleConfirmAction = async () => {
    if (!modalAction) return;
    
    try {
      setLoading(true);
      const { type, target, id } = modalAction;
      
      if (type === 'deactivate') {
        if (target === 'user') await apiClient.deactivateUser(id);
        else if (target === 'student') await apiClient.deactivateStudent(id);
        else if (target === 'classroom') await apiClient.deactivateClassroom(id);
        else if (target === 'report') await apiClient.deactivateReport(id);
        else if (target === 'allStudents') await apiClient.deactivateAllStudents();
        else if (target === 'allClassrooms') await apiClient.deactivateAllClassrooms();
        else if (target === 'allReports') await apiClient.deactivateAllReports();
      } else if (type === 'reactivate') {
        if (target === 'user') await apiClient.reactivateUser(id);
        else if (target === 'student') await apiClient.reactivateStudent(id);
        else if (target === 'classroom') await apiClient.reactivateClassroom(id);
        else if (target === 'report') await apiClient.reactivateReport(id);
      } else if (type === 'delete') {
        if (target === 'user') await apiClient.deleteUser(id);
        else if (target === 'student') await apiClient.deleteStudent(id);
        else if (target === 'classroom') await apiClient.deleteClassroom(id);
        else if (target === 'report') await apiClient.deleteReport(id);
        else if (target === 'goal') await apiClient.deleteGoal(id);
        else if (target === 'allGoals') await apiClient.deleteAllGoals();
        else if (target === 'standard') await apiClient.deleteStandard(id);
      }
      
      loadAllData();
    } catch (error) {
      alert(`Failed to ${modalAction.type} ${modalAction.target}`);
    } finally {
      setLoading(false);
      setShowModal(false);
      setModalAction(null);
    }
  };

  const exportAllData = async () => {
    setExportingData(true);

    try {
      const XLSX = await import('xlsx');
      const wb = XLSX.utils.book_new();

      if (allData.users?.length) {
        const ws = XLSX.utils.json_to_sheet(allData.users);
        XLSX.utils.book_append_sheet(wb, ws, 'Users');
      }

      if (allData.students?.length) {
        const ws = XLSX.utils.json_to_sheet(allData.students);
        XLSX.utils.book_append_sheet(wb, ws, 'Students');
      }

      if (allData.classrooms?.length) {
        const ws = XLSX.utils.json_to_sheet(allData.classrooms);
        XLSX.utils.book_append_sheet(wb, ws, 'Classrooms');
      }

      if (allData.iedReports?.length) {
        const ws = XLSX.utils.json_to_sheet(allData.iedReports);
        XLSX.utils.book_append_sheet(wb, ws, 'IEP Reports');
      }

      if (allData.goals?.length) {
        const ws = XLSX.utils.json_to_sheet(allData.goals);
        XLSX.utils.book_append_sheet(wb, ws, 'Goals');
      }

      XLSX.writeFile(wb, `iep-pal-data-${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch (error) {
      alert('Failed to export data');
    } finally {
      setExportingData(false);
    }
  };

  if (user?.role !== 'ADMIN') {
    return <div className="p-8 text-center">Access denied. Admin role required.</div>;
  }

  function AdminDashboardSections() {
  return (
      <div className="px-4 sm:px-6 pt-4 pb-3">
        <nav className="flex gap-2">
          {[
            { id: 'sessions', label: 'Users & Accounts' },
            { id: 'roles', label: 'Roles' },
            { id: 'data', label: 'School Data' },
            { id: 'forms', label: 'IEP Template' },
            { id: 'standards', label: 'Standards' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-4 text-sm font-medium rounded-xl transition-all ${
                activeTab === tab.id
                  ? 'bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 shadow-sm'
                  : 'text-neutral-400 dark:text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
    );
  }  

  function Sessions({allData}) {
  const [roleFilter, setRoleFilter] = useState('ALL');
  const roleNames = [...new Set((allData?.users || []).map(u => u.roleRef?.name || u.role).filter(Boolean))];
  const filteredUsers = (allData?.users || []).filter((user) => {
    if (roleFilter === 'ALL') return true;
    return (user.roleRef?.name || user.role) === roleFilter;
  });

  return (
      <div className="overflow-x-auto">
        <div className="flex items-center justify-between gap-3 mb-4">
          <h2 className="font-serif text-xl text-neutral-800 dark:text-neutral-200">Login Sessions</h2>
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">Role</label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 rounded-lg px-3 py-1.5 text-sm text-neutral-700 dark:text-neutral-200 focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-500"
            >
              <option value="ALL">All</option>
              {roleNames.map(name => <option key={name} value={name}>{name}</option>)}
            </select>
          </div>
        </div>
        <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
          <thead className="bg-neutral-50 dark:bg-neutral-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase">Last Login</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-neutral-800 divide-y divide-neutral-200 dark:divide-neutral-700">
            {filteredUsers.length > 0 ? filteredUsers.map(user => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900 dark:text-neutral-100">
                  {user.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500 dark:text-neutral-400">
                  {user.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500 dark:text-neutral-400">
                  {user.roleRef?.name || user.role}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500 dark:text-neutral-400">
                  {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => { setEditingUser(user); setEditUserModal(true); }}
                    className="inline-flex items-center justify-center w-8 h-8 rounded-md text-neutral-500 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                    title="Edit user"
                    aria-label={`Edit ${user.name}`}
                  >
                    <FiEdit2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-neutral-500 dark:text-neutral-400">
                  No users found for selected role
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  }  

  function GetStandards({allData}) {
  const [subjectFilter, setSubjectFilter] = useState('ALL');
  const subjects = Array.from(new Set((allData?.standards || []).map((s) => s.subject).filter(Boolean))).sort((a, b) => a.localeCompare(b));
  const filteredStandards = (allData?.standards || []).filter((standard) => {
    if (subjectFilter === 'ALL') return true;
    return standard.subject === subjectFilter;
  });

  return (
      <div className="overflow-x-auto">
        <div className="flex items-center justify-between gap-3 mb-4">
          <h2 className="font-serif text-xl text-neutral-800 dark:text-neutral-200">Standards</h2>
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">Subject</label>
            <select
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              className="border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 rounded-lg px-3 py-1.5 text-sm text-neutral-700 dark:text-neutral-200 focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-500"
            >
              <option value="ALL">All Subjects</option>
              {subjects.map((subject) => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </select>
          </div>
        </div>
        <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
          <thead className="bg-neutral-50 dark:bg-neutral-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase">Subject</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase">Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-neutral-800 divide-y divide-neutral-200 dark:divide-neutral-700">
            {filteredStandards.length > 0 ? filteredStandards.map(standard => (
              <tr key={standard.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900 dark:text-neutral-100">
                  {standard.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500 dark:text-neutral-400">
                  {standard.subject}
                </td>
                <td className="px-6 py-4 text-sm text-neutral-500 dark:text-neutral-400 max-w-xl">
                  <p className="line-clamp-3 whitespace-pre-wrap">{standard.description}</p>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setEditingStandard(standard);
                        setEditStandardModal(true);
                      }}
                      className="inline-flex items-center justify-center w-8 h-8 rounded-md text-neutral-500 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                      title="Edit standard"
                      aria-label={`Edit ${standard.name}`}
                    >
                      <FiEdit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteStandard(standard.id)}
                      className="inline-flex items-center justify-center w-8 h-8 rounded-md text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                      title="Delete standard"
                      aria-label={`Delete ${standard.name}`}
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="4" className="px-6 py-4 text-center text-neutral-500 dark:text-neutral-400">
                  No standards found for selected subject
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  }  

  const deleteStandard = (standardId) => {
    setModalAction({ type: 'delete', target: 'standard', id: standardId, title: 'Delete Standard', message: 'Are you sure you want to delete this standard? This action cannot be undone.' });
    setShowModal(true);
  };

  function SchoolData() {
    const [selectedTeacherId, setSelectedTeacherId] = useState(null);
    const [selectedClassroomId, setSelectedClassroomId] = useState(null);
    const [selectedStudentId, setSelectedStudentId] = useState(null);

    const users = allData?.users || [];
    const classrooms = allData?.classrooms || [];
    const students = allData?.students || [];
    const reports = allData?.iedReports || [];
    const goals = allData?.goals || [];

    const teachers = users.filter(u => (u.role || '').toUpperCase() === 'TEACHER');

    const selectedTeacher = selectedTeacherId ? users.find(u => u.id === selectedTeacherId) : null;

    const teacherClassrooms = selectedTeacherId
      ? classrooms.filter(c => c.teacherId === selectedTeacherId || c.teacher?.id === selectedTeacherId)
      : [];

    const selectedClassroom = selectedClassroomId ? classrooms.find(c => c.id === selectedClassroomId) : null;

    const classroomStudents = selectedClassroomId
      ? students.filter(s => s.classroomId === selectedClassroomId)
      : [];

    const selectedStudent = selectedStudentId ? students.find(s => s.id === selectedStudentId) : null;

    const studentGoals = selectedStudentId
      ? goals.filter(g => g.studentId === selectedStudentId)
      : [];

    const studentReports = selectedStudentId
      ? reports.filter(r => r.studentId === selectedStudentId)
      : [];

    // Helpers to count data for teacher cards
    const getTeacherClassrooms = (teacherId) =>
      classrooms.filter(c => c.teacherId === teacherId || c.teacher?.id === teacherId);

    const getTeacherStudents = (teacherId) => {
      const teacherClassroomIds = getTeacherClassrooms(teacherId).map(c => c.id);
      return students.filter(s => teacherClassroomIds.includes(s.classroomId));
    };

    const getStudentGoalCount = (studentId) => goals.filter(g => g.studentId === studentId).length;
    const getStudentReportCount = (studentId) => reports.filter(r => r.studentId === studentId).length;

    // Determine current drill-down level
    const level = selectedStudentId ? 3 : selectedClassroomId ? 2 : selectedTeacherId ? 1 : 0;

    // Breadcrumb — only shown when drilled in (level > 0)
    const Breadcrumb = () => {
      if (level === 0) return null;
      const crumbs = [{ label: 'All Teachers', onClick: () => { setSelectedTeacherId(null); setSelectedClassroomId(null); setSelectedStudentId(null); } }];
      if (selectedTeacher) {
        crumbs.push({ label: selectedTeacher.name, onClick: level > 1 ? () => { setSelectedClassroomId(null); setSelectedStudentId(null); } : null });
      }
      if (selectedClassroom) {
        crumbs.push({ label: selectedClassroom.name, onClick: level > 2 ? () => { setSelectedStudentId(null); } : null });
      }
      if (selectedStudent) {
        crumbs.push({ label: selectedStudent.name, onClick: null });
      }
      return (
        <nav className="flex items-center flex-wrap gap-1 text-sm mb-4">
          {crumbs.map((crumb, i) => (
            <span key={i} className="flex items-center gap-1">
              {i > 0 && <span className="text-neutral-400 dark:text-neutral-500 mx-1">&gt;</span>}
              {crumb.onClick ? (
                <button onClick={crumb.onClick} className="text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors">
                  {crumb.label}
                </button>
              ) : (
                <span className="text-neutral-800 dark:text-neutral-200 font-medium">{crumb.label}</span>
              )}
            </span>
          ))}
        </nav>
      );
    };

    // Shared table header cell class
    const thClass = "px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase";
    const tdClass = "px-6 py-4 whitespace-nowrap text-sm text-neutral-500 dark:text-neutral-400";
    const tdBoldClass = "px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900 dark:text-neutral-100";

    // Empty state helper
    const EmptyState = ({ message, colSpan }) => (
      <tr>
        <td colSpan={colSpan} className="px-6 py-8 text-center text-neutral-500 dark:text-neutral-400 text-sm">
          {message}
        </td>
      </tr>
    );

    // ── Level 0: Overview ──
    const OverviewView = () => {
      const totalTeachers = teachers.length;
      const totalClassrooms = classrooms.length;
      const totalStudents = students.length;
      const totalReports = reports.length;
      const totalGoals = goals.length;

      const statCards = [
        { label: 'Teachers', value: totalTeachers },
        { label: 'Classrooms', value: totalClassrooms },
        { label: 'Students', value: totalStudents },
        { label: 'Reports', value: totalReports },
        { label: 'Goals', value: totalGoals },
      ];

      return (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-serif text-lg text-neutral-800 dark:text-neutral-200">School Overview</h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">Click a teacher to drill down into their data.</p>
            </div>
            <button
              onClick={exportAllData}
              disabled={exportingData}
              className="bg-neutral-800 text-white px-4 py-2 text-sm rounded-lg hover:bg-neutral-900 transition-colors disabled:opacity-60 disabled:cursor-not-allowed dark:bg-neutral-200 dark:text-neutral-900 dark:hover:bg-neutral-300"
            >
              {exportingData ? 'Exporting...' : 'Export All Data'}
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {statCards.map(stat => (
              <div key={stat.label} className="bg-neutral-50 dark:bg-neutral-700/40 p-4 rounded-xl">
                <p className="text-xs text-neutral-500 dark:text-neutral-400 uppercase">{stat.label}</p>
                <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mt-1">{stat.value}</p>
              </div>
            ))}
          </div>

          {teachers.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {teachers.map(teacher => {
                const tClassrooms = getTeacherClassrooms(teacher.id);
                const tStudents = getTeacherStudents(teacher.id);
                return (
                  <div
                    key={teacher.id}
                    onClick={() => setSelectedTeacherId(teacher.id)}
                    className="card-hover bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-5 hover:shadow-lg transition-all duration-300 cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-orange-400 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                        {teacher.name?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 text-sm truncate">{teacher.name}</h4>
                        <p className="text-xs text-neutral-400 dark:text-neutral-500 truncate">{teacher.email}</p>
                      </div>
                    </div>
                    <div className="flex gap-4 text-xs text-neutral-500 dark:text-neutral-400">
                      <span><strong className="text-neutral-700 dark:text-neutral-300">{tClassrooms.length}</strong> classrooms</span>
                      <span><strong className="text-neutral-700 dark:text-neutral-300">{tStudents.length}</strong> students</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-8 text-center">
              <p className="text-neutral-500 dark:text-neutral-400 text-sm">No teachers found</p>
            </div>
          )}
        </div>
      );
    };

    // ── Level 1: Teacher View ──
    const TeacherView = () => {
      if (!selectedTeacher) return null;
      return (
        <div className="space-y-6">
          <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-serif text-lg text-neutral-800 dark:text-neutral-200">{selectedTeacher.name}</h3>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">{selectedTeacher.email}</p>
                <div className="flex gap-4 mt-2 text-xs text-neutral-500 dark:text-neutral-400">
                  <span>Role: {selectedTeacher.role}</span>
                  <span>Joined: {new Date(selectedTeacher.createdAt).toLocaleDateString()}</span>
                  {selectedTeacher.lastLogin && <span>Last login: {new Date(selectedTeacher.lastLogin).toLocaleDateString()}</span>}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {selectedTeacher.role !== 'ADMIN' ? (
                  <>
                    <button
                      onClick={() => deactivateUser(selectedTeacher.id, selectedTeacher.isActive)}
                      className={selectedTeacher.isActive ? "text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-100 text-sm" : "text-neutral-600 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-neutral-100 text-sm"}
                    >
                      {selectedTeacher.isActive ? 'Deactivate' : 'Reactivate'}
                    </button>
                    <button onClick={() => deleteUser(selectedTeacher.id)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 text-sm">
                      Delete
                    </button>
                  </>
                ) : (
                  <span className="text-neutral-400 dark:text-neutral-500 text-sm">Protected</span>
                )}
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-serif text-base text-neutral-800 dark:text-neutral-200 mb-3">Classrooms ({teacherClassrooms.length})</h4>
            {teacherClassrooms.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {teacherClassrooms.map(classroom => {
                  const cStudents = students.filter(s => s.classroomId === classroom.id);
                  return (
                    <div
                      key={classroom.id}
                      onClick={() => setSelectedClassroomId(classroom.id)}
                      className="card-hover bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-5 hover:shadow-lg transition-all duration-300 cursor-pointer"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-neutral-900 dark:text-neutral-100">{classroom.name}</h4>
                        <span className={`inline-block w-2 h-2 rounded-full ${classroom.isActive ? 'bg-green-500' : 'bg-neutral-300 dark:bg-neutral-600'}`} />
                      </div>
                      <div className="text-xs text-neutral-500 dark:text-neutral-400">
                        <span><strong className="text-neutral-700 dark:text-neutral-300">{cStudents.length}</strong> students</span>
                      </div>
                      <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-2">Created {new Date(classroom.createdAt).toLocaleDateString()}</p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-8 text-center">
                <p className="text-neutral-500 dark:text-neutral-400 text-sm">No classrooms yet</p>
              </div>
            )}
          </div>
        </div>
      );
    };

    // ── Level 2: Classroom View ──
    const ClassroomView = () => {
      if (!selectedClassroom) return null;
      return (
        <div className="space-y-6">
          <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-serif text-lg text-neutral-800 dark:text-neutral-200">{selectedClassroom.name}</h3>
                <div className="flex gap-4 mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                  <span>Teacher: {selectedClassroom.teacher?.name || 'N/A'}</span>
                  <span>Created: {new Date(selectedClassroom.createdAt).toLocaleDateString()}</span>
                  <span className={`${selectedClassroom.isActive ? 'text-green-600 dark:text-green-400' : 'text-neutral-400'}`}>
                    {selectedClassroom.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => deactivateClassroom(selectedClassroom.id, selectedClassroom.isActive)}
                  className={selectedClassroom.isActive ? "text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-100 text-sm" : "text-neutral-600 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-neutral-100 text-sm"}
                >
                  {selectedClassroom.isActive ? 'Deactivate' : 'Reactivate'}
                </button>
                <button onClick={() => deleteClassroom(selectedClassroom.id)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 text-sm">
                  Delete
                </button>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-serif text-base text-neutral-800 dark:text-neutral-200 mb-3">Students ({classroomStudents.length})</h4>
            <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl overflow-x-auto">
              <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
                <thead className="bg-neutral-50 dark:bg-neutral-800">
                  <tr>
                    <th className={thClass}>Name</th>
                    <th className={thClass}>Grade</th>
                    <th className={thClass}>Goals</th>
                    <th className={thClass}>Reports</th>
                    <th className={thClass}>Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-neutral-800 divide-y divide-neutral-200 dark:divide-neutral-700">
                  {classroomStudents.length > 0 ? classroomStudents.map(student => (
                    <tr
                      key={student.id}
                      onClick={() => setSelectedStudentId(student.id)}
                      className="hover:bg-neutral-50 dark:hover:bg-neutral-700/50 cursor-pointer transition-colors"
                    >
                      <td className={tdBoldClass}>{student.name}</td>
                      <td className={tdClass}>{student.level || 'N/A'}</td>
                      <td className={tdClass}>{getStudentGoalCount(student.id)}</td>
                      <td className={tdClass}>{getStudentReportCount(student.id)}</td>
                      <td className={tdClass}>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${student.isActive ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-400'}`}>
                          {student.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  )) : (
                    <EmptyState message="No students in this classroom" colSpan={5} />
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      );
    };

    // ── Level 3: Student View ──
    const StudentView = () => {
      if (!selectedStudent) return null;
      return (
        <div className="space-y-6">
          <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-serif text-lg text-neutral-800 dark:text-neutral-200">{selectedStudent.name}</h3>
                <div className="flex gap-4 mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                  <span>Grade: {selectedStudent.level || 'N/A'}</span>
                  <span>Classroom: {selectedStudent.classroom?.name || 'N/A'}</span>
                  <span>Created: {new Date(selectedStudent.createdAt).toLocaleDateString()}</span>
                  <span className={`${selectedStudent.isActive ? 'text-green-600 dark:text-green-400' : 'text-neutral-400'}`}>
                    {selectedStudent.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => deactivateStudent(selectedStudent.id, selectedStudent.isActive)}
                  className={selectedStudent.isActive ? "text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-100 text-sm" : "text-neutral-600 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-neutral-100 text-sm"}
                >
                  {selectedStudent.isActive ? 'Deactivate' : 'Reactivate'}
                </button>
                <button onClick={() => deleteStudent(selectedStudent.id)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 text-sm">
                  Delete
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Goals */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-serif text-base text-neutral-800 dark:text-neutral-200">Goals ({studentGoals.length})</h4>
              </div>
              <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl overflow-x-auto">
                <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
                  <thead className="bg-neutral-50 dark:bg-neutral-800">
                    <tr>
                      <th className={thClass}>Title</th>
                      <th className={thClass}>Skill</th>
                      <th className={thClass}>Status</th>
                      <th className={thClass}>Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-neutral-800 divide-y divide-neutral-200 dark:divide-neutral-700">
                    {studentGoals.length > 0 ? studentGoals.map(goal => (
                      <tr key={goal.id}>
                        <td className={tdBoldClass}>{goal.title}</td>
                        <td className={tdClass}>{goal.skill || 'N/A'}</td>
                        <td className={tdClass}>
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300">
                            {goal.status || 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button onClick={() => deleteGoal(goal.id)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    )) : (
                      <EmptyState message="No goals yet" colSpan={4} />
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Reports */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-serif text-base text-neutral-800 dark:text-neutral-200">Reports ({studentReports.length})</h4>
              </div>
              <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl overflow-x-auto">
                <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
                  <thead className="bg-neutral-50 dark:bg-neutral-800">
                    <tr>
                      <th className={thClass}>Type</th>
                      <th className={thClass}>Version</th>
                      <th className={thClass}>Status</th>
                      <th className={thClass}>Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-neutral-800 divide-y divide-neutral-200 dark:divide-neutral-700">
                    {studentReports.length > 0 ? studentReports.map(report => (
                      <tr key={report.id}>
                        <td className={tdBoldClass}>{report.type}</td>
                        <td className={tdClass}>{report.version}</td>
                        <td className={tdClass}>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${report.isActive ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-400'}`}>
                            {report.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => deactivateReport(report.id, report.isActive)}
                              className={report.isActive ? "text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-100" : "text-neutral-600 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-neutral-100"}
                            >
                              <FiEdit2 className="w-4 h-4" />
                            </button>
                            <button onClick={() => deleteReport(report.id)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">
                              <FiTrash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )) : (
                      <EmptyState message="No reports yet" colSpan={4} />
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      );
    };

    return (
      <div>
        <Breadcrumb />
        {level === 0 && <OverviewView />}
        {level === 1 && <TeacherView />}
        {level === 2 && <ClassroomView />}
        {level === 3 && <StudentView />}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafaf9] dark:bg-neutral-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 sm:mb-10 pt-6 sm:pt-10">
          <div>
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-6xl text-neutral-900 dark:text-neutral-100">Admin</h1>
            <p className="mt-2 text-neutral-400 dark:text-neutral-500 text-base font-light">Manage users, data, templates, and standards</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="flex items-center justify-center w-9 h-9 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-100 hover:border-neutral-400 dark:hover:border-neutral-500 hover:shadow-sm transition-all"
              title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            >
              {theme === 'dark' ? <FiSun className="w-4 h-4" /> : <FiMoon className="w-4 h-4" />}
            </button>
            <button
              onClick={logout}
              className="flex items-center space-x-2 px-3 py-2 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-600 dark:text-neutral-300 hover:text-neutral-800 dark:hover:text-neutral-100 hover:border-neutral-400 dark:hover:border-neutral-500 hover:shadow-sm transition-all text-sm"
            >
              <FiLogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700">
          <AdminDashboardSections />

          <div className="p-6">
            {activeTab === 'sessions' && (
              <div key="sessions" className="animate-[fadeIn_0.3s_ease-out]">
                <RegisterUserForm onSuccess={loadAllData} />
                <Sessions allData={allData} />
              </div>
            )}

            {activeTab === 'forms' && (
              <div key="forms" className="animate-[fadeIn_0.3s_ease-out]">
                <FormCustomization />
              </div>
            )}

            {activeTab === 'data' && (
              <div key="data" className="animate-[fadeIn_0.3s_ease-out]">
                <SchoolData />
              </div>
            )}

            {activeTab === 'roles' && (
              <div key="roles" className="animate-[fadeIn_0.3s_ease-out]">
                <RolesManager />
              </div>
            )}

            {activeTab === 'standards' && (
              <div key="standards" className="animate-[fadeIn_0.3s_ease-out]">
                <StandardForm onSuccess={loadAllData}/>
                <GetStandards allData={allData} />
              </div>
            )}

          </div>
        </div>
      </div>

      {showModal && modalAction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-neutral-800 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <h3 className="font-serif text-lg text-neutral-900 dark:text-neutral-100 mb-4">{modalAction.title}</h3>
            <p className="text-neutral-500 dark:text-neutral-400 text-sm mb-6">{modalAction.message}</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-neutral-600 dark:text-neutral-300 border border-neutral-300 dark:border-neutral-600 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-700 text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAction}
                disabled={loading}
                className={`px-4 py-2 text-white text-sm rounded-lg transition-colors ${
                  modalAction.type === 'delete'
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-neutral-800 hover:bg-neutral-900 dark:bg-neutral-200 dark:text-neutral-900 dark:hover:bg-neutral-300'
                } disabled:opacity-50`}
              >
                {loading ? <span className="flex items-center justify-center gap-2"><InlineSpinner /> Processing...</span> : modalAction.type === 'delete' ? 'Delete' : modalAction.type === 'reactivate' ? 'Reactivate' : 'Deactivate'}
              </button>
            </div>
          </div>
        </div>
      )}

      {editUserModal && editingUser && (
        <EditUserModal
          isOpen={editUserModal}
          onClose={() => { setEditUserModal(false); setEditingUser(null); }}
          user={editingUser}
          onSuccess={() => { loadAllData(); setEditUserModal(false); setEditingUser(null); }}
        />
      )}
      {editStandardModal && editingStandard && (
        <EditStandardModal
          isOpen={editStandardModal}
          onClose={() => { setEditStandardModal(false); setEditingStandard(null); }}
          standard={editingStandard}
          onSuccess={() => { loadAllData(); setEditStandardModal(false); setEditingStandard(null); }}
        />
      )}

    </div>
  );
}

const LOGIN_VIEWS = [
  { value: 'ADMIN', label: 'Admin Dashboard', desc: 'Full admin panel with user management, templates, and data' },
  { value: 'TEACHER', label: 'Teacher View', desc: 'Classrooms, students, IEPs, goals, and strategies' },
  { value: 'PARENT', label: 'Parent View', desc: 'View-only access to their child\'s profile and progress' },
  { value: 'STUDENT', label: 'Student View', desc: 'Personal profile with their own goals and IEPs' },
];

const PERMISSION_RESOURCES = [
  { key: 'roles', label: 'Manage Roles & Permissions', adminOnly: true },
  { key: 'classes', label: 'Create/Manage Classes or View Only' },
  { key: 'studentProfiles', label: 'Create/Manage Student Profiles or View Only' },
  { key: 'ieps', label: 'Fill up IEPs or View IEPs Only' },
  { key: 'documents', label: 'Upload Documents from Google Drive or View Only' },
  { key: 'goals', label: 'Create Goals or View Goals Only' },
  { key: 'meetingNotes', label: 'Create/Manage Meeting Notes or View Only' },
  { key: 'strategies', label: 'Assign Strategies to Students or View Only' },
];


const RolesManager = () => {
  const [roles, setRoles] = useState([]);
  const [selectedRoleId, setSelectedRoleId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [editName, setEditName] = useState('');
  const [editType, setEditType] = useState('TEACHER');
  const [editPerms, setEditPerms] = useState({});
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleType, setNewRoleType] = useState('TEACHER');
  const [newRolePreset, setNewRolePreset] = useState('blank');

  useEffect(() => { loadRoles(); }, []);

  const loadRoles = async () => {
    try {
      const data = await apiClient.getRoles();
      setRoles(data);
      if (!selectedRoleId && data.length > 0) selectRole(data[0]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const selectRole = (role) => {
    setSelectedRoleId(role.id);
    setEditName(role.name);
    setEditType(role.type);
    const perms = typeof role.permissions === 'string' ? JSON.parse(role.permissions) : role.permissions;
    setEditPerms(perms);
    setError(null);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSaveSuccess(false);
    try {
      await apiClient.updateRole(selectedRoleId, {
        name: editName,
        type: editType,
        permissions: editPerms
      });
      await loadRoles();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCreate = async () => {
    if (!newRoleName.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const key = newRoleName.trim().toUpperCase().replace(/\s+/g, '_');
      const defaultPerms = {};
      PERMISSION_RESOURCES.forEach(r => {
        defaultPerms[r.key] = newRolePreset === 'all' ? 'manage' : newRolePreset === 'view' ? 'view' : 'none';
      });
      const created = await apiClient.createRole({
        name: newRoleName.trim(),
        key,
        type: newRoleType,
        permissions: defaultPerms
      });
      setShowCreateModal(false);
      setNewRoleName('');
      setNewRoleType('TEACHER');
      setNewRolePreset('blank');
      await loadRoles();
      selectRole(created);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    const role = roles.find(r => r.id === selectedRoleId);
    if (!role || role.isSystem) return;
    if (!confirm(`Delete role "${role.name}"? This cannot be undone.`)) return;
    try {
      await apiClient.deleteRole(selectedRoleId);
      setSelectedRoleId(null);
      await loadRoles();
    } catch (err) {
      setError(err.message);
    }
  };

  const setPermLevel = (resource, level) => {
    setEditPerms(prev => ({ ...prev, [resource]: level }));
  };

  const selectedRole = roles.find(r => r.id === selectedRoleId);

  if (loading) return <InlineSpinner />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-serif text-xl text-neutral-800 dark:text-neutral-200">Roles & Permissions</h2>
          <p className="text-sm text-neutral-400 dark:text-neutral-500 mt-1">Configure what each role can access</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-neutral-800 dark:bg-neutral-200 text-white dark:text-neutral-900 rounded-lg text-sm font-medium hover:bg-neutral-900 dark:hover:bg-neutral-300 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Role
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      <div className="flex gap-6">
        <div className="w-56 shrink-0 space-y-1">
          {roles.map(role => (
            <button
              key={role.id}
              onClick={() => selectRole(role)}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors flex items-center justify-between ${
                selectedRoleId === role.id
                  ? 'bg-neutral-800 dark:bg-neutral-200 text-white dark:text-neutral-900'
                  : 'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700'
              }`}
            >
              <span className="truncate">{role.name}</span>
              <span className={`text-xs px-1.5 py-0.5 rounded ${
                selectedRoleId === role.id
                  ? 'bg-white/20 dark:bg-black/20'
                  : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-400 dark:text-neutral-500'
              }`}>{role.userCount}</span>
            </button>
          ))}
        </div>

        {selectedRole && (
          <div className="flex-1 min-w-0">
            <div className="bg-neutral-50 dark:bg-neutral-800/50 rounded-xl border border-neutral-200 dark:border-neutral-700 p-5">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1.5 uppercase tracking-wider">Role Name</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-neutral-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1.5 uppercase tracking-wider">Login View</label>
                  <select
                    value={editType}
                    onChange={(e) => setEditType(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-neutral-400"
                  >
                    {LOGIN_VIEWS.map(v => <option key={v.value} value={v.value}>{v.label}</option>)}
                  </select>
                  <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">{LOGIN_VIEWS.find(v => v.value === editType)?.desc}</p>
                </div>
              </div>

              <label className="block text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-3 uppercase tracking-wider">Permissions</label>
              <div className="space-y-1.5">
                {PERMISSION_RESOURCES.map(resource => {
                  const isAdminOnly = resource.adminOnly;
                  const isAdminRole = selectedRole?.type === 'ADMIN';
                  const locked = isAdminOnly && !isAdminRole;
                  const lockedManage = isAdminOnly && isAdminRole;
                  const current = lockedManage ? 'manage' : locked ? 'none' : (editPerms[resource.key] || 'none');
                  const levels = ['none', 'view', 'manage'];
                  const activeIndex = levels.indexOf(current);

                  return (
                    <div key={resource.key} className={`flex items-center justify-between py-3 px-4 rounded-xl border ${
                      locked ? 'bg-neutral-50 dark:bg-neutral-800/40 border-neutral-100 dark:border-neutral-700/50 opacity-50' : 'bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700'
                    }`}>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-neutral-700 dark:text-neutral-300 font-medium">{resource.label}</span>
                        {isAdminOnly && <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 px-1.5 py-0.5 rounded">Admin Only</span>}
                      </div>
                      <div className="relative inline-grid grid-cols-3 bg-neutral-100 dark:bg-neutral-700/80 rounded-lg p-1">
                        <div
                          className={`absolute top-1 bottom-1 w-[calc((100%-8px)/3)] rounded-md shadow-sm transition-all duration-200 ease-out ${
                            current === 'manage' ? 'bg-green-600' : current === 'view' ? 'bg-blue-600' : 'bg-neutral-500'
                          }`}
                          style={{ left: `calc(4px + ${activeIndex} * (100% - 8px) / 3)` }}
                        />
                        {levels.map(level => (
                          <button
                            key={level}
                            onClick={() => !locked && !lockedManage && setPermLevel(resource.key, level)}
                            disabled={locked || lockedManage}
                            className={`relative z-10 text-center px-5 py-1.5 rounded-md text-xs font-semibold transition-colors duration-200 ${
                              current === level
                                ? 'text-white'
                                : 'text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300'
                            } disabled:cursor-not-allowed`}
                          >
                            {level === 'none' ? 'None' : level === 'view' ? 'View' : 'Manage'}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between mt-6">
                {!selectedRole.isSystem ? (
                  <button
                    onClick={handleDelete}
                    disabled={selectedRole.userCount > 0}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    title={selectedRole.userCount > 0 ? 'Reassign users before deleting' : ''}
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Role
                  </button>
                ) : <div />}
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${
                    saveSuccess
                      ? 'bg-green-600 text-white'
                      : 'bg-neutral-800 dark:bg-neutral-200 text-white dark:text-neutral-900 hover:bg-neutral-900 dark:hover:bg-neutral-300'
                  }`}
                >
                  {saving ? <span className="flex items-center gap-2"><InlineSpinner /> Saving...</span> : saveSuccess ? 'Saved!' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowCreateModal(false)}>
          <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-lg max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="p-5 border-b border-neutral-200 dark:border-neutral-700">
              <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200">Create New Role</h3>
              <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">Name your role anything you like and choose what users see when they log in.</p>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1.5">Role Name</label>
                <input
                  type="text"
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  placeholder="e.g. Teaching Assistant"
                  className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-neutral-400"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1.5">Login View</label>
                <p className="text-xs text-neutral-400 dark:text-neutral-500 mb-2">Which screen users with this role see after logging in</p>
                <div className="space-y-1.5">
                  {LOGIN_VIEWS.map(v => (
                    <label key={v.value} className={`flex items-start gap-3 p-2.5 rounded-lg border cursor-pointer transition-colors ${
                      newRoleType === v.value
                        ? 'border-neutral-800 dark:border-neutral-200 bg-neutral-50 dark:bg-neutral-700/50'
                        : 'border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700/30'
                    }`}>
                      <input type="radio" name="loginView" value={v.value} checked={newRoleType === v.value} onChange={(e) => setNewRoleType(e.target.value)} className="mt-0.5" />
                      <div>
                        <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">{v.label}</span>
                        <p className="text-xs text-neutral-400 dark:text-neutral-500">{v.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1.5">Starting Permissions</label>
                <div className="flex bg-neutral-100 dark:bg-neutral-700/80 rounded-full p-[3px] gap-[2px]">
                  {[
                    { value: 'blank', label: 'Clean Slate' },
                    { value: 'view', label: 'All View' },
                    { value: 'all', label: 'All Manage' },
                  ].map(p => (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => setNewRolePreset(p.value)}
                      className={`flex-1 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                        newRolePreset === p.value
                          ? 'bg-neutral-800 dark:bg-neutral-200 text-white dark:text-neutral-900 shadow-sm'
                          : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1.5">
                  {newRolePreset === 'blank' ? 'No permissions — configure everything after creation' : newRolePreset === 'view' ? 'View-only access to everything' : 'Full manage access to everything'}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-neutral-200 dark:border-neutral-700">
              <button onClick={() => setShowCreateModal(false)} className="px-4 py-2 bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 rounded-lg text-sm font-medium hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-colors">Cancel</button>
              <button onClick={handleCreate} disabled={saving || !newRoleName.trim()} className="px-4 py-2 bg-neutral-800 dark:bg-neutral-200 text-white dark:text-neutral-900 rounded-lg text-sm font-medium hover:bg-neutral-900 dark:hover:bg-neutral-300 transition-colors disabled:opacity-40">{saving ? 'Creating...' : 'Create Role'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const RegisterUserForm = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    roleId: '',
    studentId: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [roles, setRoles] = useState([]);
  const [unlinkedStudents, setUnlinkedStudents] = useState([]);

  useEffect(() => {
    apiClient.getRoles().then(setRoles).catch(() => setRoles([]));
  }, []);

  const selectedRole = roles.find(r => r.id === parseInt(formData.roleId));

  useEffect(() => {
    if (selectedRole?.type === 'STUDENT') {
      apiClient.getUnlinkedStudents().then(setUnlinkedStudents).catch(() => setUnlinkedStudents([]));
    }
  }, [selectedRole?.type]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      await apiClient.registerUser({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        roleId: formData.roleId ? parseInt(formData.roleId) : undefined,
        role: selectedRole?.type || 'TEACHER',
        studentId: selectedRole?.type === 'STUDENT' ? formData.studentId : undefined
      });
      setSuccess(true);
      onSuccess();
    } catch (err) {
      setError(err.message || 'Failed to register user');
    } finally {
      setFormData({ name: '', email: '', password: '', confirmPassword: '', roleId: '', studentId: '' });
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} autoComplete="off">
      {error && <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg text-sm">{error}</div>}
      {success && <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg text-sm">User registered successfully!</div>}
      <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-6 mb-6">

        <h3 className="font-serif text-lg text-neutral-800 dark:text-neutral-200 mb-4">Register New User</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4">
          <input
            type="text"
            placeholder="Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg text-sm focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-500 dark:bg-neutral-800 dark:text-neutral-100"
            autoComplete="off"
            required
          />
          <input
            type="text"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg text-sm focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-500 dark:bg-neutral-800 dark:text-neutral-100"
            autoComplete="off"
            required
          />
          <select
            value={formData.roleId}
            onChange={(e) => setFormData({ ...formData, roleId: e.target.value })}
            className="px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg text-sm focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-500 dark:bg-neutral-800 dark:text-neutral-100"
            required
          >
            <option value="">Select Role</option>
            {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
          <input
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg text-sm focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-500 dark:bg-neutral-800 dark:text-neutral-100"
            autoComplete="new-password"
            required
          />
          <input
            type="password"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            className="px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg text-sm focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-500 dark:bg-neutral-800 dark:text-neutral-100"
            autoComplete="new-password"
            required
          />
        </div>
        <button
          type="submit"
          className="mt-4 bg-neutral-800 text-white px-5 py-2 text-sm rounded-lg hover:bg-neutral-900 transition-colors disabled:opacity-50 dark:bg-neutral-200 dark:text-neutral-900 dark:hover:bg-neutral-300"
          disabled={loading}>
          {loading ? <span className="flex items-center justify-center gap-2"><InlineSpinner /> Registering...</span> : 'Register'}
        </button>
      </div>
    </form>
  );
};

const StandardForm = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      await apiClient.addStandard({
        name: formData.name,
        subject: formData.subject,
        description: formData.description,
      });
      setSuccess(true);
      setFormData({ name: '', subject: '', description: '' });
      onSuccess();
    } catch (err) {
      setError(err.message || 'Failed to save standard');
    } finally {
      setLoading(false);
    }
    
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg text-sm">{error}</div>}
      {success && <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg text-sm">Standard Added successfully!</div>}
      <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-6 mb-6">

        <h3 className="font-serif text-lg text-neutral-800 dark:text-neutral-200 mb-4">Add New Standard</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <input
            type="text"
            placeholder="Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg text-sm focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-500 dark:bg-neutral-800 dark:text-neutral-100"
            required
          />
          <input
            type="text"
            placeholder="Subject"
            value={formData.subject}
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            className="px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg text-sm focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-500 dark:bg-neutral-800 dark:text-neutral-100"
            required
          />
          <textarea
            placeholder="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={4}
            className="sm:col-span-2 lg:col-span-3 px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg text-sm focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-500 dark:bg-neutral-800 dark:text-neutral-100 resize-y"
          />
        </div>
        <button
          type="submit"
          className="mt-4 bg-neutral-800 text-white px-5 py-2 text-sm rounded-lg hover:bg-neutral-900 transition-colors disabled:opacity-50 dark:bg-neutral-200 dark:text-neutral-900 dark:hover:bg-neutral-300"
          disabled={loading}>
          {loading ? <span className="flex items-center justify-center gap-2"><InlineSpinner /> Adding...</span> : 'Add Standard'}
        </button>
      </div>
    </form>
  );
};

const EditUserModal = ({ isOpen, onClose, user, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: user.name || '',
    email: user.email || '',
    roleId: user.roleId || '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [roles, setRoles] = useState([]);

  useEffect(() => {
    if (isOpen) apiClient.getRoles().then(setRoles).catch(() => setRoles([]));
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (formData.password && formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const updateData = {
        name: formData.name,
        email: formData.email,
        roleId: formData.roleId ? parseInt(formData.roleId) : undefined
      };
      if (formData.password) {
        updateData.password = formData.password;
      }
      await apiClient.updateUser(user.id, updateData);
      onSuccess();
    } catch (err) {
      setError(err.message || 'Failed to update user');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-neutral-800 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
        <h3 className="font-serif text-lg text-neutral-800 dark:text-neutral-200 mb-4">Edit User</h3>
        {error && <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg text-sm">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mb-2">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg text-sm focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-500 dark:bg-neutral-800 dark:text-neutral-100"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg text-sm focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-500 dark:bg-neutral-800 dark:text-neutral-100"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mb-2">Role</label>
              <select
                value={formData.roleId}
                onChange={(e) => setFormData({ ...formData, roleId: e.target.value })}
                className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg text-sm focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-500 dark:bg-neutral-800 dark:text-neutral-100"
              >
                <option value="">No role assigned</option>
                {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mb-2">New Password (leave blank to keep current)</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg text-sm focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-500 dark:bg-neutral-800 dark:text-neutral-100"
                placeholder="Enter new password"
              />
            </div>
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mb-2">Confirm New Password</label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg text-sm focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-500 dark:bg-neutral-800 dark:text-neutral-100"
                placeholder="Confirm new password"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-neutral-600 dark:text-neutral-300 border border-neutral-300 dark:border-neutral-600 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors text-sm"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-neutral-800 text-white text-sm rounded-lg hover:bg-neutral-900 transition-colors disabled:opacity-50 dark:bg-neutral-200 dark:text-neutral-900 dark:hover:bg-neutral-300"
              disabled={loading}
            >
              {loading ? <span className="flex items-center justify-center gap-2"><InlineSpinner /> Saving...</span> : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const EditStandardModal = ({ isOpen, onClose, standard, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: standard.name || '',
    subject: standard.subject || '',
    description: standard.description || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const updateData = {
        name: formData.name,
        subject: formData.subject,
        description: formData.description
      };
      await apiClient.updateStandard(standard.id, updateData);
      onSuccess();
    } catch (err) {
      setError(err.message || 'Failed to update standard');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-neutral-800 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
        <h3 className="font-serif text-lg text-neutral-800 dark:text-neutral-200 mb-4">Edit Standard</h3>
        {error && <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg text-sm">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mb-2">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg text-sm focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-500 dark:bg-neutral-800 dark:text-neutral-100"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mb-2">Subject</label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg text-sm focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-500 dark:bg-neutral-800 dark:text-neutral-100"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={5}
                className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg text-sm focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-500 dark:bg-neutral-800 dark:text-neutral-100"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-neutral-600 dark:text-neutral-300 border border-neutral-300 dark:border-neutral-600 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors text-sm"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-neutral-800 text-white text-sm rounded-lg hover:bg-neutral-900 transition-colors disabled:opacity-50 dark:bg-neutral-200 dark:text-neutral-900 dark:hover:bg-neutral-300"
              disabled={loading}
            >
              {loading ? <span className="flex items-center justify-center gap-2"><InlineSpinner /> Saving...</span> : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
