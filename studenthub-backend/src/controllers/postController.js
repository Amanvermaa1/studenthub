const pool = require("../config/db");
const cloudinary = require("../config/cloudinary");

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
     console.log(req.body);
    console.log(req.file);
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

    res.status(201).json({
      message: "Post created successfully",
      post: result.rows[0],
    });

  } catch (error) {
    console.error("ERROR MESSAGE:", error.message);
console.error("FULL ERROR:", error);

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
(SELECT COUNT(*) FROM likes WHERE likes.post_id = posts.id)::int AS like_count,
(SELECT COUNT(*) FROM comments WHERE comments.post_id = posts.id)::int AS comment_count
  FROM posts
  INNER JOIN users
  ON posts.user_id = users.id
  WHERE
  (
      posts.title ILIKE $1
      OR posts.subject ILIKE $1
  )
  AND
  (
      $2 = ''
      OR posts.subject = $2
  )
  ORDER BY posts.created_at DESC
  LIMIT $3
  OFFSET $4;
  `,
  [`%${search}%`, subject, limit, offset]
);



    // Count total posts
  const totalPosts = await pool.query(
  `
  SELECT COUNT(*)
  FROM posts
  WHERE
  (
      title ILIKE $1
      OR subject ILIKE $1
  )
  AND
  (
      $2 = ''
      OR subject = $2
  )
  `,
  [`%${search}%`, subject]
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
        (SELECT COUNT(*) FROM likes WHERE likes.post_id = posts.id)::int AS like_count,
        (SELECT COUNT(*) FROM comments WHERE comments.post_id = posts.id)::int AS comment_count
      FROM posts
      INNER JOIN users ON posts.user_id = users.id
      WHERE posts.user_id = $1
      ORDER BY posts.created_at DESC;
      `,
      [req.user.id]
    );

    res.status(200).json(result.rows);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Server Error"
    });

  }
};
// GET SINGLE POST
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
        posts.created_at,
        posts.image_url,
        posts.user_id,
        users.name AS author,
        users.profile_image AS author_avatar,
        (SELECT COUNT(*) FROM likes WHERE likes.post_id = posts.id)::int AS like_count,
        (SELECT COUNT(*) FROM comments WHERE comments.post_id = posts.id)::int AS comment_count
      FROM posts
      INNER JOIN users
      ON posts.user_id = users.id
      WHERE posts.id = $1
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

    // Check if post exists
    const post = await pool.query(
      `
      SELECT *
      FROM posts
      WHERE id = $1
      `,
      [id]
    );

    if (post.rows.length === 0) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    const existingPost = post.rows[0];

    // Authorization
    if (existingPost.user_id !== req.user.id) {
      return res.status(403).json({
        message: "You are not authorized to update this post",
      });
    }

    // Keep old image unless a new one is uploaded
    let imageUrl = existingPost.image_url;

   if (req.file) {

  // Delete old image from Cloudinary
  if (existingPost.image_url) {
    const oldPublicId = getPublicIdFromUrl(
      existingPost.image_url
    );

    if (oldPublicId) {
      await cloudinary.uploader.destroy(oldPublicId);
    }
  }

  // Save new image URL
  imageUrl = req.file.path;
}

    // Update post
    const updatedPost = await pool.query(
      `
      UPDATE posts
      SET
        title = $1,
        content = $2,
        subject = $3,
        image_url = $4
      WHERE id = $5
      RETURNING *;
      `,
      [title, content, subject, imageUrl, id]
    );

    res.status(200).json({
      message: "Post Updated Successfully",
      post: updatedPost.rows[0],
    });

  } catch (error) {
    console.error("ERROR MESSAGE:", error.message);
    console.error("FULL ERROR:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};
const deletePost = async (req, res) => {
  try {
    // 1. Get post ID from URL
    const { id } = req.params;

    // 2. Check if the post exists
    const post = await pool.query(
      `
      SELECT *
      FROM posts
      WHERE id = $1
      `,
      [id]
    );

    // 3. If post doesn't exist
    if (post.rows.length === 0) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    // 4. Get the existing post
    const existingPost = post.rows[0];

    // 5. Authorization: Only owner can delete
    if (existingPost.user_id !== req.user.id) {
      return res.status(403).json({
        message: "You are not authorized to delete this post",
      });
    }
if (existingPost.image_url) {

  const publicId = getPublicIdFromUrl(
    existingPost.image_url
  );

  if (publicId) {
    await cloudinary.uploader.destroy(publicId);
  }
}
    // 6. Delete the post
    await pool.query(
      `
      DELETE FROM posts
      WHERE id = $1
      `,
      [id]
    );

    // 7. Success response
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

module.exports = {
  createPost,
  getAllPosts,
  getMyPosts,
  getPostById,
  updatePost,
  deletePost,
};
