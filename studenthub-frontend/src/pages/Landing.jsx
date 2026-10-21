import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  Award,
  Bookmark,
  Bulb,
  Calendar,
  Check,
  ChevronRight,
  Cloud,
  Code,
  FileText,
  Fire,
  Heart,
  Layers,
  LogoMark,
  Mail,
  Message,
  Pen,
  Search,
  Shield,
  Sparkles,
  Users,
  Zap,
} from "../Icons.jsx";
import CloudSky from "../components/originkit/ui/cloud-sky";

/* =====================================================
   LANDING PAGE — full-page Cloud Sky background
   ===================================================== */

/* ---------- static content ---------- */

const STATS = [
  { value: "12k+", label: "Students learning together" },
  { value: "48k", label: "Notes & answers shared" },
  { value: "320+", label: "Subjects covered" },
  { value: "94%", label: "Questions answered" },
];

const STEPS = [
  {
    icon: Pen,
    title: "Share what you know",
    body: "Write notes, tutorials or solved problems in Markdown. Add code, tables, maths and file attachments in one go.",
  },
  {
    icon: Search,
    title: "Find the answer fast",
    body: "Full-text search, subject filters and trending tags surface exactly the thread you need — no endless scrolling.",
  },
  {
    icon: Users,
    title: "Learn with your batch",
    body: "Ask a question, get replies, follow classmates and build a study streak you actually keep.",
  },
];

const SUBJECTS = [
  { icon: Code, name: "Computer Science", meta: "DSA · DBMS · OS · Web dev" },
  { icon: Bulb, name: "Physics", meta: "Mechanics · Optics · EMI" },
  { icon: Layers, name: "Mathematics", meta: "Calculus · Linear algebra" },
  { icon: Sparkles, name: "Chemistry", meta: "Organic · Inorganic · Physical" },
  { icon: FileText, name: "Biology", meta: "Genetics · Ecology · Anatomy" },
  { icon: Message, name: "Languages", meta: "Grammar · Vocabulary · Essays" },
  { icon: Calendar, name: "Business", meta: "Economics · Accounts · MBA" },
  { icon: Bookmark, name: "Exam prep", meta: "PYQs · Notes · Mock tests" },
];

const TESTIMONIALS = [
  {
    quote:
      "I stopped keeping five different notes apps open. Everything my batch knows about DSA now lives in one place, and I can actually find it.",
    name: "Aarav Mehta",
    role: "B.Tech, CSE · 2nd year",
    initials: "AM",
  },
  {
    quote:
      "Posted my DBMS normalisation notes at 1am, woke up to twelve replies and a couple of people saying it finally made sense. That feeling is why I'm here.",
    name: "Sana Iqbal",
    role: "BCA · Semester 4",
    initials: "SI",
  },
  {
    quote:
      "Full-text search is unfairly good. I typed one vague sentence from my syllabus and it pulled up the exact thread with the answer.",
    name: "Rohan Verma",
    role: "B.Sc. Physics · Final year",
    initials: "RV",
  },
];

const FAQS = [
  {
    q: "Is StudentHub really free?",
    a: "Yes. Accounts, posts, comments, attachments and search are all free. There is no paid tier and no credit card required to join.",
  },
  {
    q: "Who can join?",
    a: "Anyone with a school, college or university email can register. We verify the domain so the community stays focused on genuine learners.",
  },
  {
    q: "What can I attach to a post?",
    a: "Images, PDFs, documents and archives up to 10 MB. Files are delivered through a global CDN, so links stay fast wherever your batch is.",
  },
  {
    q: "Can I delete or edit what I post?",
    a: "Always. You own your content — edit or remove any post or comment at any time, with no approval step in the way.",
  },
  {
    q: "How do I report a problem?",
    a: "Use the report action on any post or comment, or email the community team. We review every report within 24 hours.",
  },
];

const FOOTER_COLUMNS = [
  {
    title: "Product",
    links: [
      { label: "Features", to: "/#features" },
      { label: "How it works", to: "/#how-it-works" },
      { label: "Subjects", to: "/#subjects" },
      { label: "FAQ", to: "/#faq" },
      { label: "Explore posts", to: "/posts/search?q=" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Help centre", to: "/help" },
      { label: "Community guidelines", to: "/guidelines" },
      { label: "Contact us", to: "/contact" },
      { label: "Status", to: "/help#status" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About StudentHub", to: "/about" },
      { label: "Privacy policy", to: "/privacy" },
      { label: "Terms of service", to: "/terms" },
      { label: "For universities", to: "/contact" },
    ],
  },
];

/* =====================================================
   COMPONENT
   ===================================================== */

function LandingPage() {
  const navigate = useNavigate();
  const [reducedMotion, setReducedMotion] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const handler = (e) => setReducedMotion(e.matches);
    mq.addEventListener?.("change", handler);
    return () => mq.removeEventListener?.("change", handler);
  }, []);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribed(true);
    setEmail("");
  };

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
          /* --- performance knobs: the shader is fragment heavy --- */
          resolutionScale={0.5}
          maxDpr={1}
          fps={reducedMotion ? 12 : 30}
        />
      </div>

      {/* Subtle atmospheric overlay - adds depth without hiding clouds */}
      <div className="landing-atmosphere" aria-hidden="true" />

      {/* All page content scrolls over the fixed sky */}
      <main className="landing-content">
        {/* Floating particles for extra atmosphere */}
        <div className="ambient-particles" aria-hidden="true">
          {[...Array(8)].map((_, i) => (
            <span
              key={i}
              className="particle"
              style={{
                left: `${12 + i * 11}%`,
                top: `${18 + i * 9}%`,
                animationDelay: `${i * 1.1}s`,
                animationDuration: `${18 + i * 3}s`,
              }}
            />
          ))}
        </div>

        {/* ------------------------------------------------ HERO */}
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
                  viewBox="0 0 240 16"
                  preserveAspectRatio="none"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M5 10.5C58 4.5 152 3.5 235 8"
                    stroke="currentColor"
                    strokeWidth="5"
                    strokeLinecap="round"
                    vectorEffect="non-scaling-stroke"
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

        {/* ------------------------------------------------ STATS */}
        <section className="stats-band" aria-label="StudentHub in numbers">
          <div className="stats-inner">
            {STATS.map((stat) => (
              <div className="stat" key={stat.label}>
                <strong className="stat-value">{stat.value}</strong>
                <span className="stat-label">{stat.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ------------------------------------------------ FEATURES */}
        <section className="features" id="features">
          <div className="section-head">
            <span className="eyebrow-plain">What you get</span>
            <h2>Everything a study community needs</h2>
            <p className="section-sub">
              Powerful tools designed for how students actually learn
            </p>
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

        {/* ------------------------------------------------ HOW IT WORKS */}
        <section className="steps" id="how-it-works">
          <div className="section-head">
            <span className="eyebrow-plain">How it works</span>
            <h2>Three steps to a better revision</h2>
            <p className="section-sub">
              From question to answered in under a minute
            </p>
          </div>

          <div className="steps-grid">
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <article className="step-card" key={step.title}>
                  <span className="step-number">0{i + 1}</span>
                  <span className="step-icon">
                    <Icon size={22} />
                  </span>
                  <h3>{step.title}</h3>
                  <p>{step.body}</p>
                  <span className="step-line" aria-hidden="true" />
                </article>
              );
            })}
          </div>
        </section>

        {/* ------------------------------------------------ SUBJECTS */}
        <section className="subjects" id="subjects">
          <div className="section-head">
            <span className="eyebrow-plain">Subjects</span>
            <h2>Every branch has a home here</h2>
            <p className="section-sub">
              From first-year tutorials to final-year specialisation
            </p>
          </div>

          <div className="subject-grid">
            {SUBJECTS.map((subject) => {
              const Icon = subject.icon;
              return (
                <a
                  className="subject-card"
                  key={subject.name}
                  href={`/posts/search?q=${encodeURIComponent(subject.name)}`}
                >
                  <span className="subject-icon">
                    <Icon size={20} />
                  </span>
                  <span className="subject-text">
                    <strong>{subject.name}</strong>
                    <small>{subject.meta}</small>
                  </span>
                  <ChevronRight size={16} className="subject-arrow" />
                </a>
              );
            })}
          </div>
        </section>

        {/* ------------------------------------------------ TESTIMONIALS */}
        <section className="testimonials">
          <div className="section-head">
            <span className="eyebrow-plain">From the community</span>
            <h2>Loved by students who ship notes</h2>
            <p className="section-sub">
              Real stories from the people building this with us
            </p>
          </div>

          <div className="testimonial-grid">
            {TESTIMONIALS.map((t) => (
              <figure className="testimonial-card" key={t.name}>
                <span className="quote-mark" aria-hidden="true">
                  &ldquo;
                </span>
                <blockquote>{t.quote}</blockquote>
                <figcaption>
                  <span className="testimonial-avatar">{t.initials}</span>
                  <span className="testimonial-meta">
                    <strong>{t.name}</strong>
                    <small>{t.role}</small>
                  </span>
                  <span className="testimonial-stars" aria-label="5 out of 5">
                    ★★★★★
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>

        {/* ------------------------------------------------ FAQ */}
        <section className="faq" id="faq">
          <div className="section-head">
            <span className="eyebrow-plain">FAQ</span>
            <h2>Questions, answered</h2>
            <p className="section-sub">
              Everything you might want to know before joining
            </p>
          </div>

          <div className="faq-list">
            {FAQS.map((item, i) => {
              const open = openFaq === i;
              return (
                <div className={`faq-item${open ? " open" : ""}`} key={item.q}>
                  <button
                    className="faq-question"
                    onClick={() => setOpenFaq(open ? -1 : i)}
                    aria-expanded={open}
                  >
                    <span>{item.q}</span>
                    <span className="faq-chevron" aria-hidden="true">
                      <ChevronRight size={18} />
                    </span>
                  </button>
                  {open && <p className="faq-answer">{item.a}</p>}
                </div>
              );
            })}
          </div>
        </section>

        {/* ------------------------------------------------ NEWSLETTER */}
        <section className="cta-band">
          <div className="cta-copy">
            <h2>Ready to join the hub?</h2>
            <p>Set up your account in less than a minute — no credit card required.</p>
          </div>

          <form className="cta-form" onSubmit={handleSubscribe}>
            <label className="sr-only" htmlFor="cta-email">
              Email address
            </label>
            <input
              id="cta-email"
              type="email"
              className="cta-input"
              placeholder="you@college.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button className="btn" type="submit">
              {subscribed ? "You're in!" : "Get started"} <ArrowRight size={17} />
            </button>
          </form>
        </section>

        {/* ------------------------------------------------ FOOTER */}
        <footer className="footer">
          <div className="footer-grid">
            <div className="footer-about">
              <span className="footer-brand">
                <span className="brand-mark">
                  <LogoMark size={19} />
                </span>
                <span className="brand-name">StudentHub</span>
              </span>
              <p>
                A student-led knowledge network where notes, answers and hard-won
                understanding are shared freely — and never locked behind a paywall.
              </p>
              <div className="footer-badges">
                <span className="footer-badge">
                  <Shield size={14} /> Privacy first
                </span>
                <span className="footer-badge">
                  <Heart size={14} /> Always free
                </span>
                <span className="footer-badge">
                  <Award size={14} /> Student built
                </span>
              </div>
            </div>

            {FOOTER_COLUMNS.map((column) => (
              <nav className="footer-col" key={column.title} aria-label={column.title}>
                <h4>{column.title}</h4>
                <ul>
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <a href={link.to}>{link.label}</a>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>

          <div className="footer-bottom">
            <span className="copyright">© {new Date().getFullYear()} StudentHub</span>
            <div className="footer-legal">
              <a href="/privacy">Privacy</a>
              <a href="/terms">Terms</a>
              <a href="/guidelines">Guidelines</a>
              <a href="/contact">
                <Mail size={13} /> Contact
              </a>
            </div>
            <span className="footer-note">
              <Fire size={13} /> Built for students, by students
            </span>
          </div>
        </footer>
      </main>
    </div>
  );
}

export default LandingPage;
