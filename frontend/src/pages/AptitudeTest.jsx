import { useState, useEffect, useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { aptitudeAPI } from "../api/endpoints";
import { motion } from "framer-motion";
import { Clock, ShieldAlert, Award, ChevronRight, CornerDownRight, CheckCircle2, Loader2 } from "lucide-react";
import { GlassCard, GlassButton, GlassBadge } from "../components/ui/DesignSystem";
import "./AptitudeTest.css";

function AptitudeTest() {
  const { setAptitudeResult, analysisData } = useContext(AppContext);
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(30 * 60); 
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);

  const warningRef = useRef(0);

  useEffect(() => {
    const enterFullscreen = async () => {
      try {
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
        }
      } catch (err) {
        console.warn("Fullscreen failed:", err);
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden && !submitted) {
        if (warningRef.current === 0) {
          alert("WARNING: Tab switching is strictly prohibited during company assessments. Your next violation will auto-submit the exam.");
          warningRef.current += 1;
        } else {
          alert("Tab switching detected again! Test auto-submitted.");
          handleSubmit();
        }
      }
    };

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && !submitted) {
         alert("Exited fullscreen! Test auto-submitted.");
         handleSubmit();
      }
    }

    const handleContextMenu = (e) => {
      e.preventDefault();
    };

    enterFullscreen();
    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("contextmenu", handleContextMenu);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("contextmenu", handleContextMenu);
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(err => console.log(err));
      }
    };
  }, [submitted]);

  useEffect(() => {
    if (timeLeft <= 0 && !submitted) {
      handleSubmit();
      return;
    }
    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, submitted]);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const domain = analysisData?.best_domain || "General";
        const res = await aptitudeAPI.getTest(domain);
        setQuestions(res.data.questions);
      } catch (err) {
        console.error("Failed to load questions", err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [analysisData]);

  const handleSelect = (option) => {
    setAnswers({ ...answers, [currentIdx]: option });
  };

  const handleSubmit = async () => {
    if (submitted) return;
    setSubmitted(true);
    
    const payload = {
      answers: questions.map((q, idx) => ({
        question: q.question,
        answer: answers[idx] || ""
      }))
    };

    try {
      const res = await aptitudeAPI.submitTest(payload);
      setAptitudeResult(res.data);
      navigate("/dashboard");
    } catch (err) {
      console.error("Failed to submit test", err);
      alert("Error synchronizing test results.");
      navigate("/dashboard");
    }
  };

  if (loading) {
    return (
      <div className="page-container aptitude-page" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <GlassCard style={{ textAlign: "center", padding: "40px" }}>
          <Loader2 size={32} className="icon-spin text-secondary" style={{ marginBottom: "16px", margin: "0 auto" }} />
          <p>Compiling aptitude assessment questions...</p>
        </GlassCard>
      </div>
    );
  }

  if (!questions.length) {
    return (
      <div className="page-container aptitude-page" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <GlassCard style={{ textAlign: "center", padding: "40px" }}>
          <ShieldAlert size={32} className="text-danger" style={{ marginBottom: "16px", margin: "0 auto" }} />
          <p>Failed to load questions. Please check connection.</p>
        </GlassCard>
      </div>
    );
  }

  const currentQ = questions[currentIdx];

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="page-container aptitude-page"
    >
      <div className="aptitude-header glass-card-v6" style={{ background: "var(--glass-bg)", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 32px", borderRadius: "24px" }}>
        <div>
          <span className="glass-badge">RECRUITER ASSESSMENT</span>
          <h2 style={{ fontSize: "1.6rem", margin: "4px 0" }}>Aptitude Assessment</h2>
          <p className="text-small" style={{ margin: 0 }}>Candidate evaluation rules are active</p>
        </div>
        <div className={`timer glass-badge ${timeLeft < 300 ? "glass-badge-danger" : "secondary"}`} style={{ padding: "10px 18px", fontSize: "0.9rem" }}>
          <Clock size={14} style={{ marginRight: "6px" }} />
          Time Left: {formatTime(timeLeft)}
        </div>
      </div>

      <GlassCard className="aptitude-content" style={{ marginTop: "24px", display: "flex", flexDirection: "column", gap: "20px", maxWidth: "800px", margin: "24px auto 0 auto" }}>
        <div className="question-header" style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--glass-border)", paddingBottom: "12px" }}>
          <span className="text-caption">Question {currentIdx + 1} of {questions.length}</span>
          <GlassBadge status="secondary">Logical Reasoning</GlassBadge>
        </div>
        
        <div className="question-body">
          <h3 className="text-title" style={{ fontSize: "1.2rem", color: "var(--color-dark-blue)", fontWeight: "600", marginBottom: "20px", display: "flex", alignItems: "flex-start", gap: "10px" }}>
            <CornerDownRight size={18} className="text-secondary" style={{ marginTop: "3px" }} />
            {currentQ.question}
          </h3>
          
          <div className="options-list" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {currentQ.options.map((opt, i) => {
              const isSelected = answers[currentIdx] === opt;
              return (
                <button 
                  key={i} 
                  className={`option-btn ${isSelected ? "selected" : ""}`}
                  onClick={() => handleSelect(opt)}
                  style={{ 
                    width: "100%", 
                    justifyContent: "flex-start", 
                    padding: "14px 20px", 
                    fontSize: "0.95rem",
                    border: isSelected ? "1px solid var(--color-navy)" : "1px solid var(--glass-border)",
                    background: isSelected ? "linear-gradient(135deg, #446A9C, #1A3F75)" : "rgba(255, 255, 255, 0.45)",
                    color: isSelected ? "#E8F3FF" : "var(--color-navy)",
                    textAlign: "left",
                    display: "flex",
                    alignItems: "center",
                    borderRadius: "12px",
                    cursor: "pointer",
                    fontFamily: "var(--font-sans)",
                    fontWeight: isSelected ? "600" : "500",
                    transition: "all var(--transition-fast) ease"
                  }}
                >
                  <span style={{ 
                    width: "24px", 
                    height: "24px", 
                    borderRadius: "50%", 
                    background: isSelected ? "rgba(255,255,255,0.2)" : "rgba(0,0,26,0.05)", 
                    color: isSelected ? "#FFFFFF" : "var(--color-navy)", 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center",
                    fontWeight: "700",
                    marginRight: "12px",
                    fontSize: "0.85rem"
                  }}>{String.fromCharCode(65 + i)}</span>
                  {opt}
                </button>
              );
            })}
          </div>
        </div>

        <div className="aptitude-footer" style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid var(--glass-border)", paddingTop: "16px", marginTop: "12px" }}>
          <GlassButton 
            disabled={currentIdx === 0} 
            onClick={() => setCurrentIdx(prev => prev - 1)}
          >
            Previous
          </GlassButton>
          
          <div style={{ display: "flex", gap: "10px" }}>
            <GlassButton onClick={handleSubmit}>
              Exit & Submit
            </GlassButton>
            {currentIdx === questions.length - 1 ? (
              <GlassButton primary onClick={handleSubmit}>
                <CheckCircle2 size={14} /> Submit Assessment
              </GlassButton>
            ) : (
              <GlassButton 
                primary
                onClick={() => setCurrentIdx(prev => prev + 1)}
              >
                Next <ChevronRight size={14} />
              </GlassButton>
            )}
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}

export default AptitudeTest;
