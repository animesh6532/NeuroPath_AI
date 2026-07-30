import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { AppContext } from "../contexts/AppContext";
import { profileAPI } from "../api/endpoints";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, Award, Briefcase, ShieldAlert, Plus, X, 
  Calendar, FileText, CheckCircle2, Loader2, Sparkles,
  MapPin, Globe, Download, Edit3,
  BookOpen, Terminal, Settings, Lock, Bell, Sun, Moon, Eye, Check
} from "lucide-react";

const Github = ({ size = 16, className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const Linkedin = ({ size = 16, className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

import { GlassCard, GlassButton, GlassBadge } from "../components/ui/DesignSystem";
import "./Profile.css";

const safeArr = (v) => (Array.isArray(v) ? v : []);
const safeStr = (v, fallback = "") => (typeof v === "string" ? v : fallback);

function Profile() {
  const { user } = useContext(AuthContext);
  const {
    analysisData,
    recentUpload,
    userProfile,
    replaceUserProfile,
  } = useContext(AppContext);

  const [activeModal, setActiveModal] = useState(null); // 'header', 'about', 'academic', 'projects', 'certifications', 'work', 'goals', 'settings'
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [profileLoading, setProfileLoading] = useState(true);

  // Expanded form data covering all sections
  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    profile_image: "",
    cover_image: "",
    custom_skills: [],
    career_title: "",
    current_status: "",
    current_org: "",
    github: "",
    linkedin: "",
    portfolio: "",
    career_objective: "",
    interests: "",
    passion: "",
    languages: [],
    soft_skills: [],
    education: [],
    achievements: [],
    projects: [],
    certifications: [],
    work_experience: [],
    career_goals: { target_role: "", dream_company: "", preferred_domain: "", learning_focus: "" },
    settings: { theme: "light", notifications: true, privacy: "public" },
    verified: false
  });

  const email = safeStr(user?.email, "user@example.com");
  const defaultName = email.split("@")[0];
  const initial = email.charAt(0).toUpperCase();

  // Populate data from context userProfile
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setProfileLoading(true);
        const res = await profileAPI.getProfile(email);
        if (cancelled) return;
        const data = res?.data;
        if (data && typeof data === "object") {
          replaceUserProfile(data);
          updateFormFields(data);
        }
      } catch (err) {
        console.warn("[Profile] fetch error:", err?.message ?? err);
      } finally {
        if (!cancelled) setProfileLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [email]);

  useEffect(() => {
    if (userProfile && typeof userProfile === "object") {
      updateFormFields(userProfile);
    }
  }, [userProfile]);

  const updateFormFields = (data) => {
    setFormData({
      name: safeStr(data.name),
      bio: safeStr(data.bio),
      profile_image: safeStr(data.profile_image),
      cover_image: safeStr(data.cover_image),
      custom_skills: safeArr(data.custom_skills),
      career_title: safeStr(data.career_title),
      current_status: safeStr(data.current_status),
      current_org: safeStr(data.current_org),
      github: safeStr(data.github),
      linkedin: safeStr(data.linkedin),
      portfolio: safeStr(data.portfolio),
      career_objective: safeStr(data.career_objective),
      interests: safeStr(data.interests),
      passion: safeStr(data.passion),
      languages: safeArr(data.languages),
      soft_skills: safeArr(data.soft_skills),
      education: safeArr(data.education),
      achievements: safeArr(data.achievements),
      projects: safeArr(data.projects),
      certifications: safeArr(data.certifications),
      work_experience: safeArr(data.work_experience),
      career_goals: data.career_goals && typeof data.career_goals === "object" ? {
        target_role: safeStr(data.career_goals.target_role),
        dream_company: safeStr(data.career_goals.dream_company),
        preferred_domain: safeStr(data.career_goals.preferred_domain),
        learning_focus: safeStr(data.career_goals.learning_focus)
      } : { target_role: "", dream_company: "", preferred_domain: "", learning_focus: "" },
      settings: data.settings && typeof data.settings === "object" ? {
        theme: safeStr(data.settings.theme, "light"),
        notifications: data.settings.notifications !== false,
        privacy: safeStr(data.settings.privacy, "public")
      } : { theme: "light", notifications: true, privacy: "public" },
      verified: !!data.verified
    });
  };

  const handleImageUpload = (e, field) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({ ...prev, [field]: reader.result ?? "" }));
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async (updatedData = formData) => {
    setSaveError("");
    setIsSaving(true);
    const payload = { ...updatedData, email };

    try {
      const res = await profileAPI.updateProfile(payload);
      const saved = res?.data && typeof res.data === "object" ? res.data : payload;
      replaceUserProfile(saved);
      try { localStorage.setItem("user_profile", JSON.stringify(saved)); } catch {}
      setActiveModal(null);
    } catch (err) {
      console.error("[Profile] save failed:", err);
      setSaveError(err?.response?.data?.message ?? err?.message ?? "Failed to save profile.");
    } finally {
      setIsSaving(false);
    }
  };

  // Printing page to PDF for Simulated Resume Download
  const handleDownloadCV = () => {
    window.print();
  };

  if (!user) {
    return (
      <div className="page-container profile-page">
        <GlassCard className="empty-card" style={{ maxWidth: "500px", margin: "40px auto", textAlign: "center" }}>
          <ShieldAlert size={40} className="text-danger" style={{ marginBottom: "20px", margin: "0 auto" }} />
          <h2>Access Denied</h2>
          <p className="text-small">Please log in to view your profile dashboard settings.</p>
        </GlassCard>
      </div>
    );
  }

  if (profileLoading) {
    return (
      <div className="page-container profile-page" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <GlassCard className="empty-card" style={{ textAlign: "center" }}>
          <Loader2 size={32} className="icon-spin text-secondary" style={{ marginBottom: "16px", margin: "0 auto" }} />
          <p>Loading professional profile...</p>
        </GlassCard>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="profile-page"
    >
      <div className="profile-main-layout">
        
        {/* LEFT COLUMN: Main Profile Sections */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          
          {/* PROFILE HEADER GLASS CARD */}
          <div className="profile-card-header">
            <div className="profile-cover-wrap">
              {formData.cover_image ? (
                <img src={formData.cover_image} alt="Cover" className="profile-cover-img" />
              ) : (
                <div className="profile-cover-img" />
              )}
            </div>
            
            <div className="profile-avatar-wrap">
              {formData.profile_image ? (
                <img src={formData.profile_image} alt="Profile" className="profile-avatar-img" />
              ) : (
                <div className="profile-avatar-fallback">{initial}</div>
              )}
            </div>
            
            <button className="section-edit-btn" onClick={() => setActiveModal("header")}>
              <Edit3 size={14} /> Edit Header
            </button>

            <div className="profile-meta-info">
              <div className="profile-title-row">
                <div>
                  <h1 className="profile-name">
                    {formData.name || defaultName}
                    {formData.verified && <CheckCircle2 size={18} className="verified-badge-icon" />}
                  </h1>
                  <p className="profile-headline">
                    {formData.career_title || "Professional Developer"} 
                    {formData.current_org && ` at ${formData.current_org}`}
                  </p>
                  
                  <div className="profile-domain-tag">
                    <Sparkles size={14} />
                    Domain: {analysisData?.best_domain || "Software Engineering"}
                  </div>
                </div>

                <div style={{ display: "flex", gap: "10px" }}>
                  <GlassButton onClick={handleDownloadCV}>
                    <Download size={14} /> Download CV
                  </GlassButton>
                </div>
              </div>

              <div className="profile-meta-details">
                {formData.current_status && (
                  <div className="profile-meta-item">
                    <Briefcase size={14} /> {formData.current_status}
                  </div>
                )}
                {email && (
                  <div className="profile-meta-item">
                    <FileText size={14} /> {email}
                  </div>
                )}
                {recentUpload && (
                  <div className="profile-meta-item">
                    <Award size={14} /> CV: {recentUpload}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ABOUT SECTION */}
          <div className="profile-card-section">
            <button className="section-edit-btn" onClick={() => setActiveModal("about")}>
              <Edit3 size={14} /> Edit About
            </button>
            <h2 className="text-title" style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "1.2rem", margin: "0 0 16px 0" }}>
              <User size={18} /> About & Objective
            </h2>
            
            {formData.career_objective ? (
              <p className="text-body" style={{ fontWeight: 600, color: "var(--color-navy)" }}>{formData.career_objective}</p>
            ) : (
              <p className="text-muted text-small">Add a professional career objective...</p>
            )}
            
            {formData.bio && (
              <p className="text-body" style={{ marginTop: "12px", borderTop: "1px solid rgba(0,0,42,0.05)", paddingTop: "12px" }}>{formData.bio}</p>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginTop: "20px" }}>
              <div>
                <strong className="text-caption" style={{ display: "block", marginBottom: "6px" }}>Soft Skills</strong>
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                  {formData.soft_skills.length > 0 ? (
                    formData.soft_skills.map((s, idx) => <GlassBadge key={idx} status="success">{s}</GlassBadge>)
                  ) : (
                    <span className="text-muted text-small">No soft skills added.</span>
                  )}
                </div>
              </div>
              <div>
                <strong className="text-caption" style={{ display: "block", marginBottom: "6px" }}>Languages</strong>
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                  {formData.languages.length > 0 ? (
                    formData.languages.map((l, idx) => <GlassBadge key={idx}>{l}</GlassBadge>)
                  ) : (
                    <span className="text-muted text-small">No languages added.</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* WORK EXPERIENCE */}
          <div className="profile-card-section">
            <button className="section-edit-btn" onClick={() => setActiveModal("work")}>
              <Edit3 size={14} /> Edit Experience
            </button>
            <h2 className="text-title" style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "1.2rem", margin: "0 0 16px 0" }}>
              <Briefcase size={18} /> Work Experience
            </h2>
            
            {formData.work_experience.length > 0 ? (
              <div className="work-experience-list">
                {formData.work_experience.map((exp, idx) => (
                  <div key={idx} className="experience-card">
                    <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", marginBottom: "6px" }}>
                      <strong style={{ color: "var(--color-navy)", fontSize: "1.05rem" }}>{exp.role}</strong>
                      <span className="text-caption" style={{ fontWeight: "600" }}>{exp.duration}</span>
                    </div>
                    <div className="text-small" style={{ color: "var(--text-secondary)", marginBottom: "8px", fontWeight: "600" }}>
                      {exp.company}
                    </div>
                    <p className="text-body" style={{ margin: "0 0 10px 0" }}>{exp.responsibilities}</p>
                    {exp.technologies && (
                      <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                        {exp.technologies.split(",").map((tech, tIdx) => (
                          <GlassBadge key={tIdx} status="secondary">{tech.trim()}</GlassBadge>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted text-small">Add your professional work experience history...</p>
            )}
          </div>

          {/* ACADEMIC JOURNEY */}
          <div className="profile-card-section">
            <button className="section-edit-btn" onClick={() => setActiveModal("academic")}>
              <Edit3 size={14} /> Edit Journey
            </button>
            <h2 className="text-title" style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "1.2rem", margin: "0 0 16px 0" }}>
              <BookOpen size={18} /> Academic Journey
            </h2>

            {formData.education.length > 0 ? (
              <div className="academic-timeline">
                {formData.education.map((edu, idx) => (
                  <div key={idx} className="timeline-card">
                    <div className="timeline-dot" />
                    <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap" }}>
                      <strong style={{ color: "var(--color-navy)" }}>{edu.degree}</strong>
                      <span className="text-caption" style={{ fontWeight: "600" }}>{edu.year}</span>
                    </div>
                    <div className="text-small" style={{ color: "var(--text-secondary)", margin: "2px 0 6px 0" }}>
                      {edu.college}
                    </div>
                    {edu.cgpa && (
                      <GlassBadge status="success">CGPA: {edu.cgpa}</GlassBadge>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted text-small">Log your educational trajectory and accomplishments...</p>
            )}
          </div>

          {/* PROJECT PORTFOLIO */}
          <div className="profile-card-section">
            <button className="section-edit-btn" onClick={() => setActiveModal("projects")}>
              <Edit3 size={14} /> Edit Projects
            </button>
            <h2 className="text-title" style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "1.2rem", margin: "0 0 16px 0" }}>
              <Terminal size={18} /> Practical Projects
            </h2>

            {formData.projects.length > 0 ? (
              <div className="projects-grid">
                {formData.projects.map((proj, idx) => (
                  <div key={idx} className="project-card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                        <strong style={{ color: "var(--color-navy)", fontSize: "1rem" }}>{proj.name}</strong>
                        {proj.status && <GlassBadge status={proj.status === "Completed" ? "success" : "secondary"}>{proj.status}</GlassBadge>}
                      </div>
                      <p className="text-small" style={{ color: "var(--text-secondary)", margin: "0 0 10px 0", minHeight: "45px" }}>{proj.description}</p>
                    </div>

                    <div>
                      {proj.technologies && (
                        <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", marginBottom: "12px" }}>
                          {proj.technologies.split(",").map((t, tIdx) => (
                            <span key={tIdx} style={{ fontSize: "0.75rem", background: "rgba(0,0,42,0.04)", padding: "2px 6px", borderRadius: "4px", color: "var(--color-navy)" }}>{t.trim()}</span>
                          ))}
                        </div>
                      )}

                      <div style={{ display: "flex", gap: "10px", borderTop: "1px solid rgba(0,0,42,0.05)", paddingTop: "8px" }}>
                        {proj.github && (
                          <a href={proj.github} target="_blank" rel="noopener noreferrer" className="text-caption" style={{ display: "flex", alignItems: "center", gap: "4px", textDecoration: "none", color: "var(--soft-accent)" }}>
                            <Github size={12} /> Repo
                          </a>
                        )}
                        {proj.live_demo && (
                          <a href={proj.live_demo} target="_blank" rel="noopener noreferrer" className="text-caption" style={{ display: "flex", alignItems: "center", gap: "4px", textDecoration: "none", color: "var(--soft-accent)" }}>
                            <Globe size={12} /> Live
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted text-small">Showcase your coding projects portfolio...</p>
            )}
          </div>

          {/* CERTIFICATIONS */}
          <div className="profile-card-section">
            <button className="section-edit-btn" onClick={() => setActiveModal("certifications")}>
              <Edit3 size={14} /> Edit Certifications
            </button>
            <h2 className="text-title" style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "1.2rem", margin: "0 0 16px 0" }}>
              <Award size={18} /> Credentials & Certifications
            </h2>

            {formData.certifications.length > 0 ? (
              <div className="certifications-grid">
                {formData.certifications.map((cert, idx) => (
                  <div key={idx} className="cert-card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                    <div>
                      <strong style={{ color: "var(--color-navy)", fontSize: "0.95rem", display: "block" }}>{cert.credential}</strong>
                      <span className="text-small" style={{ color: "var(--text-secondary)", fontWeight: "600", display: "block", marginTop: "2px" }}>{cert.issuer}</span>
                      <span className="text-caption" style={{ display: "block", marginTop: "4px" }}>Issued: {cert.date}</span>
                    </div>

                    {cert.url && (
                      <a href={cert.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", marginTop: "12px", display: "inline-block" }}>
                        <GlassButton style={{ padding: "4px 10px", fontSize: "0.75rem", width: "100%" }}>Verify Link</GlassButton>
                      </a>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted text-small">Add industry credentials or online certifications...</p>
            )}
          </div>

          {/* ACHIEVEMENTS */}
          <div className="profile-card-section">
            <button className="section-edit-btn" onClick={() => setActiveModal("achievements")}>
              <Edit3 size={14} /> Edit Achievements
            </button>
            <h2 className="text-title" style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "1.2rem", margin: "0 0 16px 0" }}>
              <Award size={18} /> Honors & Achievements
            </h2>

            {formData.achievements.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "16px" }}>
                {formData.achievements.map((ach, idx) => (
                  <div key={idx} style={{ padding: "14px 18px", background: "rgba(255, 255, 255, 0.4)", border: "1px solid var(--glass-border)", borderRadius: "12px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <strong style={{ color: "var(--color-navy)", fontSize: "0.95rem" }}>{ach.title}</strong>
                      <span className="text-caption" style={{ fontSize: "0.8rem", fontWeight: "600" }}>{ach.date}</span>
                    </div>
                    {ach.description && (
                      <p className="text-body" style={{ margin: "6px 0 0 0", fontSize: "0.9rem", color: "var(--text-secondary)" }}>{ach.description}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted text-small">Add your academic honors, hackathon placements, or corporate awards...</p>
            )}
          </div>

        </div>

        {/* RIGHT COLUMN: Sidebar Cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          
          {/* SOCIAL LINKS */}
          <div className="profile-card-section">
            <h3 className="text-title" style={{ fontSize: "1rem", margin: "0 0 16px 0" }}>Social Handles</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <a href={formData.github || "#"} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none", color: "var(--color-navy)", fontSize: "0.9rem" }}>
                <Github size={16} className="text-secondary" /> 
                <span>{formData.github ? "GitHub Profile" : "Add GitHub..."}</span>
              </a>
              <a href={formData.linkedin || "#"} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none", color: "var(--color-navy)", fontSize: "0.9rem" }}>
                <Linkedin size={16} className="text-secondary" /> 
                <span>{formData.linkedin ? "LinkedIn Connect" : "Add LinkedIn..."}</span>
              </a>
              <a href={formData.portfolio || "#"} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none", color: "var(--color-navy)", fontSize: "0.9rem" }}>
                <Globe size={16} className="text-secondary" /> 
                <span>{formData.portfolio ? "Personal Portfolio" : "Add Portfolio..."}</span>
              </a>
            </div>
          </div>

          {/* CAREER GOALS */}
          <div className="profile-card-section">
            <button className="section-edit-btn" onClick={() => setActiveModal("goals")} style={{ top: 16, right: 16 }}>
              <Edit3 size={12} /> Edit
            </button>
            <h3 className="text-title" style={{ fontSize: "1rem", margin: "0 0 16px 0" }}>Career Targets</h3>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <span className="text-caption" style={{ display: "block" }}>Target Role</span>
                <strong style={{ fontSize: "0.9rem", color: "var(--color-navy)" }}>{formData.career_goals.target_role || "Not Specified"}</strong>
              </div>
              <div>
                <span className="text-caption" style={{ display: "block" }}>Dream Company</span>
                <strong style={{ fontSize: "0.9rem", color: "var(--color-navy)" }}>{formData.career_goals.dream_company || "Not Specified"}</strong>
              </div>
              <div>
                <span className="text-caption" style={{ display: "block" }}>Preferred Domain</span>
                <strong style={{ fontSize: "0.9rem", color: "var(--color-navy)" }}>{formData.career_goals.preferred_domain || "Not Specified"}</strong>
              </div>
              <div>
                <span className="text-caption" style={{ display: "block" }}>Learning Focus</span>
                <strong style={{ fontSize: "0.9rem", color: "var(--color-navy)" }}>{formData.career_goals.learning_focus || "Not Specified"}</strong>
              </div>
            </div>
          </div>

          {/* CUSTOM SKILLS */}
          <div className="profile-card-section">
            <h3 className="text-title" style={{ fontSize: "1rem", margin: "0 0 16px 0" }}>Key Skills Inventory</h3>
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
              {safeArr(analysisData?.detected_skills).map((s, idx) => (
                <GlassBadge key={idx}>{s}</GlassBadge>
              ))}
              {formData.custom_skills.map((s, idx) => (
                <GlassBadge key={`c-${idx}`} status="secondary">{s}</GlassBadge>
              ))}
              {safeArr(analysisData?.detected_skills).length === 0 && formData.custom_skills.length === 0 && (
                <span className="text-muted text-small">Upload resume to detect skills.</span>
              )}
            </div>
          </div>

          {/* PROFILE SETTINGS */}
          <div className="profile-card-section">
            <button className="section-edit-btn" onClick={() => setActiveModal("settings")} style={{ top: 16, right: 16 }}>
              <Settings size={12} /> Edit
            </button>
            <h3 className="text-title" style={{ fontSize: "1rem", margin: "0 0 16px 0" }}>Account Options</h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div className="settings-toggle-row">
                <span className="text-caption" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  {formData.settings.theme === "dark" ? <Moon size={14} /> : <Sun size={14} />} Theme Mode
                </span>
                <span style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--color-navy)" }}>
                  {formData.settings.theme.toUpperCase()}
                </span>
              </div>
              <div className="settings-toggle-row">
                <span className="text-caption" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <Bell size={14} /> Notifications
                </span>
                <span style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--color-navy)" }}>
                  {formData.settings.notifications ? "ACTIVE" : "MUTED"}
                </span>
              </div>
              <div className="settings-toggle-row">
                <span className="text-caption" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <Eye size={14} /> Privacy Visibility
                </span>
                <span style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--color-navy)" }}>
                  {formData.settings.privacy.toUpperCase()}
                </span>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* EDITING MODALS MANAGER */}
      <AnimatePresence>
        {activeModal && (
          <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget && !isSaving) setActiveModal(null); }} style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,42,0.12)", backdropFilter: "blur(6px)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1100, padding: "20px" }}>
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="modal-content glass-card" 
              style={{ width: "100%", maxWidth: "600px", maxHeight: "90vh", overflowY: "auto", position: "relative", background: "var(--glass-bg)", padding: "32px", borderRadius: "24px" }}
            >
              <button type="button" onClick={() => { if (!isSaving) setActiveModal(null); }} style={{ position: "absolute", top: "16px", right: "16px", background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer" }}>
                <X size={18} />
              </button>

              {saveError && (
                <div className="warning-banner" style={{ marginBottom: "16px", background: "rgba(239,68,68,0.1)", border: "1px solid #ef4444", borderRadius: "8px", padding: "10px 14px", color: "#991b1b", fontSize: "0.85rem" }}>
                  {saveError}
                </div>
              )}

              {/* 1. HEADER MODAL */}
              {activeModal === "header" && (
                <div>
                  <h2>Edit Profile Header</h2>
                  <p className="text-small" style={{ marginBottom: "20px" }}>Configure your personal branding details.</p>
                  
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <div className="form-grid-2">
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        <label className="text-caption">Full Name</label>
                        <input type="text" className="glass-input-v6" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} style={{ padding: 8, borderRadius: 8, border: "1px solid var(--glass-border)" }} />
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        <label className="text-caption">Career Title / Headline</label>
                        <input type="text" className="glass-input-v6" value={formData.career_title} onChange={(e) => setFormData({...formData, career_title: e.target.value})} placeholder="e.g. Senior Software Architect" style={{ padding: 8, borderRadius: 8, border: "1px solid var(--glass-border)" }} />
                      </div>
                    </div>

                    <div className="form-grid-2">
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        <label className="text-caption">Current Status</label>
                        <input type="text" className="glass-input-v6" value={formData.current_status} onChange={(e) => setFormData({...formData, current_status: e.target.value})} placeholder="e.g. Open to Opportunities" style={{ padding: 8, borderRadius: 8, border: "1px solid var(--glass-border)" }} />
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        <label className="text-caption">Current Organization</label>
                        <input type="text" className="glass-input-v6" value={formData.current_org} onChange={(e) => setFormData({...formData, current_org: e.target.value})} style={{ padding: 8, borderRadius: 8, border: "1px solid var(--glass-border)" }} />
                      </div>
                    </div>

                    <div className="form-grid-2">
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        <label className="text-caption">GitHub Link</label>
                        <input type="text" className="glass-input-v6" value={formData.github} onChange={(e) => setFormData({...formData, github: e.target.value})} placeholder="https://github.com/..." style={{ padding: 8, borderRadius: 8, border: "1px solid var(--glass-border)" }} />
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        <label className="text-caption">LinkedIn Link</label>
                        <input type="text" className="glass-input-v6" value={formData.linkedin} onChange={(e) => setFormData({...formData, linkedin: e.target.value})} placeholder="https://linkedin.com/in/..." style={{ padding: 8, borderRadius: 8, border: "1px solid var(--glass-border)" }} />
                      </div>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      <label className="text-caption">Portfolio Website</label>
                      <input type="text" className="glass-input-v6" value={formData.portfolio} onChange={(e) => setFormData({...formData, portfolio: e.target.value})} placeholder="https://..." style={{ padding: 8, borderRadius: 8, border: "1px solid var(--glass-border)" }} />
                    </div>

                    <div className="form-grid-2">
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        <label className="text-caption">Profile Image</label>
                        <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, "profile_image")} style={{ fontSize: "0.85rem" }} />
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        <label className="text-caption">Cover Image</label>
                        <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, "cover_image")} style={{ fontSize: "0.85rem" }} />
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "8px" }}>
                      <input type="checkbox" checked={formData.verified} onChange={(e) => setFormData({...formData, verified: e.target.checked})} style={{ width: 16, height: 16 }} />
                      <label className="text-caption" style={{ margin: 0 }}>Show Verified Professional Badge</label>
                    </div>
                  </div>
                </div>
              )}

              {/* 2. ABOUT MODAL */}
              {activeModal === "about" && (
                <div>
                  <h2>Edit About & Skills</h2>
                  <p className="text-small" style={{ marginBottom: "20px" }}>Share your background, objectives, and skills.</p>
                  
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      <label className="text-caption">Career Objective</label>
                      <input type="text" className="glass-input-v6" value={formData.career_objective} onChange={(e) => setFormData({...formData, career_objective: e.target.value})} placeholder="e.g. Seeking AI architect roles..." style={{ padding: 8, borderRadius: 8, border: "1px solid var(--glass-border)" }} />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      <label className="text-caption">Professional Bio Summary</label>
                      <textarea className="glass-input-v6" value={formData.bio} onChange={(e) => setFormData({...formData, bio: e.target.value})} rows="4" style={{ padding: 8, borderRadius: 8, border: "1px solid var(--glass-border)", resize: "none" }} />
                    </div>

                    <div className="form-grid-2">
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        <label className="text-caption">Languages (comma separated)</label>
                        <input type="text" className="glass-input-v6" value={formData.languages.join(", ")} onChange={(e) => setFormData({...formData, languages: e.target.value.split(",").map(x => x.trim()).filter(Boolean)})} style={{ padding: 8, borderRadius: 8, border: "1px solid var(--glass-border)" }} />
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        <label className="text-caption">Soft Skills (comma separated)</label>
                        <input type="text" className="glass-input-v6" value={formData.soft_skills.join(", ")} onChange={(e) => setFormData({...formData, soft_skills: e.target.value.split(",").map(x => x.trim()).filter(Boolean)})} style={{ padding: 8, borderRadius: 8, border: "1px solid var(--glass-border)" }} />
                      </div>
                    </div>

                    {/* Custom skills tagging */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      <label className="text-caption">Add Custom Technical Skills (comma separated)</label>
                      <input type="text" className="glass-input-v6" value={formData.custom_skills.join(", ")} onChange={(e) => setFormData({...formData, custom_skills: e.target.value.split(",").map(x => x.trim()).filter(Boolean)})} style={{ padding: 8, borderRadius: 8, border: "1px solid var(--glass-border)" }} />
                    </div>
                  </div>
                </div>
              )}

              {/* 3. EXPERIENCE MODAL */}
              {activeModal === "work" && (
                <div>
                  <h2>Edit Work Experience</h2>
                  <p className="text-small" style={{ marginBottom: "20px" }}>Log your corporate or freelance history.</p>
                  
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    {formData.work_experience.map((w, idx) => (
                      <div key={idx} className="form-item-block">
                        <button type="button" onClick={() => {
                          const updated = formData.work_experience.filter((_, i) => i !== idx);
                          setFormData({ ...formData, work_experience: updated });
                        }} style={{ position: "absolute", top: 0, right: 0, background: "none", border: "none", color: "var(--text-danger)", cursor: "pointer" }}><X size={16} /></button>
                        
                        <div className="form-grid-2">
                          <input type="text" className="glass-input-v6" placeholder="Job Role" value={w.role} onChange={(e) => {
                            const updated = [...formData.work_experience];
                            updated[idx].role = e.target.value;
                            setFormData({...formData, work_experience: updated});
                          }} style={{ padding: 6, borderRadius: 8, border: "1px solid var(--glass-border)" }} />
                          <input type="text" className="glass-input-v6" placeholder="Duration (e.g. 2024 - Present)" value={w.duration} onChange={(e) => {
                            const updated = [...formData.work_experience];
                            updated[idx].duration = e.target.value;
                            setFormData({...formData, work_experience: updated});
                          }} style={{ padding: 6, borderRadius: 8, border: "1px solid var(--glass-border)" }} />
                        </div>
                        <input type="text" className="glass-input-v6" placeholder="Company Name" value={w.company} onChange={(e) => {
                          const updated = [...formData.work_experience];
                          updated[idx].company = e.target.value;
                          setFormData({...formData, work_experience: updated});
                        }} style={{ padding: 6, borderRadius: 8, border: "1px solid var(--glass-border)" }} />
                        <textarea className="glass-input-v6" placeholder="Responsibilities" value={w.responsibilities} onChange={(e) => {
                          const updated = [...formData.work_experience];
                          updated[idx].responsibilities = e.target.value;
                          setFormData({...formData, work_experience: updated});
                        }} rows="2" style={{ padding: 6, borderRadius: 8, border: "1px solid var(--glass-border)", resize: "none" }} />
                        <input type="text" className="glass-input-v6" placeholder="Technologies (comma separated)" value={w.technologies} onChange={(e) => {
                          const updated = [...formData.work_experience];
                          updated[idx].technologies = e.target.value;
                          setFormData({...formData, work_experience: updated});
                        }} style={{ padding: 6, borderRadius: 8, border: "1px solid var(--glass-border)" }} />
                      </div>
                    ))}

                    <GlassButton onClick={() => setFormData({
                      ...formData,
                      work_experience: [...formData.work_experience, { role: "", company: "", duration: "", responsibilities: "", technologies: "" }]
                    })}>
                      <Plus size={14} /> Add Role
                    </GlassButton>
                  </div>
                </div>
              )}

              {/* 4. ACADEMIC JOURNEY MODAL */}
              {activeModal === "academic" && (
                <div>
                  <h2>Edit Academic Journey</h2>
                  <p className="text-small" style={{ marginBottom: "20px" }}>Log your institutional history and degrees.</p>
                  
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    {formData.education.map((edu, idx) => (
                      <div key={idx} className="form-item-block">
                        <button type="button" onClick={() => {
                          const updated = formData.education.filter((_, i) => i !== idx);
                          setFormData({ ...formData, education: updated });
                        }} style={{ position: "absolute", top: 0, right: 0, background: "none", border: "none", color: "var(--text-danger)", cursor: "pointer" }}><X size={16} /></button>
                        
                        <div className="form-grid-2">
                          <input type="text" className="glass-input-v6" placeholder="Degree / Program" value={edu.degree} onChange={(e) => {
                            const updated = [...formData.education];
                            updated[idx].degree = e.target.value;
                            setFormData({...formData, education: updated});
                          }} style={{ padding: 6, borderRadius: 8, border: "1px solid var(--glass-border)" }} />
                          <input type="text" className="glass-input-v6" placeholder="Graduation Year" value={edu.year} onChange={(e) => {
                            const updated = [...formData.education];
                            updated[idx].year = e.target.value;
                            setFormData({...formData, education: updated});
                          }} style={{ padding: 6, borderRadius: 8, border: "1px solid var(--glass-border)" }} />
                        </div>
                        <input type="text" className="glass-input-v6" placeholder="College / University" value={edu.college} onChange={(e) => {
                          const updated = [...formData.education];
                          updated[idx].college = e.target.value;
                          setFormData({...formData, education: updated});
                        }} style={{ padding: 6, borderRadius: 8, border: "1px solid var(--glass-border)" }} />
                        <input type="text" className="glass-input-v6" placeholder="GPA / Grade" value={edu.cgpa} onChange={(e) => {
                          const updated = [...formData.education];
                          updated[idx].cgpa = e.target.value;
                          setFormData({...formData, education: updated});
                        }} style={{ padding: 6, borderRadius: 8, border: "1px solid var(--glass-border)" }} />
                      </div>
                    ))}

                    <GlassButton onClick={() => setFormData({
                      ...formData,
                      education: [...formData.education, { degree: "", year: "", college: "", cgpa: "" }]
                    })}>
                      <Plus size={14} /> Add Education
                    </GlassButton>
                  </div>
                </div>
              )}

              {/* 5. PROJECTS MODAL */}
              {activeModal === "projects" && (
                <div>
                  <h2>Edit Practical Projects</h2>
                  <p className="text-small" style={{ marginBottom: "20px" }}>Update your engineering portfolio directory.</p>
                  
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    {formData.projects.map((proj, idx) => (
                      <div key={idx} className="form-item-block">
                        <button type="button" onClick={() => {
                          const updated = formData.projects.filter((_, i) => i !== idx);
                          setFormData({ ...formData, projects: updated });
                        }} style={{ position: "absolute", top: 0, right: 0, background: "none", border: "none", color: "var(--text-danger)", cursor: "pointer" }}><X size={16} /></button>
                        
                        <div className="form-grid-2">
                          <input type="text" className="glass-input-v6" placeholder="Project Name" value={proj.name} onChange={(e) => {
                            const updated = [...formData.projects];
                            updated[idx].name = e.target.value;
                            setFormData({...formData, projects: updated});
                          }} style={{ padding: 6, borderRadius: 8, border: "1px solid var(--glass-border)" }} />
                          <select className="glass-input-v6" value={proj.status} onChange={(e) => {
                            const updated = [...formData.projects];
                            updated[idx].status = e.target.value;
                            setFormData({...formData, projects: updated});
                          }} style={{ padding: 6, borderRadius: 8, border: "1px solid var(--glass-border)" }}>
                            <option value="Completed">Completed</option>
                            <option value="In Progress">In Progress</option>
                          </select>
                        </div>
                        <input type="text" className="glass-input-v6" placeholder="Description" value={proj.description} onChange={(e) => {
                          const updated = [...formData.projects];
                          updated[idx].description = e.target.value;
                          setFormData({...formData, projects: updated});
                        }} style={{ padding: 6, borderRadius: 8, border: "1px solid var(--glass-border)" }} />
                        <input type="text" className="glass-input-v6" placeholder="Technologies (comma separated)" value={proj.technologies} onChange={(e) => {
                          const updated = [...formData.projects];
                          updated[idx].technologies = e.target.value;
                          setFormData({...formData, projects: updated});
                        }} style={{ padding: 6, borderRadius: 8, border: "1px solid var(--glass-border)" }} />
                        <div className="form-grid-2">
                          <input type="text" className="glass-input-v6" placeholder="GitHub Repository URL" value={proj.github} onChange={(e) => {
                            const updated = [...formData.projects];
                            updated[idx].github = e.target.value;
                            setFormData({...formData, projects: updated});
                          }} style={{ padding: 6, borderRadius: 8, border: "1px solid var(--glass-border)" }} />
                          <input type="text" className="glass-input-v6" placeholder="Live Demo Link" value={proj.live_demo} onChange={(e) => {
                            const updated = [...formData.projects];
                            updated[idx].live_demo = e.target.value;
                            setFormData({...formData, projects: updated});
                          }} style={{ padding: 6, borderRadius: 8, border: "1px solid var(--glass-border)" }} />
                        </div>
                      </div>
                    ))}

                    <GlassButton onClick={() => setFormData({
                      ...formData,
                      projects: [...formData.projects, { name: "", status: "Completed", description: "", technologies: "", github: "", live_demo: "" }]
                    })}>
                      <Plus size={14} /> Add Project
                    </GlassButton>
                  </div>
                </div>
              )}

              {/* 6. CERTIFICATIONS MODAL */}
              {activeModal === "certifications" && (
                <div>
                  <h2>Edit Certifications</h2>
                  <p className="text-small" style={{ marginBottom: "20px" }}>Manage your verify links and credential issuers.</p>
                  
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    {formData.certifications.map((cert, idx) => (
                      <div key={idx} className="form-item-block">
                        <button type="button" onClick={() => {
                          const updated = formData.certifications.filter((_, i) => i !== idx);
                          setFormData({ ...formData, certifications: updated });
                        }} style={{ position: "absolute", top: 0, right: 0, background: "none", border: "none", color: "var(--text-danger)", cursor: "pointer" }}><X size={16} /></button>
                        
                        <div className="form-grid-2">
                          <input type="text" className="glass-input-v6" placeholder="Credential Name" value={cert.credential} onChange={(e) => {
                            const updated = [...formData.certifications];
                            updated[idx].credential = e.target.value;
                            setFormData({...formData, certifications: updated});
                          }} style={{ padding: 6, borderRadius: 8, border: "1px solid var(--glass-border)" }} />
                          <input type="text" className="glass-input-v6" placeholder="Issue Date (e.g. Jan 2025)" value={cert.date} onChange={(e) => {
                            const updated = [...formData.certifications];
                            updated[idx].date = e.target.value;
                            setFormData({...formData, certifications: updated});
                          }} style={{ padding: 6, borderRadius: 8, border: "1px solid var(--glass-border)" }} />
                        </div>
                        <input type="text" className="glass-input-v6" placeholder="Issuer (e.g. AWS, Coursera)" value={cert.issuer} onChange={(e) => {
                          const updated = [...formData.certifications];
                          updated[idx].issuer = e.target.value;
                          setFormData({...formData, certifications: updated});
                        }} style={{ padding: 6, borderRadius: 8, border: "1px solid var(--glass-border)" }} />
                        <input type="text" className="glass-input-v6" placeholder="Verify Credential URL" value={cert.url} onChange={(e) => {
                          const updated = [...formData.certifications];
                          updated[idx].url = e.target.value;
                          setFormData({...formData, certifications: updated});
                        }} style={{ padding: 6, borderRadius: 8, border: "1px solid var(--glass-border)" }} />
                      </div>
                    ))}

                    <GlassButton onClick={() => setFormData({
                      ...formData,
                      certifications: [...formData.certifications, { credential: "", date: "", issuer: "", url: "" }]
                    })}>
                      <Plus size={14} /> Add Certificate
                    </GlassButton>
                  </div>
                </div>
              )}

              {/* 7. GOALS MODAL */}
              {activeModal === "goals" && (
                <div>
                  <h2>Edit Career Targets</h2>
                  <p className="text-small" style={{ marginBottom: "20px" }}>Pinpoint your career ambitions.</p>
                  
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      <label className="text-caption">Target Role</label>
                      <input type="text" className="glass-input-v6" value={formData.career_goals.target_role} onChange={(e) => setFormData({...formData, career_goals: {...formData.career_goals, target_role: e.target.value}})} placeholder="e.g. ML Platform Engineer" style={{ padding: 8, borderRadius: 8, border: "1px solid var(--glass-border)" }} />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      <label className="text-caption">Dream Target Company</label>
                      <input type="text" className="glass-input-v6" value={formData.career_goals.dream_company} onChange={(e) => setFormData({...formData, career_goals: {...formData.career_goals, dream_company: e.target.value}})} placeholder="e.g. Google DeepMind" style={{ padding: 8, borderRadius: 8, border: "1px solid var(--glass-border)" }} />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      <label className="text-caption">Preferred Domain</label>
                      <input type="text" className="glass-input-v6" value={formData.career_goals.preferred_domain} onChange={(e) => setFormData({...formData, career_goals: {...formData.career_goals, preferred_domain: e.target.value}})} placeholder="e.g. Distributed Infrastructure" style={{ padding: 8, borderRadius: 8, border: "1px solid var(--glass-border)" }} />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      <label className="text-caption">Current Learning Focus</label>
                      <input type="text" className="glass-input-v6" value={formData.career_goals.learning_focus} onChange={(e) => setFormData({...formData, career_goals: {...formData.career_goals, learning_focus: e.target.value}})} placeholder="e.g. Kubernetes, System Design" style={{ padding: 8, borderRadius: 8, border: "1px solid var(--glass-border)" }} />
                    </div>
                  </div>
                </div>
              )}

              {/* 8. SETTINGS MODAL */}
              {activeModal === "settings" && (
                <div>
                  <h2>Profile Settings</h2>
                  <p className="text-small" style={{ marginBottom: "20px" }}>Configure preferences and display controls.</p>
                  
                  <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <strong>Theme Layout Preference</strong>
                        <div className="text-caption">Adjust site-wide brightness profile.</div>
                      </div>
                      <select className="glass-input-v6" value={formData.settings.theme} onChange={(e) => setFormData({...formData, settings: {...formData.settings, theme: e.target.value}})} style={{ padding: 6, borderRadius: 8, border: "1px solid var(--glass-border)" }}>
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                      </select>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <strong>Email Notifications</strong>
                        <div className="text-caption">Mute/unmute proctoring alerts.</div>
                      </div>
                      <label className="switch-label">
                        <input type="checkbox" checked={formData.settings.notifications} onChange={(e) => setFormData({...formData, settings: {...formData.settings, notifications: e.target.checked}})} />
                        <span className="switch-slider" />
                      </label>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <strong>Profile Visibility</strong>
                        <div className="text-caption">Control public/private sharing.</div>
                      </div>
                      <select className="glass-input-v6" value={formData.settings.privacy} onChange={(e) => setFormData({...formData, settings: {...formData.settings, privacy: e.target.value}})} style={{ padding: 6, borderRadius: 8, border: "1px solid var(--glass-border)" }}>
                        <option value="public">Public</option>
                        <option value="private">Private</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* 9. ACHIEVEMENTS MODAL */}
              {activeModal === "achievements" && (
                <div>
                  <h2>Edit Achievements & Honors</h2>
                  <p className="text-small" style={{ marginBottom: "20px" }}>Log your competitive and academic milestones.</p>
                  
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    {formData.achievements.map((ach, idx) => (
                      <div key={idx} className="form-item-block" style={{ position: "relative" }}>
                        <button type="button" onClick={() => {
                          const updated = formData.achievements.filter((_, i) => i !== idx);
                          setFormData({ ...formData, achievements: updated });
                        }} style={{ position: "absolute", top: 0, right: 0, background: "none", border: "none", color: "var(--text-danger)", cursor: "pointer" }}><X size={16} /></button>
                        
                        <div className="form-grid-2">
                          <input type="text" className="glass-input-v6" placeholder="Achievement Title" value={ach.title} onChange={(e) => {
                            const updated = [...formData.achievements];
                            updated[idx].title = e.target.value;
                            setFormData({...formData, achievements: updated});
                          }} style={{ padding: 6, borderRadius: 8, border: "1px solid var(--glass-border)" }} />
                          <input type="text" className="glass-input-v6" placeholder="Date/Year" value={ach.date} onChange={(e) => {
                            const updated = [...formData.achievements];
                            updated[idx].date = e.target.value;
                            setFormData({...formData, achievements: updated});
                          }} style={{ padding: 6, borderRadius: 8, border: "1px solid var(--glass-border)" }} />
                        </div>
                        <input type="text" className="glass-input-v6" placeholder="Brief Description" value={ach.description} onChange={(e) => {
                          const updated = [...formData.achievements];
                          updated[idx].description = e.target.value;
                          setFormData({...formData, achievements: updated});
                        }} style={{ padding: 6, borderRadius: 8, border: "1px solid var(--glass-border)" }} />
                      </div>
                    ))}

                    <GlassButton onClick={() => setFormData({
                      ...formData,
                      achievements: [...formData.achievements, { title: "", date: "", description: "" }]
                    })}>
                      <Plus size={14} /> Add Achievement
                    </GlassButton>
                  </div>
                </div>
              )}

              <div className="modal-actions" style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "24px", borderTop: "1px solid var(--glass-border)", paddingTop: "16px" }}>
                <GlassButton type="button" onClick={() => { if (!isSaving) { setActiveModal(null); setSaveError(""); } }} disabled={isSaving}>
                  Cancel
                </GlassButton>
                <GlassButton type="button" primary onClick={() => handleSaveProfile(formData)} disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save Changes"}
                </GlassButton>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}

export default Profile;
