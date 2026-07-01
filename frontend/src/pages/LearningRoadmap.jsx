import { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext";
import { interviewAPI } from "../api/endpoints";
import { motion } from "framer-motion";
import { GlassCard, GlassButton, GlassBadge } from "../components/ui/DesignSystem";
import { 
  ShieldAlert, Activity, RotateCcw, Link2, Compass, 
  Award, Clock, Code, BookOpen, Layers, CheckCircle2, ChevronRight, Briefcase, TrendingUp, Sparkles, Terminal
} from "lucide-react";
import "./LearningRoadmap.css";

function LearningRoadmap() {
  const { 
    analysisData, 
    interviewData, 
    roadmapData, 
    setRoadmapData, 
    codingProgress, 
    aptitudeResult,
    userProfile,
    roadmapProgress,
    setRoadmapProgress
  } = useContext(AppContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const getProfileCompleteness = () => {
    if (!userProfile) return 10;
    let filled = 0;
    const fields = ["name", "bio", "profile_image", "cover_image", "email"];
    fields.forEach(field => {
      if (userProfile[field] && String(userProfile[field]).trim() !== "") {
        filled++;
      }
    });
    if (Array.isArray(userProfile.custom_skills) && userProfile.custom_skills.length > 0) {
      filled++;
    }
    return Math.round((filled / 6) * 100);
  };

  useEffect(() => {
    const fetchRoadmap = async () => {
      if (!analysisData) return;
      // Do not refetch if already loaded
      if (roadmapData && !Array.isArray(roadmapData) && roadmapData.milestones) return;
      if (Array.isArray(roadmapData) && roadmapData.length > 0) return;

      const weaknesses = Array.isArray(interviewData?.weaknesses) ? interviewData.weaknesses : [];
      const missingSkills = Array.isArray(analysisData?.missing_skills) ? analysisData.missing_skills : [];

      try {
        setLoading(true);
        setError("");

        const payload = {
          weaknesses,
          missing_skills: missingSkills,
          domain: analysisData?.best_domain || "General",
          coding_score: codingProgress?.solvedCount > 0 ? 100 : 0,
          aptitude_score: aptitudeResult?.accuracy || 0,
          resume_score: analysisData?.resume_score || 0,
          interview_score: interviewData?.score || 0,
          profile_completeness: getProfileCompleteness()
        };

        const response = await interviewAPI.roadmap(payload);
        const rawData = response?.data;
        if (rawData) {
          setRoadmapData(rawData);
        } else {
          setError("Roadmap response was empty.");
        }
      } catch (err) {
        console.error("Failed to fetch roadmap:", err);
        setError("Could not generate roadmap. Make sure the backend is active.");
      } finally {
        setLoading(false);
      }
    };

    fetchRoadmap();
  }, [interviewData, analysisData, codingProgress, aptitudeResult, userProfile]);

  if (!analysisData) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="page-container roadmap-page"
        style={{ display: "flex", justifyContent: "center", paddingTop: "140px" }}
      >
        <GlassCard className="empty-card" style={{ maxWidth: "500px", textAlign: "center", padding: "40px" }}>
          <ShieldAlert size={40} className="text-danger" style={{ marginBottom: "20px", margin: "0 auto" }} />
          <h2>Access Restricted</h2>
          <p className="text-small">Please upload and analyze your resume first to generate your personalized learning roadmap path.</p>
        </GlassCard>
      </motion.div>
    );
  }

  const progress = roadmapProgress || {};

  const handleToggleStep = (skillIndex, stepIndex) => {
    const key = `${skillIndex}-${stepIndex}`;
    const newProgress = { ...progress, [key]: !progress[key] };
    setRoadmapProgress(newProgress);
  };

  // Safe checks for roadmap structure (either legacy flat array or detailed dict)
  const isDetailed = roadmapData && !Array.isArray(roadmapData) && roadmapData.milestones;
  const safeRoadmap = isDetailed ? roadmapData.milestones : (Array.isArray(roadmapData) ? roadmapData : []);
  
  const careerGoal = isDetailed ? roadmapData.career_goal : (analysisData?.best_domain || "General");
  const readiness = isDetailed ? roadmapData.current_readiness : 70;
  const completion = isDetailed ? roadmapData.estimated_completion : "8 Weeks";
  const roadmapDifficulty = isDetailed ? roadmapData.difficulty : "Medium";
  const strengths = isDetailed ? roadmapData.strengths : [];
  const weakSkills = isDetailed ? roadmapData.weak_skills : [];
  const prioritySkills = isDetailed ? roadmapData.priority_skills : [];
  const weeklyPlan = isDetailed ? roadmapData.weekly_plan : [];
  const projects = isDetailed ? roadmapData.projects : [];
  const codingChallenges = isDetailed ? roadmapData.coding_challenges : [];
  const practiceInterviews = isDetailed ? roadmapData.practice_interviews : [];
  const mockTests = isDetailed ? roadmapData.mock_tests : [];

  const totalSteps = safeRoadmap.reduce(
    (acc, m) => acc + (Array.isArray(m.steps) ? m.steps.length : 0),
    0
  );
  const completedSteps = Object.values(progress).filter(Boolean).length;
  const progressPct = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="page-container roadmap-page"
      style={{ paddingTop: "140px", paddingBottom: "60px" }}
    >
      <div className="roadmap-main-layout" style={{ maxWidth: "1000px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "24px" }}>
        
        {/* Header Summary Card */}
        <div className="roadmap-header glass-card-v6" style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)", padding: "28px 32px", borderRadius: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
            <div>
              <span className="glass-badge">Milestone Engine</span>
              <h1 style={{ fontSize: "2rem", marginTop: "6px", color: "var(--color-dark-blue)" }}>Learning Roadmap</h1>
              <p className="text-subtitle" style={{ color: "var(--text-secondary)", margin: "4px 0 0 0" }}>
                Targeting: <strong>{careerGoal}</strong>
              </p>
            </div>
            {isDetailed && (
              <div style={{ background: "rgba(255,255,255,0.4)", border: "1px solid var(--glass-border)", padding: "12px 20px", borderRadius: "16px", textAlign: "right" }}>
                <span className="text-caption" style={{ color: "var(--text-secondary)" }}>Placement Readiness Index</span>
                <div style={{ fontSize: "1.8rem", fontWeight: "800", color: "var(--color-navy)", display: "flex", alignItems: "center", gap: "8px", justifyContent: "flex-end" }}>
                  <TrendingUp size={20} className="text-secondary" /> {readiness}%
                </div>
              </div>
            )}
          </div>

          {/* Quick Stats Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", background: "rgba(255, 255, 255, 0.35)", padding: "12px 16px", borderRadius: "12px", border: "1px solid var(--glass-border)" }}>
              <Clock size={18} className="text-secondary" style={{ color: "var(--color-medium-blue)" }} />
              <div>
                <div className="text-caption" style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Prep Timeline</div>
                <strong style={{ fontSize: "0.9rem", color: "var(--color-dark-blue)" }}>{completion}</strong>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", background: "rgba(255, 255, 255, 0.35)", padding: "12px 16px", borderRadius: "12px", border: "1px solid var(--glass-border)" }}>
              <Layers size={18} className="text-secondary" style={{ color: "var(--color-medium-blue)" }} />
              <div>
                <div className="text-caption" style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Difficulty Level</div>
                <strong style={{ fontSize: "0.9rem", color: "var(--color-dark-blue)" }}>{roadmapDifficulty}</strong>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", background: "rgba(255, 255, 255, 0.35)", padding: "12px 16px", borderRadius: "12px", border: "1px solid var(--glass-border)" }}>
              <BookOpen size={18} className="text-secondary" style={{ color: "var(--color-medium-blue)" }} />
              <div>
                <div className="text-caption" style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Plan Milestones</div>
                <strong style={{ fontSize: "0.9rem", color: "var(--color-dark-blue)" }}>{safeRoadmap.length} Modules</strong>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "80px 0" }}>
            <Activity size={32} className="icon-spin text-secondary" style={{ marginBottom: "16px" }} />
            <p className="text-small" style={{ margin: 0 }}>Compiling dynamic learning path milestones & parsing credentials...</p>
          </div>
        ) : error ? (
          <div style={{ textAlign: "center", padding: "40px" }}>
            <p className="text-danger">{error}</p>
            <GlassButton
              onClick={() => {
                setError("");
                setRoadmapData([]);
              }}
              primary
              style={{ marginTop: "12px" }}
            >
              <RotateCcw size={14} /> Retry
            </GlassButton>
          </div>
        ) : safeRoadmap.length > 0 ? (
          <>
            {/* Strengths & Focus Areas */}
            {isDetailed && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", flexWrap: "wrap" }}>
                <GlassCard style={{ padding: "20px" }}>
                  <h3 className="text-title" style={{ fontSize: "1rem", color: "var(--color-dark-blue)", marginBottom: "12px", display: "flex", alignItems: "center", gap: "6px" }}><CheckCircle2 size={16} style={{ color: "#10b981" }} /> Confirmed Strengths</h3>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    {strengths.map((str, idx) => (
                      <GlassBadge key={idx} status="success">{str}</GlassBadge>
                    ))}
                  </div>
                </GlassCard>
                <GlassCard style={{ padding: "20px" }}>
                  <h3 className="text-title" style={{ fontSize: "1rem", color: "var(--color-dark-blue)", marginBottom: "12px", display: "flex", alignItems: "center", gap: "6px" }}><ShieldAlert size={16} style={{ color: "#f59e0b" }} /> Priority Focus Gaps</h3>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    {prioritySkills.map((skill, idx) => (
                      <GlassBadge key={idx} status="secondary">{skill}</GlassBadge>
                    ))}
                  </div>
                </GlassCard>
              </div>
            )}

            {/* Overall progress bar */}
            <div className="glass-card" style={{ background: "rgba(255, 255, 255, 0.45)", border: "1px solid var(--glass-border)", padding: "20px", borderRadius: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", color: "var(--text-secondary)", fontSize: "0.85rem", fontWeight: "600" }}>
                <span>Overall Progress</span>
                <span>
                  {completedSteps}/{totalSteps} steps completed · {progressPct}%
                </span>
              </div>
              <div className="glass-progress" style={{ height: "8px", background: "rgba(0, 0, 42, 0.05)", borderRadius: "9999px", overflow: "hidden" }}>
                <div className="glass-progress-fill" style={{ height: "100%", width: `${progressPct}%`, background: "linear-gradient(90deg, #446A9C, #1A3F75)", borderRadius: "9999px" }} />
              </div>
            </div>

            {/* Weekly Study Schedule */}
            {isDetailed && weeklyPlan.length > 0 && (
              <GlassCard style={{ padding: "24px" }}>
                <h3 className="text-title" style={{ fontSize: "1.1rem", color: "var(--color-dark-blue)", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}><Clock size={16} /> Weekly Milestone Schedule</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {weeklyPlan.map((w, idx) => (
                    <div key={idx} style={{ display: "flex", gap: "16px", alignItems: "flex-start", padding: "12px", background: "rgba(255, 255, 255, 0.35)", border: "1px solid var(--glass-border)", borderRadius: "12px" }}>
                      <GlassBadge status="secondary">{w.week}</GlassBadge>
                      <div>
                        <strong style={{ color: "var(--color-navy)", fontSize: "0.95rem" }}>Focus Topic: {w.topic}</strong>
                        <p className="text-small" style={{ margin: "2px 0 0 0", color: "var(--text-secondary)" }}>{w.focus}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            )}

            {/* Suggested Projects */}
            {isDetailed && projects.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <h3 className="text-title" style={{ fontSize: "1.1rem", color: "var(--color-dark-blue)", margin: "8px 0 0 0", display: "flex", alignItems: "center", gap: "8px" }}><Terminal size={16} /> Target Practical Projects</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", flexWrap: "wrap" }}>
                  {projects.map((proj, idx) => (
                    <GlassCard key={idx} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "8px" }}>
                      <strong style={{ color: "var(--color-navy)", fontSize: "1.05rem" }}>{proj.title}</strong>
                      <p className="text-small" style={{ margin: 0, color: "var(--text-secondary)" }}>{proj.description}</p>
                    </GlassCard>
                  ))}
                </div>
              </div>
            )}

            {/* Main Action Plan Checklist (Modules) */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <h3 className="text-title" style={{ fontSize: "1.1rem", color: "var(--color-dark-blue)", margin: "8px 0 0 0", display: "flex", alignItems: "center", gap: "8px" }}><Sparkles size={16} /> Module Checklist & Action Plan</h3>
              <div className="roadmap-content">
                {safeRoadmap.map((module, skillIndex) => {
                  const steps = Array.isArray(module.steps) ? module.steps : [];
                  const resources = Array.isArray(module.resources) ? module.resources : [];
                  const moduleCompleted = steps.filter((_, si) => !!progress[`${skillIndex}-${si}`]).length;

                  return (
                    <GlassCard key={skillIndex} style={{ marginBottom: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <h2 className="text-title" style={{ margin: 0, color: "var(--color-dark-blue)", fontSize: "1.2rem" }}>
                          {module.skill || module.topic || `Topic ${skillIndex + 1}`}
                        </h2>
                        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                          {steps.length > 0 && (
                            <span className="text-small" style={{ fontWeight: "600", color: "var(--text-secondary)" }}>
                              {moduleCompleted}/{steps.length}
                            </span>
                          )}
                          <GlassBadge status="secondary">
                            {module.level || module.difficulty || "Intermediate"}
                          </GlassBadge>
                        </div>
                      </div>

                      {steps.length > 0 && (
                        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                          <h4 className="text-caption" style={{ color: "var(--text-secondary)", margin: 0 }}>Action Plan</h4>
                          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                            {steps.map((step, stepIndex) => {
                              const isChecked = !!progress[`${skillIndex}-${stepIndex}`];
                              return (
                                <label
                                  key={stepIndex}
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "12px",
                                    cursor: "pointer",
                                    padding: "12px",
                                    background: "rgba(255, 255, 255, 0.4)",
                                    borderRadius: "8px",
                                    border: isChecked ? "1px solid rgba(26,63,117,0.1)" : "1px solid var(--glass-border)",
                                    transition: "all var(--transition-fast) ease"
                                  }}
                                  className="checklist-label"
                                >
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => handleToggleStep(skillIndex, stepIndex)}
                                    style={{ width: "16px", height: "16px", accentColor: "var(--color-navy)" }}
                                  />
                                  <span
                                    style={{
                                      textDecoration: isChecked ? "line-through" : "none",
                                      color: isChecked ? "var(--text-muted)" : "var(--color-navy)",
                                      fontSize: "0.9rem"
                                    }}
                                  >
                                    {step}
                                  </span>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {resources.length > 0 && (
                        <div style={{ borderTop: "1px dashed var(--glass-border)", paddingTop: "14px" }}>
                          <h4 className="text-caption" style={{ color: "var(--text-secondary)", marginBottom: "8px" }}>Self-Learning Resources</h4>
                          <ul style={{ listStyleType: "none", padding: 0, display: "flex", flexDirection: "column", gap: "6px" }}>
                            {resources.map((res, resIdx) => (
                              <li key={resIdx} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                <Link2 size={12} className="text-secondary" />
                                <a
                                  href={res}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="res-link"
                                  style={{ color: "var(--soft-accent)", textDecoration: "none", fontSize: "0.85rem", wordBreak: "break-all" }}
                                >
                                  {res}
                                </a>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </GlassCard>
                  );
                })}
              </div>
            </div>

            {/* Supplemental prep details */}
            {isDetailed && (codingChallenges.length > 0 || practiceInterviews.length > 0 || mockTests.length > 0) && (
              <GlassCard style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>
                <h3 className="text-title" style={{ fontSize: "1.1rem", color: "var(--color-dark-blue)", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}><Award size={16} /> Supplemental Prep Tasks</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px" }}>
                  {codingChallenges.length > 0 && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      <strong style={{ color: "var(--color-navy)", display: "flex", alignItems: "center", gap: "6px" }}><Code size={14} /> Coding Exercises</strong>
                      <ul style={{ paddingLeft: "20px", margin: 0, fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                        {codingChallenges.map((c, idx) => <li key={idx}>{c}</li>)}
                      </ul>
                    </div>
                  )}
                  {practiceInterviews.length > 0 && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      <strong style={{ color: "var(--color-navy)", display: "flex", alignItems: "center", gap: "6px" }}><Activity size={14} /> Vocal Interview Rounds</strong>
                      <ul style={{ paddingLeft: "20px", margin: 0, fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                        {practiceInterviews.map((i, idx) => <li key={idx}>{i}</li>)}
                      </ul>
                    </div>
                  )}
                  {mockTests.length > 0 && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      <strong style={{ color: "var(--color-navy)", display: "flex", alignItems: "center", gap: "6px" }}><Compass size={14} /> Mock Reasoning Tests</strong>
                      <ul style={{ paddingLeft: "20px", margin: 0, fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                        {mockTests.map((t, idx) => <li key={idx}>{t}</li>)}
                      </ul>
                    </div>
                  )}
                </div>
              </GlassCard>
            )}
          </>
        ) : (
          <div className="roadmap-empty" style={{ textAlign: "center", padding: "40px 0" }}>
            <Compass size={32} className="text-muted" style={{ marginBottom: "12px" }} />
            <p className="text-small">No roadmap milestones compiled. Upload a resume and complete an AI interview to generate your personalized learning roadmap path.</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default LearningRoadmap;
