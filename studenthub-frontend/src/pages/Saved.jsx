import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Pen, Plus, Inbox, Trash } from "../Icons.jsx";
import FeedPost from "../components/FeedPost.jsx";

/* =====================================================
   SAVED
   ===================================================== */

function SavedPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [bookmarkState, setBookmarkState] = useState({});
  const navigate = useNavigate();

  const fetchBookmarks = async (pageToLoad = 1, append = false) => {
    try {
      if (append) {
        // For infinite scroll we'd need this, but saved page uses pagination
      } else {
        setLoading(true);
      }

      const response = await fetch(
        `/api/bookmarks?page=${pageToLoad}&limit=10`,
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
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
    }
  };

  const hydrateEngagement = async (list) => {
    const token = localStorage.getItem("token");
    if (!token || !list.length) return;

    try {
      const ids = list.map((post) => post.id).join(",");
      const response = await fetch(`${API}/posts/engagement?ids=${ids}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) return;

      const data = await response.json();
      const engagement = data.engagement || {};

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

  const getLikeInfo = (post) => ({
    liked: false,
    likes: post.like_count ?? 0,
  });

  const toggleLike = async (post) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch(`/api/likes/${post.id}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Like failed.");
    } catch (error) {
      console.error(error);
    }
  };

  const toggleBookmark = async (post) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const current = bookmarkState[post.id] ?? false;
    setBookmarkState((state) => ({ ...state, [post.id]: !current }));

    try {
      const response = await fetch(`/api/bookmarks/${post.id}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Bookmark failed.");

      const data = await response.json();
      setBookmarkState((state) => ({
        ...state,
        [post.id]: data.bookmarked,
      }));
      if (!data.bookmarked) {
        setPosts((current) => current.filter((p) => p.id !== post.id));
      }
    } catch (error) {
      console.error(error);
      setBookmarkState((state) => ({ ...state, [post.id]: current }));
    }
  };

  const viewProfile = (userId) => {
    navigate(`/u/${userId}`);
  };

  const openPost = (post) => {
    navigate(`/post/${post.id}`, { state: { background: window.location, post } });
  };

  useEffect(() => {
    fetchBookmarks(1, false);
  }, []);

  return (
    <main className="container">
      <section className="page-header">
        <div>
          <span className="eyebrow-plain">Your library</span>
          <h1>Saved posts</h1>
          <p>Posts you bookmarked for later.</p>
        </div>
      </section>

      {loading ? (
        <div className="feed">
          {Array.from({ length: 3 }, (_, index) => (
            <div key={index} className="skeleton-card">
              <div className="skeleton skeleton-media" />
              <div className="skeleton-body">
                <div className="skeleton skeleton-line w40" />
                <div className="skeleton skeleton-line title w85" />
                <div className="skeleton skeleton-line w85" />
                <div className="skeleton skeleton-line w65" />
              </div>
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="empty">
          <span className="empty-icon">
            <Inbox size={28} />
          </span>
          <h3>Nothing saved yet</h3>
          <p>Bookmark posts to read them later.</p>
          <button className="btn btn-accent" onClick={() => navigate("/")}>
            <Plus size={16} /> Explore feed
          </button>
        </div>
      ) : (
        <>
          <div className="feed">
            {posts.map((post) => (
              <FeedPost
                key={post.id}
                post={post}
                likeInfo={getLikeInfo(post)}
                bookmarked={!!bookmarkState[post.id]}
                onToggleLike={() => toggleLike(post)}
                onToggleBookmark={() => toggleBookmark(post)}
                onOpen={() => openPost(post)}
                onOpenAuthor={viewProfile}
                footer={
                  <>
                    <button
                      className="btn btn-soft btn-sm"
                      onClick={() => navigate(`/edit/${post.id}`)}
                    >
                      <Pen size={15} /> Edit
                    </button>
                    <button
                      className="btn btn-danger-soft btn-sm"
                      onClick={() => toggleBookmark(post)}
                    >
                      <Trash size={15} /> Remove
                    </button>
                  </>
                }
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  className={`page-btn${page === currentPage ? " active" : ""}`}
                  onClick={() => fetchBookmarks(page, false)}
                >
                  {page}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </main>
  );
}

export default SavedPage;