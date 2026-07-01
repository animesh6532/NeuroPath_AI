import { useState, useRef, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { resumeAPI } from "../api/endpoints";
import { AppContext } from "../context/AppContext";
import { FileUp, FileText, Loader2, AlertCircle } from "lucide-react";
import { GlassButton } from "./ui/DesignSystem";
import "./ResumeUpload.css";

const ResumeUpload = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progressText, setProgressText] = useState("");
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

    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "image/png",
      "image/jpeg",
      "image/jpg"
    ];

    if (!allowedTypes.includes(selectedFile.type) && !selectedFile.name.endsWith(".docx")) {
      setError("Please select a supported file (PDF, DOCX, PNG, or JPG/JPEG).");
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
      setError("Please select a resume file first.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");
    setProgressText("Reading document text...");

    const steps = [
      "Segmenting sections & extracting personal metadata...",
      "Normalizing skills & matching certifications...",
      "Classifying career domains...",
      "Running multi-factor semantic matching...",
      "Compiling readiness scores & roadmaps..."
    ];
    let stepIdx = 0;
    const progressInterval = setInterval(() => {
      if (stepIdx < steps.length) {
        setProgressText(steps[stepIdx]);
        stepIdx++;
      }
    }, 1100);

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

      // Keep user on Resume Intelligence page for parsing, score reviews, and suggestion reports.
    } catch (err) {
      console.error("Resume upload error:", err);
      setError(
        err?.response?.data?.detail ||
          "Failed to analyze resume. Please verify the document format."
      );
    } finally {
      clearInterval(progressInterval);
      setLoading(false);
      setProgressText("");
    }
  };

  return (
    <div className="resume-upload-container">
      <form className="upload-card glass-card" onSubmit={handleAnalyze}>
        <div className="upload-header">
          <span className="glass-badge">Parser Service</span>
          <h2>Resume Analyzer</h2>
          <p className="text-small">Upload your resume to initialize AI-driven career matching</p>
        </div>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".pdf,.docx,.png,.jpg,.jpeg"
          style={{ display: "none" }}
          disabled={loading}
        />

        <div className={`upload-box ${file ? "has-file" : ""}`} onClick={handleClick}>
          <div className="upload-icon-container">
            {file ? <FileText size={28} className="text-secondary" /> : <FileUp size={28} className="text-secondary" />}
          </div>
          <p className="upload-text">
            {file ? file.name : "Click to select resume file"}
          </p>
          <p className="upload-hint text-small">PDF, DOCX, PNG, JPG, JPEG supported</p>
        </div>

        <GlassButton type="submit" primary className="upload-button" disabled={loading}>
          {loading ? "Processing..." : "Analyze Resume"}
        </GlassButton>

        {loading && (
          <div className="upload-progress-loader glass-card">
            <Loader2 size={24} className="spinner icon-spin" />
            <p className="progress-text text-small">{progressText}</p>
          </div>
        )}

        {error && (
          <div className="upload-error text-small">
            <AlertCircle size={14} style={{ marginRight: "6px" }} />
            {error}
          </div>
        )}
        {success && <div className="upload-success text-small">{success}</div>}
      </form>
    </div>
  );
};

export default ResumeUpload;