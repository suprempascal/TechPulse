'use strict';

const Article = require('../models/Article');
const Comment = require('../models/Comment');

function backToArticle(req) {
  const slug = req.params.slug;
  try {
    const url = new URL(req.headers.referer || '');
    if (url.pathname.startsWith('/articles/')) return url.pathname;
  } catch {
    /* referer absent ou invalide */
  }
  return slug ? `/articles/${slug}` : '/';
}

function flashRedirect(base, type, message) {
  const qs = `${type}=${encodeURIComponent(message)}`;
  return `${base}${base.includes('?') ? '&' : '?'}${qs}#comments`;
}

function store(req, res) {
  const article = Article.bySlug(req.params.slug, req.user ? req.user.id : null);
  if (!article) return res.status(404).redirect('/?err=' + encodeURIComponent('Article introuvable.'));

  const target = backToArticle(req);
  const content = String(req.body.content || '').replace(/\s+/g, ' ').trim();

  if (content.length < 2) {
    return res.redirect(flashRedirect(target, 'err', 'Le commentaire est trop court.'));
  }
  if (content.length > 2000) {
    return res.redirect(flashRedirect(target, 'err', 'Commentaire trop long (2000 caractères max).'));
  }

  Comment.create({ articleId: article.id, userId: req.user.id, content });
  res.redirect(flashRedirect(target, 'ok', 'Commentaire publié.'));
}

function destroy(req, res) {
  const comment = Comment.find(Number(req.params.id));
  const target = backToArticle(req);
  if (!comment) return res.status(404).redirect(flashRedirect(target, 'err', 'Commentaire introuvable.'));

  if (!(req.user.isAdmin || comment.user_id === req.user.id)) {
    return res.status(403).redirect(flashRedirect(target, 'err', 'Action non autorisée.'));
  }

  Comment.remove(comment.id);
  res.redirect(flashRedirect(target, 'ok', 'Commentaire supprimé.'));
}

module.exports = { store, destroy };
