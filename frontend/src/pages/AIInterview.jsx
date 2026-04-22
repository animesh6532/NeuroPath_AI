import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { interviewAPI } from "../api/endpoints";
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

    try {
      setLoading(true);
      setError("");

      const response = await interviewAPI.generate({ skills: analysisData.detected_skills });

      navigate("/ai-interview/live", {
        state: {
          skills: response.data.skills,
          questions: response.data.questions,
          resumeName: "My Resume",
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
          Start an AI-powered voice interview experience based on your uploaded resume.
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

        <div className="upload-section" style={{ marginTop: '30px' }}>
          {!analysisData ? (
            <div className="error-text">
              <p>You must upload a resume before starting an interview.</p>
              <button onClick={() => navigate("/")} style={{ marginTop: '15px' }}>Go to Resume Upload</button>
            </div>
          ) : (
            <>
              <p className="selected-file">
                <strong>Targeting Skills:</strong> {analysisData.detected_skills.slice(0, 8).join(", ")}
                {analysisData.detected_skills.length > 8 ? "..." : ""}
              </p>
              {error && <p className="error-text">{error}</p>}
              <button onClick={handleStart} disabled={loading} style={{ marginTop: '20px', padding: '12px 24px', fontSize: '18px' }}>
                {loading ? "Generating Questions..." : "Start Interview Now"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default AIInterview;