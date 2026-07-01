import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { AppContext } from "../context/AppContext";
import { profileAPI } from "../api/endpoints";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, Award, Briefcase, ShieldAlert, Plus, X, 
  Activity, Calendar, FileText, CheckCircle2, Loader2, Sparkles 
} from "lucide-react";
import { GlassCard, GlassButton, GlassBadge } from "../components/ui/DesignSystem";
import "./Profile.css";

const safeArr = (v) => (Array.isArray(v) ? v : []);
const safeStr = (v, fallback = "") => (typeof v === "string" ? v : fallback);

function Profile() {
  const { user } = useContext(AuthContext);
  const {
    analysisData,
    interviewData,
    aptitudeResult,
    recentUpload,
    userProfile,
    replaceUserProfile,
  } = useContext(AppContext);

  const [isEditing,      setIsEditing]      = useState(false);
  const [isSaving,       setIsSaving]       = useState(false);
  const [saveError,      setSaveError]      = useState("");
  const [profileLoading, setProfileLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "", bio: "", profile_image: "", cover_image: "", custom_skills: [],
  });
  const [newSkill, setNewSkill] = useState("");

  const email       = safeStr(user?.email, "user@example.com");
  const defaultName = email.split("@")[0];
  const initial     = email.charAt(0).toUpperCase();

  const displayName  = safeStr(userProfile?.name,          defaultName);
  const bio          = safeStr(userProfile?.bio,            "");
  const profileImage = safeStr(userProfile?.profile_image, "") || null;
  const coverImage   = safeStr(userProfile?.cover_image,   "") || null;

  const domain  = safeStr(analysisData?.best_domain,  "Not Assigned");
  const career  = safeStr(analysisData?.top_career,   "Pending Assessment");

  const resumeScore    = analysisData?.resume_score    != null ? `${analysisData.resume_score}%`           : "N/A";
  const interviewScore = interviewData?.score          != null ? `${interviewData.score}%`                 : "N/A";
  const confidence     = interviewData?.confidence     != null ? `${interviewData.confidence}%`            : "N/A";
  const aptitudeScore  = aptitudeResult?.score         != null ? `${aptitudeResult.score}/${aptitudeResult.total ?? "?"}` : "N/A";

  const detectedSkills = safeArr(analysisData?.detected_skills);
  const missingSkills  = safeArr(analysisData?.missing_skills);
  const customSkills   = safeArr(userProfile?.custom_skills);
  const allSkills      = [...new Set([...detectedSkills, ...customSkills])];

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
          setFormData({
            name:          safeStr(data.name),
            bio:           safeStr(data.bio),
            profile_image: safeStr(data.profile_image),
            cover_image:   safeStr(data.cover_image),
            custom_skills: safeArr(data.custom_skills),
          });
        }
      } catch (err) {
        console.warn("[Profile] fetch skipped:", err?.message ?? err);
      } finally {
        if (!cancelled) setProfileLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [email]);

  useEffect(() => {
    if (!userProfile || typeof userProfile !== "object") return;
    setFormData({
      name:          safeStr(userProfile.name),
      bio:           safeStr(userProfile.bio),
      profile_image: safeStr(userProfile.profile_image),
      cover_image:   safeStr(userProfile.cover_image),
      custom_skills: safeArr(userProfile.custom_skills),
    });
  }, [userProfile]);

  const handleImageUpload = (e, field) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({ ...prev, [field]: reader.result ?? "" }));
    };
    reader.readAsDataURL(file);
  };

  const handleAddSkill = (e) => {
    e.preventDefault();
    const trimmed = newSkill.trim();
    if (trimmed && !formData.custom_skills.includes(trimmed)) {
      setFormData((prev) => ({ ...prev, custom_skills: [...prev.custom_skills, trimmed] }));
      setNewSkill("");
    }
  };

  const handleRemoveSkill = (skill) => {
    setFormData((prev) => ({
      ...prev,
      custom_skills: prev.custom_skills.filter((s) => s !== skill),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaveError("");
    setIsSaving(true);

    const payload = {
      name:          safeStr(formData.name),
      bio:           safeStr(formData.bio),
      profile_image: safeStr(formData.profile_image),
      cover_image:   safeStr(formData.cover_image),
      custom_skills: safeArr(formData.custom_skills),
      email,
    };

    try {
      const res = await profileAPI.updateProfile(payload);
      const saved = res?.data && typeof res.data === "object" ? res.data : payload;

      const safeSaved = {
        name:          safeStr(saved.name,          payload.name),
        bio:           safeStr(saved.bio,           payload.bio),
        profile_image: safeStr(saved.profile_image, payload.profile_image),
        cover_image:   safeStr(saved.cover_image,   payload.cover_image),
        custom_skills: safeArr(saved.custom_skills).length
          ? safeArr(saved.custom_skills)
          : safeArr(payload.custom_skills),
        email,
      };

      replaceUserProfile(safeSaved);
      try { localStorage.setItem("user_profile", JSON.stringify(safeSaved)); } catch {}
      setIsEditing(false);
    } catch (err) {
      console.error("[Profile] save failed:", err);
      setSaveError(
        err?.response?.data?.message ?? err?.message ?? "Failed to save profile."
      );
    } finally {
      setIsSaving(false);
    }
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
          <p>Loading candidate profile...</p>
        </GlassCard>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="page-container profile-page"
    >
      <GlassCard className="profile-container" style={{ padding: 0, overflow: "hidden" }}>
        {/* Cover */}
        <div
          className="cover-photo"
          style={{
            backgroundImage: coverImage
              ? `url(${coverImage})`
              : "linear-gradient(135deg, var(--glass-surface-solid), var(--secondary-glass-solid))",
            backgroundSize: "cover",
            backgroundPosition: "center",
            height: "180px",
            position: "relative"
          }}
        >
          <GlassButton onClick={() => { setSaveError(""); setIsEditing(true); }} style={{ position: "absolute", bottom: "16px", right: "20px", padding: "8px 16px", fontSize: "0.85rem" }}>
            Edit Profile
          </GlassButton>
        </div>

        {/* Avatar */}
        <div className="avatar-wrapper" style={{ marginTop: "-60px", paddingLeft: "32px", display: "flex", alignItems: "flex-end" }}>
          {profileImage ? (
            <img src={profileImage} alt="Profile" className="profile-img" style={{ width: "120px", height: "120px", borderRadius: "50%", border: "4px solid var(--bg-primary)", objectFit: "cover", background: "var(--bg-primary)" }} />
          ) : (
            <div className="avatar-placeholder" style={{ width: "120px", height: "120px", borderRadius: "50%", border: "4px solid var(--bg-primary)", background: "rgba(255, 255, 255, 0.55)", color: "var(--color-navy)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "3rem", fontWeight: "800", fontFamily: "Outfit" }}>{initial}</div>
          )}
        </div>

        {/* Info */}
        <div className="profile-info" style={{ padding: "24px 32px" }}>
          <h1 style={{ fontSize: "2rem", margin: 0 }}>{displayName}</h1>
          <p className="email-text text-small" style={{ margin: "4px 0" }}>{email}</p>
          <p className="role-domain text-body" style={{ color: "var(--soft-accent)", fontWeight: "600", marginTop: "8px" }}>
            <Sparkles size={14} style={{ marginRight: "6px", verticalAlign: "middle" }} />
            {career} • {domain} Domain
          </p>
          {bio && <p className="bio-text text-body" style={{ marginTop: "12px", borderTop: "1px solid var(--glass-border)", paddingTop: "12px" }}>{bio}</p>}
        </div>

        {/* Stats */}
        <div className="stats-grid" style={{ padding: "0 32px 32px 32px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "16px" }}>
          {[
            ["Resume Score",    resumeScore],
            ["Interview Score", interviewScore],
            ["Confidence",      confidence],
            ["Aptitude",        aptitudeScore],
          ].map(([label, value]) => (
            <div className="glass-card" key={label} style={{ background: "rgba(255,255,255,0.45)", padding: "16px", textAlign: "center", display: "flex", flexDirection: "column", gap: "6px" }}>
              <span className="text-caption">{label}</span>
              <strong style={{ fontSize: "1.4rem", color: "var(--color-dark-blue)", fontFamily: "Outfit" }}>{value}</strong>
            </div>
          ))}
        </div>

        {/* Skills */}
        <div className="skills-section" style={{ padding: "0 32px 32px 32px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", borderTop: "1px solid var(--glass-border)", paddingTop: "32px" }}>
          <div className="skills-block">
            <h3 className="text-title" style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "1.1rem", marginBottom: "16px" }}><CheckCircle2 size={16} /> Skills Portfolio</h3>
            <div className="tags-container" style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
              {allSkills.length > 0
                ? allSkills.map((s, i) => <GlassBadge key={i}>{s}</GlassBadge>)
                : <span className="empty-text text-small">No skills detected.</span>}
            </div>
          </div>
          <div className="skills-block">
            <h3 className="text-title" style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "1.1rem", marginBottom: "16px", color: "var(--soft-accent)" }}><ShieldAlert size={16} /> Gaps to Target Career</h3>
            <div className="tags-container" style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
              {missingSkills.length > 0
                ? missingSkills.map((s, i) => <GlassBadge key={i} status="danger">{s}</GlassBadge>)
                : <span className="empty-text text-small">No missing skills detected.</span>}
            </div>
          </div>
        </div>

        {/* Activity */}
        <div className="activity-section" style={{ padding: "0 32px 32px 32px", borderTop: "1px solid var(--glass-border)", paddingTop: "32px" }}>
          <h3 className="text-title" style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "1.1rem", marginBottom: "20px" }}><Activity size={16} /> Recent Activity Timeline</h3>
          <div className="timeline" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {recentUpload && (
              <div className="timeline-item" style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
                <FileText size={18} className="text-secondary" style={{ marginTop: "2px" }} />
                <div>
                  <h4 style={{ margin: 0, fontSize: "0.95rem" }}>Resume Processed</h4>
                  <p className="text-small" style={{ margin: "2px 0 0 0" }}>File: {recentUpload}</p>
                </div>
              </div>
            )}
            {interviewData && (
              <div className="timeline-item" style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
                <Award size={18} className="text-secondary" style={{ marginTop: "2px" }} />
                <div>
                  <h4 style={{ margin: 0, fontSize: "0.95rem" }}>AI Interview Completed</h4>
                  <p className="text-small" style={{ margin: "2px 0 0 0" }}>Scored {interviewScore} with {confidence} confidence</p>
                </div>
              </div>
            )}
            {aptitudeResult && (
              <div className="timeline-item" style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
                <Award size={18} className="text-secondary" style={{ marginTop: "2px" }} />
                <div>
                  <h4 style={{ margin: 0, fontSize: "0.95rem" }}>Aptitude Test Completed</h4>
                  <p className="text-small" style={{ margin: "2px 0 0 0" }}>Scored {aptitudeScore}</p>
                </div>
              </div>
            )}
            {!recentUpload && !interviewData && !aptitudeResult && (
              <p className="empty-text text-small">No prior actions logged.</p>
            )}
          </div>
        </div>
      </GlassCard>

      {/* Edit Modal */}
      <AnimatePresence>
        {isEditing && (
          <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget && !isSaving) setIsEditing(false); }} style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,42,0.08)", backdropFilter: "blur(8px)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1100, padding: "20px" }}>
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="modal-content glass-card" 
              style={{ width: "100%", maxWidth: "500px", maxHeight: "90vh", overflowY: "auto", position: "relative", background: "var(--glass-bg)", padding: "32px", borderRadius: "24px" }}
            >
              <button 
                type="button" 
                onClick={() => { if (!isSaving) setIsEditing(false); }} 
                style={{ position: "absolute", top: "16px", right: "16px", background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer" }}
              >
                <X size={18} />
              </button>

              <h2>Edit Profile</h2>
              <p className="text-small" style={{ marginBottom: "20px" }}>Update your personal dashboard metadata details.</p>

              {saveError && (
                <div className="warning-banner" style={{ marginBottom: "16px", background: "rgba(239,68,68,0.12)", border: "1px solid #ef4444", borderRadius: "8px", padding: "10px 14px", color: "#991b1b" }}>
                  {saveError}
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label className="text-caption">Full Name</label>
                  <input
                    type="text"
                    className="glass-input-v6"
                    value={formData.name}
                    onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                    placeholder="Your Name"
                    disabled={isSaving}
                    style={{ background: "rgba(255,255,255,0.6)", border: "1px solid var(--glass-border)", color: "var(--color-dark-blue)", padding: "10px", borderRadius: "8px" }}
                  />
                </div>

                <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label className="text-caption">Bio Summary</label>
                  <textarea
                    className="glass-input-v6"
                    value={formData.bio}
                    onChange={(e) => setFormData((p) => ({ ...p, bio: e.target.value }))}
                    placeholder="Describe your goals..."
                    rows="3"
                    disabled={isSaving}
                    style={{ resize: "none", background: "rgba(255,255,255,0.6)", border: "1px solid var(--glass-border)", color: "var(--color-dark-blue)", padding: "10px", borderRadius: "8px" }}
                  />
                </div>

                <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label className="text-caption">Profile Photo</label>
                  <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, "profile_image")} disabled={isSaving} style={{ display: "block", color: "var(--text-secondary)", fontSize: "0.85rem" }} />
                  {formData.profile_image && (
                    <img src={formData.profile_image} alt="Preview" style={{ width: 60, height: 60, borderRadius: "50%", marginTop: 8, objectFit: "cover", border: "2px solid var(--glass-border)" }} />
                  )}
                </div>

                <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label className="text-caption">Cover Banner Photo</label>
                  <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, "cover_image")} disabled={isSaving} style={{ display: "block", color: "var(--text-secondary)", fontSize: "0.85rem" }} />
                </div>

                <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label className="text-caption">Add Custom Skills</label>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <input
                      type="text"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      placeholder="e.g. PyTorch"
                      onKeyDown={(e) => { if (e.key === "Enter") handleAddSkill(e); }}
                      disabled={isSaving}
                      style={{ flex: 1, background: "rgba(255,255,255,0.6)", border: "1px solid var(--glass-border)", color: "var(--color-dark-blue)", padding: "10px", borderRadius: "8px" }}
                    />
                    <GlassButton type="button" onClick={handleAddSkill} disabled={isSaving}>
                      Add
                    </GlassButton>
                  </div>
                  <div className="tags-container" style={{ marginTop: "10px", display: "flex", gap: "6px", flexWrap: "wrap" }}>
                    {formData.custom_skills.map((skill, i) => (
                      <span key={i} className="glass-badge" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        {skill}
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(skill)}
                          disabled={isSaving}
                          style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", display: "flex", padding: 0 }}
                        >
                          <X size={10} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="modal-actions" style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "12px", borderTop: "1px solid var(--glass-border)", paddingTop: "16px" }}>
                  <GlassButton
                    type="button"
                    onClick={() => { if (!isSaving) { setIsEditing(false); setSaveError(""); } }}
                    disabled={isSaving}
                  >
                    Cancel
                  </GlassButton>
                  <GlassButton type="submit" primary disabled={isSaving}>
                    {isSaving ? "Saving..." : "Save Changes"}
                  </GlassButton>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default Profile;
