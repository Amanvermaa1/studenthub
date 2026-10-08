const pool = require("../config/db");

const toggleLike = async (req, res) => {
  try {

    const { postId } = req.params;

    // Check if post exists
    const post = await pool.query(
      "SELECT * FROM posts WHERE id = $1",
      [postId]
    );

    if (post.rows.length === 0) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    // Check if already liked
    const existingLike = await pool.query(
      `
      SELECT *
      FROM likes
      WHERE user_id = $1
      AND post_id = $2
      `,
      [req.user.id, postId]
    );

    // Unlike
    if (existingLike.rows.length > 0) {

      await pool.query(
        `
        DELETE FROM likes
        WHERE user_id = $1
        AND post_id = $2
        `,
        [req.user.id, postId]
      );

      return res.status(200).json({
        message: "Post unliked"
      });

    }

    // Like
    await pool.query(
      `
      INSERT INTO likes(user_id, post_id)
      VALUES($1, $2)
      `,
      [req.user.id, postId]
    );

    res.status(201).json({
      message: "Post liked"
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Server Error"
    });

  }
};

const getLikesCount = async (req, res) => {
  try {

    const { postId } = req.params;

    const result = await pool.query(
      `
      SELECT COUNT(*) AS totalLikes
      FROM likes
      WHERE post_id = $1
      `,
      [postId]
    );

    res.status(200).json({
      totalLikes: Number(result.rows[0].totallikes)
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Server Error"
    });

  }
};

const getLikeStatus = async (req, res) => {
  try {

    const { postId } = req.params;

    const countResult = await pool.query(
      `
      SELECT COUNT(*) AS totalLikes
      FROM likes
      WHERE post_id = $1
      `,
      [postId]
    );

    const likeResult = await pool.query(
      `
      SELECT 1
      FROM likes
      WHERE user_id = $1
      AND post_id = $2
      `,
      [req.user.id, postId]
    );

    res.status(200).json({
      totalLikes: Number(countResult.rows[0].totallikes),
      liked: likeResult.rows.length > 0,
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Server Error"
    });

  }
};

module.exports = {
  toggleLike,
  getLikesCount,
  getLikeStatus,
};