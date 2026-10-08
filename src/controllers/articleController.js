'use strict';

const Article = require('../models/Article');
const Comment = require('../models/Comment');

const SORTS = [
  { key: 'top', label: '🔥 Top' },
  { key: 'recent', label: '🕒 Récents' },
  { key: 'commented', label: '💬 Les plus commentés' },
  { key: 'liked', label: '❤️ Les plus likés' },
];

function index(req, res) {
  const sort = SORTS.some((s) => s.key === req.query.sort) ? req.query.sort : 'top';
  const category = typeof req.query.categorie === 'string' ? req.query.categorie : '';
  const viewerId = req.user ? req.user.id : null;

  const articles = Article.list({ sort, category, viewerId });
  const top3 = Article.list({ sort: 'top', viewerId }).slice(0, 3).map((a) => a.id);

  res.render('home', {
    title: 'TechPulse — avis et classements tech',
    articles,
    categories: Article.categories(),
    sorts: SORTS,
    currentSort: sort,
    currentCategory: category,
    top3,
    stats: { articles: Article.count() },
  });
}

function show(req, res) {
  const viewerId = req.user ? req.user.id : null;
  const article = Article.bySlug(req.params.slug, viewerId);
  if (!article) {
    res.status(404);
    return res.render('error', {
      title: 'Article introuvable',
      status: 404,
      message: 'Cet article n’existe pas ou a été supprimé.',
      action: { href: '/', label: 'Retour à l’accueil' },
    });
  }
  res.render('article', {
    title: article.title,
    article,
    comments: Comment.byArticle(article.id),
  });
}

function createForm(req, res) {
  res.render('admin/new-article', {
    title: 'Publier un article',
    form: { title: '', category: '', excerpt: '', imageUrl: '', content: '' },
  });
}

function create(req, res) {
  const title = String(req.body.title || '').trim();
  const excerpt = String(req.body.excerpt || '').trim();
  const content = String(req.body.content || '').trim();
  const category = String(req.body.category || '').trim() || 'Tech';
  const imageUrl = String(req.body.imageUrl || '').trim();

  const fail = (message) =>
    res.status(400).render('admin/new-article', {
      title: 'Publier un article',
      error: message,
      form: { title, category, excerpt, imageUrl, content },
    });

  if (title.length < 8) return fail('Le titre doit contenir au moins 8 caractères.');
  if (content.length < 100) return fail('Le contenu doit faire au moins 100 caractères.');
  if (imageUrl && !/^https?:\/\//i.test(imageUrl)) return fail('L’URL d’image doit commencer par http(s)://');

  const article = Article.create({
    title,
    excerpt: excerpt || content.slice(0, 160),
    content,
    imageUrl,
    category,
    authorId: req.user.id,
  });
  res.redirect(`/articles/${article.slug}?ok=` + encodeURIComponent('Article publié !'));
}

module.exports = { index, show, createForm, create, SORTS };
