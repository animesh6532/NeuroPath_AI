import { useState, useEffect, useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../contexts/AppContext";
import { aptitudeAPI } from "../api/endpoints";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, ShieldAlert, Award, ChevronRight, CornerDownRight, CheckCircle2, Loader2 } from "lucide-react";
import { GlassCard, GlassButton, GlassBadge } from "../components/ui/DesignSystem";
import "./AptitudeTest.css";

// ─── RICH APTITUDE QUESTION BANK ───
const APTITUDE_BANK = [
  {
    id: "apt-1",
    question: "A project manager states that 4 developers can complete a feature in 12 days. If 2 developers are moved to another module, how many days will the remaining 2 developers take to complete the same feature?",
    options: ["24 days", "18 days", "16 days", "6 days"],
    answer: "24 days",
    difficulty: "Easy",
    category: "Quantitative Reasoning"
  },
  {
    id: "apt-2",
    question: "Which of the following is the odd one out in terms of backend network architectures?",
    options: ["FastAPI", "Express.js", "Django", "Docker"],
    answer: "Docker",
    difficulty: "Easy",
    category: "Logical Reasoning"
  },
  {
    id: "apt-3",
    question: "If a candidate is selected in 3 out of 5 mock interviews, what is the empirical probability that they will be selected in the next mock session?",
    options: ["0.60", "0.40", "0.80", "0.50"],
    answer: "0.60",
    difficulty: "Easy",
    category: "Quantitative Reasoning"
  },
  {
    id: "apt-4",
    question: "A sequence of numbers progresses as: 2, 6, 12, 20, 30, ... What is the next number in the pattern?",
    options: ["42", "40", "36", "48"],
    answer: "42",
    difficulty: "Medium",
    category: "Logical Reasoning"
  },
  {
    id: "apt-5",
    question: "Which term describes a database transaction anomaly where a transaction reads data written by a concurrent uncommitted transaction?",
    options: ["Dirty Read", "Non-repeatable Read", "Phantom Read", "Lost Update"],
    answer: "Dirty Read",
    difficulty: "Medium",
    category: "Cognitive Knowledge"
  },
  {
    id: "apt-6",
    question: "A server cluster experiences a failure rate of 2% per hour. If the cluster has been running for 3 hours, what is the probability that no failures occurred? (Approximate to two decimal places)",
    options: ["0.94", "0.96", "0.98", "0.90"],
    answer: "0.94",
    difficulty: "Medium",
    category: "Quantitative Reasoning"
  },
  {
    id: "apt-7",
    question: "In a binary search tree containing 15 fully balanced keys, what is the maximum number of comparisons needed to find a specific key?",
    options: ["4 comparisons", "3 comparisons", "15 comparisons", "8 comparisons"],
    answer: "4 comparisons",
    difficulty: "Hard",
    category: "Logical Reasoning"
  },
  {
    id: "apt-8",
    question: "Consider two secure independent proctoring channels. Channel A has a reliability index of 0.95, and Channel B has a reliability index of 0.90. What is the joint reliability index if they operate in a parallel redundant structure?",
    options: ["0.995", "0.855", "0.925", "0.975"],
    answer: "0.995",
    difficulty: "Hard",
    category: "Quantitative Reasoning"
  }
];

function AptitudeTest() {
  const { setAptitudeResult, analysisData } = useContext(AppContext);
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 minutes session limits
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);

  const warningRef = useRef(0);

  // Proctoring fullscreen escape monitors
  useEffect(() => {
    const enterFullscreen = async () => {
      try {
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
        }
      } catch (err) {
        console.warn("Fullscreen auto-init blocked:", err);
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
    };

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

  // Countdown timer hook
  useEffect(() => {
    if (timeLeft <= 0 && !submitted) {
      handleSubmit();
      return;
    }
    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, submitted]);

  // Adaptive Weighted Selection with Progressive Difficulty
  useEffect(() => {
    const compileQuestionPool = () => {
      try {
        const domain = analysisData?.best_domain ?? "General";
        const historyRaw = localStorage.getItem("aptitude_solve_history");
        const solvedIds = historyRaw ? JSON.parse(historyRaw) : [];

        // Filter out previously solved questions to ensure non-repetition
        let unsolved = APTITUDE_BANK.filter(q => !solvedIds.includes(q.id));
        if (unsolved.length < 4) {
          // If catalog is depleted, reset solve history
          unsolved = APTITUDE_BANK;
          localStorage.removeItem("aptitude_solve_history");
        }

        // Domain Weighting: Technical domains get more Quantitative/Logical
        const isTech = domain.toLowerCase().includes("tech") || 
                       domain.toLowerCase().includes("software") || 
                       domain.toLowerCase().includes("engineer");

        let easyPool = unsolved.filter(q => q.difficulty === "Easy");
        let medPool = unsolved.filter(q => q.difficulty === "Medium");
        let hardPool = unsolved.filter(q => q.difficulty === "Hard");

        if (isTech) {
          // Sort tech categories (Quantitative first)
          easyPool.sort((a, b) => (b.category.includes("Quantitative") ? 1 : -1));
          medPool.sort((a, b) => (b.category.includes("Quantitative") ? 1 : -1));
        }

        // Build progressive assessment: 2 Easy -> 2 Medium -> 1 Hard
        const finalPool = [
          easyPool[0] || APTITUDE_BANK[0],
          easyPool[1] || APTITUDE_BANK[1],
          medPool[0] || APTITUDE_BANK[3],
          medPool[1] || APTITUDE_BANK[4],
          hardPool[0] || APTITUDE_BANK[7]
        ];

        setQuestions(finalPool);
      } catch (err) {
        console.error("Failed to compile aptitude pool:", err);
        setQuestions(APTITUDE_BANK.slice(0, 5));
      } finally {
        setLoading(false);
      }
    };

    compileQuestionPool();
  }, [analysisData]);

  const handleSelect = (option) => {
    setAnswers({ ...answers, [currentIdx]: option });
  };

  const handleSubmit = async () => {
    if (submitted) return;
    setSubmitted(true);
    
    // Evaluate correctness locally to update history
    let correctCount = 0;
    const historyRaw = localStorage.getItem("aptitude_solve_history");
    const solvedIds = historyRaw ? JSON.parse(historyRaw) : [];

    const answersPayload = questions.map((q, idx) => {
      const isCorrect = answers[idx] === q.answer;
      if (isCorrect) {
        correctCount++;
        if (!solvedIds.includes(q.id)) {
          solvedIds.push(q.id);
        }
      }
      return {
        question: q.question,
        answer: answers[idx] || ""
      };
    });

    localStorage.setItem("aptitude_solve_history", JSON.stringify(solvedIds));

    const finalAccuracy = (correctCount / questions.length) * 100;
    const mockResult = {
      score: correctCount,
      total: questions.length,
      accuracy: finalAccuracy,
      timestamp: new Date().toISOString()
    };

    try {
      // Sync back to API
      await aptitudeAPI.submitTest({ answers: answersPayload });
    } catch (err) {
      console.warn("Failed syncing API aptitude score, persisting locally:", err);
    }

    setAptitudeResult(mockResult);
    localStorage.setItem("aptitude_result", JSON.stringify(mockResult));
    navigate("/dashboard");
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
        <div className={`timer glass-badge ${timeLeft < 180 ? "glass-badge-danger" : "secondary"}`} style={{ padding: "10px 18px", fontSize: "0.9rem" }}>
          <Clock size={14} style={{ marginRight: "6px" }} />
          Time Left: {formatTime(timeLeft)}
        </div>
      </div>

      <GlassCard className="aptitude-content" style={{ marginTop: "24px", display: "flex", flexDirection: "column", gap: "20px", maxWidth: "800px", margin: "24px auto 0 auto" }}>
        <div className="question-header" style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--glass-border)", paddingBottom: "12px" }}>
          <span className="text-caption">Question {currentIdx + 1} of {questions.length}</span>
          <GlassBadge status="secondary">{currentQ.category} • {currentQ.difficulty}</GlassBadge>
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
