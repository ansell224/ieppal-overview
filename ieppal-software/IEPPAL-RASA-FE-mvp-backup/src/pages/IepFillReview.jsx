import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Check, Sparkles, Info, FileText } from 'lucide-react';

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
import { apiClient } from '../apiClient';
import DocumentDropzone from '../components/DocumentDropzone';
import AiLoadingAnimation, { AI_DOC_MESSAGES } from '../components/AiLoadingAnimation';

function confidenceMeta(c) {
  if (c >= 0.8) return { label: 'High', colour: 'bg-emerald-500', text: 'text-emerald-700 dark:text-emerald-400', bar: 'bg-emerald-500', ring: 'ring-emerald-500/30' };
  if (c >= 0.5) return { label: 'Medium', colour: 'bg-amber-500', text: 'text-amber-700 dark:text-amber-400', bar: 'bg-amber-500', ring: 'ring-amber-500/30' };
  return { label: 'Low', colour: 'bg-rose-500', text: 'text-rose-700 dark:text-rose-400', bar: 'bg-rose-500', ring: 'ring-rose-500/30' };
}

export default function IepFillReview() {
  const { studentId } = useParams();
  const navigate = useNavigate();

  const [formTypes, setFormTypes] = useState([]);
  const [selectedFormType, setSelectedFormType] = useState('');
  const [files, setFiles] = useState([]);
  const [result, setResult] = useState(null);
  const [rejectedFields, setRejectedFields] = useState(new Set());
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    apiClient.getIEPFormTypes()
      .then((configs) => setFormTypes(Array.isArray(configs) ? configs : []))
      .catch(() => setFormTypes([]));
  }, []);

  const processFiles = async () => {
    if (!selectedFormType || files.length === 0) return;
    setIsProcessing(true);
    setError('');
    try {
      const res = await apiClient.fillIepFromDoc({ formType: selectedFormType, studentId, files });
      setResult(res);
      setRejectedFields(new Set());
    } catch (err) {
      setError(err.message || 'Extraction failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleField = (name) => {
    setRejectedFields((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const acceptAllHighConfidence = () => {
    if (!result) return;
    const toReject = new Set();
    for (const [name, val] of Object.entries(result.fields)) {
      if (!val || val.value === null || val.value === undefined || val.confidence < 0.8) {
        toReject.add(name);
      }
    }
    setRejectedFields(toReject);
  };

  const continueToForm = () => {
    const prefill = {};
    const includedSources = {};
    for (const [name, val] of Object.entries(result.fields || {})) {
      if (rejectedFields.has(name)) continue;
      if (val?.value === null || val?.value === undefined) continue;
      prefill[name] = val.value;
      if (val?.sourceQuote) includedSources[name] = val.sourceQuote;
    }
    // Only carry source metadata for fields the user actually kept
    const filteredExtract = result.sourceDocExtract
      ? { ...result.sourceDocExtract, perFieldSources: includedSources }
      : null;
    navigate(`/student/${studentId}`, {
      state: {
        iepFillPrefill: prefill,
        iepFillFormType: selectedFormType,
        iepFillSourceDocExtract: filteredExtract,
      },
    });
  };

  const canProcess = selectedFormType && files.length > 0 && !isProcessing;

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <button
        onClick={() => navigate(`/student/${studentId}`)}
        className="flex items-center space-x-2 px-3 py-2 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-600 dark:text-neutral-300 hover:text-neutral-800 dark:hover:text-neutral-100 hover:border-neutral-400 dark:hover:border-neutral-500 hover:shadow-sm transition-all text-sm mb-6"
      >
        <span className="text-base leading-none">&lsaquo;</span>
        <span>Back to Student</span>
      </button>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-5 h-5 text-pink-500" />
          <span className="text-xs font-medium uppercase tracking-wider text-pink-600 dark:text-pink-400">AI-assisted</span>
        </div>
        <h1 className="font-serif text-4xl text-neutral-900 dark:text-neutral-100">Fill an IEP from a document</h1>
      </div>

      {isProcessing && (
        <div className="rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 shadow-sm">
          <AiLoadingAnimation messages={AI_DOC_MESSAGES} hint="Larger documents can take up to 90 seconds" />
        </div>
      )}

      {!result && !isProcessing && (
        <>
          {/* Step 1: Template */}
          <section className="mb-5 rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-7 h-7 rounded-full bg-gradient-to-br from-pink-500 to-orange-500 text-white text-sm font-semibold flex items-center justify-center shrink-0">1</span>
              <div>
                <h2 className="font-serif text-lg text-neutral-900 dark:text-neutral-100">Pick a template</h2>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">The AI will fill the fields in this template from your document.</p>
              </div>
            </div>
            <div className="relative">
              <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 dark:text-neutral-500 pointer-events-none" />
              <select
                value={selectedFormType}
                onChange={(e) => setSelectedFormType(e.target.value)}
                className="w-full pl-10 pr-9 py-3 rounded-xl bg-neutral-50 dark:bg-neutral-900/40 border border-neutral-200 dark:border-neutral-700 text-sm text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-pink-200 dark:focus:ring-pink-500/30 focus:border-pink-300 dark:focus:border-pink-500/50 transition-colors appearance-none cursor-pointer"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center' }}
              >
                <option value="">Choose a template…</option>
                {formTypes.map((c) => (
                  <option key={c.formType} value={c.formType}>{formatFormType(c.formType)}</option>
                ))}
              </select>
            </div>
          </section>

          {/* Step 2: Documents */}
          <section className="mb-5 rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-7 h-7 rounded-full bg-gradient-to-br from-pink-500 to-orange-500 text-white text-sm font-semibold flex items-center justify-center shrink-0">2</span>
              <div>
                <h2 className="font-serif text-lg text-neutral-900 dark:text-neutral-100">Add documents</h2>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">PDFs, Word docs, images, or plain text. Up to 5 files, 20 MB each.</p>
              </div>
            </div>
            <DocumentDropzone files={files} onFilesChange={setFiles} disabled={isProcessing} />
          </section>

          {/* How it works */}
          <details className="mb-6">
            <summary className="cursor-pointer inline-flex items-center gap-1.5 text-sm text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300 font-medium select-none">
              <Info className="w-4 h-4" />
              How this works
            </summary>
            <div className="mt-3 p-4 rounded-xl bg-pink-50 dark:bg-pink-500/5 border border-pink-200 dark:border-pink-500/20">
              <ul className="text-xs text-neutral-600 dark:text-neutral-400 space-y-1.5 list-disc pl-4">
                <li>Drop PDFs, DOCX, images, or text files. AI extracts the content (OCR and vision kick in for scanned pages).</li>
                <li>It matches the extracted content to each field in the template you picked.</li>
                <li>Every suggested field is tagged High, Medium, or Low based on how directly the document supports it, and shows the source quote used.</li>
                <li>You review field-by-field, toggle include or exclude, then edit the prefilled form before saving.</li>
                <li>The original file is deleted after extraction. Only the AI's extracted summary is kept on the report.</li>
              </ul>
            </div>
          </details>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30">
              <p className="text-sm text-rose-700 dark:text-rose-400">{error}</p>
            </div>
          )}

          {/* Process button */}
          <button
            type="button"
            onClick={processFiles}
            disabled={!canProcess}
            className="w-full px-6 py-3.5 text-sm font-medium rounded-xl bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200 shadow-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            {!selectedFormType
              ? 'Pick a template first'
              : files.length === 0
                ? 'Add at least one document'
                : `Process ${files.length} document${files.length !== 1 ? 's' : ''}`}
          </button>
        </>
      )}

      {result && (() => {
        const entries = Object.entries(result.fields || {});
        const nonNullEntries = entries.filter(([, v]) => v?.value !== null && v?.value !== undefined);
        const nullEntries = entries.filter(([, v]) => v?.value === null || v?.value === undefined);
        const includedCount = nonNullEntries.filter(([name]) => !rejectedFields.has(name)).length;

        return (
          <div className="ai-fade-in">
            {/* Summary card */}
            <section className="mb-6 rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-pink-500" />
                <h2 className="font-serif text-xl text-neutral-900 dark:text-neutral-100">AI summary</h2>
              </div>
              <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
                {result.extractedSummary || 'No summary returned.'}
              </p>
            </section>

            {/* Review controls */}
            <section className="mb-5">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h2 className="font-serif text-2xl text-neutral-900 dark:text-neutral-100">Review extracted fields</h2>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                    {includedCount} of {nonNullEntries.length} fields ready to carry into the form. Click any card to include or exclude it.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={acceptAllHighConfidence}
                  title="Keep only high-confidence fields"
                  className="shrink-0 px-3 py-2 rounded-lg text-xs font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 border border-neutral-200 dark:border-neutral-700 transition-colors"
                >
                  Keep only high
                </button>
              </div>

              <details className="rounded-xl bg-neutral-50 dark:bg-neutral-900/40 border border-neutral-200 dark:border-neutral-700">
                <summary className="cursor-pointer p-4 inline-flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-100 font-medium select-none">
                  <Info className="w-4 h-4 text-pink-500" />
                  How confidence is determined
                </summary>
                <div className="px-4 pb-4 text-xs text-neutral-600 dark:text-neutral-400 space-y-3">
                  <p>Each field is tagged <span className="font-medium text-neutral-700 dark:text-neutral-200">High</span>, <span className="font-medium text-neutral-700 dark:text-neutral-200">Medium</span>, or <span className="font-medium text-neutral-700 dark:text-neutral-200">Low</span> based on how much reasoning the AI had to do to get from the source document to the value. The tier tells you how much to trust it; the quote next to each field shows the evidence.</p>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="p-3 rounded-lg bg-white dark:bg-neutral-800 border border-emerald-200 dark:border-emerald-500/30">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span className="font-semibold text-emerald-700 dark:text-emerald-400">High</span>
                      </div>
                      <p className="text-[11px] leading-relaxed">The value is explicitly stated in the document. At most light reformatting (date format, name case, or picking a clearly flagged item from a list). Safe to accept.</p>
                    </div>
                    <div className="p-3 rounded-lg bg-white dark:bg-neutral-800 border border-amber-200 dark:border-amber-500/30">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="w-2 h-2 rounded-full bg-amber-500" />
                        <span className="font-semibold text-amber-700 dark:text-amber-400">Medium</span>
                      </div>
                      <p className="text-[11px] leading-relaxed">Derived with reasoning across multiple explicit passages: age from date of birth, grade from academic year, primary need synthesised from a listed set. Every step is grounded in the document. Worth checking.</p>
                    </div>
                    <div className="p-3 rounded-lg bg-white dark:bg-neutral-800 border border-rose-200 dark:border-rose-500/30">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="w-2 h-2 rounded-full bg-rose-500" />
                        <span className="font-semibold text-rose-700 dark:text-rose-400">Low</span>
                      </div>
                      <p className="text-[11px] leading-relaxed">Weak or ambiguous evidence. The AI had to pick between competing candidates, or the source only hinted at the value (for example pronouns inferred from prose usage, not declared). Review carefully or reject.</p>
                    </div>
                  </div>

                  <p>The <span className="font-medium text-neutral-700 dark:text-neutral-200">source quote</span> next to each value is verbatim text pulled from your document. If it does not look like it directly states the answer, treat the field as Low even if it is tagged otherwise.</p>
                  <p>Fields that rely on identifiers issued by the previous school (old Student ID, old Case Manager, class codes) are deliberately left blank, because the destination school assigns those. Only included fields carry into the IEP form on the next screen, and you can still edit any value there before saving.</p>
                </div>
              </details>
            </section>

            {/* Field cards — side-by-side AI value vs source quote */}
            <section className="space-y-3">
              {nonNullEntries.map(([name, val]) => {
                const included = !rejectedFields.has(name);
                const conf = val?.confidence || 0;
                const meta = confidenceMeta(conf);
                const hasQuote = Boolean(val?.sourceQuote);
                const quoteContainsValue = hasQuote && String(val.sourceQuote).toLowerCase().includes(String(val.value).toLowerCase());
                const evidenceReason = !hasQuote
                  ? 'AI inferred this value. No direct quote found in the document.'
                  : quoteContainsValue
                    ? 'Value appears verbatim in the source quote.'
                    : 'Value derived from the quoted passage (rephrased or calculated).';
                return (
                  <button
                    key={name}
                    type="button"
                    onClick={() => toggleField(name)}
                    className={`w-full text-left rounded-2xl border transition-all ${
                      included
                        ? 'border-pink-300 dark:border-pink-500/40 bg-white dark:bg-neutral-800 shadow-sm'
                        : 'border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 opacity-50 hover:opacity-75'
                    }`}
                  >
                    <div className="p-5">
                      {/* Card header */}
                      <div className="flex items-center gap-3 mb-4">
                        <span className={`shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                          included
                            ? 'bg-pink-500 border-pink-500'
                            : 'border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800'
                        }`}>
                          {included && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                        </span>
                        <h3 className="flex-1 font-medium text-neutral-900 dark:text-neutral-100 truncate">{name}</h3>
                        <span className={`shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-white dark:bg-neutral-900 border ${meta.text}`} style={{ borderColor: 'currentColor', borderOpacity: 0.4 }}>
                          <span className={`w-1.5 h-1.5 rounded-full ${meta.colour}`} />
                          {meta.label}
                        </span>
                      </div>

                      {/* Side-by-side comparison */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="rounded-lg bg-pink-50/60 dark:bg-pink-500/5 border border-pink-200 dark:border-pink-500/20 p-3">
                          <p className="text-[10px] font-semibold uppercase tracking-wide text-pink-600 dark:text-pink-400 mb-1.5 flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            AI suggests
                          </p>
                          <p className="text-sm text-neutral-900 dark:text-neutral-100 break-words leading-relaxed">{String(val.value)}</p>
                        </div>
                        <div className="rounded-lg bg-neutral-50 dark:bg-neutral-900/40 border border-neutral-200 dark:border-neutral-700 p-3">
                          <p className="text-[10px] font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400 mb-1.5 flex items-center gap-1">
                            <FileText className="w-3 h-3" />
                            From document
                          </p>
                          {hasQuote ? (
                            <p className="text-sm italic text-neutral-700 dark:text-neutral-300 break-words leading-relaxed">"{val.sourceQuote}"</p>
                          ) : (
                            <p className="text-sm italic text-neutral-400 dark:text-neutral-500">No direct quote — inferred.</p>
                          )}
                        </div>
                      </div>

                      {/* Why this confidence */}
                      <p className={`mt-3 text-[11px] ${meta.text}`}>
                        <span className="font-medium">Why {meta.label.toLowerCase()}:</span> {evidenceReason}
                      </p>
                    </div>
                  </button>
                );
              })}

              {nullEntries.length > 0 && (
                <details className="rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900/40">
                  <summary className="cursor-pointer p-4 text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 select-none">
                    {nullEntries.length} field{nullEntries.length !== 1 ? 's' : ''} the AI couldn't determine
                  </summary>
                  <ul className="px-4 pb-4 space-y-1 text-xs text-neutral-500 dark:text-neutral-500">
                    {nullEntries.map(([name]) => (
                      <li key={name}>• {name}</li>
                    ))}
                  </ul>
                </details>
              )}
            </section>

            {/* Footer actions */}
            <div className="mt-8 flex items-center justify-between gap-3 sticky bottom-0 bg-gradient-to-t from-[#f5f1eb] dark:from-neutral-900 to-transparent pt-6 pb-2">
              <button
                type="button"
                onClick={() => { setResult(null); setFiles([]); setRejectedFields(new Set()); }}
                className="px-4 py-2.5 rounded-xl text-sm text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
              >
                Start over
              </button>
              <button
                type="button"
                onClick={continueToForm}
                disabled={includedCount === 0}
                className="px-5 py-2.5 text-sm font-medium rounded-xl bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200 shadow-sm transition-all disabled:opacity-40"
              >
                {includedCount === 0
                  ? 'Select at least one field'
                  : `Continue with ${includedCount} field${includedCount !== 1 ? 's' : ''}`}
              </button>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
