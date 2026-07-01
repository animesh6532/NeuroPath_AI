import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ArrowRight, Award, Cpu, Code, BookOpen, Star, 
  Database, GitBranch, Terminal, Globe, Heart, Compass, ExternalLink, Github, Linkedin
} from "lucide-react";
import { GlassCard, GlassButton, GlassBadge } from "../components/ui/DesignSystem";
import "./About.css";

function About() {
  const navigate = useNavigate();

  const techStack = [
    { name: "Python", category: "Languages & Frameworks" },
    { name: "Java", category: "Languages & OOP" },
    { name: "SQL", category: "Languages & Queries" },
    { name: "Machine Learning", category: "Artificial Intelligence" },
    { name: "FastAPI", category: "API Infrastructures" },
    { name: "React", category: "Frontend Applications" },
    { name: "PostgreSQL", category: "Relational Databases" },
    { name: "Git & GitHub", category: "Version Control" },
    { name: "Cloud Integration", category: "DevOps & Cloud" }
  ];

  const projects = [
    {
      name: "NeuroPath AI",
      tag: "AI Career Operating System",
      desc: "An enterprise career matching system computing multi-factor alignment index models over 21k real occupations with stateful voice interview simulators."
    },
    {
      name: "StartupForge AI",
      tag: "Co-pilot System",
      desc: "An AI-powered co-pilot system designed to analyze market opportunities, draft technical pitches, and forecast financial runs for ventures."
    },
    {
      name: "NexTwin AI",
      tag: "Digital Twins",
      desc: "Industrial virtualization platform leveraging machine learning models to build real-time digital twin duplicates of machinery and monitor faults."
    }
  ];

  const timeline = [
    {
      period: "Internship — Bluestock Fintech",
      role: "Software Developer Intern",
      desc: "Contributed to building high-concurrency fintech API services and optimized SQL database architectures."
    },
    {
      period: "Internship — Kodacy × SPACE",
      role: "Technical Research & AI Intern",
      desc: "Developed machine learning pipelines, ran exploratory data analyses, and built computer vision models."
    },
    {
      period: "Education — Brainware University",
      role: "B.Tech in Computer Science (AI & ML)",
      desc: "Acquired deep theoretical and practical foundations in statistical learning, algorithms, and neural networks."
    }
  ];

  const socialLinks = [
    {
      name: "GitHub",
      url: "https://github.com/animesh6532",
      icon: <Github size={18} />,
      username: "@animesh6532"
    },
    {
      name: "LinkedIn",
      url: "https://www.linkedin.com/in/animesh-sahoo-b03151302/",
      icon: <Linkedin size={18} />,
      username: "Animesh Sahoo"
    },
    {
      name: "Portfolio",
      url: "https://animeshportfolio6532.netlify.app/",
      icon: <Globe size={18} />,
      username: "animeshportfolio6532.netlify.app"
    }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="about-page"
    >
      
      {/* 1. HERO SECTION */}
      <section className="about-hero page-container">
        <span className="ai-badge-pill"><Compass size={12} /> Corporate Profile</span>
        <h1 className="about-title">
          Architecting the Future of <br />
          <span>Talent Readiness.</span>
        </h1>
        <p className="about-subtitle">
          Building a secure, local, and predictive career matching operating system to democratize professional readiness indicators.
        </p>
      </section>

      {/* 2. OUR STORY */}
      <section className="about-story-section page-container">
        <div className="section-title-wrap">
          <span className="section-tag">Corporate Mission</span>
          <h2>A Scientific Direction</h2>
        </div>
        <div className="about-story-grid">
          <GlassCard style={{ padding: "36px" }}>
            <span className="section-tag tag-success">The Problem</span>
            <h3 style={{ fontSize: "1.25rem", marginTop: "12px", marginBottom: "12px" }}>Keyword-Stuffed Filtering</h3>
            <p className="text-body" style={{ color: "var(--text-secondary)", fontSize: "0.95rem", margin: 0 }}>
              Traditional job search models match plain keywords. Candidate capabilities are rejected without a multi-factor semantic analysis of actual occupational fit.
            </p>
          </GlassCard>
          
          <GlassCard style={{ padding: "36px" }}>
            <span className="section-tag tag-success">The Mission</span>
            <h3 style={{ fontSize: "1.25rem", marginTop: "12px", marginBottom: "12px" }}>Autonomous Skill Alignment</h3>
            <p className="text-body" style={{ color: "var(--text-secondary)", fontSize: "0.95rem", margin: 0 }}>
              To bridge the gap between candidate qualifications and hiring indicators, providing secure vocal simulations and printable check-lists to target technology gaps.
            </p>
          </GlassCard>
        </div>
      </section>

      {/* 3. MEET THE CREATOR */}
      <section className="about-creator-section page-container">
        <div className="section-title-wrap">
          <span className="section-tag">The Architect</span>
          <h2>Behind the Platform</h2>
        </div>

        <div className="creator-grid">
          <div className="creator-avatar-wrap">
            <div className="creator-glass-frame">
              <img 
                src="/animesh_profile.png" 
                alt="Animesh Sahoo" 
                className="creator-profile-img"
              />
            </div>
          </div>

          <div className="creator-details">
            <h3 style={{ fontSize: "1.8rem", color: "var(--color-dark-blue)", margin: "0 0 6px 0" }}>Animesh Sahoo</h3>
            <strong style={{ display: "block", color: "var(--color-medium-blue)", fontSize: "1rem", marginBottom: "16px" }}>
              Software Developer & AI/ML Engineer
            </strong>
            <p className="text-body" style={{ color: "var(--text-secondary)", marginBottom: "20px", fontSize: "0.95rem", lineHeight: "1.6" }}>
              Specialist in building high-concurrency API backends, local proctored compilers, and predictive candidate matching pipelines. B.Tech Computer Science graduate from Brainware University.
            </p>

            <div className="creator-meta-pills" style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              <GlassBadge status="secondary">Python Developer</GlassBadge>
              <GlassBadge status="secondary">B.Tech CSE (AI & ML)</GlassBadge>
              <GlassBadge status="success">Brainware University</GlassBadge>
            </div>
          </div>
        </div>
      </section>

      {/* 4. TECHNOLOGY */}
      <section className="about-tech-section page-container">
        <div className="section-title-wrap">
          <span className="section-tag"><Code size={12} /> Tech Stack</span>
          <h2>Platform Infrastructure Core</h2>
        </div>

        <div className="tech-stack-grid">
          {techStack.map((tech, idx) => (
            <div key={idx} className="tech-item glass-card-v6">
              <strong>{tech.name}</strong>
              <span>{tech.category}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 5. TIMELINE */}
      <section className="about-timeline-section page-container">
        <div className="section-title-wrap">
          <span className="section-tag">Chronology</span>
          <h2>Professional Timeline</h2>
        </div>

        <div className="timeline-flow-about">
          {timeline.map((item, idx) => (
            <div key={idx} className="timeline-item-about">
              <div className="timeline-period">{item.period}</div>
              <div className="timeline-content-about glass-card-v6">
                <h4>{item.role}</h4>
                <p>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. PROJECTS */}
      <section className="about-projects-section page-container">
        <div className="section-title-wrap">
          <span className="section-tag">Directory</span>
          <h2>Engineering Showcase</h2>
        </div>

        <div className="projects-showcase-grid">
          {projects.map((proj, idx) => (
            <GlassCard key={idx} style={{ padding: "28px" }} whileHover={{ y: -3 }}>
              <span className="glass-badge" style={{ marginBottom: "12px" }}>{proj.tag}</span>
              <h3 style={{ fontSize: "1.2rem", margin: "4px 0 10px 0" }}>{proj.name}</h3>
              <p className="text-body" style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: "1.5" }}>
                {proj.desc}
              </p>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* 7. VISION */}
      <section className="about-vision-section page-container">
        <div className="section-title-wrap">
          <span className="section-tag">Future Path</span>
          <h2>The Matching Horizon</h2>
        </div>
        <GlassCard style={{ padding: "40px", maxWidth: "800px", margin: "0 auto", textAlign: "center" }}>
          <p className="text-body" style={{ fontStyle: "italic", fontSize: "1.1rem", lineHeight: "1.6", color: "var(--color-navy)" }}>
            "We envision a hiring ecosystem where candidate potential is computed using local models—resume structure metrics, voice fluency indexes, and system design compilers—to direct talent matching without generic filters."
          </p>
        </GlassCard>
      </section>

      {/* 8. CONNECT */}
      <section className="about-connect-section page-container">
        <div className="section-title-wrap">
          <span className="section-tag">Contact</span>
          <h2>Connect with the Architect</h2>
        </div>

        <div className="connect-social-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px", maxWidth: "800px", margin: "0 auto" }}>
          {socialLinks.map((social, idx) => (
            <a 
              key={idx}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              className="social-connect-card-link"
              style={{ textDecoration: "none" }}
            >
              <GlassCard className="social-connect-card" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "10px", alignItems: "center", textPosition: "center" }} whileHover={{ y: -3 }}>
                <div className="social-icon-wrapper" style={{ color: "var(--color-medium-blue)" }}>
                  {social.icon}
                </div>
                <strong style={{ fontSize: "1rem", color: "var(--color-navy)", margin: "4px 0 2px 0" }}>{social.name}</strong>
                <span className="text-caption" style={{ fontSize: "0.8rem", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "4px" }}>
                  {social.username} <ExternalLink size={10} />
                </span>
              </GlassCard>
            </a>
          ))}
        </div>
      </section>

      {/* BOTTOM CTA */}
      <section className="about-cta-section page-container">
        <GlassCard className="cta-banner" style={{ padding: "48px", textAlign: "center" }}>
          <h2>Ready to experience NeuroPath AI?</h2>
          <p className="text-body" style={{ margin: "12px auto 28px auto", maxWidth: "480px" }}>
            Explore local resume decoder matching scores and secure proctored speech simulator assessments.
          </p>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
            <GlassButton primary onClick={() => navigate("/resume")}>
              Start Resume Analysis <ArrowRight size={14} style={{ marginLeft: "4px" }} />
            </GlassButton>
            <GlassButton onClick={() => navigate("/register")}>
              Register Account
            </GlassButton>
          </div>
        </GlassCard>
      </section>

    </motion.div>
  );
}

export default About;
