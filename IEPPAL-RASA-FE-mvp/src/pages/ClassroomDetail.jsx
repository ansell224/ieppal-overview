import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Users, Settings, Plus, Trash2, UserPlus, AlertTriangle } from "lucide-react";

import { useClassrooms, useGoals, useStudents } from "../hooks/useApi";
import { useAuth } from "../context/AuthContext";
import { usePermissions } from "../context/PermissionContext";
import { apiClient } from "../apiClient";
import { getClassroomIcon } from "../utils/classroomIcons";
import { Modal, ModalHeader, ModalContent, ModalFooter, Button } from "../components/UI";
import LoadingSpinner, { InlineSpinner } from "../components/LoadingSpinner";

export default function ClassroomDetail() {
  const { classroomName } = useParams();
  const navigate = useNavigate();
  const { can } = usePermissions();
  const { loading: authLoading } = useAuth();
  const { loadClassrooms, authReady: classroomsAuthReady } = useClassrooms();
  const { loadGoals, authReady: goalsAuthReady } = useGoals();
  const { createStudent, deleteStudent, loading: studentLoading } = useStudents();

  const [classroom, setClassroom] = useState(null);
  const [students, setStudents] = useState([]);
  const [studentGoals, setStudentGoals] = useState({});
  const [studentIEDs, setStudentIEDs] = useState({});
  const [formTypes, setFormTypes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [newStudentName, setNewStudentName] = useState("");
  const [newStudentLevel, setNewStudentLevel] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [addMode, setAddMode] = useState("new");
  const [existingStudents, setExistingStudents] = useState([]);
  const [selectedExistingStudent, setSelectedExistingStudent] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    if (!classroomsAuthReady || !goalsAuthReady) return;

    const fetchClassroomData = async () => {
      try {
        const [classrooms, allStudents, allForms] = await Promise.all([
          loadClassrooms(),
          apiClient.getStudents(),
          apiClient.getIEPAllForms()
        ]);
        setFormTypes(allForms.map(f => f.formType));
        if (classrooms) {
          const decodedName = decodeURIComponent(classroomName);
          const foundClassroom = classrooms.find(c => c.name === decodedName);

          if (foundClassroom) {
            setClassroom(foundClassroom);
            setStudents(foundClassroom.students || []);
            const unassigned = allStudents.filter(s => !s.classroomId);
            setExistingStudents(unassigned);
            setLoading(false);

            // Load goals and IEDs for all students in background
            if (foundClassroom.students.length > 0) {
              const goalsPromises = foundClassroom.students.map(student =>
                loadGoals(student.id).catch(() => [])
              );

              const iedsPromises = foundClassroom.students.map(student =>
                apiClient.getStudentReports(student.id).catch(() => [])
              );

              Promise.all([Promise.all(goalsPromises), Promise.all(iedsPromises)]).then(([goalsResults, iedsResults]) => {
                const goalsMap = {};
                const iedsMap = {};
                foundClassroom.students.forEach((student, index) => {
                  goalsMap[student.id] = goalsResults[index];
                  iedsMap[student.id] = iedsResults[index];
                });
                setStudentGoals(goalsMap);
                setStudentIEDs(iedsMap);
              });
            }
          } else {
            setLoading(false);
          }
        }
      } catch (error) {
        console.error('Failed to load classroom:', error);
        setLoading(false);
      }
    };

    fetchClassroomData();
  }, [classroomName, classroomsAuthReady, goalsAuthReady]);

  const handleAddStudent = async () => {
    if (addMode === "new") {
      if (!newStudentName.trim()) return;

      try {
        await createStudent({
          name: newStudentName.trim(),
          level: newStudentLevel.trim(),
          classroomId: classroom.id
        });

        const classrooms = await loadClassrooms();
        const decodedName = decodeURIComponent(classroomName);
        const found = classrooms.find(c => c.name === decodedName);
        if (found) {
          setStudents(found.students || []);
        }

        setNewStudentName("");
        setNewStudentLevel("");
        setShowAddModal(false);
      } catch (error) {
        console.error('Failed to add student:', error);
      }
    } else {
      if (!selectedExistingStudent) return;

      try {
        await apiClient.updateStudent(parseInt(selectedExistingStudent), {
          classroomId: classroom.id
        });

        const classrooms = await loadClassrooms();
        const allStudents = await apiClient.getStudents();
        const decodedName = decodeURIComponent(classroomName);
        const found = classrooms.find(c => c.name === decodedName);
        if (found) {
          setStudents(found.students || []);
          const unassigned = allStudents.filter(s => !s.classroomId || s.classroomId !== found.id);
          setExistingStudents(unassigned);
        }

        setSelectedExistingStudent("");
        setShowAddModal(false);
      } catch (error) {
        console.error('Failed to add existing student:', error);
      }
    }
  };

  const openDeleteModal = (student) => {
    setStudentToDelete(student);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setStudentToDelete(null);
    setShowDeleteModal(false);
  };

  const handleDeleteStudent = async () => {
    if (!studentToDelete) return;

    try {
      await deleteStudent(studentToDelete.id);
      setStudents(students.filter(s => s.id !== studentToDelete.id));
      closeDeleteModal();
    } catch (error) {
      console.error('Failed to delete student:', error);
    }
  };

  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!classroom) {
    return (
      <>
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-neutral-800 dark:text-neutral-200 mb-2">Classroom not found</h2>
            <button
              onClick={() => navigate('/classrooms')}
              className="flex items-center space-x-2 px-3 py-2 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-600 dark:text-neutral-300 hover:text-neutral-800 dark:hover:text-neutral-100 hover:border-neutral-400 dark:hover:border-neutral-500 hover:shadow-sm transition-all text-sm"
            >
              <span className="text-base leading-none">&lsaquo;</span>
              <span>Back to Classrooms</span>
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 sm:mb-10">
        <div>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-6xl text-neutral-900 dark:text-neutral-100">{classroom.name}</h1>
          {classroom.description && (
            <p className="mt-2 text-neutral-500 dark:text-neutral-400 text-base font-light">{classroom.description}</p>
          )}
          <div className="flex items-center gap-3 mt-2">
            <span className="inline-flex items-center justify-center w-7 h-7 bg-neutral-100 dark:bg-neutral-700 rounded-full text-neutral-500 dark:text-neutral-400">
              {React.createElement(getClassroomIcon(classroom.icon), { className: "w-3.5 h-3.5" })}
            </span>
            <span className="text-neutral-400 dark:text-neutral-500 text-sm font-light">{filteredStudents.length} {filteredStudents.length === 1 ? 'student' : 'students'}</span>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => navigate('/classrooms')}
            className="flex items-center space-x-2 px-3 py-2 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-600 dark:text-neutral-300 hover:text-neutral-800 dark:hover:text-neutral-100 hover:border-neutral-400 dark:hover:border-neutral-500 hover:shadow-sm transition-all text-sm"
          >
            <span className="text-base leading-none">&lsaquo;</span>
            <span>Back to Classrooms</span>
          </button>
          {can('studentProfiles', 'manage') && (
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center space-x-2 px-3 py-2 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-600 dark:text-neutral-300 hover:text-neutral-800 dark:hover:text-neutral-100 hover:border-neutral-400 dark:hover:border-neutral-500 hover:shadow-sm transition-all text-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add Student</span>
            </button>
          )}
          <button
            onClick={() => navigate(`/classroom/${encodeURIComponent(classroom.name)}/settings`)}
            className="flex items-center space-x-2 px-3 py-2 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-600 dark:text-neutral-300 hover:text-neutral-800 dark:hover:text-neutral-100 hover:border-neutral-400 dark:hover:border-neutral-500 hover:shadow-sm transition-all text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>Classroom Settings</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-sm mb-6">
            <input
              type="text"
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm focus:outline-none focus:border-pink-400 focus:ring-1 focus:ring-pink-400 focus:bg-white dark:focus:bg-neutral-800 transition-colors"
            />
            <svg className="absolute left-3 top-3 w-4 h-4 text-neutral-400 dark:text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
      </div>

          {/* Students Grid */}
          {filteredStudents.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
              {filteredStudents.map((student) => (
                <div
                  key={student.id}
                  onClick={() => navigate(`/student/${student.id}`)}
                  className="card-hover bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600 hover:shadow-md transition-all duration-200 cursor-pointer relative group"
                >
                  <button
                    onClick={(e) => { e.stopPropagation(); openDeleteModal(student); }}
                    className="absolute top-3 right-3 p-1.5 text-neutral-300 dark:text-neutral-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all z-10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="p-5">
                    <div className="mb-4">
                      <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">{student.name}</h3>
                      <p className="text-neutral-400 dark:text-neutral-500 text-sm">Grade {student.level}</p>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex items-center gap-1.5 text-sm text-neutral-500 dark:text-neutral-400">
                        <span className="font-medium">{studentIEDs[student.id] === undefined ? '...' : (new Set((studentIEDs[student.id] || []).filter(r => formTypes.includes(r.type)).map(r => r.type)).size)}</span>
                        <span>IEPs</span>
                      </div>
                      <div className="w-px h-4 bg-neutral-200 dark:bg-neutral-700 self-center"></div>
                      <div className="flex items-center gap-1.5 text-sm text-neutral-500 dark:text-neutral-400">
                        <span className="font-medium">{studentGoals[student.id] === undefined ? '...' : (studentGoals[student.id]?.length || 0)}</span>
                        <span>Goals</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center min-h-[40vh]">
              <div className="text-center">
                <div className="w-24 h-24 bg-neutral-100 dark:bg-neutral-700 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Users className="w-12 h-12 text-neutral-400 dark:text-neutral-500" />
                </div>
                <h3 className="text-xl font-semibold text-neutral-800 dark:text-neutral-200 mb-2">No students found</h3>
                <p className="text-neutral-600 dark:text-neutral-300 mb-6">
                  {searchTerm ? 'Try adjusting your search terms.' : 'This classroom is empty.'}
                </p>

              </div>
            </div>
          )}

      {/* Add Student Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowAddModal(false)}>
          <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-lg max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-neutral-200 dark:border-neutral-700">
              <h2 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200">Add Student</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-5">
              <div className="flex bg-neutral-100 dark:bg-neutral-700 rounded-lg p-0.5 mb-5">
                <button
                  onClick={() => setAddMode("new")}
                  className={`flex-1 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    addMode === "new"
                      ? 'bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 shadow-sm'
                      : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200'
                  }`}
                >
                  New Student
                </button>
                <button
                  onClick={() => setAddMode("existing")}
                  className={`flex-1 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    addMode === "existing"
                      ? 'bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 shadow-sm'
                      : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200'
                  }`}
                >
                  Existing Student
                </button>
              </div>
              {addMode === "new" ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1.5">Name</label>
                    <input
                      type="text"
                      placeholder="Student name"
                      value={newStudentName}
                      onChange={(e) => setNewStudentName(e.target.value)}
                      className="w-full px-3 py-2.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-100 text-sm placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-500 focus:ring-1 focus:ring-neutral-400 dark:focus:ring-neutral-500 focus:bg-white dark:focus:bg-neutral-800 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1.5">Grade</label>
                    <select
                      value={newStudentLevel}
                      onChange={(e) => setNewStudentLevel(e.target.value)}
                      className="w-full px-3 py-2.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-100 text-sm focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-500 focus:ring-1 focus:ring-neutral-400 dark:focus:ring-neutral-500 focus:bg-white dark:focus:bg-neutral-800 transition-colors appearance-none cursor-pointer"
                    >
                      <option value="">Select grade</option>
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4">4</option>
                      <option value="5">5</option>
                      <option value="6">6</option>
                      <option value="7">7</option>
                      <option value="8">8</option>
                      <option value="9">9</option>
                      <option value="10">10</option>
                      <option value="11">11</option>
                      <option value="12">12</option>
                    </select>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1.5">Select Student</label>
                  <select
                    value={selectedExistingStudent}
                    onChange={(e) => setSelectedExistingStudent(e.target.value)}
                    className="w-full px-3 py-2.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-100 text-sm focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-500 focus:ring-1 focus:ring-neutral-400 dark:focus:ring-neutral-500 focus:bg-white dark:focus:bg-neutral-800 transition-colors appearance-none cursor-pointer"
                  >
                    <option value="">Choose a student...</option>
                    {existingStudents.map(student => (
                      <option key={student.id} value={student.id}>
                        {student.name} (Grade {student.level})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            <div className="flex items-center justify-end gap-3 px-5 pb-5">
              <button
                onClick={() => setShowAddModal(false)}
                disabled={studentLoading}
                className="px-4 py-2 bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 rounded-lg text-sm font-medium hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddStudent}
                disabled={
                  addMode === "new"
                    ? (!newStudentName.trim() || !newStudentLevel.trim() || studentLoading)
                    : (!selectedExistingStudent || studentLoading)
                }
                className="px-4 py-2 bg-neutral-800 dark:bg-neutral-200 text-white dark:text-neutral-900 rounded-lg text-sm font-medium hover:bg-neutral-900 dark:hover:bg-neutral-300 transition-colors disabled:opacity-40"
              >
                {studentLoading ? <span className="flex items-center justify-center gap-2"><InlineSpinner /> Adding...</span> : 'Add Student'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal isOpen={showDeleteModal} onClose={closeDeleteModal} className="max-w-md">
        <ModalHeader
          title="Delete Student"
          onClose={closeDeleteModal}
          gradient="from-red-500 to-red-600"
          icon={AlertTriangle}
        />
        <ModalContent>
          <p className="text-neutral-700 dark:text-neutral-300 mb-4">
            Are you sure you want to delete <strong>{studentToDelete?.name}</strong>? This action cannot be undone.
          </p>
        </ModalContent>
        <ModalFooter>
          <Button variant="secondary" onClick={closeDeleteModal} disabled={studentLoading}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDeleteStudent}
            disabled={studentLoading}
          >
            {studentLoading ? <span className="flex items-center justify-center gap-2"><InlineSpinner /> Deleting...</span> : 'Delete Student'}
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
}
