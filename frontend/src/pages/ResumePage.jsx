import { useContext } from "react";
import { AppContext } from "../context/AppContext";
import ResumeUpload from "../components/ResumeUpload";
import SkillCard from "../components/SkillCard";
import CareerCard from "../components/CareerCard";
import "./ResumePage.css";

function ResumePage() {
  const { analysisData } = useContext(AppContext);

  return (
    <div className="resume-page">
      <div className="resume-upload-section">
        <ResumeUpload />
      </div>

      {analysisData && (
        <div className="resume-details-container">
          <div className="resume-header">
            <h2>Resume Analysis Details</h2>
            <p>Comprehensive breakdown of your uploaded profile</p>
          </div>

          <div className="details-grid">
            <div className="details-main">
              <section className="detail-section">
                <h3>🛠️ Detected Skills</h3>
                <div className="skills-wrap">
                  {analysisData.detected_skills?.length > 0 ? (
                    analysisData.detected_skills.map((skill, i) => (
                      <span key={i} className="skill-tag">{skill}</span>
                    ))
                  ) : (
                    <p className="empty-state">No skills detected.</p>
                  )}
                </div>
              </section>

              <section className="detail-section">
                <h3>📁 Extracted Projects</h3>
                <div className="list-wrap">
                  {analysisData.projects?.length > 0 ? (
                    analysisData.projects.map((proj, i) => (
                      <div key={i} className="list-card">{proj}</div>
                    ))
                  ) : (
                    <p className="empty-state">No projects found.</p>
                  )}
                </div>
              </section>

              <section className="detail-section">
                <h3>💼 Work Experience</h3>
                <div className="list-wrap">
                  {analysisData.experience?.length > 0 ? (
                    analysisData.experience.map((exp, i) => (
                      <div key={i} className="list-card">{exp}</div>
                    ))
                  ) : (
                    <p className="empty-state">No experience details found.</p>
                  )}
                </div>
              </section>
            </div>

            <div className="details-sidebar">
              <section className="detail-section highlight-box">
                <h3>🎯 Top Career Match</h3>
                <h2>{analysisData.top_career}</h2>
                <p>{analysisData.career_explanation}</p>
                
                <div style={{ marginTop: '15px' }}>
                  <h4>Other Recommendations:</h4>
                  <ul className="mini-career-list">
                    {analysisData.recommended_careers?.slice(1, 4).map((c, i) => (
                      <li key={i}>{c.career} ({c.score}%)</li>
                    ))}
                  </ul>
                </div>
              </section>

              <section className="detail-section warning-box">
                <h3>⚠️ Missing Skills for Top Career</h3>
                <div className="skills-wrap">
                  {analysisData.missing_skills?.length > 0 ? (
                    analysisData.missing_skills.map((skill, i) => (
                      <span key={i} className="skill-tag missing">{skill}</span>
                    ))
                  ) : (
                    <p>You have all the required base skills!</p>
                  )}
                </div>
              </section>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ResumePage;