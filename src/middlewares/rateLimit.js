'use strict';

const config = require('../config');

const buckets = new Map();

function clientKey(req) {
  const fwd = req.headers['x-forwarded-for'];
  return (fwd ? String(fwd).split(',')[0].trim() : req.socket.remoteAddress) || 'unknown';
}

/** Limiteur en mémoire : `max` requêtes par fenêtre glissante, par IP. */
function rateLimit({ windowMs, max, message } = {}) {
  const win = windowMs || config.rateLimit.windowMs;
  const limit = max || config.rateLimit.max;

  return function limitMiddleware(req, res, next) {
    const key = `${req.baseUrl || ''}${req.path}|${clientKey(req)}`;
    const now = Date.now();
    let hits = buckets.get(key) || [];
    hits = hits.filter((t) => now - t < win);

    if (hits.length >= limit) {
      const wait = Math.ceil((win - (now - hits[0])) / 1000);
      res.set('Retry-After', String(wait));
      res.status(429);
      return res.render('error', {
        title: 'Trop de tentatives',
        status: 429,
        message:
          message ||
          `Trop de tentatives. Réessayez dans ${Math.ceil(wait / 60)} minute(s).`,
      });
    }

    hits.push(now);
    buckets.set(key, hits);
    next();
  };
}

// évite une fuite mémoire en production longue
setInterval(() => {
  const now = Date.now();
  for (const [key, hits] of buckets) {
    const alive = hits.filter((t) => now - t < config.rateLimit.windowMs);
    if (alive.length) buckets.set(key, alive);
    else buckets.delete(key);
  }
}, 1000 * 60).unref();

module.exports = { rateLimit };
