import axios from "axios";

const API = axios.create({
  baseURL: "http://127.0.0.1:8001",
});

// Automatically inject JWT authorization token if saved
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Unwrap { success, data, message } envelope — keeps all callers simple
API.interceptors.response.use(
  (response) => {
    if (
      response.data &&
      typeof response.data === "object" &&
      typeof response.data.success !== "undefined"
    ) {
      return {
        ...response,
        data: response.data.data ?? null,
        originalData: response.data,
        success: response.data.success,
        message: response.data.message,
      };
    }
    return response;
  },
  (error) => Promise.reject(error)
);

// ================= AUTH API =================
export const authAPI = {
  login:    (data) => API.post("/auth/login", data),
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
  generate:       (payload) => API.post("/generate-interview", payload),
  submit:         (payload) => API.post("/submit-interview", payload),
  placement:      (payload) => API.post("/placement-analysis", payload),
  roadmap:        (payload) => API.post("/generate-roadmap", payload),
  start:          (payload) => API.post("/interview/start", payload),
  submitAnswer:   (payload) => API.post("/interview/answer", payload),
  getReport:      (sessionId) => API.get(`/interview/report/${sessionId}`),
  getPDFReportUrl:(sessionId) => `${API.defaults.baseURL}/interview/report/${sessionId}/pdf`,
  analyzeFrame:   (payload) =>
    API.post("/proctoring/analyze-frame", payload, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
};


// ================= DAILY CHALLENGE API =================
export const dailyAPI = {
  getChallenges: () => API.get("/daily-challenge"),
};

// ================= APTITUDE API =================
export const aptitudeAPI = {
  getTest:    (domain) => API.get("/aptitude-test", { params: { domain } }),
  submitTest: (payload) => API.post("/submit-aptitude", payload),
};

// ================= DASHBOARD API =================
export const dashboardAPI = {
  getDashboard: () => API.get("/dashboard"),
};

// ================= PROFILE API =================
export const profileAPI = {
  // GET /profile/{email}  — falls back to legacy /get-profile when no email given
  getProfile: (email) =>
    email
      ? API.get(`/profile/${encodeURIComponent(email)}`)
      : API.get("/get-profile"),

  // POST /profile/update  — always returns the full saved profile object
  updateProfile: (data) => API.post("/profile/update", data),
};

export default API;
