import { useState, useEffect, useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { dailyAPI } from "../api/endpoints";
import "./DailyCoding.css";

function DailyCoding() {
  const navigate = useNavigate();
  const { codingProgress, setCodingProgress, analysisData } = useContext(AppContext);
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState("// Write your solution here...\n");
  const [activeChallenge, setActiveChallenge] = useState(null);
  const warningRef = useRef(0);

  useEffect(() => {
    const fetchChallenges = async () => {
      try {
        const response = await dailyAPI.getChallenges();
        setChallenges(response.data.challenges);
        if (response.data.challenges.length > 0) {
          setActiveChallenge(response.data.challenges[0]);
        }
      } catch (err) {
        console.error("Failed to fetch daily challenges", err);
      } finally {
        setLoading(false);
      }
    };

    fetchChallenges();

    // Strict Mode
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
      if (document.hidden) {
        if (warningRef.current === 0) {
          alert("WARNING: Tab switching is strictly prohibited during coding challenges. Next violation will terminate the session.");
          warningRef.current += 1;
        } else {
          alert("Tab switching detected again! Session terminated.");
          handleExit();
        }
      }
    };

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
         alert("Exited fullscreen! Session terminated.");
         handleExit();
      }
    }

    enterFullscreen();
    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(err => console.warn(err));
      }
    };
  }, []);

  const handleExit = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(err => console.warn(err));
    }
    navigate("/dashboard");
  };

  const handleRunCode = () => {
    alert("Code submitted successfully! (Mock execution)");
    
    // Update daily progress streak and solved count
    const today = new Date().toISOString().split('T')[0];
    
    setCodingProgress(prev => {
      const isNewDay = prev.lastActive !== today;
      return {
        ...prev,
        streak: isNewDay ? (prev.streak || 0) + 1 : prev.streak,
        completedToday: true,
        lastActive: today,
        solvedCount: (prev.solvedCount || 0) + 1
      };
    });
  };

  if (analysisData?.best_domain !== "Technology") {
    return (
      <div className="daily-coding-page" style={{display:'flex',justifyContent:'center',alignItems:'center',flexDirection:'column'}}>
        <h2>Access Restricted</h2>
        <p>Coding challenges are available only for technical users.</p>
        <button className="exit-btn" onClick={() => navigate('/dashboard')} style={{marginTop:'20px',padding:'10px 20px'}}>Return to Dashboard</button>
      </div>
    );
  }

  if (loading) {
    return <div className="daily-coding-page"><h2>Loading Daily Challenges...</h2></div>;
  }

  return (
    <div className="daily-coding-page">
      <div className="daily-header">
        <h1>Daily Coding Challenge</h1>
        <button className="exit-btn" onClick={handleExit}>Exit Session</button>
      </div>

      <div className="challenges-container">
        <div className="challenge-list">
          <h2>Today's Problems</h2>
          {challenges.map((challenge, idx) => (
            <div 
              key={idx} 
              className="challenge-card"
              style={{ borderLeftColor: activeChallenge === challenge ? '#3b82f6' : 'transparent', backgroundColor: activeChallenge === challenge ? '#1e293b' : '#334155' }}
              onClick={() => setActiveChallenge(challenge)}
            >
              <h3>{challenge.title}</h3>
              <div className="challenge-meta">
                <span className={`difficulty-badge difficulty-${challenge.difficulty}`}>{challenge.difficulty}</span>
                <span className="topic-badge">{challenge.topic}</span>
              </div>
              <p style={{fontSize: '14px', color: '#cbd5e1'}}>{challenge.description}</p>
            </div>
          ))}
        </div>

        <div className="coding-area">
          <div className="editor-header">
            <span>IDE - {activeChallenge?.title}</span>
            <span>Python 3</span>
          </div>
          <textarea 
            className="mock-editor"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            spellCheck="false"
          />
          <div className="editor-footer">
            <button className="run-btn" onClick={handleRunCode}>Run & Submit</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DailyCoding;
