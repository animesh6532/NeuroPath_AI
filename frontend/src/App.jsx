import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";

// Route Guards
import ProtectedRoute from "./components/ProtectedRoute";
import GuestRoute from "./components/GuestRoute";
import FloatingAssistant from "./components/FloatingAssistant";
import LoadingSpinner from "./components/LoadingSpinner";

// Lazy-loaded pages
const Home = lazy(() => import("./pages/Home"));
const About = lazy(() => import("./pages/About"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const ResumePage = lazy(() => import("./pages/ResumePage"));
const PlacementPrediction = lazy(() => import("./pages/PlacementPrediction"));
const LearningRoadmap = lazy(() => import("./pages/LearningRoadmap"));
const Profile = lazy(() => import("./pages/Profile"));
const DailyCoding = lazy(() => import("./pages/DailyCoding"));
const AptitudeTest = lazy(() => import("./pages/AptitudeTest"));

// AI Interview Flow
const AIInterview = lazy(() => import("./pages/AIInterview"));
const AIInterviewLive = lazy(() => import("./pages/AIInterviewLive"));
const InterviewResult = lazy(() => import("./pages/InterviewResult"));
const InterviewReport = lazy(() => import("./pages/InterviewReport"));

function App() {
  const location = useLocation();
  const isLiveInterview = location.pathname === "/ai-interview/live";

  return (
    <>
      {!isLiveInterview && <Navbar />}

      <Suspense fallback={
        <div style={{ minHeight: "80vh", display: "grid", placeItems: "center" }}>
          <LoadingSpinner />
        </div>
      }>
        <Routes>
          {/* ================= PUBLIC & GUEST ROUTES ================= */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route
            path="/login"
            element={
              <GuestRoute>
                <Login />
              </GuestRoute>
            }
          />
          <Route
            path="/register"
            element={
              <GuestRoute>
                <Register />
              </GuestRoute>
            }
          />

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

          <Route
            path="/interview-report"
            element={
              <ProtectedRoute>
                <InterviewReport />
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
            path="/daily-coding"
            element={
              <ProtectedRoute>
                <DailyCoding />
              </ProtectedRoute>
            }
          />

          <Route
            path="/aptitude-test"
            element={
              <ProtectedRoute>
                <AptitudeTest />
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
      </Suspense>
      {!isLiveInterview && <FloatingAssistant />}
    </>
  );
}

export default App;
