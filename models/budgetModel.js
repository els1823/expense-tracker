const db = require('../db/init');

const BudgetModel = {
  findForCategoryMonth(categoryId, month) {
    return db
      .prepare('SELECT * FROM budgets WHERE category_id = ? AND month = ?')
      .get(categoryId, month);
  },

  upsert(categoryId, month, amount) {
    const existing = BudgetModel.findForCategoryMonth(categoryId, month);
    if (existing) {
      db.prepare('UPDATE budgets SET amount = ? WHERE id = ?').run(amount, existing.id);
      return existing.id;
    }
    const info = db
      .prepare('INSERT INTO budgets (category_id, month, amount) VALUES (?, ?, ?)')
      .run(categoryId, month, amount);
    return info.lastInsertRowid;
  },

  listForUserMonth(userId, month) {
    return db
      .prepare(
        `SELECT b.*, c.name AS category_name
         FROM budgets b
         JOIN categories c ON c.id = b.category_id
         WHERE c.user_id = ? AND b.month = ?`
      )
      .all(userId, month);
  },
};

module.exports = BudgetModel;