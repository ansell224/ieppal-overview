// src/pages/GoalEditor.jsx
import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';

import { IEPContext } from '../context/IEPContext';

export default function GoalEditor() {
  const navigate = useNavigate();
  const { iepData } = useContext(IEPContext);
  const { studentInfo, goals } = iepData;

  return (
    <>

          <div className="bg-white dark:bg-neutral-800 rounded-3xl shadow-lg p-10 w-full">
            <h2 className="text-2xl font-bold text-neutral-800 dark:text-neutral-200 mb-6">Current Goals</h2>
            {goals && goals.length > 0 ? (
              <div className="space-y-6">
                {goals.map((goal, index) => (
                  <div key={index} className="border border-neutral-300 dark:border-neutral-600 rounded-xl p-6">
                    <p className="text-xl font-semibold text-neutral-800 dark:text-neutral-200 mb-2">
                      Title: <span className="font-normal">{goal.title || "N/A"}</span>
                    </p>
                    <p className="text-lg text-neutral-800 dark:text-neutral-200 mb-2">
                      Description: <span className="font-normal">{goal.description || "N/A"}</span>
                    </p>
                    <p className="text-lg text-neutral-800 dark:text-neutral-200 mb-2">
                      Skill Area:{" "}
                      <span className="inline-block px-3 py-1 bg-pink-500 text-white rounded-full text-sm">
                        {goal.skill || "N/A"}
                      </span>
                    </p>
                    <p className="text-lg text-neutral-800 dark:text-neutral-200 mb-2">
                      Target Date: <span className="font-normal">{goal.targetDate ? new Date(goal.targetDate).toLocaleDateString() : "N/A"}</span>
                    </p>
                    <p className="text-lg text-neutral-800 dark:text-neutral-200">
                      Status: <span className="font-normal">{goal.status || "ACTIVE"}</span>
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-neutral-600 dark:text-neutral-300">No goals have been set for this student yet.</p>
            )}
          </div>

          <div className="flex flex-col md:flex-row md:space-x-8 space-y-4 md:space-y-0 mt-10 mb-10">
            <button
              onClick={() => navigate("/new-student/add-goal")}
              className="flex-1 px-5 py-2.5 bg-neutral-800 dark:bg-neutral-200 text-white dark:text-neutral-900 text-sm rounded-lg hover:bg-neutral-900 dark:hover:bg-neutral-300 transition-colors"
            >
              Add New Goal
            </button>
            <button
              onClick={() => navigate("/goal-progress")}
              className="flex-1 px-5 py-2.5 bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 text-sm border border-neutral-300 dark:border-neutral-600 rounded-lg hover:border-neutral-400 dark:hover:border-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-100 transition-colors"
            >
              View Progress
            </button>
          </div>

          <div className="text-center">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center space-x-2 px-3 py-2 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-600 dark:text-neutral-300 hover:text-neutral-800 dark:hover:text-neutral-100 hover:border-neutral-400 dark:hover:border-neutral-500 hover:shadow-sm transition-all text-sm"
            >
              <span className="text-base leading-none">&lsaquo;</span>
              <span>Back</span>
            </button>
          </div>
    </>
  );
}
