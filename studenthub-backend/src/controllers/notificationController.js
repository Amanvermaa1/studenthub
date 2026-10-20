const pool = require("../config/db");

const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const unreadOnly = req.query.unread === "true";

    let whereClause = "WHERE n.user_id = $1";
    const params = [userId];

    if (unreadOnly) {
      whereClause += " AND n.read_at IS NULL";
    }

    const result = await pool.query(
      `SELECT
         n.id,
         n.type,
         n.post_id,
         n.comment_id,
         n.read_at,
         n.created_at,
         u.id AS actor_id,
         u.name AS actor_name,
         u.profile_image AS actor_avatar,
         p.title AS post_title
       FROM notifications n
       JOIN users u ON u.id = n.actor_id
       LEFT JOIN posts p ON p.id = n.post_id
       ${whereClause}
       ORDER BY n.created_at DESC
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, limit, offset]
    );

    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `SELECT COUNT(*)::int AS count FROM notifications WHERE user_id = $1 AND read_at IS NULL`,
      [userId]
    );

    res.status(200).json({ count: result.rows[0].count });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

const markAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const { ids } = req.body; // array of notification ids, or "all"

    if (ids === "all") {
      await pool.query(
        `UPDATE notifications SET read_at = now() WHERE user_id = $1 AND read_at IS NULL`,
        [userId]
      );
    } else if (Array.isArray(ids) && ids.length > 0) {
      const placeholders = ids.map((_, i) => `$${i + 2}`).join(",");
      await pool.query(
        `UPDATE notifications SET read_at = now() WHERE user_id = $1 AND id IN (${placeholders})`,
        [userId, ...ids]
      );
    }

    res.status(200).json({ message: "Notifications marked as read" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = {
  getNotifications,
  getUnreadCount,
  markAsRead,
};