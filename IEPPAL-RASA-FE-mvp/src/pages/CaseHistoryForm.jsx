import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiClient } from "../apiClient";
import LoadingSpinner, { InlineSpinner } from "../components/LoadingSpinner";

export default function CaseHistoryForm({ onComplete, selectedVersion }) {
  const navigate = useNavigate();
  const { studentId } = useParams();
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [sections, setSections] = useState([]);
  const [previousData, setPreviousData] = useState(null);
  const [error, setError] = useState("");

  React.useEffect(() => {
    const loadConfig = async () => {
      try {
        const config = await apiClient.getFormConfig('caseHistory');
        if (config && config.config) {
          setSections(JSON.parse(config.config));
        }
      } catch (error) {
        console.error('Failed to load config:', error);
      }
    };

    const loadSelectedVersion = async () => {
      if (selectedVersion) {
        try {
          const data = JSON.parse(selectedVersion.content);
          setPreviousData(data);
          setFormData(data);
          setIsEdit(true);
        } catch (error) {
          console.error('Failed to load selected version:', error);
        }
      }
    };

    loadConfig();
    loadSelectedVersion();
  }, [studentId, selectedVersion]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (previousData && JSON.stringify(formData) === JSON.stringify(previousData)) {
      setError("No changes detected. Please modify the case history before submitting.");
      return;
    }
    setLoading(true);
    try {
      await apiClient.createReport({
        studentId,
        studentName: formData.name || 'N/A',
        level: formData.ageYears || 'N/A',
        content: formData,
        type: "caseHistory"
      });
      if (onComplete) {
        onComplete();
      } else {
        navigate(`/student/${studentId}`);
      }
    } catch (error) {
      setError("Error saving: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (sections.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 dark:text-neutral-100">Edit Case History</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        {sections.map((section, sIdx) => (
          <div key={section.id || sIdx} className="border rounded p-4 dark:border-neutral-600 dark:bg-neutral-800">
            <h3 className="font-semibold mb-3 dark:text-neutral-100">{section.title}</h3>
            <div className="grid grid-cols-2 gap-4">
              {section.fields.map((field, fIdx) => {
                const fieldLabel = field.label;
                const fieldType = field.type;

                return (
                  <div key={fIdx}>
                    {fieldType === 'checkbox' ? (
                      <div>
                        <label className="block text-sm mb-2 font-medium dark:text-neutral-200">{fieldLabel}</label>
                        {field.options?.map((opt, optIdx) => (
                          <label key={optIdx} className="flex items-center gap-2 mb-1">
                            <input
                              type="checkbox"
                              checked={formData[fieldLabel]?.[opt] || false}
                              onChange={(e) => setFormData({ ...formData, [fieldLabel]: { ...formData[fieldLabel], [opt]: e.target.checked } })}
                              className="w-4 h-4"
                            />
                            <span className="text-sm dark:text-neutral-300">{opt}</span>
                          </label>
                        ))}
                      </div>
                    ) : fieldType === 'likert' ? (
                      <div>
                        <label className="block text-sm mb-2 font-medium dark:text-neutral-200">{fieldLabel}</label>
                        <div className="flex gap-1">
                          {(field.points || []).map((pt) => (
                            <label key={pt.id} className="flex-1 cursor-pointer">
                              <input
                                type="radio"
                                name={`${sIdx}-${fIdx}`}
                                checked={formData[fieldLabel] === pt.value}
                                onChange={() => setFormData({ ...formData, [fieldLabel]: pt.value })}
                                className="hidden"
                              />
                              <div className={`text-center py-2 px-3 rounded-lg border transition-all ${
                                formData[fieldLabel] === pt.value
                                  ? 'bg-neutral-800 text-white border-neutral-800 dark:bg-neutral-200 dark:text-neutral-900 dark:border-neutral-200'
                                  : 'bg-white text-neutral-600 border-neutral-200 hover:border-neutral-400 dark:bg-neutral-800 dark:text-neutral-300 dark:border-neutral-700 dark:hover:border-neutral-500'
                              }`}>
                                <span className="text-sm font-medium">{pt.label}</span>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <>
                        <label className="block text-sm mb-1 dark:text-neutral-300">{fieldLabel}</label>
                        <input
                          type="text"
                          value={formData[fieldLabel] || ""}
                          onChange={(e) => setFormData({ ...formData, [fieldLabel]: e.target.value })}
                          className="w-full border rounded px-3 py-2 dark:bg-neutral-800 dark:border-neutral-600 dark:text-neutral-100"
                        />
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        <div>
          <button type="submit" disabled={loading} className="bg-neutral-800 text-white px-5 py-2 text-sm rounded-lg hover:bg-neutral-900 transition-colors disabled:opacity-50 dark:bg-neutral-200 dark:text-neutral-900 dark:hover:bg-neutral-300">{loading ? <span className="flex items-center justify-center gap-2"><InlineSpinner /> Saving...</span> : "Save"}</button>
          {error && <p className="text-red-600 dark:text-red-400 mt-2">{error}</p>}
        </div>
      </form>
    </div>
  );
}
