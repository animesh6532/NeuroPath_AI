import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import StatCard from "../components/StatCard";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import "./Dashboard.css";

function Dashboard() {
  const { analysisData, interviewData, roadmapData, codingProgress, aptitudeResult, recentUpload, resumeHistory } = useContext(AppContext);
  const navigate = useNavigate();

  if (!analysisData) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-empty">
          <h2>No Data Found</h2>
          <p>Please upload your resume first to build your dashboard.</p>
        </div>
      </div>
    );
  }

  const { resume_score, best_domain } = analysisData;
  const interview_score = interviewData?.score || "N/A";
  const confidence = interviewData?.confidence || "N/A";
  const communication = interviewData?.communication || "N/A";
  const streak = codingProgress?.streak || 0;
  const isTechnical = best_domain === "Technology";
  
  // Calculate learning progress based on real roadmap progress
  const savedProgressStr = localStorage.getItem("roadmap_progress");
  const savedProgress = savedProgressStr ? JSON.parse(savedProgressStr) : {};
  const completedSteps = Object.values(savedProgress).filter(v => v).length;
  
  let totalRoadmapSteps = 0;
  if (Array.isArray(roadmapData)) {
    roadmapData.forEach(module => {
      totalRoadmapSteps += module.steps ? module.steps.length : 0;
    });
  }
  const progressPercent = totalRoadmapSteps > 0 ? Math.round((completedSteps / totalRoadmapSteps) * 100) : 0; 

  const pieData = [
    { name: "Completed", value: progressPercent, color: "#3b82f6" },
    { name: "Remaining", value: 100 - progressPercent, color: "#1e293b" }
  ];

  const mockGraphData = [
    { day: "Mon", solved: 1 },
    { day: "Tue", solved: Math.floor((codingProgress?.solvedCount || 0) / 3) || 1 },
    { day: "Wed", solved: 2 },
    { day: "Thu", solved: Math.floor((codingProgress?.solvedCount || 0) / 2) || 1 },
    { day: "Today", solved: codingProgress?.solvedCount || 0 },
  ];

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h1>Overview Dashboard</h1>
        <p>Your centralized AI-driven career analytics</p>
        {recentUpload && <span className="recent-file">📄 {recentUpload}</span>}
      </div>

      <div className="dashboard-actions" style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
        <button style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #3b82f6', background: 'rgba(59,130,246,0.1)', color: '#60a5fa', cursor: 'pointer', fontWeight: 'bold' }} onClick={() => navigate('/aptitude-test')}>
          Take Aptitude Test
        </button>
        <button 
          style={{ 
            padding: '10px 20px', 
            borderRadius: '8px', 
            border: 'none', 
            background: isTechnical ? '#3b82f6' : '#475569', 
            color: isTechnical ? 'white' : '#94a3b8', 
            cursor: isTechnical ? 'pointer' : 'not-allowed', 
            fontWeight: 'bold' 
          }} 
          onClick={() => isTechnical && navigate('/daily-coding')}
          title={!isTechnical ? "Coding challenges available only for technical users" : ""}
          disabled={!isTechnical}
        >
          Start Daily Coding
        </button>
      </div>

      <div className="stats-grid">
        <StatCard title="Resume Score" value={`${resume_score || 0}%`} />
        <StatCard title="Interview Score" value={interview_score !== "N/A" ? `${interview_score}%` : "N/A"} />
        <StatCard title="Aptitude Score" value={aptitudeResult ? `${aptitudeResult.score}/${aptitudeResult.total}` : "N/A"} />
        <StatCard title="Confidence Level" value={confidence !== "N/A" ? `${confidence}%` : "N/A"} />
        <StatCard title="Communication" value={communication !== "N/A" ? `${communication}%` : "N/A"} />
      </div>

      {isTechnical && (
        <div className="dashboard-section double-col" style={{ marginTop: '20px' }}>
          <div className="dash-col">
            <h2>Problems Solved</h2>
            <div style={{ height: "250px", width: "100%", marginTop: "20px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockGraphData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                  <XAxis dataKey="day" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" allowDecimals={false} />
                  <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }} />
                  <Bar dataKey="solved" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="dash-col" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
            <h2>Coding Streak</h2>
            <div style={{ fontSize: '72px', fontWeight: 'bold', color: '#f59e0b', textShadow: '0 0 20px rgba(245, 158, 11, 0.4)' }}>
              {streak} 🔥
            </div>
            <p style={{ color: '#94a3b8', marginTop: '10px', fontSize: '18px' }}>Days in a row</p>
          </div>
        </div>
      )}

      <div className="dashboard-section double-col" style={{ marginTop: '20px' }}>
        <div className="dash-col">
          <h2>Learning Progress</h2>
          {totalRoadmapSteps > 0 ? (
            <div style={{ height: "250px", display: "flex", flexDirection: "column", alignItems: "center" }}>
              <ResponsiveContainer width="100%" height="80%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val) => `${val}%`} />
                </PieChart>
              </ResponsiveContainer>
              <h3 style={{ margin: 0, color: "#e2e8f0" }}>{progressPercent}% Completed</h3>
              <p style={{ color: "#94a3b8", fontSize: "14px", marginTop: "5px" }}>
                {completedSteps} out of {totalRoadmapSteps} roadmap steps
              </p>
            </div>
          ) : (
            <p className="empty-text">No roadmap generated yet. Complete an interview to get your learning path.</p>
          )}
        </div>

        <div className="dash-col">
          <h2>Resume Upload History</h2>
          {resumeHistory && resumeHistory.length > 0 ? (
            <div className="history-table-wrapper">
              <table className="history-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Score</th>
                    <th>Top Career</th>
                  </tr>
                </thead>
                <tbody>
                  {resumeHistory.slice(0, 5).map((item) => (
                    <tr key={item.id}>
                      <td>{item.date}</td>
                      <td><span className="score-badge">{item.score}%</span></td>
                      <td>{item.career}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {resumeHistory.length > 5 && <p className="history-note">Showing last 5 uploads.</p>}
            </div>
          ) : (
            <p className="empty-text">No history found. Upload your first resume!</p>
          )}
        </div>
      </div>

    </div>
  );
}

export default Dashboard;