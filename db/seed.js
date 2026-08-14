const bcrypt = require('bcrypt');
const db = require('./init');

const adminEmail = 'admin@expensetracker.test';
const demoEmail = 'demo@expensetracker.test';

function seed() {
  // Create admin user
const adminHash = bcrypt.hashSync('Admin@1234', 10);
const insertUser = db.prepare(`
  INSERT OR IGNORE INTO users (email, username, full_name, password_hash, role)
  VALUES (?, ?, ?, ?, ?)
`);
insertUser.run('admin@expensetracker.test', 'admin', 'System Admin', adminHash, 'admin');

// Create demo user
const demoHash = bcrypt.hashSync('Demo@1234', 10);
insertUser.run('demo@expensetracker.test', 'demo', 'Demo User', demoHash, 'user');

  // Get the demo user id
  const demoUser = db.prepare('SELECT id FROM users WHERE email = ?').get(demoEmail);
  if (!demoUser) {
    console.log('Seed finished (users already existed)');
    return;
  }

  const userId = demoUser.id;

  // Sample categories
  const insertCategory = db.prepare(`
    INSERT OR IGNORE INTO categories (user_id, name) VALUES (?, ?)
  `);
  insertCategory.run(userId, 'Food');
  insertCategory.run(userId, 'Transport');
  insertCategory.run(userId, 'Entertainment');

  // Get category ids
  const food = db.prepare('SELECT id FROM categories WHERE user_id = ? AND name = ?').get(userId, 'Food');
  const transport = db.prepare('SELECT id FROM categories WHERE user_id = ? AND name = ?').get(userId, 'Transport');

  // Sample budgets for current month
  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
  const insertBudget = db.prepare(`
    INSERT OR IGNORE INTO budgets (category_id, month, amount)
    VALUES (?, ?, ?)
  `);
  if (food) insertBudget.run(food.id, currentMonth, 300);
  if (transport) insertBudget.run(transport.id, currentMonth, 150);

  // Sample expenses
  const insertExpense = db.prepare(`
    INSERT OR IGNORE INTO expenses (user_id, category_id, amount, description, date)
    VALUES (?, ?, ?, ?, ?)
  `);
  const today = new Date().toISOString().slice(0, 10);
  if (food) {
    insertExpense.run(userId, food.id, 45.50, 'Grocery shopping', today);
    insertExpense.run(userId, food.id, 12.00, 'Coffee', today);
  }
  if (transport) {
    insertExpense.run(userId, transport.id, 25.00, 'Uber ride', today);
  }

  console.log('Database seeded successfully!');
  console.log('Admin login : admin@expensetracker.test / Admin@1234');
  console.log('Demo login  : demo@expensetracker.test / Demo@1234');
}

seed();