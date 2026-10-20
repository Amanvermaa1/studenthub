import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, ChevronRight, Inbox, Plus, Search, Bulb, Fire, Award, Users } from "../Icons.jsx";
import FeedPost from "../components/FeedPost.jsx";
import { API } from "../api/client.js";

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
  sort,
  setSort,
  feedTab,
  setFeedTab,
  onOpenPost,
  onOpenAuthor,
  getLikeInfo,
  onToggleLike,
  bookmarkState,
  onToggleBookmark,
}) {
  const loadMoreRef = useRef(loadMore);
  loadMoreRef.current = loadMore;
  const navigate = useNavigate();
  const [trendingTags, setTrendingTags] = useState([]);
  const [trendingUsers, setTrendingUsers] = useState([]);
  const [showTrending, setShowTrending] = useState(true);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const [tagsRes, usersRes] = await Promise.all([
          fetch(`${API}/tags/trending?days=7&limit=10`),
          fetch(`${API}/users/trending?days=7&limit=5`),
        ]);

        if (tagsRes.ok) {
          const data = await tagsRes.json();
          setTrendingTags(data.tags || []);
        }
        if (usersRes.ok) {
          const data = await usersRes.json();
          setTrendingUsers(data.users || []);
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchTrending();
  }, []);

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
    <main className="container feed-layout">
      <div className="feed-main">
        <section className="page-header">
          <div>
            <span className="eyebrow-plain">The feed</span>
            <h1>Explore student knowledge</h1>
            <p>Posts, tutorials and ideas shared by students like you.</p>
          </div>

          <button className="btn btn-accent" onClick={() => navigate("/create")}>
            <Plus size={17} /> New post
          </button>
        </section>

        <div className="feed-tabs" role="tablist" aria-label="Feed filter">
          <button
            role="tab"
            className={`feed-tab${feedTab === "for-you" ? " active" : ""}`}
            onClick={() => setFeedTab("for-you")}
            aria-selected={feedTab === "for-you"}
          >
            For you
          </button>
          <button
            role="tab"
            className={`feed-tab${feedTab === "following" ? " active" : ""}`}
            onClick={() => setFeedTab("following")}
            aria-selected={feedTab === "following"}
          >
            Following
          </button>
        </div>

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

          <div className="sort-wrap" role="group" aria-label="Sort feed">
            <button
              className={`sort-btn${sort === "latest" ? " active" : ""}`}
              onClick={() => setSort("latest")}
            >
              Latest
            </button>
            <button
              className={`sort-btn${sort === "liked" ? " active" : ""}`}
              onClick={() => setSort("liked")}
            >
              Most liked
            </button>
            <button
              className={`sort-btn${sort === "discussed" ? " active" : ""}`}
              onClick={() => setSort("discussed")}
            >
              Discussed
            </button>
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
      </div>

      {(trendingTags.length > 0 || trendingUsers.length > 0) && (
        <aside className={`feed-sidebar${showTrending ? "" : " is-collapsed"}`}>
          {showTrending ? (
            <>
              <button
                className="sidebar-toggle"
                onClick={() => setShowTrending(false)}
                aria-label="Close trending"
              >
                <span className="visually-hidden">Close trending</span>
              </button>

              {trendingTags.length > 0 && (
                <div className="sidebar-section">
                  <div className="sidebar-header">
                    <h3>
                      <Fire size={16} /> Trending topics
                    </h3>
                  </div>
                  <ul className="trending-tags">
                    {trendingTags.map((tag, i) => (
                      <li key={i}>
                        <button
                          className="trending-tag"
                          onClick={() =>
                            navigate(`/posts/search?tag=${encodeURIComponent(tag.name)}`)
                          }
                        >
                          <span className="trending-rank">#{i + 1}</span>
                          <span className="trending-name">#{tag.name}</span>
                          <span className="trending-count">{tag.count} posts</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {trendingUsers.length > 0 && (
                <div className="sidebar-section">
                  <div className="sidebar-header">
                    <h3>
                      <Users size={16} /> Top contributors
                    </h3>
                  </div>
                  <ul className="trending-users">
                    {trendingUsers.map((user, i) => (
                      <li key={user.id}>
                        <button
                          className="trending-user"
                          onClick={() => navigate(`/u/${user.id}`)}
                        >
                          <span className="trending-rank">#{i + 1}</span>
                          <img
                            className="trending-avatar"
                            src={user.profile_image}
                            alt={user.name}
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                          <span className="trending-name">{user.name}</span>
                          <span className="trending-likes">
                            <Award size={12} /> {user.like_count}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          ) : (
            <button
              className="sidebar-toggle-show"
              onClick={() => setShowTrending(true)}
              aria-label="Show trending"
            >
              <Bulb size={16} /> Show trending
            </button>
          )}
        </aside>
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

export { HomePage, SkeletonCard };
