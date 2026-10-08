'use strict';

const path = require('path');
const crypto = require('crypto');

const ROOT = path.join(__dirname, '..');

const SESSION_SECRET =
  process.env.SESSION_SECRET ||
  'dev-secret-' + crypto.createHash('sha256').update(process.env.USER || 'anon').digest('hex').slice(0, 24);

module.exports = {
  port: Number(process.env.PORT) || 3001,
  root: ROOT,
  dbFile: process.env.DB_FILE || path.join(ROOT, 'data', 'blog.db'),
  schemaFile: path.join(ROOT, 'src', 'db', 'schema.sql'),
  viewsDir: path.join(ROOT, 'views'),
  publicDir: path.join(ROOT, 'public'),

  session: {
    cookieName: 'sid',
    ttlMs: 1000 * 60 * 60 * 24 * 7,
    secret: SESSION_SECRET,
  },

  rateLimit: {
    windowMs: 1000 * 60 * 15,
    max: 5,
  },

  scoring: {
    likes: 1,
    comments: 1,
  },
};
