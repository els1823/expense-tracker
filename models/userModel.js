const db = require('../db/init');

const UserModel = {
  findByEmail(email) {
    return db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  },

  findByUsername(username) {
    return db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  },

  findById(id) {
    return db
      .prepare('SELECT id, email, username, full_name, role, created_at FROM users WHERE id = ?')
      .get(id);
  },

  create(email, username, fullName, passwordHash) {
    const info = db
      .prepare(
        'INSERT INTO users (email, username, full_name, password_hash, role) VALUES (?, ?, ?, ?, ?)'
      )
      .run(email, username, fullName, passwordHash, 'user');
    return info.lastInsertRowid;
  },

  countAll() {
    return db.prepare('SELECT COUNT(*) AS count FROM users').get().count;
  },

  listAll() {
    return db
      .prepare(
        'SELECT id, email, username, full_name, role, created_at FROM users ORDER BY created_at DESC'
      )
      .all();
  },
};

module.exports = UserModel;