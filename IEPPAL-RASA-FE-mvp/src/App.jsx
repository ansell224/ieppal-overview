import React, { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import LoadingSpinner from "./components/LoadingSpinner";

// Auth Redirect Component
function AuthRedirect() {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) return <LoadingSpinner />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (user?.role === 'ADMIN') return <Navigate to="/admin" replace />;
  if (user?.role === 'STUDENT') return <Navigate to="/my-profile" replace />;
  return <Navigate to="/classrooms" replace />;
}

// Protected Route Component
function ProtectedRoute({ children, adminOnly = false, studentOnly = false, allowStudent = false }) {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) return <LoadingSpinner />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  const role = user?.role;

  // Admin-only routes
  if (adminOnly && role !== 'ADMIN') {
    return <Navigate to={role === 'STUDENT' ? '/my-profile' : '/classrooms'} replace />;
  }

  // Student-only routes (e.g. /my-profile)
  if (studentOnly && role !== 'STUDENT') {
    return <Navigate to={role === 'ADMIN' ? '/admin' : '/classrooms'} replace />;
  }

  // Prevent admin from accessing teacher/student routes (unless admin-only)
  if (!adminOnly && !studentOnly && role === 'ADMIN') {
    return <Navigate to="/admin" replace />;
  }

  // Prevent students from accessing teacher-only routes
  if (!adminOnly && !studentOnly && !allowStudent && role === 'STUDENT') {
    return <Navigate to="/my-profile" replace />;
  }

  return children;
}

const Layout = lazy(() => import("./components/Layout"));
const Login = lazy(() => import("./pages/Login"));
const Classrooms = lazy(() => import("./pages/Classrooms"));
const ClassroomDetail = lazy(() => import("./pages/ClassroomDetail"));
const ClassroomSettings = lazy(() => import("./pages/ClassroomSettings"));
const StudentDetail = lazy(() => import("./pages/StudentDetail"));
const MeetingNoteEditor = lazy(() => import("./pages/MeetingNoteEditor"));
const GoalEditor = lazy(() => import("./pages/GoalEditor"));
const GoalDetail = lazy(() => import("./pages/GoalDetail"));
const CreateGoal = lazy(() => import("./pages/CreateGoal"));
const GoalList = lazy(() => import("./pages/GoalList"));
const IEPReportDisplay = lazy(() => import("./pages/IEPReportDisplay"));
const IEPReportHistory = lazy(() => import("./pages/IEPReportHistory"));
const ResponsePrompt = lazy(() => import("./pages/ResponsePrompt"));
const Settings = lazy(() => import("./pages/Settings"));
const StrategyLibrary = lazy(() => import("./pages/StrategyLibrary"));
const SurveyBuilder = lazy(() => import("./pages/SurveyBuilder"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const StudentHome = lazy(() => import("./pages/StudentHome"));
const ProgressDashboard = lazy(() => import("./pages/ProgressDashboard"));
const IepFillReview = lazy(() => import("./pages/IepFillReview"));
const ProgressInsights = lazy(() => import("./pages/ProgressInsights"));

function AppRoutes() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/login" element={<Suspense fallback={<div className="min-h-screen bg-[#f5f1eb]" />}><Login /></Suspense>} />
        <Route path="/" element={<AuthRedirect />} />
        <Route path="/admin" element={<ProtectedRoute adminOnly={true}><AdminDashboard /></ProtectedRoute>} />
        <Route element={<Layout />}>
          <Route path="/my-profile" element={<ProtectedRoute studentOnly={true}><StudentHome /></ProtectedRoute>} />
          <Route path="/classrooms" element={<ProtectedRoute><Classrooms /></ProtectedRoute>} />
          <Route path="/classroom/:classroomName" element={<ProtectedRoute><ClassroomDetail /></ProtectedRoute>} />
          <Route path="/classroom/:classroomName/settings" element={<ProtectedRoute><ClassroomSettings /></ProtectedRoute>} />
          <Route path="/student/:studentId" element={<ProtectedRoute><StudentDetail /></ProtectedRoute>} />
          <Route path="/student/:studentId/meeting-note/new" element={<ProtectedRoute><MeetingNoteEditor /></ProtectedRoute>} />
          <Route path="/student/:studentId/meeting-note/:noteId/edit" element={<ProtectedRoute><MeetingNoteEditor /></ProtectedRoute>} />
          <Route path="/goal-editor" element={<ProtectedRoute><GoalEditor /></ProtectedRoute>} />
          <Route path="/goal/:goalId" element={<ProtectedRoute allowStudent={true}><GoalDetail /></ProtectedRoute>} />
          <Route path="/goal/:goalId/survey/new" element={<ProtectedRoute><SurveyBuilder /></ProtectedRoute>} />
          <Route path="/goal/:goalId/survey/edit" element={<ProtectedRoute><SurveyBuilder /></ProtectedRoute>} />
          <Route path="/create-goal" element={<ProtectedRoute><CreateGoal /></ProtectedRoute>} />
          <Route path="/goals" element={<ProtectedRoute><GoalList /></ProtectedRoute>} />
          <Route path="/iep-report" element={<ProtectedRoute><IEPReportDisplay /></ProtectedRoute>} />
          <Route path="/iep-history" element={<ProtectedRoute><IEPReportHistory /></ProtectedRoute>} />
          <Route path="/response-prompt" element={<ProtectedRoute><ResponsePrompt /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute allowStudent={true}><Settings /></ProtectedRoute>} />
          <Route path="/strategy-library" element={<ProtectedRoute><StrategyLibrary /></ProtectedRoute>} />
          <Route path="/progress" element={<ProgressDashboard />} />
          <Route path="/students/:studentId/iep/fill" element={<ProtectedRoute><IepFillReview /></ProtectedRoute>} />
          <Route path="/student/:studentId/goal/:goalId/insights" element={<ProtectedRoute><ProgressInsights /></ProtectedRoute>} />
        </Route>
        <Route path="*" element={<h2 className="text-center mt-10">404 - Page Not Found</h2>} />
      </Routes>
    </Suspense>
  );
}

export default function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}
