import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../contexts/AppContext";
import { interviewAPI } from "../api/endpoints";
import { motion } from "framer-motion";
import { Mic, Video, Award, Play, FileWarning, BrainCircuit } from "lucide-react";
import { SessionManager } from "../utils/sessionManager";
import { GlassCard, GlassButton, GlassBadge } from "../components/ui/DesignSystem";
import "./AIInterview.css";

function AIInterview() {
  const { analysisData } = useContext(AppContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleStart = async () => {
    if (!analysisData || !analysisData.detected_skills) {
      setError("No resume data found. Please upload your resume first.");
      return;
    }

    // 1. Browser feature validation
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError("Speech recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge.");
      return;
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError("Webcam and microphone access are not supported by this browser.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      // 2. Hardware permissions validation
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        // Close tracks immediately to release the hardware
        stream.getTracks().forEach(track => track.stop());
      } catch (permErr) {
        setError("Microphone & camera permissions are required to start the proctored interview. Please enable them in your browser settings.");
        setLoading(false);
        return;
      }

      // Check session token
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Session token not found. Please log in first.");
        setLoading(false);
        return;
      }

      // Check resume profile loaded
      if (!analysisData || !analysisData.detected_skills || analysisData.detected_skills.length === 0) {
        setError("Resume profile not loaded. Please parse your resume first.");
        setLoading(false);
        return;
      }

      const payload = {
        email: localStorage.getItem("user_email") || "candidate@neuropath.ai",
        name: localStorage.getItem("user_name") || "Candidate",
        skills: analysisData.detected_skills,
        experience: analysisData.experience || [],
        projects: analysisData.projects || []
      };

      const response = await interviewAPI.start(payload);

      if (!response || !response.success || !response.data?.session_id) {
        setError("Backend failed to create active session. Please check backend connection.");
        setLoading(false);
        return;
      }

      const sessionObj = response.data;
      if (!sessionObj.blueprint || sessionObj.blueprint.length === 0) {
        setError("Backend failed to generate interview blueprint.");
        setLoading(false);
        return;
      }

      if (!sessionObj.first_question || !sessionObj.first_question.question_text) {
        setError("Backend failed to generate question plan.");
        setLoading(false);
        return;
      }

      // Persist to authoritative session storage
      SessionManager.setSessionId(sessionObj.session_id, "Candidate clicks Start Interview", "AIInterview.jsx");
      localStorage.setItem("interview_role", sessionObj.role);
      localStorage.setItem("interview_level", sessionObj.level);
      localStorage.setItem("interview_blueprint", JSON.stringify(sessionObj.blueprint));
      localStorage.setItem("interview_first_question", JSON.stringify(sessionObj.first_question));

      navigate("/ai-interview/live", {
        state: {
          session_id: sessionObj.session_id,
          role: sessionObj.role,
          level: sessionObj.level,
          blueprint: sessionObj.blueprint,
          first_question: sessionObj.first_question,
          resumeName: "My Resume",
        },
      });

    } catch (err) {
      console.error(err);
      setError("Failed to initialize stateful interview. Please verify your backend server connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="page-container ai-interview-page"
    >
      <GlassCard className="interview-card" style={{ maxWidth: "800px", margin: "0 auto" }}>
        <GlassBadge status="secondary">AI Interviewer</GlassBadge>
        <h1 style={{ marginTop: "12px", fontSize: "2rem" }}>AI Mock Interview</h1>
        <p className="text-subtitle" style={{ margin: "8px 0 32px 0" }}>
          Practice realistic spoken interviews customized specifically to your resume's technical skills and experience levels.
        </p>

        <div className="feature-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
          <div className="feature-box" style={{ background: "rgba(255, 255, 255, 0.45)", padding: "20px", borderRadius: "16px", border: "1px solid var(--glass-border)" }}>
            <Mic size={22} className="text-secondary" style={{ marginBottom: "12px" }} />
            <h3 style={{ fontSize: "1.05rem" }}>Voice Dialogue</h3>
            <p className="text-small" style={{ margin: 0 }}>Listen and answer using spoken voice, with real-time text transcription.</p>
          </div>

          <div className="feature-box" style={{ background: "rgba(255, 255, 255, 0.45)", padding: "20px", borderRadius: "16px", border: "1px solid var(--glass-border)" }}>
            <Video size={22} className="text-secondary" style={{ marginBottom: "12px" }} />
            <h3 style={{ fontSize: "1.05rem" }}>Camera Proctoring</h3>
            <p className="text-small" style={{ margin: 0 }}>Ensures exam integrity by checking gaze directions and window focus details.</p>
          </div>

          <div className="feature-box" style={{ background: "rgba(255, 255, 255, 0.45)", padding: "20px", borderRadius: "16px", border: "1px solid var(--glass-border)" }}>
            <Award size={22} className="text-secondary" style={{ marginBottom: "12px" }} />
            <h3 style={{ fontSize: "1.05rem" }}>NLP Evaluation</h3>
            <p className="text-small" style={{ margin: 0 }}>Get graded on conceptual accuracy, confidence scores, and communication skills.</p>
          </div>
        </div>

        <div className="upload-section" style={{ marginTop: '36px' }}>
          {!analysisData ? (
            <div className="error-text text-small" style={{ textAlign: "center" }}>
              <FileWarning size={32} className="text-danger" style={{ margin: "0 auto 12px auto" }} />
              <p>You must parse your resume profile before starting a mock interview.</p>
              <GlassButton onClick={() => navigate("/resume")} style={{ marginTop: '16px' }}>
                Go to Resume Upload
              </GlassButton>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
              <span className="selected-file" style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                <BrainCircuit size={14} className="text-secondary" />
                Targeting Skills: <strong>{analysisData.detected_skills.slice(0, 8).join(", ")}</strong>
                {analysisData.detected_skills.length > 8 ? "..." : ""}
              </span>
              {error && <p className="warning-banner" style={{ width: "100%", maxWidth: "400px" }}>{error}</p>}
              <GlassButton onClick={handleStart} disabled={loading} primary style={{ padding: "12px 28px" }}>
                {loading ? "Generating Questions..." : "Start Interview Session"} <Play size={16} />
              </GlassButton>
            </div>
          )}
        </div>
      </GlassCard>
    </motion.div>
  );
}

export default AIInterview;
