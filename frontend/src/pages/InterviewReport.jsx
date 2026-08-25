import { useEffect, useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { interviewAPI } from "../api/endpoints";
import { Printer, ArrowLeft, Loader2 } from "lucide-react";
import { SessionManager } from "../utils/sessionManager";
import "./AIInterview.css";

function InterviewReport() {
  const location = useLocation();
  const navigate = useNavigate();

  const sessionId = useMemo(() => {
    return location.state?.session_id || SessionManager.getSessionId();
  }, [location.state]);

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!sessionId) {
      setError("No session ID found.");
      setLoading(false);
      return;
    }

    const fetchReportData = async () => {
      try {
        const res = await interviewAPI.getReport(sessionId);
        setReport(res.data);
      } catch (err) {
        console.error("Report fetch error:", err);
        setError("Failed to fetch report details.");
      } finally {
        setLoading(false);
      }
    };

    fetchReportData();
  }, [sessionId]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="printable-report-container loading" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <Loader2 size={36} className="spinner icon-spin text-secondary" />
        <h3 style={{ marginLeft: "12px", color: "var(--text-secondary)" }}>Compiling Printable Document...</h3>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="printable-report-container error" style={{ padding: "40px", textAlign: "center" }}>
        <h3 style={{ color: "var(--text-danger)" }}>Error: {error || "Unable to render report."}</h3>
        <button onClick={() => navigate("/dashboard")} className="glass-btn" style={{ marginTop: "20px" }}>
          Back to Dashboard
        </button>
      </div>
    );
  }

  const scores = report.scores_breakdown || {};

  return (
    <div className="printable-report-container">
      {/* Print Trigger */}
      <div className="print-controls no-print" style={{ display: "flex", gap: "12px", padding: "20px", maxWidth: "850px", margin: "0 auto" }}>
        <button onClick={handlePrint} className="glass-btn glass-btn-primary">
          <Printer size={16} /> Print Report Page
        </button>
        <button onClick={() => navigate(-1)} className="glass-btn">
          <ArrowLeft size={16} /> Back
        </button>
      </div>

      {/* Main Report Page */}
      <div className="report-paper">
        <div className="report-header">
          <div className="brand-sec">
            <h2>NeuroPath AI</h2>
            <span>Career Readiness Analytics Platform</span>
          </div>
          <div className="doc-title-sec">
            <h1>INTERVIEW EVALUATION REPORT</h1>
            <p>Evaluation Session: {sessionId}</p>
          </div>
        </div>

        <hr className="report-divider" />

        {/* METADATA TABLE */}
        <div className="section-block">
          <h3>Candidate Profile & Metadata</h3>
          <table className="report-table meta-table">
            <tbody>
              <tr>
                <td><strong>Candidate Name:</strong></td>
                <td>{localStorage.getItem("user_name") || "Candidate"}</td>
                <td><strong>Date evaluated:</strong></td>
                <td>{new Date().toLocaleDateString()}</td>
              </tr>
              <tr>
                <td><strong>Email address:</strong></td>
                <td>{report.history?.[0]?.email || "candidate@neuropath.ai"}</td>
                <td><strong>Hiring Decision:</strong></td>
                <td><span className="rec-text">{report.hiring_recommendation}</span></td>
              </tr>
              <tr>
                <td><strong>Role Compatibility:</strong></td>
                <td>{report.career_readiness}</td>
                <td><strong>Overall Assessment Score:</strong></td>
                <td><strong>{report.overall_score || 0} / 100</strong></td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* SCORE BREAKDOWN */}
        <div className="section-block">
          <h3>Quantitative Performance Metrics</h3>
          <table className="report-table scores-table">
            <thead>
              <tr>
                <th>Evaluation Category</th>
                <th>Score (0-100)</th>
                <th>Qualitative Assessment</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Overall Interview Score</td>
                <td>{report.overall_score}%</td>
                <td>{report.overall_score >= 80 ? "Strong Fit" : report.overall_score >= 60 ? "Average Competence" : "Requires Core Training"}</td>
              </tr>
              <tr>
                <td>Technical Depth & Competence</td>
                <td>{scores.technical}%</td>
                <td>{scores.technical >= 80 ? "Excellent" : scores.technical >= 60 ? "Competent" : "Skill Gaps Found"}</td>
              </tr>
              <tr>
                <td>Communication Delivery</td>
                <td>{scores.communication}%</td>
                <td>{scores.communication >= 80 ? "Fluent & Structured" : "Clear but Wordy"}</td>
              </tr>
              <tr>
                <td>Confidence & Clarity</td>
                <td>{scores.confidence}%</td>
                <td>{scores.confidence >= 80 ? "Highly Confident" : "Calm and Steady"}</td>
              </tr>
              <tr>
                <td>Problem Solving & Logic</td>
                <td>{scores.problem_solving}%</td>
                <td>{scores.problem_solving >= 80 ? "Strong Analytical Approach" : "Logical"}</td>
              </tr>
              <tr>
                <td>Behavioural Alignment</td>
                <td>{scores.behavioural}%</td>
                <td>{scores.behavioural >= 80 ? "High Alignment" : "Cooperative"}</td>
              </tr>
              <tr>
                <td>HR & Cultural Fit</td>
                <td>{scores.hr}%</td>
                <td>{scores.hr >= 80 ? "Fully Aligned" : "Aligned"}</td>
              </tr>
              <tr>
                <td>Project Discussion Depth</td>
                <td>{scores.projects}%</td>
                <td>{scores.projects >= 80 ? "Excellent" : "Satisfactory"}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* STRENGTHS / WEAKNESSES */}
        <div className="section-block split-row">
          <div className="col-block green-card">
            <h4>Key Strengths</h4>
            <ul>
              {report.strengths?.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>
          <div className="col-block red-card">
            <h4>Areas for Improvement</h4>
            <ul>
              {report.weaknesses?.map((w, i) => (
                <li key={i}>{w}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* ROADMAP STEPS */}
        <div className="section-block page-break-before">
          <h3>Actionable Learning Roadmap</h3>
          <p className="sub-txt">Focus on the following steps to bridge detected skill gaps ({report.skill_gaps?.join(", ") || "None"}):</p>
          
          <div className="roadmap-list-print">
            {report.skill_gaps?.map((gap, i) => (
              <div key={i} className="roadmap-step-print">
                <h4>Step {i + 1}: Study {gap}</h4>
                <ul>
                  <li>Read core documentations, frameworks guidelines, and specifications on {gap}.</li>
                  <li>Build a mini proof-of-concept project demonstrating core mechanics.</li>
                  <li>Run benchmark optimization and stress test latency boundaries.</li>
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* FOOTER */}
        <div className="report-footer">
          <p>© {new Date().getFullYear()} NeuroPath AI. All rights reserved. Generated automatically via local NLP Evaluation Engine.</p>
        </div>
      </div>
    </div>
  );
}

export default InterviewReport;
