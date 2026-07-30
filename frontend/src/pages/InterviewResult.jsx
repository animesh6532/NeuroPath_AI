import { useEffect, useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { interviewAPI } from "../api/endpoints";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Download, LayoutDashboard, CheckCircle2, AlertTriangle, 
  HelpCircle, MessageSquare, Map, Award, Users, ShieldAlert,
  Flame, BookOpen, Clock, Activity 
} from "lucide-react";
import { GlassCard, GlassButton, GlassBadge, GlassProgress, GlassTabs } from "../components/ui/DesignSystem";
import "./AIInterview.css";

const CircularProgress = ({ score, label, color = "#AFCBE8" }) => {
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="gauge-item">
      <div className="gauge-circle">
        <svg width="76" height="76" viewBox="0 0 76 76">
          <circle cx="38" cy="38" r={radius} className="gauge-bg" stroke="rgba(26,63,117,0.06)" strokeWidth="4" fill="none" />
          <circle
            cx="38"
            cy="38"
            r={radius}
            className="gauge-fill"
            stroke={color}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
            transform="rotate(-90 38 38)"
          />
          <text x="38" y="42" className="gauge-text" fill="var(--color-dark-blue)" fontWeight="700" fontSize="11px" textAnchor="middle">
            {score}%
          </text>
        </svg>
      </div>
      <span className="gauge-lbl" style={{ display: "block", fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "8px", fontWeight: "600", textTransform: "uppercase" }}>{label}</span>
    </div>
  );
};

function InterviewResult() {
  const location = useLocation();
  const navigate = useNavigate();

  const sessionId = useMemo(() => {
    return location.state?.session_id || localStorage.getItem("interview_session_id");
  }, [location.state]);

  const [activeTab, setActiveTab] = useState("overview"); 
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const tabList = [
    { id: "overview", label: "Performance Overview" },
    { id: "transcripts", label: "Interviewer Transcripts" },
    { id: "roadmap", label: "Actionable Roadmap" },
  ];

  useEffect(() => {
    if (!sessionId) {
      setError("No active session detected. Please return to dashboard.");
      setLoading(false);
      return;
    }

    const fetchReport = async () => {
      try {
        setLoading(true);
        const res = await interviewAPI.getReport(sessionId);
        setReport(res.data);
      } catch (err) {
        console.error("Fetch report error:", err);
        setError("Failed to load interview report details.");
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(() => {
      fetchReport();
    }, 500); 

    return () => clearTimeout(timer);
  }, [sessionId]);

  const handleDownloadPDF = () => {
    if (!sessionId) return;
    const url = interviewAPI.getPDFReportUrl(sessionId);
    window.open(url, "_blank");
  };

  if (loading) {
    return (
      <div className="page-container ai-interview-page" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <GlassCard style={{ maxWidth: "600px", margin: "40px auto", textAlign: "center" }}>
          <Activity size={40} className="icon-spin text-secondary" style={{ marginBottom: "20px", margin: "0 auto" }} />
          <h2>Compiling Performance Intelligence Report...</h2>
          <p className="text-small">Processing speech transcripts, evaluating semantic rubrics, and generating PDF download.</p>
        </GlassCard>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="page-container ai-interview-page" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <GlassCard style={{ maxWidth: "500px", margin: "40px auto", textAlign: "center" }}>
          <ShieldAlert size={40} className="text-danger" style={{ marginBottom: "20px", margin: "0 auto" }} />
          <h2>Evaluation Error</h2>
          <p>{error || "No interview results available."}</p>
          <GlassButton onClick={() => navigate("/dashboard")} primary style={{ marginTop: "20px" }}>
            Back to Dashboard
          </GlassButton>
        </GlassCard>
      </div>
    );
  }

  const scores = report.scores_breakdown || {};
  const violations = location.state?.violations || [];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="page-container interview-result-page"
    >
      <div className="result-header glass-card-v6" style={{ background: "var(--glass-bg)", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "28px 32px", borderRadius: "24px" }}>
        <div>
          <span className="glass-badge">Performance Intelligence</span>
          <h1 style={{ fontSize: "2rem", marginTop: "6px" }}>Analysis & Evaluation Dashboard</h1>
          <p className="text-small" style={{ margin: "4px 0 0 0" }}>Session ID: {sessionId}</p>
        </div>
        <div className="header-actions" style={{ display: "flex", gap: "10px" }}>
          <GlassButton onClick={handleDownloadPDF} primary>
            <Download size={16} /> Download PDF Report
          </GlassButton>
          <GlassButton onClick={() => navigate("/dashboard")}>
            <LayoutDashboard size={16} /> Dashboard
          </GlassButton>
        </div>
      </div>

      {/* METRIC GAUGES */}
      <GlassCard className="gauges-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))", gap: "16px", padding: "24px", marginTop: "24px", textAlign: "center" }}>
        <CircularProgress score={report.overall_score || 0} label="Overall Score" color="var(--color-navy)" />
        <CircularProgress score={scores.technical || 0} label="Technical Depth" color="var(--color-medium-blue)" />
        <CircularProgress score={scores.communication || 0} label="Communication" color="var(--color-navy)" />
        <CircularProgress score={scores.confidence || 0} label="Confidence" color="var(--color-medium-blue)" />
        <CircularProgress score={scores.problem_solving || 0} label="Problem Solving" color="var(--color-navy)" />
        <CircularProgress score={scores.behavioural || 0} label="Behavioural" color="var(--color-medium-blue)" />
        <CircularProgress score={scores.hr || 0} label="HR / Culture Fit" color="var(--color-navy)" />
        <CircularProgress score={scores.projects || 0} label="Projects Fit" color="var(--color-medium-blue)" />
      </GlassCard>

      {/* TABBED CONTROLS */}
      <div className="tabs-container" style={{ margin: "24px 0" }}>
        <GlassTabs tabs={tabList} activeTab={activeTab} onChange={setActiveTab} />
      </div>

      {/* TAB PANELS */}
      <div className="tab-panels-container">
        <AnimatePresence mode="wait">
          {activeTab === "overview" && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
              className="tab-panel"
            >
              <div className="panel-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                <GlassCard className="panel-col green-col" style={{ border: "1px solid rgba(52, 211, 153, 0.2)" }}>
                  <h3 style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "1rem", color: "#34d399", borderBottom: "1px solid rgba(52, 211, 153, 0.1)", paddingBottom: "10px" }}><CheckCircle2 size={16} /> Key Strengths</h3>
                  <ul className="strength-list" style={{ paddingLeft: "16px", color: "var(--text-secondary)", fontSize: "0.9rem", display: "flex", flexDirection: "column", gap: "8px" }}>
                    {report.strengths?.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </GlassCard>

                <GlassCard className="panel-col red-col" style={{ border: "1px solid rgba(248, 113, 113, 0.2)" }}>
                  <h3 style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "1rem", color: "#f87171", borderBottom: "1px solid rgba(248, 113, 113, 0.1)", paddingBottom: "10px" }}><AlertTriangle size={16} /> Areas for Improvement</h3>
                  <ul className="weakness-list" style={{ paddingLeft: "16px", color: "var(--text-secondary)", fontSize: "0.9rem", display: "flex", flexDirection: "column", gap: "8px" }}>
                    {report.weaknesses?.map((w, i) => (
                      <li key={i}>{w}</li>
                    ))}
                  </ul>
                </GlassCard>
              </div>

              <GlassCard className="details-card" style={{ marginTop: "20px" }}>
                <h3 style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "1rem" }}><Award size={16} /> Interviewer Assessment</h3>
                <div className="details-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px", marginTop: "16px" }}>
                  <div className="detail-item">
                    <strong style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Hiring Recommendation:</strong>
                    <span className={report.hiring_recommendation?.includes("Hire") ? "text-success" : "text-danger"} style={{ fontSize: "1.1rem", fontWeight: "700" }}>
                      {report.hiring_recommendation}
                    </span>
                  </div>
                  <div className="detail-item">
                    <strong style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Career Readiness Alignment:</strong>
                    <span style={{ fontSize: "1.1rem", fontWeight: "700", color: "var(--color-dark-blue)" }}>{report.career_readiness}</span>
                  </div>
                  <div className="detail-item">
                    <strong style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Proctoring Violations Logged:</strong>
                    <span style={{ fontSize: "1.1rem", fontWeight: "700", color: "var(--color-dark-blue)" }}>{violations.length === 0 ? "No violations detected" : `${violations.length} warnings logged`}</span>
                  </div>
                </div>

                {violations.length > 0 && (
                  <div className="violations-log" style={{ marginTop: "20px", borderTop: "1px dashed var(--glass-border)", paddingTop: "14px" }}>
                    <h4 style={{ color: "#991b1b", fontSize: "0.9rem", margin: "0 0 10px 0" }}>Recorded Warnings:</h4>
                    <ul style={{ paddingLeft: "16px", color: "var(--text-secondary)", fontSize: "0.85rem", display: "flex", flexDirection: "column", gap: "6px" }}>
                      {violations.map((v, i) => (
                        <li key={i}>{v}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </GlassCard>

              <GlassCard className="details-card" style={{ marginTop: "20px" }}>
                <h3 style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "1rem" }}><HelpCircle size={16} /> Gaps Identification</h3>
                <div className="panel-row text-blocks" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginTop: "16px" }}>
                  <div>
                    <strong>Missed Rubric Concepts:</strong>
                    <div className="tags-container" style={{ marginTop: "12px", display: "flex", gap: "6px", flexWrap: "wrap" }}>
                      {report.missed_topics?.length > 0
                        ? report.missed_topics.map((t, i) => <GlassBadge key={i} status="danger">{t}</GlassBadge>)
                        : <span className="text-small">None. All core concepts were covered!</span>}
                    </div>
                  </div>
                  <div>
                    <strong>Repeated Mistakes:</strong>
                    <ul style={{ marginTop: "12px", paddingLeft: "16px", color: "var(--text-secondary)", fontSize: "0.85rem", display: "flex", flexDirection: "column", gap: "6px" }}>
                      {report.repeated_mistakes?.length > 0
                        ? report.repeated_mistakes.map((m, i) => <li key={i}>{m}</li>)
                        : <li>No repeating patterns of mistakes detected.</li>}
                    </ul>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          )}

          {activeTab === "transcripts" && (
            <motion.div
              key="transcripts"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
              className="tab-panel"
            >
              {report.history && report.history.length > 0 ? (
                <div className="transcripts-timeline" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {report.history.map((h, i) => (
                    <GlassCard className="transcript-card" key={i}>
                      <div className="transcript-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--glass-border)", paddingBottom: "12px", marginBottom: "16px" }}>
                        <h4 style={{ margin: 0, fontSize: "1rem", color: "var(--color-dark-blue)" }}>
                          Round {h.round_number}: {h.round_name}
                        </h4>
                        <GlassBadge status="secondary">{h.score ?? 0} / 100</GlassBadge>
                      </div>
                      <div className="transcript-body" style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "0.9rem" }}>
                        <p style={{ margin: 0 }}>
                          <strong>Q:</strong> {h.question_text}
                        </p>
                        <p style={{ margin: 0, color: "var(--text-secondary)", fontStyle: "italic" }}>
                          <strong>Your Response:</strong> {h.answer || "No response recorded."}
                        </p>
                        <div className="eval-sub-row" style={{ display: "flex", gap: "16px", background: "rgba(255, 255, 255, 0.4)", padding: "8px 16px", borderRadius: "8px", fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "6px", border: "1px solid var(--glass-border)" }}>
                          <span><strong>Tech Depth:</strong> {h.technical_score ?? 0}%</span>
                          <span><strong>Communication:</strong> {h.communication_score ?? 0}%</span>
                          <span><strong>Confidence:</strong> {h.confidence_score ?? 0}%</span>
                        </div>
                        {h.feedback && (
                          <p className="feedback-text" style={{ margin: 0, background: "rgba(16,185,129,0.08)", borderLeft: "3px solid #10b981", padding: "10px 14px", borderRadius: "0 8px 8px 0", color: "#065f46", fontSize: "0.85rem" }}>
                            <strong>Interviewer Feedback:</strong> {h.feedback}
                          </p>
                        )}
                      </div>
                    </GlassCard>
                  ))}
                </div>
              ) : (
                <GlassCard className="empty-card">
                  <p>No question transcripts were recorded for this session.</p>
                </GlassCard>
              )}
            </motion.div>
          )}

          {activeTab === "roadmap" && (
            <motion.div
              key="roadmap"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
              className="tab-panel"
            >
              <GlassCard>
                <h3 style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "1rem" }}><Map size={16} /> Skill Gaps Identified</h3>
                <p className="text-body" style={{ margin: 0 }}>Based on your evaluation, we recommend targeting training in: <strong>{report.skill_gaps?.join(", ") || "None"}</strong></p>
              </GlassCard>

              <div className="roadmap-timeline" style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "20px" }}>
                {report.skill_gaps?.map((gap, idx) => (
                  <GlassCard key={idx}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                      <h4 style={{ margin: 0, fontSize: "1.05rem" }}>Milestone {idx + 1}: Master {gap}</h4>
                      <GlassBadge status="secondary">Target training</GlassBadge>
                    </div>
                    <ul style={{ paddingLeft: "16px", color: "var(--text-secondary)", fontSize: "0.85rem", display: "flex", flexDirection: "column", gap: "6px", margin: 0 }}>
                      <li>Review foundational documentation and articles on {gap}.</li>
                      <li>Build a sandbox prototype implementation demonstrating {gap}.</li>
                      <li>Optimize the prototype's performance and security boundaries.</li>
                    </ul>
                  </GlassCard>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="dashboard-actions" style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
        <GlassButton onClick={() => navigate("/dashboard")} primary>
          Return to Dashboard
        </GlassButton>
        <GlassButton onClick={() => navigate("/roadmap")}>
          View Interactive Roadmap
        </GlassButton>
      </div>
    </motion.div>
  );
}

export default InterviewResult;
