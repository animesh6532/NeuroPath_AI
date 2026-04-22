import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { interviewAPI } from "../api/endpoints";
import "./AIInterview.css";

function AIInterview() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleStart = async () => {
    if (!file) {
      setError("Please upload your resume PDF first.");
      return;
    }

    try {
      setLoading(true);
      setError("");

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
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-interview-page">
      <div className="interview-card">
        <h1>AI Mock Interview</h1>
        <p className="subtitle">
          Upload your resume and start an AI-powered voice interview experience.
        </p>

        <div className="feature-grid">
          <div className="feature-box">
            <h3>🎤 Voice Interview</h3>
            <p>AI asks technical questions using voice prompts.</p>
          </div>

          <div className="feature-box">
            <h3>📷 Camera Monitoring</h3>
            <p>Camera will open only after interview starts.</p>
          </div>

          <div className="feature-box">
            <h3>🧠 AI Evaluation</h3>
            <p>Get feedback on confidence, relevance, and communication.</p>
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

          <button onClick={handleStart} disabled={loading}>
            {loading ? "Generating Questions..." : "Start Interview"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AIInterview;