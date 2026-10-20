import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Alert, ArrowRight, Eye, EyeOff, Lock, LogoMark, Mail } from "../Icons.jsx";

/* =====================================================
   LOGIN
   ===================================================== */

function LoginPage({ login }) {
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

    const result = await login(email, password);

    setBusy(false);
    if (!result.ok) setError(result.message);
    else navigate("/");
  };

  return (
    <main className="auth-page">
      <form className="auth-card" onSubmit={submit}>
        <span className="auth-mark">
          <LogoMark size={22} />
        </span>

        <h1>Welcome back</h1>
        <p className="auth-sub">Sign in to continue to StudentHub.</p>

        {error && (
          <div className="form-alert" role="alert">
            <Alert size={16} />
            <span>{error}</span>
          </div>
        )}

        <label className="label" htmlFor="login-email">
          Email
        </label>
        <div className="field">
          <span className="field-icon">
            <Mail size={17} />
          </span>
          <input
            id="login-email"
            className="input"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            required
          />
        </div>

        <label className="label" htmlFor="login-password">
          Password
        </label>
        <div className="field">
          <span className="field-icon">
            <Lock size={17} />
          </span>
          <input
            id="login-password"
            className="input has-action"
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
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

        <button className="btn btn-primary btn-block btn-lg" disabled={busy}>
          {busy ? (
            <>
              <span className="spinner" /> Signing in
            </>
          ) : (
            <>
              Sign in <ArrowRight size={16} />
            </>
          )}
        </button>

        <p className="auth-switch">
          New to StudentHub?{" "}
          <button
            type="button"
            className="link-btn"
            onClick={() => navigate("/register")}
          >
            Create an account
          </button>
        </p>
      </form>
    </main>
  );
}

export default LoginPage;
