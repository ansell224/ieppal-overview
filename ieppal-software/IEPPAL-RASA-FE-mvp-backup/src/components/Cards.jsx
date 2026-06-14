import React from 'react';
import { Users, Edit2 } from 'lucide-react';
import { getClassroomIcon } from '../utils/classroomIcons';

// Classroom Card Component
export const ClassroomCard = ({ classroom, studentCount, onClick }) => {
  const IconComponent = getClassroomIcon(classroom?.icon);
  return (
    <div
      className="card-hover flex flex-col h-full bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl hover:shadow-lg transition-all duration-300 cursor-pointer group"
      onClick={onClick}
    >
      <div className="p-5 border-b border-neutral-100 dark:border-neutral-700">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h2 className="font-serif text-xl text-neutral-900 dark:text-neutral-100 leading-snug truncate">
              {classroom?.name || 'Unnamed Classroom'}
            </h2>
            <p className="text-neutral-400 dark:text-neutral-500 text-xs font-light">
              {studentCount} {studentCount === 1 ? 'student' : 'students'}
            </p>
          </div>
          <IconComponent className="w-7 h-7 text-neutral-800 dark:text-neutral-300 flex-shrink-0" strokeWidth={1.5} />
        </div>
        {classroom?.description && (
          <p className="text-neutral-500 dark:text-neutral-400 text-sm mt-2 font-light line-clamp-2">
            {classroom.description}
          </p>
        )}
      </div>

      <div className="flex-1 p-4">
        {classroom?.students?.length > 0 ? (
          <div className="space-y-2">
            {classroom.students.map(student => (
              <div
                key={student.id}
                className="flex items-center p-2.5 rounded-lg hover:bg-[#f5f1eb]/60 dark:hover:bg-neutral-700/60 transition-all"
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-pink-500/10 to-orange-500/10 border border-pink-200/50 dark:border-pink-500/30 flex items-center justify-center text-pink-500 text-sm font-medium mr-3">
                  {student.studentName?.charAt(0).toUpperCase() || student.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200">{student.studentName || student.name}</p>
                  <p className="text-xs text-neutral-400 dark:text-neutral-500">Level {student.level}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-6 text-center">
            <div className="mx-auto h-12 w-12 rounded-full bg-neutral-100 dark:bg-neutral-700 flex items-center justify-center mb-2">
              <Users className="w-5 h-5 text-neutral-400 dark:text-neutral-500" />
            </div>
            <p className="text-neutral-400 dark:text-neutral-500 text-sm font-light">No students yet</p>
          </div>
        )}
      </div>

      <div className="mt-auto px-4 pb-4">
        <div className="w-full py-2 px-4 rounded-lg bg-neutral-50 dark:bg-neutral-700 text-neutral-500 dark:text-neutral-400 text-xs font-medium text-center group-hover:bg-gradient-to-r group-hover:from-pink-500 group-hover:to-orange-500 group-hover:text-white transition-all duration-300">
          {studentCount > 0 ? 'See Full Class' : 'Add Students'}
        </div>
      </div>
    </div>
  );
};

// Student Card Component
export const StudentCard = ({ student, goals = [], onClick }) => {
  return (
    <div
      onClick={onClick}
      className="bg-white dark:bg-neutral-800 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:scale-105"
    >
      <div className="p-6">
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-pink-500 to-rose-400 flex items-center justify-center text-white text-xl font-bold">
            {student.name?.charAt(0).toUpperCase() || 'S'}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-100">{student.name}</h3>
            <p className="text-neutral-500 dark:text-neutral-400">Level {student.level}</p>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-neutral-600 dark:text-neutral-400">Goals:</span>
            <span className={`font-medium px-2 py-1 rounded-full text-xs ${
              goals.length >= 1
                ? 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-400'
                : 'bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-400'
            }`}>
              {goals.length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Goal Card Component
export const GoalCard = ({ goal, onClick, onEdit }) => {
  return (
    <div
      className="bg-white dark:bg-neutral-800 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer"
      onClick={onClick}
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${goal.color || 'from-blue-500 to-indigo-400'} flex items-center justify-center text-white font-bold`}>
            {goal.title?.charAt(0) || 'G'}
          </div>
          {onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="p-2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-full transition-colors"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          )}
        </div>

        <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-100 mb-2">
          {goal.title}
        </h3>

        <p className="text-neutral-600 dark:text-neutral-400 text-sm mb-4 line-clamp-2">
          {goal.description}
        </p>

        <div className="flex items-center justify-between text-sm">
          <span className="text-neutral-500 dark:text-neutral-400">{goal.category}</span>
          <span className="text-neutral-600 dark:text-neutral-300 font-medium">View Details</span>
        </div>
      </div>
    </div>
  );
};
