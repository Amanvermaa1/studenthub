import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Alert, ArrowRight, Eye, EyeOff, Lock, LogoMark, Mail, User } from "../Icons.jsx";

/* =====================================================
   REGISTER
   ===================================================== */

function RegisterPage({ register }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setBusy(true);

    const result = await register(name, email, password);

    setBusy(false);
    if (!result.ok) setError(result.message);
    else navigate("/login");
  };

  return (
    <main className="auth-page">
      <form className="auth-card" onSubmit={submit}>
        <span className="auth-mark">
          <LogoMark size={22} />
        </span>

        <h1>Create your account</h1>
        <p className="auth-sub">Join the StudentHub community today.</p>

        {error && (
          <div className="form-alert" role="alert">
            <Alert size={16} />
            <span>{error}</span>
          </div>
        )}

        <label className="label" htmlFor="register-name">
          Full name
        </label>
        <div className="field">
          <span className="field-icon">
            <User size={17} />
          </span>
          <input
            id="register-name"
            className="input"
            type="text"
            placeholder="Your name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            autoComplete="name"
            required
          />
        </div>

        <label className="label" htmlFor="register-email">
          Email
        </label>
        <div className="field">
          <span className="field-icon">
            <Mail size={17} />
          </span>
          <input
            id="register-email"
            className="input"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            required
          />
        </div>

        <label className="label" htmlFor="register-password">
          Password
        </label>
        <div className="field">
          <span className="field-icon">
            <Lock size={17} />
          </span>
          <input
            id="register-password"
            className="input has-action"
            type={showPassword ? "text" : "password"}
            placeholder="Create a password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="new-password"
            required
          />
          <button
            type="button"
            className="field-action"
            onClick={() => setShowPassword((value) => !value)}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        </div>

        <p className="hint">Use at least 6 characters.</p>

        <button className="btn btn-primary btn-block btn-lg" disabled={busy}>
          {busy ? (
            <>
              <span className="spinner" /> Creating account
            </>
          ) : (
            <>
              Create account <ArrowRight size={16} />
            </>
          )}
        </button>

        <p className="auth-switch">
          Already have an account?{" "}
          <button
            type="button"
            className="link-btn"
            onClick={() => navigate("/login")}
          >
            Sign in
          </button>
        </p>
      </form>
    </main>
  );
}

export default RegisterPage;
