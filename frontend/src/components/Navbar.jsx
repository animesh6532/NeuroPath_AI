import { useContext, useState, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { AppContext } from "../context/AppContext";
import { ThemeContext } from "../context/ThemeContext";
import { motion } from "framer-motion";
import { LogOut, User, Menu, X, BrainCircuit } from "lucide-react";
import "./Navbar.css";

function Navbar() {
  const { isAuthenticated, logout } = useContext(AuthContext);
  const { clearAllAppData } = useContext(AppContext);
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const [isShrunk, setIsShrunk] = useState(false);

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

  const navLinksData = isAuthenticated
    ? [
        { to: "/dashboard", label: "Dashboard" },
        { to: "/resume", label: "Resume Intelligence" },
        { to: "/interview", label: "AI Interview" },
        { to: "/placement", label: "Placement Engine" },
        { to: "/roadmap", label: "Roadmap" },
        { to: "/profile", label: "Profile" },
      ]
    : [
        { to: "/", label: "Home", end: true },
        { to: "/about", label: "About" },
      ];

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
          {navLinksData.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={closeMenu}
              end={link.end}
              style={{ position: "relative" }}
            >
              {({ isActive }) => (
                <>
                  <span className="nav-link-text">{link.label}</span>
                  {isActive && (
                    <motion.span
                      layoutId="activeNavIndicator"
                      className="active-nav-indicator"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </>
              )}
            </NavLink>
          ))}
          {isAuthenticated && (
            <button 
              onClick={() => { closeMenu(); handleLogout(); }} 
              className="navbar-logout-btn-link"
              style={{ 
                background: "none", 
                border: "none", 
                color: "var(--color-navy)", 
                fontSize: "0.85rem", 
                fontWeight: "600", 
                cursor: "pointer", 
                padding: "4px 0",
                fontFamily: "var(--font-sans)",
                textAlign: "left"
              }}
            >
              Logout
            </button>
          )}
        </nav>

        <div className="navbar-actions">
          {!isAuthenticated && (
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
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;