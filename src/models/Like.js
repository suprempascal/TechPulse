'use strict';

const { get, run } = require('./db');

function has(userId, articleId) {
  return Boolean(get('SELECT 1 FROM likes WHERE user_id = ? AND article_id = ?', [userId, articleId]));
}

/** Renvoie { liked: boolean, likesCount: number } après le basculement. */
function toggle(userId, articleId) {
  if (has(userId, articleId)) {
    run('DELETE FROM likes WHERE user_id = ? AND article_id = ?', [userId, articleId]);
  } else {
    run('INSERT INTO likes (user_id, article_id) VALUES (?, ?)', [userId, articleId]);
  }
  return { liked: has(userId, articleId), likesCount: count(articleId) };
}

function count(articleId) {
  return get('SELECT COUNT(*) AS n FROM likes WHERE article_id = ?', [articleId]).n;
}

function countByUser(userId) {
  return get('SELECT COUNT(*) AS n FROM likes WHERE user_id = ?', [userId]).n;
}

module.exports = { has, toggle, count, countByUser };
