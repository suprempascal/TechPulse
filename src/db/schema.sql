PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  username      TEXT    NOT NULL UNIQUE COLLATE NOCASE,
  email         TEXT    NOT NULL UNIQUE COLLATE NOCASE,
  password_hash TEXT    NOT NULL,
  is_admin      INTEGER NOT NULL DEFAULT 0,
  created_at    TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS sessions (
  id         TEXT    PRIMARY KEY,
  user_id    INTEGER NOT NULL,
  csrf_token TEXT    NOT NULL,
  expires_at INTEGER NOT NULL,
  created_at TEXT    NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS articles (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  title      TEXT    NOT NULL,
  slug       TEXT    NOT NULL UNIQUE,
  excerpt    TEXT    NOT NULL DEFAULT '',
  content    TEXT    NOT NULL,
  image_url  TEXT    NOT NULL DEFAULT '',
  category   TEXT    NOT NULL DEFAULT 'Tech',
  author_id  INTEGER NOT NULL,
  created_at TEXT    NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS comments (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  article_id INTEGER NOT NULL,
  user_id    INTEGER NOT NULL,
  content    TEXT    NOT NULL,
  created_at TEXT    NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS likes (
  user_id    INTEGER NOT NULL,
  article_id INTEGER NOT NULL,
  created_at TEXT    NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (user_id, article_id),
  FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE CASCADE,
  FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_articles_created  ON articles(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_author   ON articles(author_id);
CREATE INDEX IF NOT EXISTS idx_comments_article  ON comments(article_id);
CREATE INDEX IF NOT EXISTS idx_comments_user     ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_likes_article     ON likes(article_id);
