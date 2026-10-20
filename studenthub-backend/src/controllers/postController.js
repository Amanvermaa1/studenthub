const pool = require("../config/db");
const cloudinary = require("../config/cloudinary");

// Shared SELECT fragments: like/comment totals plus tags & attachments as JSON
const LIKE_COUNT_SQL = `(SELECT COUNT(*) FROM likes WHERE likes.post_id = posts.id)::int AS like_count`;
const COMMENT_COUNT_SQL = `(SELECT COUNT(*) FROM comments WHERE comments.post_id = posts.id)::int AS comment_count`;
const TAGS_SQL = `COALESCE((
  SELECT json_agg(json_build_object('id', t.id, 'name', t.name) ORDER BY t.name)
  FROM post_tags pt
  INNER JOIN tags t ON t.id = pt.tag_id
  WHERE pt.post_id = posts.id
), '[]'::json) AS tags`;
const ATTACHMENTS_SQL = `COALESCE((
  SELECT json_agg(json_build_object('id', a.id, 'file_url', a.file_url, 'filename', a.filename, 'mime', a.mime, 'size_bytes', a.size_bytes) ORDER BY a.created_at DESC)
  FROM attachments a
  WHERE a.post_id = posts.id
), '[]'::json) AS attachments`;

const getPublicIdFromUrl = (imageUrl) => {
  if (!imageUrl) return null;

  const parts = imageUrl.split("/upload/");

  if (parts.length < 2) return null;

  const publicIdWithExtension = parts[1].split("/").slice(1).join("/");

  return publicIdWithExtension.replace(/\.[^/.]+$/, "");
};

// CREATE POST
const createPost = async (req, res) => {
  try {
    const { title, content, subject } = req.body;

    const imageUrl = req.file ? req.file.path : null;

    if (!title || !content || !subject) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const result = await pool.query(
      `
      INSERT INTO posts
 (title, content, subject, image_url, user_id)
 VALUES ($1,$2,$3,$4,$5)
 RETURNING *;
      `,
      [title, content, subject, imageUrl, req.user.id]
    );

    const post = result.rows[0];

    // Persist #hashtags found in the content as post tags
    const matches = String(content).match(/#[\p{L}\p{N}_]+/gu) || [];
    const hashtags = [
      ...new Set(matches.map((match) => match.slice(1).toLowerCase())),
    ].filter(Boolean);

    for (const name of hashtags.slice(0, 10)) {
      let tagId;
      const existing = await pool.query(
        `SELECT id FROM tags WHERE lower(name) = $1`,
        [name]
      );
      if (existing.rows.length > 0) {
        tagId = existing.rows[0].id;
      } else {
        const created = await pool.query(
          `INSERT INTO tags (name) VALUES ($1) RETURNING id`,
          [name]
        );
        tagId = created.rows[0].id;
      }
      await pool.query(
        `INSERT INTO post_tags (post_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
        [post.id, tagId]
      );
    }

    res.status(201).json({
      message: "Post created successfully",
      post,
    });

  } catch (error) {
    console.error("ERROR MESSAGE:", error.message);
 res.status(500).json({
  message: error.message,
});
  }
};

// GET ALL POSTS
const getAllPosts = async (req, res) => {
  try {

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const offset = (page - 1) * limit;

    const search = req.query.search || "";
    const subject = req.query.subject || "";
    const sort = req.query.sort || "latest";
    const feedTab = req.query.feedTab || "for-you";

    let orderBy = "posts.created_at DESC";
    if (sort === "liked") {
      orderBy = "like_count DESC, posts.created_at DESC";
    } else if (sort === "discussed") {
      orderBy = "comment_count DESC, posts.created_at DESC";
    }

    // Build WHERE clause
    let whereClause = `
   WHERE
   (
       posts.title ILIKE $1
       OR posts.subject ILIKE $1
       OR posts.content ILIKE $1
       OR users.name ILIKE $1
   )
   AND
   (
       $2 = ''
       OR posts.subject = $2
   )`;

    const queryParams = [`%${search}%`, subject, limit, offset];
    let paramIndex = 5;

    if (feedTab === "following" && req.user) {
      whereClause += ` AND posts.user_id IN (SELECT following_id FROM follows WHERE follower_id = $${paramIndex})`;
      queryParams.push(req.user.id);
      paramIndex++;
    }

   const result = await pool.query(
   `
   SELECT
 posts.id,
 posts.title,
 posts.content,
 posts.subject,
 posts.image_url,
 posts.created_at,
 posts.user_id,
 users.name AS author,
 users.profile_image AS author_avatar,
 ` + LIKE_COUNT_SQL + `,
 ` + COMMENT_COUNT_SQL + `,
 ` + TAGS_SQL + `,
 ` + ATTACHMENTS_SQL + `
   FROM posts
   INNER JOIN users
   ON posts.user_id = users.id
   ` + whereClause + `
   ORDER BY ` + orderBy + `
   LIMIT $3
   OFFSET $4;
   `,
   queryParams
);


    // Count total posts
  let countWhereClause = `
  WHERE
  (
      posts.title ILIKE $1
      OR posts.subject ILIKE $1
      OR posts.content ILIKE $1
      OR users.name ILIKE $1
  )
  AND
  (
      $2 = ''
      OR posts.subject = $2
  )`;

  const countParams = [`%${search}%`, subject];

  if (feedTab === "following" && req.user) {
    countWhereClause += ` AND posts.user_id IN (SELECT following_id FROM follows WHERE follower_id = $3)`;
    countParams.push(req.user.id);
  }

  const totalPosts = await pool.query(
    `
  SELECT COUNT(*)
  FROM posts
  INNER JOIN users
  ON posts.user_id = users.id
  ` + countWhereClause + `
  `,
  countParams
);

    res.status(200).json({
      currentPage: page,
      totalPosts: Number(totalPosts.rows[0].count),
      totalPages: Math.ceil(totalPosts.rows[0].count / limit),
      posts: result.rows,
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

const getMyPosts = async (req, res) => {
  try {

    const result = await pool.query(
      `
      SELECT
        posts.id,
        posts.user_id,
        posts.title,
        posts.content,
        posts.subject,
        posts.image_url,
        posts.created_at,
        users.name AS author,
        users.profile_image AS author_avatar,
        ` + LIKE_COUNT_SQL + `,
        ` + COMMENT_COUNT_SQL + `,
        ` + TAGS_SQL + `,
        ` + ATTACHMENTS_SQL + `
      FROM posts
      INNER JOIN users
      ON posts.user_id = users.id
      WHERE posts.user_id = $1
      ORDER BY posts.created_at DESC;
      `,
      [req.user.id]
    );

    res.status(200).json(result.rows);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

const getPostById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      SELECT
        posts.id,
        posts.title,
        posts.content,
        posts.subject,
        posts.image_url,
        posts.created_at,
        posts.user_id,
        users.name AS author,
        users.profile_image AS author_avatar,
        ` + LIKE_COUNT_SQL + `,
        ` + COMMENT_COUNT_SQL + `,
        ` + TAGS_SQL + `,
        ` + ATTACHMENTS_SQL + `
      FROM posts
      INNER JOIN users
      ON posts.user_id = users.id
      WHERE posts.id = $1;
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    res.status(200).json(result.rows[0]);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

const updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, subject } = req.body;

    const existingPost = await pool.query(
      "SELECT * FROM posts WHERE id = $1",
      [id]
    );

    if (existingPost.rows.length === 0) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    if (existingPost.rows[0].user_id !== req.user.id) {
      return res.status(403).json({
        message: "Not authorized to update this post",
      });
    }

    const result = await pool.query(
      `UPDATE posts SET title = $1, content = $2, subject = $3 WHERE id = $4 RETURNING *`,
      [title, content, subject, id]
    );

    res.status(200).json({
      message: "Post updated successfully",
      post: result.rows[0],
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

const deletePost = async (req, res) => {
  try {
    const { id } = req.params;

    const existingPost = await pool.query(
      "SELECT * FROM posts WHERE id = $1",
      [id]
    );

    if (existingPost.rows.length === 0) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    if (existingPost.rows[0].user_id !== req.user.id) {
      return res.status(403).json({
        message: "Not authorized to delete this post",
      });
    }

    if (existingPost.rows[0].image_url) {
      const publicId = getPublicIdFromUrl(existingPost.rows[0].image_url);
      if (publicId) {
        await cloudinary.uploader.destroy(publicId);
      }
    }

    await pool.query(
      "DELETE FROM posts WHERE id = $1",
      [id]
    );

    res.status(200).json({
      message: "Post deleted successfully",
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

const getEngagement = async (req, res) => {
  try {
    const { ids } = req.query;
    if (!ids) {
      return res.status(400).json({ engagement: {} });
    }
    const idArray = ids.split(",").map(Number).filter(Boolean);
    if (idArray.length === 0) {
      return res.status(200).json({ engagement: {} });
    }
    if (idArray.length > 50) {
      return res.status(400).json({ message: "Too many IDs (max 50)" });
    }
    const userId = req.user.id;

    const placeholders = idArray.map((_, i) => `$${i + 1}`).join(",");
    const likeParams = [userId, ...idArray];
    const likeQuery = `
      SELECT post_id, COUNT(*)::int AS totalLikes
      FROM likes
      WHERE post_id IN (${placeholders})
      GROUP BY post_id
    `;
    const likeResult = await pool.query(likeQuery, likeParams.slice(1));

    const likedParams = [userId, ...idArray];
    const likedPlaceholders = idArray.map((_, i) => `$${i + 2}`).join(",");
    const likedQuery = `
      SELECT post_id
      FROM likes
      WHERE user_id = $1 AND post_id IN (${likedPlaceholders})
    `;
    const likedResult = await pool.query(likedQuery, likedParams);

    const bookmarkParams = [userId, ...idArray];
    const bookmarkPlaceholders = idArray.map((_, i) => `$${i + 2}`).join(",");
    const bookmarkQuery = `
      SELECT post_id
      FROM bookmarks
      WHERE user_id = $1 AND post_id IN (${bookmarkPlaceholders})
    `;
    const bookmarkResult = await pool.query(bookmarkQuery, bookmarkParams);

    const likeMap = Object.fromEntries(likeResult.rows.map(r => [Number(r.post_id), Number(r.totallikes)]));
    const likedSet = new Set(likedResult.rows.map(r => Number(r.post_id)));
    const bookmarkSet = new Set(bookmarkResult.rows.map(r => Number(r.post_id)));

    const engagement = {};
    for (const id of idArray) {
      engagement[id] = {
        liked: likedSet.has(id),
        likes: likeMap[id] || 0,
        bookmarked: bookmarkSet.has(id),
      };
    }

    res.status(200).json({ engagement });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = {
  createPost,
  getAllPosts,
  getMyPosts,
  getPostById,
  updatePost,
  deletePost,
  getEngagement,
};