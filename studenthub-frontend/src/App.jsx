import { useEffect, useState } from "react";
import { Routes, Route, Navigate, useLocation, useNavigate, useParams } from "react-router-dom";
import "./App.css";

import { API } from "./api/client.js";
import { notify, ToastHost } from "./components/Toast.jsx";
import ConfirmDialog from "./components/ConfirmDialog.jsx";
import Navbar from "./components/Navbar.jsx";
import LandingPage from "./pages/Landing.jsx";
import LoginPage from "./pages/Login.jsx";
import RegisterPage from "./pages/Register.jsx";
import { HomePage } from "./pages/Feed.jsx";
import CreatePost from "./pages/CreatePost.jsx";
import MyPosts from "./pages/MyPosts.jsx";
import EditPost from "./pages/EditPost.jsx";
import Profile from "./pages/Profile.jsx";
import SavedPage from "./pages/Saved.jsx";
import PostView from "./components/PostView.jsx";
import PublicProfile from "./components/PublicProfile.jsx";
import { Protected, Guest } from "./components/guards.jsx";
import NotFound from "./pages/NotFound.jsx";
import SearchResults from "./pages/SearchResults.jsx";
import StaticPage from "./pages/StaticPage.jsx";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [myPosts, setMyPosts] = useState([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [subject, setSubject] = useState("");
  const [sort, setSort] = useState("latest");
  const [feedTab, setFeedTab] = useState("for-you");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [confirmRequest, setConfirmRequest] = useState(null);
  const [likeState, setLikeState] = useState({});
  const [bookmarkState, setBookmarkState] = useState({});

  const navigate = useNavigate();
  const location = useLocation();

  const isPostPath = location.pathname.startsWith("/post/");
  const bgPath = location.state?.background?.pathname
    ?? (isPostPath ? "/" : location.pathname);

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    notify("You have been signed out.");
    navigate("/");
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

  const fetchPosts = async (pageToLoad = 1, append = false) => {
    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      const response = await fetch(
        `${API}/posts?page=${pageToLoad}&limit=6&search=${encodeURIComponent(
          debouncedSearch
        )}&subject=${encodeURIComponent(subject)}&sort=${encodeURIComponent(sort)}&feedTab=${encodeURIComponent(feedTab)}`,
        token ? { headers: { Authorization: `Bearer ${token}` } } : undefined
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

  const loadMorePosts = async () => {
    if (loading || loadingMore) return;
    if (currentPage >= totalPages) return;
    await fetchPosts(currentPage + 1, true);
  };

  const hydrateEngagement = async (list) => {
    if (!token || !list.length) return;

    try {
      const ids = list.map((post) => post.id).join(",");
      const response = await fetch(`${API}/posts/engagement?ids=${ids}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) return;

      const data = await response.json();
      const engagement = data.engagement || {};

      setLikeState((current) => {
        const next = { ...current };
        list.forEach((post) => {
          const info = engagement[post.id];
          if (info) {
            next[post.id] = { liked: info.liked, likes: info.likes };
          }
        });
        return next;
      });

      setBookmarkState((current) => {
        const next = { ...current };
        list.forEach((post) => {
          const info = engagement[post.id];
          if (info) next[post.id] = info.bookmarked;
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
    const timer = window.setTimeout(() => setDebouncedSearch(search), 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    if (!token) return;
    if (bgPath === "/") fetchPosts(1, false);
    if (bgPath === "/my-posts" || bgPath === "/profile") fetchMyPosts();
  }, [bgPath, debouncedSearch, subject, sort, feedTab, token]);

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

      notify("Account created. Sign in to continue.");
      return { ok: true };
    } catch (error) {
      console.error(error);
      return { ok: false, message: "Could not reach the server. Try again." };
    }
  };

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
      return data.post || true;
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

  const openPost = (post) => {
    navigate(`/post/${post.id}`, { state: { background: location, post } });
  };

  const refreshPostCounts = async (postId) => {
    try {
      const response = await fetch(`${API}/posts/${postId}`);
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

  const closePost = async (postId) => {
    await refreshPostCounts(postId);
    if (location.state?.background) {
      navigate(-1);
    } else {
      navigate("/", { replace: true });
    }
  };

  const viewProfile = (userId) => {
    if (!userId || !user) return;

    if (userId === user.id) {
      navigate("/profile");
      return;
    }

    navigate(`/u/${userId}`);
  };

  const viewProfileFromPost = (userId) => {
    navigate(`/u/${userId}`);
  };

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

  return (
    <div className="app">
      <Navbar token={token} user={user} logout={logout} />

      <Routes location={bgPath ?? location}>
        <Route
          path="/"
          element={
            token ? (
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
                sort={sort}
                setSort={setSort}
                feedTab={feedTab}
                setFeedTab={setFeedTab}
                onOpenPost={openPost}
                onOpenAuthor={viewProfile}
                getLikeInfo={getLikeInfo}
                onToggleLike={toggleLike}
                bookmarkState={bookmarkState}
                onToggleBookmark={toggleBookmark}
              />
            ) : (
              <LandingPage />
            )
          }
        />
        <Route
          path="/login"
          element={
            <Guest token={token}>
              <LoginPage login={login} />
            </Guest>
          }
        />
        <Route
          path="/register"
          element={
            <Guest token={token}>
              <RegisterPage register={register} />
            </Guest>
          }
        />
        <Route
          path="/create"
          element={
            <Protected token={token}>
              <CreatePost createPost={createPost} token={token} />
            </Protected>
          }
        />
        <Route
          path="/my-posts"
          element={
            <Protected token={token}>
              <MyPosts
                posts={myPosts}
                deletePost={deletePost}
                onOpen={openPost}
                onOpenAuthor={viewProfile}
                getLikeInfo={getLikeInfo}
                onToggleLike={toggleLike}
                bookmarkState={bookmarkState}
                onToggleBookmark={toggleBookmark}
              />
            </Protected>
          }
        />
        <Route
          path="/edit/:id"
          element={
            <Protected token={token}>
              <EditPost token={token} fetchMyPosts={fetchMyPosts} user={user} />
            </Protected>
          }
        />
        <Route
          path="/profile"
          element={
            <Protected token={token}>
              <Profile
                user={user}
                postCount={myPosts.length}
                onSaveProfile={saveProfile}
                onUploadAvatar={uploadAvatar}
                onChangePassword={updatePassword}
              />
            </Protected>
          }
        />
        <Route
          path="/saved"
          element={
            <Protected token={token}>
              <SavedPage />
            </Protected>
          }
        />
        <Route
          path="/u/:userId"
          element={
            <Protected token={token}>
              <PublicProfile
                currentUser={user}
                onOpenPost={openPost}
              />
            </Protected>
          }
        />
        <Route
          path="/posts/search"
          element={
            <SearchResults
              onOpenPost={openPost}
              onOpenAuthor={viewProfile}
              getLikeInfo={getLikeInfo}
              onToggleLike={toggleLike}
              bookmarkState={bookmarkState}
              onToggleBookmark={toggleBookmark}
              hydrateEngagement={hydrateEngagement}
            />
          }
        />

        {/* Static pages: About, Privacy, Terms, Guidelines, Help, Contact */}
        <Route path="/about" element={<StaticPage slug="about" />} />
        <Route path="/privacy" element={<StaticPage slug="privacy" />} />
        <Route path="/terms" element={<StaticPage slug="terms" />} />
        <Route path="/guidelines" element={<StaticPage slug="guidelines" />} />
        <Route path="/help" element={<StaticPage slug="help" />} />
        <Route path="/contact" element={<StaticPage slug="contact" />} />

        <Route path="*" element={<NotFound />} />
      </Routes>

      <Routes>
        <Route
          path="/post/:postId"
          element={
            token ? (
              <PostRoute
                token={token}
                user={user}
                posts={posts}
                myPosts={myPosts}
                likeState={likeState}
                bookmarkState={bookmarkState}
                onToggleLike={toggleLike}
                onToggleBookmark={toggleBookmark}
                onOpenAuthor={viewProfileFromPost}
                onClose={closePost}
                onHydrate={hydrateEngagement}
              />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>

      <ToastHost />

      <ConfirmDialog
        request={confirmRequest}
        onCancel={() => setConfirmRequest(null)}
        onConfirm={() => confirmRequest?.onConfirm()}
      />
    </div>
  );
}

function PostRoute({
  token,
  user,
  posts,
  myPosts,
  likeState,
  bookmarkState,
  onToggleLike,
  onToggleBookmark,
  onOpenAuthor,
  onClose,
  onHydrate,
}) {
  const { postId } = useParams();
  const id = Number(postId);
  const location = useLocation();
  const navigate = useNavigate();
  const [post, setPost] = useState(() =>
    location.state?.post || posts.find((p) => p.id === id) || myPosts.find((p) => p.id === id) || null
  );

  useEffect(() => {
    // Re-resolve when the id changes (e.g. navigating between related posts
    // inside the modal) — location.state carries the full post when available.
    const found =
      location.state?.post ||
      posts.find((p) => p.id === id) ||
      myPosts.find((p) => p.id === id) ||
      null;

    if (found) {
      setPost(found);
      return undefined;
    }

    let cancelled = false;
    setPost(null);
    (async () => {
      try {
        const response = await fetch(`${API}/posts/${id}`);
        if (!response.ok) {
          return;
        }
        const fresh = await response.json();
        if (!cancelled) setPost(fresh);
      } catch (error) {
        console.error(error);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (post && token) {
      onHydrate([post]);
    }
  }, [post, token]);

  if (!post) {
    return (
      <div className="overlay detail-overlay">
        <article className="detail-card" style={{ maxWidth: "400px", margin: "2rem auto" }}>
          <div className="detail-side" style={{ padding: "2rem", textAlign: "center" }}>
            <h2>Post not found</h2>
            <p>The post you're looking for doesn't exist.</p>
            <button className="btn btn-accent" onClick={() => {
              if (location.state?.background) navigate(-1);
              else navigate("/", { replace: true });
            }}>
              Close
            </button>
          </div>
        </article>
      </div>
    );
  }

  const getLikeInfo = (p) =>
    likeState[p.id] ?? {
      liked: false,
      likes: p.like_count ?? 0,
    };

  const bookmarked = !!bookmarkState[post.id];

  return (
    <PostView
      post={post}
      token={token}
      currentUser={user}
      likeInfo={getLikeInfo(post)}
      onToggleLike={() => onToggleLike(post)}
      bookmarked={bookmarked}
      onToggleBookmark={() => onToggleBookmark(post)}
      onOpenAuthor={onOpenAuthor}
      onClose={() => onClose(post.id)}
    />
  );
}

export default App;