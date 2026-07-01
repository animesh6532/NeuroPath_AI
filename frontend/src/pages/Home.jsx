import { useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FileText, Cpu, ShieldAlert, BookOpen, Star, 
  HelpCircle, Sparkles, TrendingUp, Users, 
  Map, Award, ArrowRight, Code, Brain, ChevronDown, CheckCircle2 
} from "lucide-react";
import { GlassCard, GlassButton, GlassBadge } from "../components/ui/DesignSystem";
import "./Home.css";

// 1. V6 ACCORDION FAQ ITEM
const FAQItem = ({ question, answer }) => {
  const [open, setOpen] = useState(false);

  return (
    <GlassCard 
      className="faq-item-v6" 
      onClick={() => setOpen(!open)}
      whileHover={{ y: -2, scale: 1.002 }}
      style={{ padding: "20px 28px", cursor: "pointer" }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h4 style={{ fontSize: "1.05rem", color: "var(--color-dark-blue)", margin: 0 }}>{question}</h4>
        <ChevronDown size={18} style={{ color: "var(--color-medium-blue)", transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform var(--transition-fast)" }} />
      </div>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            style={{ overflow: "hidden", marginTop: "14px", borderTop: "1px solid var(--glass-border)", paddingTop: "14px" }}
          >
            <p className="text-body" style={{ fontSize: "0.9rem", color: "var(--text-secondary)", margin: 0 }}>{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </GlassCard>
  );
};

function Home() {
  const navigate = useNavigate();
  const { isAuthenticated } = useContext(AuthContext);

  const testimonials = [
    {
      name: "Siddharth Sharma",
      role: "Software Developer Intern at Amazon",
      text: "The adaptive mock interviews felt exactly like my actual Amazon round. The proctoring metrics kept me focused and the roadmap directed my final prep perfectly."
    },
    {
      name: "Dr. Ananya Roy",
      role: "Lead Recruiter, Apex Tech Systems",
      text: "We use NeuroPath's Career match predictions to validate student readiness. The scoring metrics are highly deterministic, which saves us massive filtering time."
    },
    {
      name: "Rohan Das",
      role: "Graduate Assistant at IIIT",
      text: "A masterclass in SaaS usability! Running a local NLP scoring engine without calling laggy APIs makes mock practicing incredibly snappy."
    }
  ];

  const faqs = [
    {
      question: "How does the Resume Intelligence engine work?",
      answer: "We support PDF, DOCX, and images natively. Using local NLP parses, the platform extracts technical skills, education timelines, and experiences, then queries our 21,984 occupation databases to predict career compatibility."
    },
    {
      question: "Does the platform require internet access for scoring?",
      answer: "No. The NLP models, SQLite databases, and Sentence Transformer matching run completely locally in our offline backend, securing data confidentiality and zero external API dependencies."
    },
    {
      question: "What does the proctor monitoring system capture?",
      answer: "The proctor monitor tracks candidate look-away events (via face and eye camera coordinates), window focus changes (tab-switching), and device disconnections, assigning subtle warnings in the final metrics report."
    },
    {
      question: "Can I download my final reports?",
      answer: "Yes. Once an interview session concludes, the backend aggregates all evaluation scores and compiles a print-ready PDF containing qualitative feedback, strengths, and roadmaps."
    }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="home-page"
    >
      {/* 1. HERO SECTION */}
      <section className="hero-section page-container" style={{ minHeight: "85vh", display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: "48px", alignItems: "center", paddingTop: "140px" }}>
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "16px" }}
        >
          <GlassBadge status="secondary">
            <Sparkles size={12} /> V6 Career OS
          </GlassBadge>

          <h1 className="text-display-v6">
            Build Your Career with <br />
            <span>NeuroPath AI</span>
          </h1>

          <p className="text-subtitle-v6" style={{ maxWidth: "520px", marginTop: "12px", color: "var(--text-secondary)" }}>
            A premium career matching OS compiling multi-factor alignment indices across 21,000+ real occupations, stateful adaptive mock voice interviews, and printable roadmap milestones.
          </p>

          <div style={{ display: "flex", gap: "14px", marginTop: "24px" }}>
            {!isAuthenticated ? (
              <>
                <GlassButton primary onClick={() => navigate("/register")}>
                  Get Started <ArrowRight size={16} />
                </GlassButton>
                <GlassButton onClick={() => navigate("/login")}>
                  Sign In
                </GlassButton>
              </>
            ) : (
              <GlassButton primary onClick={() => navigate("/dashboard")}>
                Go to Dashboard <ArrowRight size={16} />
              </GlassButton>
            )}
          </div>
        </motion.div>

        <motion.div 
          initial={{ scale: 0.96, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          style={{ display: "flex", justifyContent: "center" }}
        >
          <GlassCard style={{ width: "100%", maxWidth: "440px", padding: "36px" }} className="hero-preview-card">
            <h3 style={{ fontSize: "1.25rem", marginBottom: "20px", color: "var(--color-dark-blue)" }}>Live Analysis Preview</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "0.95rem", color: "var(--text-primary)" }}>
                <Brain size={18} style={{ color: "var(--color-medium-blue)" }} />
                <span>Resume Scoring Index: <strong style={{ color: "var(--color-dark-blue)" }}>92/100</strong></span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "0.95rem", color: "var(--text-primary)" }}>
                <TrendingUp size={18} style={{ color: "var(--color-medium-blue)" }} />
                <span>Best Fit Domain: <strong style={{ color: "var(--color-dark-blue)" }}>ML Engineering</strong></span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "0.95rem", color: "var(--text-primary)" }}>
                <CheckCircle2 size={18} style={{ color: "var(--color-medium-blue)" }} />
                <span>Webcam Proctoring: <strong style={{ color: "var(--color-dark-blue)" }}>Verified</strong></span>
              </div>
              <hr style={{ border: 0, height: "1px", background: "var(--glass-border)", margin: "8px 0" }} />
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                <GlassBadge status="secondary">FastAPI</GlassBadge>
                <GlassBadge status="secondary">React.js</GlassBadge>
                <GlassBadge status="secondary">PyTorch</GlassBadge>
                <GlassBadge status="secondary">Docker</GlassBadge>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </section>

      {/* 2. STATS */}
      <section className="stats-section page-container" style={{ paddingBottom: "80px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px" }}>
          {[
            ["21,984", "Standard Occupations"],
            ["130,923", "Skill Taxonomy Terms"],
            ["99.4%", "ATS Alignment Index"],
            ["< 10ms", "Matching Latency"]
          ].map(([val, label]) => (
            <GlassCard key={label} style={{ textAlign: "center", padding: "28px" }}>
              <h3 style={{ fontSize: "2.4rem", fontFamily: "var(--font-display)", color: "var(--color-dark-blue)", margin: "0 0 6px 0" }}>{val}</h3>
              <p className="text-small" style={{ margin: 0, fontWeight: "600", color: "var(--text-secondary)" }}>{label}</p>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* 3. KEY FEATURES */}
      <section className="features-section page-container" style={{ paddingBottom: "80px" }}>
        <div className="section-hdr" style={{ textAlign: "center", marginBottom: "54px" }}>
          <GlassBadge status="secondary">Features</GlassBadge>
          <h2 style={{ fontSize: "2.4rem", marginTop: "12px" }}>Autonomous Core Modules</h2>
          <p className="text-subtitle" style={{ maxWidth: "480px", margin: "10px auto 0 auto", color: "var(--text-secondary)" }}>Engineered to maximize placement conversions locally.</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "24px" }}>
          <GlassCard style={{ display: "flex", flexDirection: "column", gap: "16px", alignItems: "flex-start" }}>
            <div style={{ padding: "10px", background: "rgba(68, 106, 156, 0.08)", borderRadius: "8px", color: "var(--color-medium-blue)" }}><FileText size={22} /></div>
            <h3>Resume Intelligence</h3>
            <p className="text-body" style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>Universal text parser and OCR decoder extraction. Maps structures against occupational categories.</p>
          </GlassCard>

          <GlassCard style={{ display: "flex", flexDirection: "column", gap: "16px", alignItems: "flex-start" }}>
            <div style={{ padding: "10px", background: "rgba(68, 106, 156, 0.08)", borderRadius: "8px", color: "var(--color-medium-blue)" }}><Cpu size={22} /></div>
            <h3>Adaptive AI Interview</h3>
            <p className="text-body" style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>Stateful mock voice checks that adapt question scopes on the fly, triggering targeted follow-ups.</p>
          </GlassCard>

          <GlassCard style={{ display: "flex", flexDirection: "column", gap: "16px", alignItems: "flex-start" }}>
            <div style={{ padding: "10px", background: "rgba(68, 106, 156, 0.08)", borderRadius: "8px", color: "var(--color-medium-blue)" }}><TrendingUp size={22} /></div>
            <h3>Placement Forecaster</h3>
            <p className="text-body" style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>Predictive candidate readiness indexes that scan resume qualities, proctor warnings, and speaking profiles.</p>
          </GlassCard>

          <GlassCard style={{ display: "flex", flexDirection: "column", gap: "16px", alignItems: "flex-start" }}>
            <div style={{ padding: "10px", background: "rgba(68, 106, 156, 0.08)", borderRadius: "8px", color: "var(--color-medium-blue)" }}><Map size={22} /></div>
            <h3>Roadmap Milestones</h3>
            <p className="text-body" style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>Interactive steps checklist highlighting missing technologies, tutorials, and mock sandbox project targets.</p>
          </GlassCard>
        </div>
      </section>

      {/* 4. RECRUITER TRAINING SUITE */}
      <section className="modules-section page-container" style={{ paddingBottom: "80px" }}>
        <div className="section-hdr" style={{ textAlign: "center", marginBottom: "54px" }}>
          <GlassBadge status="secondary">SaaS Extension</GlassBadge>
          <h2 style={{ fontSize: "2.4rem", marginTop: "12px" }}>Recruiter Assessment Suite</h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
          <GlassCard style={{ display: "flex", gap: "20px", alignItems: "flex-start", cursor: "pointer" }} onClick={() => navigate("/dashboard")}>
            <Code size={24} className="text-secondary" style={{ marginTop: "4px", color: "var(--color-medium-blue)" }} />
            <div>
              <h4 style={{ fontSize: "1.15rem", marginBottom: "6px" }}>Technical Challenge IDE</h4>
              <p className="text-small" style={{ margin: 0, color: "var(--text-secondary)" }}>Full-screen LeetCode-style compiler environments with tab focus and fullscreen escape monitors.</p>
            </div>
          </GlassCard>
          
          <GlassCard style={{ display: "flex", gap: "20px", alignItems: "flex-start", cursor: "pointer" }} onClick={() => navigate("/dashboard")}>
            <Award size={24} className="text-secondary" style={{ marginTop: "4px", color: "var(--color-medium-blue)" }} />
            <div>
              <h4 style={{ fontSize: "1.15rem", marginBottom: "6px" }}>Cognitive Aptitude Tests</h4>
              <p className="text-small" style={{ margin: 0, color: "var(--text-secondary)" }}>Logical reasoning and verbal assessments structured into standard test interfaces.</p>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* 5. CAREER TIMELINE */}
      <section className="journey-section page-container" style={{ paddingBottom: "80px" }}>
        <div className="section-hdr" style={{ textAlign: "center", marginBottom: "54px" }}>
          <GlassBadge status="secondary">Timeline</GlassBadge>
          <h2 style={{ fontSize: "2.4rem", marginTop: "12px" }}>Dynamic Seniority Levels</h2>
        </div>
        <GlassCard style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "40px" }} className="journey-card-v6">
          <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
            <span style={{ width: "32px", height: "32px", borderRadius: "50%", background: "var(--color-soft-blue)", color: "var(--color-dark-blue)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700" }}>1</span>
            <h4 style={{ margin: 0 }}>Intern Level</h4>
            <p className="text-small" style={{ margin: 0, color: "var(--text-secondary)" }}>Core syntaxes & script frameworks</p>
          </div>
          <span style={{ color: "var(--color-medium-blue)" }}>→</span>
          <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
            <span style={{ width: "32px", height: "32px", borderRadius: "50%", background: "var(--color-soft-blue)", color: "var(--color-dark-blue)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700" }}>2</span>
            <h4 style={{ margin: 0 }}>Associate Developer</h4>
            <p className="text-small" style={{ margin: 0, color: "var(--text-secondary)" }}>Feature designs & component testing</p>
          </div>
          <span style={{ color: "var(--color-medium-blue)" }}>→</span>
          <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
            <span style={{ width: "32px", height: "32px", borderRadius: "50%", background: "var(--color-soft-blue)", color: "var(--color-dark-blue)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700" }}>3</span>
            <h4 style={{ margin: 0 }}>Lead Systems Architect</h4>
            <p className="text-small" style={{ margin: 0, color: "var(--text-secondary)" }}>Infrastructure scaling & audits</p>
          </div>
        </GlassCard>
      </section>

      {/* 6. TESTIMONIALS */}
      <section className="testimonials-section page-container" style={{ paddingBottom: "80px" }}>
        <div className="section-hdr" style={{ textAlign: "center", marginBottom: "54px" }}>
          <GlassBadge status="secondary">Reviews</GlassBadge>
          <h2 style={{ fontSize: "2.4rem", marginTop: "12px" }}>Trusted by Candidates & Recruiters</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px" }}>
          {testimonials.map((t, idx) => (
            <GlassCard key={idx} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "flex", gap: "4px" }}>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} className="text-warning fill-warning" style={{ color: "#fbbf24", fill: "#fbbf24" }} />
                ))}
              </div>
              <p className="text-body" style={{ fontStyle: "italic", fontSize: "0.95rem", color: "var(--text-primary)" }}>"{t.text}"</p>
              <div style={{ display: "flex", flexDirection: "column", borderTop: "1px solid var(--glass-border)", paddingTop: "12px", marginTop: "auto" }}>
                <strong style={{ color: "var(--color-dark-blue)" }}>{t.name}</strong>
                <span className="text-small" style={{ color: "var(--text-secondary)" }}>{t.role}</span>
              </div>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* 7. FAQ */}
      <section className="faq-section page-container" style={{ paddingBottom: "80px" }}>
        <div className="section-hdr" style={{ textAlign: "center", marginBottom: "54px" }}>
          <GlassBadge status="secondary"><HelpCircle size={12} /> FAQ</GlassBadge>
          <h2 style={{ fontSize: "2.4rem", marginTop: "12px" }}>Frequently Answered Inquiries</h2>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px", maxWidth: "800px", margin: "0 auto" }}>
          {faqs.map((f, idx) => (
            <FAQItem key={idx} question={f.question} answer={f.answer} />
          ))}
        </div>
      </section>

      {/* 8. FOOTER */}
      <footer className="footer page-container" style={{ borderTop: "1px solid var(--glass-border)", paddingTop: "48px", display: "grid", gridTemplateColumns: "2fr 1fr", gap: "40px" }}>
        <div>
          <h3 style={{ color: "var(--color-dark-blue)" }}>NeuroPath AI</h3>
          <p className="text-small" style={{ marginTop: "6px", color: "var(--text-secondary)" }}>Enterprise Career Matching & Readiness OS.</p>
        </div>
        <div style={{ display: "flex", gap: "24px", justifyContent: "flex-end" }}>
          <a href="#privacy" className="text-small" style={{ color: "var(--text-secondary)", textDecoration: "none" }}>Privacy</a>
          <a href="#terms" className="text-small" style={{ color: "var(--text-secondary)", textDecoration: "none" }}>Terms</a>
          <a href="#support" className="text-small" style={{ color: "var(--text-secondary)", textDecoration: "none" }}>Support</a>
        </div>
        <div className="footer-copy" style={{ gridColumn: "1 / -1", textAlign: "center", paddingTop: "20px", borderTop: "1px solid rgba(255,255,255,0.04)", color: "var(--text-muted)", fontSize: "0.75rem" }}>
          <p>© {new Date().getFullYear()} NeuroPath AI. All rights reserved. Managed completely locally.</p>
        </div>
      </footer>
    </motion.div>
  );
}

export default Home;