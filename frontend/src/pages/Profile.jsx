import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { AppContext } from "../context/AppContext";
import "./Profile.css";

function Profile() {
  const { user } = useContext(AuthContext);
  const { analysisData, interviewData, aptitudeResult, recentUpload } = useContext(AppContext);

  return (
    <div className="profile-page">
      <div className="profile-banner"></div>
      
      <div className="profile-header">
        <div className="avatar">
          {user?.email?.charAt(0).toUpperCase() || "U"}
        </div>
        <div className="profile-info">
          <h2>{user?.email || "User"}</h2>
          <p>AI Career Intelligence Profile</p>
        </div>
      </div>

      <div className="profile-stats">
        <div className="stat">
          <span style={{color: '#9ca3af'}}>Resume Score</span>
          <p>{analysisData?.resume_score != null ? `${analysisData.resume_score}%` : "N/A"}</p>
        </div>
        <div className="stat">
          <span style={{color: '#9ca3af'}}>Interview Score</span>
          <p>{interviewData?.score != null ? `${interviewData.score}%` : "N/A"}</p>
        </div>
        <div className="stat">
          <span style={{color: '#9ca3af'}}>Confidence</span>
          <p>{interviewData?.confidence != null ? `${interviewData.confidence}%` : "N/A"}</p>
        </div>
        <div className="stat">
          <span style={{color: '#9ca3af'}}>Aptitude Score</span>
          <p>{aptitudeResult?.score != null ? `${aptitudeResult.score}/${aptitudeResult.total}` : "N/A"}</p>
        </div>
      </div>

      <div className="profile-content">
        <div className="card">
          <h3 style={{marginTop: 0}}>Career Trajectory</h3>
          <p style={{color: '#9ca3af', marginBottom: '5px'}}>Top Career Match:</p>
          <p style={{fontSize: '18px', fontWeight: 'bold', margin: '0 0 15px 0'}}>{analysisData?.top_career || "N/A"}</p>
          
          <p style={{color: '#9ca3af', marginBottom: '5px'}}>Primary Domain:</p>
          <p style={{fontSize: '18px', fontWeight: 'bold', margin: '0 0 15px 0'}}>{analysisData?.best_domain || "N/A"}</p>
          
          <p style={{color: '#9ca3af', marginBottom: '5px'}}>Career Explanation:</p>
          <p style={{lineHeight: 1.5, margin: 0}}>{analysisData?.career_explanation || "N/A"}</p>
        </div>

        <div>
          <div className="card">
            <h3 style={{marginTop: 0}}>Detected Skills</h3>
            {analysisData?.detected_skills?.length > 0 ? (
              <div className="skills">
                {analysisData.detected_skills.map((skill, i) => (
                  <span key={i}>{skill}</span>
                ))}
              </div>
            ) : (
              <p style={{color: '#9ca3af', margin: 0}}>No skills detected.</p>
            )}
          </div>

          <div className="card">
            <h3 style={{marginTop: 0}}>Activity</h3>
            <p style={{color: '#9ca3af', marginBottom: '5px'}}>Recent Resume Upload:</p>
            <p style={{fontWeight: 'bold', margin: '0 0 15px 0'}}>{recentUpload || "None"}</p>
            <p style={{color: '#9ca3af', marginBottom: '5px'}}>Status:</p>
            <p style={{fontWeight: 'bold', margin: 0, color: '#10b981'}}>Active</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;