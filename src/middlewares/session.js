'use strict';

const Session = require('../models/Session');
const User = require('../models/User');
const config = require('../config');

function parseCookies(req) {
  const header = req.headers.cookie;
  if (!header) return {};
  return header.split(';').reduce((acc, part) => {
    const i = part.indexOf('=');
    if (i === -1) return acc;
    acc[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
    return acc;
  }, {});
}

function session(req, res, next) {
  req.cookies = parseCookies(req);
  req.session = null;
  req.user = null;

  const raw = req.cookies[config.session.cookieName];
  const row = raw ? Session.getValid(raw) : null;

  if (row) {
    req.session = { id: raw, csrfToken: row.csrf_token };
    req.user = {
      id: row.user_id,
      username: row.username,
      email: row.email,
      isAdmin: Boolean(row.is_admin),
      createdAt: row.created_at,
    };
    // prolongement de session glissante
    if (row.expires_at - Date.now() < config.session.ttlMs / 2) {
      res.cookie(config.session.cookieName, raw, cookieOptions(config.session.ttlMs));
    }
  }

  res.cookie = (name, value, opts = {}) =>
    appendCookie(res, name, value, { ...cookieOptions(config.session.ttlMs), ...opts });

  res.clearCookie = (name) => appendCookie(res, name, '', { maxAge: 0 });

  next();
}

function cookieOptions(maxAge) {
  return {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge,
    secure: process.env.NODE_ENV === 'production',
  };
}

function appendCookie(res, name, value, opts) {
  const parts = [`${name}=${encodeURIComponent(value)}`];
  parts.push(`Path=${opts.path || '/'}`);
  if (opts.maxAge !== undefined) parts.push(`Max-Age=${Math.floor(opts.maxAge / 1000)}`);
  if (opts.httpOnly) parts.push('HttpOnly');
  if (opts.sameSite) parts.push(`SameSite=${opts.sameSite}`);
  if (opts.secure) parts.push('Secure');
  const prev = res.getHeader('Set-Cookie');
  const list = prev ? [].concat(prev) : [];
  list.push(parts.join('; '));
  res.setHeader('Set-Cookie', list);
}

module.exports = { session, cookieOptions };
