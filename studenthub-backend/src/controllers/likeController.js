const pool = require("../config/db");

const toggleLike = async (req, res) => {
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

    const existingLike = await pool.query(
      `
      SELECT 1
      FROM likes
      WHERE user_id = $1
      AND post_id = $2
      `,
      [req.user.id, postId]
    );

    let liked;

    if (existingLike.rows.length > 0) {
      await pool.query(
        `
        DELETE FROM likes
        WHERE user_id = $1
        AND post_id = $2
        `,
        [req.user.id, postId]
      );
      liked = false;
    } else {
      await pool.query(
        `
        INSERT INTO likes(user_id, post_id)
        VALUES($1, $2)
        `,
        [req.user.id, postId]
      );
      liked = true;

      // Create notification for post owner (if not self-like)
      const postOwner = await pool.query(`SELECT user_id FROM posts WHERE id = $1`, [postId]);
      if (postOwner.rows.length > 0 && postOwner.rows[0].user_id !== req.user.id) {
        await pool.query(
          `INSERT INTO notifications (user_id, actor_id, type, post_id) VALUES ($1, $2, 'like', $3)`,
          [postOwner.rows[0].user_id, req.user.id, postId]
        );
      }
    }

    const countResult = await pool.query(
      `
      SELECT COUNT(1) AS total
      FROM likes
      WHERE post_id = $1
      `,
      [postId]
    );

    res.status(200).json({
      liked,
      totalLikes: Number(countResult.rows[0].total),
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