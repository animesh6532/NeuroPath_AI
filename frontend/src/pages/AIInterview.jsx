import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { interviewAPI } from "../api/endpoints";
import CameraMonitor from "../components/CameraMonitor";
import "./AIInterview.css";

function AIInterview() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [warning, setWarning] = useState("");
  const navigate = useNavigate();

  // 🔒 Fullscreen + Tab Switch Detection when interview starts
  useEffect(() => {
    if (!interviewStarted) return;

    const enterFullscreen = async () => {
      try {
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
        }
      } catch (err) {
        console.warn("Fullscreen request failed:", err);
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        alert("Interview terminated: Tab switching is not allowed.");
        navigate("/dashboard");
      }
    };

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        alert("Interview terminated: Fullscreen mode exited.");
        navigate("/dashboard");
      }
    };

    enterFullscreen();
    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [interviewStarted, navigate]);

  const handleViolation = (reason) => {
    alert("Interview terminated: " + reason);
    navigate("/dashboard");
  };

  const handleStart = async () => {
    if (!file) {
      setError("Please upload your resume PDF first.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setWarning("");
      setInterviewStarted(true);

      const response = await interviewAPI.start(file);

      navigate("/ai-interview/live", {
        state: {
          skills: response.data.skills,
          questions: response.data.questions,
          resumeName: file.name,
        },
      });
    } catch (err) {
      console.error(err);
      setError("Failed to start AI interview.");
      setInterviewStarted(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-interview-page">
      <div className="interview-card">
        <h1>AI Mock Interview</h1>
        <p className="subtitle">
          Upload your resume and start a strict AI-powered voice interview.
        </p>

        <div className="feature-grid">
          <div className="feature-box">
            <h3>🎤 Voice Interview</h3>
            <p>AI asks technical questions and listens to your spoken answers.</p>
          </div>

          <div className="feature-box">
            <h3>📷 Webcam Proctoring</h3>
            <p>Face presence and movement will be monitored during interview.</p>
          </div>

          <div className="feature-box">
            <h3>🚫 Anti-Cheating</h3>
            <p>Tab switching, leaving fullscreen, or suspicious movement will stop the interview.</p>
          </div>
        </div>

        <div className="upload-section">
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => setFile(e.target.files[0])}
          />

          {file && <p className="selected-file">📄 {file.name}</p>}
          {error && <p className="error-text">{error}</p>}
          {warning && <p className="warning-text">{warning}</p>}

          <button onClick={handleStart} disabled={loading}>
            {loading ? "Preparing Interview..." : "Start Interview"}
          </button>
        </div>

        {/* 📷 Camera Preview */}
        <div className="camera-preview-section">
          <h3>Camera Check</h3>
          <p className="camera-note">
            Please allow camera access before starting your interview.
          </p>
          <CameraMonitor onViolation={handleViolation} />
        </div>
      </div>
    </div>
  );
}

export default AIInterview;