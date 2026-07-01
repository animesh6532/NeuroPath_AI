import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FileText, Cpu, ShieldAlert, BookOpen, Star, 
  HelpCircle, Sparkles, TrendingUp, 
  Award, ArrowRight, Code, Brain, ChevronDown, CheckCircle2, Mic, Play, RefreshCw, Laptop
} from "lucide-react";
import { GlassCard, GlassButton, GlassBadge } from "../components/ui/DesignSystem";
import "./Home.css";

// ─── ACCORDION FAQ ITEM ───
const FAQItem = ({ question, answer }) => {
  const [open, setOpen] = useState(false);

  return (
    <div 
      className={`faq-accordion-item ${open ? "open" : ""}`}
      onClick={() => setOpen(!open)}
    >
      <div className="faq-question-row">
        <h3>{question}</h3>
        <ChevronDown size={16} className="faq-chevron" />
      </div>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="faq-answer-wrap"
          >
            <p>{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── TESTIMONIALS SLIDER ───
const TestimonialsSlider = () => {
  const testimonials = [
    {
      name: "Siddharth Sharma",
      role: "Software Intern at Amazon",
      text: "The adaptive voice rounds felt exactly like my actual loop. The proctoring index kept me sharp and the milestones directed my preparation."
    },
    {
      name: "Dr. Ananya Roy",
      role: "Lead Recruiter, Apex Systems",
      text: "We use NeuroPath's match predictions to validate readiness. The scoring metrics are highly deterministic and save us hours of screening."
    },
    {
      name: "Rohan Das",
      role: "Graduate Candidate at IIIT",
      text: "A masterclass in SaaS design. Running local NLP parsers without laggy API calls makes mock practice incredibly snappy."
    }
  ];

  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  return (
    <div className="testimonials-slider-container">
      <AnimatePresence mode="wait">
        <motion.div
          key={activeIdx}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25 }}
          className="testimonial-active-card"
        >
          <div className="testimonial-stars">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={14} className="star-icon" />
            ))}
          </div>
          <p className="testimonial-text">"{testimonials[activeIdx].text}"</p>
          <div className="testimonial-meta">
            <strong>{testimonials[activeIdx].name}</strong>
            <span>{testimonials[activeIdx].role}</span>
          </div>
        </motion.div>
      </AnimatePresence>
      <div className="testimonials-dots">
        {testimonials.map((_, idx) => (
          <button
            key={idx}
            className={`dot-btn ${activeIdx === idx ? "active" : ""}`}
            onClick={() => setActiveIdx(idx)}
          />
        ))}
      </div>
    </div>
  );
};

// ─── STATEFUL ROADMAP PREVIEW ───
const StatefulRoadmapPreview = () => {
  const [completed, setCompleted] = useState({
    api: true,
    docker: false,
    system: false
  });

  const toggle = (key) => {
    setCompleted(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const count = Object.values(completed).filter(Boolean).length;
  const progressPercent = Math.round((count / 3) * 100);

  return (
    <div className="roadmap-preview-card glass-card-v6">
      <div className="roadmap-preview-header">
        <div>
          <h4>Upskilling Milestones</h4>
          <p className="text-small">Interactive career focus checklist</p>
        </div>
        <div className="progress-ring-badge">
          {progressPercent}% Done
        </div>
      </div>
      
      <div className="roadmap-checklist">
        <div className={`checklist-item ${completed.api ? "checked" : ""}`} onClick={() => toggle("api")}>
          <span className="checkbox-indicator" />
          <div>
            <strong>FastAPI Development</strong>
            <p className="text-caption">Build secure local REST routes</p>
          </div>
        </div>
        <div className={`checklist-item ${completed.docker ? "checked" : ""}`} onClick={() => toggle("docker")}>
          <span className="checkbox-indicator" />
          <div>
            <strong>Docker Containerization</strong>
            <p className="text-caption">Containerize system environments</p>
          </div>
        </div>
        <div className={`checklist-item ${completed.system ? "checked" : ""}`} onClick={() => toggle("system")}>
          <span className="checkbox-indicator" />
          <div>
            <strong>System Design Patterns</strong>
            <p className="text-caption">Master caching and database shards</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── INTERACTIVE BROWSER DEMO ───
const InteractiveBrowserDemo = () => {
  const [activeDemoTab, setActiveDemoTab] = useState("resume");
  const [parseState, setParseState] = useState("idle");

  const triggerSimulation = () => {
    if (activeDemoTab === "resume") {
      setParseState("loading");
      setTimeout(() => setParseState("done"), 1500);
    }
  };

  useEffect(() => {
    setParseState("idle");
  }, [activeDemoTab]);

  return (
    <div className="browser-mockup-window glass-card-v6">
      <div className="browser-header-bar">
        <div className="browser-actions-dots">
          <span className="dot dot-red" />
          <span className="dot dot-yellow" />
          <span className="dot dot-green" />
        </div>
        <div className="browser-address-bar">
          localhost:3000/sandbox-assessment
        </div>
      </div>

      <div className="browser-content-pane">
        <div className="browser-side-tabs">
          <button 
            className={`side-tab-btn ${activeDemoTab === "resume" ? "active" : ""}`}
            onClick={() => setActiveDemoTab("resume")}
          >
            <FileText size={14} /> Resume Scan
          </button>
          <button 
            className={`side-tab-btn ${activeDemoTab === "voice" ? "active" : ""}`}
            onClick={() => setActiveDemoTab("voice")}
          >
            <Mic size={14} /> Voice Proctor
          </button>
        </div>

        <div className="browser-preview-body">
          {activeDemoTab === "resume" && (
            <div className="demo-body-wrap">
              {parseState === "idle" && (
                <div style={{ textAlign: "center" }}>
                  <p className="text-body" style={{ marginBottom: "16px" }}>Simulate regional parsing of skills taxonomy matrices.</p>
                  <GlassButton primary onClick={triggerSimulation}>Scan resume_profile.pdf</GlassButton>
                </div>
              )}
              {parseState === "loading" && (
                <div className="demo-loading-state">
                  <RefreshCw size={24} className="icon-spin text-secondary" />
                  <p className="text-small pulsing">Extracting skills mapping and career alignment indices...</p>
                </div>
              )}
              {parseState === "done" && (
                <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="demo-result-state">
                  <h4 style={{ color: "var(--color-navy)", marginBottom: "8px" }}>NLP Matching Results</h4>
                  <div style={{ display: "flex", gap: "6px", justifyContent: "center", marginBottom: "12px" }}>
                    <span className="demo-tag-highlight">FastAPI</span>
                    <span className="demo-tag-highlight">Docker</span>
                    <span className="demo-tag-highlight">TensorFlow</span>
                  </div>
                  <strong>ATS Match Index: 92% Compatibility</strong>
                </motion.div>
              )}
            </div>
          )}

          {activeDemoTab === "voice" && (
            <div className="demo-body-wrap" style={{ textAlign: "center" }}>
              <div style={{ display: "flex", gap: "3px", justifyContent: "center", marginBottom: "14px" }}>
                <span className="wave-bar active" />
                <span className="wave-bar active" style={{ animationDelay: "0.2s" }} />
                <span className="wave-bar active" style={{ animationDelay: "0.4s" }} />
                <span className="wave-bar active" style={{ animationDelay: "0.1s" }} />
              </div>
              <p className="text-body" style={{ fontStyle: "italic", fontSize: "0.9rem", color: "var(--color-navy)" }}>
                "We implement local Docker containers to run proctored evaluations, ensuring privacy."
              </p>
              <div style={{ marginTop: "14px", fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                🎙 Streaming mic transcription active
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── MAIN HOME COMPONENT ───
function Home() {
  const navigate = useNavigate();
  const { isAuthenticated } = useContext(AuthContext);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  if (isAuthenticated) {
    return null;
  }

  const faqs = [
    {
      question: "How does the Resume Intelligence engine work?",
      answer: "We support PDF and image uploads. Using local NLP parsers, our backend decodes structure taxonomy matrices, queries 21,000+ occupation databases, and scores career readiness."
    },
    {
      question: "Is data secured offline?",
      answer: "Yes. The parsing engines, SQLite databases, and Sentence Transformer matching models operate completely locally on our offline systems, guaranteeing data confidentiality."
    },
    {
      question: "What does the proctoring monitor capture?",
      answer: "The proctor tracks eye look-away coordinates, tab changes, and keyboard window focus lost events, providing candidate integrity metrics in the final score card."
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
      <section className="hero-section page-container">
        
        {/* Left Info Panel */}
        <div className="hero-left-col">
          <div className="badge-wrapper-v6">
            <span className="ai-badge-pill">
              <Sparkles size={11} /> AI Career Operating System
            </span>
          </div>

          <h1 className="hero-main-title">
            The AI Career <br />
            <span>Operating System.</span>
          </h1>

          <p className="hero-subtext">
            Deploy autonomous resume decoders, stateful speech simulators, and predictive matching engines to pilot your placement readiness.
          </p>

          <div className="hero-cta-buttons">
            {!isAuthenticated ? (
              <>
                <GlassButton primary onClick={() => navigate("/register")}>
                  Get Started <ArrowRight size={14} style={{ marginLeft: "4px" }} />
                </GlassButton>
                <GlassButton onClick={() => navigate("/login")}>
                  Watch Demo
                </GlassButton>
              </>
            ) : (
              <GlassButton primary onClick={() => navigate("/dashboard")}>
                Go to Dashboard <ArrowRight size={14} style={{ marginLeft: "4px" }} />
              </GlassButton>
            )}
          </div>

          <div className="hero-trust-indicators">
            <span>● Secured Local Data</span>
            <span>● ATS Compatibility Indexing</span>
            <span>● Zero Latency Engine</span>
          </div>
        </div>

        {/* Right Illustration & Floating Glass Widgets */}
        <div className="hero-right-col">
          <div className="illustration-wrapper">
            <img 
              src="/landing_bg.png" 
              alt="NeuroPath AI Vector Backdrop"
              className="hero-illustration-img"
            />
            
            {/* FLOATING CARD 1: Resume Score */}
            <motion.div 
              className="floating-widget resume-widget"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            >
              <FileText size={14} className="text-secondary" />
              <div>
                <strong>Resume Alignment</strong>
                <span>Score Index: 92%</span>
              </div>
            </motion.div>

            {/* FLOATING CARD 2: Interview Analysis */}
            <motion.div 
              className="floating-widget interview-widget"
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            >
              <Mic size={14} className="text-success" />
              <div>
                <strong>Vocal Fluency</strong>
                <span>88% Clarity Index</span>
              </div>
            </motion.div>

            {/* FLOATING CARD 3: Placement Prediction */}
            <motion.div 
              className="floating-widget placement-widget"
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            >
              <TrendingUp size={14} className="text-secondary" />
              <div>
                <strong>ML Architect</strong>
                <span>96% Readiness</span>
              </div>
            </motion.div>

            {/* FLOATING CARD 4: Roadmap Check */}
            <motion.div 
              className="floating-widget roadmap-widget"
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
            >
              <CheckCircle2 size={14} style={{ color: "#10b981" }} />
              <div>
                <strong>Docker Module</strong>
                <span>Milestone Complete</span>
              </div>
            </motion.div>
          </div>
        </div>

      </section>

      {/* 2. TRUSTED STATISTICS */}
      <section className="statistics-ticker-section page-container">
        <div className="stats-ticker-row">
          <div className="ticker-item">
            <strong>21,984</strong>
            <span>Standard Occupations</span>
          </div>
          <span className="ticker-divider">|</span>
          <div className="ticker-item">
            <strong>130,923</strong>
            <span>Taxonomy Nodes</span>
          </div>
          <span className="ticker-divider">|</span>
          <div className="ticker-item">
            <strong>99.4%</strong>
            <span>ATS Match Rate</span>
          </div>
          <span className="ticker-divider">|</span>
          <div className="ticker-item">
            <strong>&lt; 10ms</strong>
            <span>Matching Latency</span>
          </div>
        </div>
      </section>

      {/* 3. PROBLEM SECTION (Timeline style) */}
      <section className="problem-timeline-section page-container">
        <div className="section-title-wrap">
          <span className="section-tag tag-danger">The Prepare Dilemma</span>
          <h2>Preparation Obstacles Candidates Encounter</h2>
        </div>

        <div className="problem-timeline-flow">
          <div className="timeline-node">
            <div className="node-number">01</div>
            <div className="node-content">
              <h3>Keyword-Stuffed Screening</h3>
              <p>Standard job search tools match plain words. Talent gets filtered out without parsing their actual structural skill matches.</p>
            </div>
          </div>
          <div className="timeline-node">
            <div className="node-number">02</div>
            <div className="node-content">
              <h3>Vocal System Design Gaps</h3>
              <p>Most interview portals test syntax algorithms. Speaking clarity, technological fluency, and verbal conviction are ignored.</p>
            </div>
          </div>
          <div className="timeline-node">
            <div className="node-number">03</div>
            <div className="node-content">
              <h3>Static Outdated roadmaps</h3>
              <p>Common upskilling tracks offer rigid checklists. Learning pathways fail to adapt based on current assessment gaps.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. SOLUTION SECTION (Side by side comparison columns) */}
      <section className="solution-compare-section page-container">
        <div className="section-title-wrap">
          <span className="section-tag tag-success">The OS Solution</span>
          <h2>Automated Career Readiness Assessment</h2>
        </div>

        <div className="compare-grid-cols">
          <div className="compare-col manual-prep">
            <h3>Manual Preparation</h3>
            <ul className="compare-list">
              <li>Generic resumes formatted to fit blind keyword indices.</li>
              <li>Anxious voice rounds without analytical review metrics.</li>
              <li>Static linear tutorials ignoring diagnostic test results.</li>
              <li>Ad-hoc job search based on random selections.</li>
            </ul>
          </div>
          
          <div className="compare-col neuropath-prep glass-card-v6">
            <h3>NeuroPath Career OS</h3>
            <ul className="compare-list">
              <li>Local NLP decoders mapping structures to 21k occupations.</li>
              <li>Secure speak simulators tracking gaze anomalies.</li>
              <li>Printable roadmap milestones pointing out technology gaps.</li>
              <li>Deterministic placement ratings with real hiring indicators.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* 5. CORE FEATURES (Alternating cards) */}
      <section className="core-features-section page-container">
        <div className="section-title-wrap">
          <span className="section-tag">Core Modules</span>
          <h2>Autonomous Career Engines</h2>
        </div>

        <div className="features-alternating-rows">
          {/* Row 1: Left Text, Right Mock */}
          <div className="feature-alt-row">
            <div className="feature-text-block">
              <span className="feature-icon-box"><FileText size={18} /></span>
              <h3>Resume Intelligence</h3>
              <p>Universal text reader decoding technical history locally. Re-scores matches against occupation matrices in milliseconds.</p>
            </div>
            <div className="feature-mock-block">
              <div className="mock-card glass-card-v6">
                <strong>resume_alex_dev.pdf</strong>
                <span className="mock-sub">92% Match Index</span>
                <div style={{ display: "flex", gap: "4px", marginTop: "8px" }}>
                  <span className="demo-tag-highlight">TensorFlow</span>
                  <span className="demo-tag-highlight">FastAPI</span>
                </div>
              </div>
            </div>
          </div>

          {/* Row 2: Right Text, Left Mock */}
          <div className="feature-alt-row alt-reverse">
            <div className="feature-text-block">
              <span className="feature-icon-box"><Cpu size={18} /></span>
              <h3>Adaptive Interview simulator</h3>
              <p>Voice assessments adapting question parameters live. Gaze monitoring and focus lost checks guarantee integrity.</p>
            </div>
            <div className="feature-mock-block">
              <div className="mock-card glass-card-v6">
                <strong>🎙 Audio Capture Active</strong>
                <p style={{ fontStyle: "italic", fontSize: "0.85rem", margin: "6px 0" }}>"...managing database replication limits..."</p>
                <span style={{ fontSize: "0.75rem", color: "#10b981" }}>✓ Proctor tracking active</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. INTERACTIVE DEMO (Browser Mockup window) */}
      <section className="interactive-demo-section page-container">
        <div className="section-title-wrap">
          <span className="section-tag">Demo Sandbox</span>
          <h2>Test the Parsing Platform</h2>
        </div>
        <InteractiveBrowserDemo />
      </section>

      {/* 7. INTERVIEW PREVIEW */}
      <section className="interview-preview-section page-container">
        <div className="section-title-wrap">
          <span className="section-tag">Proctored Assessment</span>
          <h2>Voice Speech Evaluation</h2>
        </div>
        
        <div className="interview-preview-grid">
          <div className="preview-info">
            <h3>Strict Proctor Conditions</h3>
            <p>Our secure voice round tracks eye positions, focus lost metrics, and tab switches to calculate a verified integrity score.</p>
          </div>
          <div className="preview-display glass-card-v6">
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "14px", alignItems: "center" }}>
              <span className="glass-badge-red pulsing">● Live Proctoring Active</span>
              <strong>Remaining: 45s</strong>
            </div>
            <div className="waveform-box">
              <span className="wave-bar active" />
              <span className="wave-bar active" style={{ height: "30px" }} />
              <span className="wave-bar active" style={{ height: "15px" }} />
              <span className="wave-bar active" style={{ height: "40px" }} />
            </div>
            <p className="transcription-snippet">
              "We leverage local Sentence Transformers to match embeddings..."
            </p>
          </div>
        </div>
      </section>

      {/* 8. ROADMAP PREVIEW */}
      <section className="roadmap-preview-section page-container">
        <div className="section-title-wrap">
          <span className="section-tag">Interactive Timeline</span>
          <h2>Upskilling Roadmaps</h2>
        </div>

        <div className="roadmap-preview-grid">
          <div className="preview-info">
            <h3>Milestone Trackers</h3>
            <p>Complete learning roadmaps compiled dynamically from resume assessment scores, highlighting technologies you need to learn.</p>
          </div>
          <div className="preview-display">
            <StatefulRoadmapPreview />
          </div>
        </div>
      </section>

      {/* 9. PLACEMENT PREDICTION PREVIEW */}
      <section className="placement-preview-section page-container">
        <div className="section-title-wrap">
          <span className="section-tag">Analytics Forecast</span>
          <h2>Predictive Alignment Matches</h2>
        </div>

        <div className="placement-preview-grid">
          <div className="preview-info">
            <h3>Career Forecasting</h3>
            <p>Querying 21k occupational databases to project compatibility ratings across your focus sectors.</p>
          </div>
          <div className="preview-display glass-card-v6">
            <h4>Domain Readiness Indices</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "14px" }}>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", marginBottom: "4px" }}>
                  <span>ML Platform Architect</span>
                  <strong>96%</strong>
                </div>
                <div className="progress-bar-v6"><div className="fill-bar" style={{ width: "96%" }} /></div>
              </div>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", marginBottom: "4px" }}>
                  <span>Backend Infrastructure</span>
                  <strong>90%</strong>
                </div>
                <div className="progress-bar-v6"><div className="fill-bar" style={{ width: "90%" }} /></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 10. TESTIMONIALS */}
      <section className="testimonials-slider-section page-container">
        <div className="section-title-wrap">
          <span className="section-tag">Reviews</span>
          <h2>Candidate Evaluations</h2>
        </div>
        <TestimonialsSlider />
      </section>

      {/* 11. FAQ */}
      <section className="faq-accordions-section page-container">
        <div className="section-title-wrap">
          <span className="section-tag"><HelpCircle size={12} /> FAQ</span>
          <h2>Frequently Asked Questions</h2>
        </div>
        <div className="faq-accordions-list">
          {faqs.map((f, idx) => (
            <FAQItem key={idx} question={f.question} answer={f.answer} />
          ))}
        </div>
      </section>

      {/* 11.5 ABOUT CREATOR PREVIEW */}
      <section className="about-creator-preview-section page-container">
        <div className="section-title-wrap">
          <span className="section-tag">The Creator</span>
          <h2>Meet the Systems Architect</h2>
        </div>
        <GlassCard className="creator-preview-card" style={{ padding: "32px", display: "grid", gridTemplateColumns: "0.6fr 1.4fr", gap: "28px", alignItems: "center", maxWidth: "800px", margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <img 
              src="/animesh_profile.png" 
              alt="Animesh Sahoo" 
              style={{ width: "120px", height: "120px", borderRadius: "50%", objectFit: "cover", border: "3px solid #fff", boxShadow: "0 4px 14px rgba(0,0,26,0.06)" }}
            />
          </div>
          <div>
            <h3 style={{ margin: "0 0 4px 0", fontSize: "1.2rem" }}>Animesh Sahoo</h3>
            <strong style={{ color: "var(--color-medium-blue)", fontSize: "0.85rem", display: "block", marginBottom: "8px" }}>Software Developer & AI/ML Engineer</strong>
            <p className="text-small" style={{ color: "var(--text-secondary)", margin: "0 0 16px 0", lineHeight: "1.5" }}>
              B.Tech Computer Science graduate from Brainware University specializing in building local API backend architectures, secure offline proctoring compilers, and deterministic placement prediction pipelines.
            </p>
            <GlassButton onClick={() => navigate("/about")}>
              Learn More About Creator <ArrowRight size={14} style={{ marginLeft: "4px" }} />
            </GlassButton>
          </div>
        </GlassCard>
      </section>

      {/* 12. FOOTER */}
      <footer className="footer page-container">
        <div className="footer-cols">
          <div>
            <h3>NeuroPath AI</h3>
            <p className="text-small">AI-powered Career Operating System.</p>
          </div>
          <div className="footer-links">
            <a href="#privacy">Privacy</a>
            <a href="#terms">Terms</a>
            <a href="#support">Support</a>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} NeuroPath AI. Built and secure completely offline.</p>
        </div>
      </footer>

    </motion.div>
  );
}

export default Home;