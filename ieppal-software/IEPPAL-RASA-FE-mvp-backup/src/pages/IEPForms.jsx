import React, { useState, useEffect, useRef, useCallback } from "react";
import { Sparkles, Download } from "lucide-react";
import LoadingSpinner from "../components/LoadingSpinner";
import DateFieldInput from "../components/DateFieldInput";
import { exportIepPdf } from "../utils/exportIepPdf";

const AUTOSAVE_DELAY = 1500; // ms

export default function IEPForms({
  formType,
  config,
  initialData,
  reportId: initialReportId,
  onSubmit,
  onSaved,
  sourceDocExtract,
  studentName,
}) {
  const [formData, setFormData] = useState(initialData || {});
  const [saveStatus, setSaveStatus] = useState("idle"); // idle | saving | saved | error
  const [errorMsg, setErrorMsg] = useState("");
  const [reportId, setReportId] = useState(initialReportId || null);

  const timerRef = useRef(null);
  const isMountedRef = useRef(true);
  const latestDataRef = useRef(formData);

  const sections = React.useMemo(() => {
    if (Array.isArray(config)) return config;
    if (typeof config === "string") {
      try { return JSON.parse(config); } catch { return []; }
    }
    return [];
  }, [config]);

  const isDirty = React.useMemo(() => {
    return !deepEqual(formData, initialData || {});
  }, [formData, initialData]);

  // Keep ref in sync
  useEffect(() => {
    latestDataRef.current = formData;
  }, [formData]);

  // Reset fully only when switching form types
  const prevFormTypeRef = useRef(formType);
  useEffect(() => {
    if (prevFormTypeRef.current !== formType) {
      prevFormTypeRef.current = formType;
      setSaveStatus("idle");
      setErrorMsg("");
      setFormData(initialData || {});
      setReportId(initialReportId || null);
    }
  }, [initialData, initialReportId, formType]);

  // Keep the local report ID aligned with the latest report selected by the parent.
  // Some backends issue a new report/version ID after save; if we keep patching the old one,
  // autosave can start failing with a 404.
  useEffect(() => {
    setReportId(initialReportId || null);
  }, [initialReportId]);

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const doSave = useCallback(async (data) => {
    if (!isMountedRef.current) return;
    setSaveStatus("saving");
    setErrorMsg("");

    try {
      // Reports are versioned on the backend. Each save creates the next version,
      // and there is currently no PATCH /reports/:id route for in-place updates.
      const created = await onSubmit(data);
      if (created?.id) setReportId(created.id);

      if (!isMountedRef.current) return;
      setSaveStatus("saved");
      onSaved?.();

      // Clear "Saved" after 3s
      setTimeout(() => {
        if (isMountedRef.current) setSaveStatus("idle");
      }, 3000);
    } catch (err) {
      if (!isMountedRef.current) return;
      setSaveStatus("error");
      setErrorMsg(err.message || "Failed to save");
    }
  }, [onSubmit, onSaved]);

  // Debounced autosave on form changes
  useEffect(() => {
    if (!isDirty) return;

    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      doSave(latestDataRef.current);
    }, AUTOSAVE_DELAY);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [formData, isDirty, doSave]);

  if (!sections.length) {
    return <LoadingSpinner />;
  }

  const [isExporting, setIsExporting] = useState(false);
  const handleExport = async () => {
    if (isExporting) return;
    setIsExporting(true);
    try {
      await exportIepPdf({
        studentName: studentName || 'Student',
        formType,
        config: sections,
        data: formData,
      });
    } catch (err) {
      alert('Failed to export PDF: ' + (err?.message || 'unknown error'));
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end">
        <button
          type="button"
          onClick={handleExport}
          disabled={isExporting}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm font-medium text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-700 shadow-sm transition-colors disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          {isExporting ? 'Exporting…' : 'Export as PDF'}
        </button>
      </div>

      <GenericFormRenderer
        sections={sections}
        value={formData}
        onChange={setFormData}
        sourceDocExtract={sourceDocExtract}
      />

      <AutosaveStatus status={saveStatus} errorMsg={errorMsg} isDirty={isDirty} />
    </div>
  );
}

function AutosaveStatus({ status, errorMsg, isDirty }) {
  const hidden = status === "idle" && !isDirty;

  return (
    <div
      className={`fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-2.5 rounded-lg shadow-lg text-sm font-medium transition-all duration-300 ${
        hidden ? "opacity-0 translate-y-2 pointer-events-none" : "opacity-100 translate-y-0"
      } ${
        status === "saving"
          ? "bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300"
          : status === "saved"
          ? "bg-green-50 dark:bg-green-900/60 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800"
          : status === "error"
          ? "bg-red-50 dark:bg-red-900/60 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800"
          : "bg-amber-50 dark:bg-amber-900/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800"
      }`}
    >
      {status === "saving" && (
        <span className="inline-block w-3 h-3 border-2 border-neutral-400 dark:border-neutral-500 border-t-transparent rounded-full animate-spin" />
      )}
      {status === "saving"
        ? "Saving..."
        : status === "saved"
        ? "Saved"
        : status === "error"
        ? `Failed to save${errorMsg ? `: ${errorMsg}` : ""}`
        : isDirty
        ? "Unsaved changes"
        : ""}
    </div>
  );
}

function getFieldKey(section, field, sections) {
  // Check if this field label is duplicated across sections
  const isDuplicate = sections.some(
    (s) => s.id !== section.id && Array.isArray(s.fields) && s.fields.some((f) => f.label === field.label)
  );
  return isDuplicate ? `${section.title}__${field.label}` : field.label;
}

function GenericFormRenderer({ sections = [], value, onChange, sourceDocExtract }) {
  return (
    <div className="space-y-6">
      {sections.map(section => (
        <div key={section.id} className="border border-neutral-200 dark:border-neutral-700 rounded-xl p-5 bg-white dark:bg-neutral-800">
          <h3 className="text-sm font-medium text-neutral-800 dark:text-neutral-200 mb-4">{section.title}</h3>
          <div className="grid grid-cols-2 gap-4">
            {Array.isArray(section.fields) &&
              section.fields.map(field => {
                const key = getFieldKey(section, field, sections);
                // Fall back to plain label for backward compatibility with saved data
                const fieldValue = value[key] !== undefined ? value[key] : value[field.label];
                const sourceSnippet = sourceDocExtract?.perFieldSources?.[field.label] || sourceDocExtract?.perFieldSources?.[key];
                return (
                  <FieldRenderer
                    key={field.id}
                    field={field}
                    value={fieldValue}
                    sourceSnippet={sourceSnippet}
                    onChange={(val) =>
                      onChange({
                        ...value,
                        [key]: val,
                      })
                    }
                  />
                );
              })}
          </div>
        </div>
      ))}
    </div>
  );
}

function FieldLabel({ label, sourceSnippet }) {
  return (
    <span className="flex items-center gap-1.5 flex-wrap">
      {label}
      {sourceSnippet && (
        <span
          title={sourceSnippet}
          className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium rounded-full bg-pink-50 dark:bg-pink-500/10 text-pink-600 dark:text-pink-400 border border-pink-200 dark:border-pink-500/30 cursor-help"
        >
          <Sparkles size={10} />
          AI-Filled
        </span>
      )}
    </span>
  );
}

function FieldRenderer({ field, value, onChange, sourceSnippet }) {
  switch (field.type) {
    case 'text':
      return (
        <div>
          <label className="block text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1.5">
            <FieldLabel label={field.label} sourceSnippet={sourceSnippet} />
          </label>
          <input
            type="text"
            name={field.key}
            value={value || ""}
            onChange={e => onChange(e.target.value)}
            className="w-full px-3 py-2.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-100 text-sm focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-500 focus:ring-1 focus:ring-neutral-400 dark:focus:ring-neutral-500 focus:bg-white dark:focus:bg-neutral-700 transition-colors"
          />
        </div>
      );

    case 'date':
      return (
        <div>
          <label className="block text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1.5">
            <FieldLabel label={field.label} sourceSnippet={sourceSnippet} />
          </label>
          <DateFieldInput
            name={field.key}
            value={value || ""}
            onChange={onChange}
            className="w-full px-3 py-2.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-100 text-sm focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-500 focus:ring-1 focus:ring-neutral-400 dark:focus:ring-neutral-500 focus:bg-white dark:focus:bg-neutral-700 transition-colors"
          />
        </div>
      );

    case 'textarea':
      return (
        <div className="md:col-span-2">
          <label className="block text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1.5">
            <FieldLabel label={field.label} sourceSnippet={sourceSnippet} />
          </label>
          {field.helper && (
            <p className="text-xs italic text-neutral-400 dark:text-neutral-500 mb-2">{field.helper}</p>
          )}
          <textarea
            name={field.key}
            value={value || ""}
            onChange={e => onChange(e.target.value)}
            rows={field.rows || 5}
            className="w-full px-3 py-2.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-100 text-sm focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-500 focus:ring-1 focus:ring-neutral-400 dark:focus:ring-neutral-500 focus:bg-white dark:focus:bg-neutral-700 transition-colors resize-y leading-relaxed"
          />
        </div>
      );

    case 'number':
      return (
        <div>
          <label className="block text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1.5">
            <FieldLabel label={field.label} sourceSnippet={sourceSnippet} />
          </label>
          <input
            type="number"
            name={field.key}
            value={value || ""}
            onChange={e => onChange(e.target.value)}
            className="w-full px-3 py-2.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-100 text-sm focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-500 focus:ring-1 focus:ring-neutral-400 dark:focus:ring-neutral-500 focus:bg-white dark:focus:bg-neutral-700 transition-colors"
          />
        </div>
      );

    case 'checkbox':
      return (
        <div>
          <label className="block text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-2">
            <FieldLabel label={field.label} sourceSnippet={sourceSnippet} />
          </label>
          {field.options.map(opt => (
            <label key={opt} className="flex items-center gap-2 mb-1.5">
              <input
                type="checkbox"
                checked={value?.[opt] || false}
                onChange={e =>
                  onChange({
                    ...(value || {}),
                    [opt]: e.target.checked,
                  })
                }
                className="w-4 h-4 rounded border-neutral-300 dark:border-neutral-600 text-neutral-800 dark:text-neutral-200 focus:ring-neutral-400 dark:focus:ring-neutral-500"
              />
              <span className="text-sm text-neutral-700 dark:text-neutral-300">{opt}</span>
            </label>
          ))}
        </div>
      );

    case 'likert':
      return (
        <div>
          <label className="block text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-2">
            <FieldLabel label={field.label} sourceSnippet={sourceSnippet} />
          </label>
          <div className="flex gap-1">
            {field.points.map(pt => (
              <button
                type="button"
                key={pt.value}
                onClick={() => onChange(pt.value)}
                className={`flex-1 py-2 rounded-lg border-2 text-sm transition-colors ${
                  value === pt.value
                    ? 'bg-neutral-800 text-white border-neutral-800 dark:bg-neutral-200 dark:text-neutral-900 dark:border-neutral-200'
                    : 'border-neutral-200 text-neutral-600 hover:border-neutral-300 dark:border-neutral-700 dark:text-neutral-300 dark:hover:border-neutral-600'
                }`}
              >
                {pt.label}
              </button>
            ))}
          </div>
        </div>
      );

    default:
      return <div>Unsupported field type</div>;
  }
}

function deepEqual(a, b) {
  if (a === b) return true;
  if (typeof a !== typeof b) return false;
  if (a == null || b == null) return false;

  if (typeof a !== "object") return false;

  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);
  if (aKeys.length !== bKeys.length) return false;

  for (const key of aKeys) {
    if (!bKeys.includes(key)) return false;
    if (!deepEqual(a[key], b[key])) return false;
  }

  return true;
}
