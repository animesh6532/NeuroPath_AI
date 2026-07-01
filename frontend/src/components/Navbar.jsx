import { useContext, useState, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { AppContext } from "../context/AppContext";
import { ThemeContext } from "../context/ThemeContext";
import { Sun, Moon, LogOut, User, Menu, X, BrainCircuit } from "lucide-react";
import "./Navbar.css";

function Navbar() {
  const { isAuthenticated, logout } = useContext(AuthContext);
  const { clearAllAppData } = useContext(AppContext);
  const { darkMode, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const [isShrunk, setIsShrunk] = useState(false);

  // Scroll listener to shrink navbar dynamically
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsShrunk(true);
      } else {
        setIsShrunk(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    clearAllAppData();
    navigate("/login");
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className={`navbar-wrapper-v6 ${isShrunk ? "shrunk" : ""}`}>
      <div className="navbar-container-v6 glass-card-v6">
        <Link to="/" className="navbar-logo" onClick={closeMenu}>
          <BrainCircuit size={20} className="logo-icon" />
          <span>NeuroPath</span>
          <span className="logo-accent">AI</span>
        </Link>

        <button
          className="menu-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>

        <nav className={`navbar-links ${menuOpen ? "open" : ""}`}>
          <NavLink to="/" onClick={closeMenu} end>
            Home
          </NavLink>

          {isAuthenticated && (
            <>
              <NavLink to="/dashboard" onClick={closeMenu}>
                Dashboard
              </NavLink>
              <NavLink to="/resume" onClick={closeMenu}>
                Resume Intelligence
              </NavLink>
              <NavLink to="/interview" onClick={closeMenu}>
                AI Interview
              </NavLink>
              <NavLink to="/placement" onClick={closeMenu}>
                Placement Engine
              </NavLink>
              <NavLink to="/roadmap" onClick={closeMenu}>
                Roadmap
              </NavLink>
            </>
          )}
        </nav>

        <div className="navbar-actions">
          {/* Theme button removed to enforce the light glass theme */}

          {!isAuthenticated ? (
            <div className="auth-btns">
              <button
                className="glass-btn-v6-nav"
                onClick={() => navigate("/login")}
              >
                Login
              </button>
              <button
                className="glass-btn-v6-nav primary"
                onClick={() => navigate("/register")}
              >
                Get Started
              </button>
            </div>
          ) : (
            <div className="user-actions">
              <NavLink to="/profile" className="profile-link" onClick={closeMenu} title="Profile">
                <User size={16} />
              </NavLink>
              <button className="icon-btn logout-btn" onClick={handleLogout} title="Logout">
                <LogOut size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;