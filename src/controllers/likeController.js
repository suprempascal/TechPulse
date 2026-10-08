'use strict';

const Article = require('../models/Article');
const Like = require('../models/Like');

/** Bascule un like. Réponse JSON consommée par public/js/like.js. */
function toggle(req, res) {
  const articleId = Number(req.params.id);
  const article = Article.findById(articleId, req.user.id);
  if (!article) {
    return res.status(404).json({ error: 'Article introuvable.' });
  }
  const result = Like.toggle(req.user.id, articleId);
  res.json({
    liked: result.liked,
    likesCount: result.likesCount,
    score: result.likesCount * 1 + article.comments_count * 1,
  });
}

module.exports = { toggle };
