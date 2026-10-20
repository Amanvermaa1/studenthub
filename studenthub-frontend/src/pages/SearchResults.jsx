import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Inbox, Plus, Search } from "../Icons.jsx";
import FeedPost from "../components/FeedPost.jsx";
import { API } from "../api/client.js";

/* =====================================================
   SEARCH RESULTS (full-text search + tag search)
   ===================================================== */

function SearchResults({
  onOpenPost,
  onOpenAuthor,
  getLikeInfo,
  onToggleLike,
  bookmarkState,
  onToggleBookmark,
  hydrateEngagement,
}) {
  const [searchParams] = useSearchParams();
  const tag = searchParams.get("tag");
  const q = searchParams.get("q");

  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Reset whenever the query changes
  useEffect(() => {
    setPage(1);
    setPosts([]);
  }, [tag, q]);

  useEffect(() => {
    let cancelled = false;

    const hasQuery = !!tag || !!(q && q.trim().length >= 2);

    if (!hasQuery) {
      setPosts([]);
      setTotalPages(1);
      setLoading(false);
      return undefined;
    }

    const load = async () => {
      setLoading(true);
      try {
        const url = tag
          ? `${API}/posts/search-by-tag?tag=${encodeURIComponent(tag)}&page=${page}&limit=10`
          : `${API}/posts/search?q=${encodeURIComponent(q.trim())}&page=${page}&limit=10`;

        const response = await fetch(url);
        if (!response.ok) throw new Error(`Search failed (${response.status})`);

        const data = await response.json();
        if (cancelled) return;

        const incoming = data.posts || [];
        setPosts((current) => (page === 1 ? incoming : [...current, ...incoming]));
        setTotalPages(data.totalPages || 1);

        if (page === 1 && hydrateEngagement) {
          hydrateEngagement(incoming);
        }
      } catch (error) {
        console.error(error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [tag, q, page]); // eslint-disable-line react-hooks/exhaustive-deps

  const title = tag ? `#${tag}` : q ? `"${q}"` : "Search";
  const canLoadMore = page < totalPages && !loading;

  return (
    <main className="container">
      <section className="page-header">
        <div>
          <span className="eyebrow-plain">
            {tag ? "Tag" : "Search"} results
          </span>
          <h1>{title}</h1>
          <p>
            {loading
              ? "Searching posts..."
              : `${posts.length} post${posts.length === 1 ? "" : "s"} found`}
          </p>
        </div>

        <button className="btn btn-outline" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} /> Back
        </button>
      </section>

      <div className="search-banner">
        <Search size={16} />
        <span>
          {tag
            ? `Posts tagged with #${tag}`
            : `Full-text search for "${q || ""}"`}
        </span>
      </div>

      {loading && posts.length === 0 ? (
        <div className="feed">
          {Array.from({ length: 3 }, (_, index) => (
            <div className="skeleton-card" key={index}>
              <div className="skeleton skeleton-media" />
              <div className="skeleton-body">
                <div className="skeleton skeleton-line w40" />
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
          <h3>No results found</h3>
          <p>
            Nothing matched {tag ? `#${tag}` : `"${q || ""}"`}. Try a different
            keyword, or share the first post on this topic.
          </p>
          <button className="btn btn-accent" onClick={() => navigate("/create")}>
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
          {canLoadMore ? (
            <button
              className="btn btn-outline"
              onClick={() => setPage((current) => current + 1)}
            >
              Load more results
            </button>
          ) : (
            <span className="feed-status-text">End of results</span>
          )}
        </div>
      )}
    </main>
  );
}

export default SearchResults;
