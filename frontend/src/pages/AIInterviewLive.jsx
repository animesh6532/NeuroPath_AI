import { useEffect, useMemo, useRef, useState, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { SessionManager } from "../utils/sessionManager";
import CameraMonitor from "../components/CameraMonitor";
import { AppContext } from "../contexts/AppContext";
import { interviewAPI } from "../api/endpoints";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Mic, Clock, ShieldAlert, AlertTriangle, Radio, 
  RotateCcw, Play, CheckCircle, Video, HelpCircle, 
  MessageSquareCode, Shield, Check, X, BrainCircuit, Sparkles,
  Volume2, VolumeX, ArrowRight, Camera, Clock3
} from "lucide-react";
import { GlassCard, GlassButton, GlassBadge, GlassProgress } from "../components/ui/DesignSystem";
import "./AIInterview.css";

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

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
      <circle cx="32" cy="32" r="28" fill="url(#avatar-grad)" />
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

  // Authoritative Session Details
  const [sessionId, setSessionId] = useState(null);
  const [role, setRole] = useState(location.state?.role || "Software Developer");
  const [level, setLevel] = useState(location.state?.level || "Entry");
  const [blueprint, setBlueprint] = useState(location.state?.blueprint || []);
  const [firstQuestion, setFirstQuestion] = useState(location.state?.first_question || null);

  // State Machine: "IDLE", "STARTING", "INTRODUCTION", "QUESTION", "LISTENING", "PROCESSING", "COMPLETED", "ERROR"
  const [interviewState, setInterviewState] = useState("IDLE");
  const [errorDetails, setErrorDetails] = useState("");

  // Proctoring Violations & Pauses
  const [isPaused, setIsPaused] = useState(false);
  const [activeWarning, setActiveWarning] = useState("");
  const [recoveryCountdown, setRecoveryCountdown] = useState(15);
  const [violations, setViolations] = useState([]);
  const [warningCount, setWarningCount] = useState(0);

  // Compliance Flags
  const [faceMissing, setFaceMissing] = useState(false);
  const [multipleFaces, setMultipleFaces] = useState(false);
  const [isFullscreenActive, setIsFullscreenActive] = useState(true);
  const [needsFullscreenActivation, setNeedsFullscreenActivation] = useState(false);
  const [tabStatus, setTabStatus] = useState("Connected");

  // Proctoring Telemetry (Display only)
  const [cameraStatus, setCameraStatus] = useState("GRANTED");
  const [micStatus, setMicStatus] = useState("GRANTED");
  const [faceConfidence, setFaceConfidence] = useState(1.0);
  const [brightness, setBrightness] = useState(100.0);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Active question metadata
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [timeLeft, setTimeLeft] = useState(60);
  const [questionTimeLeft, setQuestionTimeLeft] = useState(60);
  const [roundNumber, setRoundNumber] = useState(1);
  const [roundName, setRoundName] = useState("Introduction");
  const [currentDifficulty, setCurrentDifficulty] = useState("Medium");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState("AI Interviewer is ready.");

  // Speech API State
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const [isIntroMuted, setIsIntroMuted] = useState(false);
  const [transcriptionStatus, setTranscriptionStatus] = useState("Listening...");
  const [hasSpoken, setHasSpoken] = useState(false);
  const [silenceTimeLeft, setSilenceTimeLeft] = useState(10);
  const [isCandidateSpeaking, setIsCandidateSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);

  // Developer mode details drawer
  const [showDevMode, setShowDevMode] = useState(false);

  // Refs
  const recognitionRef = useRef(null);
  const timerRef = useRef(null);
  const recoveryTimerRef = useRef(null);
  const lastSpeechTimeRef = useRef(Date.now());
  const answerTextRef = useRef("");
  const interviewStateRef = useRef("IDLE");
  const consecutiveMissingFaceRef = useRef(0);
  const consecutiveMultipleFacesRef = useRef(0);

  // Sync state refs to prevent closure staleness
  useEffect(() => {
    interviewStateRef.current = interviewState;
  }, [interviewState]);

  useEffect(() => {
    answerTextRef.current = currentAnswer;
  }, [currentAnswer]);

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

  // Network offline listener
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // 1. Startup Controller (Initiated when Start Interview is clicked)
  const startInterviewSequence = async () => {
    setInterviewState("STARTING");
    setErrorDetails("");
    setStatus("Initializing secure interview session...");

    try {
      // Validate Session ID
      const activeSessionId = SessionManager.getSessionId() || location.state?.session_id || localStorage.getItem("interview_session_id");
      if (!activeSessionId) {
        throw new Error("No active interview session ID found. Please go back to the setup page and start a new interview.");
      }
      setSessionId(activeSessionId);

      // Validate session with database
      const response = await interviewAPI.validateSession(activeSessionId);
      if (!response || !response.success || !response.data) {
        throw new Error("Session validation failed. The interview session could not be verified.");
      }

      const data = response.data;
      if (data.role) setRole(data.role);
      if (data.level) setLevel(data.level);
      if (data.blueprint) setBlueprint(data.blueprint);
      
      const firstQ = location.state?.first_question || (data.history && data.history[0]) || JSON.parse(localStorage.getItem("interview_first_question"));
      if (firstQ) {
        setFirstQuestion(firstQ);
      }

      // Request hardware access permissions (webcam & microphone)
      setStatus("Requesting camera and microphone access...");
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        stream.getTracks().forEach((track) => track.stop()); // close immediately so components can request them clean
        setCameraStatus("GRANTED");
        setMicStatus("GRANTED");
      } catch (permErr) {
        setCameraStatus("ERROR");
        setMicStatus("ERROR");
        throw new Error("Camera and microphone access are required to start the interview.");
      }

      // Enter fullscreen
      setStatus("Requesting secure fullscreen...");
      try {
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
          setIsFullscreenActive(true);
          setNeedsFullscreenActivation(false);
        }
      } catch (fsErr) {
        console.warn("Fullscreen request rejected by browser:", fsErr);
        setNeedsFullscreenActivation(true);
      }

      // Synchronise session state to READY on backend
      await SessionManager.updateBackendState("READY", "Startup verification completed successfully", "AIInterviewLive.jsx");

      // Transition to Introduction
      setInterviewState("INTRODUCTION");
    } catch (err) {
      console.error("[Startup Failure]", err);
      setErrorDetails(err.message || "Failed to initialize stateful interview.");
      setInterviewState("ERROR");
    }
  };

  // 2. Central Controller State Machine transitions trigger
  useEffect(() => {
    const handleStateTrigger = async () => {
      const state = interviewState;
      console.log(`[Interview State Machine] Transition to: ${state}`);

      if (state === "INTRODUCTION") {
        setStatus("Playing welcome introduction...");
        await SessionManager.updateBackendState("ACTIVE", "Starting welcome introduction", "AIInterviewLive.jsx");
        
        const introText = "Welcome to NeuroPath AI. This interview will evaluate your technical knowledge, projects, communication, and problem-solving skills.";
        speakQuestion(introText, () => {
          loadFirstQuestion();
        });
      }

      else if (state === "QUESTION") {
        setStatus("AI Interviewer is speaking...");
        setCurrentAnswer("");
        setHasSpoken(false);
        setSilenceTimeLeft(10);
        setTranscriptionStatus("Listening...");

        const introPhrase = getRoundIntroPhrase(roundName, roundNumber);
        const fullText = introPhrase ? `${introPhrase} ${currentQuestion}` : currentQuestion;

        speakQuestion(fullText, () => {
          setInterviewState("LISTENING");
        });
      }

      else if (state === "LISTENING") {
        setStatus("Microphone active. Speak your answer now...");
        startListening();
        lastSpeechTimeRef.current = Date.now();
        setSilenceTimeLeft(10);
        setHasSpoken(false);
        setIsCandidateSpeaking(false);
        setTranscriptionStatus("Listening...");

        // Setup the question timer countdown loop
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
          if (interviewStateRef.current !== "LISTENING") {
            clearInterval(timerRef.current);
            return;
          }

          // If paused by proctoring overlay, freeze timers and ignore silence
          if (isPaused) return;

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
                  setInterviewState("PROCESSING");
                  return 0;
                }
                return prev - 1;
              });
            } else {
              setTimeLeft((prev) => {
                if (prev <= 1) {
                  clearInterval(timerRef.current);
                  setInterviewState("PROCESSING");
                  return 0;
                }
                return prev - 1;
              });
            }
          }
        }, 1000);
      }

      else if (state === "PROCESSING") {
        stopListening();
        if (timerRef.current) clearInterval(timerRef.current);

        setStatus("Submitting response for ML evaluation...");
        setIsSubmitting(true);
        setTranscriptionStatus("Processing...");

        const spokenAnswer = answerTextRef.current.trim() || "No answer provided";
        const timeTaken = questionTimeLeft - timeLeft;

        try {
          const payload = {
            session_id: SessionManager.getSessionId(),
            answer: spokenAnswer,
            time_taken: timeTaken,
            violations: violations,
          };

          const response = await interviewAPI.submitAnswer(payload);
          const data = response.data;

          setIsSubmitting(false);
          if (data.is_completed) {
            setInterviewState("COMPLETED");
            setTranscriptionStatus("Submitted.");
            setStatus("Compiling roadmap & evaluation...");
            handleInterviewCompletion(data);
          } else if (data.terminated) {
            terminateInterview(data.message);
          } else {
            const nextQ = data.next_question;
            setCurrentQuestion(nextQ.question_text);
            setQuestionTimeLeft(nextQ.expected_duration || nextQ.estimated_time || 60);
            setTimeLeft(nextQ.expected_duration || nextQ.estimated_time || 60);
            setRoundName(nextQ.round_name || "Next Round");
            setRoundNumber(nextQ.round_number || roundNumber + 1);
            setCurrentDifficulty(nextQ.difficulty || "Medium");

            setInterviewState("QUESTION");
          }
        } catch (err) {
          console.error("Answer submission failed:", err);
          setIsSubmitting(false);
          setErrorDetails("Answer submission failed. Ensure the backend FastAPI server is running.");
          setInterviewState("ERROR");
        }
      }
    };

    handleStateTrigger();

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [interviewState]);

  // Load the pre-generated first question
  const loadFirstQuestion = () => {
    const firstQ = firstQuestion || location.state?.first_question || JSON.parse(localStorage.getItem("interview_first_question"));
    if (firstQ) {
      setCurrentQuestion(firstQ.question_text);
      setQuestionTimeLeft(firstQ.expected_duration || firstQ.estimated_time || 60);
      setTimeLeft(firstQ.expected_duration || firstQ.estimated_time || 60);
      setRoundName(firstQ.round_name || "Introduction");
      setRoundNumber(firstQ.round_number || 1);
      setCurrentDifficulty(firstQ.difficulty || "Medium");

      setInterviewState("QUESTION");
    } else {
      setErrorDetails("Failed to load pre-generated first question.");
      setInterviewState("ERROR");
    }
  };

  // Robust voice synthesis
  const speakQuestion = (text, onComplete) => {
    speechSynthesis.cancel();
    setIsAISpeaking(false);

    if (isIntroMuted || !window.speechSynthesis) {
      if (onComplete) onComplete();
      return;
    }

    try {
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = "en-US";
      utter.rate = 1.02;
      utter.pitch = 1.0;

      let completed = false;
      const triggerComplete = () => {
        if (completed) return;
        completed = true;
        clearTimeout(safetyTimeout);
        setIsAISpeaking(false);

        const currState = interviewStateRef.current;
        if (currState !== "INTRODUCTION" && currState !== "QUESTION") {
          return;
        }
        if (onComplete) onComplete();
      };

      utter.onstart = () => {
        setIsAISpeaking(true);
      };

      const safetyTimeout = setTimeout(() => {
        console.warn("Safety fallback triggered for TTS.");
        triggerComplete();
      }, 10000); // 10s safety timeout

      utter.onend = () => {
        triggerComplete();
      };

      utter.onerror = (e) => {
        console.warn("TTS SpeechSynthesisUtterance error:", e);
        triggerComplete();
      };

      speechSynthesis.speak(utter);
    } catch (err) {
      console.warn("TTS SpeechSynthesis failed:", err);
      if (onComplete) onComplete();
    }
  };

  // Robust voice recording
  const startListening = () => {
    if (!SpeechRecognition) {
      setStatus("Speech Recognition API unsupported in this browser.");
      return;
    }
    stopListening();

    try {
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
        setSilenceTimeLeft(10);
        setHasSpoken(true);
        setIsCandidateSpeaking(true);
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        if (event.error === "not-allowed") {
          setStatus("Microphone access blocked.");
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        if (interviewStateRef.current === "LISTENING" && !isPaused) {
          try {
            recognition.start();
          } catch {}
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error("Failed to start SpeechRecognition:", err);
    }
  };

  const stopListening = () => {
    try {
      if (recognitionRef.current) {
        recognitionRef.current.onend = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.stop();
      }
    } catch {}
    recognitionRef.current = null;
    setIsListening(false);
  };

  // Callback from CameraMonitor for frame updates
  const handleProctorUpdate = (data) => {
    if (data.camera_blocked) {
      setCameraStatus("ERROR");
      return;
    }
    setCameraStatus("GRANTED");
    setFaceConfidence(data.face_confidence ?? 1.0);
    setBrightness(data.brightness ?? 100.0);

    const activeStates = ["QUESTION", "LISTENING", "PROCESSING"];
    if (!activeStates.includes(interviewStateRef.current)) return;

    // Face missing verification with dampening (2 frames = ~1 second)
    const isFaceDetected = data.face_detected && (data.face_confidence >= 0.5);
    if (!isFaceDetected) {
      consecutiveMissingFaceRef.current += 1;
      if (consecutiveMissingFaceRef.current >= 2) {
        setFaceMissing(true);
      }
    } else {
      consecutiveMissingFaceRef.current = 0;
      setFaceMissing(false);
    }

    // Multiple faces verification with dampening (2 frames = ~1 second)
    if (data.face_count > 1 || data.multiple_faces) {
      consecutiveMultipleFacesRef.current += 1;
      if (consecutiveMultipleFacesRef.current >= 2) {
        setMultipleFaces(true);
      }
    } else {
      consecutiveMultipleFacesRef.current = 0;
      setMultipleFaces(false);
    }
  };

  // Fullscreen and Tab listeners
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFs = !!document.fullscreenElement;
      setIsFullscreenActive(isCurrentlyFs);
    };

    const handleVisibility = () => {
      if (document.hidden) {
        setTabStatus("Disconnected");
      } else {
        setTabStatus("Connected");
      }
    };

    const handleWindowBlur = () => {
      setTabStatus("Disconnected");
    };

    const handleWindowFocus = () => {
      setTabStatus("Connected");
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("blur", handleWindowBlur);
    window.addEventListener("focus", handleWindowFocus);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("blur", handleWindowBlur);
      window.removeEventListener("focus", handleWindowFocus);
    };
  }, []);

  // Unified Proctoring violation check loop
  useEffect(() => {
    const activeStates = ["QUESTION", "LISTENING", "PROCESSING"];
    if (!activeStates.includes(interviewState)) {
      if (isPaused) {
        setIsPaused(false);
        setActiveWarning("");
      }
      return;
    }

    let violationMessage = "";
    if (!isFullscreenActive) {
      violationMessage = "Fullscreen mode exited. Please enter fullscreen to resume.";
    } else if (tabStatus === "Disconnected") {
      violationMessage = "Please return to the interview window.";
    } else if (faceMissing) {
      violationMessage = "Face not detected. Please return to the camera.";
    } else if (multipleFaces) {
      violationMessage = "Multiple faces detected. Only the candidate should be visible.";
    }

    if (violationMessage) {
      if (!isPaused) {
        setIsPaused(true);
        setActiveWarning(violationMessage);
        setRecoveryCountdown(15);
        speechSynthesis.cancel();
        stopListening();
        setViolations((prev) => [...prev, violationMessage]);
        setWarningCount((prev) => {
          const count = prev + 1;
          if (count >= 5) {
            terminateInterview("Repeated integrity violations.");
          }
          return count;
        });
        SessionManager.updateBackendState("PAUSED", `Proctor violation: ${violationMessage}`, "AIInterviewLive.jsx");
      } else if (violationMessage !== activeWarning) {
        setActiveWarning(violationMessage);
      }
    } else {
      if (isPaused) {
        setIsPaused(false);
        setActiveWarning("");
        SessionManager.updateBackendState("ACTIVE", "Proctoring compliance restored", "AIInterviewLive.jsx");
        
        if (interviewState === "LISTENING") {
          startListening();
        } else if (interviewState === "QUESTION") {
          speakQuestion(currentQuestion, () => {
            setInterviewState("LISTENING");
          });
        }
      }
    }
  }, [isFullscreenActive, tabStatus, faceMissing, multipleFaces, interviewState]);

  // Recovery timer loop
  useEffect(() => {
    if (!isPaused) {
      if (recoveryTimerRef.current) clearInterval(recoveryTimerRef.current);
      return;
    }

    recoveryTimerRef.current = setInterval(() => {
      setRecoveryCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(recoveryTimerRef.current);
          terminateInterview("Integrity validation timeout exceeded.");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (recoveryTimerRef.current) clearInterval(recoveryTimerRef.current);
    };
  }, [isPaused]);

  // Terminate interview
  const terminateInterview = (reason) => {
    setInterviewState("COMPLETED");
    speechSynthesis.cancel();
    stopListening();
    if (timerRef.current) clearInterval(timerRef.current);
    if (recoveryTimerRef.current) clearInterval(recoveryTimerRef.current);
    document.exitFullscreen().catch(() => {});
    SessionManager.clearSession(`Terminated: ${reason}`, "AIInterviewLive.jsx");

    setStatus(`Interview Terminated: ${reason}`);
    setTimeout(() => {
      navigate("/dashboard");
    }, 4000);
  };

  // Report completion
  const handleInterviewCompletion = async (answerData) => {
    try {
      const activeSessionId = SessionManager.getSessionId();
      const reportRes = await interviewAPI.getReport(activeSessionId);
      const reportResult = reportRes.data;

      const normalised = {
        score: reportResult.overall_score ?? 0,
        confidence: reportResult.scores_breakdown?.confidence ?? 0,
        communication: reportResult.scores_breakdown?.communication ?? 0,
        weaknesses: reportResult.weaknesses ?? [],
        full_results: reportResult.scores_breakdown ?? {},
        session_id: activeSessionId,
      };

      setInterviewData(normalised);
      localStorage.setItem("interview_data", JSON.stringify(normalised));
      
      setTimeout(() => {
        document.exitFullscreen().catch(() => {});
        navigate("/interview-result", {
          state: { result: normalised, session_id: activeSessionId, violations },
        });
      }, 1500);
    } catch (err) {
      console.error("Failed compiling report:", err);
      navigate("/dashboard");
    }
  };

  // Helpers
  const handleToggleMute = () => {
    setIsIntroMuted((prev) => {
      const next = !prev;
      if (next) {
        speechSynthesis.cancel();
        setIsAISpeaking(false);
      }
      return next;
    });
  };

  const handleReplayIntro = () => {
    speechSynthesis.cancel();
    setIsAISpeaking(false);
    speakQuestion(currentQuestion, () => {
      if (interviewState === "QUESTION") {
        setInterviewState("LISTENING");
      }
    });
  };

  const handleManualEnterFullscreen = async () => {
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
        setIsFullscreenActive(true);
        setNeedsFullscreenActivation(false);
      }
    } catch (err) {
      alert("Failed entering fullscreen. Verify browser permissions.");
    }
  };

  const handleViolation = (reason) => {
    // Left empty since unified proctoring state hooks handle checks directly
  };

  // Rendering Helper
  const renderWorkflowContent = () => {
    switch (interviewState) {
      case "IDLE":
        return (
          <div className="guided-centered-card-wrapper">
            <GlassCard className="guided-card welcome-card" style={{ textAlign: "center" }}>
              <div className="welcome-header">
                <Sparkles size={44} className="welcome-sparkles pulsing" style={{ margin: "0 auto" }} />
                <h1 style={{ marginTop: "12px" }}>NeuroPath AI Stateful Interview</h1>
              </div>
              
              <div className="candidate-info-badge" style={{ display: "flex", flexDirection: "column", gap: "6px", alignItems: "center" }}>
                <p style={{ margin: 0 }}>Candidate: <strong>{candidateName}</strong></p>
                <p style={{ margin: 0 }}>Target Role: <strong>{role} ({level} Level)</strong></p>
              </div>

              <div className="guided-divider" />

              <p style={{ lineHeight: "1.6", color: "var(--text-secondary)" }}>
                You are about to start your mock evaluation session. Camera and microphone permissions will be verified, and secure fullscreen mode will be activated.
              </p>

              <div className="guided-divider" />

              <GlassButton primary onClick={startInterviewSequence} style={{ width: "100%", justifyContent: "center", padding: "14px 0", fontSize: "1.1rem" }}>
                Start Interview Session <ArrowRight size={18} style={{ marginLeft: "8px" }} />
              </GlassButton>
            </GlassCard>
          </div>
        );

      case "STARTING":
        return (
          <div className="guided-centered-card-wrapper">
            <GlassCard className="guided-card welcome-card" style={{ textAlign: "center", padding: "40px" }}>
              <div className="spinner-small" style={{ width: "40px", height: "40px", borderWidth: "4px", borderTopColor: "#3b82f6", margin: "0 auto 24px auto" }} />
              <h2>Initializing Systems...</h2>
              <p style={{ color: "var(--text-secondary)" }}>{status}</p>
            </GlassCard>
          </div>
        );

      case "ERROR":
        return (
          <div className="guided-centered-card-wrapper">
            <GlassCard className="guided-card error-card" style={{ border: "2px solid rgba(239, 68, 68, 0.4)", maxWidth: "560px", width: "100%", textAlign: "center" }}>
              <ShieldAlert size={64} style={{ color: "#ef4444", margin: "0 auto 20px auto" }} className="pulsing" />
              <h2>Unable to start the interview</h2>
              <p style={{ color: "var(--text-secondary)", margin: "12px 0 24px 0" }}>{errorDetails}</p>
              
              <div style={{ display: "flex", gap: "12px", width: "100%" }}>
                <GlassButton primary onClick={startInterviewSequence} style={{ flex: 1, justifyContent: "center" }}>
                  Try Again
                </GlassButton>
                <GlassButton onClick={() => navigate("/interview")} style={{ flex: 1, justifyContent: "center" }}>
                  Exit Interview
                </GlassButton>
              </div>
            </GlassCard>
          </div>
        );

      case "COMPLETED":
        return (
          <div className="guided-centered-card-wrapper">
            <GlassCard className="guided-card welcome-card" style={{ textAlign: "center", padding: "40px" }}>
              <div className="spinner-small" style={{ width: "40px", height: "40px", borderWidth: "4px", borderTopColor: "#10b981", margin: "0 auto 24px auto" }} />
              <h2>Compiling Interview Report...</h2>
              <p style={{ color: "var(--text-secondary)" }}>Analyzing performance metrics and constructing career roadmap.</p>
            </GlassCard>
          </div>
        );

      default:
        return null;
    }
  };

  const isLive = ["INTRODUCTION", "QUESTION", "LISTENING", "PROCESSING"].includes(interviewState);

  return (
    <div className="live-interview-container">
      {/* Secure Blocker Pause Overlay */}
      <AnimatePresence>
        {isPaused && (
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
                An integrity compliance issue has been detected. Please resolve the warning immediately:
              </p>
              
              <div style={{ background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.2)", borderRadius: "12px", padding: "16px", margin: "20px 0", textAlign: "center", color: "#f87171", fontWeight: "700" }}>
                {activeWarning}
              </div>

              {!isFullscreenActive && (
                <div style={{ marginBottom: "20px" }}>
                  <GlassButton primary onClick={handleManualEnterFullscreen} style={{ margin: "0 auto" }}>
                    Re-enter Fullscreen
                  </GlassButton>
                </div>
              )}

              <div style={{ margin: "16px 0" }}>
                <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px", fontWeight: "700" }}>
                  Time Remaining to Comply
                </p>
                <div style={{ fontSize: "3.5rem", fontWeight: "800", color: "#ef4444", fontFamily: "var(--font-display)" }}>
                  {recoveryCountdown}s
                </div>
              </div>

              <p className="text-small" style={{ color: "var(--text-muted)" }}>
                The interview will be automatically terminated and marked incomplete if compliance is not restored.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Manual Fullscreen prompt overlay (If auto-request fails) */}
      <AnimatePresence>
        {needsFullscreenActivation && isLive && !isPaused && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fullscreen-prompt-overlay"
            style={{ zIndex: 99990 }}
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

      {/* Flow views */}
      {!isLive ? (
        <div className="guided-workflow-container">
          {renderWorkflowContent()}
        </div>
      ) : (
        /* Workspace body when interview is active */
        <motion.div
          key="live_interview"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="live-interview-workspace"
          style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column" }}
        >
          {/* HEADER */}
          <header className="workspace-header">
            <div className="header-left">
              <span className="workspace-badge round-badge">Round {roundNumber}: {roundName}</span>
              <span className="workspace-badge role-badge">{role} ({level})</span>
              <span className="workspace-badge difficulty-badge">{currentDifficulty}</span>
            </div>
            <div className="header-center">
              <div className="header-progress-container">
                <span className="header-progress-label">Progress: Question {roundNumber} of {blueprint.length || 5}</span>
                <div className="header-progress-bar">
                  <div className="header-progress-fill" style={{ width: `${(roundNumber / (blueprint.length || 5)) * 100}%` }} />
                </div>
              </div>
            </div>
            <div className="header-right">
              <div className={`workspace-timer ${timeLeft <= 10 ? "warning" : ""}`}>
                <Clock size={16} />
                <span>{timeLeft}s remaining</span>
              </div>
            </div>
          </header>

          {/* WORKSPACE BODY */}
          <div className="workspace-body" style={{ flex: 1, display: "grid", gridTemplateColumns: "1.3fr 0.7fr", gap: "24px", padding: "24px", boxSizing: "border-box", overflow: "hidden" }}>
            
            {/* Left Panel */}
            <div className="workspace-left-panel" style={{ display: "flex", flexDirection: "column", gap: "16px", height: "100%", overflowY: "auto" }}>
              
              {/* Question Card */}
              <GlassCard className="workspace-card question-card">
                <div className="question-header">
                  <HelpCircle size={16} className="text-secondary" />
                  <span>Current Question</span>
                </div>
                <h1 className="question-text">{currentQuestion}</h1>
              </GlassCard>

              {/* AI Voice Assistant */}
              <GlassCard className="workspace-card ai-voice-card">
                <div className="ai-voice-row" style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                  <div className={`avatar-circle-small ${isAISpeaking ? "speaking" : "breathing"}`}>
                    <EIAvatar isSpeaking={isAISpeaking} />
                  </div>
                  
                  <div className="ai-voice-info" style={{ flex: 1 }}>
                    <span className="ai-voice-title" style={{ fontWeight: 600 }}>AI Interview Assistant</span>
                    {!isIntroMuted && isAISpeaking ? (
                      <div className="workspace-voice-wave speaking">
                        <div className="voice-bar" /><div className="voice-bar" /><div className="voice-bar" /><div className="voice-bar" /><div className="voice-bar" />
                      </div>
                    ) : (
                      <div className="workspace-voice-wave silent">
                        <div className="voice-bar" /><div className="voice-bar" /><div className="voice-bar" /><div className="voice-bar" /><div className="voice-bar" />
                      </div>
                    )}
                  </div>

                  <div className="voice-actions" style={{ display: "flex", gap: "8px" }}>
                    <GlassButton small onClick={handleToggleMute}>
                      {isIntroMuted ? "🔈 Unmute" : "🔇 Mute"}
                    </GlassButton>
                    <GlassButton small onClick={handleReplayIntro}>
                      🔄 Replay Question
                    </GlassButton>
                  </div>
                </div>
              </GlassCard>

              {/* Transcription Area */}
              <GlassCard className="workspace-card transcript-card" style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: "180px" }}>
                <div className="transcript-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <MessageSquareCode size={16} className="text-secondary" />
                    <span>Live Speech Transcription</span>
                  </div>
                  <GlassBadge status={isCandidateSpeaking ? "success" : "secondary"}>
                    {transcriptionStatus}
                  </GlassBadge>
                </div>

                <div className="workspace-transcript-scroll" style={{ flex: 1, overflowY: "auto", marginTop: "12px", background: "rgba(255, 255, 255, 0.25)", padding: "12px", borderRadius: "12px" }}>
                  <p className="transcript-content" style={{ margin: 0, fontSize: "0.95rem", lineHeight: "1.5" }}>
                    {currentAnswer ? (
                      <>
                        <span className="recording-dot-active" />
                        {currentAnswer}
                      </>
                    ) : (
                      <span className="transcript-placeholder" style={{ color: "var(--text-muted)", fontStyle: "italic" }}>
                        {isListening ? "Listening... Speak to answer." : "Microphone connecting..."}
                      </span>
                    )}
                  </p>
                </div>

                {hasSpoken && silenceTimeLeft < 10 && (
                  <div className="silence-warning-banner pulse" style={{ marginTop: "10px", background: "rgba(245, 158, 11, 0.15)", border: "1px solid rgba(245, 158, 11, 0.3)", padding: "8px", borderRadius: "8px", fontSize: "0.85rem", color: "#d97706", display: "flex", alignItems: "center", gap: "6px" }}>
                    <AlertTriangle size={14} /> Switched to silent. Submitting response in {silenceTimeLeft}s
                  </div>
                )}
              </GlassCard>

              {/* Action Buttons */}
              <div className="workspace-actions-row" style={{ display: "flex", gap: "12px" }}>
                <GlassButton primary disabled={isSubmitting} onClick={() => setInterviewState("PROCESSING")} style={{ flex: 1, justifyContent: "center" }}>
                  <CheckCircle size={18} style={{ marginRight: "8px" }} /> Submit Answer
                </GlassButton>
                <GlassButton disabled={isSubmitting} onClick={() => {
                  setCurrentAnswer("Question skipped by candidate.");
                  setInterviewState("PROCESSING");
                }} style={{ flex: 1, justifyContent: "center" }}>
                  <RotateCcw size={18} style={{ marginRight: "8px" }} /> Skip Question
                </GlassButton>
              </div>

            </div>

            {/* Right Panel */}
            <div className="workspace-right-panel" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              
              {/* Camera Preview */}
              <GlassCard className="workspace-card camera-card" style={{ padding: 0, overflow: "hidden" }}>
                <div className="workspace-camera-container" style={{ position: "relative", width: "100%", height: "240px", background: "#000" }}>
                  <div className="camera-overlay-vignette" />
                  <CameraMonitor 
                    sessionId={sessionId} 
                    enableProctoring={["QUESTION", "LISTENING", "PROCESSING"].includes(interviewState) && !isPaused} 
                    onViolation={handleViolation} 
                    onProctorUpdate={handleProctorUpdate} 
                  />
                  
                  <div className="camera-dynamic-guidance" style={{ position: "absolute", bottom: "10px", left: "10px", right: "10px", textAlign: "center", zIndex: 10 }}>
                    {cameraStatus === "ERROR" ? (
                      <span className="guidance-text error" style={{ background: "#ef4444", color: "#fff", padding: "4px 8px", borderRadius: "6px", fontSize: "0.75rem", fontWeight: "bold" }}>⚠️ CAMERA ACCESS LOST</span>
                    ) : faceMissing ? (
                      <span className="guidance-text error" style={{ background: "#ef4444", color: "#fff", padding: "4px 8px", borderRadius: "6px", fontSize: "0.75rem", fontWeight: "bold" }}>👤 NO FACE DETECTED</span>
                    ) : multipleFaces ? (
                      <span className="guidance-text error" style={{ background: "#ef4444", color: "#fff", padding: "4px 8px", borderRadius: "6px", fontSize: "0.75rem", fontWeight: "bold" }}>👥 MULTIPLE PEOPLE</span>
                    ) : (
                      <span className="guidance-text success" style={{ background: "#10b981", color: "#fff", padding: "4px 8px", borderRadius: "6px", fontSize: "0.75rem", fontWeight: "bold" }}>✓ CANDIDATE MONITOR ACTIVE</span>
                    )}
                  </div>
                </div>
              </GlassCard>

              {/* Integrity status list */}
              <GlassCard className="workspace-card integrity-card">
                <div className="integrity-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <Shield size={16} className="text-secondary" />
                    <span style={{ fontWeight: 600 }}>Proctoring Integrity Monitor</span>
                  </div>
                  {import.meta.env.DEV && (
                    <button className="details-toggle-btn" onClick={() => setShowDevMode(!showDevMode)} style={{ background: "transparent", border: "none", color: "#3b82f6", cursor: "pointer", textDecoration: "underline", fontSize: "0.85rem" }}>
                      {showDevMode ? "Hide Details" : "Show Details"}
                    </button>
                  )}
                </div>

                <ul className="integrity-status-list" style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "8px" }}>
                  <li style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.9rem" }}>
                    <span className={`status-dot ${!faceMissing ? "green" : "red"}`} style={{ width: "8px", height: "8px", borderRadius: "50%", background: !faceMissing ? "#10b981" : "#ef4444" }} />
                    <span>Candidate Visible</span>
                  </li>
                  <li style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.9rem" }}>
                    <span className={`status-dot ${!multipleFaces ? "green" : "red"}`} style={{ width: "8px", height: "8px", borderRadius: "50%", background: !multipleFaces ? "#10b981" : "#ef4444" }} />
                    <span>Single Face Frame</span>
                  </li>
                  <li style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.9rem" }}>
                    <span className={`status-dot ${isFullscreenActive ? "green" : "red"}`} style={{ width: "8px", height: "8px", borderRadius: "50%", background: isFullscreenActive ? "#10b981" : "#ef4444" }} />
                    <span>Secure Fullscreen</span>
                  </li>
                  <li style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.9rem" }}>
                    <span className={`status-dot ${tabStatus === "Connected" ? "green" : "red"}`} style={{ width: "8px", height: "8px", borderRadius: "50%", background: tabStatus === "Connected" ? "#10b981" : "#ef4444" }} />
                    <span>Window Focused</span>
                  </li>
                </ul>
              </GlassCard>

              {/* Dev Diagnostics Draw */}
              <AnimatePresence>
                {showDevMode && import.meta.env.DEV && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    style={{ overflow: "hidden" }}
                  >
                    <GlassCard className="dev-diagnostics-card" style={{ fontSize: "0.8rem", display: "flex", flexDirection: "column", gap: "6px" }}>
                      <h3>🛠 Dev Telemetry Panel</h3>
                      <div>Session ID: <strong>{sessionId}</strong></div>
                      <div>Interview State: <strong>{interviewState}</strong></div>
                      <div>Camera: <strong>{cameraStatus}</strong></div>
                      <div>Mic: <strong>{micStatus}</strong></div>
                      <div>Warning count: <strong>{warningCount}/5</strong></div>
                    </GlassCard>
                  </motion.div>
                )}
              </AnimatePresence>

            </div>

          </div>

          {/* FOOTER */}
          <footer className="workspace-footer" style={{ background: "rgba(255,255,255,0.4)", borderTop: "1px solid var(--glass-border)", padding: "10px 24px", display: "flex", justifyContent: "space-between", fontSize: "0.8rem", color: "var(--text-secondary)" }}>
            <div className="footer-left" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span className="recording-dot-active pulse" style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#ef4444", display: "inline-block" }} />
              <span>SECURE ASSESSMENT MODE ON</span>
            </div>
            <div className="footer-center">
              <span>Do not switch tabs, exit fullscreen, or leave the camera view.</span>
            </div>
            <div className="footer-right">
              <span>Connection: {isOnline ? "Online" : "Offline"}</span>
            </div>
          </footer>

        </motion.div>
      )}
    </div>
  );
}

export default AIInterviewLive;
