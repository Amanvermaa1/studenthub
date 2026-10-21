import { useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, Bell, Bookmark, Close, Document, Home, LogoMark, Logout, Menu, Plus, User } from "../Icons.jsx";
import { initials } from "../components/Avatar.jsx";
import { API } from "../api/client.js";

/* =====================================================
   NAVBAR
   ===================================================== */

function Navbar({ token, user, logout }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // The landing page renders a full-page dark sky behind the header, so the
  // navbar switches to a transparent / glass overlay variant there.
  const isOverlay = location.pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 6);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the mobile drawer whenever the route changes.
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  // Lock body scroll while the mobile drawer is open.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const go = (path) => {
    navigate(path);
    setOpen(false);
  };

  return (
    <header
      className={`navbar${scrolled ? " scrolled" : ""}${isOverlay ? " navbar-overlay" : ""}`}
    >
      <NavLink to="/" className="brand" onClick={() => setOpen(false)} end>
        <span className="brand-mark">
          <LogoMark size={19} />
        </span>
        <span className="brand-name">StudentHub</span>
      </NavLink>

      <nav className={`nav-links${open ? " open" : ""}`}>
        {token ? (
          <>
            <NavLink to="/" className="nav-link" onClick={() => setOpen(false)} end>
              <Home size={17} /> Feed
            </NavLink>

            <NavLink to="/my-posts" className="nav-link" onClick={() => setOpen(false)}>
              <Document size={17} /> My Posts
            </NavLink>

            <NavLink to="/saved" className="nav-link" onClick={() => setOpen(false)}>
              <Bookmark size={17} /> Saved
            </NavLink>

            <NavLink to="/profile" className="nav-link" onClick={() => setOpen(false)} end>
              <User size={17} /> Profile
            </NavLink>

            <button
              className="btn btn-accent btn-sm"
              onClick={() => { go("/create"); }}
            >
              <Plus size={16} /> New post
            </button>

            <NotificationBell token={token} />

            <button className="user-chip" onClick={() => go("/profile")}>
              {user?.profile_image ? (
                <img
                  className="avatar avatar-sm avatar-img"
                  src={user.profile_image}
                  alt=""
                />
              ) : (
                <span className="avatar avatar-sm">{initials(user?.name)}</span>
              )}
              {user?.name || "Account"}
            </button>

            <button className="nav-link danger" onClick={logout}>
              <Logout size={17} /> Sign out
            </button>
          </>
        ) : (
          <>
            <NavLink
              to="/login"
              className="nav-link nav-link-glass"
              onClick={() => setOpen(false)}
            >
              Sign in
            </NavLink>

            <button
              className="btn btn-accent btn-sm"
              onClick={() => go("/register")}
            >
              Join StudentHub <ArrowRight size={15} />
            </button>
          </>
        )}
      </nav>

      <button
        className="nav-toggle"
        onClick={() => setOpen((value) => !value)}
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
      >
        {open ? <Close size={20} /> : <Menu size={20} />}
      </button>
    </header>
  );
}

function NotificationBell({ token }) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async (unreadOnly = false) => {
    try {
      if (!token) return;

      const url = unreadOnly
        ? `${API}/notifications/unread-count`
        : `${API}/notifications?limit=10`;
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) return;
      const data = await response.json();

      if (unreadOnly) {
        setUnreadCount(data.count);
      } else {
        setNotifications(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (ids) => {
    try {
      if (!token) return;

      const response = await fetch(`${API}/notifications/read`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ids }),
      });

      if (!response.ok) return;

      setNotifications((prev) =>
        prev.map((n) => (ids === "all" || ids.includes(n.id) ? { ...n, read_at: new Date().toISOString() } : n))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error(error);
    }
  };

  const handleNotificationClick = (notification) => {
    if (!notification.read_at) {
      markAsRead([notification.id]);
    }

    if (notification.post_id) {
      window.location.href = `/post/${notification.post_id}`;
    } else if (notification.actor_id) {
      window.location.href = `/u/${notification.actor_id}`;
    }
    setOpen(false);
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  };

  const getNotificationText = (n) => {
    const actor = n.actor_name || "Someone";
    switch (n.type) {
      case "like":
        return `${actor} liked your post "${n.post_title || ""}"`;
      case "comment":
        return `${actor} commented on your post`;
      case "follow":
        return `${actor} started following you`;
      case "reply":
        return `${actor} replied to your comment`;
      default:
        return `${actor} interacted with your content`;
    }
  };

  useEffect(() => {
    fetchNotifications();
    fetchNotifications(true);

    const interval = setInterval(() => {
      fetchNotifications();
      fetchNotifications(true);
    }, 30000);

    const onVisibilityChange = () => {
      if (!document.hidden) {
        fetchNotifications();
        fetchNotifications(true);
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [token]);

  if (!token) return null;

  return (
    <div className="notification-bell-wrapper">
      <button
        className="nav-link bell-btn"
        onClick={() => setOpen((v) => !v)}
        aria-label="Notifications"
        aria-expanded={open}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount > 9 ? "9+" : unreadCount}</span>
        )}
      </button>

      {open && (
        <div className="notification-dropdown" onClick={(e) => e.stopPropagation()}>
          <div className="dropdown-header">
            <h4>Notifications</h4>
            {unreadCount > 0 && (
              <button
                className="mark-all-read"
                onClick={() => markAsRead("all")}
              >
                Mark all as read
              </button>
            )}
          </div>

          {loading ? (
            <div className="dropdown-loading">
              <span className="spinner" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="dropdown-empty">
              <Bell size={28} />
              <p>No notifications yet</p>
            </div>
          ) : (
            <div className="dropdown-list">
              {notifications.map((n) => (
                <button
                  key={n.id}
                  className={`dropdown-item${!n.read_at ? " unread" : ""}`}
                  onClick={() => handleNotificationClick(n)}
                >
                  <img
                    className="dropdown-avatar"
                    src={n.actor_avatar}
                    alt={n.actor_name}
                    onError={(e) => { e.target.style.display = "none"; }}
                  />
                  <div className="dropdown-content">
                    <p className="dropdown-text">
                      <strong>{n.actor_name || "Someone"}</strong>{" "}
                      {getNotificationText(n)}
                    </p>
                    <span className="dropdown-time">{formatTime(n.created_at)}</span>
                  </div>
                  {!n.read_at && <span className="unread-dot" />}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Navbar;
