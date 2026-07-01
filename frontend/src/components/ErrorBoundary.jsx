import React from "react";
import { GlassCard, GlassButton } from "./ui/DesignSystem";
import { ShieldAlert, RefreshCw } from "lucide-react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error("[ErrorBoundary] caught an error:", error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      const componentStack = this.state.errorInfo?.componentStack || "";
      const match = componentStack.match(/in\s+([A-Za-z0-9_]+)/);
      const componentName = match ? match[1] : "Unknown Component";

      return (
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "24px",
            background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
            fontFamily: "'Outfit', 'Inter', sans-serif"
          }}
        >
          <GlassCard
            style={{
              maxWidth: "640px",
              width: "100%",
              padding: "40px",
              boxShadow: "0 20px 40px rgba(0, 0, 42, 0.08)",
              border: "1px solid rgba(255, 255, 255, 0.4)",
              borderRadius: "24px"
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: "16px" }}>
              <div
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "50%",
                  background: "rgba(239, 68, 68, 0.1)",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  color: "#ef4444",
                  marginBottom: "8px"
                }}
              >
                <ShieldAlert size={28} />
              </div>
              <h2 style={{ fontSize: "1.6rem", color: "var(--color-dark-blue)", margin: 0, fontWeight: 700 }}>
                Application Crash caught
              </h2>
              <p style={{ fontSize: "0.95rem", color: "var(--text-secondary)", margin: 0 }}>
                A runtime exception occurred in the component hierarchy.
              </p>
            </div>

            <div style={{ marginTop: "24px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ background: "rgba(255, 255, 255, 0.5)", border: "1px solid rgba(0, 0, 0, 0.05)", borderRadius: "12px", padding: "14px 18px" }}>
                <span style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)", fontWeight: 700 }}>
                  Failed Component
                </span>
                <div style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--color-navy)", marginTop: "4px" }}>
                  &lt;{componentName} /&gt;
                </div>
              </div>

              <div style={{ background: "rgba(255, 255, 255, 0.5)", border: "1px solid rgba(0, 0, 0, 0.05)", borderRadius: "12px", padding: "14px 18px" }}>
                <span style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)", fontWeight: 700 }}>
                  Error Message
                </span>
                <div style={{ fontSize: "0.95rem", fontWeight: 600, color: "#b91c1c", marginTop: "4px", fontFamily: "monospace", wordBreak: "break-all" }}>
                  {this.state.error?.toString() || "Error: Unknown execution fault."}
                </div>
              </div>

              <div style={{ background: "rgba(0, 0, 42, 0.03)", border: "1px solid rgba(0, 0, 0, 0.04)", borderRadius: "12px", padding: "14px 18px" }}>
                <span style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)", fontWeight: 700 }}>
                  Stack Trace
                </span>
                <pre
                  style={{
                    fontSize: "0.8rem",
                    color: "var(--text-secondary)",
                    marginTop: "6px",
                    overflow: "auto",
                    maxHeight: "160px",
                    textAlign: "left",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-all",
                    fontFamily: "'Courier New', Courier, monospace",
                    padding: "8px",
                    background: "rgba(255, 255, 255, 0.3)",
                    borderRadius: "6px"
                  }}
                >
                  {this.state.error?.stack || ""}
                  {"\n\nComponent Stack:\n"}
                  {componentStack}
                </pre>
              </div>
            </div>

            <div style={{ marginTop: "28px", display: "flex", justifyContent: "center" }}>
              <GlassButton primary onClick={this.handleRetry} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 24px" }}>
                <RefreshCw size={14} /> Retry & Reload App
              </GlassButton>
            </div>
          </GlassCard>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
