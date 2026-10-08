'use strict';

const { all, get, run } = require('./db');

const SELECT = `
  SELECT c.id, c.article_id, c.user_id, c.content, c.created_at,
         u.username, u.is_admin
    FROM comments c
    JOIN users u ON u.id = c.user_id`;

function byArticle(articleId) {
  return all(`${SELECT} WHERE c.article_id = ? ORDER BY c.created_at DESC, c.id DESC`, [articleId]);
}

function find(id) {
  return get(`${SELECT} WHERE c.id = ?`, [id]);
}

function create({ articleId, userId, content }) {
  const res = run('INSERT INTO comments (article_id, user_id, content) VALUES (?, ?, ?)', [
    articleId,
    userId,
    content,
  ]);
  return find(res.lastInsertRowid);
}

function remove(id) {
  return run('DELETE FROM comments WHERE id = ?', [id]).changes;
}

function countByArticle(articleId) {
  return get('SELECT COUNT(*) AS n FROM comments WHERE article_id = ?', [articleId]).n;
}

function byUser(userId) {
  return all(
    `SELECT c.id, c.article_id, c.user_id, c.content, c.created_at,
            u.username, u.is_admin, a.title AS article_title, a.slug AS article_slug
       FROM comments c
       JOIN users u    ON u.id = c.user_id
       JOIN articles a ON a.id = c.article_id
      WHERE c.user_id = ?
      ORDER BY c.created_at DESC`,
    [userId]
  );
}

module.exports = { byArticle, find, create, remove, countByArticle, byUser };
