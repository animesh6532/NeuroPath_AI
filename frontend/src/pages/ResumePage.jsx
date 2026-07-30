import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../contexts/AppContext";
import ResumeUpload from "../components/ResumeUpload";
import { motion, AnimatePresence } from "framer-motion";
import { 
  BarChart, Compass, Briefcase, TrendingUp, AlertTriangle, 
  Map, Award, FileText, CheckCircle2, ChevronRight, Download, Link2
} from "lucide-react";
import { GlassCard, GlassButton, GlassBadge, GlassProgress, GlassTabs } from "../components/ui/DesignSystem";
import "./ResumePage.css";

function ResumePage() {
  const navigate = useNavigate();
  const { analysisData } = useContext(AppContext);
  const [activeTab, setActiveTab] = useState("overview");

  const handlePrint = () => {
    window.print();
  };

  const tabList = [
    { id: "overview", label: "Overview & Profile", icon: <BarChart size={14} /> },
    { id: "careers", label: "Top 20 Careers", icon: <Compass size={14} /> },
    { id: "roadmap", label: "Skill Gaps & Roadmap", icon: <Map size={14} /> },
    { id: "salary", label: "Salaries & Timeline", icon: <Briefcase size={14} /> },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="page-container resume-page"
    >
      <div className="resume-upload-section no-print">
        <ResumeUpload />
      </div>

      {analysisData && (
        <div className="resume-details-container" style={{ marginTop: "32px" }}>
          <div className="resume-header glass-card-v6" style={{ background: "var(--glass-bg)", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "28px 32px", borderRadius: "24px" }}>
            <div className="header-meta">
              <span className="glass-badge">Parser Module</span>
              <h2 style={{ fontSize: "2rem", marginTop: "6px" }}>Career Intelligence Dashboard</h2>
              <p className="text-small" style={{ margin: "4px 0 0 0" }}>Advanced AI-driven career matching and resume analytics</p>
              
              {analysisData.classified_domains?.length > 0 && (
                <div className="classified-domains-wrapper" style={{ marginTop: "12px", display: "flex", gap: "8px", alignItems: "center" }}>
                  <span className="text-caption" style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>Classified Domains:</span>
                  {analysisData.classified_domains.map((dom, i) => (
                    <GlassBadge key={i} status="secondary">{dom}</GlassBadge>
                  ))}
                </div>
              )}
            </div>
            <div style={{ display: "flex", gap: "12px", alignItems: "center" }} className="no-print">
              <GlassButton onClick={handlePrint}>
                <Download size={14} /> Download PDF Report
              </GlassButton>
              <GlassButton primary onClick={() => navigate("/dashboard")}>
                Continue to Dashboard <ChevronRight size={14} />
              </GlassButton>
            </div>
          </div>

          {/* Premium Tab Navigation */}
          <div className="dashboard-tabs no-print" style={{ margin: "24px 0" }}>
            <GlassTabs tabs={tabList} activeTab={activeTab} onChange={setActiveTab} />
          </div>

          {/* TAB CONTENTS */}
          <div className="tab-contents">
            <AnimatePresence mode="wait">
              {activeTab === "overview" && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                  className="tab-pane"
                >
                  <div className="overview-summary-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 2fr", gap: "20px", marginBottom: "20px" }}>
                    <GlassCard className="score-card highlight-box" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
                      <div className="text-caption" style={{ marginBottom: "12px" }}>Career Readiness</div>
                      <div className="score-circle-wrapper" style={{ width: "80px", height: "80px", position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <svg viewBox="0 0 36 36" className="circular-chart" style={{ width: "100%", height: "100%" }}>
                          <path
                            className="circle-bg"
                            stroke="rgba(26,63,117,0.06)"
                            strokeWidth="2.8"
                            fill="none"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          />
                          <path
                            className="circle"
                            stroke="var(--color-navy)"
                            strokeWidth="2.8"
                            strokeLinecap="round"
                            fill="none"
                            strokeDasharray={`${analysisData.career_readiness_score ?? analysisData.resume_score ?? 0}, 100`}
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          />
                        </svg>
                        <span className="score-percentage" style={{ position: "absolute", fontSize: "1.2rem", fontWeight: "800", color: "var(--color-dark-blue)" }}>
                          {analysisData.career_readiness_score ?? analysisData.resume_score ?? 0}%
                        </span>
                      </div>
                      <p className="text-small" style={{ color: "var(--text-muted)", marginTop: "12px", margin: 0 }}>Target readiness index</p>
                    </GlassCard>

                    <GlassCard className="score-card strength-box" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
                      <div className="text-caption" style={{ marginBottom: "12px" }}>Resume Quality</div>
                      <div className="score-circle-wrapper" style={{ width: "80px", height: "80px", position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <svg viewBox="0 0 36 36" className="circular-chart" style={{ width: "100%", height: "100%" }}>
                          <path
                            className="circle-bg"
                            stroke="rgba(26,63,117,0.06)"
                            strokeWidth="2.8"
                            fill="none"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          />
                          <path
                            className="circle"
                            stroke="var(--color-medium-blue)"
                            strokeWidth="2.8"
                            strokeLinecap="round"
                            fill="none"
                            strokeDasharray={`${analysisData.resume_strength ?? 70}, 100`}
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          />
                        </svg>
                        <span className="score-percentage" style={{ position: "absolute", fontSize: "1.2rem", fontWeight: "800", color: "var(--color-dark-blue)" }}>
                          {analysisData.resume_strength ?? 70}%
                        </span>
                      </div>
                      <p className="text-small" style={{ color: "var(--text-muted)", marginTop: "12px", margin: 0 }}>Extracted formatting index</p>
                    </GlassCard>

                    <GlassCard className="detail-section flex-expand" style={{ display: "flex", flexDirection: "column", gap: "8px", justifyContent: "center" }}>
                      <h3 className="text-title" style={{ fontSize: "1rem", display: "flex", alignItems: "center", gap: "8px" }}><Compass size={16} /> Target Match</h3>
                      <h2 className="top-career-title" style={{ fontSize: "1.45rem", color: "var(--color-dark-blue)", margin: 0 }}>{analysisData.top_career}</h2>
                      <p className="text-small" style={{ color: "var(--text-secondary)", margin: 0 }}>{analysisData.career_explanation}</p>
                      <div style={{ display: "flex", gap: "8px", marginTop: "6px" }}>
                        <GlassBadge status="secondary">Domain: {analysisData.best_domain}</GlassBadge>
                        <GlassBadge status="success">Growth: {analysisData.top_careers?.[0]?.growth_rate ?? "24%"}</GlassBadge>
                      </div>
                    </GlassCard>
                  </div>

                  {analysisData.resume_scores && (
                    <GlassCard className="detail-section category-scores-section" style={{ marginBottom: "20px" }}>
                      <h3 className="text-title" style={{ fontSize: "1rem", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}><BarChart size={16} /> Resume Quality Category Scores</h3>
                      <div className="category-scores-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                        {Object.entries(analysisData.resume_scores).map(([category, val], i) => (
                          <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(255, 255, 255, 0.4)", padding: "12px 18px", borderRadius: "12px", border: "1px solid var(--glass-border)" }}>
                            <span className="text-small" style={{ fontWeight: "600" }}>{category}</span>
                            <div style={{ display: "flex", alignItems: "center", gap: "12px", width: "180px" }}>
                              <GlassProgress value={val} />
                              <span className="text-small" style={{ fontWeight: "700", minWidth: "36px", textAlign: "right" }}>{val}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </GlassCard>
                  )}

                  <div className="profile-grid" style={{ display: "grid", gridTemplateColumns: "2.4fr 1.6fr", gap: "20px" }}>
                    <div className="profile-main" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                      <GlassCard>
                        <h3 className="text-title" style={{ fontSize: "1rem", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}><CheckCircle2 size={16} /> Extracted Skills Portfolio</h3>
                        <div className="skills-wrap" style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                          {analysisData.detected_skills?.length > 0 ? (
                            analysisData.detected_skills.map((skill, i) => (
                              <GlassBadge key={i}>{skill}</GlassBadge>
                            ))
                          ) : (
                            <p className="text-small text-muted">No skills detected.</p>
                          )}
                        </div>
                      </GlassCard>

                      <GlassCard>
                        <h3 className="text-title" style={{ fontSize: "1rem", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}><FileText size={16} /> Extracted Project Records</h3>
                        <div className="list-wrap" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                          {analysisData.projects?.length > 0 ? (
                            analysisData.projects.map((proj, i) => (
                              <div key={i} className="list-card glass-card" style={{ padding: "14px 18px", background: "rgba(255, 255, 255, 0.4)", borderRadius: "12px", fontSize: "0.9rem" }}>{proj}</div>
                            ))
                          ) : (
                            <p className="text-small text-muted">No projects found.</p>
                          )}
                        </div>
                      </GlassCard>

                      <GlassCard>
                        <h3 className="text-title" style={{ fontSize: "1rem", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}><Briefcase size={16} /> Employment Records</h3>
                        <div className="list-wrap" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                          {analysisData.experience?.length > 0 ? (
                            analysisData.experience.map((exp, i) => (
                              <div key={i} className="list-card glass-card" style={{ padding: "14px 18px", background: "rgba(255, 255, 255, 0.4)", borderRadius: "12px", fontSize: "0.9rem" }}>{exp}</div>
                            ))
                          ) : (
                            <p className="text-small text-muted">No experience details found.</p>
                          )}
                        </div>
                      </GlassCard>
                    </div>

                    <div className="profile-sidebar">
                      <GlassCard className="alert-box" style={{ height: "100%", border: "1px solid rgba(175,203,232,0.15)" }}>
                        <h3 className="text-title" style={{ fontSize: "1rem", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px", color: "var(--color-soft-blue)" }}><AlertTriangle size={16} /> Formatting & Content Suggestions</h3>
                        <ul className="suggestions-list" style={{ paddingLeft: "16px", display: "flex", flexDirection: "column", gap: "12px", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                          {analysisData.improvement_suggestions?.length > 0 ? (
                            analysisData.improvement_suggestions.map((sug, i) => (
                              <li key={i}>{sug}</li>
                            ))
                          ) : (
                            <li>Profile structure is optimal. Expand certification portfolios.</li>
                          )}
                        </ul>
                      </GlassCard>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === "careers" && (
                <motion.div
                  key="careers"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                  className="tab-pane"
                >
                  <GlassCard>
                    <h3 className="text-title" style={{ fontSize: "1rem", marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}><Compass size={16} /> Top 20 Career Alignment Analysis</h3>
                    <div className="table-wrapper" style={{ overflowX: "auto" }}>
                      <table className="glass-table" style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem", color: "var(--text-secondary)" }}>
                        <thead>
                          <tr style={{ borderBottom: "1px solid var(--glass-border)", textAlign: "left" }}>
                            <th style={{ padding: "12px 8px", fontWeight: "600" }}>Rank</th>
                            <th style={{ padding: "12px 8px", fontWeight: "600" }}>Occupational Profile</th>
                            <th style={{ padding: "12px 8px", fontWeight: "600" }}>Domain Category</th>
                            <th style={{ padding: "12px 8px", fontWeight: "600" }}>Compatibility</th>
                            <th style={{ padding: "12px 8px", fontWeight: "600" }}>Market Outlook</th>
                            <th style={{ padding: "12px 8px", fontWeight: "600" }}>Median Salary</th>
                          </tr>
                        </thead>
                        <tbody>
                          {analysisData.top_careers?.length > 0 ? (
                            analysisData.top_careers.map((c, i) => (
                              <tr key={i} style={{ borderBottom: "1px solid rgba(0,0,26,0.03)" }}>
                                <td style={{ padding: "12px 8px", fontWeight: "700" }}>#{i + 1}</td>
                                <td style={{ padding: "12px 8px" }}>
                                  <strong style={{ color: "var(--color-navy)", fontSize: "0.95rem" }}>{c.career}</strong>
                                  <p className="text-caption" style={{ margin: "4px 0 8px 0", fontSize: "0.8rem", color: "var(--text-muted)", lineHeight: "1.4" }}>{c.description}</p>
                                  
                                  {c.score_breakdown && (
                                    <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", marginTop: "4px" }}>
                                      <GlassBadge>Skills: {c.score_breakdown.skills}/30</GlassBadge>
                                      <GlassBadge>Exp: {c.score_breakdown.experience}/25</GlassBadge>
                                      <GlassBadge>Edu: {c.score_breakdown.education}/15</GlassBadge>
                                      <GlassBadge>Proj: {c.score_breakdown.projects}/10</GlassBadge>
                                    </div>
                                  )}
                                </td>
                                <td style={{ padding: "12px 8px" }}>
                                  <GlassBadge status="secondary">{c.industry}</GlassBadge>
                                </td>
                                <td style={{ padding: "12px 8px" }}>
                                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                    <GlassProgress value={c.score} style={{ width: "80px" }} />
                                    <span style={{ fontWeight: "700" }}>{c.score}%</span>
                                  </div>
                                </td>
                                <td style={{ padding: "12px 8px" }}>
                                  <GlassBadge status={c.future_demand?.toLowerCase() === "high" ? "success" : "warning"}>
                                    {c.future_demand}
                                  </GlassBadge>
                                </td>
                                <td style={{ padding: "12px 8px", fontFamily: "monospace" }}>{c.salary_avg}</td>
                              </tr>
                            ))
                          ) : (
                            analysisData.recommended_careers?.map((c, i) => (
                              <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                                <td>#{i + 1}</td>
                                <td><strong>{c.career}</strong></td>
                                <td>General</td>
                                <td>{c.score}%</td>
                                <td>Stable</td>
                                <td>N/A</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </GlassCard>
                </motion.div>
              )}

              {activeTab === "roadmap" && (
                <motion.div
                  key="roadmap"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                  className="tab-pane"
                >
                  <div className="roadmap-grid" style={{ display: "grid", gridTemplateColumns: "2.4fr 1.6fr", gap: "20px" }}>
                    <div className="roadmap-main">
                      <GlassCard>
                        <h3 className="text-title" style={{ fontSize: "1rem", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}><Map size={16} /> Curated Transition Roadmap</h3>
                        <p className="text-small" style={{ color: "var(--text-secondary)", marginBottom: "20px" }}>Step-by-step competency roadmap to transition into the target career path:</p>
                        
                        <div className="roadmap-timeline" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                          {analysisData.learning_roadmap?.length > 0 ? (
                            analysisData.learning_roadmap.map((module, i) => (
                              <div key={i} className="timeline-node-card" style={{ display: "flex", gap: "16px" }}>
                                <span style={{ width: "28px", height: "28px", borderRadius: "50%", background: "var(--glass-bg)", border: "1px solid var(--glass-border)", color: "var(--color-navy)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.85rem", fontWeight: "700" }}>{i + 1}</span>
                                <div style={{ flex: 1, background: "rgba(255, 255, 255, 0.4)", padding: "16px", borderRadius: "16px", border: "1px solid var(--glass-border)" }}>
                                  <h4 style={{ margin: "0 0 10px 0", fontSize: "1rem" }}>{module.skill} <GlassBadge status="secondary" style={{ marginLeft: "8px" }}>{module.level}</GlassBadge></h4>
                                  <ul style={{ paddingLeft: "16px", margin: "0 0 12px 0", color: "var(--text-secondary)", fontSize: "0.85rem", display: "flex", flexDirection: "column", gap: "6px" }}>
                                    {module.steps?.map((step, idx) => (
                                      <li key={idx}>{step}</li>
                                    ))}
                                  </ul>
                                  <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                                    <Link2 size={12} className="text-secondary" />
                                    {module.resources?.map((res, idx) => (
                                      <a key={idx} href={res} target="_blank" rel="noreferrer" className="res-link" style={{ fontSize: "0.8rem", color: "var(--soft-accent)", textDecoration: "none", marginRight: "10px" }}>
                                        Resource {idx + 1}
                                      </a>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="text-small text-muted">No roadmap modules generated.</p>
                          )}
                        </div>
                      </GlassCard>
                    </div>

                    <div className="roadmap-sidebar">
                      <GlassCard className="warning-box" style={{ border: "1px solid rgba(175,203,232,0.15)", display: "flex", flexDirection: "column", gap: "16px" }}>
                        <div>
                          <h3 className="text-title" style={{ fontSize: "1rem", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px", color: "var(--color-soft-blue)" }}><AlertTriangle size={16} /> Skill Gaps & Missing Certifications</h3>
                          <div className="skills-wrap" style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "12px" }}>
                            {analysisData.missing_skills?.length > 0 ? (
                              analysisData.missing_skills.map((skill, i) => (
                                <GlassBadge key={i} status="danger">{skill}</GlassBadge>
                              ))
                            ) : (
                              <p className="text-small">No skill deficits detected.</p>
                            )}
                          </div>
                        </div>

                        {analysisData.top_careers?.[0]?.certifications?.length > 0 && (
                          <div style={{ borderTop: "1px dashed var(--glass-border)", paddingTop: "14px" }}>
                            <h4 className="text-caption" style={{ color: "var(--text-secondary)" }}>Missing Credentials:</h4>
                            <ul style={{ paddingLeft: "16px", color: "var(--text-secondary)", fontSize: "0.85rem", marginTop: "8px", display: "flex", flexDirection: "column", gap: "6px" }}>
                              {analysisData.top_careers[0].certifications.map((cert, i) => (
                                <li key={i}>{cert}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </GlassCard>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === "salary" && (
                <motion.div
                  key="salary"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                  className="tab-pane"
                >
                  <div className="salary-timeline-grid" style={{ display: "grid", gridTemplateColumns: "1.8fr 2.2fr", gap: "20px" }}>
                    <GlassCard>
                      <h3 className="text-title" style={{ fontSize: "1rem", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}><TrendingUp size={16} /> Expected Salary Metrics</h3>
                      <p className="text-small" style={{ color: "var(--text-secondary)", marginBottom: "20px" }}>Annual compensation analysis based on targeted career classifications:</p>
                      
                      <div className="salary-cards" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(255, 255, 255, 0.4)", padding: "14px 20px", borderRadius: "12px", border: "1px solid var(--glass-border)" }}>
                          <span className="text-caption">Entry Level Scale</span>
                          <strong style={{ fontSize: "1.1rem", color: "var(--color-navy)" }}>{analysisData.top_careers?.[0]?.salary_entry ?? "N/A"}</strong>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(255, 255, 255, 0.65)", padding: "16px 20px", borderRadius: "12px", border: "1px solid var(--glass-border-hover)" }}>
                          <span className="text-caption">Median Market Scale</span>
                          <strong style={{ fontSize: "1.2rem", color: "var(--color-navy)" }}>{analysisData.top_careers?.[0]?.salary_avg ?? "N/A"}</strong>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(255, 255, 255, 0.4)", padding: "14px 20px", borderRadius: "12px", border: "1px solid var(--glass-border)" }}>
                          <span className="text-caption">Senior Specialist Scale</span>
                          <strong style={{ fontSize: "1.1rem", color: "var(--color-navy)" }}>{analysisData.top_careers?.[0]?.salary_senior ?? "N/A"}</strong>
                        </div>
                      </div>
                    </GlassCard>

                    <GlassCard>
                      <h3 className="text-title" style={{ fontSize: "1rem", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}><Compass size={16} /> Long-Term Career Timeline Path</h3>
                      <p className="text-small" style={{ color: "var(--text-secondary)", marginBottom: "20px" }}>Predicted promotional progression steps:</p>
                      
                      <div className="career-timeline-path" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        {analysisData.career_timeline?.length > 0 ? (
                          analysisData.career_timeline.map((step, i) => (
                            <div key={i} style={{ display: "flex", gap: "14px", alignItems: "center", background: "rgba(255, 255, 255, 0.4)", padding: "14px 20px", borderRadius: "12px", border: "1px solid var(--glass-border)" }}>
                              <span className="text-caption" style={{ fontWeight: "700" }}>Step {i + 1}</span>
                              <span style={{ fontSize: "0.95rem", color: "var(--color-navy)", fontWeight: "600" }}>{step}</span>
                            </div>
                          ))
                        ) : (
                          <p className="text-small text-muted">Timeline progression path details are missing.</p>
                        )}
                      </div>
                    </GlassCard>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </motion.div>
  );
}

export default ResumePage;
