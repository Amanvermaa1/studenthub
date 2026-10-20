-- M7: Fulltext Search + Stats
-- idempotent, safe to re-run

-- =====================================================
-- FULL-TEXT SEARCH
-- =====================================================
ALTER TABLE posts ADD COLUMN IF NOT EXISTS search_tsv tsvector
  GENERATED ALWAYS AS (to_tsvector('english', coalesce(title,'') || ' ' || coalesce(content,''))) STORED;
CREATE INDEX IF NOT EXISTS idx_posts_search ON posts USING GIN (search_tsv);

-- =====================================================
-- USER STATS VIEW (for reputation badges)
-- =====================================================
CREATE OR REPLACE VIEW user_stats AS
SELECT u.id AS user_id,
       (SELECT count(1) FROM posts p WHERE p.user_id = u.id) AS post_count,
       (SELECT count(1) FROM likes l JOIN posts p ON l.post_id = p.id WHERE p.user_id = u.id) AS like_count
FROM users u;