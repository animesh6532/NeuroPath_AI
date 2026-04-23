import { useState, useEffect, useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { aptitudeAPI } from "../api/endpoints";
import "./AptitudeTest.css";

function AptitudeTest() {
  const { setAptitudeResult } = useContext(AppContext);
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 minutes
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);

  const warningRef = useRef(0);

  // Enter fullscreen on mount and enforce strict mode
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
          alert("WARNING: Tab switching is strictly prohibited. Your next violation will terminate the test.");
          warningRef.current += 1;
        } else {
          alert("Tab switching detected again! Test terminated.");
          handleSubmit();
        }
      }
    };

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && !submitted) {
         alert("Exited fullscreen! Test terminated.");
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

  // Timer
  useEffect(() => {
    if (timeLeft <= 0 && !submitted) {
      handleSubmit();
      return;
    }
    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, submitted]);

  // Fetch Questions
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await aptitudeAPI.getTest();
        setQuestions(res.data.questions);
      } catch (err) {
        console.error("Failed to load questions", err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, []);

  const handleSelect = (option) => {
    setAnswers({ ...answers, [currentIdx]: option });
  };

  const handleSubmit = async () => {
    if (submitted) return;
    setSubmitted(true);
    
    // Format answers for API
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
      console.error("Failed to submit", err);
      alert("Error submitting test.");
      navigate("/dashboard");
    }
  };

  if (loading) return <div className="aptitude-page"><div className="loading">Loading Test...</div></div>;
  if (!questions.length) return <div className="aptitude-page"><div className="loading">Failed to load test.</div></div>;

  const currentQ = questions[currentIdx];

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div className="aptitude-page">
      <div className="aptitude-header">
        <h2>Aptitude Assessment</h2>
        <div className={`timer ${timeLeft < 300 ? "danger" : ""}`}>
          Time Left: {formatTime(timeLeft)}
        </div>
      </div>

      <div className="aptitude-content">
        <div className="question-header">
          <span>Question {currentIdx + 1} of {questions.length}</span>
        </div>
        
        <div className="question-body">
          <h3>{currentQ.question}</h3>
          
          <div className="options-list">
            {currentQ.options.map((opt, i) => (
              <button 
                key={i} 
                className={`option-btn ${answers[currentIdx] === opt ? "selected" : ""}`}
                onClick={() => handleSelect(opt)}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        <div className="aptitude-footer">
          <button 
            className="nav-btn" 
            disabled={currentIdx === 0} 
            onClick={() => setCurrentIdx(prev => prev - 1)}
          >
            Previous
          </button>
          
          {currentIdx === questions.length - 1 ? (
            <button className="submit-btn" onClick={handleSubmit}>Submit Test</button>
          ) : (
            <button 
              className="nav-btn" 
              onClick={() => setCurrentIdx(prev => prev + 1)}
            >
              Next
            </button>
          )}
        </div>
      </div>
      <button className="exit-btn" onClick={handleSubmit}>Exit & Submit</button>
    </div>
  );
}

export default AptitudeTest;
