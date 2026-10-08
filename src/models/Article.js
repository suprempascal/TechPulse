'use strict';

const { all, get, run } = require('./db');
const config = require('../config');

const SCORE = `COUNT(DISTINCT l.user_id) * ${config.scoring.likes}
             + COUNT(DISTINCT c.id) * ${config.scoring.comments}`;

const BASE_SELECT = `
  SELECT a.id, a.title, a.slug, a.excerpt, a.content, a.image_url, a.category,
         a.author_id, a.created_at,
         u.username AS author_name,
         COUNT(DISTINCT l.user_id)                          AS likes_count,
         COUNT(DISTINCT c.id)                               AS comments_count,
         ${SCORE}                                           AS score,
         CASE WHEN ? IS NOT NULL
              THEN EXISTS(SELECT 1 FROM likes k
                           WHERE k.article_id = a.id AND k.user_id = ?)
              ELSE 0 END                                    AS is_liked
    FROM articles a
    JOIN users u      ON u.id = a.author_id
    LEFT JOIN likes l ON l.article_id = a.id
    LEFT JOIN comments c ON c.article_id = a.id`;

function sortClause(sort) {
  switch (sort) {
    case 'recent':
      return 'a.created_at DESC, a.id DESC';
    case 'commented':
      return 'comments_count DESC, score DESC, a.created_at DESC';
    case 'liked':
      return 'likes_count DESC, a.created_at DESC';
    case 'top':
    default:
      return 'score DESC, likes_count DESC, comments_count DESC, a.created_at DESC';
  }
}

function list({ sort = 'top', category = '', viewerId = null } = {}) {
  const where = [];
  const params = [viewerId, viewerId];
  if (category) {
    where.push('a.category = ?');
    params.push(category);
  }
  const sql = `${BASE_SELECT}
    ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
    GROUP BY a.id
    ORDER BY ${sortClause(sort)}`;
  return all(sql, params);
}

function bySlug(slug, viewerId = null) {
  return get(
    `${BASE_SELECT} WHERE a.slug = ? GROUP BY a.id`,
    [viewerId, viewerId, slug]
  );
}

function findById(id, viewerId = null) {
  return get(`${BASE_SELECT} WHERE a.id = ? GROUP BY a.id`, [viewerId, viewerId, id]);
}

function categories() {
  return all('SELECT DISTINCT category FROM articles ORDER BY category').map((r) => r.category);
}

function slugify(title) {
  const base = title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
  return base || 'article';
}

function uniqueSlug(title) {
  const base = slugify(title);
  let slug = base;
  let n = 1;
  while (get('SELECT 1 FROM articles WHERE slug = ?', [slug])) {
    slug = `${base}-${++n}`;
  }
  return slug;
}

function create({ title, excerpt, content, imageUrl, category, authorId }) {
  const slug = uniqueSlug(title);
  const res = run(
    `INSERT INTO articles (title, slug, excerpt, content, image_url, category, author_id)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [title, slug, excerpt, content, imageUrl || '', category || 'Tech', authorId]
  );
  return findById(res.lastInsertRowid, authorId);
}

function byAuthor(authorId, viewerId = null) {
  return all(
    `${BASE_SELECT} WHERE a.author_id = ? GROUP BY a.id ORDER BY a.created_at DESC`,
    [viewerId, viewerId, authorId]
  );
}

function count() {
  return get('SELECT COUNT(*) AS n FROM articles').n;
}

module.exports = {
  list,
  bySlug,
  findById,
  byAuthor,
  categories,
  create,
  slugify,
  uniqueSlug,
  count,
};
