const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const fs = require('fs');

const dataDir = path.join(__dirname, '../../data');
if (!fs.existsSync(dataDir)) {
  try { fs.mkdirSync(dataDir, { recursive: true }); } catch(e) {}
}

const dbPath = process.env.DB_PATH || path.join(dataDir, 'routeless.db');
const db = new DatabaseSync(dbPath);

// Enable WAL mode and foreign key support for performance and concurrency
db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA foreign_keys = ON;');

module.exports = db;
