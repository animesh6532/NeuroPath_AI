import { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext";
import { interviewAPI } from "../api/endpoints";
import "./LearningRoadmap.css";

function LearningRoadmap() {
  const { analysisData, interviewData, roadmapData, setRoadmapData } = useContext(AppContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(() => {
    const saved = localStorage.getItem("roadmap_progress");
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    const fetchRoadmap = async () => {
      // Generate roadmap if we have either resume missing skills or interview weaknesses
      const hasWeaknesses = interviewData?.weaknesses?.length > 0;
      const hasMissingSkills = analysisData?.missing_skills?.length > 0;
      
      if (roadmapData || (!hasWeaknesses && !hasMissingSkills)) return;

      try {
        setLoading(true);
        const payload = {
          weaknesses: interviewData?.weaknesses || [],
          missing_skills: analysisData?.missing_skills || [],
          domain: analysisData?.best_domain || "General"
        };
        const response = await interviewAPI.roadmap(payload);
        setRoadmapData(response.data);
      } catch (err) {
        console.error("Failed to fetch roadmap:", err);
        setError("Could not generate roadmap.");
      } finally {
        setLoading(false);
      }
    };

    fetchRoadmap();
  }, [interviewData, analysisData, roadmapData, setRoadmapData]);

  const handleToggleStep = (skillIndex, stepIndex) => {
    const key = `${skillIndex}-${stepIndex}`;
    const newProgress = { ...progress, [key]: !progress[key] };
    setProgress(newProgress);
    localStorage.setItem("roadmap_progress", JSON.stringify(newProgress));
  };

  return (
    <div className="roadmap-page">
      <div className="roadmap-card" style={{ maxWidth: '900px', width: '100%' }}>
        <h1>Learning Roadmap</h1>
        <p>Your personalized step-by-step improvement plan based on your resume and interview.</p>

        {loading ? (
          <p>Generating your custom learning path...</p>
        ) : error ? (
          <p className="error-text">{error}</p>
        ) : Array.isArray(roadmapData) && roadmapData.length > 0 ? (
          <div className="roadmap-content">
            {roadmapData.map((module, skillIndex) => (
              <div key={skillIndex} className="roadmap-item" style={{ marginBottom: '30px', padding: '20px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                  <h2 style={{ margin: 0, color: '#60a5fa' }}>{module.skill}</h2>
                  <span style={{ padding: '5px 10px', background: 'rgba(59,130,246,0.2)', borderRadius: '8px', fontSize: '14px', color: '#93c5fd' }}>
                    {module.level}
                  </span>
                </div>
                
                <h4 style={{ color: '#cbd5e1', marginBottom: '10px' }}>Action Plan:</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {module.steps.map((step, stepIndex) => {
                    const isChecked = !!progress[`${skillIndex}-${stepIndex}`];
                    return (
                      <label key={stepIndex} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', padding: '10px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                        <input 
                          type="checkbox" 
                          checked={isChecked} 
                          onChange={() => handleToggleStep(skillIndex, stepIndex)}
                          style={{ width: '18px', height: '18px' }}
                        />
                        <span style={{ textDecoration: isChecked ? 'line-through' : 'none', color: isChecked ? '#64748b' : '#f8fafc' }}>
                          {step}
                        </span>
                      </label>
                    );
                  })}
                </div>

                <h4 style={{ color: '#cbd5e1', marginTop: '20px', marginBottom: '10px' }}>Resources:</h4>
                <ul style={{ listStyleType: 'none', padding: 0 }}>
                  {module.resources.map((res, resIdx) => (
                    <li key={resIdx} style={{ marginBottom: '8px' }}>
                      <a href={res} target="_blank" rel="noopener noreferrer" style={{ color: '#3b82f6', textDecoration: 'none' }}>
                        🔗 {res}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : (
          <div className="roadmap-empty">
            <p>No roadmap available yet. Upload a resume and complete an AI interview to identify weak areas and generate a learning path.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default LearningRoadmap;