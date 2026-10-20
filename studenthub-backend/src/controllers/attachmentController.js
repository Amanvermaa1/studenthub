const pool = require("../config/db");
const cloudinary = require("../config/cloudinary");

const getPublicIdFromUrl = (fileUrl) => {
  if (!fileUrl) return null;
  const parts = fileUrl.split("/upload/");
  if (parts.length < 2) return null;
  const publicIdWithExtension = parts[1].split("/").slice(1).join("/");
  return publicIdWithExtension.replace(/\.[^/.]+$/, "");
};

const ALLOWED_ATTACHMENT_MIMES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/zip",
  "application/x-zip-compressed",
];

const MAX_ATTACHMENT_SIZE = 10 * 1024 * 1024; // 10MB

const uploadAttachment = async (req, res) => {
  try {
    const { postId } = req.params;

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    if (!ALLOWED_ATTACHMENT_MIMES.includes(req.file.mimetype)) {
      return res.status(400).json({ message: "File type not allowed" });
    }

    if (req.file.size > MAX_ATTACHMENT_SIZE) {
      return res.status(400).json({ message: "File too large (max 10MB)" });
    }

    const post = await pool.query("SELECT * FROM posts WHERE id = $1", [postId]);
    if (post.rows.length === 0) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.rows[0].user_id !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to attach to this post" });
    }

    const result = await pool.query(
      `INSERT INTO attachments (post_id, file_url, filename, mime, size_bytes)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [postId, req.file.path, req.file.originalname, req.file.mimetype, req.file.size]
    );

    res.status(201).json({
      message: "Attachment uploaded",
      attachment: result.rows[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

const getAttachments = async (req, res) => {
  try {
    const { postId } = req.params;
    const result = await pool.query(
      `SELECT * FROM attachments WHERE post_id = $1 ORDER BY created_at DESC`,
      [postId]
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

const deleteAttachment = async (req, res) => {
  try {
    const { attachmentId } = req.params;

    const attachment = await pool.query("SELECT * FROM attachments WHERE id = $1", [attachmentId]);
    if (attachment.rows.length === 0) {
      return res.status(404).json({ message: "Attachment not found" });
    }

    const post = await pool.query("SELECT user_id FROM posts WHERE id = $1", [attachment.rows[0].post_id]);
    if (post.rows.length === 0 || post.rows[0].user_id !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (attachment.rows[0].file_url) {
      const publicId = getPublicIdFromUrl(attachment.rows[0].file_url);
      if (publicId) {
        await cloudinary.uploader.destroy(publicId, { resource_type: "raw" });
      }
    }

    await pool.query("DELETE FROM attachments WHERE id = $1", [attachmentId]);
    res.status(200).json({ message: "Attachment deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// =====================================================
// TAGS / HASHTAGS
// =====================================================

const getOrCreateTags = async (tagNames) => {
  const tags = [];
  for (const name of tagNames) {
    const lower = name.toLowerCase();
    let tag = await pool.query("SELECT * FROM tags WHERE lower(name) = $1", [lower]);
    if (tag.rows.length === 0) {
      tag = await pool.query("INSERT INTO tags (name) VALUES ($1) RETURNING *", [lower]);
    }
    tags.push(tag.rows[0]);
  }
  return tags;
};

const addTagsToPost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { tags } = req.body; // array of tag names

    if (!Array.isArray(tags)) {
      return res.status(400).json({ message: "Tags must be an array" });
    }

    const post = await pool.query("SELECT * FROM posts WHERE id = $1", [req.params.postId]);
    if (post.rows.length === 0) {
      return res.status(404).json({ message: "Post not found" });
    }
    if (post.rows[0].user_id !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const tagNames = [...new Set(tags.map(t => t.trim().toLowerCase()).filter(Boolean))];
    if (tagNames.length === 0) {
      return res.status(200).json({ tags: [] });
    }

    const tagObjs = await getOrCreateTags(tagNames);
    for (const tag of tagObjs) {
      await pool.query(
        `INSERT INTO post_tags (post_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
        [req.params.postId, tag.id]
      );
    }

    const result = await pool.query(
      `SELECT t.* FROM tags t JOIN post_tags pt ON t.id = pt.tag_id WHERE pt.post_id = $1`,
      [req.params.postId]
    );

    res.status(200).json({ tags: result.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

const removeTagFromPost = async (req, res) => {
  try {
    const { postId, tagId } = req.params;

    const post = await pool.query("SELECT user_id FROM posts WHERE id = $1", [postId]);
    if (post.rows.length === 0) {
      return res.status(404).json({ message: "Post not found" });
    }
    if (post.rows[0].user_id !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await pool.query("DELETE FROM post_tags WHERE post_id = $1 AND tag_id = $2", [postId, tagId]);
    res.status(200).json({ message: "Tag removed" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

const getPostTags = async (req, res) => {
  try {
    const { postId } = req.params;
    const result = await pool.query(
      `SELECT t.* FROM tags t JOIN post_tags pt ON t.id = pt.tag_id WHERE pt.post_id = $1`,
      [postId]
    );
    res.status(200).json({ tags: result.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

const getTrendingTags = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const limit = parseInt(req.query.limit) || 10;
    const result = await pool.query(
      `SELECT t.name, COUNT(pt.post_id) AS count
       FROM tags t
       JOIN post_tags pt ON t.id = pt.tag_id
       JOIN posts p ON pt.post_id = p.id
       WHERE p.created_at >= now() - interval '${days} days'
       GROUP BY t.name
       ORDER BY count DESC
       LIMIT $1`,
      [limit]
    );
    res.status(200).json({ tags: result.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

const searchByTag = async (req, res) => {
  try {
    const { tag } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    if (!tag) {
      return res.status(400).json({ message: "Tag parameter required" });
    }

    const result = await pool.query(
      `SELECT
         posts.id, posts.title, posts.content, posts.subject, posts.image_url,
         posts.created_at, posts.user_id,
         users.name AS author, users.profile_image AS author_avatar,
         (SELECT COUNT(*) FROM likes WHERE likes.post_id = posts.id)::int AS like_count,
         (SELECT COUNT(*) FROM comments WHERE comments.post_id = posts.id)::int AS comment_count,
         COALESCE((
           SELECT json_agg(json_build_object('id', t2.id, 'name', t2.name) ORDER BY t2.name)
           FROM post_tags pt2
           INNER JOIN tags t2 ON t2.id = pt2.tag_id
           WHERE pt2.post_id = posts.id
         ), '[]'::json) AS tags,
         COALESCE((
           SELECT json_agg(json_build_object('id', a.id, 'file_url', a.file_url, 'filename', a.filename, 'mime', a.mime, 'size_bytes', a.size_bytes) ORDER BY a.created_at DESC)
           FROM attachments a
           WHERE a.post_id = posts.id
         ), '[]'::json) AS attachments
       FROM posts
       INNER JOIN users ON posts.user_id = users.id
       INNER JOIN post_tags pt ON pt.post_id = posts.id
       INNER JOIN tags t ON t.id = pt.tag_id
       WHERE lower(t.name) = lower($1)
       ORDER BY posts.created_at DESC
       LIMIT $2 OFFSET $3`,
      [tag, limit, offset]
    );

    const total = await pool.query(
      `SELECT COUNT(*) FROM posts p
       JOIN post_tags pt ON pt.post_id = p.id
       JOIN tags t ON t.id = pt.tag_id
       WHERE lower(t.name) = lower($1)`,
      [tag]
    );

    res.status(200).json({
      posts: result.rows,
      totalPages: Math.ceil(total.rows[0].count / limit),
      currentPage: page,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

const getTrendingUsers = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const limit = parseInt(req.query.limit) || 5;
    const result = await pool.query(
      `SELECT u.id, u.name, u.profile_image, us.like_count
       FROM user_stats us
       JOIN users u ON u.id = us.user_id
       JOIN posts p ON p.user_id = u.id
       WHERE p.created_at >= now() - interval '${days} days'
       GROUP BY u.id, u.name, u.profile_image, us.like_count
       ORDER BY us.like_count DESC
       LIMIT $1`,
      [limit]
    );
    res.status(200).json({ users: result.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

const fullTextSearch = async (req, res) => {
  try {
    const { q } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({ message: "Query too short" });
    }

    const query = q.trim();

    const result = await pool.query(
      `SELECT
         posts.id, posts.title, posts.content, posts.subject, posts.image_url,
         posts.created_at, posts.user_id,
         users.name AS author, users.profile_image AS author_avatar,
         (SELECT COUNT(*) FROM likes WHERE likes.post_id = posts.id)::int AS like_count,
         (SELECT COUNT(*) FROM comments WHERE comments.post_id = posts.id)::int AS comment_count,
         COALESCE((
           SELECT json_agg(json_build_object('id', t2.id, 'name', t2.name) ORDER BY t2.name)
           FROM post_tags pt2
           INNER JOIN tags t2 ON t2.id = pt2.tag_id
           WHERE pt2.post_id = posts.id
         ), '[]'::json) AS tags,
         COALESCE((
           SELECT json_agg(json_build_object('id', a.id, 'file_url', a.file_url, 'filename', a.filename, 'mime', a.mime, 'size_bytes', a.size_bytes) ORDER BY a.created_at DESC)
           FROM attachments a
           WHERE a.post_id = posts.id
         ), '[]'::json) AS attachments
       FROM posts
       INNER JOIN users ON posts.user_id = users.id
       WHERE posts.search_tsv @@ websearch_to_tsquery('english', $1)
       ORDER BY ts_rank_cd(posts.search_tsv, websearch_to_tsquery('english', $1)) DESC, posts.created_at DESC
       LIMIT $2 OFFSET $3`,
      [query, limit, offset]
    );

    const total = await pool.query(
      `SELECT COUNT(*) FROM posts WHERE search_tsv @@ websearch_to_tsquery('english', $1)`,
      [query]
    );

    res.status(200).json({
      posts: result.rows,
      totalPages: Math.ceil(total.rows[0].count / limit),
      currentPage: page,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

const getRelatedPosts = async (req, res) => {
  try {
    const { postId } = req.params;
    const limit = parseInt(req.query.limit) || 3;

    const post = await pool.query(
      `SELECT subject, search_tsv FROM posts WHERE id = $1`,
      [postId]
    );

    if (post.rows.length === 0) {
      return res.status(404).json({ message: "Post not found" });
    }

    const { subject, search_tsv } = post.rows[0];

    let result;
    if (search_tsv) {
      result = await pool.query(
        `SELECT
           posts.id, posts.title, posts.content, posts.subject, posts.image_url,
           posts.created_at, posts.user_id,
           users.name AS author, users.profile_image AS author_avatar,
           (SELECT COUNT(*) FROM likes WHERE likes.post_id = posts.id)::int AS like_count,
           (SELECT COUNT(*) FROM comments WHERE comments.post_id = posts.id)::int AS comment_count,
           COALESCE((
             SELECT json_agg(json_build_object('id', t2.id, 'name', t2.name) ORDER BY t2.name)
             FROM post_tags pt2
             INNER JOIN tags t2 ON t2.id = pt2.tag_id
             WHERE pt2.post_id = posts.id
           ), '[]'::json) AS tags,
           COALESCE((
             SELECT json_agg(json_build_object('id', a.id, 'file_url', a.file_url, 'filename', a.filename, 'mime', a.mime, 'size_bytes', a.size_bytes) ORDER BY a.created_at DESC)
             FROM attachments a
             WHERE a.post_id = posts.id
           ), '[]'::json) AS attachments
         FROM posts
         INNER JOIN users ON posts.user_id = users.id
         WHERE posts.id != $1
           AND posts.search_tsv @@ websearch_to_tsquery('english', $2)
         ORDER BY ts_rank_cd(posts.search_tsv, websearch_to_tsquery('english', $2)) DESC
         LIMIT $3`,
        [postId, subject, limit]
      );
    } else {
      result = await pool.query(
        `SELECT
           posts.id, posts.title, posts.content, posts.subject, posts.image_url,
           posts.created_at, posts.user_id,
           users.name AS author, users.profile_image AS author_avatar,
           (SELECT COUNT(*) FROM likes WHERE likes.post_id = posts.id)::int AS like_count,
           (SELECT COUNT(*) FROM comments WHERE comments.post_id = posts.id)::int AS comment_count,
           COALESCE((
             SELECT json_agg(json_build_object('id', t2.id, 'name', t2.name) ORDER BY t2.name)
             FROM post_tags pt2
             INNER JOIN tags t2 ON t2.id = pt2.tag_id
             WHERE pt2.post_id = posts.id
           ), '[]'::json) AS tags,
           COALESCE((
             SELECT json_agg(json_build_object('id', a.id, 'file_url', a.file_url, 'filename', a.filename, 'mime', a.mime, 'size_bytes', a.size_bytes) ORDER BY a.created_at DESC)
             FROM attachments a
             WHERE a.post_id = posts.id
           ), '[]'::json) AS attachments
         FROM posts
         INNER JOIN users ON posts.user_id = users.id
         WHERE posts.id != $1
           AND posts.subject = $2
         ORDER BY posts.created_at DESC
         LIMIT $3`,
        [postId, subject, limit]
      );
    }

    res.status(200).json({ posts: result.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = {
  uploadAttachment,
  getAttachments,
  deleteAttachment,
  addTagsToPost,
  removeTagFromPost,
  getPostTags,
  getTrendingTags,
  getTrendingUsers,
  fullTextSearch,
  getRelatedPosts,
  searchByTag,
};