import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../apiClient';
import LoadingSpinner from '../components/LoadingSpinner';

// Convert camelCase to Title Case (e.g. "caseHistory" -> "Case History")
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

export default function StudentHome() {
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const [profile, allForms] = await Promise.all([
          apiClient.getMyStudentProfile(),
          apiClient.getIEPAllForms(),
        ]);
        setStudent(profile);
        setForms(allForms || []);
      } catch (err) {
        console.error('Failed to load student profile:', err);
        setError(err.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  if (loading) return <LoadingSpinner />;

  if (error || !student) {
    return (
      <div className="text-center py-20">
        <h2 className="font-serif text-2xl text-neutral-900 dark:text-neutral-100 mb-2">Profile Not Found</h2>
        <p className="text-neutral-400 dark:text-neutral-500 text-sm">
          {error || 'No student profile is linked to your account. Please contact your administrator.'}
        </p>
      </div>
    );
  }

  const activeGoals = (student.goals || []).filter(g => g.status === 'ACTIVE');
  const completedGoals = (student.goals || []).filter(g => g.status === 'COMPLETED');
  const reports = student.iedReports || [];

  return (
    <>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 sm:mb-10">
        <div>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-6xl text-neutral-900 dark:text-neutral-100">{student.name}</h1>
          <p className="mt-2 text-neutral-400 dark:text-neutral-500 text-base font-light">
            {student.classroom?.name && <>{student.classroom.name} &middot; </>}
            {student.teacher?.name && <>Teacher: {student.teacher.name} &middot; </>}
            Grade {student.level || 'N/A'}
          </p>
        </div>
      </div>

      {/* Goals Section */}
      <h2 className="font-serif text-2xl text-neutral-900 dark:text-neutral-100 mb-4">Goals</h2>
      {activeGoals.length === 0 && completedGoals.length === 0 ? (
        <p className="text-neutral-400 dark:text-neutral-500 text-sm mb-10">No goals yet.</p>
      ) : (
        <div className="space-y-8 mb-10">
          {activeGoals.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-4">
                Active ({activeGoals.length})
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
                {activeGoals.map(goal => (
                  <div
                    key={goal.id}
                    onClick={() => navigate(`/goal/${goal.id}`)}
                    className="card-hover bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:shadow-md transition-all duration-200 cursor-pointer"
                  >
                    <div className="p-5">
                      <h3 className="font-medium text-neutral-900 dark:text-neutral-100 leading-snug mb-3">{goal.title}</h3>
                      <div className="space-y-2">
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">{goal.skill}</p>
                        {goal.description && (
                          <p className="text-sm text-neutral-400 dark:text-neutral-500 line-clamp-2">{goal.description}</p>
                        )}
                        <div className="flex gap-4 text-xs text-neutral-400 dark:text-neutral-500">
                          {goal.targetDate && (
                            <span>Target: {new Date(goal.targetDate).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {completedGoals.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-4">
                Completed ({completedGoals.length})
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
                {completedGoals.map(goal => (
                  <div
                    key={goal.id}
                    onClick={() => navigate(`/goal/${goal.id}`)}
                    className="card-hover bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:shadow-md transition-all duration-200 cursor-pointer opacity-60"
                  >
                    <div className="p-5">
                      <h3 className="font-medium text-neutral-900 dark:text-neutral-100 leading-snug mb-3">{goal.title}</h3>
                      <div className="space-y-2">
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">{goal.skill}</p>
                        {goal.description && (
                          <p className="text-sm text-neutral-400 dark:text-neutral-500 line-clamp-2">{goal.description}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* IEPs Section */}
      <h2 className="font-serif text-2xl text-neutral-900 dark:text-neutral-100 mb-4">IEPs & Documents</h2>
      {reports.length === 0 ? (
        <p className="text-neutral-400 dark:text-neutral-500 text-sm">No IEP reports yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
          {forms.map(form => {
            const formReports = reports.filter(r => r.type === form.formType);
            const latestReport = formReports.sort((a, b) => b.version - a.version)[0];
            if (!latestReport) return null;

            return (
              <div
                key={form.formType}
                className="rounded-xl border p-5 bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800"
              >
                <h3 className="font-medium text-neutral-900 dark:text-neutral-100 mb-1">{formatFormType(form.formType)}</h3>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  Last updated on {new Date(latestReport.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                </p>
                <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">Version {latestReport.version}</p>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
