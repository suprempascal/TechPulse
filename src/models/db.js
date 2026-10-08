'use strict';

const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');
const config = require('../config');

let db = null;

function connect() {
  if (db) return db;
  fs.mkdirSync(path.dirname(config.dbFile), { recursive: true });
  db = new DatabaseSync(config.dbFile);
  db.exec('PRAGMA foreign_keys = ON;');
  db.exec(fs.readFileSync(config.schemaFile, 'utf8'));
  return db;
}

function getDb() {
  return db || connect();
}

/** Exécute une requête SELECT et renvoie toutes les lignes. */
function all(sql, params = []) {
  return getDb().prepare(sql).all(...params);
}

/** Exécute une requête SELECT et renvoie la première ligne ou undefined. */
function get(sql, params = []) {
  return getDb().prepare(sql).get(...params);
}

/** Exécute une INSERT/UPDATE/DELETE et renvoie { changes, lastInsertRowid }. */
function run(sql, params = []) {
  return getDb().prepare(sql).run(...params);
}

function close() {
  if (db) {
    db.close();
    db = null;
  }
}

connect();

module.exports = { connect, getDb, all, get, run, close };
