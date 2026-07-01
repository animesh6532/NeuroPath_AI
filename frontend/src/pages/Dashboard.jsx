import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { motion } from "framer-motion";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as ChartTooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from "recharts";
import { 
  Award, FileText, CheckCircle2, TrendingUp, Flame, 
  BookOpen, Play, Calendar, Star, Code, Users, Briefcase, Activity
} from "lucide-react";
import { GlassCard, GlassButton, GlassBadge, GlassMetric } from "../components/ui/DesignSystem";
import "./Dashboard.css";

function Dashboard() {
  const {
    analysisData,
    interviewData,
    roadmapData,
    codingProgress,
    aptitudeResult,
    recentUpload,
    resumeHistory,
    userProfile,
    roadmapProgress,
  } = useContext(AppContext);
  const navigate = useNavigate();

  if (!analysisData) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="page-container dashboard-page empty"
        style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "65vh", paddingTop: "140px" }}
      >
        <div className="glass-card empty-card" style={{ maxWidth: "500px", textAlign: "center", padding: "40px" }}>
          <FileText size={40} className="text-secondary" style={{ marginBottom: "20px", margin: "0 auto" }} />
          <h2>No Candidate Data</h2>
          <p className="text-small">Please upload and parse your resume profile to compute analytics dashboard reports.</p>
          <GlassButton primary onClick={() => navigate("/resume")} style={{ marginTop: "20px" }}>
            Upload Resume
          </GlassButton>
        </div>
      </motion.div>
    );
  }

  const resume_score = analysisData?.resume_score ?? 0;
  const best_domain = analysisData?.best_domain ?? "General";
  const interview_score = interviewData?.score ?? "N/A";
  const confidence = interviewData?.confidence ?? "N/A";
  const communication = interviewData?.communication ?? "N/A";
  const streak = codingProgress?.streak ?? 0;
  const solvedCount = codingProgress?.solvedCount ?? 0;

  const isTechnical = best_domain.toLowerCase().includes("tech") || 
                      best_domain.toLowerCase().includes("software") || 
                      best_domain.toLowerCase().includes("engineer") ||
                      best_domain.toLowerCase().includes("developer") ||
                      best_domain.toLowerCase().includes("coding");

  // Profile completeness calculation
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

  // Placement readiness local calculator
  const getPlacementReadiness = () => {
    const resScore = resume_score;
    const intScore = interviewData?.score || 0;
    const codScore = solvedCount > 0 ? 100 : 0;
    const aptScore = aptitudeResult?.accuracy || 0;
    const profComp = getProfileCompleteness();

    // Block calculation if essential prerequisites are missing
    if (!analysisData || !interviewData || !aptitudeResult) {
      return "N/A";
    }

    if (isTechnical) {
      return Math.round(
        resScore * 0.20 +
        intScore * 0.35 +
        codScore * 0.30 +
        aptScore * 0.10 +
        profComp * 0.05
      );
    } else {
      return Math.round(
        resScore * 0.30 +
        intScore * 0.40 +
        aptScore * 0.25 +
        profComp * 0.05
      );
    }
  };

  const completedSteps = Object.values(roadmapProgress || {}).filter(Boolean).length;

  const safeRoadmap = Array.isArray(roadmapData)
    ? roadmapData
    : (Array.isArray(roadmapData?.milestones) ? roadmapData.milestones : []);
  let totalRoadmapSteps = 0;
  safeRoadmap.forEach((module) => {
    totalRoadmapSteps += Array.isArray(module.steps) ? module.steps.length : 0;
  });
  const progressPercent = totalRoadmapSteps > 0 ? Math.round((completedSteps / totalRoadmapSteps) * 100) : 0;

  const pieData = [
    { name: "Completed", value: progressPercent, color: "var(--color-navy)" },
    { name: "Remaining", value: 100 - progressPercent, color: "rgba(26, 63, 117, 0.12)" },
  ];

  const mockGraphData = [
    { day: "Mon", solved: 1 },
    { day: "Tue", solved: Math.floor((solvedCount) / 3) || 1 },
    { day: "Wed", solved: 2 },
    { day: "Thu", solved: Math.floor((solvedCount) / 2) || 1 },
    { day: "Today", solved: solvedCount },
  ];

  // Dynamic Recent Activity Compiled
  const recentActivities = [];
  if (analysisData) {
    recentActivities.push({
      id: 1,
      text: `Resume profile analyzed targeting ${best_domain}.`,
      desc: `ATS Compatibility scored at ${resume_score}%`,
      icon: FileText
    });
  }
  if (interviewData) {
    recentActivities.push({
      id: 2,
      text: `AI Voice Interview completed.`,
      desc: `Evaluated technical depth at ${interview_score}%`,
      icon: CheckCircle2
    });
  }
  if (solvedCount > 0) {
    recentActivities.push({
      id: 3,
      text: `Daily coding challenges updated.`,
      desc: `Solved ${solvedCount} total compiler issues`,
      icon: Code
    });
  }
  if (aptitudeResult) {
    recentActivities.push({
      id: 4,
      text: `Cognitive aptitude test completed.`,
      desc: `Scored ${aptitudeResult.score}/${aptitudeResult.total} (${Math.round(aptitudeResult.accuracy)}% accuracy)`,
      icon: Award
    });
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="page-container dashboard-page"
      style={{ paddingTop: "140px", paddingBottom: "60px" }}
    >
      {/* Header */}
      <div className="dashboard-header glass-card-v6" style={{ background: "var(--glass-bg)", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "28px 32px", borderRadius: "24px", border: "1px solid var(--glass-border)" }}>
        <div>
          <span className="glass-badge">Career OS Portal</span>
          <h1 style={{ fontSize: "2rem", marginTop: "6px", color: "var(--color-dark-blue)" }}>Overview Dashboard</h1>
          <p className="text-small" style={{ margin: "4px 0 0 0", color: "var(--text-secondary)" }}>Centralized intelligence & readiness analytics</p>
        </div>
        <div className="header-actions">
          {recentUpload && (
            <GlassBadge status="secondary">
              <FileText size={12} style={{ marginRight: "4px" }} />
              {recentUpload}
            </GlassBadge>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="dashboard-actions-row" style={{ display: "flex", gap: "12px", margin: "24px 0", flexWrap: "wrap" }}>
        <GlassButton onClick={() => navigate("/aptitude-test")}>
          <Award size={16} /> Take Aptitude Test
        </GlassButton>
        <GlassButton 
          onClick={() => isTechnical && navigate("/daily-coding")} 
          primary={isTechnical}
          disabled={!isTechnical}
        >
          <Code size={16} /> Start Daily Coding
        </GlassButton>
        <GlassButton onClick={() => navigate("/resume")}>
          <FileText size={16} /> Re-upload Resume
        </GlassButton>
      </div>

      {/* Stats Cards Grid (Uniform 5 columns) */}
      <div className="stats-grid-row" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "16px" }}>
        <GlassMetric title="Resume Score" value={`${resume_score}%`} icon={FileText} caption="ATS alignment rating" />
        <GlassMetric 
          title="Interview Score" 
          value={interview_score !== "N/A" ? `${interview_score}%` : "N/A"} 
          icon={CheckCircle2} 
          caption="Spoken competency score"
        />
        <GlassMetric 
          title="Coding Score" 
          value={isTechnical ? `${solvedCount} solved` : "Skipped"} 
          icon={Code} 
          caption="IDE submissions count"
        />
        <GlassMetric 
          title="Aptitude Score" 
          value={aptitudeResult ? `${Math.round(aptitudeResult.accuracy)}%` : "N/A"} 
          icon={Award} 
          caption="Quantitative reasoning accuracy"
        />
        <GlassMetric 
          title="Placement Readiness" 
          value={getPlacementReadiness() !== "N/A" ? `${getPlacementReadiness()}%` : "N/A"} 
          icon={TrendingUp} 
          caption="Aggregate weighted forecaster"
        />
      </div>

      {/* Coding / Streak row if technical */}
      {isTechnical && (
        <div className="dashboard-section double-col" style={{ display: "grid", gridTemplateColumns: "2.4fr 1.6fr", gap: "24px", marginTop: "24px" }}>
          <GlassCard style={{ padding: "28px" }}>
            <h3 className="text-title" style={{ fontSize: "1.1rem", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}><Code size={16} /> Python Solution Submissions</h3>
            <div className="chart-box" style={{ height: "200px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockGraphData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(26,63,117,0.06)" vertical={false} />
                  <XAxis dataKey="day" stroke="var(--color-navy)" fontSize={11} tickLine={false} />
                  <YAxis stroke="var(--color-navy)" fontSize={11} tickLine={false} allowDecimals={false} />
                  <ChartTooltip 
                    cursor={{ fill: "rgba(26,63,117,0.05)" }}
                    contentStyle={{
                      backgroundColor: "rgba(255, 255, 255, 0.95)",
                      border: "1px solid var(--glass-border)",
                      borderRadius: "8px",
                      color: "var(--color-dark-blue)"
                    }}
                  />
                  <Bar dataKey="solved" fill="var(--color-medium-blue)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
          
          <GlassCard style={{ padding: "28px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
            <h3 className="text-title" style={{ fontSize: "1.1rem", marginBottom: "16px", width: "100%", textAlign: "left", display: "flex", alignItems: "center", gap: "8px" }}><Flame size={16} /> Coding Streak</h3>
            <div className="streak-badge-container" style={{ margin: "auto 0", display: "flex", flexDirection: "column", alignItems: "center" }}>
              <Flame size={64} className="streak-icon" style={{ color: "var(--color-medium-blue)", filter: "drop-shadow(0 4px 12px rgba(68,106,156,0.2))" }} />
              <div className="streak-count" style={{ fontSize: "2.5rem", fontWeight: "800", fontFamily: "var(--font-display)", color: "var(--color-dark-blue)" }}>{streak}</div>
            </div>
            <p className="text-small" style={{ color: "var(--text-muted)", margin: "8px 0 0 0" }}>Consecutive Days Active</p>
          </GlassCard>
        </div>
      )}

      {/* Progress, Career Matches, & Activity logs Row */}
      <div className="dashboard-section triple-col" style={{ display: "grid", gridTemplateColumns: "1.2fr 1.4fr 1.4fr", gap: "24px", marginTop: "24px" }}>
        
        {/* Roadmap Progress */}
        <GlassCard style={{ padding: "28px" }}>
          <h3 className="text-title" style={{ fontSize: "1.1rem", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}><BookOpen size={16} /> Roadmap Progress</h3>
          {totalRoadmapSteps > 0 ? (
            <div className="progress-radial-box" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", minHeight: "180px" }}>
              <div className="chart-radial" style={{ width: "120px", height: "120px" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={42}
                      outerRadius={54}
                      dataKey="value"
                      stroke="none"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <ChartTooltip formatter={(val) => `${val}%`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <h4 style={{ margin: "8px 0 2px 0", color: "var(--color-dark-blue)", fontSize: "1.05rem" }}>{progressPercent}% Achieved</h4>
              <p className="text-caption" style={{ color: "var(--text-muted)", fontSize: "0.8rem", margin: 0 }}>{completedSteps} of {totalRoadmapSteps} targets</p>
            </div>
          ) : (
            <div className="empty-sub-card" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "180px", color: "var(--text-secondary)" }}>
              <BookOpen size={28} className="text-muted" style={{ marginBottom: "12px" }} />
              <p className="text-small" style={{ margin: 0, textAlign: "center" }}>Complete your roadmap training milestones.</p>
            </div>
          )}
        </GlassCard>

        {/* Top Career Matches */}
        <GlassCard style={{ padding: "28px" }}>
          <h3 className="text-title" style={{ fontSize: "1.1rem", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}><TrendingUp size={16} /> Top Career Matches</h3>
          {analysisData.top_careers?.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {analysisData.top_careers.slice(0, 4).map((c, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 14px", background: "rgba(255, 255, 255, 0.4)", borderRadius: "12px", border: "1px solid var(--glass-border)" }}>
                  <span style={{ fontWeight: "600", color: "var(--color-navy)", fontSize: "0.9rem" }}>{c.career}</span>
                  <GlassBadge status="success">{c.score}% Match</GlassBadge>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-sub-card" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "180px" }}>
              <TrendingUp size={28} className="text-muted" style={{ marginBottom: "12px" }} />
              <p className="text-small" style={{ margin: 0, textAlign: "center" }}>Career matches will be displayed here.</p>
            </div>
          )}
        </GlassCard>

        {/* Recent Activity Log */}
        <GlassCard style={{ padding: "28px" }}>
          <h3 className="text-title" style={{ fontSize: "1.1rem", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}><Activity size={16} /> Recent Activity</h3>
          {recentActivities.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {recentActivities.map((act) => {
                const Icon = act.icon;
                return (
                  <div key={act.id} style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                    <div style={{ padding: "8px", background: "rgba(68, 106, 156, 0.08)", borderRadius: "8px", color: "var(--color-medium-blue)", flexShrink: 0 }}>
                      <Icon size={16} />
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: "0.9rem", color: "var(--color-dark-blue)", fontWeight: "600" }}>{act.text}</h4>
                      <p className="text-small" style={{ margin: "2px 0 0 0", color: "var(--text-secondary)", fontSize: "0.75rem" }}>{act.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="empty-sub-card" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "180px" }}>
              <Activity size={28} className="text-muted" style={{ marginBottom: "12px" }} />
              <p className="text-small" style={{ margin: 0, textAlign: "center" }}>No activity logs recorded yet.</p>
            </div>
          )}
        </GlassCard>
      </div>
    </motion.div>
  );
}

export default Dashboard;
