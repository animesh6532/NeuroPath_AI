import { useContext, useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authAPI } from "../api/endpoints";
import { AuthContext } from "../context/AuthContext";
import "./Auth.css";

function Login() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useContext(AuthContext);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  if (isAuthenticated) {
    return null;
  }

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.email || !formData.password) {
      setError("Please fill in all fields.");
      return;
    }

    try {
      setLoading(true);

      const response = await authAPI.login(formData);
      const token = response.data.access_token;

      if (!token) {
        setError("Login failed: token not received.");
        return;
      }

      login(token, { email: formData.email });
      navigate("/dashboard");
    } catch (err) {
      console.error("Login error:", err);
      setError(
        err?.response?.data?.detail ||
          err?.response?.data?.message ||
          "Invalid email or password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        
        {/* HEADER */}
        <div className="auth-header">
          <h1>Welcome Back</h1>
          <p>Login to continue your NeuroPath AI journey.</p>
        </div>

        {/* FORM */}
        <form className="auth-form" onSubmit={handleSubmit}>
          
          <div className="auth-input-group">
            <label>Email</label>
            <input
              className="auth-input"
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div className="auth-input-group">
            <label>Password</label>
            <input
              className="auth-input"
              type="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          {error && <div className="auth-error">{error}</div>}

          <button
            type="submit"
            className="auth-btn"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          <p className="auth-link">
            Don’t have an account?{" "}
            <Link to="/register">Create one</Link>
          </p>

        </form>
      </div>
    </div>
  );
}

export default Login;