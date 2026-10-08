'use strict';

const crypto = require('node:crypto');
const Session = require('../models/Session');

const ANON_COOKIE = 'csrf';

const safeEqual = (a, b) => {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
};

function anonOpts() {
  return {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 1000 * 60 * 60 * 24,
    secure: process.env.NODE_ENV === 'production',
  };
}

/** Renvoie le token de la session, ou le token anonyme signé (créé si absent). */
function issueToken(req, res) {
  if (req.session) return req.session.csrfToken;
  const raw = req.cookies[ANON_COOKIE];
  if (raw && validAnon(raw)) return raw;
  const id = crypto.randomBytes(24).toString('base64url');
  const token = `${id}.${Session.sign(id)}`;
  res.cookie(ANON_COOKIE, token, anonOpts());
  req.cookies[ANON_COOKIE] = token;
  return token;
}

function validAnon(raw) {
  const i = raw.lastIndexOf('.');
  if (i === -1) return false;
  const id = raw.slice(0, i);
  return safeEqual(raw.slice(i + 1), Session.sign(id));
}

function currentToken(req) {
  if (req.session) return req.session.csrfToken;
  const raw = req.cookies[ANON_COOKIE];
  return raw && validAnon(raw) ? raw : null;
}

/** Attache le token CSRF (req + template) et vérifie les requêtes mutantes. */
function csrf(req, res, next) {
  const existing = currentToken(req);
  req.csrfToken = existing;
  res.locals.csrfToken = existing;
  res.locals.user = req.user;

  const mutating = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method);
  if (!mutating) {
    if (!req.csrfToken) {
      req.csrfToken = issueToken(req, res);
      res.locals.csrfToken = req.csrfToken;
    }
    return next();
  }

  const expected = existing || issueToken(req, res);
  const sent = (req.body && req.body._csrf) || req.headers['x-csrf'] || req.headers['x-csrf-token'];
  if (!safeEqual(String(sent || ''), String(expected))) {
    res.status(403);
    if (String(req.get('Accept') || '').includes('json') || req.xhr) {
      return res.json({ error: 'Jeton de sécurité invalide.' });
    }
    return res.render('error', {
      title: 'Erreur 403',
      status: 403,
      message: 'Jeton de sécurité invalide. Rechargez la page et réessayez.',
    });
  }
  next();
}

module.exports = { csrf, issueToken, currentToken };
