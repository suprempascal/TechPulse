'use strict';

const path = require('path');
const express = require('express');

const config = require('./src/config');
const db = require('./src/models/db');
const Session = require('./src/models/Session');
const { seed } = require('./src/db/seed');
const { session } = require('./src/middlewares/session');
const { csrf } = require('./src/middlewares/csrf');
const { locals, flash } = require('./src/middlewares/locals');
const routes = require('./src/routes');

const app = express();

app.set('view engine', 'ejs');
app.set('views', config.viewsDir);
app.set('trust proxy', true);
app.disable('x-powered-by');

app.use((req, res, next) => {
  res.set('X-Content-Type-Options', 'nosniff');
  res.set('X-Frame-Options', 'SAMEORIGIN');
  res.set('Referrer-Policy', 'same-origin');
  next();
});

app.use(express.static(config.publicDir, { maxAge: '1h' }));
app.use(express.urlencoded({ extended: false, limit: '100kb' }));
app.use(session);
app.use(flash);
app.use(locals);
app.use(csrf);

app.use(routes);

app.use((req, res) => {
  res.status(404).render('error', {
    title: 'Page introuvable',
    status: 404,
    message: `La page ${req.path} n’existe pas ou a été déplacée.`,
    action: { href: '/', label: "Retour à l'accueil" },
  });
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('[error]', err);
  res.status(500).render('error', {
    title: 'Erreur serveur',
    status: 500,
    message: 'Une erreur inattendue est survenue. Réessayez plus tard.',
    action: { href: '/', label: "Retour à l'accueil" },
  });
});

function start() {
  db.connect();
  seed();
  Session.purgeExpired();

  setInterval(() => Session.purgeExpired(), 1000 * 60 * 30).unref();

  app.listen(config.port, () => {
    console.log(`TechPulse démarré → http://localhost:${config.port}`);
    console.log(`Base SQLite : ${config.dbFile}`);
  });
}

if (require.main === module) start();

module.exports = { app, start };
