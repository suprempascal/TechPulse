'use strict';

const MONTHS = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];

function formatDate(value) {
  if (!value) return '';
  const d = new Date(String(value).replace(' ', 'T') + (String(value).includes('Z') ? '' : 'Z'));
  if (Number.isNaN(d.getTime())) return String(value);
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()} à ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function timeAgo(value) {
  const d = new Date(String(value).replace(' ', 'T') + (String(value).includes('Z') ? '' : 'Z'));
  if (Number.isNaN(d.getTime())) return '';
  const s = Math.floor((Date.now() - d.getTime()) / 1000);
  if (s < 60) return "à l'instant";
  if (s < 3600) return `il y a ${Math.floor(s / 60)} min`;
  if (s < 86400) return `il y a ${Math.floor(s / 3600)} h`;
  if (s < 2592000) return `il y a ${Math.floor(s / 86400)} j`;
  return formatDate(value);
}

function excerpt(text, max = 160) {
  const t = String(text || '').replace(/\s+/g, ' ').trim();
  return t.length > max ? t.slice(0, max).trimEnd() + '…' : t;
}

/** Flash simple basé sur les paramètres de requête (?ok=... / ?err=...). */
function flash(req, res, next) {
  res.locals.flash = null;
  const type = req.query.ok ? 'success' : req.query.err ? 'error' : null;
  if (type) {
    res.locals.flash = { type, message: type === 'success' ? req.query.ok : req.query.err };
  }
  next();
}

function locals(req, res, next) {
  res.locals.user = req.user;
  res.locals.path = req.path;
  res.locals.query = req.query;
  res.locals.helpers = { formatDate, timeAgo, excerpt };
  next();
}

module.exports = { locals, flash, formatDate, timeAgo, excerpt };
