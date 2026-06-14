import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { apiClient } from '../apiClient';
import LoadingSpinner from '../components/LoadingSpinner';


export default function GoalList() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const studentId = searchParams.get('studentId');
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (studentId) {
      fetchGoals();
    }
  }, [studentId]);

  const fetchGoals = async () => {
    try {
      const data = await apiClient.getGoals(studentId);
      setGoals(data);
    } catch (error) {
      console.error('Error fetching goals:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <>

          <div className="bg-white dark:bg-neutral-800 rounded-3xl shadow-lg p-8 max-w-4xl mx-auto">
            {goals.length > 0 ? (
              <div className="space-y-4">
                {goals.map((goal) => (
                  <div key={goal.id} className={`p-6 rounded-xl bg-gradient-to-r ${goal.color} text-white`}>
                    <h3 className="text-xl font-bold mb-2">{goal.title}</h3>
                    {goal.description && <p className="mb-2">{goal.description}</p>}
                    {goal.skill && <span className="inline-block px-3 py-1 bg-white bg-opacity-20 rounded-full text-sm">{goal.skill}</span>}
                    {goal.targetDate && (
                      <p className="text-sm mt-2">Target: {new Date(goal.targetDate).toLocaleDateString()}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-neutral-600 dark:text-neutral-300">No goals created yet.</p>
            )}

            <div className="flex gap-4 mt-8">
              <button
                onClick={() => navigate(`/create-goal?studentId=${studentId}`)}
                className="flex-1 px-5 py-2.5 bg-neutral-800 dark:bg-neutral-200 text-white dark:text-neutral-900 text-sm rounded-lg hover:bg-neutral-900 dark:hover:bg-neutral-300 transition-colors"
              >
                Add New Goal
              </button>
              <button
                onClick={() => studentId ? navigate(`/student/${studentId}`) : navigate(-1)}
                className="flex items-center space-x-2 px-3 py-2 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-600 dark:text-neutral-300 hover:text-neutral-800 dark:hover:text-neutral-100 hover:border-neutral-400 dark:hover:border-neutral-500 hover:shadow-sm transition-all text-sm"
              >
                <span className="text-base leading-none">&lsaquo;</span>
                <span>{studentId ? 'Back to Student' : 'Back'}</span>
              </button>
            </div>
          </div>
    </>
  );
}
