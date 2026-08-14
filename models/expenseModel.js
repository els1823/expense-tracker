const db = require('../db/init');

const ExpenseModel = {
  findById(id, userId) {
    return db
      .prepare('SELECT * FROM expenses WHERE id = ? AND user_id = ?')
      .get(id, userId);
  },

  create(userId, categoryId, amount, date, description) {
    const info = db
      .prepare(
        'INSERT INTO expenses (user_id, category_id, amount, date, description) VALUES (?, ?, ?, ?, ?)'
      )
      .run(userId, categoryId, amount, date, description || null);
    return info.lastInsertRowid;
  },

  update(id, userId, categoryId, amount, date, description) {
    return db
      .prepare(
        `UPDATE expenses
         SET category_id = ?, amount = ?, date = ?, description = ?
         WHERE id = ? AND user_id = ?`
      )
      .run(categoryId, amount, date, description || null, id, userId);
  },

  remove(id, userId) {
    return db.prepare('DELETE FROM expenses WHERE id = ? AND user_id = ?').run(id, userId);
  },

  listForUser(userId, filters = {}) {
    let query = `
      SELECT e.*, c.name AS category_name
      FROM expenses e
      JOIN categories c ON c.id = e.category_id
      WHERE e.user_id = ?
    `;
    const params = [userId];

    if (filters.categoryId) {
      query += ' AND e.category_id = ?';
      params.push(filters.categoryId);
    }
    if (filters.from) {
      query += ' AND e.date >= ?';
      params.push(filters.from);
    }
    if (filters.to) {
      query += ' AND e.date <= ?';
      params.push(filters.to);
    }

    query += ' ORDER BY e.date DESC, e.id DESC';
    return db.prepare(query).all(...params);
  },

  spendByCategoryForMonth(userId, month) {
    return db
      .prepare(
        `SELECT c.id AS category_id, c.name AS category_name,
                COALESCE(SUM(e.amount), 0) AS total_spent
         FROM categories c
         LEFT JOIN expenses e
           ON e.category_id = c.id
           AND e.user_id = c.user_id
           AND strftime('%Y-%m', e.date) = ?
         WHERE c.user_id = ?
         GROUP BY c.id
         ORDER BY c.name ASC`
      )
      .all(month, userId);
  },

  countAll() {
    return db.prepare('SELECT COUNT(*) AS count FROM expenses').get().count;
  },

  sumAll() {
    return db.prepare('SELECT COALESCE(SUM(amount), 0) AS total FROM expenses').get().total;
  },
};

module.exports = ExpenseModel;