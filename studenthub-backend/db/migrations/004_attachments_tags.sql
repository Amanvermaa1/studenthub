-- M6: Attachments + Tags + Hashtags
-- idempotent, safe to re-run

-- =====================================================
-- ATTACHMENTS (PDF/docs)
-- =====================================================
CREATE TABLE IF NOT EXISTS attachments (
  id SERIAL PRIMARY KEY,
  post_id    INT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  file_url   TEXT NOT NULL,
  filename   TEXT NOT NULL,
  mime       TEXT NOT NULL,
  size_bytes INT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_attachments_post ON attachments (post_id);

-- =====================================================
-- TAGS / HASHTAGS
-- =====================================================
CREATE TABLE IF NOT EXISTS tags (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_tags_name ON tags (lower(name));

CREATE TABLE IF NOT EXISTS post_tags (
  post_id INT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  tag_id  INT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);
CREATE INDEX IF NOT EXISTS idx_post_tags_tag ON post_tags (tag_id);