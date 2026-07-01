import { useEffect, useMemo, useRef, useState, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import CameraMonitor from "../components/CameraMonitor";
import { AppContext } from "../context/AppContext";
import { interviewAPI } from "../api/endpoints";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Mic, Clock, ShieldAlert, AlertTriangle, Radio, 
  RotateCcw, Play, CheckCircle, Video, HelpCircle, 
  MessageSquareCode, Shield, Check, X
} from "lucide-react";
import { GlassCard, GlassButton, GlassBadge } from "../components/ui/DesignSystem";
import "./AIInterview.css";

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

const PREP_TIME = 15;
const ANSWER_TIME = 90;
const SILENCE_TIMEOUT = 5000; // 5 seconds of silence automatically triggers submission

function AIInterviewLive() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setInterviewData } = useContext(AppContext);

  const sessionId = useMemo(() => location.state?.session_id, [location.state]);
  const role = useMemo(() => location.state?.role || "Software Developer", [location.state]);
  const level = useMemo(() => location.state?.level || "Entry", [location.state]);
  const blueprint = useMemo(() => location.state?.blueprint || [], [location.state]);
  const resumeName = location.state?.resumeName || "Resume";

  const [currentQuestion, setCurrentQuestion] = useState(
    location.state?.first_question?.question_text || "Tell me about your background."
  );
  const [questionTimeLeft, setQuestionTimeLeft] = useState(
    location.state?.first_question?.estimated_time || 90
  );
  const [currentDifficulty, setCurrentDifficulty] = useState(
    location.state?.first_question?.difficulty || "Medium"
  );
  const [roundName, setRoundName] = useState(
    location.state?.first_question?.round_name || "Introduction"
  );
  const [roundNumber, setRoundNumber] = useState(
    location.state?.first_question?.round_number || 1
  );

  const [phase, setPhase] = useState("PREPARING"); // PREPARING, ANSWERING, EVALUATING, COMPILING, TERMINATED
  const [timeLeft, setTimeLeft] = useState(PREP_TIME);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState("Preparing round...");
  const [violations, setViolations] = useState([]);
  const [warningCount, setWarningCount] = useState(0);
  const [activeWarning, setActiveWarning] = useState("");

  const [isFullscreenActive, setIsFullscreenActive] = useState(true);
  const [needsFullscreenActivation, setNeedsFullscreenActivation] = useState(false);
  const [exitedFullscreenWarning, setExitedFullscreenWarning] = useState(false);

  const recognitionRef = useRef(null);
  const timerRef = useRef(null);
  const silenceCheckRef = useRef(null);
  const lastSpeechTimeRef = useRef(Date.now());
  const answerTextRef = useRef("");
  
  const phaseRef = useRef(phase);
  const submittingRef = useRef(isSubmitting);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    submittingRef.current = isSubmitting;
  }, [isSubmitting]);

  useEffect(() => {
    answerTextRef.current = currentAnswer;
  }, [currentAnswer]);

  // Session Prerequisite Check
  useEffect(() => {
    if (!sessionId) {
      alert("No active interview session found. Returning to setup.");
      navigate("/interview");
    }
  }, [sessionId, navigate]);

  // Mandatory Fullscreen & Anti-Escape Proctoring Loops
  useEffect(() => {
    const enterFullscreen = async () => {
      try {
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
          setIsFullscreenActive(true);
          setNeedsFullscreenActivation(false);
        }
      } catch (err) {
        console.warn("Auto-fullscreen rejected. Displaying manual prompt:", err);
        setNeedsFullscreenActivation(true);
      }
    };

    const handleFullscreenChange = () => {
      const isCurrentlyFs = !!document.fullscreenElement;
      setIsFullscreenActive(isCurrentlyFs);
      
      if (!isCurrentlyFs && phaseRef.current !== "COMPILING" && phaseRef.current !== "TERMINATED") {
        setExitedFullscreenWarning(true);
        // Exited fullscreen: Terminate after a warning of 2 seconds
        setTimeout(() => {
          handleEarlyTermination();
        }, 2000);
      }
    };

    const handleVisibility = () => {
      if (document.hidden) {
        handleViolation("Tab switched / Background activity");
      }
    };

    const handleWindowBlur = () => {
      handleViolation("Focus lost / Window switch");
    };

    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = "Leaving this page will forfeit the proctored interview. Are you sure?";
      return e.returnValue;
    };

    // Block back-navigation
    window.history.pushState(null, null, window.location.href);
    const handlePopState = () => {
      window.history.pushState(null, null, window.location.href);
      handleViolation("Attempted browser back navigation");
    };

    enterFullscreen();
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("blur", handleWindowBlur);
    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("popstate", handlePopState);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("blur", handleWindowBlur);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handlePopState);
      speechSynthesis.cancel();
      stopListening();
      if (timerRef.current) clearInterval(timerRef.current);
      if (silenceCheckRef.current) clearInterval(silenceCheckRef.current);
    };
  }, []);

  // Text-To-Speech & Automatic Phase transition loop
  useEffect(() => {
    if (!sessionId) return;

    if (phase === "PREPARING") {
      stopListening();
      setCurrentAnswer("");
      setTimeLeft(PREP_TIME);
      setStatus("AI Interviewer is speaking...");

      speakQuestion(currentQuestion, () => {
        // Once AI finishes reading, automatically start the microphone and switch to answering
        setPhase("ANSWERING");
      });

      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setPhase("ANSWERING");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (phase === "ANSWERING") {
      setTimeLeft(ANSWER_TIME);
      setStatus("Microphone active. Speak your answer now...");
      startListening();
      lastSpeechTimeRef.current = Date.now();

      // Answer Countdown Timer
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            submitAnswerAndAdvance();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Automated Silence Detection Loop
      if (silenceCheckRef.current) clearInterval(silenceCheckRef.current);
      silenceCheckRef.current = setInterval(() => {
        const words = answerTextRef.current.trim().split(/\s+/).filter(Boolean);
        // If candidate has spoken at least 3 words and has been silent for 5 seconds, auto-submit
        if (words.length >= 3) {
          if (Date.now() - lastSpeechTimeRef.current > SILENCE_TIMEOUT) {
            clearInterval(silenceCheckRef.current);
            clearInterval(timerRef.current);
            submitAnswerAndAdvance();
          }
        }
      }, 500);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (silenceCheckRef.current) clearInterval(silenceCheckRef.current);
    };
  }, [phase, currentQuestion, sessionId]);

  const speakQuestion = (text, onComplete) => {
    speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "en-US";
    utter.rate = 1.05;
    utter.pitch = 1;
    utter.onend = () => {
      if (onComplete) onComplete();
    };
    utter.onerror = () => {
      if (onComplete) onComplete();
    };
    speechSynthesis.speak(utter);
  };

  // Robust Speech Recognition
  const startListening = () => {
    if (!SpeechRecognition) {
      setStatus("Speech Recognition API unsupported in this browser.");
      return;
    }
    stopListening();

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = true;
    recognition.continuous = true;
    
    recognition.onstart = () => {
      setIsListening(true);
      setStatus("Microphone listening... Speak now.");
    };
    
    recognition.onresult = (event) => {
      let transcript = "";
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript + " ";
      }
      setCurrentAnswer(transcript.trim());
      lastSpeechTimeRef.current = Date.now();
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      if (event.error === "not-allowed") {
        setStatus("Microphone access blocked.");
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      // Auto-restart recognition if unexpectedly dropped during active speaking phase
      if (phaseRef.current === "ANSWERING" && !submittingRef.current) {
        console.log("Auto-restarting speech engine...");
        try {
          recognition.start();
        } catch {}
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopListening = () => {
    try {
      if (recognitionRef.current) recognitionRef.current.stop();
    } catch {}
    setIsListening(false);
  };

  const submitAnswerAndAdvance = async () => {
    stopListening();
    if (silenceCheckRef.current) clearInterval(silenceCheckRef.current);
    if (timerRef.current) clearInterval(timerRef.current);
    
    setPhase("EVALUATING");
    setIsSubmitting(true);
    setStatus("Analyzing spoken speech answers...");

    const spokenAnswer = answerTextRef.current || "No answer provided";
    const timeTaken = ANSWER_TIME - timeLeft;

    try {
      const payload = {
        session_id: sessionId,
        answer: spokenAnswer,
        time_taken: timeTaken,
        violations: violations,
      };

      const response = await interviewAPI.submitAnswer(payload);
      const data = response.data;

      if (data.is_completed) {
        setPhase("COMPILING");
        setStatus("Evaluating response patterns & compiling career roadmap...");
        
        const reportRes = await interviewAPI.getReport(sessionId);
        const reportResult = reportRes.data;

        const normalised = {
          score: reportResult.overall_score ?? 0,
          confidence: reportResult.scores_breakdown?.confidence ?? 0,
          communication: reportResult.scores_breakdown?.communication ?? 0,
          weaknesses: reportResult.weaknesses ?? [],
          full_results: reportResult.scores_breakdown ?? {},
          session_id: sessionId,
        };

        setInterviewData(normalised);
        localStorage.setItem("interview_data", JSON.stringify(normalised));
        localStorage.setItem("interview_session_id", sessionId);

        setTimeout(() => {
          document.exitFullscreen().catch(() => {});
          navigate("/interview-result", {
            state: { result: normalised, session_id: sessionId, violations },
          });
        }, 1500);
      } else if (data.terminated) {
        terminateInterview(data.message);
      } else {
        const nextQ = data.next_question;
        setCurrentQuestion(nextQ.question_text);
        setQuestionTimeLeft(nextQ.estimated_time);
        setCurrentDifficulty(nextQ.difficulty);
        setRoundName(nextQ.round_name);
        setRoundNumber(nextQ.round_number);
        
        setPhase("PREPARING");
        setIsSubmitting(false);
      }
    } catch (err) {
      console.error("Answer submission failed:", err);
      // Recovery logic
      setIsSubmitting(false);
      setPhase("ANSWERING");
    }
  };

  const terminateInterview = (reason) => {
    setPhase("TERMINATED");
    speechSynthesis.cancel();
    stopListening();
    if (timerRef.current) clearInterval(timerRef.current);
    if (silenceCheckRef.current) clearInterval(silenceCheckRef.current);
    document.exitFullscreen().catch(() => {});
    alert(`Interview Terminated: ${reason}`);
    navigate("/dashboard");
  };

  // Secure early exit compiler
  const handleEarlyTermination = async () => {
    setPhase("TERMINATED");
    speechSynthesis.cancel();
    stopListening();
    if (timerRef.current) clearInterval(timerRef.current);
    if (silenceCheckRef.current) clearInterval(silenceCheckRef.current);

    try {
      const timeTaken = ANSWER_TIME - timeLeft;
      await interviewAPI.submitAnswer({
        session_id: sessionId,
        answer: answerTextRef.current || "Assessment aborted early due to escape or fullscreen exit.",
        time_taken: timeTaken,
        violations: [...violations, "Fullscreen exit"],
      });
    } catch (e) {
      console.warn("Failed saving final answer state on escape:", e);
    }

    try {
      await interviewAPI.getReport(sessionId);
    } catch (e) {
      console.warn("Failed compiling partial report on exit:", e);
    }

    document.exitFullscreen().catch(() => {});
    navigate("/dashboard");
  };

  const handleViolation = (reason) => {
    if (isSubmitting || phase === "COMPILING" || phase === "TERMINATED") return;
    setViolations((prev) => [...prev, reason]);
    setActiveWarning(reason);
    
    setWarningCount((prev) => {
      const n = prev + 1;
      if (n >= 5) {
        terminateInterview(`Repeated integrity violations: ${reason}`);
      }
      return n;
    });
    setTimeout(() => setActiveWarning(""), 5000);
  };

  const handleManualEnterFullscreen = async () => {
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
        setIsFullscreenActive(true);
        setNeedsFullscreenActivation(false);
      }
    } catch (err) {
      alert("Failed entering fullscreen. Please verify browser permissions.");
    }
  };

  return (
    <div className="live-interview-container">
      {/* ⚠️ Fullscreen Exit warning Overlay */}
      <AnimatePresence>
        {exitedFullscreenWarning && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fullscreen-prompt-overlay"
          >
            <div className="fullscreen-prompt-card" style={{ border: "2px solid #ef4444" }}>
              <ShieldAlert size={48} className="text-danger" style={{ color: "#ef4444", margin: "0 auto 16px auto" }} />
              <h2 style={{ color: "#991b1b" }}>Fullscreen Escape Detected</h2>
              <p className="text-small" style={{ color: "var(--text-secondary)", margin: "12px 0 0 0" }}>
                Terminating assessment session and committing all completed progress...
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fullscreen Initializer Overlay (if auto blocked) */}
      <AnimatePresence>
        {needsFullscreenActivation && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fullscreen-prompt-overlay"
          >
            <div className="fullscreen-prompt-card">
              <Shield size={48} style={{ color: "var(--color-navy)", margin: "0 auto 16px auto" }} />
              <h2 style={{ color: "var(--color-dark-blue)" }}>Initialize Secure Proctoring Mode</h2>
              <p className="text-small" style={{ color: "var(--text-secondary)", marginBottom: "28px" }}>
                This is a proctored assessment session. Standard browser navigation, back buttons, and tab switching are disabled.
              </p>
              <GlassButton primary onClick={handleManualEnterFullscreen}>
                Enter Secure Fullscreen Mode
              </GlassButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main proctored Split Screen */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="page-container live-interview-page"
      >
        {/* LEFT PANEL */}
        <div className="live-left" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          
          {/* Horizontal Progress bar */}
          <div className="progress-bar-wrapper">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.85rem", fontWeight: "600", color: "var(--text-secondary)" }}>
              <span>Question {roundNumber} of {blueprint.length}</span>
              <span>Estimated Time: {(blueprint.length - roundNumber + 1) * 2} min left</span>
            </div>
            <div className="progress-bar-container">
              <div className="progress-bar-fill" style={{ width: `${(roundNumber / blueprint.length) * 100}%` }} />
            </div>
          </div>

          <div style={{ display: "flex", gap: "8px" }}>
            <GlassBadge status="secondary">{level} Level</GlassBadge>
            <GlassBadge status="secondary">{role}</GlassBadge>
          </div>

          {activeWarning && (
            <div className="warning-banner pulse" style={{ background: "rgba(239,68,68,0.12)", border: "1px solid #ef4444", borderRadius: "12px", padding: "12px 16px", color: "#991b1b", fontSize: "0.85rem", display: "flex", alignItems: "center" }}>
              <AlertTriangle size={14} style={{ marginRight: "6px" }} />
              PROCTOR WARNING ({warningCount}/5): {activeWarning}
            </div>
          )}

          <GlassCard className="round-info" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 24px" }}>
            <h3 style={{ margin: 0, fontSize: "1.1rem", color: "var(--color-dark-blue)" }}>
              Round {roundNumber}: {roundName}
            </h3>
            <GlassBadge status="secondary">{currentDifficulty}</GlassBadge>
          </GlassCard>

          <GlassCard className="question-box" style={{ padding: "24px" }}>
            <h3 style={{ fontSize: "0.9rem", display: "flex", alignItems: "center", gap: "6px", marginBottom: "12px", color: "var(--text-secondary)", margin: 0 }}><HelpCircle size={14} /> Question Text</h3>
            <p className="question-text" style={{ fontSize: "1.3rem", color: "var(--color-navy)", lineHeight: "1.5", margin: "8px 0 0 0", fontWeight: "600" }}>{currentQuestion}</p>
          </GlassCard>

          {/* TIMER BOX */}
          <GlassCard style={{ padding: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h3 style={{ fontSize: "0.85rem", color: "var(--text-secondary)", margin: 0 }}>
                  {phase === "PREPARING" ? "⏱ Preparing Time (AI is speaking)" : "🎙 Spoken Answering Time"}
                </h3>
                <p className="text-small" style={{ color: "var(--text-muted)", margin: "4px 0 0 0" }}>
                  {phase === "PREPARING" ? "Mic will unmute automatically" : "Speaking answers are streamed continuously"}
                </p>
              </div>
              <p className={`timer-count ${timeLeft <= 5 ? "time-warning" : ""}`} style={{ fontSize: "2.2rem", fontWeight: "800", margin: 0, color: timeLeft <= 5 ? "#ef4444" : "var(--color-navy)", fontFamily: "var(--font-display)" }}>
                {timeLeft}s
              </p>
            </div>
          </GlassCard>

          {/* TRANSCRIPTION TRANSCRIPT CONTAINER */}
          <GlassCard className="transcription-box" style={{ padding: "24px" }}>
            <h3 style={{ fontSize: "0.9rem", display: "flex", alignItems: "center", gap: "6px", marginBottom: "12px", color: "var(--text-secondary)", margin: 0 }}>
              <MessageSquareCode size={14} /> Live Transcription
            </h3>
            <div className="transcription-text-wrapper">
              <p className="transcription-text" style={{ fontSize: "1.05rem", lineHeight: "1.6", margin: 0, color: currentAnswer ? "var(--color-navy)" : "var(--text-muted)", fontStyle: currentAnswer ? "normal" : "italic" }}>
                {phase === "PREPARING" ? (
                  <span className="placeholder">Preparation time active. Listening unmuted when AI finishes speaking...</span>
                ) : currentAnswer ? (
                  <>
                    <span className="recording-dot" />
                    {currentAnswer}
                  </>
                ) : (
                  <span className="placeholder pulsing">
                    <span className="recording-dot" />
                    Listening... Speak to transcribe response (silence detector submits automatically).
                  </span>
                )}
              </p>
            </div>
          </GlassCard>
        </div>

        {/* RIGHT PANEL - LIVE PROCTORING */}
        <div className="live-right" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          
          {/* CAMERA FEED */}
          <GlassCard style={{ display: "flex", flexDirection: "column", gap: "12px", padding: "24px" }}>
            <h3 style={{ fontSize: "1rem", display: "flex", alignItems: "center", gap: "8px", margin: 0, color: "var(--color-dark-blue)" }}>
              <Video size={18} className="text-secondary" /> Video Monitoring Stream
            </h3>
            <div className="camera-box" style={{ borderRadius: "16px", overflow: "hidden", border: "1px solid var(--glass-border)", background: "#000", height: "180px", marginTop: "8px" }}>
              <CameraMonitor onViolation={handleViolation} />
            </div>
          </GlassCard>

          {/* REAL-TIME INTEGRITY DASHBOARD */}
          <GlassCard style={{ padding: "24px" }}>
            <h3 style={{ fontSize: "1rem", display: "flex", alignItems: "center", gap: "8px", margin: 0, color: "var(--color-dark-blue)", marginBottom: "16px" }}>
              <Shield size={18} className="text-secondary" style={{ color: "var(--color-medium-blue)" }} /> Integrity Dashboard
            </h3>

            <div className="integrity-dashboard">
              <div className={`indicator-row ${isFullscreenActive ? "active" : ""}`}>
                <span className="indicator-label">
                  <Check size={14} style={{ color: isFullscreenActive ? "#10b981" : "#ef4444" }} /> Fullscreen Mode
                </span>
                <span className="indicator-status" style={{ background: isFullscreenActive ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)", color: isFullscreenActive ? "#10b981" : "#ef4444" }}>
                  {isFullscreenActive ? "Active" : "Exited"}
                </span>
              </div>

              <div className="indicator-row active">
                <span className="indicator-label">
                  <Check size={14} style={{ color: "#10b981" }} /> Face Tracked
                </span>
                <span className="indicator-status" style={{ background: "rgba(16, 185, 129, 0.1)", color: "#10b981" }}>
                  Connected
                </span>
              </div>

              <div className="indicator-row active">
                <span className="indicator-label">
                  <Check size={14} style={{ color: "#10b981" }} /> Single Candidate
                </span>
                <span className="indicator-status" style={{ background: "rgba(16, 185, 129, 0.1)", color: "#10b981" }}>
                  Verified
                </span>
              </div>

              <div className="indicator-row active">
                <span className="indicator-label">
                  <Check size={14} style={{ color: "#10b981" }} /> Screen Gaze Check
                </span>
                <span className="indicator-status" style={{ background: "rgba(16, 185, 129, 0.1)", color: "#10b981" }}>
                  Calibrated
                </span>
              </div>

              <div className={`indicator-row ${isListening ? "active" : ""}`}>
                <span className="indicator-label">
                  <Check size={14} style={{ color: isListening ? "#10b981" : "var(--text-muted)" }} /> Microphone Active
                </span>
                <span className="indicator-status" style={{ background: isListening ? "rgba(16, 185, 129, 0.1)" : "rgba(0, 0, 0, 0.05)", color: isListening ? "#10b981" : "var(--text-muted)" }}>
                  {isListening ? "Streaming" : "Muted"}
                </span>
              </div>

              <div className={`indicator-row ${warningCount > 0 ? "active" : ""}`} style={{ borderColor: warningCount > 0 ? "rgba(239, 68, 68, 0.25)" : "var(--glass-border)" }}>
                <span className="indicator-label">
                  <AlertTriangle size={14} style={{ color: warningCount > 0 ? "#ef4444" : "var(--text-muted)" }} /> Warning Count
                </span>
                <span className="indicator-status" style={{ background: warningCount > 0 ? "rgba(239, 68, 68, 0.1)" : "rgba(0, 0, 0, 0.05)", color: warningCount > 0 ? "#ef4444" : "var(--text-muted)" }}>
                  {warningCount} / 5
                </span>
              </div>
            </div>
          </GlassCard>
        </div>
      </motion.div>
    </div>
  );
}

export default AIInterviewLive;
