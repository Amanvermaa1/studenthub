import { useNavigate } from "react-router-dom";
import { Pen, Plus, Trash } from "../Icons.jsx";
import FeedPost from "../components/FeedPost.jsx";

/* =====================================================
   MY POSTS
   ===================================================== */

function MyPosts({
  posts,
  deletePost,
  onOpen,
  onOpenAuthor,
  getLikeInfo,
  onToggleLike,
  bookmarkState,
  onToggleBookmark,
}) {
  const navigate = useNavigate();

  return (
    <main className="container">
      <section className="page-header">
        <div>
          <span className="eyebrow-plain">Your library</span>
          <h1>My posts</h1>
          <p>Edit, refresh or remove anything you have published.</p>
        </div>

        <button className="btn btn-accent" onClick={() => navigate("/create")}>
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
          <button className="btn btn-accent" onClick={() => navigate("/create")}>
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
                    onClick={() => navigate(`/edit/${post.id}`)}
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

export default MyPosts;
