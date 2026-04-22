import { useEffect, useMemo, useRef, useState, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import CameraMonitor from "../components/CameraMonitor";
import { AppContext } from "../context/AppContext";
import { interviewAPI } from "../api/endpoints";
import "./AIInterview.css";

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

const QUESTION_TIME = 60; // 1 minute per question

function AIInterviewLive() {
  const navigate = useNavigate();
  const location = useLocation();

  const questions = useMemo(() => location.state?.questions || [], [location.state]);
  const skills = useMemo(() => location.state?.skills || [], [location.state]);
  const resumeName = location.state?.resumeName || "Resume";

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState("Preparing interview...");
  const [violations, setViolations] = useState([]);
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME);

  const recognitionRef = useRef(null);
  const timerRef = useRef(null);

  // =========================
  // Redirect if no questions
  // =========================
  useEffect(() => {
    if (!questions.length) {
      alert("No interview session found. Please start again.");
      navigate("/interview");
    }
  }, [questions, navigate]);

  // =========================
  // Strict Interview Mode
  // =========================
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

    const handleVisibility = () => {
      if (document.hidden) {
        terminateInterview("Tab switching detected");
      }
    };

    const handleFullscreen = () => {
      if (!document.fullscreenElement) {
        terminateInterview("Fullscreen exited");
      }
    };

    enterFullscreen();

    document.addEventListener("visibilitychange", handleVisibility);
    document.addEventListener("fullscreenchange", handleFullscreen);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      document.removeEventListener("fullscreenchange", handleFullscreen);
      speechSynthesis.cancel();
      stopListening();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // =========================
  // Start each question
  // =========================
  useEffect(() => {
    if (!questions.length) return;

    setCurrentAnswer("");
    setTimeLeft(QUESTION_TIME);
    setStatus(`Question ${currentIndex + 1} of ${questions.length}`);

    // Speak the current question
    speakQuestion(questions[currentIndex]);

    // Start 1-minute timer
    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          autoNext(); // ✅ Auto move
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentIndex, questions]);

  // =========================
  // AI Voice Question
  // =========================
  const speakQuestion = (text) => {
    speechSynthesis.cancel();

    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "en-US";
    utter.rate = 1;
    utter.pitch = 1;

    utter.onstart = () => {
      setStatus("AI is asking the question...");
    };

    utter.onend = () => {
      startListening(); // start mic after AI finishes speaking
    };

    speechSynthesis.speak(utter);
  };

  // =========================
  // Start Speech Recognition
  // =========================
  const startListening = () => {
    if (!SpeechRecognition) {
      alert("Speech Recognition not supported. Please use Google Chrome.");
      return;
    }

    stopListening();

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = true;
    recognition.continuous = true;

    recognition.onstart = () => {
      setIsListening(true);
      setStatus("Listening to your answer...");
    };

    recognition.onresult = (event) => {
      let transcript = "";
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript + " ";
      }
      setCurrentAnswer(transcript.trim());
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setStatus("Mic issue. Please allow microphone.");
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  // =========================
  // Stop Speech Recognition
  // =========================
  const stopListening = () => {
    try {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    } catch (err) {
      console.warn("Stop listening issue:", err);
    }
    setIsListening(false);
  };

  // =========================
  // Auto Next Question
  // =========================
  const autoNext = () => {
    stopListening();

    const updatedAnswers = [
      ...answers,
      {
        question: questions[currentIndex],
        answer: currentAnswer || "No answer provided",
      },
    ];

    setAnswers(updatedAnswers);

    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      submitInterview(updatedAnswers);
    }
  };

  const { setInterviewData } = useContext(AppContext);

  // =========================
  // Submit Interview
  // =========================
  const submitInterview = async (finalAnswers) => {
    try {
      setIsSubmitting(true);
      setStatus("Submitting interview...");

      const payload = {
        resume_name: resumeName,
        skills,
        answers: finalAnswers,
        violations,
      };

      const response = await interviewAPI.submit(payload);
      
      // Save to global state so other pages can use it
      setInterviewData(response.data);

      navigate("/interview-result", {
        state: {
          result: response.data,
          answers: finalAnswers,
          skills,
          violations,
        },
      });
    } catch (err) {
      console.error("Interview submission error:", err);
      alert("Failed to submit interview. Check backend /submit-interview.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // =========================
  // Terminate Interview
  // =========================
  const terminateInterview = (reason) => {
    speechSynthesis.cancel();
    stopListening();
    if (timerRef.current) clearInterval(timerRef.current);

    const updatedViolations = [...violations, reason];
    setViolations(updatedViolations);

    alert(`Interview terminated: ${reason}`);
    navigate("/dashboard");
  };

  // =========================
  // Camera Violation Handler
  // =========================
  const [warningCount, setWarningCount] = useState(0);
  const [activeWarning, setActiveWarning] = useState("");

  const handleViolation = (reason) => {
    // Prevent immediate multiple triggers
    setActiveWarning(reason);
    
    setWarningCount((prev) => {
      const newCount = prev + 1;
      if (newCount >= 3) {
        terminateInterview(`Repeated violations: ${reason}`);
      }
      return newCount;
    });

    // Clear active warning from screen after 5 seconds
    setTimeout(() => {
      setActiveWarning("");
    }, 5000);
  };

  return (
    <div className="live-interview-page">
      {/* LEFT SIDE */}
      <div className="live-left">
        <h1>Live AI Interview</h1>
        <p className="subtitle">{status}</p>

        {activeWarning && (
          <div style={{ backgroundColor: '#ef4444', color: 'white', padding: '10px 15px', borderRadius: '8px', marginBottom: '20px', fontWeight: 'bold', animation: 'pulse 2s infinite' }}>
            ⚠️ WARNING ({warningCount}/3): {activeWarning}
          </div>
        )}

        <div className="question-box">
          <h3>Current Question</h3>
          <p>{questions[currentIndex]}</p>
        </div>

        <div className="result-box" style={{ marginBottom: "20px" }}>
          <h3>⏱ Time Left</h3>
          <p style={{ fontSize: "28px", fontWeight: "700" }}>{timeLeft}s</p>
        </div>

        <div className="feature-box">
          <h3>🎙 Your Spoken Answer</h3>
          <p style={{ whiteSpace: "pre-wrap", minHeight: "100px" }}>
            {currentAnswer || "Your answer will appear here while you speak..."}
          </p>
        </div>

        <div className="interview-actions">
          <button onClick={startListening} disabled={isListening || isSubmitting}>
            {isListening ? "Listening..." : "🎤 Speak Again"}
          </button>

          <button onClick={stopListening} disabled={!isListening || isSubmitting}>
            ⏹ Stop
          </button>

          <button onClick={autoNext} disabled={isSubmitting}>
            {currentIndex === questions.length - 1 ? "Submit Now" : "Next Now"}
          </button>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="live-right">
        <h3>📷 Live Proctoring</h3>
        <p className="subtitle">
          Stay visible and focused. 3 warnings will end the interview.
        </p>

        <div className="camera-box">
          <CameraMonitor onViolation={handleViolation} />
        </div>

        <div className="result-box" style={{ marginTop: "20px" }}>
          <h3>Interview Rules</h3>
          <ul style={{ lineHeight: "1.8", paddingLeft: "18px", color: "#cbd5e1" }}>
            <li>No tab switching</li>
            <li>No leaving fullscreen</li>
            <li>No multiple persons in frame</li>
            <li>No excessive movement</li>
            <li>Answer only by voice</li>
            <li>1 minute per question</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default AIInterviewLive;