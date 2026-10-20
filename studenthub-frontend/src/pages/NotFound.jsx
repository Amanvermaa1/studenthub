import { Link } from "react-router-dom";
import { ArrowLeft } from "../Icons.jsx";

export default function NotFound() {
  return (
    <main className="container" style={{ textAlign: "center", padding: "4rem 1rem" }}>
      <h1 style={{ fontSize: "6rem", margin: 0, color: "var(--emerald)" }}>404</h1>
      <p style={{ fontSize: "1.5rem", margin: "1rem 0", color: "var(--muted)" }}>Page not found</p>
      <p style={{ marginBottom: "2rem" }}>The page you're looking for doesn't exist or has been moved.</p>
      <Link to="/" className="btn btn-accent">
        <ArrowLeft size={16} /> Back to feed
      </Link>
    </main>
  );
}