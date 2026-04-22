import { createContext, useEffect, useState } from "react";

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [analysisData, setAnalysisData] = useState(() => {
    const saved = localStorage.getItem("analysis_data");
    return saved ? JSON.parse(saved) : null;
  });

  const [resumeHistory, setResumeHistory] = useState(() => {
    const saved = localStorage.getItem("resume_history");
    return saved ? JSON.parse(saved) : [];
  });

  const [interviewData, setInterviewData] = useState(() => {
    const saved = localStorage.getItem("interview_data");
    return saved ? JSON.parse(saved) : null;
  });

  const [roadmapData, setRoadmapData] = useState(() => {
    const saved = localStorage.getItem("roadmap");
    return saved ? JSON.parse(saved) : null;
  });

  const [codingProgress, setCodingProgress] = useState(() => {
    const saved = localStorage.getItem("coding_progress");
    return saved ? JSON.parse(saved) : { streak: 0, completedToday: false, lastActive: null, solvedCount: 0 };
  });

  const [aptitudeResult, setAptitudeResult] = useState(() => {
    const saved = localStorage.getItem("aptitude_result");
    return saved ? JSON.parse(saved) : null;
  });

  const [recentUpload, setRecentUpload] = useState(
    localStorage.getItem("recentUpload") || null
  );

  useEffect(() => {
    if (analysisData) localStorage.setItem("analysis_data", JSON.stringify(analysisData));
    else localStorage.removeItem("analysis_data");
  }, [analysisData]);

  useEffect(() => {
    localStorage.setItem("resume_history", JSON.stringify(resumeHistory));
  }, [resumeHistory]);

  useEffect(() => {
    if (interviewData) localStorage.setItem("interview_data", JSON.stringify(interviewData));
    else localStorage.removeItem("interview_data");
  }, [interviewData]);

  useEffect(() => {
    if (roadmapData) localStorage.setItem("roadmap", JSON.stringify(roadmapData));
    else localStorage.removeItem("roadmap");
  }, [roadmapData]);

  useEffect(() => {
    if (codingProgress) localStorage.setItem("coding_progress", JSON.stringify(codingProgress));
    else localStorage.removeItem("coding_progress");
  }, [codingProgress]);

  useEffect(() => {
    if (aptitudeResult) localStorage.setItem("aptitude_result", JSON.stringify(aptitudeResult));
    else localStorage.removeItem("aptitude_result");
  }, [aptitudeResult]);

  useEffect(() => {
    if (recentUpload) {
      localStorage.setItem("recentUpload", recentUpload);
    }
  }, [recentUpload]);

  const clearAllAppData = () => {
    setAnalysisData(null);
    setResumeHistory([]);
    setInterviewData(null);
    setRoadmapData(null);
    setCodingProgress({ streak: 0, completedToday: false, lastActive: null, solvedCount: 0 });
    setAptitudeResult(null);
    setRecentUpload(null);

    localStorage.removeItem("analysis_data");
    localStorage.removeItem("resume_history");
    localStorage.removeItem("interview_data");
    localStorage.removeItem("roadmap");
    localStorage.removeItem("coding_progress");
    localStorage.removeItem("aptitude_result");
    localStorage.removeItem("recentUpload");
  };

  return (
    <AppContext.Provider
      value={{
        analysisData,
        setAnalysisData,
        resumeHistory,
        setResumeHistory,
        interviewData,
        setInterviewData,
        roadmapData,
        setRoadmapData,
        codingProgress,
        setCodingProgress,
        aptitudeResult,
        setAptitudeResult,
        recentUpload,
        setRecentUpload,
        clearAllAppData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};