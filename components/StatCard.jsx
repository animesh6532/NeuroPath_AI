// Reusable StatCard component
const StatCard = ({ title, value, trend = "+12%", color = "blue" }) => (
  <div className="stat-card glass-card">
    <div className="stat-header">
      <span className="stat-title">{title}</span>
      <span className={`stat-trend ${color}`}>{trend}</span>
    </div>
    <div className="stat-value">{value}</div>
    <div className="stat-progress">
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: '75%' }} />
      </div>
    </div>
  </div>
);

export default StatCard;

