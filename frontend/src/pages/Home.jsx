import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { motion } from "framer-motion";
import { 
  ArrowRight, Sparkles, Target, FileText, Mic, Laptop, ShieldCheck, Play, Code, CheckCircle2, TrendingUp, Layers, HelpCircle
} from "lucide-react";
import { GlassCard, GlassButton, GlassBadge } from "../components/ui/DesignSystem";
import "./Home.css";

// ─── WHY NEUROPATH TIMELINE VISUAL ───
const WhyNeuroPathVisual = () => {
  return (
    <div className="why-neuropath-visual glass-card-v6">
      <div className="visual-milestone-track">
        <div className="milestone-node-v6 active">
          <div className="node-icon-v6"><FileText size={16} /></div>
          <div className="node-text-v6">
            <strong>01. Resume Semantic Indexing</strong>
            <p>Decodes structures against 21k occupations</p>
          </div>
        </div>
        <div className="track-connector-v6" />
        <div className="milestone-node-v6">
          <div className="node-icon-v6"><Mic size={16} /></div>
          <div className="node-text-v6">
            <strong>02. Vocal speech mocks</strong>
            <p>Proctors hesitation and gaze coordinates</p>
          </div>
        </div>
        <div className="track-connector-v6" />
        <div className="milestone-node-v6">
          <div className="node-icon-v6"><Target size={16} /></div>
          <div className="node-text-v6">
            <strong>03. Aggregate Job Matching</strong>
            <p>Predicts direct employment probabilities</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── RESUME SCANNING CARD VISUAL ───
const ResumeScanVisual = () => {
  return (
    <div className="resume-scan-visual glass-card-v6">
      <div className="resume-scan-laser-line" />
      <div className="resume-sheet-mock">
        <div className="sheet-header">
          <span className="sheet-avatar" />
          <div className="sheet-header-lines">
            <span className="line long" />
            <span className="line short" />
          </div>
        </div>
        <div className="sheet-body">
          <div className="sheet-section">
            <div className="section-label">Education</div>
            <div className="line long" />
          </div>
          <div className="sheet-section">
            <div className="section-label">Experience</div>
            <div className="line long" />
            <div className="line short" />
          </div>
          <div className="sheet-section">
            <div className="section-label">Technical Skills</div>
            <div className="sheet-chips">
              <span className="fake-chip">Python</span>
              <span className="fake-chip">FastAPI</span>
              <span className="fake-chip">ML</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── INTERVIEW WAVEFORM VISUAL ───
const InterviewWaveVisual = () => {
  return (
    <div className="interview-wave-visual glass-card-v6">
      <div className="visual-proctor-camera">
        <div className="camera-lens" />
        <div className="camera-bounds-outline" />
        <span className="camera-label">LIVE EYE CORRELATION ACTIVE</span>
      </div>
      <div className="wave-container-v6">
        <span className="wave-bar active" style={{ height: "16px", animationDelay: "0.2s" }} />
        <span className="wave-bar active" style={{ height: "32px", animationDelay: "0.4s" }} />
        <span className="wave-bar active" style={{ height: "48px", animationDelay: "0.1s" }} />
        <span className="wave-bar active" style={{ height: "24px", animationDelay: "0.3s" }} />
        <span className="wave-bar active" style={{ height: "12px", animationDelay: "0.5s" }} />
        <span className="wave-bar active" style={{ height: "36px", animationDelay: "0.25s" }} />
      </div>
      <div className="transcription-bubble">
        "Implementing async database sharding limits bottleneck paths..."
      </div>
    </div>
  );
};

// ─── PLACEMENT PREDICTION RADAR VISUAL ───
const PlacementRadarVisual = () => {
  return (
    <div className="placement-radar-visual glass-card-v6">
      <h4>Classification Forecast</h4>
      <div className="radar-meters-list">
        <div className="radar-meter-row">
          <div className="meter-info">
            <span>Machine Learning Architect</span>
            <strong>96% Match</strong>
          </div>
          <div className="radar-bar-track"><div className="radar-bar-fill" style={{ width: "96%" }} /></div>
        </div>
        <div className="radar-meter-row">
          <div className="meter-info">
            <span>Backend Systems Engineer</span>
            <strong>92% Match</strong>
          </div>
          <div className="radar-bar-track"><div className="radar-bar-fill" style={{ width: "92%" }} /></div>
        </div>
        <div className="radar-meter-row">
          <div className="meter-info">
            <span>Infrastructure & DevOps</span>
            <strong>85% Match</strong>
          </div>
          <div className="radar-bar-track"><div className="radar-bar-fill" style={{ width: "85%" }} /></div>
        </div>
      </div>
    </div>
  );
};

// ─── CODING IDE WINDOW VISUAL ───
const CodingWorkspaceVisual = () => {
  return (
    <div className="coding-workspace-visual glass-card-v6">
      <div className="ide-header-bar">
        <div className="ide-actions">
          <span className="ide-dot dot-red" />
          <span className="ide-dot dot-yellow" />
          <span className="ide-dot dot-green" />
        </div>
        <div className="ide-file-tab">sandbox_test.py</div>
      </div>
      <div className="ide-content-area">
        <pre className="ide-code-lines">
          <code>
            <span className="syntax-keyword">def</span> <span className="syntax-func">verify_readiness</span>(cv_score, speaking):<br />
            &nbsp;&nbsp;&nbsp;&nbsp;score = cv_score * <span className="syntax-num">0.4</span> + speaking * <span className="syntax-num">0.6</span><br />
            &nbsp;&nbsp;&nbsp;&nbsp;<span className="syntax-keyword">return</span> score &gt;= <span className="syntax-num">85</span><br />
            <br />
            print(verify_readiness(<span className="syntax-num">92</span>, <span className="syntax-num">88</span>))
          </code>
        </pre>
        <div className="ide-terminal-console">
          <div className="terminal-output">
            <span>$ python sandbox_test.py</span><br />
            <span className="success-output">True (Compilation Successful)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── MAIN HOME COMPONENT ───
function Home() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (user) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, navigate]);

  if (user) {
    return null;
  }

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
            Build Your <br />
            <span>Career With AI.</span>
          </h1>

          <p className="hero-subtext">
            Analyze resumes. Practice interviews. Improve coding skills. Predict placement readiness. Everything in one intelligent platform.
          </p>

          <div className="hero-cta-buttons">
            <GlassButton primary onClick={() => navigate("/register")}>
              Get Started <ArrowRight size={14} style={{ marginLeft: "4px" }} />
            </GlassButton>
            <GlassButton onClick={() => navigate("/login")}>
              Watch Demo
            </GlassButton>
          </div>

          <div className="hero-trust-indicators">
            <span>● Secured Local Data</span>
            <span>● ATS Compatibility Indexing</span>
            <span>● Zero Latency Engine</span>
          </div>
        </div>

        {/* Right Column (Spacer layout for background illustration) */}
        <div className="hero-right-col" />
      </section>

      {/* 2. WHY NEUROPATH (Layout 1: Text Left, Visual Right) */}
      <section className="homepage-section page-container">
        <div className="section-grid-layout text-left-visual-right">
          <div className="section-text-block">
            <span className="story-tag">THE MISSION</span>
            <h2>Why NeuroPath AI?</h2>
            <p>
              We bridge the mismatch between raw credentials and industry criteria. Rather than stuffing random keywords, NeuroPath indexes semantic skills, simulates real-time proctored conversations, and validates placement readiness.
            </p>
            <div className="section-feature-bullets">
              <div className="bullet-row">
                <span className="bullet-indicator" />
                <span>Local vector embeddings query 21k occupational databases</span>
              </div>
              <div className="bullet-row">
                <span className="bullet-indicator" />
                <span>Speech analysis proctors verbal delivery and gaze coordinates</span>
              </div>
            </div>
          </div>
          <div className="section-visual-block">
            <WhyNeuroPathVisual />
          </div>
        </div>
      </section>

      {/* 3. RESUME INTELLIGENCE (Layout 2: Visual Left, Text Right) */}
      <section className="homepage-section page-container">
        <div className="section-grid-layout visual-left-text-right">
          <div className="section-visual-block">
            <ResumeScanVisual />
          </div>
          <div className="section-text-block">
            <span className="story-tag">01. PROFILE PARSING</span>
            <h2>Resume Intelligence</h2>
            <p>
              Upload your CV and parse structured data layers locally in under 10ms. Our NLP engine decodes technical skills, filters formatting deficits, and estimates occupancy alignment indices automatically.
            </p>
            <GlassButton onClick={() => navigate("/register")}>
              Parse Your CV <ArrowRight size={14} />
            </GlassButton>
          </div>
        </div>
      </section>

      {/* 4. AI INTERVIEW (Layout 3: Text Left, Visual Right) */}
      <section className="homepage-section page-container">
        <div className="section-grid-layout text-left-visual-right">
          <div className="section-text-block">
            <span className="story-tag">02. VOCAL MOCKS</span>
            <h2>Proctored Speech Simulator</h2>
            <p>
              Speak directly to practice mock interviews. A secure local proctor checks eye coordinates, lost focus events, and hesitation statistics to generate detailed fluency scorecards.
            </p>
            <div className="section-feature-bullets">
              <div className="bullet-row">
                <span className="bullet-indicator" />
                <span>Eye-tracking coordinates map gaze deviation parameters</span>
              </div>
              <div className="bullet-row">
                <span className="bullet-indicator" />
                <span>Vocal transcripts analyze frequency peaks and speech gaps</span>
              </div>
            </div>
          </div>
          <div className="section-visual-block">
            <InterviewWaveVisual />
          </div>
        </div>
      </section>

      {/* 5. PLACEMENT PREDICTION (Layout 4: Visual Left, Text Right) */}
      <section className="homepage-section page-container">
        <div className="section-grid-layout visual-left-text-right">
          <div className="section-visual-block">
            <PlacementRadarVisual />
          </div>
          <div className="section-text-block">
            <span className="story-tag">03. COMPATIBILITY FORECAST</span>
            <h2>Placement Predictions</h2>
            <p>
              Consolidate spoken, cognitive, and technical ratings to forecast domain readiness. Estimate match percentages across key software engineering and ML profiles.
            </p>
            <GlassButton onClick={() => navigate("/register")}>
              Calculate Match Rating <ArrowRight size={14} />
            </GlassButton>
          </div>
        </div>
      </section>

      {/* 6. CODING WORKSPACE (Layout 5: Text Left, Visual Right) */}
      <section className="homepage-section page-container">
        <div className="section-grid-layout text-left-visual-right">
          <div className="section-text-block">
            <span className="story-tag">04. SANDBOX ENVIRONMENT</span>
            <h2>Interactive IDE Workspace</h2>
            <p>
              Refine coding logic using the local Python solution sandbox. Solve daily algorithmic queries, submit inputs directly to the code compiler, and track submission streaks.
            </p>
            <div className="section-feature-bullets">
              <div className="bullet-row">
                <span className="bullet-indicator" />
                <span>Local script compilation with compiler console feedback</span>
              </div>
              <div className="bullet-row">
                <span className="bullet-indicator" />
                <span>Streak metrics encourage consistent problem solving</span>
              </div>
            </div>
          </div>
          <div className="section-visual-block">
            <CodingWorkspaceVisual />
          </div>
        </div>
      </section>

      {/* 7. FINAL CTA */}
      <section className="final-cta-section page-container">
        <div className="final-cta-banner glass-card-v6">
          <h2>Ready to Build Your Career?</h2>
          <p>One intelligent platform for CV parser diagnostics, speech mocks, and code sandboxes.</p>
          <div className="final-cta-buttons">
            <GlassButton primary onClick={() => navigate("/register")} style={{ padding: "14px 32px" }}>
              Get Started Now <ArrowRight size={14} />
            </GlassButton>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer page-container">
        <div className="footer-cols">
          <div className="footer-brand-col">
            <h3>NeuroPath AI</h3>
            <p className="text-small">AI-powered Career Operating System.</p>
          </div>
          <div className="footer-links-col">
            <h4>Quick Links</h4>
            <a href="#privacy">Privacy Policy</a>
            <a href="#terms">Terms of Service</a>
            <a href="#support">Support Desk</a>
          </div>
          <div className="footer-links-col">
            <h4>Resources</h4>
            <a href="/about">About Creator</a>
            <a href="/login">Watch Demo</a>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} NeuroPath AI. Built and secured completely offline by Animesh Sahoo.</p>
        </div>
      </footer>

    </motion.div>
  );
}

export default Home;