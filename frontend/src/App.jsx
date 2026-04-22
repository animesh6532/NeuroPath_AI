import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ResumePage from "./pages/ResumePage";
import PlacementPrediction from "./pages/PlacementPrediction";
import LearningRoadmap from "./pages/LearningRoadmap";
import Profile from "./pages/Profile";

// ✅ AI Interview Flow
import AIInterview from "./pages/AIInterview";
import AIInterviewLive from "./pages/AIInterviewLive";
import InterviewResult from "./pages/InterviewResult";

import ProtectedRoute from "./components/ProtectedRoute";
import FloatingAssistant from "./components/FloatingAssistant";

function App() {
  return (
    <>
      <Navbar />

      <Routes>
        {/* ================= PUBLIC ROUTES ================= */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* ================= PROTECTED ROUTES ================= */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/resume"
          element={
            <ProtectedRoute>
              <ResumePage />
            </ProtectedRoute>
          }
        />

        {/* ================= AI INTERVIEW FLOW ================= */}
        <Route
          path="/interview"
          element={
            <ProtectedRoute>
              <AIInterview />
            </ProtectedRoute>
          }
        />

        <Route
          path="/ai-interview/live"
          element={
            <ProtectedRoute>
              <AIInterviewLive />
            </ProtectedRoute>
          }
        />

        <Route
          path="/interview-result"
          element={
            <ProtectedRoute>
              <InterviewResult />
            </ProtectedRoute>
          }
        />

        {/* ================= OTHER FEATURES ================= */}
        <Route
          path="/placement"
          element={
            <ProtectedRoute>
              <PlacementPrediction />
            </ProtectedRoute>
          }
        />

        <Route
          path="/roadmap"
          element={
            <ProtectedRoute>
              <LearningRoadmap />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* ================= FALLBACK ================= */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <FloatingAssistant />
    </>
  );
}

export default App;