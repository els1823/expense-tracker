const db = require('../db/init');

const CategoryModel = {
  listForUser(userId) {
    return db
      .prepare('SELECT * FROM categories WHERE user_id = ? ORDER BY name ASC')
      .all(userId);
  },

  findById(id, userId) {
    return db
      .prepare('SELECT * FROM categories WHERE id = ? AND user_id = ?')
      .get(id, userId);
  },

  create(userId, name) {
    const info = db
      .prepare('INSERT INTO categories (user_id, name) VALUES (?, ?)')
      .run(userId, name);
    return info.lastInsertRowid;
  },

  remove(id, userId) {
    return db.prepare('DELETE FROM categories WHERE id = ? AND user_id = ?').run(id, userId);
  },
};

module.exports = CategoryModel;