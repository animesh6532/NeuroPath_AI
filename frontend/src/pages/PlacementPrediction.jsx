import { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext";
import { interviewAPI } from "../api/endpoints";
import "./PlacementPrediction.css";

function PlacementPrediction() {
  const { analysisData, interviewData } = useContext(AppContext);
  const [placementResult, setPlacementResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlacement = async () => {
      if (!analysisData || !interviewData) {
        setLoading(false);
        return;
      }

      try {
        const payload = {
          resume_score: analysisData.resume_score || 0,
          interview_score: interviewData.score || 0,
          missing_skills: analysisData.missing_skills || [],
          confidence: interviewData.confidence || 0,
          communication: interviewData.communication || 0,
          domain: analysisData.best_domain || "Technology"
        };

        const res = await interviewAPI.placement(payload);
        setPlacementResult(res.data);
      } catch (err) {
        console.error("Failed to fetch placement prediction", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlacement();
  }, [analysisData, interviewData]);

  if (loading) {
    return <div className="placement-page"><p>Analyzing placement readiness...</p></div>;
  }

  if (!analysisData || !interviewData) {
    return (
      <div className="placement-page">
        <div className="placement-card" style={{ textAlign: 'center' }}>
          <h2>Access Restricted</h2>
          <p style={{ color: '#94a3b8' }}>Please upload your resume and complete an interview to view placement predictions.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="placement-page">
      <div className="placement-card">
        <h1>Placement Prediction & Opportunities</h1>
        <p>AI-based placement readiness and tailored job opportunities.</p>

        <div className="prediction-box">
          <h2>{placementResult?.level || "Unknown"} Placement Chance</h2>
          <p style={{ fontSize: '18px', color: '#60a5fa', fontWeight: 'bold' }}>
            Placement Score: {placementResult?.placement_score || 0}%
          </p>
          <div style={{ marginTop: '15px' }}>
            <span style={{ color: '#94a3b8' }}>Top Career Match:</span> 
            <span style={{ marginLeft: '10px', color: '#f8fafc' }}>{analysisData.top_career}</span>
          </div>
          <div style={{ marginTop: '5px' }}>
            <span style={{ color: '#94a3b8' }}>Best Domain:</span> 
            <span style={{ marginLeft: '10px', color: '#f8fafc' }}>{analysisData.best_domain}</span>
          </div>
        </div>

        {placementResult?.suggested_roles?.length > 0 && (
          <div style={{ marginTop: '30px' }}>
            <h3>Suggested Roles</h3>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {placementResult.suggested_roles.map((role, idx) => (
                <span key={idx} style={{ background: '#1e293b', padding: '8px 16px', borderRadius: '20px', fontSize: '14px' }}>
                  {role}
                </span>
              ))}
            </div>
          </div>
        )}

        {placementResult?.job_links?.length > 0 && (
          <div style={{ marginTop: '30px' }}>
            <h3>Recommended Job & Internship Links</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {placementResult.job_links.map((job, idx) => (
                <div key={idx} style={{ background: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ margin: '0 0 5px 0', color: '#60a5fa' }}>{job.title}</h4>
                    <span style={{ color: '#94a3b8', fontSize: '14px' }}>{job.company} • {job.platform}</span>
                  </div>
                  <a href={job.url} target="_blank" rel="noopener noreferrer" style={{ background: '#3b82f6', color: 'white', padding: '8px 16px', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold', fontSize: '14px' }}>
                    Apply Now
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PlacementPrediction;