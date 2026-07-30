import { useEffect, useMemo, useRef, useState, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import CameraMonitor from "../components/CameraMonitor";
import { AppContext } from "../contexts/AppContext";
import { interviewAPI } from "../api/endpoints";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Mic, Clock, ShieldAlert, AlertTriangle, Radio, 
  RotateCcw, Play, CheckCircle, Video, HelpCircle, 
  MessageSquareCode, Shield, Check, X, BrainCircuit, Sparkles
} from "lucide-react";
import { GlassCard, GlassButton, GlassBadge, GlassProgress } from "../components/ui/DesignSystem";
import "./AIInterview.css";

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

// Welcome sequence sentences will be generated dynamically based on candidate profile.

// Round Transition speech helper
const getRoundIntroPhrase = (roundName, roundNumber) => {
  if (roundNumber === 1) return "";
  const nameLower = roundName ? roundName.toLowerCase() : "";
  if (nameLower.includes("resume")) {
    return "Great. Let's walk through your resume experience.";
  } else if (nameLower.includes("project")) {
    return "Now, I'd like to understand the design details of your projects.";
  } else if (nameLower.includes("internship") || nameLower.includes("work")) {
    return "Excellent. Let's discuss your professional work experience.";
  } else if (nameLower.includes("technical fundamentals") || nameLower.includes("fundamentals")) {
    return "Next, let's move into some technical fundamental concepts.";
  } else if (nameLower.includes("advanced") || nameLower.includes("concept analysis")) {
    return "Great. Let's dive deeper into some advanced concept analysis.";
  } else if (nameLower.includes("system design") || nameLower.includes("architecture")) {
    return "Now, let's explore your system design and architecture skills.";
  } else if (nameLower.includes("scenario") || nameLower.includes("troubleshooting")) {
    return "Next, I have a scenario-based question for you.";
  } else if (nameLower.includes("behavioral") || nameLower.includes("leadership")) {
    return "Let's transition to some behavioral and situational questions.";
  } else if (nameLower.includes("hr") || nameLower.includes("closing") || nameLower.includes("cultural")) {
    return "Finally, let's discuss your career goals and alignment.";
  }
  return "Great. Let's move to the next question.";
};

const EIAvatar = ({ isSpeaking }) => {
  return (
    <svg width="80" height="80" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ zIndex: 10 }}>
      {/* Head Glow / Background */}
      <circle cx="32" cy="32" r="28" fill="url(#avatar-grad)" />
      
      {/* Eyes with Blink Animation */}
      <motion.ellipse
        cx="24"
        cy="26"
        rx="3"
        ry="3"
        animate={{ scaleY: [1, 1, 0.1, 1, 1] }}
        transition={{ repeat: Infinity, duration: 4, times: [0, 0.9, 0.95, 1, 1] }}
        fill="#fff"
      />
      <motion.ellipse
        cx="40"
        cy="26"
        rx="3"
        ry="3"
        animate={{ scaleY: [1, 1, 0.1, 1, 1] }}
        transition={{ repeat: Infinity, duration: 4, times: [0, 0.9, 0.95, 1, 1] }}
        fill="#fff"
      />
      
      {/* Mouth with Speaking Animation */}
      <motion.path 
        d={isSpeaking ? "M24,40 Q32,48 40,40" : "M26,42 Q32,42 38,42"} 
        animate={{ d: isSpeaking ? ["M24,40 Q32,43 40,40", "M24,40 Q32,48 40,40"] : "M26,42 Q32,42 38,42" }}
        transition={isSpeaking ? { repeat: Infinity, repeatType: "reverse", duration: 0.15 } : {}}
        stroke="#fff" 
        strokeWidth="3" 
        strokeLinecap="round" 
        fill="none"
      />
      
      <circle cx="32" cy="32" r="26" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
      
      <defs>
        <linearGradient id="avatar-grad" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#4f46e5" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
      </defs>
    </svg>
  );
};

function AIInterviewLive() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setInterviewData } = useContext(AppContext);

  const sessionId = useMemo(() => location.state?.session_id, [location.state]);
  const role = useMemo(() => location.state?.role || "Software Developer", [location.state]);
  const level = useMemo(() => location.state?.level || "Entry", [location.state]);
  const blueprint = useMemo(() => location.state?.blueprint || [], [location.state]);
  const resumeName = location.state?.resumeName || "Resume";

  const candidateName = useMemo(() => {
    const rawName = location.state?.name;
    if (rawName && rawName !== "Candidate") return rawName;
    const email = location.state?.email || "";
    if (email.includes("@")) {
      const part = email.split("@")[0];
      return part.charAt(0).toUpperCase() + part.slice(1);
    }
    return "Candidate";
  }, [location.state]);

  const INTRO_SENTENCES = useMemo(() => [
    `Hello ${candidateName}, and welcome to NeuroPath AI.`,
    "I'm your AI Interview Assistant, and I'll be conducting today's interview.",
    `I've reviewed your profile and prepared a personalized ${level}-level interview for the ${role} position.`,
    "Please answer naturally and take your time.",
    "Once you're ready, we'll begin with the first question.",
    "Good luck!"
  ], [candidateName, role, level]);

  const [isAISpeaking, setIsAISpeaking] = useState(false);

  // Phase 11 Persistence check
  const introPlayedKey = useMemo(() => `intro_completed_${sessionId}`, [sessionId]);
  const getInitialPhase = () => {
    if (!sessionId) return "INITIALIZING";
    const completed = localStorage.getItem(`intro_completed_${sessionId}`) === "true";
    return completed ? "QUESTION" : "INITIALIZING";
  };

  // Phase 9 Stages: INITIALIZING, INTRODUCTION, READY, QUESTION, SUBMITTING, COMPLETED, TERMINATED
  const [phase, setPhase] = useState(getInitialPhase); 
  const [questionSubPhase, setQuestionSubPhase] = useState("PREPARING"); // PREPARING, ANSWERING inside QUESTION phase

  // Question State & Metadata (Phase 4 Adaptive Timers)
  const [currentQuestion, setCurrentQuestion] = useState(
    location.state?.first_question?.question_text || "Tell me about your background."
  );
  const [questionTimeLeft, setQuestionTimeLeft] = useState(
    location.state?.first_question?.expected_duration || location.state?.first_question?.estimated_time || 60
  );
  const [questionType, setQuestionType] = useState(
    location.state?.first_question?.question_type || "behavioral"
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

  const [timeLeft, setTimeLeft] = useState(questionTimeLeft);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState("AI Interviewer is starting...");
  const [violations, setViolations] = useState([]);
  const [warningCount, setWarningCount] = useState(0);
  const [activeWarning, setActiveWarning] = useState("");

  // Centralized Proctoring Engine State (Phase 5, 8, 9)
  const [proctorState, setProctorState] = useState("INITIALIZING");
  const [faceConfidence, setFaceConfidence] = useState(0.0);
  const [trackingConfidence, setTrackingConfidence] = useState(0.0);
  const [landmarkConfidence, setLandmarkConfidence] = useState(0.0);
  const [yaw, setYaw] = useState(0.0);
  const [pitch, setPitch] = useState(0.0);
  const [roll, setRoll] = useState(0.0);
  const [brightness, setBrightness] = useState(0.0);
  const [lastDetectionTime, setLastDetectionTime] = useState("Never");
  const [violationStart, setViolationStart] = useState(null);
  const [recoveryStart, setRecoveryStart] = useState(null);
  const [proctorConfig, setProctorConfig] = useState({
    detection_threshold: 0.6,
    frame_rate_ms: 500,
    warning_timeout_s: 3.0,
    pause_timeout_s: 15.0,
    lighting_min: 50.0,
    lighting_max: 220.0
  });

  // Calibration and developer diagnostics states (Phase 4, 9)
  const [calibrationTime, setCalibrationTime] = useState(0.0);
  const [integrityScore, setIntegrityScore] = useState(100);
  const [proctorLogs, setProctorLogs] = useState(["System initialized."]);
  const [lastTransition, setLastTransition] = useState("None");
  const [activeBlockerReason, setActiveBlockerReason] = useState("Initializing systems...");

  const proctorStateRef = useRef("INITIALIZING");
  useEffect(() => {
    proctorStateRef.current = proctorState;
  }, [proctorState]);

  const logProctorState = (fromState, toState, reasonText = "") => {
    const timestamp = new Date().toLocaleTimeString();
    const transitionStr = `${fromState} -> ${toState}`;
    const logMsg = `[${timestamp}] ${transitionStr}${reasonText ? ` (${reasonText})` : ""}`;
    setProctorLogs((prev) => [logMsg, ...prev].slice(0, 50));
    setLastTransition(transitionStr);
  };

  // Load proctoring thresholds on mount (Phase 10 Configuration)
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await interviewAPI.getProctorConfig();
        if (res.data) {
          setProctorConfig(res.data);
        }
      } catch (err) {
        console.warn("Failed fetching proctoring thresholds:", err);
      }
    };
    fetchConfig();
  }, []);

  // Voice Activity Detection (VAD) states
  const [isCandidateSpeaking, setIsCandidateSpeaking] = useState(false);
  const [hasSpoken, setHasSpoken] = useState(false);
  const [silenceTimeLeft, setSilenceTimeLeft] = useState(10);
  const [transcriptionStatus, setTranscriptionStatus] = useState("Listening...");

  // Welcome sequence typewriter / mute controls (Phase 4, 5, 6)
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const [typedSentence, setTypedSentence] = useState("");
  const [isIntroMuted, setIsIntroMuted] = useState(false);
  const [isIntroFinished, setIsIntroFinished] = useState(false);
  const [cameraStatus, setCameraStatus] = useState("CHECKING");
  const [micStatus, setMicStatus] = useState("CHECKING");
  const [typedWords, setTypedWords] = useState([]);

  // Fullscreen proctoring states
  const [isFullscreenActive, setIsFullscreenActive] = useState(true);
  const [needsFullscreenActivation, setNeedsFullscreenActivation] = useState(false);
  const [exitedFullscreenWarning, setExitedFullscreenWarning] = useState(false);

  const recognitionRef = useRef(null);
  const timerRef = useRef(null);
  const introTimerRef = useRef(null);
  const lastSpeechTimeRef = useRef(Date.now());
  const answerTextRef = useRef("");
  const scrollContainerRef = useRef(null);
  const subtitleContainerRef = useRef(null);
  
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

  // Auto-scroll transcription element (Phase 6)
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [currentAnswer]);

  // Auto-scroll welcome sequence subtitles
  useEffect(() => {
    if (subtitleContainerRef.current) {
      const activeEl = subtitleContainerRef.current.querySelector(".intro-subtitle-sentence.active");
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }
  }, [currentSentenceIndex, typedWords]);

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
          // Auto-progress removed to enforce proctoring calibration gate
        }
      } catch (err) {
        console.warn("Auto-fullscreen rejected. Displaying manual prompt:", err);
        setNeedsFullscreenActivation(true);
      }
    };

    const handleFullscreenChange = () => {
      const isCurrentlyFs = !!document.fullscreenElement;
      setIsFullscreenActive(isCurrentlyFs);
      
      if (!isCurrentlyFs && phaseRef.current !== "COMPLETED" && phaseRef.current !== "TERMINATED" && phaseRef.current !== "INITIALIZING") {
        setExitedFullscreenWarning(true);
        setTimeout(() => {
          handleEarlyTermination();
        }, 2000);
      }
    };

    const handleVisibility = () => {
      if (document.hidden && phaseRef.current !== "INITIALIZING") {
        handleViolation("Tab switched / Background activity");
      }
    };

    const handleWindowBlur = () => {
      if (phaseRef.current !== "INITIALIZING") {
        handleViolation("Focus lost / Window switch");
      }
    };

    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = "Leaving this page will forfeit the proctored interview. Are you sure?";
      return e.returnValue;
    };

    window.history.pushState(null, null, window.location.href);
    const handlePopState = () => {
      window.history.pushState(null, null, window.location.href);
      if (phaseRef.current !== "INITIALIZING") {
        handleViolation("Attempted browser back navigation");
      }
    };

    const handleKeyDown = (e) => {
      if (e.keyCode === 123) {
        e.preventDefault();
        handleViolation("Opened DevTools (F12)");
      }
      if (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 74 || e.keyCode === 67)) {
        e.preventDefault();
        handleViolation("Opened DevTools shortcut");
      }
      if (e.ctrlKey && e.keyCode === 85) {
        e.preventDefault();
        handleViolation("View Source shortcut");
      }
    };

    enterFullscreen();
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("blur", handleWindowBlur);
    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("popstate", handlePopState);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("blur", handleWindowBlur);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("keydown", handleKeyDown);
      speechSynthesis.cancel();
      stopListening();
      if (timerRef.current) clearInterval(timerRef.current);
      if (introTimerRef.current) clearTimeout(introTimerRef.current);
    };
  }, []);

  // Phase 3 & 4 Welcome Sequence Typewriter effect (Word-by-word reveal)
  useEffect(() => {
    if (phase !== "INTRODUCTION") return;
    
    const sentence = INTRO_SENTENCES[currentSentenceIndex];
    const words = sentence.split(" ");
    setTypedWords([]);
    
    let wordIdx = 0;
    const interval = setInterval(() => {
      if (proctorStateRef.current !== "RUNNING") return;
      setTypedWords((prev) => [...prev, words[wordIdx]]);
      wordIdx++;
      if (wordIdx >= words.length) {
        clearInterval(interval);
      }
    }, 220); 
    
    return () => clearInterval(interval);
  }, [currentSentenceIndex, phase, INTRO_SENTENCES]);

  // Phase 3 & 4 Welcome Sequence voice triggers & adaptive fallback timers
  useEffect(() => {
    if (phase !== "INTRODUCTION") {
      speechSynthesis.cancel();
      if (introTimerRef.current) clearTimeout(introTimerRef.current);
      return;
    }

    const currentSentence = INTRO_SENTENCES[currentSentenceIndex];

    if (isIntroMuted) {
      speechSynthesis.cancel();
      // Calculate length-based timeout for visual reading when muted
      const readingDuration = currentSentence.length * 50 + 1200; 
      
      if (introTimerRef.current) clearTimeout(introTimerRef.current);
      introTimerRef.current = setTimeout(() => {
        advanceSentence();
      }, readingDuration);
    } else {
      if (introTimerRef.current) clearTimeout(introTimerRef.current);
      speakQuestion(currentSentence, () => {
        advanceSentence();
      });
    }

    return () => {
      speechSynthesis.cancel();
      if (introTimerRef.current) clearTimeout(introTimerRef.current);
    };
  }, [currentSentenceIndex, phase, isIntroMuted, INTRO_SENTENCES, proctorState]);

  const advanceSentence = () => {
    if (currentSentenceIndex < INTRO_SENTENCES.length - 1) {
      setCurrentSentenceIndex((prev) => prev + 1);
    } else {
      setIsIntroFinished(true);
      // Transition directly to QUESTION
      setTimeout(() => {
        localStorage.setItem(introPlayedKey, "true");
        setPhase("QUESTION");
        setQuestionSubPhase("PREPARING");
      }, 1000);
    }
  };

  // Phase 5, 8, 9 Live question transition and answering logic
  useEffect(() => {
    if (!sessionId || phase !== "QUESTION") return;

    if (questionSubPhase === "PREPARING") {
      stopListening();
      setCurrentAnswer("");
      setHasSpoken(false);
      setSilenceTimeLeft(10);
      setTranscriptionStatus("Listening...");
      setStatus("AI Interviewer is speaking...");

      const introPhrase = getRoundIntroPhrase(roundName, roundNumber);
      const fullText = introPhrase ? `${introPhrase} ${currentQuestion}` : currentQuestion;

      speakQuestion(fullText, () => {
        setQuestionSubPhase("ANSWERING");
      });

    } else if (questionSubPhase === "ANSWERING") {
      setTimeLeft(questionTimeLeft);
      setStatus("Microphone active. Speak your answer now...");
      startListening();
      lastSpeechTimeRef.current = Date.now();
      setSilenceTimeLeft(10);
      setHasSpoken(false);
      setIsCandidateSpeaking(false);
      setTranscriptionStatus("Listening...");

      // Unified Adaptive Timer & Voice Activity Detection Loop
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        if (proctorStateRef.current !== "RUNNING") return;
        const timeSinceSpeech = Date.now() - lastSpeechTimeRef.current;
        const activeSpeaking = timeSinceSpeech < 2000;
        setIsCandidateSpeaking(activeSpeaking);

        const currentText = answerTextRef.current.trim();
        const userHasSpoken = currentText.length > 0;
        if (userHasSpoken) {
          setHasSpoken(true);
        }

        if (activeSpeaking) {
          setTranscriptionStatus("Transcribing...");
          setSilenceTimeLeft(10);
        } else {
          setTranscriptionStatus("Listening...");
          
          if (userHasSpoken) {
            setSilenceTimeLeft((prev) => {
              if (prev <= 1) {
                clearInterval(timerRef.current);
                submitAnswerAndAdvance();
                return 0;
              }
              return prev - 1;
            });
          } else {
            setTimeLeft((prev) => {
              if (prev <= 1) {
                clearInterval(timerRef.current);
                submitAnswerAndAdvance();
                return 0;
              }
              return prev - 1;
            });
          }
        }
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase, questionSubPhase, currentQuestion, questionTimeLeft]);

  // Robust Speech Synthesis
  const speakQuestion = (text, onComplete) => {
    speechSynthesis.cancel();
    if (proctorStateRef.current !== "RUNNING") {
      setIsAISpeaking(false);
      return;
    }
    if (isIntroMuted && phaseRef.current === "INTRODUCTION") {
      setIsAISpeaking(false);
      if (onComplete) onComplete();
      return;
    }
    
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "en-US";
    utter.rate = 1.02;
    utter.pitch = 1.0;
    
    utter.onstart = () => {
      setIsAISpeaking(true);
    };
    
    const safetyTimeout = setTimeout(() => {
      console.warn("Safety fallback triggered for TTS.");
      setIsAISpeaking(false);
      if (onComplete) onComplete();
    }, 15000);

    utter.onend = () => {
      clearTimeout(safetyTimeout);
      setIsAISpeaking(false);
      if (onComplete) onComplete();
    };
    utter.onerror = () => {
      clearTimeout(safetyTimeout);
      setIsAISpeaking(false);
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
    if (proctorStateRef.current !== "RUNNING") return;
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
      if (phaseRef.current === "QUESTION" && !submittingRef.current && proctorStateRef.current === "RUNNING") {
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
    if (timerRef.current) clearInterval(timerRef.current);
    
    setPhase("SUBMITTING");
    setIsSubmitting(true);
    setTranscriptionStatus("Processing...");
    setStatus("Analyzing spoken speech answers...");

    const spokenAnswer = answerTextRef.current || "No answer provided";
    const timeTaken = questionTimeLeft - timeLeft;
    const requestStart = Date.now();

    try {
      const payload = {
        session_id: sessionId,
        answer: spokenAnswer,
        time_taken: timeTaken,
        violations: violations,
      };

      const response = await interviewAPI.submitAnswer(payload);
      const data = response.data;

      // Enforce 2-second transition screen
      const elapsed = Date.now() - requestStart;
      const delay = Math.max(0, 2000 - elapsed);

      setTimeout(() => {
        if (data.is_completed) {
          setPhase("COMPLETED");
          setTranscriptionStatus("Submitted.");
          setStatus("Evaluating response patterns & compiling career roadmap...");
          
          handleInterviewCompletion(data);
        } else if (data.terminated) {
          terminateInterview(data.message);
        } else {
          const nextQ = data.next_question;
          setCurrentQuestion(nextQ.question_text);
          setQuestionTimeLeft(nextQ.expected_duration || nextQ.estimated_time || 60);
          setQuestionType(nextQ.question_type || "behavioral");
          setCurrentDifficulty(nextQ.difficulty);
          setRoundName(nextQ.round_name);
          setRoundNumber(nextQ.round_number);
          
          setPhase("QUESTION");
          setQuestionSubPhase("PREPARING");
          setIsSubmitting(false);
        }
      }, delay);

    } catch (err) {
      console.error("Answer submission failed:", err);
      setIsSubmitting(false);
      setPhase("QUESTION");
      setQuestionSubPhase("ANSWERING");
    }
  };

  const handleInterviewCompletion = async (answerData) => {
    try {
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
    } catch (err) {
      console.error("Failed compiling report:", err);
      navigate("/dashboard");
    }
  };

  const terminateInterview = (reason) => {
    setPhase("TERMINATED");
    speechSynthesis.cancel();
    stopListening();
    if (timerRef.current) clearInterval(timerRef.current);
    document.exitFullscreen().catch(() => {});
    alert(`Interview Terminated: ${reason}`);
    navigate("/dashboard");
  };

  const handleEarlyTermination = async () => {
    setPhase("TERMINATED");
    speechSynthesis.cancel();
    stopListening();
    if (timerRef.current) clearInterval(timerRef.current);

    try {
      const timeTaken = questionTimeLeft - timeLeft;
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
    if (isSubmitting || phase === "COMPLETED" || phase === "TERMINATED" || phase === "INITIALIZING" || phase === "INTRODUCTION") return;
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

  const [recoveryCountdown, setRecoveryCountdown] = useState(10);
  const [lookAway, setLookAway] = useState(false);
  const [integrityLogs, setIntegrityLogs] = useState([]);
  const [faceStatus, setFaceStatus] = useState("Checking");
  const [faceCentered, setFaceCentered] = useState("Checking");
  const [lightingStatus, setLightingStatus] = useState("Checking");
  const [fullscreenStatus, setFullscreenStatus] = useState("Checking");
  const [tabStatus, setTabStatus] = useState("Checking");

  const logIntegrityEvent = (event, severity) => {
    const newLog = {
      timestamp: new Date().toLocaleTimeString(),
      event: event,
      severity: severity
    };
    setIntegrityLogs((prev) => [...prev, newLog]);
    setViolations((prev) => [...prev, `${event} (${severity})`]);
  };

  const handleProctorUpdate = (data) => {
    if (data.camera_blocked) {
      setCameraStatus("ERROR");
      return;
    }

    setCameraStatus("GRANTED");
    
    // Extract raw metrics from modern CNN-based face detector (Phase 3)
    setFaceConfidence(data.face_confidence ?? 0.0);
    setTrackingConfidence(data.tracking_confidence ?? 0.0);
    setLandmarkConfidence(data.landmark_confidence ?? 0.0);
    setYaw(data.yaw ?? 0.0);
    setPitch(data.pitch ?? 0.0);
    setRoll(data.roll ?? 0.0);
    setBrightness(data.brightness ?? 0.0);
    setLastDetectionTime(new Date().toLocaleTimeString());

    // Update compliance statuses based on thresholds (Phase 5)
    const isDetectionValid = data.face_detected && (data.face_confidence >= proctorConfig.detection_threshold);

    if (!isDetectionValid) {
      setFaceStatus("Disconnected");
    } else if (data.multiple_faces) {
      setFaceStatus("Violation");
    } else {
      setFaceStatus("Connected");
    }

    setFaceCentered(data.face_centered ? "Connected" : "Disconnected");
    setLightingStatus(data.good_lighting ? "Connected" : "Disconnected");
    setLookAway(data.look_away);
  };

  // Sync fullscreen state status indicator
  useEffect(() => {
    setFullscreenStatus(isFullscreenActive ? "Connected" : "Disconnected");
  }, [isFullscreenActive]);

  // Sync window focus state status indicator
  useEffect(() => {
    const handleFocus = () => setTabStatus("Connected");
    const handleBlur = () => {
      setTabStatus("Disconnected");
      if (phaseRef.current !== "INITIALIZING" && phaseRef.current !== "COMPLETED" && phaseRef.current !== "TERMINATED") {
        handleViolation("Tab switched / focus lost");
      }
    };
    window.addEventListener("focus", handleFocus);
    window.addEventListener("blur", handleBlur);
    return () => {
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("blur", handleBlur);
    };
  }, []);

  // Check microphone permission on mount (Phase 1 & 2 Setup)
  useEffect(() => {
    const initMicCheck = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setMicStatus("GRANTED");
        stream.getTracks().forEach((track) => track.stop());
      } catch (err) {
        console.warn("Microphone access denied on mount:", err);
        setMicStatus("ERROR");
      }
    };
    initMicCheck();
  }, []);

  // Compliance Flags
  const isCameraHealthy = cameraStatus === "GRANTED";
  const isMicHealthy = micStatus === "GRANTED";
  const isFaceDetected = faceStatus === "Connected" && faceConfidence >= proctorConfig.detection_threshold;
  const isCentered = faceCentered === "Connected";
  const isLightingOk = lightingStatus === "Connected";
  const isFsActive = isFullscreenActive;
  const isTabActive = tabStatus === "Connected";
  const isGazeOk = !lookAway;

  const checkCurrentCompliance = () => {
    return isCameraHealthy && isMicHealthy && isFaceDetected && isCentered && isLightingOk && isFsActive && isTabActive && isGazeOk;
  };

  const getBlockerReason = () => {
    if (!isFsActive) return "Fullscreen Mode is disabled. Please lock fullscreen.";
    if (tabStatus === "Disconnected") return "Browser focus lost (tab switched / window blurred).";
    if (cameraStatus === "ERROR") return "Webcam access denied or disconnected.";
    if (micStatus === "ERROR") return "Microphone access denied or disconnected.";
    if (faceStatus === "Disconnected") return "No face detected in camera frame.";
    if (faceStatus === "Violation") return "Multiple faces detected in frame.";
    if (!isCentered) return "Face is off-center. Please align face to guides.";
    if (!isLightingOk) return "Suboptimal lighting. Adjust room brightness.";
    if (lookAway && faceStatus === "Connected") return "Gaze lookup warning: Focus eyes on the screen.";
    return "";
  };

  // State Machine 100ms Ticker Loop (Phase 4, 5, 8 Source of Truth)
  useEffect(() => {
    const timer = setInterval(() => {
      const isCompliant = checkCurrentCompliance();
      const blocker = getBlockerReason();
      setActiveBlockerReason(blocker || "None");

      // Dynamic integrity score calculation
      setIntegrityScore(() => {
        let score = 100 - (violations.length * 5) - (warningCount * 8);
        if (proctorState === "PAUSED") score -= 15;
        return Math.max(0, Math.min(100, score));
      });

      setProctorState((currState) => {
        let nextState = currState;

        if (currState === "INITIALIZING") {
          nextState = "CHECKING_PERMISSIONS";
          logProctorState(currState, nextState);
        } else if (currState === "CHECKING_PERMISSIONS") {
          if (cameraStatus !== "CHECKING" && micStatus !== "CHECKING") {
            if (isCameraHealthy && isMicHealthy) {
              nextState = "CHECKING_CAMERA";
              logProctorState(currState, nextState);
            }
          }
        } else if (currState === "CHECKING_CAMERA") {
          if (cameraStatus === "GRANTED") {
            nextState = "CHECKING_MICROPHONE";
            logProctorState(currState, nextState);
          }
        } else if (currState === "CHECKING_MICROPHONE") {
          if (micStatus === "GRANTED") {
            nextState = "CHECKING_FACE";
            logProctorState(currState, nextState);
          }
        } else if (currState === "CHECKING_FACE") {
          if (isFaceDetected) {
            nextState = "CALIBRATING";
            setCalibrationTime(0.0);
            logProctorState(currState, nextState);
          }
        } else if (currState === "CALIBRATING") {
          if (isCompliant) {
            setCalibrationTime((prev) => {
              const nextTime = prev + 0.1;
              if (nextTime >= 3.0) {
                nextState = "READY";
                logProctorState(currState, "READY");
                return 3.0;
              }
              return nextTime;
            });
          } else {
            setCalibrationTime(0.0);
            if (!isFaceDetected) {
              nextState = "CHECKING_FACE";
              logProctorState(currState, nextState, blocker);
            }
          }
        } else if (currState === "READY") {
          if (!isCompliant) {
            nextState = "CHECKING_FACE";
            logProctorState(currState, nextState, blocker);
          }
        } else if (currState === "RUNNING") {
          if (!isCompliant) {
            const isSevere = !isFsActive || !isTabActive;
            if (isSevere) {
              nextState = "PAUSED";
              setPhase("PAUSED");
              setRecoveryCountdown(proctorConfig.pause_timeout_s);
              setViolationStart(Date.now());
              speechSynthesis.cancel();
              stopListening();
              logProctorState(currState, nextState, blocker);
              logIntegrityEvent(blocker, "HIGH");
            } else {
              nextState = "WARNING";
              setViolationStart(Date.now());
              setActiveWarning(blocker);
              logProctorState(currState, nextState, blocker);
              logIntegrityEvent(blocker, "MEDIUM");
            }
          }
        } else if (currState === "WARNING") {
          if (isCompliant) {
            nextState = "RUNNING";
            setActiveWarning("");
            setViolationStart(null);
            logProctorState(currState, nextState, "Compliance Restored");
          } else {
            const elapsed = (Date.now() - violationStart) / 1000;
            if (elapsed >= proctorConfig.warning_timeout_s) {
              nextState = "PAUSED";
              setPhase("PAUSED");
              setRecoveryCountdown(proctorConfig.pause_timeout_s);
              speechSynthesis.cancel();
              stopListening();
              logProctorState(currState, nextState, blocker);
              logIntegrityEvent(blocker, "HIGH");
            }
          }
        } else if (currState === "PAUSED") {
          if (isCompliant) {
            nextState = "RECOVERING";
            setRecoveryStart(Date.now());
            logProctorState(currState, nextState, "Candidate compliant again");
          }
        } else if (currState === "RECOVERING") {
          if (!isCompliant) {
            nextState = "PAUSED";
            setRecoveryStart(null);
            logProctorState(currState, nextState, blocker);
          } else {
            const elapsed = (Date.now() - recoveryStart) / 1000;
            if (elapsed >= 1.5) {
              nextState = "RUNNING";
              setPhase(localStorage.getItem(`intro_completed_${sessionId}`) === "true" ? "QUESTION" : "INTRODUCTION");
              setActiveWarning("");
              setViolationStart(null);
              setRecoveryStart(null);
              setQuestionSubPhase("ANSWERING");
              logProctorState(currState, nextState, "Compliance stabilization verified");
            }
          }
        }

        return nextState;
      });
    }, 100);

    return () => clearInterval(timer);
  }, [
    isCameraHealthy, isMicHealthy, isFaceDetected, isCentered, isLightingOk,
    isFsActive, isTabActive, isGazeOk, proctorState, violationStart, recoveryStart, proctorConfig, violations, warningCount
  ]);

  const handleStartInterview = () => {
    setProctorState("RUNNING");
    logProctorState("READY", "RUNNING", "Candidate started interview");
    
    const introPlayed = localStorage.getItem(`intro_completed_${sessionId}`) === "true";
    if (introPlayed) {
      setPhase("QUESTION");
      setQuestionSubPhase("PREPARING");
    } else {
      setPhase("INTRODUCTION");
      setCurrentSentenceIndex(0);
      setTypedSentence("");
    }
  };

  // Elapsed-time paused countdown decrement loop
  useEffect(() => {
    if (proctorState !== "PAUSED") return;

    const interval = setInterval(() => {
      setRecoveryCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setProctorState("TERMINATED");
          terminateInterview("Integrity validation timeout exceeded.");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [proctorState]);

  // Phase 6 Welcomer Controls
  const handleToggleMute = () => {
    setIsIntroMuted((prev) => !prev);
    setIsAISpeaking(false);
    speechSynthesis.cancel();
  };

  const handleReplayIntro = () => {
    if (introTimerRef.current) clearTimeout(introTimerRef.current);
    speechSynthesis.cancel();
    setIsAISpeaking(false);
    setIsIntroFinished(false);
    setCurrentSentenceIndex(0);
    setTypedSentence("");
  };

  const handleSkipIntro = () => {
    if (introTimerRef.current) clearTimeout(introTimerRef.current);
    speechSynthesis.cancel();
    setIsAISpeaking(false);
    localStorage.setItem(introPlayedKey, "true");
    // Skip immediately to Question 1
    setPhase("QUESTION");
    setQuestionSubPhase("PREPARING");
  };

  const handleContinueFromIntro = () => {
    localStorage.setItem(introPlayedKey, "true");
    setIsAISpeaking(false);
    speechSynthesis.cancel();
    setPhase("READY");
  };

  // Dynamic Dashboard status variables mapped live from proctoring
  const faceTracked = !activeWarning.toLowerCase().includes("no face") && !activeWarning.toLowerCase().includes("too far");
  const singleCandidate = !activeWarning.toLowerCase().includes("multiple persons");
  const gazeCalibrated = !activeWarning.toLowerCase().includes("looking away");
  const tabSecure = !activeWarning.toLowerCase().includes("focus lost") && !activeWarning.toLowerCase().includes("tab switched") && !activeWarning.toLowerCase().includes("window switch");

  return (
    <div className="live-interview-container">
      {/* ⚠️ Integrity Pause Recovery Overlay */}
      <AnimatePresence>
        {phase === "PAUSED" && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fullscreen-prompt-overlay"
            style={{ zIndex: 99998, background: "rgba(15, 23, 42, 0.85)", backdropFilter: "blur(12px)" }}
          >
            <div className="fullscreen-prompt-card" style={{ border: "2px solid #ef4444" }}>
              <AlertTriangle size={64} className="text-danger pulsing" style={{ color: "#ef4444", margin: "0 auto 20px auto" }} />
              <h2 style={{ color: "#ef4444", fontSize: "1.8rem", fontWeight: "800" }}>Interview Paused</h2>
              <p style={{ color: "var(--text-secondary)", margin: "16px 0", fontSize: "1.05rem", lineHeight: "1.6" }}>
                An integrity compliance issue has been detected. Please resolve the following warning immediately:
              </p>
              
              <div style={{ background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.2)", borderRadius: "12px", padding: "16px", margin: "20px 0", textAlign: "center", color: "#f87171", fontWeight: "700" }}>
                {!isFullscreenActive ? "❌ Exited Fullscreen Mode" : 
                 (faceStatus === "Disconnected" ? "❌ Face Not Detected / Partially Visible" :
                 (faceStatus === "Violation" ? "❌ Multiple Faces Detected in Frame" : 
                 (tabStatus === "Disconnected" ? "❌ Switched Tabs / Lost Window Focus" : 
                 (cameraStatus === "ERROR" ? "❌ Camera Stream Disconnected" : "❌ Microphone Disconnected"))))}
              </div>

              <div style={{ margin: "28px 0 16px 0" }}>
                <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px", fontWeight: "700" }}>
                  Time Remaining to Comply
                </p>
                <div style={{ fontSize: "3.5rem", fontWeight: "800", color: "#ef4444", fontFamily: "var(--font-display)" }}>
                  {recoveryCountdown}s
                </div>
              </div>

              <p className="text-small" style={{ color: "var(--text-muted)" }}>
                The interview will be automatically terminated and graded as incomplete if compliance is not restored.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
        {needsFullscreenActivation && phase === "INITIALIZING" && (
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
        <div className="live-left">
          
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

          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <GlassBadge status="secondary">{level} Level</GlassBadge>
            <GlassBadge status="secondary">{role}</GlassBadge>
            <GlassBadge status="success">{questionType.replace("_", " ")}</GlassBadge>
          </div>

          {activeWarning && (
            <div className="warning-banner pulse" style={{ background: "rgba(239,68,68,0.12)", border: "1px solid #ef4444", borderRadius: "12px", padding: "12px 16px", color: "#991b1b", fontSize: "0.85rem", display: "flex", alignItems: "center" }}>
              <AlertTriangle size={14} style={{ marginRight: "6px" }} />
              PROCTOR WARNING ({warningCount}/5): {activeWarning}
            </div>
          )}

          {/* Dynamic Conversational UI States */}
          <AnimatePresence mode="wait">
            {phase === "INITIALIZING" && (
              <motion.div
                key="initializing"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
              >
                <GlassCard style={{ padding: "40px", textAlign: "center" }}>
                  <Shield size={48} className="pulsing" style={{ color: "var(--color-navy)", margin: "0 auto 16px auto" }} />
                  <h2 style={{ color: "var(--color-dark-blue)" }}>Initialize Secure Interview Setup</h2>
                  <p className="text-small" style={{ color: "var(--text-secondary)" }}>
                    Please grant the necessary hardware permissions and lock secure fullscreen to begin the proctored session.
                  </p>
                  
                  <div className="setup-checklist" style={{ textAlign: "left", margin: "24px auto", maxWidth: "340px", display: "flex", flexDirection: "column", gap: "12px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: "rgba(255,255,255,0.4)", borderRadius: "8px", border: "1px solid var(--glass-border)", fontSize: "0.9rem" }}>
                      <span>📷 Camera Access</span>
                      <span style={{ fontWeight: "600", color: cameraStatus === "GRANTED" ? "#10b981" : (cameraStatus === "ERROR" ? "#ef4444" : "var(--text-muted)") }}>
                        {cameraStatus === "GRANTED" ? "✓ Connected" : (cameraStatus === "ERROR" ? "✗ Blocked" : "Checking...")}
                      </span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: "rgba(255,255,255,0.4)", borderRadius: "8px", border: "1px solid var(--glass-border)", fontSize: "0.9rem" }}>
                      <span>🎤 Microphone Access</span>
                      <span style={{ fontWeight: "600", color: micStatus === "GRANTED" ? "#10b981" : (micStatus === "ERROR" ? "#ef4444" : "var(--text-muted)") }}>
                        {micStatus === "GRANTED" ? "✓ Connected" : (micStatus === "ERROR" ? "✗ Blocked" : "Checking...")}
                      </span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: "rgba(255,255,255,0.4)", borderRadius: "8px", border: "1px solid var(--glass-border)", fontSize: "0.9rem" }}>
                      <span>👤 Face Detected</span>
                      <span style={{ fontWeight: "600", color: faceStatus === "Connected" ? "#10b981" : (faceStatus === "Checking" ? "var(--text-muted)" : "#ef4444") }}>
                        {faceStatus === "Connected" ? "✓ Verified" : (faceStatus === "Checking" ? "Checking..." : "✗ Missing")}
                      </span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: "rgba(255,255,255,0.4)", borderRadius: "8px", border: "1px solid var(--glass-border)", fontSize: "0.9rem" }}>
                      <span>🎯 Face Centering</span>
                      <span style={{ fontWeight: "600", color: faceCentered === "Connected" ? "#10b981" : (faceCentered === "Checking" ? "var(--text-muted)" : "#ef4444") }}>
                        {faceCentered === "Connected" ? "✓ Centered" : (faceCentered === "Checking" ? "Checking..." : "✗ Align Face")}
                      </span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: "rgba(255,255,255,0.4)", borderRadius: "8px", border: "1px solid var(--glass-border)", fontSize: "0.9rem" }}>
                      <span>💡 Optimal Lighting</span>
                      <span style={{ fontWeight: "600", color: lightingStatus === "Connected" ? "#10b981" : (lightingStatus === "Checking" ? "var(--text-muted)" : "#ef4444") }}>
                        {lightingStatus === "Connected" ? "✓ Good" : (lightingStatus === "Checking" ? "Checking..." : "✗ Low Light")}
                      </span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: "rgba(255,255,255,0.4)", borderRadius: "8px", border: "1px solid var(--glass-border)", fontSize: "0.9rem" }}>
                      <span>🖥 Secure Fullscreen</span>
                      <span style={{ fontWeight: "600", color: isFullscreenActive ? "#10b981" : "var(--text-muted)" }}>
                        {isFullscreenActive ? "✓ Active" : "Pending"}
                      </span>
                    </div>
                  </div>

                  {!isFullscreenActive ? (
                    <GlassButton primary onClick={handleManualEnterFullscreen} style={{ width: "100%", justifyContent: "center" }}>
                      Lock Fullscreen Mode
                    </GlassButton>
                  ) : proctorState === "READY" ? (
                    <GlassButton primary onClick={handleStartInterview} style={{ width: "100%", justifyContent: "center" }}>
                      Start Interview 🚀
                    </GlassButton>
                  ) : (
                    <GlassButton primary disabled style={{ width: "100%", justifyContent: "center", opacity: 0.6 }}>
                      {proctorState === "CALIBRATING"
                        ? `Calibrating Face (${Math.round(calibrationTime * 10) / 10}s / 3.0s)...`
                        : (proctorState === "CHECKING_PERMISSIONS" || proctorState === "INITIALIZING"
                           ? "Initializing permissions..."
                           : "Awaiting Compliance Setup...")}
                    </GlassButton>
                  )}
                </GlassCard>
              </motion.div>
            )}

            {phase === "INTRODUCTION" && (
              <motion.div
                key="introduction"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.4 }}
              >
                <GlassCard style={{ padding: "32px", textAlign: "center" }}>
                  <div className="ai-avatar-container">
                    <div className={`ai-avatar-circle ${isAISpeaking ? "speaking" : "breathing"}`}>
                      <div className="ai-avatar-glow" />
                      <EIAvatar isSpeaking={isAISpeaking} />
                    </div>
                    {/* Phase 5 Animated waveform while speaking */}
                    {!isIntroMuted && !isIntroFinished ? (
                      <div className={`voice-wave ${isAISpeaking ? "speaking" : "silent"}`}>
                        <div className="voice-bar" />
                        <div className="voice-bar" />
                        <div className="voice-bar" />
                        <div className="voice-bar" />
                        <div className="voice-bar" />
                      </div>
                    ) : (
                      <div style={{ fontSize: "0.8rem", fontWeight: "600", color: "var(--text-muted)", height: "36px", display: "flex", alignItems: "center" }}>
                        {isIntroMuted ? "Voice Muted" : "Introduction Finished"}
                      </div>
                    )}
                  </div>
                  <h2 style={{ color: "var(--color-dark-blue)", fontSize: "1.3rem", marginTop: "8px" }}>AI Interview Assistant</h2>
                  
                  {/* Subtitles container (Phase 4 Sentence scroll & highlighting) */}
                  <div className="intro-subtitles-container" ref={subtitleContainerRef}>
                    {INTRO_SENTENCES.map((sentence, idx) => {
                      let sentenceClass = "intro-subtitle-sentence";
                      if (idx === currentSentenceIndex) {
                        sentenceClass += " active";
                      } else if (idx < currentSentenceIndex) {
                        sentenceClass += " completed";
                      }
                      
                      return (
                        <div key={idx} className={sentenceClass}>
                          {idx === currentSentenceIndex ? (
                            <>
                              {typedWords.map((word, wIdx) => (
                                <motion.span 
                                  key={wIdx}
                                  initial={{ opacity: 0, y: 2 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ duration: 0.15 }}
                                  style={{ marginRight: "6px", display: "inline-block" }}
                                >
                                  {word}
                                </motion.span>
                              ))}
                              {typedWords.length < sentence.split(" ").length && <span className="intro-cursor" />}
                            </>
                          ) : (
                            sentence
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Intro Controls (Phase 6) */}
                  <div className="intro-controls">
                    <GlassButton onClick={handleToggleMute} style={{ minWidth: "120px" }}>
                      {isIntroMuted ? "🔈 Unmute Voice" : "🔇 Mute Voice"}
                    </GlassButton>
                    <GlassButton onClick={handleReplayIntro}>
                      🔄 Replay
                    </GlassButton>
                    <GlassButton onClick={handleSkipIntro}>
                      Skip Welcomer ⏭
                    </GlassButton>
                    <GlassButton 
                      primary 
                      disabled={!isIntroFinished} 
                      onClick={handleContinueFromIntro}
                      style={{ minWidth: "130px" }}
                    >
                      Continue <CheckCircle size={16} />
                    </GlassButton>
                  </div>
                </GlassCard>
              </motion.div>
            )}

            {phase === "READY" && (
              <motion.div
                key="ready"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
              >
                <GlassCard style={{ padding: "40px", textAlign: "center" }}>
                  <BrainCircuit size={48} className="pulsing" style={{ color: "var(--color-navy)", margin: "0 auto 16px auto" }} />
                  <h2 style={{ color: "var(--color-dark-blue)" }}>Preparing your personalized interview...</h2>
                  <p className="text-small" style={{ color: "var(--text-secondary)", marginBottom: "24px" }}>
                    Structuring technical rubrics, loading custom resume markers, and starting the Speech engine...
                  </p>
                  <div className="loader-pulse" style={{ width: "32px", height: "32px", borderRadius: "50%", border: "3px solid var(--color-navy)", borderTopColor: "transparent", animation: "spin 1s linear infinite", margin: "0 auto" }} />
                </GlassCard>
              </motion.div>
            )}

            {phase === "SUBMITTING" && (
              <motion.div
                key="submitting"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                <GlassCard style={{ padding: "40px", textAlign: "center" }}>
                  <div className="ai-avatar-container">
                    <div className="ai-avatar-circle" style={{ background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)" }}>
                      <div className="ai-avatar-glow" style={{ backgroundColor: "rgba(139, 92, 246, 0.2)" }} />
                      <Radio size={48} style={{ color: "#fff", zIndex: 10 }} />
                    </div>
                    <div className="voice-wave">
                      <div className="voice-bar" style={{ animationDuration: "0.4s" }} />
                      <div className="voice-bar" style={{ animationDuration: "0.4s" }} />
                      <div className="voice-bar" style={{ animationDuration: "0.4s" }} />
                      <div className="voice-bar" style={{ animationDuration: "0.4s" }} />
                      <div className="voice-bar" style={{ animationDuration: "0.4s" }} />
                    </div>
                  </div>
                  <h2 style={{ color: "var(--color-dark-blue)", fontSize: "1.45rem", margin: "16px 0 8px 0" }}>Analyzing your answer...</h2>
                  <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", margin: 0 }}>
                    AI is parsing semantic matches, vocabulary coverage, and confidence levels.
                  </p>
                </GlassCard>
              </motion.div>
            )}

            {phase === "QUESTION" && (
              <motion.div
                key="question"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.4 }}
                style={{ display: "flex", flexDirection: "column", gap: "20px" }}
              >
                <GlassCard className="round-info" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h3 style={{ margin: 0, fontSize: "1.1rem", color: "var(--color-dark-blue)" }}>
                    Round {roundNumber}: {roundName}
                  </h3>
                  <GlassBadge status="secondary">{currentDifficulty}</GlassBadge>
                </GlassCard>

                {/* Question Box */}
                <GlassCard className="question-box">
                  <h3 style={{ fontSize: "0.9rem", display: "flex", alignItems: "center", gap: "6px", marginBottom: "12px", color: "var(--text-secondary)", margin: 0 }}>
                    <HelpCircle size={14} /> Question Text
                  </h3>
                  <p className="question-text" style={{ fontSize: "1.25rem", color: "var(--color-navy)", lineHeight: "1.55", margin: "8px 0 0 0", fontWeight: "600" }}>
                    {currentQuestion}
                  </p>
                </GlassCard>

                {/* TIMER BOX */}
                <GlassCard style={{ padding: "24px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <h3 style={{ fontSize: "0.85rem", color: "var(--text-secondary)", margin: 0 }}>
                        {isCandidateSpeaking ? "🔊 Countdown Paused (Speaking)" : "⏱ Answering Countdown"}
                      </h3>
                      <p className="text-small" style={{ color: "var(--text-muted)", margin: "4px 0 0 0" }}>
                        {isCandidateSpeaking ? "Continue sharing your answer..." : "Adaptive timer is active"}
                      </p>
                    </div>
                    <p className={`timer-count ${timeLeft <= 10 ? "time-warning" : ""}`} style={{ fontSize: "2.4rem", fontWeight: "800", margin: 0, color: timeLeft <= 10 ? "#ef4444" : "var(--color-navy)", fontFamily: "var(--font-display)" }}>
                      {timeLeft}s
                    </p>
                  </div>
                </GlassCard>

                {/* TRANSCRIPTION CONTAINER */}
                <GlassCard className="transcription-box">
                  <h3 style={{ fontSize: "0.9rem", display: "flex", alignItems: "center", gap: "6px", marginBottom: "12px", color: "var(--text-secondary)", margin: 0 }}>
                    <MessageSquareCode size={14} /> Live Transcription
                  </h3>
                  <div className="transcription-text-wrapper" ref={scrollContainerRef}>
                    <p className="transcription-text" style={{ fontSize: "1.05rem", lineHeight: "1.65", margin: 0, color: currentAnswer ? "var(--color-navy)" : "var(--text-muted)", fontStyle: currentAnswer ? "normal" : "italic" }}>
                      {currentAnswer ? (
                        <>
                          <span className="recording-dot" />
                          {currentAnswer}
                        </>
                      ) : (
                        <span className="placeholder pulsing">
                          <span className="recording-dot" />
                          Listening... Start speaking to transcribe response
                        </span>
                      )}
                    </p>
                  </div>
                  
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "12px", borderTop: "1px solid var(--glass-border)", paddingTop: "12px" }}>
                    <GlassBadge status={isCandidateSpeaking ? "success" : "secondary"}>
                      {transcriptionStatus}
                    </GlassBadge>
                    
                    {hasSpoken && silenceTimeLeft < 10 && (
                      <div style={{ color: "#ef4444", fontSize: "0.85rem", fontWeight: "700", display: "flex", alignItems: "center", gap: "6px" }} className="pulse">
                        <AlertTriangle size={14} /> Silent. Submitting in {silenceTimeLeft}s
                      </div>
                    )}
                  </div>
                </GlassCard>

                {/* Controls */}
                <div className="interview-controls" style={{ display: "flex", gap: "12px" }}>
                  <GlassButton primary disabled={isSubmitting} onClick={submitAnswerAndAdvance} style={{ flex: 1, justifyContent: "center" }}>
                    <CheckCircle size={16} /> Submit Answer
                  </GlassButton>
                  <GlassButton disabled={isSubmitting} onClick={() => {
                    setCurrentAnswer("Question skipped by candidate.");
                    answerTextRef.current = "Question skipped by candidate.";
                    submitAnswerAndAdvance();
                  }} style={{ flex: 1, justifyContent: "center" }}>
                    <RotateCcw size={16} /> Skip Round
                  </GlassButton>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* RIGHT PANEL - LIVE PROCTORING */}
        <div className="live-right">
          
          {/* CAMERA FEED (Phase 2 & 10 Upgrade) */}
          <GlassCard style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <h3 style={{ fontSize: "1rem", display: "flex", alignItems: "center", gap: "8px", margin: 0, color: "var(--color-dark-blue)" }}>
              <Video size={18} className="text-secondary" /> Video Monitoring Stream
            </h3>
            
            <div className="camera-box">
              <div className="camera-overlay-vignette" />
              <div className="camera-centering-guide" />
              <CameraMonitor sessionId={sessionId} onViolation={handleViolation} onProctorUpdate={handleProctorUpdate} />
              
              {/* Floating badges on camera feed */}
              <div style={{ position: "absolute", top: "12px", left: "12px", display: "flex", gap: "6px", zIndex: 20 }}>
                <span className="camera-feed-badge green">
                  <span className="recording-dot" style={{ margin: 0, width: 6, height: 6 }} /> CAM ACTIVE
                </span>
                <span className={`camera-feed-badge ${isListening ? "green" : "gray"}`}>
                  MIC {isListening ? "ON" : "OFF"}
                </span>
              </div>
              
              <div style={{ position: "absolute", top: "12px", right: "12px", display: "flex", gap: "6px", zIndex: 20 }}>
                <span className="camera-feed-badge blue">
                  QUAL: EXCELLENT
                </span>
                <span className="camera-feed-badge blue">
                  CALIBRATED
                </span>
              </div>
            </div>
          </GlassCard>

          {/* REAL-TIME INTEGRITY DASHBOARD (Phase 11 Dashboard) */}
          <GlassCard>
            <h3 style={{ fontSize: "1rem", display: "flex", alignItems: "center", gap: "8px", margin: 0, color: "var(--color-dark-blue)", marginBottom: "16px" }}>
              <Shield size={18} className="text-secondary" style={{ color: "var(--color-medium-blue)" }} /> Integrity Dashboard
            </h3>

            <div className="integrity-dashboard" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Engine State Indicator */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: "rgba(0,0,42,0.03)", borderRadius: "12px", border: "1px solid var(--glass-border)" }}>
                <span style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--text-secondary)" }}>Engine State:</span>
                <GlassBadge 
                  status={
                    proctorState === "RUNNING" || proctorState === "TRACKING" ? "success" :
                    proctorState === "WARNING" || proctorState === "RECOVERING" ? "warning" :
                    proctorState === "PAUSED" || proctorState === "TERMINATED" ? "danger" : "secondary"
                  }
                >
                  {proctorState}
                </GlassBadge>
              </div>

              {/* Confidence Progress Bars (Phase 6 Dependency Rules) */}
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", fontWeight: "600", color: "var(--text-secondary)" }}>
                    <span>Face Confidence</span>
                    <span>{faceStatus === "Connected" ? Math.round(faceConfidence * 100) : 0}%</span>
                  </div>
                  <GlassProgress value={faceStatus === "Connected" ? faceConfidence * 100 : 0} />
                </div>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", fontWeight: "600", color: "var(--text-secondary)" }}>
                    <span>Tracking Confidence</span>
                    <span>{faceStatus === "Connected" ? Math.round(trackingConfidence * 100) : 0}%</span>
                  </div>
                  <GlassProgress value={faceStatus === "Connected" ? trackingConfidence * 100 : 0} />
                </div>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", fontWeight: "600", color: "var(--text-secondary)" }}>
                    <span>Landmark Confidence</span>
                    <span>{faceStatus === "Connected" ? Math.round(landmarkConfidence * 100) : 0}%</span>
                  </div>
                  <GlassProgress value={faceStatus === "Connected" ? landmarkConfidence * 100 : 0} />
                </div>
              </div>

              {/* Angle Metrics Grid (Phase 6 Dependency Rules) */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px", margin: "4px 0" }}>
                <div style={{ background: "rgba(255,255,255,0.4)", border: "1px solid var(--glass-border)", padding: "8px", borderRadius: "10px", textAlign: "center" }}>
                  <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: "700" }}>YAW</div>
                  <div style={{ fontSize: "0.9rem", fontWeight: "800", color: "var(--color-navy)" }}>
                    {faceStatus === "Connected" ? `${yaw}°` : "N/A"}
                  </div>
                </div>
                <div style={{ background: "rgba(255,255,255,0.4)", border: "1px solid var(--glass-border)", padding: "8px", borderRadius: "10px", textAlign: "center" }}>
                  <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: "700" }}>PITCH</div>
                  <div style={{ fontSize: "0.9rem", fontWeight: "800", color: "var(--color-navy)" }}>
                    {faceStatus === "Connected" ? `${pitch}°` : "N/A"}
                  </div>
                </div>
                <div style={{ background: "rgba(255,255,255,0.4)", border: "1px solid var(--glass-border)", padding: "8px", borderRadius: "10px", textAlign: "center" }}>
                  <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: "700" }}>ROLL</div>
                  <div style={{ fontSize: "0.9rem", fontWeight: "800", color: "var(--color-navy)" }}>
                    {faceStatus === "Connected" ? `${roll}°` : "N/A"}
                  </div>
                </div>
              </div>

              {/* Status Badges List */}
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.85rem" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-secondary)" }}>
                    🖥 Fullscreen Mode
                  </span>
                  <GlassBadge status={isFullscreenActive ? "success" : "danger"}>
                    {isFullscreenActive ? "Secure" : "Exited"}
                  </GlassBadge>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.85rem" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-secondary)" }}>
                    🔍 Eye Gaze Tracking
                  </span>
                  <GlassBadge 
                    status={
                      faceStatus === "Connected" 
                        ? (lookAway ? "warning" : "success") 
                        : "danger"
                    }
                  >
                    {faceStatus === "Connected" 
                      ? (lookAway ? "Looking Away" : "Focused") 
                      : "No Face Detected"}
                  </GlassBadge>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.85rem" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-secondary)" }}>
                    📷 Camera Health
                  </span>
                  <GlassBadge status={cameraStatus === "GRANTED" ? "success" : "danger"}>
                    {cameraStatus === "GRANTED" ? "Healthy" : "Error"}
                  </GlassBadge>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.85rem" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-secondary)" }}>
                    🎤 Microphone Health
                  </span>
                  <GlassBadge status={micStatus === "GRANTED" ? "success" : "danger"}>
                    {micStatus === "GRANTED" ? "Healthy" : "Error"}
                  </GlassBadge>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.85rem" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-secondary)" }}>
                    💡 Lighting Status
                  </span>
                  <GlassBadge status={lightingStatus === "Connected" ? "success" : "warning"}>
                    {lightingStatus === "Connected" ? "Good" : "Suboptimal"}
                  </GlassBadge>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.85rem" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-secondary)" }}>
                    🗂 Focus Shield
                  </span>
                  <GlassBadge status={tabStatus === "Connected" ? "success" : "danger"}>
                    {tabStatus === "Connected" ? "Secure" : "Violation"}
                  </GlassBadge>
                </div>
              </div>

              {/* Timestamp Footer */}
              <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid var(--glass-border)", paddingTop: "10px", fontSize: "0.75rem", color: "var(--text-muted)" }}>
                <span>Last Detection:</span>
                <span>{lastDetectionTime}</span>
              </div>
            </div>
          </GlassCard>

          {/* DEVELOPER DIAGNOSTICS PANEL (Phase 9 Panel) */}
          <GlassCard style={{ marginTop: "16px" }}>
            <h3 style={{ fontSize: "1rem", display: "flex", alignItems: "center", gap: "8px", margin: 0, color: "var(--color-dark-blue)", marginBottom: "16px" }}>
              🛠 Developer Diagnostics
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "0.85rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-secondary)" }}>Last Transition:</span>
                <span style={{ fontWeight: "700", fontFamily: "monospace" }}>{lastTransition}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-secondary)" }}>Calibration Timer:</span>
                <span style={{ fontWeight: "700" }}>{Math.round(calibrationTime * 10) / 10}s / 3.0s</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-secondary)" }}>Integrity Score:</span>
                <span style={{ fontWeight: "700", color: integrityScore >= 80 ? "#10b981" : (integrityScore >= 50 ? "#f59e0b" : "#ef4444") }}>{integrityScore}%</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-secondary)" }}>Blocker Reason:</span>
                <span style={{ fontWeight: "600", color: "#ef4444", fontSize: "0.8rem", maxWidth: "180px", textAlign: "right" }}>{activeBlockerReason}</span>
              </div>
              <div style={{ borderTop: "1px dashed var(--glass-border)", paddingTop: "8px" }}>
                <div style={{ fontWeight: "700", marginBottom: "6px", color: "var(--text-secondary)", fontSize: "0.8rem" }}>State Transition Logs:</div>
                <div style={{ maxHeight: "80px", overflowY: "auto", fontFamily: "monospace", fontSize: "0.75rem", display: "flex", flexDirection: "column", gap: "4px", background: "rgba(0,0,0,0.03)", padding: "8px", borderRadius: "8px" }}>
                  {proctorLogs.slice(0, 30).map((log, idx) => (
                    <div key={idx} style={{ color: log.includes("PAUSED") || log.includes("TERMINATED") ? "#ef4444" : "var(--text-primary)" }}>{log}</div>
                  ))}
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      </motion.div>
    </div>
  );
}

export default AIInterviewLive;
