import { useLocation, useNavigate } from "react-router-dom";
import "./AIInterview.css";

function InterviewResult() {
  const location = useLocation();
  const navigate = useNavigate();

  const result = location.state?.result || {};
  const answers = location.state?.answers || [];
  const skills = location.state?.skills || [];
  const violations = location.state?.violations || [];

  return (
    <div className="ai-interview-page">
      <div className="result-card">
        <h1>📊 Interview Report</h1>
        <p className="subtitle">
          Here is your AI-powered performance evaluation
        </p>

        {/* ===== SCORE SECTION ===== */}
        <div className="result-grid">
          <div className="result-box">
            <h3>⭐ Overall Score</h3>
            <p style={{ fontSize: "28px", fontWeight: "bold" }}>
              {result.score || "N/A"} / 100
            </p>
          </div>

          <div className="result-box">
            <h3>🧠 Confidence</h3>
            <p>{result.confidence || "Not Available"}</p>
          </div>

          <div className="result-box">
            <h3>💬 Communication</h3>
            <p>{result.communication || "Not Available"}</p>
          </div>

          <div className="result-box">
            <h3>📌 Relevance</h3>
            <p>{result.relevance || "Not Available"}</p>
          </div>
        </div>

        {/* ===== SKILLS ===== */}
        <div className="result-box">
          <h3>🛠️ Detected Skills</h3>
          <ul>
            {skills.map((skill, index) => (
              <li key={index}>✔ {skill}</li>
            ))}
          </ul>
        </div>

        {/* ===== VIOLATIONS ===== */}
        <div className="result-box">
          <h3>🚫 Proctoring Violations</h3>
          {violations.length === 0 ? (
            <p style={{ color: "#22c55e" }}>No violations detected 🎉</p>
          ) : (
            <ul style={{ color: "#f87171" }}>
              {violations.map((v, i) => (
                <li key={i}>⚠ {v}</li>
              ))}
            </ul>
          )}
        </div>

        {/* ===== FEEDBACK ===== */}
        <div className="result-box">
          <h3>📋 AI Feedback</h3>
          <p>{result.feedback || "No feedback generated"}</p>
        </div>

        {/* ===== ANSWERS ===== */}
        <div className="result-box">
          <h3>📝 Your Answers</h3>
          {answers.map((item, index) => (
            <div key={index} style={{ marginBottom: "15px" }}>
              <p><strong>Q{index + 1}:</strong> {item.question}</p>
              <p style={{ color: "#cbd5e1" }}>
                <strong>Answer:</strong> {item.answer}
              </p>
            </div>
          ))}
        </div>

        {/* ===== ACTION BUTTONS ===== */}
        <div className="interview-actions">
          <button onClick={() => navigate("/dashboard")}>
            Go to Dashboard
          </button>

          <button onClick={() => navigate("/placement")}>
            Predict Placement
          </button>

          <button onClick={() => navigate("/roadmap")}>
            Learning Roadmap
          </button>
        </div>
      </div>
    </div>
  );
}

export default InterviewResult;