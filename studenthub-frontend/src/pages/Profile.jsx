import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Alert, Calendar, Camera, Document, Lock, Pen, Shield, User, Users } from "../Icons.jsx";
import { formatDate } from "../lib/format.js";
import { initials } from "../components/Avatar.jsx";
import { notify } from "../components/Toast.jsx";

/* =====================================================
   PROFILE
   ===================================================== */

function Profile({
  user,
  postCount,
  onSaveProfile,
  onUploadAvatar,
  onChangePassword,
}) {
  const [name, setName] = useState(user?.name || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [saving, setSaving] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwBusy, setPwBusy] = useState(false);
  const [pwError, setPwError] = useState("");

  const [photoBusy, setPhotoBusy] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    setName(user?.name || "");
    setBio(user?.bio || "");
  }, [user?.name, user?.bio]);

  const saveDetails = async (event) => {
    event.preventDefault();

    if (!name.trim()) {
      notify("Display name cannot be empty.", "error");
      return;
    }

    setSaving(true);
    await onSaveProfile({ name: name.trim(), bio: bio.trim() });
    setSaving(false);
  };

  const changePhoto = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setPhotoBusy(true);
    await onUploadAvatar(file);
    setPhotoBusy(false);
    event.target.value = "";
  };

  const savePassword = async (event) => {
    event.preventDefault();
    setPwError("");

    if (!currentPassword || !newPassword) {
      setPwError("Fill in both password fields.");
      return;
    }

    if (newPassword.length < 6) {
      setPwError("New password must be at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPwError("New passwords do not match.");
      return;
    }

    setPwBusy(true);
    const ok = await onChangePassword({ currentPassword, newPassword });
    setPwBusy(false);

    if (ok) {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  return (
    <main className="profile-page">
      <div className="profile-card">
        {user?.profile_image ? (
          <img
            className="profile-avatar avatar avatar-lg avatar-img"
            src={user.profile_image}
            alt=""
          />
        ) : (
          <span className="profile-avatar avatar avatar-lg">
            {initials(user?.name)}
          </span>
        )}

        <h1>{user?.name || "Student"}</h1>
        <p className="profile-email">{user?.email}</p>

        <p className="profile-bio">
          {user?.bio ||
            "No bio yet — tell the community what you are studying."}
        </p>

        <span className="profile-tag">
          <Users size={15} /> Student account
        </span>

        <div className="profile-actions">
          <label className="btn btn-outline btn-sm">
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={changePhoto}
              disabled={photoBusy}
            />
            {photoBusy ? (
              <>
                <span className="spinner" /> Uploading
              </>
            ) : (
              <>
                <Camera size={15} /> Change photo
              </>
            )}
          </label>

          <button
            className="btn btn-outline btn-sm"
            onClick={() => navigate("/my-posts")}
          >
            <Document size={15} /> My posts ({postCount})
          </button>
        </div>

        <div className="profile-stats">
          <div className="stat-tile">
            <span className="stat-label">
              <Pen size={14} /> Posts
            </span>
            <strong className="stat-value">{postCount}</strong>
          </div>

          <div className="stat-tile">
            <span className="stat-label">
              <Calendar size={14} /> Member since
            </span>
            <strong className="stat-value">
              {user?.created_at ? formatDate(user.created_at) : "Recently"}
            </strong>
          </div>
        </div>
      </div>

      <form className="panel" onSubmit={saveDetails}>
        <div className="panel-head">
          <span className="panel-icon">
            <User size={18} />
          </span>
          <div>
            <h3>Profile details</h3>
            <p>This is how you appear across StudentHub.</p>
          </div>
        </div>

        <label className="label" htmlFor="profile-name">
          Display name
        </label>
        <input
          id="profile-name"
          className="input"
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
        />

        <label className="label" htmlFor="profile-bio-field">
          Bio
        </label>
        <textarea
          id="profile-bio-field"
          className="input"
          rows="3"
          placeholder="e.g. 2nd year CSE — learning React, DSA and DBMS"
          value={bio}
          onChange={(event) => setBio(event.target.value)}
        />

        <p className="hint">Email address is fixed: {user?.email}</p>

        <div className="panel-actions">
          <button className="btn btn-accent btn-sm" disabled={saving}>
            {saving ? (
              <>
                <span className="spinner" /> Saving
              </>
            ) : (
              "Save details"
            )}
          </button>
        </div>
      </form>

      <form className="panel" onSubmit={savePassword}>
        <div className="panel-head">
          <span className="panel-icon">
            <Shield size={18} />
          </span>
          <div>
            <h3>Change password</h3>
            <p>Use at least 6 characters you do not use elsewhere.</p>
          </div>
        </div>

        {pwError && (
          <div className="form-alert" role="alert">
            <Alert size={16} />
            <span>{pwError}</span>
          </div>
        )}

        <label className="label" htmlFor="pw-current">
          Current password
        </label>
        <div className="field">
          <span className="field-icon">
            <Lock size={16} />
          </span>
          <input
            id="pw-current"
            className="input"
            type="password"
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
            autoComplete="current-password"
            required
          />
        </div>

        <div className="panel-grid">
          <div>
            <label className="label" htmlFor="pw-new">
              New password
            </label>
            <div className="field">
              <span className="field-icon">
                <Lock size={16} />
              </span>
              <input
                id="pw-new"
                className="input"
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                autoComplete="new-password"
                required
              />
            </div>
          </div>

          <div>
            <label className="label" htmlFor="pw-confirm">
              Confirm new password
            </label>
            <div className="field">
              <span className="field-icon">
                <Lock size={16} />
              </span>
              <input
                id="pw-confirm"
                className="input"
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                autoComplete="new-password"
                required
              />
            </div>
          </div>
        </div>

        <div className="panel-actions">
          <button className="btn btn-accent btn-sm" disabled={pwBusy}>
            {pwBusy ? (
              <>
                <span className="spinner" /> Updating
              </>
            ) : (
              <>
                <Shield size={15} /> Update password
              </>
            )}
          </button>
        </div>
      </form>
    </main>
  );
}

export default Profile;
