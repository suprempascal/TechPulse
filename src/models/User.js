'use strict';

const crypto = require('node:crypto');
const { all, get, run } = require('./db');

const SCRYPT_PARAMS = { N: 16384, r: 8, p: 1 };
const KEYLEN = 64;

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, KEYLEN, SCRYPT_PARAMS).toString('hex');
  return `scrypt$${SCRYPT_PARAMS.N}$${salt}$${hash}`;
}

function verifyPassword(password, stored) {
  if (typeof stored !== 'string') return false;
  const parts = stored.split('$');
  if (parts.length !== 4 || parts[0] !== 'scrypt') return false;
  const [, n, salt, hash] = parts;
  let derived;
  try {
    derived = crypto.scryptSync(password, salt, KEYLEN, { ...SCRYPT_PARAMS, N: Number(n) });
  } catch {
    return false;
  }
  const expected = Buffer.from(hash, 'hex');
  return expected.length === derived.length && crypto.timingSafeEqual(derived, expected);
}

function create({ username, email, password, isAdmin = false }) {
  const res = run(
    'INSERT INTO users (username, email, password_hash, is_admin) VALUES (?, ?, ?, ?)',
    [username, email, hashPassword(password), isAdmin ? 1 : 0]
  );
  return findById(res.lastInsertRowid);
}

function findById(id) {
  return get('SELECT id, username, email, is_admin, created_at FROM users WHERE id = ?', [id]);
}

function findByUsername(username) {
  return get('SELECT * FROM users WHERE username = ?', [username]);
}

function findByEmail(email) {
  return get('SELECT id FROM users WHERE email = ?', [email]);
}

function verifyCredentials(username, password) {
  const user = findByUsername(username);
  if (!user) return null;
  return verifyPassword(password, user.password_hash) ? sanitize(user) : null;
}

function sanitize(user) {
  const { password_hash, ...rest } = user;
  return rest;
}

function count() {
  return get('SELECT COUNT(*) AS n FROM users').n;
}

function stats(userId) {
  return get(
    `SELECT
       (SELECT COUNT(*) FROM articles  WHERE author_id = ?) AS articles,
       (SELECT COUNT(*) FROM comments  WHERE user_id    = ?) AS comments,
       (SELECT COUNT(*) FROM likes     WHERE user_id    = ?) AS likes`,
    [userId, userId, userId]
  );
}

function likedArticles(userId) {
  return all(
    `SELECT a.id, a.title, a.slug, a.category, a.created_at
       FROM likes l JOIN articles a ON a.id = l.article_id
      WHERE l.user_id = ?
      ORDER BY l.created_at DESC`,
    [userId]
  );
}

module.exports = {
  create,
  findById,
  findByUsername,
  findByEmail,
  verifyCredentials,
  verifyPassword,
  hashPassword,
  sanitize,
  count,
  stats,
  likedArticles,
};
