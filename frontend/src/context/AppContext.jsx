import { createContext, useEffect, useState } from "react";

export const AppContext = createContext();

const safeGet = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null || raw === "undefined" || raw === "") return fallback;
    const parsed = JSON.parse(raw);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
};

const safeSet = (key, value) => {
  try {
    if (value === null || value === undefined) {
      localStorage.removeItem(key);
    } else {
      localStorage.setItem(key, JSON.stringify(value));
    }
  } catch {
    // quota exceeded or private browsing — silently ignore
  }
};

export const AppProvider = ({ children }) => {
  const [analysisData,   setAnalysisDataRaw]   = useState(() => safeGet("analysis_data", null));
  const [resumeHistory,  setResumeHistory]      = useState(() => safeGet("resume_history", []));
  const [interviewData,  setInterviewDataRaw]   = useState(() => safeGet("interview_data", null));
  const [roadmapData,    setRoadmapDataRaw]     = useState(() => {
    const saved = safeGet("roadmap", null);
    return saved ?? [];
  });
  const [codingProgress, setCodingProgressRaw] = useState(() =>
    safeGet("coding_progress", { streak: 0, completedToday: false, lastActive: null, solvedCount: 0 })
  );
  const [aptitudeResult, setAptitudeResult]    = useState(() => safeGet("aptitude_result", null));
  const [recentUpload,   setRecentUploadRaw]   = useState(() => {
    try { return localStorage.getItem("recentUpload") || null; } catch { return null; }
  });
  // null = not yet loaded, {} = loaded but empty
  const [userProfile,    setUserProfileRaw]    = useState(() => safeGet("user_profile", null));
  const [roadmapProgress, setRoadmapProgressRaw] = useState(() => {
    try {
      const saved = localStorage.getItem("roadmap_progress");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // ── Persist ────────────────────────────────────────────────────────────
  useEffect(() => { safeSet("analysis_data",  analysisData);  }, [analysisData]);
  useEffect(() => {
    try {
      localStorage.setItem("roadmap_progress", JSON.stringify(roadmapProgress));
    } catch {}
  }, [roadmapProgress]);
  useEffect(() => { safeSet("resume_history", resumeHistory ?? []); }, [resumeHistory]);
  useEffect(() => { safeSet("interview_data", interviewData); }, [interviewData]);
  useEffect(() => { safeSet("roadmap", roadmapData); }, [roadmapData]);
  useEffect(() => { safeSet("coding_progress", codingProgress); }, [codingProgress]);
  useEffect(() => { safeSet("aptitude_result", aptitudeResult); }, [aptitudeResult]);
  useEffect(() => {
    try {
      if (recentUpload) localStorage.setItem("recentUpload", recentUpload);
      else localStorage.removeItem("recentUpload");
    } catch {}
  }, [recentUpload]);
  useEffect(() => {
    if (userProfile && typeof userProfile === "object") {
      safeSet("user_profile", userProfile);
    }
  }, [userProfile]);

  // ── Safe setters ───────────────────────────────────────────────────────

  const setAnalysisData = (data) => {
    setAnalysisDataRaw(data && typeof data === "object" ? data : null);
  };

  const setInterviewData = (data) => {
    if (!data || typeof data !== "object") { setInterviewDataRaw(null); return; }
    setInterviewDataRaw({
      ...data,
      weaknesses: Array.isArray(data.weaknesses) ? data.weaknesses : [],
    });
  };

  const setRoadmapData = (data) => {
    if (Array.isArray(data)) {
      setRoadmapDataRaw(data);
      return;
    }
    if (data && typeof data === "object") {
      setRoadmapDataRaw(data);
      return;
    }
    setRoadmapDataRaw([]);
  };

  // Accepts full profile object or partial — merges with existing, never nukes it
  const setUserProfile = (data) => {
    if (!data || typeof data !== "object") return; // refuse to set null/bad values
    setUserProfileRaw((prev) => {
      const merged = { ...(prev ?? {}), ...data };
      // Ensure custom_skills is always an array
      if (!Array.isArray(merged.custom_skills)) merged.custom_skills = [];
      return merged;
    });
  };

  // Hard replace — used only when we receive a fresh authoritative profile from the server
  const replaceUserProfile = (data) => {
    const safe = data && typeof data === "object" ? data : {};
    if (!Array.isArray(safe.custom_skills)) safe.custom_skills = [];
    setUserProfileRaw(safe);
  };

  const setRecentUpload = (v) => setRecentUploadRaw(v || null);
  const setCodingProgress = (v) => setCodingProgressRaw(v);
  const setRoadmapProgress = (v) => setRoadmapProgressRaw(v || {});

  const clearAllAppData = () => {
    setAnalysisDataRaw(null);
    setResumeHistory([]);
    setInterviewDataRaw(null);
    setRoadmapDataRaw([]);
    setCodingProgressRaw({ streak: 0, completedToday: false, lastActive: null, solvedCount: 0 });
    setAptitudeResult(null);
    setRecentUploadRaw(null);
    setUserProfileRaw(null);
    setRoadmapProgressRaw({});
    [
      "analysis_data","resume_history","interview_data","roadmap",
      "coding_progress","aptitude_result","recentUpload","user_profile","roadmap_progress"
    ].forEach((k) => { try { localStorage.removeItem(k); } catch {} });
  };

  return (
    <AppContext.Provider
      value={{
        analysisData,   setAnalysisData,
        resumeHistory,  setResumeHistory,
        interviewData,  setInterviewData,
        roadmapData,
        setRoadmapData,
        roadmapProgress, setRoadmapProgress,
        codingProgress, setCodingProgress,
        aptitudeResult, setAptitudeResult,
        recentUpload,   setRecentUpload,
        userProfile,    setUserProfile, replaceUserProfile,
        clearAllAppData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
