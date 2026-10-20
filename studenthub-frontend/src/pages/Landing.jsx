import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { ArrowRight, Bulb, Check, Cloud, Code, LogoMark, Pen, Search, Users, Sparkles, Zap, Shield } from "../Icons.jsx";
import CloudSky from "../components/originkit/ui/cloud-sky";

/* =====================================================
   LANDING PAGE — full-page Cloud Sky background
   ===================================================== */

function LandingPage() {
  const navigate = useNavigate();
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const handler = (e) => setReducedMotion(e.matches);
    mq.addEventListener?.("change", handler);
    return () => mq.removeEventListener?.("change", handler);
  }, []);

  return (
    <div className="landing">
      {/* Full-page fixed cloud sky background */}
      <div className="landing-sky" aria-hidden="true">
        <CloudSky
          style={{ minWidth: 0, minHeight: 0 }}
          speed={reducedMotion ? 0 : 64}
          background="#0a1a2f"
          baseColor="#162a4a"
          accentColor="#ffffff"
          density={85}
          size={140}
          clouds={{ softness: 220, shadow: 75, cirrus: 95 }}
          sun={{ x: 95, y: 85, glow: "rgba(255, 255, 255, 0.4)" }}
          pointer={{ parallax: 320, wind: 320, damping: 45 }}
        />
      </div>

      {/* Subtle atmospheric overlay - adds depth without hiding clouds */}
      <div className="landing-atmosphere" aria-hidden="true" />

      {/* All page content scrolls over the fixed sky */}
      <main className="landing-content">
        {/* Floating particles for extra atmosphere */}
        <div className="ambient-particles" aria-hidden="true">
          {[...Array(12)].map((_, i) => (
            <span key={i} className="particle" style={{ 
              left: `${10 + (i * 7.5)}%`,
              top: `${15 + (i * 6)}%`,
              animationDelay: `${i * 0.8}s`,
              animationDuration: `${15 + i * 2}s`
            }} />
          ))}
        </div>

        <section className="hero">
          <div className="hero-content">
            <span className="eyebrow">
              <LogoMark size={14} /> Student knowledge network
            </span>

            <h1 className="hero-title">
              <span className="title-line">Learn. Share.</span>
              <span className="title-line title-accent">
                Connect.
                <svg
                  className="hero-underline"
                  viewBox="0 0 240 14"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M4 9.5C58 4.5 152 3.5 236 7.5"
                    stroke="currentColor"
                    strokeWidth="5"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h1>

            <p className="hero-lead">
              A focused space where students trade notes, break down hard topics
              and grow together. No noise — just knowledge that helps you pass
              the next exam.
            </p>

            <div className="hero-actions">
              <button
                className="btn btn-primary btn-lg"
                onClick={() => navigate("/register")}
              >
                <Sparkles size={17} style={{ marginRight: 8 }} />
                Create free account
              </button>

              <button
                className="btn btn-outline btn-lg"
                onClick={() => navigate("/login")}
              >
                Sign in
              </button>
            </div>

            <ul className="hero-points">
              <li>
                <Check size={14} /> Free for students
              </li>
              <li>
                <Check size={14} /> Rich markdown + code highlighting
              </li>
              <li>
                <Check size={14} /> Subject filters & full-text search
              </li>
              <li>
                <Check size={14} /> Attachments: PDF, images, docs
              </li>
            </ul>
          </div>

          <div className="hero-visual">
            <div className="hero-panel">
              <div className="float-card fc-1">
                <span className="float-icon">
                  <Bulb size={19} />
                </span>
                <div>
                  <strong>Share knowledge</strong>
                  <small>Help someone understand it faster</small>
                </div>
              </div>

              <div className="float-card fc-2">
                <span className="float-icon">
                  <Code size={19} />
                </span>
                <div>
                  <strong>Discuss technology</strong>
                  <small>Java, React, DSA, DBMS and more</small>
                </div>
              </div>

              <div className="float-card fc-3">
                <span className="float-icon">
                  <Users size={19} />
                </span>
                <div>
                  <strong>Grow together</strong>
                  <small>Build a study habit that sticks</small>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="features">
          <div className="section-head">
            <span className="eyebrow-plain">What you get</span>
            <h2>Everything a study community needs</h2>
            <p className="section-sub">Powerful tools designed for how students actually learn</p>
          </div>

          <div className="feature-grid">
            <article className="feature-card">
              <span className="feature-icon">
                <Pen size={21} />
              </span>
              <h3>Publish posts</h3>
              <p>
                Write notes, tutorials and walkthroughs with full Markdown support —
                code blocks, tables, LaTeX math, and syntax highlighting out of the box.
              </p>
            </article>

            <article className="feature-card">
              <span className="feature-icon">
                <Search size={21} />
              </span>
              <h3>Find answers fast</h3>
              <p>
                Full-text search across all posts, filter by subject, sort by latest,
                most liked, or most discussed. Get to the right answer in seconds.
              </p>
            </article>

            <article className="feature-card">
              <span className="feature-icon">
                <Cloud size={21} />
              </span>
              <h3>Rich media</h3>
              <p>
                Attach images, PDFs, DOCs, or ZIPs (up to 10 MB). Cloudinary CDN
                delivers optimized assets worldwide automatically.
              </p>
            </article>

            <article className="feature-card">
              <span className="feature-icon">
                <Zap size={21} />
              </span>
              <h3>Threaded discussions</h3>
              <p>
                Nested replies (one level deep) with comment likes, editing, and
                real-time notifications — conversations stay organized.
              </p>
            </article>

            <article className="feature-card">
              <span className="feature-icon">
                <Shield size={21} />
              </span>
              <h3>Your data, your control</h3>
              <p>
                Edit or delete your posts and comments anytime. Bookmark posts to
                your saved page. Follow peers to curate your feed.
              </p>
            </article>

            <article className="feature-card">
              <span className="feature-icon">
                <Sparkles size={21} />
              </span>
              <h3>Reputation & discovery</h3>
              <p>
                Earn badges for helpful contributions. Trending topics sidebar and
                related posts surface what matters — no algorithm guessing.
              </p>
            </article>
          </div>
        </section>

        <section className="cta-band">
          <div>
            <h2>Ready to join the hub?</h2>
            <p>Set up your account in less than a minute — no credit card required.</p>
          </div>

          <button
            className="btn btn-lg"
            onClick={() => navigate("/register")}
          >
            Get started <ArrowRight size={17} />
          </button>
        </section>

        <footer className="footer">
          <div className="footer-main">
            <span className="brand-name">StudentHub</span>
            <p>Built for students, by students.</p>
          </div>
          <div className="footer-links">
            <a href="/posts/search?q=">Explore posts</a>
            <a href="/register">Create account</a>
            <a href="/login">Sign in</a>
          </div>
          <span className="copyright">© 2026 StudentHub</span>
        </footer>
      </main>
    </div>
  );
}

export default LandingPage;