import { Bookmark, Calendar, Heart, Message, Share, FileText, Tag } from "../Icons.jsx";
import { formatDate } from "../lib/format.js";
import { Avatar } from "../components/Avatar.jsx";
import { sharePostLink } from "../lib/share.js";
import { useNavigate } from "react-router-dom";
import { renderMarkdownSync as renderMarkdown } from "../lib/markdown.js";
import { cloudinaryImageUrl } from "../api/client.js";

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
  const navigate = useNavigate();

  const openOnKey = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onOpen();
    }
  };

  const handleSubjectClick = (event) => {
    event.stopPropagation();
    if (post.subject) {
      navigate(`/?subject=${encodeURIComponent(post.subject)}`);
    }
  };

  const handleHashtagClick = (event, tag) => {
    event.stopPropagation();
    event.preventDefault();
    navigate(`/posts/search?tag=${encodeURIComponent(tag)}`);
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

        <button
          type="button"
          className="tag subject-tag"
          onClick={handleSubjectClick}
          aria-label={`Filter by ${post.subject || "general"}`}
        >
          {post.subject || "general"}
        </button>
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
          <img src={cloudinaryImageUrl(post.image_url, { width: 640 })} alt={post.title} loading="lazy" />
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
          <span
            className="caption-body markdown-body"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(post.content) }}
          />
        </div>

        {(post.attachments?.length || post.tags?.length) && (
          <div className="feed-meta-row">
            {post.attachments?.length > 0 && (
              <div className="feed-attachments">
                {post.attachments.map((att, i) => (
                  <a
                    key={i}
                    href={att.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="feed-attachment-link"
                  >
                    <FileText size={14} />
                    <span>{att.filename}</span>
                    <span className="attachment-size">({(att.size_bytes / 1024).toFixed(1)} KB)</span>
                  </a>
                ))}
              </div>
            )}

            {post.tags?.length > 0 && (
              <div className="feed-tags">
                {post.tags.map((tag, i) => (
                  <a
                    key={tag.id || i}
                    href={`/posts/search?tag=${encodeURIComponent(tag.name)}`}
                    className="hashtag-tag"
                    onClick={(e) => handleHashtagClick(e, tag.name)}
                  >
                    <Tag size={12} /> {tag.name}
                  </a>
                ))}
              </div>
            )}
          </div>
        )}

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

export default FeedPost;