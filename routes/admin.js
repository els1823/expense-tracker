const express = require('express');
const router = express.Router();
const UserModel = require('../models/userModel');
const ExpenseModel = require('../models/expenseModel');
const CategoryModel = require('../models/categoryModel');
const BudgetModel = require('../models/budgetModel');
const { requireAdmin } = require('../middleware/auth');

router.use(requireAdmin);

// Admin overview
router.get('/admin', (req, res) => {
  const users = UserModel.listAll();
  const stats = {
    totalUsers: UserModel.countAll(),
    totalExpenses: ExpenseModel.countAll(),
    totalAmountLogged: ExpenseModel.sumAll(),
  };
  res.render('admin', { title: 'Admin', users, stats });
});

// View a specific user’s data
router.get('/admin/users/:id', (req, res) => {
  const user = UserModel.findById(req.params.id);
  if (!user) {
    return res.status(404).render('error', {
      title: 'Not found',
      message: 'User not found.',
    });
  }

  const month = new Date().toISOString().slice(0, 7);
  const categories = CategoryModel.listForUser(user.id);
  const expenses = ExpenseModel.listForUser(user.id);
  const budgets = BudgetModel.listForUserMonth(user.id, month);

  const budgetByCategory = {};
  budgets.forEach((b) => (budgetByCategory[b.category_id] = b.amount));

  res.render('admin-user', {
    title: `User: ${user.email}`,
    user,
    categories,
    expenses,
    budgetByCategory,
    month,
  });
});

module.exports = router;