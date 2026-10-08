'use strict';

const express = require('express');
const users = require('../controllers/userController');
const { requireAuth } = require('../middlewares/authGuard');

const router = express.Router();

router.get('/profile', requireAuth, users.profile);

module.exports = router;
