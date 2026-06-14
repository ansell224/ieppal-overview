import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiClient } from "../apiClient";
import LoadingSpinner, { InlineSpinner } from "../components/LoadingSpinner";

export default function SkillAssessment({ onComplete }) {
  const navigate = useNavigate();
  const { studentId } = useParams();
  const [formData, setFormData] = useState({ studentName: "", gradeLevel: "", remarks: {} });
  const [loading, setLoading] = useState(false);
  const [sections, setSections] = useState([]);
  const [previousData, setPreviousData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const config = await apiClient.getFormConfig('skillsAssessment');
        if (config && config.config) {
          setSections(JSON.parse(config.config));
        }
      } catch (error) {
        console.error('Failed to load config:', error);
      }
    };

    const loadStudent = async () => {
      try {
        const student = await apiClient.getStudent(studentId);
        setFormData(prev => ({ ...prev, studentName: student.name, gradeLevel: student.level }));
      } catch (error) {
        console.error('Failed to load student:', error);
      }
    };

    loadConfig();
    if (studentId) loadStudent();
  }, [studentId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (previousData && JSON.stringify(formData.remarks) === JSON.stringify(previousData)) {
      setError("No changes detected. Please modify the assessment before submitting.");
      return;
    }
    setLoading(true);
    try {
      await apiClient.createReport({
        studentId,
        studentName: formData.studentName,
        level: formData.gradeLevel,
        content: formData.remarks,
        type: "skillsAssessment"
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
      <h1 className="text-2xl font-bold mb-6 dark:text-neutral-100">Skills Assessment</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-2 dark:text-neutral-300">Student Name</label>
            <input
              type="text"
              value={formData.studentName}
              className="w-full border rounded px-3 py-2 bg-neutral-100 dark:bg-neutral-700 cursor-not-allowed dark:text-neutral-100 dark:border-neutral-600"
              readOnly
            />
          </div>
          <div>
            <label className="block mb-2 dark:text-neutral-300">Grade</label>
            <input
              type="text"
              value={formData.gradeLevel}
              className="w-full border rounded px-3 py-2 bg-neutral-100 dark:bg-neutral-700 cursor-not-allowed dark:text-neutral-100 dark:border-neutral-600"
              readOnly
            />
          </div>
        </div>

        {sections.map((section, si) => (
          <div key={si} className="border rounded p-4 dark:border-neutral-600 dark:bg-neutral-800">
            <h3 className="font-semibold mb-3 dark:text-neutral-100">{section.title}</h3>
            <div className="space-y-2">
              {section.fields.map((field, fi) => {
                const fieldLabel = typeof field === 'string' ? field : field.label;
                const fieldType = typeof field === 'string' ? 'text' : field.type;

                return (
                  <div key={`${si}-${fi}`}>
                    {fieldType === 'checkbox' ? (
                      <div>
                        <label className="block text-sm mb-1 font-medium dark:text-neutral-200">{fieldLabel}</label>
                        <div className="space-y-1">
                          {(field.options || []).map((opt, oi) => (
                            <label key={oi} className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={formData.remarks[`${fieldLabel}_${opt}`] || false}
                                onChange={(e) => setFormData({ ...formData, remarks: { ...formData.remarks, [`${fieldLabel}_${opt}`]: e.target.checked } })}
                                className="w-4 h-4"
                              />
                              <span className="text-sm dark:text-neutral-300">{opt}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ) : fieldType === 'likert' ? (
                      <div>
                        <label className="block text-sm mb-2 font-medium dark:text-neutral-200">{fieldLabel}</label>
                        <div className="flex gap-1">
                          {(field.points || []).map((pt) => (
                            <label key={pt.id} className="flex-1 cursor-pointer">
                              <input
                                type="radio"
                                name={`${si}-${fi}`}
                                checked={formData.remarks[fieldLabel] === pt.value}
                                onChange={() => setFormData({ ...formData, remarks: { ...formData.remarks, [fieldLabel]: pt.value } })}
                                className="hidden"
                              />
                              <div className={`text-center py-2 px-3 rounded-lg border transition-all ${
                                formData.remarks[fieldLabel] === pt.value
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
                          value={formData.remarks[fieldLabel] || ""}
                          onChange={(e) => setFormData({ ...formData, remarks: { ...formData.remarks, [fieldLabel]: e.target.value } })}
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
          <button
            type="submit"
            disabled={loading}
            className="bg-neutral-800 text-white px-5 py-2 text-sm rounded-lg hover:bg-neutral-900 transition-colors disabled:opacity-50 dark:bg-neutral-200 dark:text-neutral-900 dark:hover:bg-neutral-300"
          >
            {loading ? <span className="flex items-center justify-center gap-2"><InlineSpinner /> Saving...</span> : "Save"}
          </button>
          {error && <p className="text-red-600 dark:text-red-400 mt-2">{error}</p>}
        </div>
      </form>
    </div>
  );
}
