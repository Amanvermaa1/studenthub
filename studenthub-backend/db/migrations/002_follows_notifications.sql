-- M4: Follows + Notifications
-- idempotent, safe to re-run

-- =====================================================
-- FOLLOWS
-- =====================================================
CREATE TABLE IF NOT EXISTS follows (
  follower_id  INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  following_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (follower_id, following_id),
  CHECK (follower_id <> following_id)
);

CREATE INDEX IF NOT EXISTS idx_follows_following ON follows (following_id);

-- =====================================================
-- NOTIFICATIONS
-- =====================================================
CREATE TABLE IF NOT EXISTS notifications (
  id         BIGSERIAL PRIMARY KEY,
  user_id    INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,  -- recipient
  actor_id   INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,  -- who acted
  type       TEXT NOT NULL CHECK (type IN ('like','comment','follow','reply')),
  post_id    INT REFERENCES posts(id) ON DELETE CASCADE,
  comment_id INT REFERENCES comments(id) ON DELETE CASCADE,
  read_at    TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user   ON notifications (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications (user_id) WHERE read_at IS NULL;