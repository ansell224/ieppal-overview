import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { apiClient } from "../apiClient";
import LoadingSpinner from "../components/LoadingSpinner";

export default function IEPReportHistory() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedReports, setSelectedReports] = useState([]);
  const [comparison, setComparison] = useState(null);

  const studentId = searchParams.get('studentId');

  useEffect(() => {
    const fetchReports = async () => {
      try {
        if (studentId) {
          const data = await apiClient.getStudentReports(studentId);
          setReports(data);
        } else {
          setError('No student ID provided');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [studentId]);

  const handleReportSelect = (reportId) => {
    setSelectedReports(prev => {
      if (prev.includes(reportId)) {
        return prev.filter(id => id !== reportId);
      } else if (prev.length < 2) {
        return [...prev, reportId];
      } else {
        return [prev[1], reportId];
      }
    });
  };

  const handleCompare = async () => {
    if (selectedReports.length === 2) {
      try {
        const comparisonData = await apiClient.compareReports(selectedReports[0], selectedReports[1]);
        setComparison(comparisonData);
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const viewReport = (reportId) => {
    navigate(`/iep-report?studentId=${studentId}&reportId=${reportId}`);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error || !reports.length) {
    return (
      <>
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-neutral-800 dark:text-neutral-200">
          {error || 'No IEP Reports Available'}
        </h2>
        <button
          onClick={() => navigate('/classrooms')}
          className="mt-4 flex items-center space-x-2 px-3 py-2 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-600 dark:text-neutral-300 hover:text-neutral-800 dark:hover:text-neutral-100 hover:border-neutral-400 dark:hover:border-neutral-500 hover:shadow-sm transition-all text-sm"
        >
          <span className="text-base leading-none">&lsaquo;</span>
          <span>Back to Classrooms</span>
        </button>
      </>
    );
  }

  return (
    <>
          <div className="max-w-6xl mx-auto">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-neutral-800 dark:text-neutral-200 mb-6">
              IEP Report History - {reports[0]?.student?.name}
            </h1>

            <div className="mb-6 flex gap-4">
              <button
                onClick={handleCompare}
                disabled={selectedReports.length !== 2}
                className={`px-5 py-2 rounded-lg text-sm transition-colors ${
                  selectedReports.length === 2
                    ? 'bg-neutral-800 text-white hover:bg-neutral-900 dark:bg-neutral-200 dark:text-neutral-900 dark:hover:bg-neutral-300'
                    : 'bg-neutral-100 text-neutral-400 cursor-not-allowed dark:bg-neutral-700 dark:text-neutral-500'
                }`}
              >
                Compare Selected ({selectedReports.length}/2)
              </button>

              <button
                onClick={() => navigate('/classrooms')}
                className="flex items-center space-x-2 px-3 py-2 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-600 dark:text-neutral-300 hover:text-neutral-800 dark:hover:text-neutral-100 hover:border-neutral-400 dark:hover:border-neutral-500 hover:shadow-sm transition-all text-sm"
              >
                <span className="text-base leading-none">&lsaquo;</span>
                <span>Back to Classrooms</span>
              </button>
            </div>

            <div className="grid gap-4 mb-8">
              {reports.length === 0 ? (
                <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-md p-8 text-center">
                  <p className="text-neutral-500 dark:text-neutral-400 text-lg">No IEP reports found for this student.</p>
                  <p className="text-neutral-400 dark:text-neutral-500 text-sm mt-2">Create a new IEP report to see it appear here.</p>
                </div>
              ) : (
                reports.map((report) => (
                  <div
                    key={report.id}
                    className={`card-hover bg-white dark:bg-neutral-800 rounded-lg shadow-md p-6 border-2 cursor-pointer transition-all ${
                      selectedReports.includes(report.id)
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                        : 'border-neutral-200 hover:border-neutral-300 dark:border-neutral-700 dark:hover:border-neutral-600'
                    }`}
                    onClick={() => handleReportSelect(report.id)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-2">
                          <h3 className="text-xl font-semibold text-neutral-800 dark:text-neutral-200">
                            Version {report.version}
                          </h3>
                          <span className="px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-400 rounded-full text-sm">
                            {report.type}
                          </span>
                          {report.version === Math.max(...reports.map(r => r.version)) && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-400 rounded-full text-xs">
                              Latest
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm text-neutral-600 dark:text-neutral-300">
                          <div>
                            <strong>Created:</strong> {new Date(report.createdAt).toLocaleString()}
                          </div>
                          <div>
                            <strong>Updated:</strong> {new Date(report.updatedAt).toLocaleString()}
                          </div>
                          <div>
                            <strong>Grade:</strong> {report.level}
                          </div>
                          <div>
                            <strong>Skills Assessed:</strong> {Object.keys(JSON.parse(report.skillsAssessment || '{}')).length}
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            viewReport(report.id);
                          }}
                          className="px-4 py-2 bg-neutral-800 text-white rounded-lg hover:bg-neutral-900 text-sm transition-colors dark:bg-neutral-200 dark:text-neutral-900 dark:hover:bg-neutral-300"
                        >
                          View Full Report
                        </button>

                        <input
                          type="checkbox"
                          checked={selectedReports.includes(report.id)}
                          onChange={() => handleReportSelect(report.id)}
                          className="w-5 h-5 text-blue-600"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {comparison && (
              <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-bold text-neutral-800 dark:text-neutral-200 mb-6">Report Comparison</h2>

                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded">
                    <h3 className="font-semibold text-blue-800 dark:text-blue-400">
                      Version {comparison.report1.version} - {new Date(comparison.report1.createdAt).toLocaleDateString()}
                    </h3>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded">
                    <h3 className="font-semibold text-green-800 dark:text-green-400">
                      Version {comparison.report2.version} - {new Date(comparison.report2.createdAt).toLocaleDateString()}
                    </h3>
                  </div>
                </div>

                <div className="space-y-4">
                  {Object.entries(comparison.differences).map(([skill, diff]) => (
                    <div key={skill} className={`p-4 rounded-lg border ${
                      diff.changed ? 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/30 dark:border-yellow-800' : 'bg-neutral-50 border-neutral-200 dark:bg-neutral-800 dark:border-neutral-700'
                    }`}>
                      <h4 className="font-semibold text-neutral-800 dark:text-neutral-200 mb-2">
                        {skill.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        {diff.changed && <span className="ml-2 text-yellow-600 dark:text-yellow-400 text-sm">(Changed)</span>}
                      </h4>

                      {diff.changed ? (
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Version {comparison.report1.version}:</p>
                            <p className="text-neutral-700 dark:text-neutral-300">{diff.older || 'No assessment'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-green-600 dark:text-green-400 font-medium">Version {comparison.report2.version}:</p>
                            <p className="text-neutral-700 dark:text-neutral-300">{diff.newer || 'No assessment'}</p>
                          </div>
                        </div>
                      ) : (
                        <p className="text-neutral-700 dark:text-neutral-300">{diff.value || 'No assessment'}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
    </>
  );
}
