import { useEffect, useRef, useState } from "react";
import "./App.css";
import {
  LogoMark,
  ArrowRight,
  Bulb,
  Code,
  Users,
  Pen,
  Search,
  Cloud,
  Plus,
  Home,
  Document,
  User,
  Logout,
  Menu,
  Close,
  Eye,
  EyeOff,
  Mail,
  Lock,
  ChevronLeft,
  ChevronRight,
  Trash,
  Inbox,
  Check,
  Alert,
  Calendar,
  Image as ImageIcon,
  Message,
  Camera,
  Shield,
  Heart,
  Bookmark,
  Share,
} from "./Icons.jsx";

const API = "http://localhost:5000/api";

const formatDate = (value) =>
  new Date(value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

const initials = (name) =>
  (name || "Student").trim().charAt(0).toUpperCase();

function Avatar({ name, image, size = "sm" }) {
  if (image) {
    return (
      <img
        className={`avatar avatar-${size} avatar-img`}
        src={image}
        alt={name || "Student"}
      />
    );
  }

  return <span className={`avatar avatar-${size}`}>{initials(name)}</span>;
}

async function sharePostLink(post) {
  const url = `${window.location.origin}/#post-${post.id}`;

  try {
    await navigator.clipboard.writeText(url);
    notify("Link copied to clipboard.");
  } catch (error) {
    console.error(error);

    const field = document.createElement("textarea");
    field.value = url;
    document.body.appendChild(field);
    field.select();

    try {
      document.execCommand("copy");
      notify("Link copied to clipboard.");
    } catch (fallbackError) {
      console.error(fallbackError);
      notify("Could not copy the link.", "error");
    }

    document.body.removeChild(field);
  }
}

/* =====================================================
   TOASTS
   ===================================================== */

let toastListeners = [];
let toastSeq = 0;

function notify(message, type = "success") {
  const id = ++toastSeq;
  toastListeners.forEach((listener) => listener({ id, message, type }));
}

function ToastHost() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const listener = ({ id, message, type }) => {
      setToasts((current) => [...current, { id, message, type }]);
      window.setTimeout(() => {
        setToasts((current) => current.filter((item) => item.id !== id));
      }, 3600);
    };

    toastListeners.push(listener);

    return () => {
      toastListeners = toastListeners.filter((item) => item !== listener);
    };
  }, []);

  const dismiss = (id) =>
    setToasts((current) => current.filter((item) => item.id !== id));

  return (
    <div className="toast-host" role="status" aria-live="polite">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast ${toast.type}`}>
          <span className="toast-badge">
            {toast.type === "error" ? <Alert size={15} /> : <Check size={15} />}
          </span>
          <p>{toast.message}</p>
          <button
            className="toast-close"
            onClick={() => dismiss(toast.id)}
            aria-label="Dismiss notification"
          >
            <Close size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}

/* =====================================================
   CONFIRM DIALOG
   ===================================================== */

function ConfirmDialog({ request, onCancel, onConfirm }) {
  useEffect(() => {
    if (!request) return undefined;

    const onKey = (event) => {
      if (event.key === "Escape") onCancel();
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [request, onCancel]);

  if (!request) return null;

  return (
    <div className="overlay" onMouseDown={onCancel}>
      <div
        className="dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <span className="dialog-icon">
          <Trash size={22} />
        </span>
        <h3 id="confirm-title">{request.title}</h3>
        <p>{request.body}</p>
        <div className="dialog-actions">
          <button className="btn btn-outline" onClick={onCancel}>
            Cancel
          </button>
          <button className="btn btn-danger" onClick={onConfirm}>
            {request.confirmLabel || "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* =====================================================
   APP
   ===================================================== */

function App() {
  const [page, setPage] = useState("home");
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState(null);

  const [posts, setPosts] = useState([]);
  const [myPosts, setMyPosts] = useState([]);

  const [search, setSearch] = useState("");
  const [subject, setSubject] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [confirmRequest, setConfirmRequest] = useState(null);
  const [activePost, setActivePost] = useState(null);
  const [viewUserId, setViewUserId] = useState(null);

  const [likeState, setLikeState] = useState({});
  const [bookmarkState, setBookmarkState] = useState({});

  // -------------------------
  // AUTH
  // -------------------------

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    setPage("home");
    notify("You have been signed out.");
  };

  const fetchProfile = async () => {
    if (!token) return;

    try {
      const response = await fetch(`${API}/users/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        logout();
        return;
      }

      const data = await response.json();
      setUser(data);
    } catch (error) {
      console.error(error);
    }
  };

  // -------------------------
  // POSTS
  // -------------------------

  const fetchPosts = async (pageToLoad = 1, append = false) => {
    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      const response = await fetch(
        `${API}/posts?page=${pageToLoad}&limit=6&search=${encodeURIComponent(
          search
        )}&subject=${encodeURIComponent(subject)}`
      );

      const data = await response.json();
      const incoming = data.posts || [];

      setPosts((current) => (append ? [...current, ...incoming] : incoming));
      setTotalPages(data.totalPages || 1);
      setCurrentPage(pageToLoad);
      hydrateEngagement(incoming);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const hydrateEngagement = async (list) => {
    if (!token || !list.length) return;

    try {
      const results = await Promise.all(
        list.map((post) =>
          fetch(`${API}/likes/${post.id}/status`, {
            headers: { Authorization: `Bearer ${token}` },
          }).then((response) => (response.ok ? response.json() : null))
        )
      );

      setLikeState((current) => {
        const next = { ...current };
        results.forEach((result, index) => {
          if (result) {
            next[list[index].id] = {
              liked: result.liked,
              likes: result.totalLikes,
            };
          }
        });
        return next;
      });
    } catch (error) {
      console.error(error);
    }
  };

  const getLikeInfo = (post) =>
    likeState[post.id] ?? {
      liked: false,
      likes: post.like_count ?? 0,
    };

  const toggleLike = async (post) => {
    if (!token) return;

    const current = getLikeInfo(post);
    const optimistic = {
      liked: !current.liked,
      likes: Math.max(0, current.likes + (current.liked ? -1 : 1)),
    };

    setLikeState((state) => ({ ...state, [post.id]: optimistic }));

    try {
      const response = await fetch(`${API}/likes/${post.id}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Like failed.");

      const statusResponse = await fetch(`${API}/likes/${post.id}/status`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (statusResponse.ok) {
        const status = await statusResponse.json();
        setLikeState((state) => ({
          ...state,
          [post.id]: { liked: status.liked, likes: status.totalLikes },
        }));
      }
    } catch (error) {
      console.error(error);
      setLikeState((state) => ({ ...state, [post.id]: current }));
      notify("Could not update the like. Try again.", "error");
    }
  };

  const toggleBookmark = async (post) => {
    if (!token) return;

    const current = bookmarkState[post.id] ?? false;
    setBookmarkState((state) => ({ ...state, [post.id]: !current }));

    try {
      const response = await fetch(`${API}/bookmarks/${post.id}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Bookmark failed.");

      const data = await response.json();
      setBookmarkState((state) => ({
        ...state,
        [post.id]: data.bookmarked,
      }));
      notify(data.bookmarked ? "Saved to your bookmarks." : "Removed from bookmarks.");
    } catch (error) {
      console.error(error);
      setBookmarkState((state) => ({ ...state, [post.id]: current }));
      notify("Could not update the save. Try again.", "error");
    }
  };

  const fetchMyPosts = async () => {
    try {
      const response = await fetch(`${API}/posts/my-posts`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      setMyPosts(data || []);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [token]);

  useEffect(() => {
    if (page === "home") {
      fetchPosts(1, false);
    }

    if ((page === "my-posts" || page === "profile") && token) {
      fetchMyPosts();
    }
  }, [page, search, subject, token]);

  // -------------------------
  // LOGIN / REGISTER
  // -------------------------

  const login = async (email, password) => {
    try {
      const response = await fetch(`${API}/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { ok: false, message: data.message || "Login failed." };
      }

      localStorage.setItem("token", data.token);
      setToken(data.token);
      setPage("home");
      notify("Welcome back.");
      return { ok: true };
    } catch (error) {
      console.error(error);
      return { ok: false, message: "Could not reach the server. Try again." };
    }
  };

  const register = async (name, email, password) => {
    try {
      const response = await fetch(`${API}/users/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { ok: false, message: data.message || "Registration failed." };
      }

      setPage("login");
      notify("Account created. Sign in to continue.");
      return { ok: true };
    } catch (error) {
      console.error(error);
      return { ok: false, message: "Could not reach the server. Try again." };
    }
  };

  // -------------------------
  // CREATE / DELETE
  // -------------------------

  const createPost = async (formData) => {
    try {
      const response = await fetch(`${API}/posts`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        notify(data.message || "Could not publish the post.", "error");
        return false;
      }

      notify("Your post is live.");
      setPage("home");
      setCurrentPage(1);
      return true;
    } catch (error) {
      console.error(error);
      notify("Could not reach the server. Try again.", "error");
      return false;
    }
  };

  const deletePost = (id) => {
    setConfirmRequest({
      title: "Delete this post?",
      body: "The post and its image will be removed permanently. This cannot be undone.",
      confirmLabel: "Delete post",
      onConfirm: () => performDelete(id),
    });
  };

  const performDelete = async (id) => {
    setConfirmRequest(null);

    try {
      const response = await fetch(`${API}/posts/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      if (!response.ok) {
        notify(data.message || "Could not delete the post.", "error");
        return;
      }

      notify("Post deleted.");
      fetchMyPosts();
      fetchPosts();
    } catch (error) {
      console.error(error);
      notify("Could not reach the server. Try again.", "error");
    }
  };

  // -------------------------
  // POST FULL VIEW
  // -------------------------

  const openPost = (post) => {
    setActivePost({ ...post, author: post.author || user?.name || "You" });
  };

  const closePost = async () => {
    const closing = activePost;
    setActivePost(null);

    if (!closing) return;

    try {
      const response = await fetch(`${API}/posts/${closing.id}`);
      if (!response.ok) return;

      const fresh = await response.json();
      setPosts((list) =>
        list.map((post) =>
          post.id === fresh.id
            ? { ...post, comment_count: fresh.comment_count }
            : post
        )
      );
      setMyPosts((list) =>
        list.map((post) =>
          post.id === fresh.id
            ? { ...post, comment_count: fresh.comment_count }
            : post
        )
      );
    } catch (error) {
      console.error(error);
    }
  };

  const loadMorePosts = async () => {
    if (loading || loadingMore) return;
    if (currentPage >= totalPages) return;
    await fetchPosts(currentPage + 1, true);
  };

  const viewProfile = (userId) => {
    if (!userId || !user) return;

    if (userId === user.id) {
      setPage("profile");
      return;
    }

    setViewUserId(userId);
    setPage("view-profile");
  };

  const viewProfileFromPost = (userId) => {
    setActivePost(null);
    viewProfile(userId);
  };

  // -------------------------
  // PROFILE
  // -------------------------

  const saveProfile = async ({ name, bio }) => {
    try {
      const response = await fetch(`${API}/users/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, bio }),
      });

      const data = await response.json();

      if (!response.ok) {
        notify(data.message || "Could not update the profile.", "error");
        return false;
      }

      setUser(data.user);
      notify("Profile updated.");
      return true;
    } catch (error) {
      console.error(error);
      notify("Could not reach the server. Try again.", "error");
      return false;
    }
  };

  const uploadAvatar = async (file) => {
    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch(`${API}/users/profile/image`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        notify(data.message || "Could not upload the image.", "error");
        return false;
      }

      setUser(data.user);
      notify("Profile photo updated.");
      return true;
    } catch (error) {
      console.error(error);
      notify("Could not reach the server. Try again.", "error");
      return false;
    }
  };

  const updatePassword = async ({ currentPassword, newPassword }) => {
    try {
      const response = await fetch(`${API}/users/change-password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        notify(data.message || "Could not change the password.", "error");
        return false;
      }

      notify("Password changed.");
      return true;
    } catch (error) {
      console.error(error);
      notify("Could not reach the server. Try again.", "error");
      return false;
    }
  };

  // -------------------------
  // UI
  // -------------------------

  return (
    <div className="app">
      <Navbar
        token={token}
        user={user}
        page={page}
        setPage={setPage}
        logout={logout}
      />

      {!token && page === "home" && <LandingPage setPage={setPage} />}

      {!token && page === "login" && (
        <LoginPage login={login} setPage={setPage} />
      )}

      {!token && page === "register" && (
        <RegisterPage register={register} setPage={setPage} />
      )}

      {token && page === "home" && (
        <HomePage
          posts={posts}
          loading={loading}
          loadingMore={loadingMore}
          hasMore={currentPage < totalPages}
          loadMore={loadMorePosts}
          search={search}
          setSearch={setSearch}
          subject={subject}
          setSubject={setSubject}
          setPage={setPage}
          onOpenPost={openPost}
          onOpenAuthor={viewProfile}
          getLikeInfo={getLikeInfo}
          onToggleLike={toggleLike}
          bookmarkState={bookmarkState}
          onToggleBookmark={toggleBookmark}
        />
      )}

      {token && page === "create" && (
        <CreatePost createPost={createPost} setPage={setPage} />
      )}

      {token && page === "my-posts" && (
        <MyPosts
          posts={myPosts}
          deletePost={deletePost}
          setPage={setPage}
          onOpen={openPost}
          onOpenAuthor={viewProfile}
          getLikeInfo={getLikeInfo}
          onToggleLike={toggleLike}
          bookmarkState={bookmarkState}
          onToggleBookmark={toggleBookmark}
        />
      )}

      {token && page === "profile" && (
        <Profile
          user={user}
          postCount={myPosts.length}
          setPage={setPage}
          onSaveProfile={saveProfile}
          onUploadAvatar={uploadAvatar}
          onChangePassword={updatePassword}
        />
      )}

      {token && page === "edit" && (
        <EditPost
          token={token}
          post={window.selectedPost}
          setPage={setPage}
          fetchMyPosts={fetchMyPosts}
        />
      )}

      {token && page === "view-profile" && viewUserId && (
        <PublicProfile
          userId={viewUserId}
          currentUser={user}
          onBack={() => setPage("home")}
          onOpenPost={openPost}
          onEditProfile={() => setPage("profile")}
        />
      )}

      {activePost && (
        <PostView
          post={activePost}
          token={token}
          currentUser={user}
          likeInfo={getLikeInfo(activePost)}
          onToggleLike={() => toggleLike(activePost)}
          bookmarked={!!bookmarkState[activePost.id]}
          onToggleBookmark={() => toggleBookmark(activePost)}
          onOpenAuthor={viewProfileFromPost}
          onClose={closePost}
        />
      )}

      <ToastHost />

      <ConfirmDialog
        request={confirmRequest}
        onCancel={() => setConfirmRequest(null)}
        onConfirm={() => confirmRequest.onConfirm()}
      />
    </div>
  );
}

/* =====================================================
   NAVBAR
   ===================================================== */

function Navbar({ token, user, page, setPage, logout }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 6);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const go = (target) => {
    setPage(target);
    setOpen(false);
  };

  return (
    <header className={`navbar${scrolled ? " scrolled" : ""}`}>
      <button className="brand" onClick={() => go("home")}>
        <span className="brand-mark">
          <LogoMark size={19} />
        </span>
        <span className="brand-name">StudentHub</span>
      </button>

      <nav className={`nav-links${open ? " open" : ""}`}>
        {token ? (
          <>
            <button
              className={`nav-link${page === "home" ? " active" : ""}`}
              onClick={() => go("home")}
            >
              <Home size={17} /> Feed
            </button>

            <button
              className={`nav-link${page === "my-posts" ? " active" : ""}`}
              onClick={() => go("my-posts")}
            >
              <Document size={17} /> My Posts
            </button>

            <button
              className={`nav-link${page === "profile" ? " active" : ""}`}
              onClick={() => go("profile")}
            >
              <User size={17} /> Profile
            </button>

            <button
              className="btn btn-accent btn-sm"
              onClick={() => go("create")}
            >
              <Plus size={16} /> New post
            </button>

            <button className="user-chip" onClick={() => go("profile")}>
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
            <button
              className={`nav-link${page === "login" ? " active" : ""}`}
              onClick={() => go("login")}
            >
              Sign in
            </button>

            <button
              className="btn btn-accent btn-sm"
              onClick={() => go("register")}
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

/* =====================================================
   LANDING PAGE
   ===================================================== */

function LandingPage({ setPage }) {
  return (
    <div className="landing">
      <section className="hero">
        <div className="hero-content">
          <span className="eyebrow">
            <LogoMark size={14} /> Student knowledge network
          </span>

          <h1>
            Learn. Share.
            <br />
            <span className="hero-accent">
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
              onClick={() => setPage("register")}
            >
              Create free account <ArrowRight size={17} />
            </button>

            <button
              className="btn btn-outline btn-lg"
              onClick={() => setPage("login")}
            >
              Sign in
            </button>
          </div>

          <ul className="hero-points">
            <li>
              <Check size={14} /> Free for students
            </li>
            <li>
              <Check size={14} /> Image posts
            </li>
            <li>
              <Check size={14} /> Subject filters
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
        </div>

        <div className="feature-grid">
          <article className="feature-card">
            <span className="feature-icon">
              <Pen size={21} />
            </span>
            <h3>Publish posts</h3>
            <p>
              Write notes, tutorials and walkthroughs — attach an image when it
              makes the idea clearer.
            </p>
          </article>

          <article className="feature-card">
            <span className="feature-icon">
              <Search size={21} />
            </span>
            <h3>Find answers</h3>
            <p>
              Search the feed and filter by subject to reach the right post in
              seconds instead of scrolling forever.
            </p>
          </article>

          <article className="feature-card">
            <span className="feature-icon">
              <Cloud size={21} />
            </span>
            <h3>Rich media</h3>
            <p>
              Upload images securely to Cloudinary and keep every post visual,
              clear and easy to follow.
            </p>
          </article>
        </div>
      </section>

      <section className="cta-band">
        <div>
          <h2>Ready to join the hub?</h2>
          <p>Set up your account in less than a minute.</p>
        </div>

        <button
          className="btn btn-lg"
          onClick={() => setPage("register")}
        >
          Get started <ArrowRight size={17} />
        </button>
      </section>

      <footer className="footer">
        <span className="brand-name">StudentHub</span>
        <p>Built for students, by students.</p>
        <span>© 2026 StudentHub</span>
      </footer>
    </div>
  );
}

/* =====================================================
   LOGIN
   ===================================================== */

function LoginPage({ login, setPage }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setBusy(true);

    const result = await login(email, password);

    setBusy(false);
    if (!result.ok) setError(result.message);
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
            onClick={() => setPage("register")}
          >
            Create an account
          </button>
        </p>
      </form>
    </main>
  );
}

/* =====================================================
   REGISTER
   ===================================================== */

function RegisterPage({ register, setPage }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setBusy(true);

    const result = await register(name, email, password);

    setBusy(false);
    if (!result.ok) setError(result.message);
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
            onClick={() => setPage("login")}
          >
            Sign in
          </button>
        </p>
      </form>
    </main>
  );
}

/* =====================================================
   HOME
   ===================================================== */

function HomePage({
  posts,
  loading,
  loadingMore,
  hasMore,
  loadMore,
  search,
  setSearch,
  subject,
  setSubject,
  setPage,
  onOpenPost,
  onOpenAuthor,
  getLikeInfo,
  onToggleLike,
  bookmarkState,
  onToggleBookmark,
}) {
  const loadMoreRef = useRef(loadMore);
  loadMoreRef.current = loadMore;

  const canLoadMore = hasMore && !loading && !loadingMore;

  useEffect(() => {
    if (!canLoadMore) return undefined;

    const onScroll = () => {
      const nearBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 420;

      if (nearBottom) loadMoreRef.current();
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    const fillTimer = window.setTimeout(onScroll, 120);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.clearTimeout(fillTimer);
    };
  }, [canLoadMore, posts.length]);

  return (
    <main className="container">
      <section className="page-header">
        <div>
          <span className="eyebrow-plain">The feed</span>
          <h1>Explore student knowledge</h1>
          <p>Posts, tutorials and ideas shared by students like you.</p>
        </div>

        <button className="btn btn-accent" onClick={() => setPage("create")}>
          <Plus size={17} /> New post
        </button>
      </section>

      <div className="filters">
        <div className="search-wrap">
          <span className="field-icon">
            <Search size={18} />
          </span>
          <input
            className="input"
            placeholder="Search titles, topics, authors..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            aria-label="Search posts"
          />
        </div>

        <div className="select-wrap">
          <select
            value={subject}
            onChange={(event) => setSubject(event.target.value)}
            aria-label="Filter by subject"
          >
            <option value="">All subjects</option>
            <option value="java">Java</option>
            <option value="javascript">JavaScript</option>
            <option value="react">React</option>
            <option value="node">Node.js</option>
            <option value="sql">SQL</option>
            <option value="dsa">DSA</option>
            <option value="dbms">DBMS</option>
            <option value="other">Other</option>
          </select>
          <span className="field-icon">
            <ChevronRight size={16} />
          </span>
        </div>
      </div>

      {loading ? (
        <div className="feed">
          {Array.from({ length: 3 }, (_, index) => (
            <SkeletonCard key={index} />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="empty">
          <span className="empty-icon">
            <Inbox size={28} />
          </span>
          <h3>No posts found</h3>
          <p>
            Nothing matches this search yet. Try another keyword, or share the
            first post on this topic.
          </p>
          <button className="btn btn-accent" onClick={() => setPage("create")}>
            <Plus size={16} /> Write a post
          </button>
        </div>
      ) : (
        <div className="feed">
          {posts.map((post) => (
            <FeedPost
              key={post.id}
              post={post}
              likeInfo={getLikeInfo(post)}
              bookmarked={!!bookmarkState[post.id]}
              onToggleLike={() => onToggleLike(post)}
              onToggleBookmark={() => onToggleBookmark(post)}
              onOpen={() => onOpenPost(post)}
              onOpenAuthor={onOpenAuthor}
            />
          ))}
        </div>
      )}

      {!loading && posts.length > 0 && (
        <div className="feed-status" aria-live="polite">
          {loadingMore ? (
            <>
              <span className="feed-spinner" />
              <span className="feed-status-text">Loading more posts...</span>
            </>
          ) : !hasMore ? (
            <>
              <span className="feed-end-badge">
                <Check size={14} />
              </span>
              <span className="feed-status-text">You're all caught up</span>
            </>
          ) : null}
        </div>
      )}
    </main>
  );
}

function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <div className="skeleton skeleton-media" />
      <div className="skeleton-body">
        <div className="skeleton skeleton-line w40" />
        <div className="skeleton skeleton-line title w85" />
        <div className="skeleton skeleton-line w85" />
        <div className="skeleton skeleton-line w65" />
      </div>
    </div>
  );
}

/* =====================================================
   FEED POST (social stream)
   ===================================================== */

function FeedPost({
  post,
  likeInfo,
  bookmarked,
  onToggleLike,
  onToggleBookmark,
  onOpen,
  onOpenAuthor,
  footer,
}) {
  const liked = !!likeInfo.liked;
  const likes = likeInfo.likes ?? 0;
  const commentCount = post.comment_count ?? 0;

  const openOnKey = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onOpen();
    }
  };

  return (
    <article className="feed-post">
      <header className="feed-head">
        <button
          type="button"
          className="avatar-btn"
          onClick={() => onOpenAuthor(post.user_id)}
          aria-label={`View profile of ${post.author || "Student"}`}
        >
          <Avatar name={post.author} image={post.author_avatar} />
        </button>

        <div className="feed-head-text">
          <button
            type="button"
            className="author-link"
            onClick={() => onOpenAuthor(post.user_id)}
          >
            {post.author || "Student"}
          </button>
          <span className="feed-sub">
            <Calendar size={12} /> {formatDate(post.created_at)}
          </span>
        </div>

        <span className="tag">{post.subject || "general"}</span>
      </header>

      {post.image_url && (
        <div
          className="feed-media"
          role="button"
          tabIndex={0}
          onClick={onOpen}
          onKeyDown={openOnKey}
          aria-label={`Open post: ${post.title}`}
        >
          <img src={post.image_url} alt={post.title} loading="lazy" />
        </div>
      )}

      <div className="feed-actions">
        <button
          className={`action-btn${liked ? " is-active" : ""}`}
          onClick={onToggleLike}
          aria-label={liked ? "Unlike post" : "Like post"}
          aria-pressed={liked}
        >
          <Heart size={22} />
        </button>

        <button className="action-btn" onClick={onOpen} aria-label="Comments">
          <Message size={22} />
        </button>

        <button
          className="action-btn"
          onClick={() => sharePostLink(post)}
          aria-label="Share post"
        >
          <Share size={22} />
        </button>

        <button
          className={`action-btn action-save${bookmarked ? " is-active" : ""}`}
          onClick={onToggleBookmark}
          aria-label={bookmarked ? "Remove from saved" : "Save post"}
          aria-pressed={bookmarked}
        >
          <Bookmark size={22} />
        </button>
      </div>

      <div className="feed-body">
        <p className="feed-likes">
          <strong>{likes}</strong> {likes === 1 ? "like" : "likes"}
        </p>

        <div
          className="feed-caption"
          role="button"
          tabIndex={0}
          onClick={onOpen}
          onKeyDown={openOnKey}
          aria-label={`Open post: ${post.title}`}
        >
          <button
            type="button"
            className="author-link comment-author"
            onClick={(event) => {
              event.stopPropagation();
              onOpenAuthor(post.user_id);
            }}
          >
            {post.author || "Student"}
          </button>
          <span className="caption-title">{post.title}</span>
          <span className="caption-body">{post.content}</span>
        </div>

        <button className="feed-comments-link" onClick={onOpen}>
          {commentCount === 0
            ? "Add a comment..."
            : `View all ${commentCount} comment${commentCount === 1 ? "" : "s"}`}
        </button>
      </div>

      {footer && <div className="feed-owner">{footer}</div>}
    </article>
  );
}

/* =====================================================
   CREATE POST
   ===================================================== */

function CreatePost({ createPost, setPage }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [subject, setSubject] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [busy, setBusy] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);

    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    formData.append("subject", subject);

    if (image) formData.append("image", image);

    const success = await createPost(formData);

    setBusy(false);

    if (success) {
      setTitle("");
      setContent("");
      setSubject("");
      setImage(null);
      setPreview(null);
    }
  };

  const handleImage = (event) => {
    const file = event.target.files[0];

    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const clearImage = () => {
    setImage(null);
    setPreview(null);
  };

  return (
    <main className="form-page">
      <div className="form-card">
        <section className="page-header">
          <div>
            <span className="eyebrow-plain">New post</span>
            <h1>Share something useful</h1>
            <p>Write clearly — someone else is searching for this exact topic.</p>
          </div>
        </section>

        <form onSubmit={submit}>
          <div className="field-block">
            <label className="label" htmlFor="post-title">
              Title
            </label>
            <input
              id="post-title"
              className="input"
              type="text"
              placeholder="e.g. Understanding SQL joins in 5 minutes"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              required
            />
          </div>

          <div className="field-block">
            <label className="label" htmlFor="post-subject">
              Subject
            </label>
            <select
              id="post-subject"
              className="input"
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
              required
            >
              <option value="">Select subject</option>
              <option value="java">Java</option>
              <option value="javascript">JavaScript</option>
              <option value="react">React</option>
              <option value="node">Node.js</option>
              <option value="sql">SQL</option>
              <option value="dsa">DSA</option>
              <option value="dbms">DBMS</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="field-block">
            <label className="label" htmlFor="post-content">
              Content
            </label>
            <textarea
              id="post-content"
              className="input"
              placeholder="Write your post..."
              value={content}
              onChange={(event) => setContent(event.target.value)}
              required
            />
          </div>

          <div className="field-block">
            <span className="label">Image (optional)</span>
            <label className="file-picker">
              <input type="file" accept="image/*" onChange={handleImage} />
              <ImageIcon size={17} />
              {image ? "Change image" : "Choose image"}
            </label>
            <p className="hint">JPG or PNG, up to a few megabytes.</p>

            {preview && (
              <div className="image-preview">
                <img src={preview} alt="Selected preview" />
                <button
                  type="button"
                  className="preview-remove"
                  onClick={clearImage}
                  aria-label="Remove selected image"
                >
                  <Close size={15} />
                </button>
              </div>
            )}
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setPage("home")}
            >
              Cancel
            </button>

            <button
              className="btn btn-accent"
              type="submit"
              disabled={busy}
            >
              {busy ? (
                <>
                  <span className="spinner" /> Publishing
                </>
              ) : (
                <>
                  Publish post <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

/* =====================================================
   MY POSTS
   ===================================================== */

function MyPosts({
  posts,
  deletePost,
  setPage,
  onOpen,
  onOpenAuthor,
  getLikeInfo,
  onToggleLike,
  bookmarkState,
  onToggleBookmark,
}) {
  return (
    <main className="container">
      <section className="page-header">
        <div>
          <span className="eyebrow-plain">Your library</span>
          <h1>My posts</h1>
          <p>Edit, refresh or remove anything you have published.</p>
        </div>

        <button className="btn btn-accent" onClick={() => setPage("create")}>
          <Plus size={17} /> New post
        </button>
      </section>

      {posts.length === 0 ? (
        <div className="empty">
          <span className="empty-icon">
            <Pen size={26} />
          </span>
          <h3>Nothing published yet</h3>
          <p>
            Your posts will appear here. Start with something you learned this
            week.
          </p>
          <button className="btn btn-accent" onClick={() => setPage("create")}>
            <Plus size={16} /> Write your first post
          </button>
        </div>
      ) : (
        <div className="feed">
          {posts.map((post) => (
            <FeedPost
              key={post.id}
              post={post}
              likeInfo={getLikeInfo(post)}
              bookmarked={!!bookmarkState[post.id]}
              onToggleLike={() => onToggleLike(post)}
              onToggleBookmark={() => onToggleBookmark(post)}
              onOpen={() => onOpen(post)}
              onOpenAuthor={onOpenAuthor}
              footer={
                <>
                  <button
                    className="btn btn-soft btn-sm"
                    onClick={() => {
                      window.selectedPost = post;
                      setPage("edit");
                    }}
                  >
                    <Pen size={15} /> Edit
                  </button>

                  <button
                    className="btn btn-danger-soft btn-sm"
                    onClick={() => deletePost(post.id)}
                  >
                    <Trash size={15} /> Delete
                  </button>
                </>
              }
            />
          ))}
        </div>
      )}
    </main>
  );
}

/* =====================================================
   EDIT POST
   ===================================================== */

function EditPost({ token, post, setPage, fetchMyPosts }) {
  const [title, setTitle] = useState(post?.title || "");
  const [content, setContent] = useState(post?.content || "");
  const [subject, setSubject] = useState(post?.subject || "");
  const [busy, setBusy] = useState(false);

  if (!post) {
    setPage("my-posts");
    return null;
  }

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);

    try {
      const response = await fetch(`${API}/posts/${post.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, content, subject }),
      });

      const data = await response.json();

      if (!response.ok) {
        notify(data.message || "Could not update the post.", "error");
        setBusy(false);
        return;
      }

      notify("Changes saved.");
      fetchMyPosts();
      setPage("my-posts");
    } catch (error) {
      console.error(error);
      notify("Could not reach the server. Try again.", "error");
      setBusy(false);
    }
  };

  return (
    <main className="form-page">
      <div className="form-card">
        <section className="page-header">
          <div>
            <span className="eyebrow-plain">Editing</span>
            <h1>Update your post</h1>
            <p>Refresh the details so the post stays useful.</p>
          </div>
        </section>

        <form onSubmit={submit}>
          <div className="field-block">
            <label className="label" htmlFor="edit-title">
              Title
            </label>
            <input
              id="edit-title"
              className="input"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              required
            />
          </div>

          <div className="field-block">
            <label className="label" htmlFor="edit-subject">
              Subject
            </label>
            <select
              id="edit-subject"
              className="input"
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
              required
            >
              <option value="java">Java</option>
              <option value="javascript">JavaScript</option>
              <option value="react">React</option>
              <option value="node">Node.js</option>
              <option value="sql">SQL</option>
              <option value="dsa">DSA</option>
              <option value="dbms">DBMS</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="field-block">
            <label className="label" htmlFor="edit-content">
              Content
            </label>
            <textarea
              id="edit-content"
              className="input"
              value={content}
              onChange={(event) => setContent(event.target.value)}
              required
            />
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setPage("my-posts")}
            >
              Cancel
            </button>

            <button className="btn btn-accent" type="submit" disabled={busy}>
              {busy ? (
                <>
                  <span className="spinner" /> Saving
                </>
              ) : (
                "Save changes"
              )}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

/* =====================================================
   POST FULL VIEW + COMMENTS
   ===================================================== */

function PostView({
  post,
  token,
  currentUser,
  likeInfo,
  onToggleLike,
  bookmarked,
  onToggleBookmark,
  onOpenAuthor,
  onClose,
}) {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const liked = !!likeInfo.liked;
  const likes = likeInfo.likes ?? post.like_count ?? 0;

  const commentCount = loading
    ? post.comment_count ?? 0
    : comments.length;

  const loadComments = async (initial = false) => {
    if (initial) setLoading(true);

    try {
      const response = await fetch(`${API}/comments/post/${post.id}`);
      const data = await response.json();
      setComments(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComments(true);

    const onKey = (event) => {
      if (event.key === "Escape") onClose();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [post.id]);

  const focusComposer = () => {
    const field = document.getElementById("post-comment-input");
    if (field) field.focus();
  };

  const submitComment = async (event) => {
    event.preventDefault();

    const content = text.trim();
    if (!content) return;

    setBusy(true);

    try {
      const response = await fetch(`${API}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content, postId: post.id }),
      });

      const data = await response.json();

      if (!response.ok) {
        notify(data.message || "Could not add the comment.", "error");
        return;
      }

      setText("");
      await loadComments();
    } catch (error) {
      console.error(error);
      notify("Could not reach the server. Try again.", "error");
    } finally {
      setBusy(false);
    }
  };

  const deleteComment = async (id) => {
    try {
      const response = await fetch(`${API}/comments/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      if (!response.ok) {
        notify(data.message || "Could not delete the comment.", "error");
        return;
      }

      setComments((current) => current.filter((item) => item.id !== id));
      notify("Comment deleted.");
    } catch (error) {
      console.error(error);
      notify("Could not reach the server. Try again.", "error");
    }
  };

  return (
    <div className="overlay detail-overlay" onMouseDown={onClose}>
      <article
        className="detail-card"
        role="dialog"
        aria-modal="true"
        aria-label={post.title}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="detail-media">
          {post.image_url ? (
            <img src={post.image_url} alt={post.title} />
          ) : (
            <div className="media-placeholder">
              <span className="tag tag-dark">{post.subject || "general"}</span>
              <p>{post.title}</p>
              <span className="placeholder-note">No image on this post</span>
            </div>
          )}
        </div>

        <div className="detail-side">
          <header className="detail-head">
            <button
              type="button"
              className="avatar-btn"
              onClick={() => onOpenAuthor(post.user_id)}
              aria-label={`View profile of ${post.author || "Student"}`}
            >
              <Avatar name={post.author} image={post.author_avatar} />
            </button>
            <div className="detail-head-text">
              <button
                type="button"
                className="author-link"
                onClick={() => onOpenAuthor(post.user_id)}
              >
                {post.author || "Student"}
              </button>
              <span className="post-date">
                <Calendar size={12} /> {formatDate(post.created_at)}
              </span>
            </div>
            <span className="tag">{post.subject || "general"}</span>
            <button
              className="detail-close"
              onClick={onClose}
              aria-label="Close post"
            >
              <Close size={18} />
            </button>
          </header>

          <div className="detail-actions">
            <button
              className={`action-btn ${liked ? "is-active" : ""}`}
              onClick={onToggleLike}
              aria-pressed={liked}
              aria-label={liked ? "Unlike post" : "Like post"}
            >
              <Heart size={22} />
            </button>

            <button
              className="action-btn"
              onClick={focusComposer}
              aria-label="Comment on post"
            >
              <Message size={22} />
            </button>

            <button
              className="action-btn"
              onClick={() => sharePostLink(post)}
              aria-label="Copy link to post"
            >
              <Share size={22} />
            </button>

            <button
              className={`action-btn action-save ${
                bookmarked ? "is-active" : ""
              }`}
              onClick={onToggleBookmark}
              aria-pressed={bookmarked}
              aria-label={bookmarked ? "Remove bookmark" : "Bookmark post"}
            >
              <Bookmark size={22} />
            </button>
          </div>

          <div className="detail-likes">
            <span>
              <strong>{likes}</strong> {likes === 1 ? "like" : "likes"}
            </span>
            <span className="likes-sep">·</span>
            <span>
              <strong>{commentCount}</strong>{" "}
              {commentCount === 1 ? "comment" : "comments"}
            </span>
          </div>

          <div className="detail-comments">
            <div className="comment comment-caption">
              <Avatar name={post.author} image={post.author_avatar} />
              <div className="comment-main">
                <p className="comment-line">
                  <button
                    type="button"
                    className="author-link comment-author"
                    onClick={() => onOpenAuthor(post.user_id)}
                  >
                    {post.author}
                  </button>
                  <span className="caption-title">{post.title}</span>
                  <span className="caption-body">{post.content}</span>
                </p>
                <div className="comment-meta">
                  <span className="comment-date">
                    {formatDate(post.created_at)}
                  </span>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="comment-list">
                {[0, 1, 2].map((index) => (
                  <div className="comment" key={index}>
                    <span className="avatar avatar-sm skeleton" />
                    <div className="comment-main">
                      <div className="skeleton skeleton-line w40" />
                      <div className="skeleton skeleton-line w85" />
                    </div>
                  </div>
                ))}
              </div>
            ) : comments.length === 0 ? (
              <div className="comments-empty">
                <span className="empty-icon">
                  <Message size={24} />
                </span>
                <h3>No comments yet</h3>
                <p>Start the discussion with something useful.</p>
              </div>
            ) : (
              <div className="comment-list">
                {comments.map((comment) => (
                  <div className="comment" key={comment.id}>
                    <span className="avatar avatar-sm">
                      {initials(comment.author)}
                    </span>

                    <div className="comment-main">
                      <p className="comment-line">
                        <button
                          type="button"
                          className="author-link comment-author"
                          onClick={() => onOpenAuthor(comment.user_id)}
                        >
                          {comment.author}
                        </button>
                        {comment.content}
                      </p>

                      <div className="comment-meta">
                        <span className="comment-date">
                          {formatDate(comment.created_at)}
                        </span>

                        {comment.user_id === currentUser?.id && (
                          <button
                            className="comment-delete"
                            onClick={() => deleteComment(comment.id)}
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <form className="composer-bar" onSubmit={submitComment}>
            <input
              id="post-comment-input"
              className="composer-input"
              placeholder="Add a comment..."
              value={text}
              onChange={(event) => setText(event.target.value)}
              required
            />
            <button
              className="composer-post"
              disabled={busy || !text.trim()}
            >
              {busy ? <span className="spinner" /> : "Post"}
            </button>
          </form>
        </div>
      </article>
    </div>
  );
}

/* =====================================================
   PUBLIC PROFILE
   ===================================================== */

function PublicProfile({
  userId,
  currentUser,
  onBack,
  onOpenPost,
  onEditProfile,
}) {
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setFailed(false);

      try {
        const [profileRes, postsRes] = await Promise.all([
          fetch(`${API}/users/${userId}/public`),
          fetch(`${API}/users/${userId}/posts`),
        ]);

        if (!profileRes.ok) {
          if (!cancelled) setFailed(true);
          return;
        }

        const profileData = await profileRes.json();
        const postsData = postsRes.ok ? await postsRes.json() : [];

        if (cancelled) return;

        setProfile(profileData);
        setPosts(Array.isArray(postsData) ? postsData : []);
      } catch (error) {
        console.error(error);
        if (!cancelled) setFailed(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  const isOwn = currentUser && currentUser.id === userId;

  return (
    <main className="container">
      <div className="pub-bar">
        <button className="btn pub-back" onClick={onBack}>
          <ChevronLeft size={16} /> Back to feed
        </button>
      </div>

      {loading ? (
        <>
          <section className="pub-profile">
            <span className="skeleton avatar avatar-lg" />
            <div className="pub-info">
              <div className="skeleton skeleton-line w40" />
              <div className="skeleton skeleton-line w85" style={{ marginTop: 12 }} />
              <div className="skeleton skeleton-line w65" style={{ marginTop: 10 }} />
            </div>
          </section>
          <div className="pub-grid">
            {[0, 1, 2, 3, 4, 5].map((index) => (
              <span className="skeleton pub-tile" key={index} />
            ))}
          </div>
        </>
      ) : failed || !profile ? (
        <div className="empty">
          <span className="empty-icon">
            <Inbox size={28} />
          </span>
          <h3>Profile not found</h3>
          <p>This student may have removed their account.</p>
          <button className="btn btn-accent" onClick={onBack}>
            Back to feed
          </button>
        </div>
      ) : (
        <>
          <section className="pub-profile">
            <Avatar
              name={profile.name}
              image={profile.profile_image}
              size="lg"
            />

            <div className="pub-info">
              <div className="pub-name-row">
                <h1>{profile.name}</h1>
                {isOwn ? (
                  <button className="btn btn-sm" onClick={onEditProfile}>
                    Edit profile
                  </button>
                ) : null}
              </div>

              {profile.bio ? (
                <p className="pub-bio">{profile.bio}</p>
              ) : (
                <p className="pub-bio pub-bio-muted">
                  {profile.name} hasn't added a bio yet.
                </p>
              )}

              <div className="pub-stats">
                <span>
                  <strong>{profile.post_count}</strong>{" "}
                  {profile.post_count === 1 ? "post" : "posts"}
                </span>
                <span>
                  <strong>{profile.like_count}</strong>{" "}
                  {profile.like_count === 1 ? "like" : "likes"}
                </span>
                <span className="pub-joined">
                  Joined {formatDate(profile.created_at)}
                </span>
              </div>
            </div>
          </section>

          <div className="pub-tabs">
            <span className="pub-tab is-active">Posts</span>
          </div>

          {posts.length === 0 ? (
            <div className="empty">
              <span className="empty-icon">
                <Inbox size={28} />
              </span>
              <h3>No posts yet</h3>
              <p>
                {isOwn
                  ? "Share your first set of notes to get started."
                  : `${profile.name} hasn't shared anything yet.`}
              </p>
            </div>
          ) : (
            <div className="pub-grid">
              {posts.map((post) => (
                <button
                  type="button"
                  className="pub-tile"
                  key={post.id}
                  onClick={() => onOpenPost(post)}
                  aria-label={`Open post: ${post.title}`}
                >
                  {post.image_url ? (
                    <img src={post.image_url} alt={post.title} loading="lazy" />
                  ) : (
                    <span className="pub-tile-fallback">
                      <span className="tag">{post.subject || "general"}</span>
                      <span className="pub-tile-title">{post.title}</span>
                    </span>
                  )}

                  <span className="pub-tile-stats">
                    <span>
                      <Heart size={15} /> {post.like_count ?? 0}
                    </span>
                    <span>
                      <Message size={15} /> {post.comment_count ?? 0}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </main>
  );
}

/* =====================================================
   PROFILE
   ===================================================== */

function Profile({
  user,
  postCount,
  setPage,
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
            onClick={() => setPage("my-posts")}
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

export default App;
