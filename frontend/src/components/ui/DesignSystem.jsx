import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

// 1. DYNAMIC CURSOR-TRACKING REFLECTIVE CARD (Frosted Glass rgba(255,255,255,.55))
export const GlassCard = ({ children, className = "", whileHover, style = {}, ...props }) => {
  const [coords, setCoords] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setCoords({ x, y });
  };

  return (
    <motion.div
      className={`glass-card-v6 ${className}`}
      onMouseMove={handleMouseMove}
      style={{
        "--mouse-x": `${coords.x}px`,
        "--mouse-y": `${coords.y}px`,
        position: "relative",
        background: "var(--glass-bg)",
        backdropFilter: "blur(30px) saturate(160%)",
        WebkitBackdropFilter: "blur(30px) saturate(160%)",
        border: "1px solid var(--glass-border)",
        borderRadius: "24px",
        padding: "32px",
        overflow: "hidden",
        boxShadow: "var(--glass-shadow)",
        ...style
      }}
      whileHover={whileHover !== undefined ? whileHover : { y: -4, scale: 1.008 }}
      transition={{ type: "spring", stiffness: 350, damping: 22 }}
      {...props}
    >
      {/* Very soft white cursor spotlight highlight */}
      <div 
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          pointerEvents: "none",
          background: `radial-gradient(450px circle at var(--mouse-x, 0px) var(--mouse-y, 0px), rgba(255, 255, 255, 0.45), transparent 80%)`,
          opacity: 0.85,
          zIndex: 1
        }}
      />
      <div style={{ position: "relative", zIndex: 2 }}>{children}</div>
    </motion.div>
  );
};

// 2. GRADIENT SPRING BUTTON (#446A9C to #1A3F75)
export const GlassButton = ({ children, className = "", primary = false, style = {}, ...props }) => {
  // Primary buttons use the requested blue gradient.
  // Secondary buttons use a light glass frosted background with navy text.
  const buttonBg = primary 
    ? "linear-gradient(135deg, #446A9C, #1A3F75)" 
    : "rgba(255, 255, 255, 0.65)";
  const buttonColor = primary 
    ? "#E8F3FF" /* very light blue, legible, non-white */
    : "var(--color-navy)";
  const buttonBorder = primary
    ? "1px solid rgba(255, 255, 255, 0.25)"
    : "1px solid rgba(26, 63, 117, 0.25)";
  const buttonShadow = primary
    ? "0 4px 12px rgba(26, 63, 117, 0.12), inset 0 1px 1px rgba(255, 255, 255, 0.3)"
    : "0 4px 12px rgba(0, 0, 42, 0.02)";

  return (
    <motion.button
      className={`glass-btn-v6 ${className}`}
      style={{
        background: buttonBg,
        border: buttonBorder,
        color: buttonColor,
        padding: "12px 24px",
        fontWeight: "600",
        borderRadius: "9999px",
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        cursor: "pointer",
        fontSize: "0.9rem",
        boxShadow: buttonShadow,
        fontFamily: "var(--font-sans)",
        ...style
      }}
      whileHover={{ 
        scale: 1.03, 
        y: -1,
        background: primary 
          ? "linear-gradient(135deg, #5D85B7, #244C85)" 
          : "rgba(255, 255, 255, 0.85)",
        boxShadow: primary
          ? "0 6px 16px rgba(26, 63, 117, 0.22)"
          : "0 6px 16px rgba(0, 0, 42, 0.05)"
      }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 450, damping: 14 }}
      {...props}
    >
      {children}
    </motion.button>
  );
};

// 3. BRIGHT FROSTED TEXT INPUT
export const GlassInput = ({ className = "", style = {}, ...props }) => {
  return (
    <input
      className={`glass-input-v6 glass-focus-ring ${className}`}
      style={{
        background: "rgba(255, 255, 255, 0.6)",
        border: "1px solid var(--glass-border)",
        borderRadius: "12px",
        color: "var(--color-dark-blue)",
        padding: "12px 16px",
        fontFamily: "var(--font-sans)",
        fontSize: "0.95rem",
        width: "100%",
        transition: "all var(--transition-fast)",
        ...style
      }}
      {...props}
    />
  );
};

// 4. BRIGHT SELECT DROPDOWN
export const GlassSelect = ({ children, className = "", style = {}, ...props }) => {
  return (
    <select
      className={`glass-select-v6 glass-focus-ring ${className}`}
      style={{
        background: "rgba(255, 255, 255, 0.6)",
        border: "1px solid var(--glass-border)",
        borderRadius: "12px",
        color: "var(--color-dark-blue)",
        padding: "12px 16px",
        fontFamily: "var(--font-sans)",
        fontSize: "0.95rem",
        width: "100%",
        cursor: "pointer",
        transition: "all var(--transition-fast)",
        ...style
      }}
      {...props}
    >
      {children}
    </select>
  );
};

// 5. DESIGN BADGE (Optimized readability for light mode - dark text on tinted light backgrounds)
export const GlassBadge = ({ children, className = "", status = "default", style = {} }) => {
  const getColors = () => {
    switch (status) {
      case "success": return { bg: "rgba(16, 185, 129, 0.15)", border: "rgba(16, 185, 129, 0.3)", text: "#065f46" };
      case "warning": return { bg: "rgba(245, 158, 11, 0.15)", border: "rgba(245, 158, 11, 0.3)", text: "#92400e" };
      case "danger":  return { bg: "rgba(239, 68, 68, 0.12)", border: "rgba(239, 68, 68, 0.25)", text: "#991b1b" };
      case "secondary": return { bg: "rgba(68, 106, 156, 0.12)", border: "rgba(68, 106, 156, 0.25)", text: "var(--color-navy)" };
      default: return { bg: "rgba(255, 255, 255, 0.65)", border: "rgba(255, 255, 255, 0.8)", text: "var(--color-navy)" };
    }
  };

  const colors = getColors();

  return (
    <span
      className={`glass-badge-v6 ${className}`}
      style={{
        background: colors.bg,
        border: `1px solid ${colors.border}`,
        color: colors.text,
        padding: "4px 12px",
        borderRadius: "9999px",
        fontSize: "0.75rem",
        fontWeight: "600",
        textTransform: "uppercase",
        letterSpacing: "0.05em",
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        ...style
      }}
    >
      {children}
    </span>
  );
};

// 6. DYNAMIC GRADIENT PROGRESS (Light progress bar)
export const GlassProgress = ({ value = 0, className = "", style = {} }) => {
  return (
    <div
      className={`glass-progress-v6 ${className}`}
      style={{
        width: "100%",
        height: "8px",
        background: "rgba(0, 0, 42, 0.05)",
        border: "1px solid var(--glass-border)",
        borderRadius: "9999px",
        overflow: "hidden",
        ...style
      }}
    >
      <motion.div
        style={{
          height: "100%",
          background: "linear-gradient(90deg, #446A9C, #1A3F75)",
          borderRadius: "9999px"
        }}
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      />
    </div>
  );
};

// 7. STAT METRIC WIDGET
export const GlassMetric = ({ title, value, caption, icon: Icon, className = "", style = {} }) => {
  return (
    <GlassCard className={`glass-metric-v6 ${className}`} style={{ padding: "24px", ...style }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
        <span className="text-caption" style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>{title}</span>
        {Icon && <Icon size={16} style={{ color: "var(--color-navy)" }} />}
      </div>
      <div style={{ fontSize: "2.2rem", fontWeight: "800", fontFamily: "var(--font-display)", color: "var(--color-dark-blue)" }}>{value}</div>
      {caption && <p className="text-small" style={{ marginTop: "6px", color: "var(--text-muted)", fontSize: "0.8rem" }}>{caption}</p>}
    </GlassCard>
  );
};

// 8. ACCESSIBLE GLOSSY DIALOG MODAL (Light backdrop with blur)
export const GlassModal = ({ isOpen, onClose, title, children }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="modal-overlay"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0, 0, 42, 0.08)",
            backdropFilter: "blur(14px)",
            WebkitBackdropFilter: "blur(14px)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1100,
            padding: "20px"
          }}
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ scale: 0.96, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.96, opacity: 0, y: 10 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            style={{ width: "100%", maxWidth: "520px", maxHeight: "90vh", overflowY: "auto" }}
          >
            <GlassCard style={{ padding: "32px", position: "relative" }}>
              <button
                onClick={onClose}
                style={{
                  position: "absolute",
                  top: "20px",
                  right: "20px",
                  background: "none",
                  border: "none",
                  color: "var(--text-secondary)",
                  cursor: "pointer",
                  padding: 4
                }}
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
              {title && <h2 style={{ fontSize: "1.45rem", marginBottom: "8px", fontWeight: "700", color: "var(--color-dark-blue)" }}>{title}</h2>}
              <div style={{ marginTop: "16px" }}>{children}</div>
            </GlassCard>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

// 9. PREMIUM TABS NAVIGATION (Tabs with standard light theme gradient active state)
export const GlassTabs = ({ tabs, activeTab, onChange, className = "", style = {} }) => {
  return (
    <div
      className={`glass-tabs-v6 ${className}`}
      style={{
        display: "inline-flex",
        background: "rgba(255, 255, 255, 0.35)",
        border: "1px solid var(--glass-border)",
        borderRadius: "9999px",
        padding: "6px",
        gap: "4px",
        boxShadow: "0 4px 12px rgba(0, 0, 42, 0.02)",
        ...style
      }}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            style={{
              padding: "8px 18px",
              borderRadius: "9999px",
              border: 0,
              background: isActive ? "linear-gradient(135deg, #446A9C, #1A3F75)" : "transparent",
              color: isActive ? "#E8F3FF" : "var(--text-primary)",
              fontWeight: "600",
              fontSize: "0.85rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              transition: "all var(--transition-fast)"
            }}
          >
            {tab.icon && tab.icon}
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};

// 10. TIMELINE FLOW CONTAINER
export const GlassTimeline = ({ children, className = "" }) => {
  return (
    <div
      className={`glass-timeline-v6 ${className}`}
      style={{
        position: "relative",
        paddingLeft: "28px"
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "8px",
          bottom: "8px",
          left: "4px",
          width: "2px",
          background: "var(--glass-border)"
        }}
      />
      {children}
    </div>
  );
};

export const GlassTimelineNode = ({ stepNumber, title, level, children, resources = [] }) => {
  return (
    <div style={{ position: "relative", marginBottom: "24px" }}>
      <div
        style={{
          position: "absolute",
          left: "-35px",
          top: "12px",
          width: "16px",
          height: "16px",
          borderRadius: "50%",
          background: "var(--color-medium-blue)",
          border: "4px solid var(--bg-primary)"
        }}
      />
      <GlassCard style={{ padding: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
          <h4 style={{ margin: 0, fontSize: "1rem", color: "var(--color-dark-blue)" }}>{title}</h4>
          <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
            <span className="text-small" style={{ fontWeight: "700" }}>Milestone {stepNumber}</span>
            {level && <GlassBadge status="secondary">{level}</GlassBadge>}
          </div>
        </div>
        <div className="text-body" style={{ fontSize: "0.9rem" }}>{children}</div>
      </GlassCard>
    </div>
  );
};
