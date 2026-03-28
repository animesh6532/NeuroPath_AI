import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { interviewAPI } from "../api/endpoints";
import "./AIInterview.css";

function AIInterviewSetup() {
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
        <p>Upload your resume to generate skill-based interview questions.</p>

        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => setFile(e.target.files[0])}
        />

        {file && <p className="selected-file">Selected: {file.name}</p>}
        {error && <p className="error-text">{error}</p>}

        <button onClick={handleStart} disabled={loading}>
          {loading ? "Generating Questions..." : "Start AI Interview"}
        </button>
      </div>
    </div>
  );
}

export default AIInterviewSetup;