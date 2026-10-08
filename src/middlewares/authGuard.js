'use strict';

function requireAuth(req, res, next) {
  if (req.user) return next();
  res.status(401);
  res.render('error', {
    title: 'Connexion requise',
    status: 401,
    message: 'Vous devez être connecté pour accéder à cette page.',
    action: { href: '/login?next=' + encodeURIComponent(req.originalUrl), label: 'Se connecter' },
  });
}

function requireAdmin(req, res, next) {
  if (req.user && req.user.isAdmin) return next();
  res.status(req.user ? 403 : 401);
  res.render('error', {
    title: req.user ? 'Accès refusé' : 'Connexion requise',
    status: req.user ? 403 : 401,
    message: req.user
      ? 'Cette action est réservée aux administrateurs du site.'
      : 'Vous devez être connecté pour accéder à cette page.',
    action: req.user ? null : { href: '/login?next=' + encodeURIComponent(req.originalUrl), label: 'Se connecter' },
  });
}

function redirectIfAuthenticated(req, res, next) {
  if (req.user) {
    const target = req.query.next;
    return res.redirect(target && target.startsWith('/') ? target : '/');
  }
  next();
}

module.exports = { requireAuth, requireAdmin, redirectIfAuthenticated };
