import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Users } from "lucide-react";

import { ClassroomCard } from "../components/Cards";
import LoadingSpinner from "../components/LoadingSpinner";
import { AddClassroomModal } from "../components/Modals";
import { useClassrooms } from "../hooks/useApi";
import { useAuth } from "../context/AuthContext";
import { usePermissions } from "../context/PermissionContext";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default function Classrooms() {
  const navigate = useNavigate();
  const [dbClassrooms, setDbClassrooms] = useState([]);
  const [showAddClassModal, setShowAddClassModal] = useState(false);
  const { loadClassrooms, loading } = useClassrooms();
  const { user } = useAuth();
  const { can } = usePermissions();

  useEffect(() => {
    const fetchClassrooms = async () => {
      try {
        const classrooms = await loadClassrooms();
        setDbClassrooms(classrooms);
      } catch (error) {
        console.error('Failed to load classrooms:', error);
      }
    };

    fetchClassrooms();
  }, []);

  const handleClassroomSuccess = async () => {
    const classrooms = await loadClassrooms();
    setDbClassrooms(classrooms);
  };

  return (
    <>
      <div>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 sm:mb-10">
          <div>
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-6xl text-neutral-900 dark:text-neutral-100">Classrooms</h1>
            <p className="mt-2 text-neutral-400 dark:text-neutral-500 text-base font-light">
              {getGreeting()}, {user?.name || "there"}
            </p>
          </div>
          {can('classes', 'manage') && (
            <button
              onClick={() => setShowAddClassModal(true)}
              className="flex items-center space-x-2 px-3 py-2 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-600 dark:text-neutral-300 hover:text-neutral-800 dark:hover:text-neutral-100 hover:border-neutral-400 dark:hover:border-neutral-500 hover:shadow-sm transition-all text-sm"
            >
              <Plus className="w-4 h-4" />
              <span>New Classroom</span>
            </button>
          )}
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
            {dbClassrooms.map((classroom) => (
              <ClassroomCard
                key={classroom.id}
                classroom={classroom}
                studentCount={classroom.students?.length || 0}
                onClick={() => navigate(`/classroom/${encodeURIComponent(classroom.name)}`)}
              />
            ))}
          </div>
        )}

        {!loading && dbClassrooms.length === 0 && (
          <div className="text-center py-20">
            <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-neutral-200/50 dark:bg-neutral-700/50 flex items-center justify-center">
              <Users className="w-7 h-7 text-neutral-400 dark:text-neutral-500" />
            </div>
            <h3 className="font-serif text-xl text-neutral-900 dark:text-neutral-100 mb-2">No classrooms yet</h3>
            <p className="text-neutral-400 dark:text-neutral-500 text-sm font-light max-w-xs mx-auto">
              Get started by creating your first classroom
            </p>
          </div>
        )}
      </div>

      <AddClassroomModal
        isOpen={showAddClassModal}
        onClose={() => setShowAddClassModal(false)}
        onSuccess={handleClassroomSuccess}
        existingClassrooms={dbClassrooms}
      />
    </>
  );
}
