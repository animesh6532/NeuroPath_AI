import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { interviewAPI } from "../api/endpoints";
import "./AIInterview.css";

function AIInterviewSetup() {
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
        <p>Your interview will be dynamically generated based on your resume skills.</p>

        {!analysisData ? (
          <div className="error-text">
            <p>You must upload a resume before starting an interview.</p>
            <button onClick={() => navigate("/")} style={{ marginTop: '15px' }}>Go to Resume Upload</button>
          </div>
        ) : (
          <>
            <p className="selected-file">
              <strong>Skills Detected:</strong> {analysisData.detected_skills.slice(0, 8).join(", ")}
              {analysisData.detected_skills.length > 8 ? "..." : ""}
            </p>
            {error && <p className="error-text">{error}</p>}
            <button onClick={handleStart} disabled={loading}>
              {loading ? "Generating Questions..." : "Start AI Interview"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default AIInterviewSetup;