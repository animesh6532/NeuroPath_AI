import { useState, useRef, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { resumeAPI } from "../api/endpoints";
import { AppContext } from "../context/AppContext";
import "./ResumeUpload.css";

const ResumeUpload = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const { setAnalysisData, setRecentUpload, setResumeHistory } = useContext(AppContext);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (selectedFile.type !== "application/pdf") {
      setError("Please select a PDF file only.");
      setFile(null);
      return;
    }

    setFile(selectedFile);
    setError("");
    setSuccess("");
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();

    if (!file) {
      setError("Please select a PDF resume first.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await resumeAPI.analyze(file);

      console.log("Resume Analysis Response:", response.data);

      setAnalysisData(response.data);
      setRecentUpload(file.name);
      
      setResumeHistory(prev => [
        {
          id: Date.now(),
          date: new Date().toLocaleDateString(),
          score: response.data.resume_score,
          career: response.data.top_career
        },
        ...prev
      ]);

      setSuccess("Resume analyzed successfully!");

      setTimeout(() => {
        navigate("/dashboard");
      }, 800);
    } catch (err) {
      console.error("Resume upload error:", err);
      setError(
        err?.response?.data?.detail ||
          "Failed to analyze resume. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="resume-upload-container">
      <form className="upload-card" onSubmit={handleAnalyze}>
        <div className="upload-header">
          <h2>Resume Upload</h2>
          <p>Upload your PDF resume to get AI-powered analysis</p>
        </div>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="application/pdf"
          style={{ display: "none" }}
          disabled={loading}
        />

        <div className="upload-box" onClick={handleClick}>
          <div className="upload-icon">📎</div>
          <p className="upload-text">
            {file ? file.name : "Click to select PDF resume"}
          </p>
          <p className="upload-hint">PDF files only</p>
        </div>

        <button type="submit" className="upload-button" disabled={loading}>
          {loading ? "Analyzing..." : "Analyze Resume"}
        </button>

        {error && <div className="upload-error">{error}</div>}
        {success && <div className="upload-success">{success}</div>}
      </form>
    </div>
  );
};

export default ResumeUpload;