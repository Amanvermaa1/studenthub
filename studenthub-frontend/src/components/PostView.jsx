import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Bookmark, Calendar, Close, Heart, Message, Share, ArrowLeft, FileText, Tag } from "../Icons.jsx";
import { API, cloudinaryImageUrl } from "../api/client.js";
import { formatDate } from "../lib/format.js";
import { Avatar, initials } from "../components/Avatar.jsx";
import { notify } from "../components/Toast.jsx";
import { sharePostLink } from "../lib/share.js";
import { renderMarkdown } from "../lib/markdown.js";

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
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [related, setRelated] = useState([]);
  const [postHtml, setPostHtml] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  // Render post markdown async
  useEffect(() => {
    let cancelled = false;
    renderMarkdown(post.content).then((html) => {
      if (!cancelled) setPostHtml(html);
    });
    return () => { cancelled = true; };
  }, [post.content]);

  const openRelated = (relatedPost) => {
    if (relatedPost.id === post.id) return;
    navigate(`/post/${relatedPost.id}`, {
      replace: true,
      state: {
        background: location.state?.background,
        post: relatedPost,
      },
    });
  };

  const goToTag = (tagName) => {
    const href = `/posts/search?tag=${encodeURIComponent(tagName)}`;
    if (location.state?.background) {
      // Modal is open over a background route: close it, then go to search
      navigate(href, { state: { background: location.state.background } });
    } else {
      navigate(href);
    }
  };

  const liked = !!likeInfo.liked;
  const likes = likeInfo.likes ?? post.like_count ?? 0;

  const commentCount = loading
    ? post.comment_count ?? 0
    : comments.reduce((sum, c) => sum + 1 + (c.replies?.length || 0), 0);

  const loadComments = async (initial = false) => {
    if (initial) setLoading(true);

    try {
      const response = await fetch(`${API}/comments/post/${post.id}`);
      const data = await response.json();
      // Build nested structure
      const commentMap = {};
      const topLevel = [];
      (Array.isArray(data) ? data : []).forEach((c) => {
        c.replies = [];
        c.liked = false;
        c.likes = c.like_count ?? 0;
        commentMap[c.id] = c;
      });
      (Array.isArray(data) ? data : []).forEach((c) => {
        if (c.parent_id) {
          const parent = commentMap[c.parent_id];
          if (parent) parent.replies.push(c);
        } else {
          topLevel.push(c);
        }
      });
      setComments(topLevel);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const hydrateCommentLikes = async () => {
    if (!token) return;
    const allComments = flattenComments(comments);
    if (!allComments.length) return;

    try {
      const ids = allComments.map((c) => c.id).join(",");
      const response = await fetch(`${API}/comments/engagement?ids=${ids}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) return;
      const data = await response.json();
      const engagement = data.engagement || {};
      setComments((current) => updateCommentLikes(current, engagement));
    } catch (error) {
      console.error(error);
    }
  };

  const flattenComments = (list) => {
    const result = [];
    list.forEach((c) => {
      result.push(c);
      if (c.replies?.length) result.push(...flattenComments(c.replies));
    });
    return result;
  };

  const updateCommentLikes = (list, engagement) => {
    return list.map((c) => {
      const info = engagement[c.id];
      const updated = { ...c, liked: info?.liked || false, likes: info?.likes || 0 };
      if (c.replies?.length) updated.replies = updateCommentLikes(c.replies, engagement);
      return updated;
    });
  };

  useEffect(() => {
    loadComments(true);
  }, [post.id]);

  // Related posts ("More like this") for the sidebar
  useEffect(() => {
    let cancelled = false;
    setRelated([]);

    (async () => {
      try {
        const response = await fetch(`${API}/posts/${post.id}/related?limit=3`);
        if (!response.ok) return;
        const data = await response.json();
        if (!cancelled) setRelated(data.posts || []);
      } catch (error) {
        console.error(error);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [post.id]);

  useEffect(() => {
    if (comments.length) hydrateCommentLikes();
  }, [comments]);

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === "Escape") {
        if (replyingTo) setReplyingTo(null);
        else onClose();
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [post.id, replyingTo]);

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

  const submitReply = async (parentId) => {
    const content = replyText.trim();
    if (!content) return;

    setBusy(true);

    try {
      const response = await fetch(`${API}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content, postId: post.id, parentId }),
      });

      const data = await response.json();

      if (!response.ok) {
        notify(data.message || "Could not add the reply.", "error");
        return;
      }

      setReplyText("");
      setReplyingTo(null);
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

      setComments((current) => removeCommentRecursive(current, id));
      notify("Comment deleted.");
    } catch (error) {
      console.error(error);
      notify("Could not reach the server. Try again.", "error");
    }
  };

  const removeCommentRecursive = (list, id) => {
    return list
      .filter((c) => c.id !== id)
      .map((c) => ({
        ...c,
        replies: c.replies ? removeCommentRecursive(c.replies, id) : [],
      }));
  };

  const startEdit = (comment) => {
    setEditingId(comment.id);
    setEditText(comment.content);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText("");
  };

  const saveEdit = async (id) => {
    const content = editText.trim();
    if (!content) return;

    try {
      const response = await fetch(`${API}/comments/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content }),
      });

      const data = await response.json();

      if (!response.ok) {
        notify(data.message || "Could not update the comment.", "error");
        return;
      }

      notify("Comment updated.");
      setComments((current) => updateCommentRecursive(current, id, { content }));
      setEditingId(null);
      setEditText("");
    } catch (error) {
      console.error(error);
      notify("Could not reach the server. Try again.", "error");
    }
  };

  const updateCommentRecursive = (list, id, updates) => {
    return list.map((c) => {
      if (c.id === id) return { ...c, ...updates };
      if (c.replies?.length) return { ...c, replies: updateCommentRecursive(c.replies, id, updates) };
      return c;
    });
  };

  const toggleCommentLike = async (comment) => {
    if (!token) return;

    try {
      const response = await fetch(`${API}/comments/${comment.id}/like`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Like failed.");

      const data = await response.json();
      setComments((current) => updateCommentLikeRecursive(current, comment.id, data.liked, data.totalLikes));
    } catch (error) {
      console.error(error);
      notify("Could not update the like. Try again.", "error");
    }
  };

  const updateCommentLikeRecursive = (list, id, liked, likes) => {
    return list.map((c) => {
      if (c.id === id) return { ...c, liked, likes };
      if (c.replies?.length) return { ...c, replies: updateCommentLikeRecursive(c.replies, id, liked, likes) };
      return c;
    });
  };

  const startReply = (comment) => {
    setReplyingTo(comment);
    setReplyText(`@${comment.author} `);
    setTimeout(() => {
      const field = document.getElementById(`reply-input-${comment.id}`);
      if (field) field.focus();
    }, 0);
  };

  const cancelReply = () => {
    setReplyingTo(null);
    setReplyText("");
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
            <img src={cloudinaryImageUrl(post.image_url)} alt={post.title} />
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
                    <span
                      className="caption-body markdown-body"
                      dangerouslySetInnerHTML={{ __html: postHtml }}
                    />
                  </p>
                <div className="comment-meta">
                  <span className="comment-date">
                    {formatDate(post.created_at)}
                  </span>
                </div>
              </div>
            </div>

            {(post.attachments?.length || post.tags?.length) && (
              <div className="detail-meta-row">
                {post.attachments?.length > 0 && (
                  <div className="detail-attachments">
                    {post.attachments.map((att, i) => (
                      <a
                        key={i}
                        href={att.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="detail-attachment-link"
                      >
                        <FileText size={15} />
                        <span>{att.filename}</span>
                        <span className="attachment-size">({(att.size_bytes / 1024).toFixed(1)} KB)</span>
                      </a>
                    ))}
                  </div>
                )}

                {post.tags?.length > 0 && (
                  <div className="detail-tags">
                    {post.tags.map((tag, i) => (
                      <button
                        key={tag.id || i}
                        className="hashtag-tag"
                        onClick={() => goToTag(tag.name)}
                      >
                        <Tag size={13} /> {tag.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

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
                  <CommentThread
                    key={comment.id}
                    comment={comment}
                    currentUser={currentUser}
                    token={token}
                    onOpenAuthor={onOpenAuthor}
                    onDelete={deleteComment}
                    onEdit={startEdit}
                    onCancelEdit={cancelEdit}
                    onSaveEdit={saveEdit}
                    onReply={startReply}
                    onToggleLike={toggleCommentLike}
                    editingId={editingId}
                    editText={editText}
                    setEditText={setEditText}
                    replyingTo={replyingTo}
                    replyText={replyText}
                    setReplyText={setReplyText}
                    onSubmitReply={submitReply}
                    onCancelReply={cancelReply}
                    formatDate={formatDate}
                    initials={initials}
                    Avatar={Avatar}
                    notify={notify}
                    API={API}
                  />
                ))}
              </div>
            )}
          </div>

            {related.length > 0 && (
              <div className="related-posts">
                <h3 className="related-title">More like this</h3>
                <ul className="related-list">
                  {related.map((rp) => (
                    <li key={rp.id}>
                      <button
                        className="related-item"
                        onClick={() => openRelated(rp)}
                      >
                        <span className="related-title-text">{rp.title}</span>
                        <span className="related-meta">
                          <span className="related-author">{rp.author}</span>
                          <span className="related-stats">
                            <Heart size={12} /> {rp.like_count ?? 0}
                            <Message size={12} /> {rp.comment_count ?? 0}
                          </span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

          {replyingTo && (
            <form className="composer-bar reply-composer" onSubmit={(e) => { e.preventDefault(); submitReply(replyingTo.id); }}>
              <input
                id={`reply-input-${replyingTo.id}`}
                className="composer-input"
                placeholder={`Replying to @${replyingTo.author}...`}
                value={replyText}
                onChange={(event) => setReplyText(event.target.value)}
                required
              />
              <button
                className="composer-post"
                disabled={busy || !replyText.trim()}
              >
                {busy ? <span className="spinner" /> : "Reply"}
              </button>
              <button
                type="button"
                className="composer-cancel"
                onClick={cancelReply}
                aria-label="Cancel reply"
              >
                <ArrowLeft size={18} />
              </button>
            </form>
          )}

          {!replyingTo && (
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
          )}
        </div>
      </article>
    </div>
  );
}

function CommentThread({
  comment,
  currentUser,
  token,
  onOpenAuthor,
  onDelete,
  onEdit,
  onCancelEdit,
  onSaveEdit,
  onReply,
  onToggleLike,
  editingId,
  editText,
  setEditText,
  replyingTo,
  replyText,
  setReplyText,
  onSubmitReply,
  onCancelReply,
  formatDate,
  initials,
  Avatar,
  notify,
  API,
}) {
  const [liked, setLiked] = useState(comment.liked || false);
  const [likes, setLikes] = useState(comment.likes || 0);

  useEffect(() => {
    setLiked(comment.liked || false);
    setLikes(comment.likes || 0);
  }, [comment.liked, comment.likes]);

  const handleToggleLike = () => {
    const newLiked = !liked;
    const newLikes = newLiked ? likes + 1 : Math.max(0, likes - 1);
    setLiked(newLiked);
    setLikes(newLikes);
    onToggleLike(comment);
  };

  const isOwn = currentUser && currentUser.id === comment.user_id;
  const showReplyComposer = replyingTo?.id === comment.id;

  return (
    <div className="comment" data-comment-id={comment.id}>
      <span className="avatar avatar-sm">
        {comment.author_avatar ? (
          <img src={comment.author_avatar} alt={comment.author} />
        ) : (
          initials(comment.author)
        )}
      </span>

      <div className="comment-main">
        {editingId === comment.id ? (
          <div className="comment-edit">
            <textarea
              className="comment-edit-textarea"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              rows={3}
            />
            <div className="comment-edit-actions">
              <button className="btn btn-accent btn-sm" onClick={() => onSaveEdit(comment.id)}>
                Save
              </button>
              <button className="btn btn-outline btn-sm" onClick={onCancelEdit}>
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <p className="comment-line">
            <button
              type="button"
              className="author-link comment-author"
              onClick={() => onOpenAuthor(comment.user_id)}
            >
              {comment.author}
            </button>
            <span
              className="comment-content markdown-body"
              dangerouslySetInnerHTML={{ __html: commentHtmlMap[comment.id] || "" }}
            />
          </p>
        )}

        <div className="comment-meta">
          <span className="comment-date">
            {formatDate(comment.created_at)}
          </span>

          <div className="comment-actions">
            <button
              className={`comment-like-btn${liked ? " liked" : ""}`}
              onClick={handleToggleLike}
              aria-pressed={liked}
              aria-label={liked ? "Unlike comment" : "Like comment"}
            >
              <Heart size={16} />
              <span>{likes}</span>
            </button>

            {isOwn && editingId !== comment.id && (
              <>
                <button
                  className="comment-edit-btn"
                  onClick={() => onEdit(comment)}
                >
                  Edit
                </button>
                <button
                  className="comment-delete"
                  onClick={() => onDelete(comment.id)}
                >
                  Delete
                </button>
              </>
            )}

            {!isOwn && (
              <button
                className="comment-reply-btn"
                onClick={() => onReply(comment)}
              >
                <ArrowLeft size={14} /> Reply
              </button>
            )}
          </div>
        </div>
      </div>

      {showReplyComposer && (
        <form className="reply-composer-inline" onSubmit={(e) => { e.preventDefault(); onSubmitReply(comment.id); }}>
          <span className="avatar avatar-sm">
            {currentUser?.profile_image ? (
              <img src={currentUser.profile_image} alt={currentUser.name} />
            ) : (
              initials(currentUser?.name)
            )}
          </span>
          <div className="reply-composer-content">
            <input
              id={`reply-input-${comment.id}`}
              className="composer-input"
              placeholder={`Replying to @${comment.author}...`}
              value={replyText}
              onChange={(event) => setReplyText(event.target.value)}
              required
            />
            <div className="reply-composer-actions">
              <button
                className="composer-post"
                disabled={busy || !replyText.trim()}
              >
                Reply
              </button>
              <button
                type="button"
                className="composer-cancel"
                onClick={onCancelReply}
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      )}

      {comment.replies?.length > 0 && (
        <div className="comment-replies">
          {comment.replies.map((reply) => (
            <CommentThread
              key={reply.id}
              comment={reply}
              currentUser={currentUser}
              token={token}
              onOpenAuthor={onOpenAuthor}
              onDelete={onDelete}
              onEdit={onEdit}
              onCancelEdit={onCancelEdit}
              onSaveEdit={onSaveEdit}
              onReply={onReply}
              onToggleLike={onToggleLike}
              editingId={editingId}
              editText={editText}
              setEditText={setEditText}
              replyingTo={replyingTo}
              replyText={replyText}
              setReplyText={setReplyText}
              onSubmitReply={onSubmitReply}
              onCancelReply={onCancelReply}
              formatDate={formatDate}
              initials={initials}
              Avatar={Avatar}
              notify={notify}
              API={API}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default PostView;