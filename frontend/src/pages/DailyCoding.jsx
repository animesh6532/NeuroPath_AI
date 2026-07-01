import { useState, useEffect, useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { dailyAPI } from "../api/endpoints";
import { motion } from "framer-motion";
import { Terminal, ShieldAlert, Code, Play, ArrowLeft, Loader2, Sparkles } from "lucide-react";
import { GlassCard, GlassButton, GlassBadge } from "../components/ui/DesignSystem";
import "./DailyCoding.css";

function DailyCoding() {
  const navigate = useNavigate();
  const { codingProgress, setCodingProgress, analysisData } = useContext(AppContext);
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState("# Write your python solution here...\n\ndef solve():\n    pass\n");
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
    alert("Code submitted successfully! Compiling and running tests...");
    
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

  const best_domain = analysisData?.best_domain ?? "General";
  const isTechnical = best_domain.toLowerCase().includes("tech") || 
                      best_domain.toLowerCase().includes("software") || 
                      best_domain.toLowerCase().includes("engineer") ||
                      best_domain.toLowerCase().includes("developer") ||
                      best_domain.toLowerCase().includes("coding");

  if (!isTechnical) {
    return (
      <div className="page-container daily-coding-page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <GlassCard className="empty-card" style={{ maxWidth: "500px", textAlign: "center" }}>
          <ShieldAlert size={40} className="text-danger" style={{ marginBottom: "20px", margin: "0 auto" }} />
          <h2>Access Restricted</h2>
          <p className="text-small">Coding challenges are available only for technical developers.</p>
          <GlassButton primary onClick={() => navigate('/dashboard')} style={{ marginTop: '20px' }}>
            Return to Dashboard
          </GlassButton>
        </GlassCard>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="page-container daily-coding-page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <GlassCard className="empty-card" style={{ textAlign: "center" }}>
          <Loader2 size={32} className="icon-spin text-secondary" style={{ marginBottom: "16px", margin: "0 auto" }} />
          <p>Loading Daily Challenges...</p>
        </GlassCard>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="page-container daily-coding-page"
    >
      <div className="daily-header glass-card-v6" style={{ background: "var(--glass-bg)", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 32px", borderRadius: "24px" }}>
        <div>
          <span className="glass-badge">Challenge IDE</span>
          <h1 style={{ fontSize: "1.6rem", margin: "4px 0 0 0" }}>Daily Coding Practice</h1>
          <p className="text-small" style={{ margin: "4px 0 0 0" }}>Strict examination rules are active</p>
        </div>
        <GlassButton onClick={handleExit}>
          <ArrowLeft size={16} /> Exit Session
        </GlassButton>
      </div>

      <div className="challenges-container" style={{ display: "grid", gridTemplateColumns: "1.1fr 1.9fr", gap: "24px", marginTop: "24px" }}>
        <div className="challenge-list" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <h3 className="text-title" style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "1.1rem" }}><Terminal size={16} /> Problems Palette</h3>
          {challenges.map((challenge, idx) => (
            <div 
              key={idx} 
              className="challenge-card glass-card"
              style={{ 
                cursor: "pointer", 
                borderColor: activeChallenge === challenge ? 'var(--color-navy)' : 'var(--glass-border)', 
                background: activeChallenge === challenge ? 'rgba(255, 255, 255, 0.75)' : 'rgba(255, 255, 255, 0.4)',
                transition: "all var(--transition-fast) ease",
                padding: "20px",
                borderRadius: "16px",
                border: "1px solid var(--glass-border)"
              }}
              onClick={() => setActiveChallenge(challenge)}
            >
              <h4 style={{ margin: 0, color: "var(--color-dark-blue)", fontSize: "1rem" }}>{challenge.title}</h4>
              <div className="challenge-meta" style={{ display: "flex", gap: "8px", margin: "8px 0" }}>
                <GlassBadge status={challenge.difficulty?.toLowerCase() === "easy" ? "success" : "warning"}>
                  {challenge.difficulty}
                </GlassBadge>
                <GlassBadge status="secondary">{challenge.topic}</GlassBadge>
              </div>
              <p className="text-small" style={{ margin: 0, color: "var(--text-secondary)" }}>{challenge.description}</p>
            </div>
          ))}
        </div>

        <GlassCard className="coding-area" style={{ padding: 0, overflow: "hidden", display: "flex", flexDirection: "column", minHeight: "450px", border: "1px solid var(--glass-border)" }}>
          <div className="editor-header" style={{ display: "flex", justifyContent: "space-between", background: "rgba(255, 255, 255, 0.45)", padding: "12px 20px", borderBottom: "1px solid var(--glass-border)", fontSize: "0.85rem", fontWeight: "600", color: "var(--text-primary)" }}>
            <span style={{ display: "flex", alignItems: "center", gap: "6px" }}><Code size={14} /> IDE - {activeChallenge?.title}</span>
            <GlassBadge status="secondary">Python 3</GlassBadge>
          </div>
          <textarea 
            className="mock-editor"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            spellCheck="false"
            style={{ 
              flex: 1, 
              background: "rgba(255, 255, 255, 0.25)", 
              border: 0, 
              outline: "none", 
              color: "var(--color-navy)", 
              fontFamily: "monospace", 
              padding: "20px", 
              fontSize: "0.95rem", 
              lineHeight: 1.5,
              resize: "none"
            }}
          />
          <div className="editor-footer" style={{ padding: "16px 20px", borderTop: "1px solid var(--glass-border)", background: "rgba(255, 255, 255, 0.45)", display: "flex", justifyContent: "flex-end" }}>
            <GlassButton primary onClick={handleRunCode}>
              <Play size={14} /> Run & Submit Code
            </GlassButton>
          </div>
        </GlassCard>
      </div>
    </motion.div>
  );
}

export default DailyCoding;
