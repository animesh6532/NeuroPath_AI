import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowRight, Cpu, Code, BookOpen, Terminal, Globe, ExternalLink, Calendar, Rocket, FileText, Mic, Target, CheckCircle2, Share2, AlertCircle, Sparkles, Layers
} from "lucide-react";
import { AuthContext } from "../context/AuthContext";
import { GlassCard, GlassButton, GlassBadge } from "../components/ui/DesignSystem";
import "./About.css";

// Custom SVG Brand Icons to avoid missing lucide brand icons issues in older packages
const GithubIcon = ({ size = 18, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const LinkedinIcon = ({ size = 18, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

// ─── SECTION 4: ANIMATED PLATFORM ARCHITECTURE SVG ───
const PlatformArchitectureVisual = () => {
  return (
    <div className="platform-architecture-visual glass-card-v6">
      <svg className="architecture-svg-canvas" viewBox="0 0 800 320" xmlns="http://www.w3.org/2000/svg">
        {/* Flow Connection Lines (Animated Dashed) */}
        <g stroke="rgba(68, 106, 156, 0.18)" stroke-width="2" fill="none">
          <path d="M 60,160 L 140,160" className="flowing-path-v6" />
          <path d="M 220,160 L 300,160" className="flowing-path-v6" />
          <path d="M 380,160 L 460,160" className="flowing-path-v6" />
          <path d="M 540,160 L 620,160" className="flowing-path-v6" />
          <path d="M 700,160 L 740,160" className="flowing-path-v6" />
          
          {/* Diagonal Divergent connections */}
          <path d="M 380,160 L 460,70" className="flowing-path-v6" />
          <path d="M 380,160 L 460,250" className="flowing-path-v6" />
          <path d="M 540,70 L 620,160" className="flowing-path-v6" />
          <path d="M 540,250 L 620,160" className="flowing-path-v6" />
        </g>

        {/* Nodes and Labels */}
        {/* 1. Resume */}
        <g transform="translate(60, 160)" className="pulse-node-group">
          <circle r="22" fill="#E8F3FF" stroke="var(--color-medium-blue)" stroke-width="2" />
          <FileText size={16} x="-8" y="-8" className="node-vector-icon" />
          <text y="38" text-anchor="middle" className="svg-node-label">Resume</text>
        </g>

        {/* 2. Parser */}
        <g transform="translate(180, 160)" className="pulse-node-group">
          <circle r="22" fill="#E8F3FF" stroke="var(--color-navy)" stroke-width="2" />
          <Cpu size={16} x="-8" y="-8" className="node-vector-icon" />
          <text y="38" text-anchor="middle" className="svg-node-label">NLP Parser</text>
        </g>

        {/* 3. Skill Extraction */}
        <g transform="translate(340, 160)" className="pulse-node-group">
          <circle r="24" fill="#1A3F75" stroke="#FFFFFF" stroke-width="2.5" />
          <Target size={18} x="-9" y="-9" style={{ color: "#E8F3FF" }} />
          <text y="40" text-anchor="middle" className="svg-node-label highlight">Skill Ingest</text>
        </g>

        {/* 4A. AI Interview Engine */}
        <g transform="translate(500, 70)" className="pulse-node-group">
          <circle r="22" fill="#E8F3FF" stroke="var(--color-medium-blue)" stroke-width="2" />
          <Mic size={16} x="-8" y="-8" className="node-vector-icon" />
          <text y="38" text-anchor="middle" className="svg-node-label">Interview</text>
        </g>

        {/* 4B. Coding Sandbox */}
        <g transform="translate(500, 250)" className="pulse-node-group">
          <circle r="22" fill="#E8F3FF" stroke="var(--color-medium-blue)" stroke-width="2" />
          <Code size={16} x="-8" y="-8" className="node-vector-icon" />
          <text y="38" text-anchor="middle" className="svg-node-label">Coding</text>
        </g>

        {/* 5. Evaluation Models */}
        <g transform="translate(660, 160)" className="pulse-node-group">
          <circle r="22" fill="#E8F3FF" stroke="var(--color-navy)" stroke-width="2" />
          <TrendingUpIcon size={16} />
          <text y="38" text-anchor="middle" className="svg-node-label">Predict Index</text>
        </g>

        {/* 6. Roadmap */}
        <g transform="translate(755, 160)" className="pulse-node-group">
          <circle r="16" fill="#10b981" stroke="#FFFFFF" stroke-width="1.5" />
          <BookOpen size={12} x="-6" y="-6" style={{ color: "#ffffff" }} />
          <text y="30" text-anchor="middle" className="svg-node-label success">Map</text>
        </g>
      </svg>
    </div>
  );
};

// Lucide replacement wrapper for SVG
const TrendingUpIcon = ({ size = 16 }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="node-vector-icon"
  >
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
);

// ─── SECTION 6: 3D TECHNOLOGY ORBIT COMPONENT ───
const TechnologyOrbit = () => {
  const [hoveredTech, setHoveredTech] = useState(null);

  const technologies = [
    { id: "python", name: "Python", angle: 0, rad: 80, desc: "Primary logic and local system modules." },
    { id: "fastapi", name: "FastAPI", angle: 72, rad: 80, desc: "High-concurrency async REST routes." },
    { id: "react", name: "React", angle: 144, rad: 80, desc: "Interactive client UI framework." },
    { id: "sqlite", name: "SQLite", angle: 216, rad: 80, desc: "Local dataset occupation matching store." },
    { id: "opencv", name: "OpenCV", angle: 288, rad: 80, desc: "Proctors gaze coordinates and presence." },
    { id: "ml", name: "Sci-Kit Learn", angle: 30, rad: 140, desc: "Vector similarity cosine engines." },
    { id: "tf", name: "TensorFlow", angle: 120, rad: 140, desc: "Local sentence embedding decoders." },
    { id: "docker", name: "Docker", angle: 210, rad: 140, desc: "Containerized sandbox isolations." },
    { id: "nlp", name: "NLP ML Models", angle: 300, rad: 140, desc: "Extracts key taxonomies from profiles." }
  ];

  return (
    <div className="technology-orbit-container glass-card-v6">
      <div className="orbit-canvas-wrapper">
        <svg className="orbit-svg-canvas" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
          {/* Orbital Rings */}
          <circle cx="200" cy="200" r="80" className="orbit-ring-line" />
          <circle cx="200" cy="200" r="140" className="orbit-ring-line outer" />
          
          {/* Central Platform Node */}
          <g transform="translate(200, 200)">
            <circle r="26" fill="#1A3F75" stroke="#E8F3FF" stroke-width="2.5" />
            <Sparkles size={16} x="-8" y="-8" style={{ color: "#FFFFFF" }} />
          </g>

          {/* Orbiting Tech Nodes */}
          {technologies.map((tech) => {
            const x = 200 + tech.rad * Math.cos((tech.angle * Math.PI) / 180);
            const y = 200 + tech.rad * Math.sin((tech.angle * Math.PI) / 180);
            return (
              <g 
                key={tech.id} 
                transform={`translate(${x}, ${y})`} 
                className="orbit-node-group"
                onMouseEnter={() => setHoveredTech(tech)}
                onMouseLeave={() => setHoveredTech(null)}
              >
                <circle r="14" fill="#FFFFFF" stroke="var(--color-medium-blue)" stroke-width="1.5" />
                <circle r="3" fill="var(--color-navy)" />
                <text y="-18" text-anchor="middle" className="orbit-node-text">{tech.name}</text>
              </g>
            );
          })}
        </svg>

        {/* Hover Description overlay in the center */}
        <AnimatePresence mode="wait">
          {hoveredTech ? (
            <motion.div 
              key={hoveredTech.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="tech-orbit-description-card glass-card-v6"
            >
              <strong>{hoveredTech.name}</strong>
              <p>{hoveredTech.desc}</p>
            </motion.div>
          ) : (
            <div className="tech-orbit-description-card default-hint">
              Hover over orbital tech nodes to decode core infrastructure details.
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// ─── MAIN ABOUT COMPONENT ───
function About() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [copiedLabel, setCopiedLabel] = useState(null);

  useEffect(() => {
    if (user) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, navigate]);

  const handleCopyLink = (text, label) => {
    navigator.clipboard.writeText(text);
    setCopiedLabel(label);
    setTimeout(() => setCopiedLabel(null), 2000);
  };

  const coreModules = [
    { title: "Resume Intelligence", icon: <FileText size={18} />, desc: "NLP indexer querying 21,000 occupations locally." },
    { title: "AI Interview Mocks", icon: <Mic size={18} />, desc: "Webcam gaze tracking and hesitation proctor evaluation." },
    { title: "Coding Sandbox", icon: <Code size={18} />, desc: "Local algorithmic solution compiler with streak logs." },
    { title: "Placement Predictions", icon: <Target size={18} />, desc: "Integrates interview and CV ratings into compatibility forecasts." },
    { title: "Learning Roadmaps", icon: <BookOpen size={18} />, desc: "Dynamic node mapping to fill skill deficits." },
    { title: "Dashboard & Profile", icon: <Layers size={18} />, desc: "Analytical dashboards tracking diagnostic metrics." }
  ];

  const socialLinks = [
    { name: "GitHub", url: "https://github.com/animesh6532", display: "github.com/animesh6532", icon: <GithubIcon size={18} /> },
    { name: "LinkedIn", url: "https://www.linkedin.com/in/animesh-sahoo-b03151302/", display: "linkedin.com/in/animesh-sahoo", icon: <LinkedinIcon size={18} /> },
    { name: "Portfolio", url: "https://animeshportfolio6532.netlify.app/", display: "animeshportfolio6532.netlify.app", icon: <Globe size={18} /> },
    { name: "Support Email", url: "mailto:animeshsahoo451@gmail.com", display: "animeshsahoo451@gmail.com", icon: <AlertCircle size={18} />, isEmail: true }
  ];

  if (user) {
    return null;
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="about-page"
    >
      
      {/* SECTION 1: HERO & SECTION 4: PLATFORM PIPELINE */}
      <section className="about-hero page-container">
        <div className="about-hero-badge">
          <GlassBadge status="secondary">PRODUCT SPECIFICATION</GlassBadge>
        </div>
        <h1 className="about-hero-title">
          What is <span>NeuroPath AI?</span>
        </h1>
        <p className="about-hero-subtitle">
          An open-source, high-fidelity talent assessment sandbox running local models to parser resumes, track vocal delivery parameters, and recommend custom learning roadmaps.
        </p>

        {/* Platform Pipeline Diagram (Hero visual) */}
        <div className="hero-svg-architecture-wrap">
          <PlatformArchitectureVisual />
        </div>
      </section>

      {/* SECTION 2: THE PROBLEM (Timeline graphics) */}
      <section className="about-problem-section page-container">
        <div className="section-title-left" style={{ textAlign: "center", marginBottom: "48px" }}>
          <span className="story-tag">THE INDUSTRY PROBLEM</span>
          <h2>Traditional Hiring is Broken</h2>
        </div>
        <div className="problem-timeline-track">
          <div className="problem-card glass-card-v6">
            <div className="problem-num">01</div>
            <h4>Keyword Rejection Filters</h4>
            <p>ATS scanners reject applicants automatically for missing specific character sequences, neglecting technical potential.</p>
          </div>
          <div className="problem-card glass-card-v6">
            <div className="problem-num">02</div>
            <h4>Blind Interview Prep</h4>
            <p>Mock interviews fail to quantify articulation frequency, speaking volume peaks, or gaze focus anomalies.</p>
          </div>
          <div className="problem-card glass-card-v6">
            <div className="problem-num">03</div>
            <h4>Directionless Roadmaps</h4>
            <p>Failed assessments deliver plain rejection emails without pointing out actual gaps or outlining corrective paths.</p>
          </div>
        </div>
      </section>

      {/* SECTION 3: THE SOLUTION */}
      <section className="about-solution-section page-container">
        <div className="section-title-left" style={{ textAlign: "center", marginBottom: "40px" }}>
          <span className="story-tag">THE PIPELINE SOLUTION</span>
          <h2>The Solution: End-to-End Skill Diagnostic Sandbox</h2>
        </div>
        <div className="solution-workflow-wrapper glass-card-v6">
          <div className="solution-flow-step">
            <div className="step-badge">Upload</div>
            <span>CV Parser</span>
          </div>
          <div className="step-arrow"><ArrowRight size={14} /></div>
          <div className="solution-flow-step">
            <div className="step-badge">Mock</div>
            <span>Voice Interview</span>
          </div>
          <div className="step-arrow"><ArrowRight size={14} /></div>
          <div className="solution-flow-step">
            <div className="step-badge">Code</div>
            <span>Python IDE</span>
          </div>
          <div className="step-arrow"><ArrowRight size={14} /></div>
          <div className="solution-flow-step">
            <div className="step-badge">Estimate</div>
            <span>Hiring Predict</span>
          </div>
          <div className="step-arrow"><ArrowRight size={14} /></div>
          <div className="solution-flow-step active">
            <div className="step-badge">Learn</div>
            <span>Roadmap Nodes</span>
          </div>
        </div>
      </section>

      {/* SECTION 5: CORE MODULES */}
      <section className="about-modules-section page-container">
        <div className="section-title-left">
          <span className="story-tag">FUNCTIONAL MODULES</span>
          <h2>Core Architecture Segments</h2>
        </div>
        <div className="modules-grid-v6">
          {coreModules.map((mod, idx) => (
            <GlassCard key={idx} className="core-module-card" whileHover={{ y: -3 }}>
              <div className="module-icon-box">{mod.icon}</div>
              <h4>{mod.title}</h4>
              <p>{mod.desc}</p>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* SECTION 6: TECHNOLOGY STACK (3D Orbit) */}
      <section className="about-orbit-section page-container">
        <div className="section-title-left" style={{ textAlign: "center", marginBottom: "40px" }}>
          <span className="story-tag">PLATFORM STACK</span>
          <h2>Handcrafted Local Infrastructure</h2>
        </div>
        <TechnologyOrbit />
      </section>

      {/* SECTION 7: PLATFORM WORKFLOW CHRONOLOGY */}
      <section className="about-workflow-section page-container">
        <div className="section-title-left">
          <span className="story-tag">CHRONOLOGY</span>
          <h2>Platform Journey Milestones</h2>
        </div>
        <div className="workflow-timeline-flow">
          <div className="workflow-row">
            <div className="row-num">1</div>
            <div className="row-content">
              <strong>Account Setup &amp; Verification</strong>
              <p>User registers securely using JWT tokens.</p>
            </div>
          </div>
          <div className="workflow-row">
            <div className="row-num">2</div>
            <div className="row-content">
              <strong>CV Ingestion &amp; Parsing</strong>
              <p>Extracts taxonomy skills, projects and domain readiness indexes.</p>
            </div>
          </div>
          <div className="workflow-row">
            <div className="row-num">3</div>
            <div className="row-content">
              <strong>Interactive Mock Assessment</strong>
              <p>Proctors gaze coordinates and scores pronunciation peaks.</p>
            </div>
          </div>
          <div className="workflow-row">
            <div className="row-num">4</div>
            <div className="row-content">
              <strong>Interactive Skill roadmap</strong>
              <p>Generates node routes to bridge identified competency gaps.</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 8: FUTURE VISION ROADMAP */}
      <section className="about-vision-section page-container">
        <div className="section-title-left" style={{ textAlign: "center", marginBottom: "40px" }}>
          <span className="story-tag">FUTURE PLANS</span>
          <h2>Platform Roadmap Target Lines</h2>
        </div>
        <div className="roadmap-years-grid">
          <div className="roadmap-year-card glass-card-v6">
            <span className="year-tag">2026</span>
            <ul>
              <li><CheckCircle2 size={12} className="check-success" /> AI Mock Mentorship Module</li>
              <li><CheckCircle2 size={12} className="check-success" /> Local LLM Evaluation integrations</li>
            </ul>
          </div>
          <div className="roadmap-year-card glass-card-v6">
            <span className="year-tag">2027</span>
            <ul>
              <li><CheckCircle2 size={12} className="check-success" /> Recruiter Evaluation Dashboards</li>
              <li><CheckCircle2 size={12} className="check-success" /> Platform Cloud Sync capabilities</li>
            </ul>
          </div>
          <div className="roadmap-year-card glass-card-v6">
            <span className="year-tag">2028</span>
            <ul>
              <li><CheckCircle2 size={12} className="check-success" /> Institutional Enterprise Portals</li>
              <li><CheckCircle2 size={12} className="check-success" /> Predictive Talent Placement matches</li>
            </ul>
          </div>
        </div>
      </section>

      {/* SECTION 9: MEET THE DEVELOPER */}
      <section className="meet-creator-section page-container">
        <div className="section-title-left">
          <span className="story-tag">THE ARCHITECT</span>
          <h2>Platform Creator Details</h2>
        </div>
        <div className="creator-details-box glass-card-v6">
          <div className="creator-photo-col">
            <div className="creator-photo-frame">
              <img 
                src="/animesh_profile.png" 
                alt="Animesh Sahoo portrait" 
                className="creator-portrait-image"
              />
            </div>
          </div>
          <div className="creator-info-col">
            <h3>Animesh Sahoo</h3>
            <span className="creator-sub">Software Developer / AI-ML Engineer / Python Developer</span>
            <p className="creator-bio">
              A computer science graduate specializing in local machine learning pipeline integrations, structured database queries, and async backend architectures. Dedicated to building secure, local SaaS engines that solve candidate upskilling problems.
            </p>
            <div className="creator-resume-bullets">
              <div className="resume-bullet">
                <strong>Education</strong>
                <span>B.Tech CSE (AI &amp; ML) — Brainware University</span>
              </div>
              <div className="resume-bullet">
                <strong>Skills &amp; Focus</strong>
                <span>Machine Learning, NLP, REST APIs, Frontend Engineering</span>
              </div>
              <div className="resume-bullet">
                <strong>Internships</strong>
                <span>Bluestock Fintech &amp; Kodacy × SPACE</span>
              </div>
              <div className="resume-bullet">
                <strong>Startup Ventures</strong>
                <span>NeuroPath AI, StartupForge AI, NexTwin AI</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SOCIAL SECTION */}
      <section className="about-connect-section page-container">
        <div className="section-title-left" style={{ textAlign: "center", marginBottom: "40px" }}>
          <span className="story-tag">COMMUNICATIONS</span>
          <h2>Connect with the Systems Architect</h2>
        </div>
        <div className="social-glass-cards-row">
          {socialLinks.map((social, idx) => (
            <GlassCard key={idx} className="social-interactive-card" whileHover={{ y: -4 }}>
              <div className="social-head-wrap">
                <div className="social-icon-box">{social.icon}</div>
                <div className="social-label-wrap">
                  <strong>{social.name}</strong>
                  <span>{social.display}</span>
                </div>
              </div>
              <div className="social-card-action">
                <a 
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-btn-action-link"
                >
                  Visit Node <ExternalLink size={12} style={{ marginLeft: "4px" }} />
                </a>
                <button 
                  onClick={() => handleCopyLink(social.url, social.name)}
                  className="social-btn-action-copy"
                >
                  {copiedLabel === social.name ? "Copied!" : "Copy Link"} <Share2 size={12} style={{ marginLeft: "4px" }} />
                </button>
              </div>
            </GlassCard>
          ))}
        </div>
      </section>

    </motion.div>
  );
}

export default About;
