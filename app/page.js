import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AnimatedSection from "@/components/AnimatedSection";
import { LampContainer } from "@/components/LampContainer";
import Link from "next/link";

export const metadata = {
  title: "Calmio · AI Psychologist",
};

export default function HomePage() {
  return (
    <div className="page-shell">
      <Header />
      <main>

        {/* Lamp Hero */}
        <LampContainer>
          <p style={{
            fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.2em",
            color: "#22d3ee", marginBottom: "1rem", fontWeight: 500,
          }}>
            Calmio · AI Psychologist
          </p>
          <h1 style={{
            background: "linear-gradient(to bottom right, #e2e8f0, #94a3b8)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            fontSize: "clamp(2.8rem, 6vw, 5rem)",
            fontWeight: 700, textAlign: "center",
            lineHeight: 1.05, letterSpacing: "-0.03em",
            margin: "0 0 1.25rem",
          }}>
            Turn feelings<br />into insights.
          </h1>
          <p style={{
            color: "#94a3b8", fontSize: "1rem", maxWidth: "420px",
            textAlign: "center", lineHeight: 1.65, margin: "0 0 2rem",
          }}>
            Understand your emotions through AI conversations. Track patterns,
            reflect on your thoughts, and gain clarity.
          </p>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "center" }}>
            <Link href="/register" className="btn btn-primary">
              Get started free
              <span className="btn-glow"></span>
            </Link>
            <Link href="/contact" style={{
              display: "inline-flex", alignItems: "center", padding: "11px 20px",
              borderRadius: "999px", border: "1px solid rgba(148,163,184,0.3)",
              color: "#94a3b8", textDecoration: "none", fontSize: "0.9rem",
            }}>
              Talk to our team
            </Link>
          </div>
        </LampContainer>

        {/* Features */}
        <AnimatedSection tag="section" className="section">
          <div className="container">
            <div className="section-header">
              <h2>Understand your emotions with AI.</h2>
              <p>
                Through natural conversations and emotional analysis, Calmio helps you recognize
                patterns in how you think and feel.
              </p>
            </div>
            <div className="feature-grid">
              <article className="feature-card">
                <div className="feature-icon feature-icon-primary"></div>
                <h3>AI conversations</h3>
                <p>Talk to an AI that listens, understands your emotions, and responds with supportive guidance.</p>
              </article>
              <article className="feature-card">
                <div className="feature-icon feature-icon-blue"></div>
                <h3>Emotional insights</h3>
                <p>See patterns in your mood, identify emotional triggers, and understand what influences your well-being.</p>
              </article>
              <article className="feature-card">
                <div className="feature-icon feature-icon-glass"></div>
                <h3>Personal growth</h3>
                <p>Build deeper self-awareness and develop healthier emotional habits over time.</p>
              </article>
            </div>
          </div>
        </AnimatedSection>

        {/* Split */}
        <AnimatedSection tag="section" className="section section-split">
          <div className="container split-inner">
            <div className="split-copy">
              <h2>Built for everyday self-reflection.</h2>
              <p>Calmio learns from your conversations and helps you understand your emotions over time.</p>
              <ul className="bullet-list">
                <li>Private AI conversations designed for reflection.</li>
                <li>Emotional pattern tracking across time.</li>
                <li>Clear insights that help you understand yourself better.</li>
              </ul>
            </div>
            <div className="split-panel">
              <div className="metric-card">
                <span className="metric-label">Self-awareness</span>
                <span className="metric-value">↓ 80%</span>
                <span className="metric-caption">as you continue reflecting</span>
              </div>
              <div className="metric-card glass">
                <span className="metric-label">Emotional understanding</span>
                <span className="metric-value">↑ 97%</span>
                <span className="metric-caption">because your feelings become clear insights</span>
              </div>
            </div>
          </div>
        </AnimatedSection>

      </main>
      <Footer />
    </div>
  );
}