'use strict';

const express = require('express');
const likes = require('../controllers/likeController');

const router = express.Router();

function jsonAuth(req, res, next) {
  if (req.user) return next();
  res.status(401).json({ error: 'Authentification requise.' });
}

router.post('/articles/:id/like', jsonAuth, likes.toggle);

module.exports = router;
