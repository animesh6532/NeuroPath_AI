import axios from "axios";

const API = axios.create({
  baseURL: "http://127.0.0.1:8001",
});

API.interceptors.response.use(
  (response) => {
    // If the response follows our { success, data, message } wrapper structure
    if (response.data && typeof response.data.success !== "undefined") {
      // Create a fake response where `response.data` is the inner data, to avoid breaking legacy code
      // We also attach full response to `response.originalData` just in case
      return {
        ...response,
        data: response.data.data,
        originalData: response.data
      };
    }
    return response;
  },
  (error) => Promise.reject(error)
);

// ================= AUTH API =================
export const authAPI = {
  login: (data) => API.post("/auth/login", data),
  register: (data) => API.post("/auth/register", data),
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
  generate: (payload) => API.post("/generate-interview", payload),

  submit: (payload) => API.post("/submit-interview", payload),

  placement: (payload) => API.post("/placement-analysis", payload),

  roadmap: (payload) => API.post("/generate-roadmap", payload),

  analyzeFrame: (payload) =>
    API.post("/proctoring/analyze-events", payload, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
};

// ================= DAILY CHALLENGE API =================
export const dailyAPI = {
  getChallenges: () => API.get("/daily-challenge"),
};

// ================= APTITUDE API =================
export const aptitudeAPI = {
  getTest: () => API.get("/aptitude-test"),
  submitTest: (payload) => API.post("/submit-aptitude", payload),
};

// ================= DASHBOARD API =================
export const dashboardAPI = {
  getDashboard: () => API.get("/dashboard"),
};

// ================= PROFILE API =================
export const profileAPI = {
  getProfile: () => API.get("/get-profile"),
  updateProfile: (data) => API.post("/update-profile", data),
};

export default API;