import { useContext, useState, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import { AppContext } from "../contexts/AppContext";
import { ThemeContext } from "../contexts/ThemeContext";
import { motion } from "framer-motion";
import { LogOut, User, Menu, X, BrainCircuit } from "lucide-react";
import { GlassButton } from "./ui/DesignSystem";
import "./Navbar.css";

function Navbar() {
  const { user, logout } = useContext(AuthContext);
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
    navigate("/");
  };

  const closeMenu = () => setMenuOpen(false);

  const mainLinks = user
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

  const actionLinks = user
    ? [
        { label: "Logout", onClick: handleLogout, isLogout: true }
      ]
    : [
        { to: "/login", label: "Login" },
        { to: "/register", label: "Get Started", isPrimary: true }
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
          {mainLinks.map((link) => (
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
          
          {/* Mobile only actions */}
          <div className="mobile-only-actions">
            {actionLinks.map((link) => {
              if (link.isLogout) {
                return (
                  <button
                    key={link.label}
                    onClick={() => { closeMenu(); link.onClick(); }}
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
                );
              }
              return (
                <GlassButton
                  key={link.label}
                  primary={link.isPrimary}
                  onClick={() => { closeMenu(); navigate(link.to); }}
                  style={{ width: "100%", justifyContent: "center" }}
                >
                  {link.label}
                </GlassButton>
              );
            })}
          </div>
        </nav>

        {/* Desktop only actions */}
        <div className="navbar-actions desktop-only-actions">
          {actionLinks.map((link) => {
            if (link.isLogout) {
              return (
                <button
                  key={link.label}
                  onClick={link.onClick}
                  className="navbar-logout-btn-link logout-btn"
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--color-navy)",
                    fontSize: "0.85rem",
                    fontWeight: "600",
                    cursor: "pointer",
                    padding: "6px 12px",
                    fontFamily: "var(--font-sans)"
                  }}
                >
                  Logout
                </button>
              );
            }
             return (
              <GlassButton
                key={link.label}
                primary={link.isPrimary}
                onClick={() => navigate(link.to)}
              >
                {link.label}
              </GlassButton>
            );
          })}
        </div>
      </div>
    </header>
  );
}

export default Navbar;
