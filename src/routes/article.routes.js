'use strict';

const express = require('express');
const articles = require('../controllers/articleController');
const comments = require('../controllers/commentController');
const { requireAuth, requireAdmin } = require('../middlewares/authGuard');

const router = express.Router();

router.get('/', articles.index);

router.get('/articles/new', requireAdmin, articles.createForm);
router.post('/articles/new', requireAdmin, articles.create);

router.get('/articles/:slug', articles.show);

router.post('/articles/:slug/comments', requireAuth, comments.store);
router.post('/articles/:slug/comments/:id/delete', requireAuth, comments.destroy);

module.exports = router;
