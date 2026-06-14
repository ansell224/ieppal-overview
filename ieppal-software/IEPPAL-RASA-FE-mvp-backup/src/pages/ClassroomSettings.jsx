import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { useClassrooms } from "../hooks/useApi";
import LoadingSpinner, { InlineSpinner } from "../components/LoadingSpinner";
import { CLASSROOM_ICONS } from "../utils/classroomIcons";

export default function ClassroomSettings() {
  const { classroomName } = useParams();
  const navigate = useNavigate();
  const { loadClassrooms, updateClassroom, deleteClassroom, loading } = useClassrooms();

  const [classroom, setClassroom] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("book");
  const [pageLoading, setPageLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const classrooms = await loadClassrooms();
        const decodedName = decodeURIComponent(classroomName);
        const found = classrooms.find(c => c.name === decodedName);
        if (found) {
          setClassroom(found);
          setName(found.name);
          setDescription(found.description || "");
          setIcon(found.icon || "book");
        }
      } catch (error) {
        // handled by loading state
      } finally {
        setPageLoading(false);
      }
    };
    fetchData();
  }, [classroomName]);

  const handleSave = async () => {
    if (!name.trim()) return;

    try {
      await updateClassroom(classroom.id, { name: name.trim(), description: description.trim(), icon });
      navigate(`/classroom/${encodeURIComponent(name.trim())}`);
    } catch (error) {
      // Error handling can be added here if needed
    }
  };

  const handleDelete = async () => {
    await deleteClassroom(classroom.id);
    navigate('/classrooms');
  };

  if (pageLoading) {
    return <LoadingSpinner />;
  }

  if (!classroom) return <div>Classroom not found</div>;

  return (
    <>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 sm:mb-10">
        <div>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-6xl text-neutral-900 dark:text-neutral-100">Settings</h1>
          <p className="mt-2 text-neutral-400 dark:text-neutral-500 text-base font-light">{classroom.name}</p>
        </div>
        <button
          onClick={() => navigate(`/classroom/${encodeURIComponent(classroom.name)}`)}
          className="flex items-center space-x-2 px-3 py-2 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-600 dark:text-neutral-300 hover:text-neutral-800 dark:hover:text-neutral-100 hover:border-neutral-400 dark:hover:border-neutral-500 hover:shadow-sm transition-all text-sm"
        >
          <span className="text-base leading-none">&lsaquo;</span>
          <span>Back to {classroom.name}</span>
        </button>
      </div>

      <div className="max-w-lg">
        {/* Classroom Name */}
        <div className="mb-6">
          <label className="block text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1.5">
            Classroom Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-100 text-sm focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-500 focus:ring-1 focus:ring-neutral-400 dark:focus:ring-neutral-500 focus:bg-white dark:focus:bg-neutral-700 transition-colors"
          />
        </div>

        {/* Description */}
        <div className="mb-6">
          <label className="block text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1.5">
            Description
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional"
            className="w-full px-3 py-2.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-100 text-sm placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-500 focus:ring-1 focus:ring-neutral-400 dark:focus:ring-neutral-500 focus:bg-white dark:focus:bg-neutral-700 transition-colors"
          />
        </div>

        {/* Icon */}
        <div className="mb-8">
          <label className="block text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1.5">
            Icon
          </label>
          <div className="grid grid-cols-6 gap-2">
            {CLASSROOM_ICONS.map(({ id, label, Icon }) => {
              const selected = icon === id;
              return (
                <button
                  key={id}
                  type="button"
                  title={label}
                  onClick={() => setIcon(id)}
                  className={`flex items-center justify-center w-full aspect-square rounded-lg border transition-colors ${
                    selected
                      ? 'bg-neutral-800 dark:bg-neutral-200 text-white dark:text-neutral-900 border-neutral-800 dark:border-neutral-200'
                      : 'bg-neutral-50 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 border-neutral-200 dark:border-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-500'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <button
            onClick={handleSave}
            disabled={!name.trim() || loading}
            className="px-4 py-2 bg-neutral-800 dark:bg-neutral-200 text-white dark:text-neutral-900 rounded-lg text-sm font-medium hover:bg-neutral-900 dark:hover:bg-neutral-300 transition-colors disabled:opacity-40"
          >
            {loading ? <span className="flex items-center justify-center gap-2"><InlineSpinner /> Saving...</span> : 'Save Changes'}
          </button>
        </div>

        {/* Danger Zone */}
        <div className="mt-16 pt-8 border-t border-neutral-200 dark:border-neutral-700">
          <h2 className="text-sm font-medium text-neutral-800 dark:text-neutral-200 mb-1">Delete Classroom</h2>
          <p className="text-sm text-neutral-400 dark:text-neutral-500 mb-4">
            Permanently delete this classroom and remove all student assignments. This cannot be undone.
          </p>

          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="px-4 py-2 bg-white dark:bg-neutral-800 border border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 rounded-lg text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
            >
              Delete Classroom
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <button
                onClick={handleDelete}
                disabled={loading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {loading ? <span className="flex items-center justify-center gap-2"><InlineSpinner /> Deleting...</span> : 'Yes, Delete'}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 rounded-lg text-sm font-medium hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
