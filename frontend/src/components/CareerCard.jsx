import "./CareerCard.css";

function CareerCard({ career }) {
  return (
    <div className="career-card">
      <h3>{career.career}</h3>
      <p>Match Score: {career.score}</p>
    </div>
  );
}

export default CareerCard;
