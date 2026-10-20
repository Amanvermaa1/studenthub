const pool = require("../config/db");

const toggleBookmark = async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await pool.query(
      "SELECT id FROM posts WHERE id = $1",
      [postId]
    );

    if (post.rows.length === 0) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    const existingBookmark = await pool.query(
      `
      SELECT 1
      FROM bookmarks
      WHERE user_id = $1
      AND post_id = $2
      `,
      [req.user.id, postId]
    );

    let bookmarked;

    if (existingBookmark.rows.length > 0) {
      await pool.query(
        `
        DELETE FROM bookmarks
        WHERE user_id = $1
        AND post_id = $2
        `,
        [req.user.id, postId]
      );
      bookmarked = false;
    } else {
      await pool.query(
        `
        INSERT INTO bookmarks(user_id, post_id)
        VALUES($1, $2)
        `,
        [req.user.id, postId]
      );
      bookmarked = true;
    }

    res.status(200).json({
      bookmarked,
      message: bookmarked ? "Post bookmarked" : "Bookmark removed",
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

const getBookmarks = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const result = await pool.query(
      `
      SELECT
        posts.id,
        posts.title,
        posts.content,
        posts.subject,
        posts.image_url,
        posts.user_id,
        posts.like_count,
        posts.comment_count,
        posts.created_at,
        users.name AS author,
        users.profile_image AS author_avatar
      FROM bookmarks
      INNER JOIN posts
      ON bookmarks.post_id = posts.id
      INNER JOIN users
      ON posts.user_id = users.id
      WHERE bookmarks.user_id = $1
      ORDER BY bookmarks.created_at DESC
      LIMIT $2 OFFSET $3;
      `,
      [req.user.id, limit, offset]
    );

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM bookmarks WHERE user_id = $1`,
      [req.user.id]
    );

    res.status(200).json({
      posts: result.rows,
      totalPages: Math.ceil(countResult.rows[0].count / limit),
      currentPage: page,
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

const getBookmarkStatus = async (req, res) => {
  try {
    const { postId } = req.params;

    const result = await pool.query(
      `
      SELECT 1
      FROM bookmarks
      WHERE user_id = $1
      AND post_id = $2
      `,
      [req.user.id, postId]
    );

    res.status(200).json({
      bookmarked: result.rows.length > 0,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

module.exports = {
    toggleBookmark,
    getBookmarks,
    getBookmarkStatus,
};