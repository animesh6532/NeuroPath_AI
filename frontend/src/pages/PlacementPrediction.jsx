import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { interviewAPI } from "../api/endpoints";
import { motion } from "framer-motion";
import { GlassCard, GlassButton, GlassBadge } from "../components/ui/DesignSystem";
import { 
  TrendingUp, ShieldAlert, Award, Briefcase, 
  ExternalLink, Activity, CheckCircle2, Circle 
} from "lucide-react";
import "./PlacementPrediction.css";

function PlacementPrediction() {
  const navigate = useNavigate();
  const { analysisData, interviewData, codingProgress, aptitudeResult, userProfile } = useContext(AppContext);
  const [placementResult, setPlacementResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const domain = analysisData?.best_domain || "Technology";
  const isTech = domain.toLowerCase().includes("tech") || 
                 domain.toLowerCase().includes("software") || 
                 domain.toLowerCase().includes("engineer") ||
                 domain.toLowerCase().includes("developer") ||
                 domain.toLowerCase().includes("coding");

  // Profile completeness calculation
  const getProfileCompleteness = () => {
    if (!userProfile) return 10; // baseline default
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

  // Compile check-list pipeline
  const pipelineSteps = [
    {
      id: "resume",
      name: "Resume Parsing & Analysis",
      completed: !!analysisData,
      path: "/resume",
      actionLabel: "Upload Resume",
      description: "Extract core technical skills and educational timelines."
    },
    {
      id: "interview",
      name: "Proctored AI Voice Interview",
      completed: !!interviewData,
      path: "/ai-interview",
      actionLabel: "Start Interview",
      description: "Evaluate technical speaking, problem solving, and confidence."
    },
    {
      id: "coding",
      name: "Technical Compiler IDE Challenge",
      completed: !isTech || (codingProgress?.solvedCount > 0),
      path: "/daily-coding",
      actionLabel: "Solve Coding Challenge",
      description: "Submit code compilers. Automatically skipped for non-technical roles.",
      isTechnicalOnly: true
    },
    {
      id: "aptitude",
      name: "Cognitive Aptitude Assessment",
      completed: !!aptitudeResult,
      path: "/aptitude-test",
      actionLabel: "Take Aptitude Test",
      description: "Measure logical and quantitative reasoning indices."
    }
  ];

  const activeSteps = pipelineSteps.filter(s => !s.isTechnicalOnly || isTech);
  const missingPrerequisites = activeSteps.filter(s => !s.completed);

  useEffect(() => {
    const fetchPlacement = async () => {
      if (missingPrerequisites.length > 0) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const payload = {
          resume_score: analysisData?.resume_score || 0,
          interview_score: interviewData?.score || 0,
          coding_score: codingProgress?.solvedCount > 0 ? 100 : 0,
          aptitude_score: aptitudeResult?.accuracy || 0,
          profile_completeness: getProfileCompleteness(),
          domain: domain,
          missing_skills: analysisData?.missing_skills || []
        };

        const res = await interviewAPI.placement(payload);
        setPlacementResult(res.data);
      } catch (err) {
        console.error("Failed to fetch placement prediction", err);
        setError("Error fetching placement prediction analytics from backend.");
      } finally {
        setLoading(false);
      }
    };

    fetchPlacement();
  }, [analysisData, interviewData, codingProgress, aptitudeResult]);

  if (loading) {
    return (
      <div className="page-container placement-page" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <GlassCard className="empty-card" style={{ textAlign: "center" }}>
          <Activity size={32} className="icon-spin text-secondary" style={{ marginBottom: "16px", margin: "0 auto" }} />
          <p>Analyzing candidate placement readiness indices...</p>
        </GlassCard>
      </div>
    );
  }

  // Prerequisite Pipeline check
  if (missingPrerequisites.length > 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        className="page-container placement-page"
        style={{ display: "flex", justifyContent: "center", padding: "140px 24px 60px 24px" }}
      >
        <GlassCard className="empty-card" style={{ maxWidth: "680px", width: "100%", padding: "40px" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", textAlign: "center", marginBottom: "32px" }}>
            <ShieldAlert size={48} className="text-warning" style={{ color: "var(--color-navy)" }} />
            <h2 style={{ fontSize: "1.8rem", color: "var(--color-dark-blue)" }}>Career Readiness Prerequisite Checklist</h2>
            <p className="text-subtitle" style={{ color: "var(--text-secondary)" }}>
              The Placement Forecaster builds weighted assessments across multiple modules. Please complete the following steps to unlock predictions:
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "36px" }}>
            {activeSteps.map((step, index) => (
              <div key={step.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(255, 255, 255, 0.4)", border: "1px solid var(--glass-border)", padding: "16px 20px", borderRadius: "16px", gap: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                  {step.completed ? (
                    <CheckCircle2 size={24} style={{ color: "#10b981", flexShrink: 0 }} />
                  ) : (
                    <Circle size={24} style={{ color: "var(--color-medium-blue)", flexShrink: 0 }} />
                  )}
                  <div>
                    <h4 style={{ margin: 0, color: "var(--color-dark-blue)", fontSize: "1.05rem", fontWeight: "600" }}>
                      Step {index + 1}: {step.name}
                    </h4>
                    <p className="text-small" style={{ margin: "2px 0 0 0", color: "var(--text-secondary)" }}>{step.description}</p>
                  </div>
                </div>
                {!step.completed && (
                  <GlassButton primary onClick={() => navigate(step.path)} style={{ padding: "8px 16px", fontSize: "0.85rem", whiteSpace: "nowrap" }}>
                    {step.actionLabel}
                  </GlassButton>
                )}
              </div>
            ))}
          </div>
        </GlassCard>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="page-container placement-page"
      style={{ paddingTop: "140px", paddingBottom: "60px" }}
    >
      <GlassCard className="placement-card" style={{ maxWidth: "900px", margin: "0 auto", padding: "40px" }}>
        <GlassBadge status="secondary">Recruiter Engine</GlassBadge>
        <h1 style={{ marginTop: "12px", color: "var(--color-dark-blue)" }}>Placement Analytics & Opportunities</h1>
        <p className="text-subtitle" style={{ color: "var(--text-secondary)", marginBottom: "32px" }}>
          AI-based placement readiness scoring and curated job matching based on your Career Intelligence Pipeline.
        </p>

        {error && (
          <div className="warning-banner" style={{ background: "rgba(239, 68, 68, 0.08)", border: "1px solid rgba(239, 68, 68, 0.2)", padding: "16px", color: "#991b1b", borderRadius: "12px", marginBottom: "24px" }}>
            {error}
          </div>
        )}

        <div className="prediction-box highlight-card" style={{ background: "rgba(255, 255, 255, 0.45)", padding: "28px", display: "flex", flexDirection: "column", gap: "16px", border: "1px solid var(--glass-border)", borderRadius: "16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 className="text-title" style={{ margin: 0, fontSize: "1.4rem", color: "var(--color-dark-blue)" }}>
              {placementResult?.level || "Highly Compatible"} Placement Class
            </h2>
            <TrendingUp size={24} className="text-secondary" style={{ color: "var(--color-medium-blue)" }} />
          </div>
          <p style={{ fontSize: '2rem', color: 'var(--color-navy)', fontWeight: '800', margin: 0, fontFamily: 'Outfit' }}>
            Placement Readiness Index: {placementResult?.placement_score || 0}%
          </p>
          <hr style={{ border: 0, height: "1px", background: "var(--glass-border)", margin: "8px 0" }} />
          
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", fontSize: "0.95rem" }}>
            <div>
              <span style={{ color: 'var(--text-secondary)' }}>Target Career:</span> 
              <strong style={{ marginLeft: '8px', color: 'var(--color-dark-blue)' }}>{analysisData.top_career}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-secondary)' }}>Domain:</span> 
              <strong style={{ marginLeft: '8px', color: 'var(--color-dark-blue)' }}>{domain}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-secondary)' }}>Scoring Model:</span> 
              <strong style={{ marginLeft: '8px', color: 'var(--color-dark-blue)' }}>
                {placementResult?.is_technical ? "Technical Weights" : "Non-Technical Weights"}
              </strong>
            </div>
          </div>
        </div>

        {placementResult?.suggested_roles?.length > 0 && (
          <GlassCard style={{ marginTop: '24px', display: "flex", flexDirection: "column", gap: "14px", padding: "24px" }}>
            <h3 className="text-title" style={{ display: "flex", alignItems: "center", gap: "8px", margin: 0, fontSize: "1.1rem" }}>
              <Briefcase size={16} style={{ color: "var(--color-medium-blue)" }} /> Suggested Alternate Occupations
            </h3>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {placementResult.suggested_roles.map((role, idx) => (
                <GlassBadge key={idx} status="secondary">
                  {role}
                </GlassBadge>
              ))}
            </div>
          </GlassCard>
        )}

        {placementResult?.job_links?.length > 0 && (
          <GlassCard style={{ marginTop: '24px', display: "flex", flexDirection: "column", gap: "16px", padding: "24px" }}>
            <h3 className="text-title" style={{ display: "flex", alignItems: "center", gap: "8px", margin: 0, fontSize: "1.1rem" }}>
              <Award size={16} style={{ color: "var(--color-medium-blue)" }} /> Curated Open Roles Links
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {placementResult.job_links.map((job, idx) => (
                <div key={idx} className="job-row" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: "rgba(255, 255, 255, 0.4)", borderRadius: "12px", border: "1px solid var(--glass-border)" }}>
                  <div>
                    <h4 style={{ margin: '0 0 4px 0', color: 'var(--color-navy)', fontSize: "1.05rem", fontWeight: "600" }}>{job.title}</h4>
                    <span className="text-small" style={{ color: "var(--text-secondary)" }}>{job.company} • {job.platform}</span>
                  </div>
                  <GlassButton primary onClick={() => window.open(job.url, "_blank")} style={{ padding: "8px 16px", fontSize: "0.85rem" }}>
                    Apply <ExternalLink size={14} style={{ marginLeft: "4px" }} />
                  </GlassButton>
                </div>
              ))}
            </div>
          </GlassCard>
        )}
      </GlassCard>
    </motion.div>
  );
}

export default PlacementPrediction;