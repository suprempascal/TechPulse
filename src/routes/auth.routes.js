'use strict';

const express = require('express');
const auth = require('../controllers/authController');
const { rateLimit } = require('../middlewares/rateLimit');
const { redirectIfAuthenticated, requireAuth } = require('../middlewares/authGuard');

const router = express.Router();

router.get('/login', redirectIfAuthenticated, auth.showLogin);
router.post('/login', rateLimit(), auth.login);

router.get('/register', redirectIfAuthenticated, auth.showRegister);
router.post('/register', rateLimit({ max: 10 }), auth.register);

router.post('/logout', requireAuth, auth.logout);

module.exports = router;
