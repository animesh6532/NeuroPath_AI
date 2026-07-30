import "./SkillCard.css";

function SkillCard({ skill }) {
  return (
    <div className="skill-card">
      <span>{skill}</span>
    </div>
  );
}

export default SkillCard;
