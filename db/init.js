const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'expense-tracker.db');
const db = new Database(dbPath);

// Enable foreign keys and better performance
db.pragma('foreign_keys = ON');
db.pragma('journal_mode = WAL');

// Apply main schema
const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
db.exec(schema);

// Safely add new columns if they don't exist yet
function addColumnIfMissing(table, column, definition) {
  const columns = db.prepare(`PRAGMA table_info(${table})`).all();
  const exists = columns.some((col) => col.name === column);
  if (!exists) {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
    console.log(`Added missing column: ${table}.${column}`);
  }
}

addColumnIfMissing('users', 'profile_picture', 'TEXT');
addColumnIfMissing('expenses', 'receipt_image', 'TEXT');

module.exports = db;