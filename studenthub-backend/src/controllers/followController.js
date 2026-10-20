const pool = require("../config/db");

const toggleFollow = async (req, res) => {
  try {
    const { id: followingId } = req.params;
    const followerId = req.user.id;

    if (parseInt(followingId) === followerId) {
      return res.status(400).json({ message: "You cannot follow yourself" });
    }

    const existing = await pool.query(
      `SELECT 1 FROM follows WHERE follower_id = $1 AND following_id = $2`,
      [followerId, followingId]
    );

    let following;

    if (existing.rows.length > 0) {
      await pool.query(
        `DELETE FROM follows WHERE follower_id = $1 AND following_id = $2`,
        [followerId, followingId]
      );
      following = false;
    } else {
      await pool.query(
        `INSERT INTO follows (follower_id, following_id) VALUES ($1, $2)`,
        [followerId, followingId]
      );
      following = true;

      // Create notification for the followed user
      await pool.query(
        `INSERT INTO notifications (user_id, actor_id, type, post_id) VALUES ($1, $2, 'follow', NULL)`,
        [followingId, followerId]
      );
    }

    // Get updated counts
    const [followersResult, followingResult] = await Promise.all([
      pool.query(`SELECT COUNT(*)::int AS count FROM follows WHERE following_id = $1`, [followingId]),
      pool.query(`SELECT COUNT(*)::int AS count FROM follows WHERE follower_id = $1`, [followingId]),
    ]);

    res.status(200).json({
      following,
      followersCount: followersResult.rows[0].count,
      followingCount: followingResult.rows[0].count,
      message: following ? "Now following" : "Unfollowed",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

const getFollowStatus = async (req, res) => {
  try {
    const { id: followingId } = req.params;
    const followerId = req.user.id;

    const result = await pool.query(
      `SELECT 1 FROM follows WHERE follower_id = $1 AND following_id = $2`,
      [followerId, followingId]
    );

    const [followersResult, followingResult] = await Promise.all([
      pool.query(`SELECT COUNT(*)::int AS count FROM follows WHERE following_id = $1`, [followingId]),
      pool.query(`SELECT COUNT(*)::int AS count FROM follows WHERE follower_id = $1`, [followingId]),
    ]);

    res.status(200).json({
      following: result.rows.length > 0,
      followersCount: followersResult.rows[0].count,
      followingCount: followingResult.rows[0].count,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

const getFollowers = async (req, res) => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const result = await pool.query(
      `SELECT u.id, u.name, u.profile_image, u.bio,
              (SELECT COUNT(*) FROM follows WHERE following_id = u.id)::int AS followers_count,
              (SELECT COUNT(*) FROM follows WHERE follower_id = u.id)::int AS following_count
       FROM follows f
       JOIN users u ON u.id = f.follower_id
       WHERE f.following_id = $1
       ORDER BY f.created_at DESC
       LIMIT $2 OFFSET $3`,
      [id, limit, offset]
    );

    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

const getFollowing = async (req, res) => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const result = await pool.query(
      `SELECT u.id, u.name, u.profile_image, u.bio,
              (SELECT COUNT(*) FROM follows WHERE following_id = u.id)::int AS followers_count,
              (SELECT COUNT(*) FROM follows WHERE follower_id = u.id)::int AS following_count
       FROM follows f
       JOIN users u ON u.id = f.following_id
       WHERE f.follower_id = $1
       ORDER BY f.created_at DESC
       LIMIT $2 OFFSET $3`,
      [id, limit, offset]
    );

    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = {
  toggleFollow,
  getFollowStatus,
  getFollowers,
  getFollowing,
};