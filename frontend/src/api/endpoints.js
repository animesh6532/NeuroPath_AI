import axios from "axios";

const API = axios.create({
  baseURL: "http://127.0.0.1:8001",
});

// ================= AUTH API =================
export const authAPI = {
  login: (data) => API.post("/login", data),
  register: (data) => API.post("/register", data),
};

// ================= RESUME API =================
export const resumeAPI = {
  analyze: (file) => {
    const formData = new FormData();
    formData.append("file", file);

    return API.post("/analyze-resume", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};

// ================= INTERVIEW API =================
export const interviewAPI = {
  start: (file) => {
    const formData = new FormData();
    formData.append("file", file);

    return API.post("/start-ai-interview", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  submit: (payload) => API.post("/submit-interview", payload),

  placement: (payload) => API.post("/placement-analysis", payload),

  roadmap: (payload) => API.post("/learning-roadmap", payload),

  analyzeFrame: (payload) =>
    API.post("/proctoring/analyze-events", payload, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
};

// ================= DASHBOARD API =================
export const dashboardAPI = {
  getDashboard: () => API.get("/dashboard"),
};

export default API;