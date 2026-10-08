'use strict';

const crypto = require('node:crypto');
const { get, run, all } = require('./db');
const config = require('../config');

const sign = (value) =>
  crypto.createHmac('sha256', config.session.secret).update(value).digest('base64url');

function create(userId) {
  const id = crypto.randomBytes(32).toString('base64url');
  const csrf = crypto.randomBytes(24).toString('base64url');
  const expiresAt = Date.now() + config.session.ttlMs;
  run('INSERT INTO sessions (id, user_id, csrf_token, expires_at) VALUES (?, ?, ?, ?)', [
    id,
    userId,
    csrf,
    expiresAt,
  ]);
  return { id: `${id}.${sign(id)}`, csrfToken: csrf };
}

function parseCookie(raw) {
  if (typeof raw !== 'string' || !raw.includes('.')) return null;
  const idx = raw.lastIndexOf('.');
  const id = raw.slice(0, idx);
  const mac = raw.slice(idx + 1);
  const expected = sign(id);
  if (mac.length !== expected.length) return null;
  if (!crypto.timingSafeEqual(Buffer.from(mac), Buffer.from(expected))) return null;
  return id;
}

function getValid(rawCookie) {
  const id = parseCookie(rawCookie);
  if (!id) return null;
  const row = get(
    `SELECT s.id, s.csrf_token, s.expires_at, u.id AS user_id, u.username, u.email,
            u.is_admin, u.created_at
       FROM sessions s
       JOIN users u ON u.id = s.user_id
      WHERE s.id = ?`,
    [id]
  );
  if (!row) return null;
  if (row.expires_at < Date.now()) {
    destroy(rawCookie);
    return null;
  }
  return row;
}

function destroy(rawCookie) {
  const id = parseCookie(rawCookie);
  if (id) run('DELETE FROM sessions WHERE id = ?', [id]);
}

function purgeExpired() {
  return run('DELETE FROM sessions WHERE expires_at < ?', [Date.now()]).changes;
}

function count() {
  return get('SELECT COUNT(*) AS n FROM sessions').n;
}

function activeUsers() {
  return all('SELECT DISTINCT user_id FROM sessions').length;
}

module.exports = { create, getValid, destroy, purgeExpired, parseCookie, sign, count, activeUsers };
