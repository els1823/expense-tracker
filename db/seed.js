const bcrypt = require('bcrypt');
const db = require('./init');

function seed() {
  // Check if any users already exist
  const userCount = db.prepare('SELECT COUNT(*) AS count FROM users').get().count;
  if (userCount > 0) {
    console.log('Database already has users – skipping seed.');
    return;
  }

  console.log('Seeding database with admin and demo accounts...');

  const insertUser = db.prepare(`
    INSERT INTO users (email, username, full_name, password_hash, role)
    VALUES (?, ?, ?, ?, ?)
  `);

  // Admin account
  const adminHash = bcrypt.hashSync('Admin@1234', 10);
  insertUser.run(
    'admin@expensetracker.test',
    'admin',
    'System Admin',
    adminHash,
    'admin'
  );

  // Demo account
  const demoHash = bcrypt.hashSync('Demo@1234', 10);
  insertUser.run(
    'demo@expensetracker.test',
    'demo',
    'Demo User',
    demoHash,
    'user'
  );

  // Get demo user id
  const demoUser = db.prepare('SELECT id FROM users WHERE email = ?')
    .get('demo@expensetracker.test');

  if (demoUser) {
    const userId = demoUser.id;

    const insertCategory = db.prepare(
      'INSERT INTO categories (user_id, name) VALUES (?, ?)'
    );
    insertCategory.run(userId, 'Food');
    insertCategory.run(userId, 'Transport');
    insertCategory.run(userId, 'Entertainment');

    const food = db.prepare(
      'SELECT id FROM categories WHERE user_id = ? AND name = ?'
    ).get(userId, 'Food');

    const transport = db.prepare(
      'SELECT id FROM categories WHERE user_id = ? AND name = ?'
    ).get(userId, 'Transport');

    const currentMonth = new Date().toISOString().slice(0, 7);
    const insertBudget = db.prepare(
      'INSERT INTO budgets (category_id, month, amount) VALUES (?, ?, ?)'
    );

    if (food) insertBudget.run(food.id, currentMonth, 300);
    if (transport) insertBudget.run(transport.id, currentMonth, 150);

    const insertExpense = db.prepare(
      'INSERT INTO expenses (user_id, category_id, amount, date, description) VALUES (?, ?, ?, ?, ?)'
    );
    const today = new Date().toISOString().slice(0, 10);

    if (food) {
      insertExpense.run(userId, food.id, 45.50, today, 'Grocery shopping');
      insertExpense.run(userId, food.id, 12.00, today, 'Coffee');
    }
    if (transport) {
      insertExpense.run(userId, transport.id, 25.00, today, 'Uber ride');
    }
  }

  console.log('Database seeded successfully!');
  console.log('Admin : admin@expensetracker.test / Admin@1234');
  console.log('Demo  : demo@expensetracker.test / Demo@1234');
}

seed();