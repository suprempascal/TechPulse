'use strict';

const express = require('express');
const authRoutes = require('./auth.routes');
const articleRoutes = require('./article.routes');
const likeRoutes = require('./like.routes');
const userRoutes = require('./user.routes');

const router = express.Router();

router.use(authRoutes);
router.use(articleRoutes);
router.use('/api', likeRoutes);
router.use(userRoutes);

module.exports = router;
