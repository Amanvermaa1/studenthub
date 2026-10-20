-- M5: Comment Replies + Comment Likes
-- idempotent, safe to re-run

-- =====================================================
-- COMMENT REPLIES (1 level max)
-- =====================================================
ALTER TABLE comments ADD COLUMN IF NOT EXISTS parent_id INT REFERENCES comments(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_comments_parent ON comments (parent_id);

-- =====================================================
-- COMMENT LIKES
-- =====================================================
CREATE TABLE IF NOT EXISTS comment_likes (
  user_id    INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  comment_id INT NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, comment_id)
);
CREATE INDEX IF NOT EXISTS idx_comment_likes_comment ON comment_likes (comment_id);