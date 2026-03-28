import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import CameraMonitor from "../components/CameraMonitor";
import { interviewAPI } from "../api/endpoints";
import "./AIInterview.css";

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

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
  const [status, setStatus] = useState("Initializing interview...");
  const [violations, setViolations] = useState([]);

  const recognitionRef = useRef(null);
  const hasStartedQuestionRef = useRef(false);

  // 🚫 If opened directly without state
  useEffect(() => {
    if (!questions.length) {
      alert("No interview session found. Please start again.");
      navigate("/interview");
    }
  }, [questions, navigate]);

  // 🔒 Strict mode: fullscreen + tab switch block
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
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // 🎤 Speak current question automatically
  useEffect(() => {
    if (!questions.length) return;
    if (hasStartedQuestionRef.current && currentAnswer) return;

    speakQuestion(questions[currentIndex]);
    setStatus(`Question ${currentIndex + 1} of ${questions.length}`);
    setCurrentAnswer("");
    hasStartedQuestionRef.current = true;
  }, [currentIndex, questions]);

  const speakQuestion = (text) => {
    speechSynthesis.cancel();

    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "en-US";
    utter.rate = 1;
    utter.pitch = 1;

    utter.onend = () => {
      startListening();
    };

    speechSynthesis.speak(utter);
  };

  const startListening = () => {
    if (!SpeechRecognition) {
      alert("Your browser does not support voice recognition. Use Google Chrome.");
      return;
    }

    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

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

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  const saveAndNext = () => {
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
      hasStartedQuestionRef.current = false;
    } else {
      submitInterview(updatedAnswers);
    }
  };

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

      navigate("/interview-result", {
        state: {
          result: response.data,
          answers: finalAnswers,
          skills,
          violations,
        },
      });
    } catch (err) {
      console.error(err);
      alert("Failed to submit interview.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const terminateInterview = (reason) => {
    speechSynthesis.cancel();
    stopListening();

    const updatedViolations = [...violations, reason];
    setViolations(updatedViolations);

    alert(`Interview terminated: ${reason}`);
    navigate("/dashboard");
  };

  const handleViolation = (reason) => {
    terminateInterview(reason);
  };

  return (
    <div className="live-interview-page">
      <div className="live-left">
        <h1>Live AI Interview</h1>
        <p className="subtitle">{status}</p>

        <div className="question-box">
          <h3>Current Question</h3>
          <p>{questions[currentIndex]}</p>
        </div>

        <div className="feature-box">
          <h3>🎙️ Your Spoken Answer</h3>
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

          <button onClick={saveAndNext} disabled={isSubmitting}>
            {currentIndex === questions.length - 1 ? "Submit Interview" : "Next Question"}
          </button>
        </div>
      </div>

      <div className="live-right">
        <h3>📷 Live Proctoring</h3>
        <p className="subtitle">Stay visible and focused. Suspicious activity ends the interview.</p>

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
          </ul>
        </div>
      </div>
    </div>
  );
}

export default AIInterviewLive;