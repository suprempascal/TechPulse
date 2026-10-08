'use strict';

const User = require('../models/User');
const Article = require('../models/Article');
const Comment = require('../models/Comment');

function profile(req, res) {
  const viewerId = req.user.id;
  res.render('profile', {
    title: `Profil de ${req.user.username}`,
    stats: User.stats(viewerId),
    articles: Article.byAuthor(viewerId, viewerId),
    comments: Comment.byUser(viewerId),
    liked: User.likedArticles(viewerId),
  });
}

module.exports = { profile };
