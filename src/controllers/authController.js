'use strict';

const User = require('../models/User');
const Session = require('../models/Session');
const config = require('../config');

function safeNext(target) {
  return typeof target === 'string' && target.startsWith('/') && !target.startsWith('//') ? target : '/';
}

function showLogin(req, res) {
  res.render('login', {
    title: 'Connexion',
    next: safeNext(req.query.next),
  });
}

function login(req, res) {
  const { username = '', password = '', next = '/' } = req.body;
  const user = User.verifyCredentials(String(username).trim(), String(password));

  if (!user) {
    return res.status(401).render('login', {
      title: 'Connexion',
      next: safeNext(next),
      error: "Identifiants incorrects. Vérifiez votre nom d'utilisateur et votre mot de passe.",
      form: { username: String(username).trim() },
    });
  }

  const session = Session.create(user.id);
  res.cookie(config.session.cookieName, session.id, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: config.session.ttlMs,
    secure: process.env.NODE_ENV === 'production',
  });
  res.redirect(safeNext(next) + '?ok=' + encodeURIComponent(`Bienvenue, ${user.username} !`));
}

function showRegister(req, res) {
  res.render('register', { title: 'Créer un compte' });
}

function register(req, res) {
  const username = String(req.body.username || '').trim();
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '');
  const confirm = String(req.body.confirm || '');

  const fail = (message) =>
    res.status(400).render('register', {
      title: 'Créer un compte',
      error: message,
      form: { username, email },
    });

  if (!/^[a-zA-Z0-9_.-]{3,20}$/.test(username))
    return fail("Nom d'utilisateur : 3 à 20 caractères (lettres, chiffres, . _ -).");
  if (!/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(email)) return fail('Adresse e-mail invalide.');
  if (password.length < 8) return fail('Le mot de passe doit contenir au moins 8 caractères.');
  if (password !== confirm) return fail('Les deux mots de passe ne correspondent pas.');
  if (User.findByUsername(username)) return fail("Ce nom d'utilisateur est déjà pris.");
  if (User.findByEmail(email)) return fail('Cette adresse e-mail est déjà utilisée.');

  const user = User.create({ username, email, password });
  const session = Session.create(user.id);
  res.cookie(config.session.cookieName, session.id, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: config.session.ttlMs,
    secure: process.env.NODE_ENV === 'production',
  });
  res.redirect('/?ok=' + encodeURIComponent('Votre compte est créé, bienvenue sur TechPulse !'));
}

function logout(req, res) {
  if (req.session) Session.destroy(req.session.id);
  res.clearCookie(config.session.cookieName);
  res.clearCookie('csrf');
  res.redirect('/?ok=' + encodeURIComponent('Vous êtes déconnecté.'));
}

module.exports = { showLogin, login, showRegister, register, logout };
