const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'expense-tracker.db');
const db = new Database(dbPath);

// Enable foreign keys and better performance
db.pragma('foreign_keys = ON');
db.pragma('journal_mode = WAL');

// Apply schema
const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
db.exec(schema);

module.exports = db;