import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { AppContext } from "../context/AppContext";
import { profileAPI } from "../api/endpoints";
import "./Profile.css";

function Profile() {
  const { user } = useContext(AuthContext);
  const { analysisData, interviewData, aptitudeResult, recentUpload, codingProgress, userProfile, setUserProfile } = useContext(AppContext);

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    profile_image: "",
    cover_image: "",
    custom_skills: []
  });
  const [newSkill, setNewSkill] = useState("");

  useEffect(() => {
    // Fetch profile from backend
    const fetchProfile = async () => {
      try {
        const res = await profileAPI.getProfile();
        if (res.data) {
          setUserProfile(res.data);
          setFormData({
            name: res.data.name || "",
            bio: res.data.bio || "",
            profile_image: res.data.profile_image || "",
            cover_image: res.data.cover_image || "",
            custom_skills: res.data.custom_skills || []
          });
        }
      } catch (err) {
        console.error("Failed to fetch profile", err);
      }
    };
    fetchProfile();
  }, [setUserProfile]);

  const email = user?.email || "user@example.com";
  const defaultName = email.split('@')[0];
  const initial = email.charAt(0).toUpperCase();

  const displayName = userProfile?.name || defaultName;
  const bio = userProfile?.bio || "";
  const profileImage = userProfile?.profile_image || null;
  const coverImage = userProfile?.cover_image || null;

  const domain = analysisData?.best_domain || "Not Assigned";
  const career = analysisData?.top_career || "Pending Assessment";

  const resumeScore = analysisData?.resume_score != null ? `${analysisData.resume_score}%` : "N/A";
  const interviewScore = interviewData?.score != null ? `${interviewData.score}%` : "N/A";
  const confidence = interviewData?.confidence != null ? `${interviewData.confidence}%` : "N/A";
  const aptitudeScore = aptitudeResult?.score != null ? `${aptitudeResult.score}/${aptitudeResult.total}` : "N/A";

  const detectedSkills = analysisData?.detected_skills || [];
  const missingSkills = analysisData?.missing_skills || [];
  const customSkills = userProfile?.custom_skills || [];
  const allSkills = [...new Set([...detectedSkills, ...customSkills])];

  const handleImageUpload = (e, field) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, [field]: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (newSkill.trim() && !formData.custom_skills.includes(newSkill.trim())) {
      setFormData(prev => ({ ...prev, custom_skills: [...prev.custom_skills, newSkill.trim()] }));
      setNewSkill("");
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      custom_skills: prev.custom_skills.filter(s => s !== skillToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData, email };
      const res = await profileAPI.updateProfile(payload);
      setUserProfile(res.data);
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to update profile", err);
      alert("Failed to update profile");
    }
  };

  return (
    <div className="profile-page">
      <div className="profile-container">

        {/* Cover Section */}
        <div
          className="cover-photo"
          style={{ backgroundImage: coverImage ? `url(${coverImage})` : 'linear-gradient(135deg, #3b82f6, #6366f1)', backgroundSize: 'cover', backgroundPosition: 'center' }}
        >
          <button className="edit-profile-btn" onClick={() => setIsEditing(true)}>Edit Profile</button>
        </div>

        {/* Avatar */}
        <div className="avatar-wrapper">
          {profileImage ? (
            <img src={profileImage} alt="Profile Avatar" className="profile-img" />
          ) : (
            <div className="avatar-placeholder">{initial}</div>
          )}
        </div>

        {/* User Info */}
        <div className="profile-info">
          <h1>{displayName}</h1>
          <p className="email-text">{email}</p>
          <p className="role-domain">{career} • {domain} Domain</p>
          {bio && <p className="bio-text">{bio}</p>}
        </div>

        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <span>Resume Score</span>
            <strong>{resumeScore}</strong>
          </div>
          <div className="stat-card">
            <span>Interview Score</span>
            <strong>{interviewScore}</strong>
          </div>
          <div className="stat-card">
            <span>Confidence</span>
            <strong>{confidence}</strong>
          </div>
          <div className="stat-card">
            <span>Aptitude</span>
            <strong>{aptitudeScore}</strong>
          </div>
        </div>

        {/* Skills */}
        <div className="skills-section">
          <div className="skills-block">
            <h3>Skills</h3>
            <div className="tags-container">
              {allSkills.length > 0 ? (
                allSkills.map((skill, i) => <span key={i} className="tag tag-blue">{skill}</span>)
              ) : (
                <span className="empty-text">No skills added yet.</span>
              )}
            </div>
          </div>
          <div className="skills-block">
            <h3 style={{ color: '#fca5a5' }}>Missing Skills (Required for {career})</h3>
            <div className="tags-container">
              {missingSkills.length > 0 ? (
                missingSkills.map((skill, i) => <span key={i} className="tag tag-red">{skill}</span>)
              ) : (
                <span className="empty-text">No missing skills.</span>
              )}
            </div>
          </div>
        </div>

        {/* Activity */}
        <div className="activity-section">
          <h3>Recent Activity</h3>
          <div className="timeline">
            {recentUpload && (
              <div className="timeline-item">
                <span className="timeline-dot bg-blue"></span>
                <div className="timeline-content">
                  <h4>Resume Uploaded</h4>
                  <p>{recentUpload}</p>
                </div>
              </div>
            )}
            {interviewData && (
              <div className="timeline-item">
                <span className="timeline-dot bg-green"></span>
                <div className="timeline-content">
                  <h4>AI Interview Completed</h4>
                  <p>Scored {interviewScore}</p>
                </div>
              </div>
            )}
            {aptitudeResult && (
              <div className="timeline-item">
                <span className="timeline-dot bg-purple"></span>
                <div className="timeline-content">
                  <h4>Aptitude Test Taken</h4>
                  <p>Scored {aptitudeScore}</p>
                </div>
              </div>
            )}
            {!recentUpload && !interviewData && !aptitudeResult && (
              <p className="empty-text">No recent activity.</p>
            )}
          </div>
        </div>

      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Edit Profile</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Your Name"
                />
              </div>
              <div className="form-group">
                <label>Bio</label>
                <textarea
                  value={formData.bio}
                  onChange={e => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Tell us about yourself"
                  rows="3"
                />
              </div>
              <div className="form-group">
                <label>Profile Photo</label>
                <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, "profile_image")} />
              </div>
              <div className="form-group">
                <label>Cover Photo</label>
                <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, "cover_image")} />
              </div>
              <div className="form-group">
                <label>Custom Skills</label>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                  <input
                    type="text"
                    value={newSkill}
                    onChange={e => setNewSkill(e.target.value)}
                    placeholder="Add a skill"
                    onKeyDown={e => { if (e.key === 'Enter') handleAddSkill(e); }}
                  />
                  <button type="button" onClick={handleAddSkill} className="btn-secondary">Add</button>
                </div>
                <div className="tags-container">
                  {formData.custom_skills.map((skill, i) => (
                    <span key={i} className="tag tag-blue" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      {skill}
                      <button type="button" onClick={() => handleRemoveSkill(skill)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: 0 }}>&times;</button>
                    </span>
                  ))}
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setIsEditing(false)} className="btn-cancel">Cancel</button>
                <button type="submit" className="btn-save">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;