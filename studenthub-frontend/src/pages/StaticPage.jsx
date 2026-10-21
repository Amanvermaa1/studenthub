import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowLeft, LogoMark, Mail } from "../Icons.jsx";
import { staticPages } from "../content/staticPages.js";

/* =====================================================
   STATIC PAGE — About / Privacy / Terms / Guidelines /
                 Help / Contact
   ===================================================== */

const SLUGS = Object.keys(staticPages);

function StaticPage({ slug }) {
  const location = useLocation();
  const page = staticPages[slug];

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [slug]);

  if (!page) return null;

  return (
    <div className="static-page">
      <div className="static-shell">
        <Link to="/" className="static-back">
          <ArrowLeft size={15} /> Back to home
        </Link>

        <header className="static-head">
          <span className="eyebrow-plain">{page.updated}</span>
          <h1>{page.title}</h1>
          <p className="static-sub">{page.subtitle}</p>
        </header>

        <nav className="static-toc" aria-label="On this page">
          <span className="static-toc-title">On this page</span>
          <ul>
            {page.sections.map((section, i) => (
              <li key={section.heading}>
                <a href={`#section-${i}`}>{section.heading}</a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="static-body">
          {page.sections.map((section, i) => (
            <section className="static-section" id={`section-${i}`} key={section.heading}>
              <h2>{section.heading}</h2>
              {section.body.map((paragraph, j) => (
                <p key={j}>{paragraph}</p>
              ))}
            </section>
          ))}
        </div>

        <div className="static-cta">
          <span className="static-cta-icon">
            <LogoMark size={22} />
          </span>
          <div>
            <h3>Still have questions?</h3>
            <p>
              We reply to every message within one working day — usually much
              sooner.
            </p>
          </div>
          <a className="btn btn-primary" href="mailto:support@studenthub.app">
            <Mail size={16} /> Email support
          </a>
        </div>

        <footer className="static-foot">
          <span>© {new Date().getFullYear()} StudentHub</span>
          <nav className="static-foot-links">
            {SLUGS.map((key) => (
              <Link
                key={key}
                to={`/${key}`}
                className={location.pathname === `/${key}` ? "active" : ""}
              >
                {staticPages[key].title.replace("StudentHub", "").trim() || key}
              </Link>
            ))}
          </nav>
        </footer>
      </div>
    </div>
  );
}

export default StaticPage;
