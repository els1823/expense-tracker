const express = require('express');
const router = express.Router();
const ExpenseModel = require('../models/expenseModel');
const CategoryModel = require('../models/categoryModel');
const { requireAuth } = require('../middleware/auth');
const { isPositiveAmount, isValidDate, sanitizeText } = require('../middleware/validate');

router.use(requireAuth);

router.get('/expenses', (req, res) => {
  const categories = CategoryModel.listForUser(req.session.userId);
  const filters = {};
  if (req.query.category) filters.categoryId = req.query.category;
  if (req.query.from) filters.from = req.query.from;
  if (req.query.to) filters.to = req.query.to;

  const expenses = ExpenseModel.listForUser(req.session.userId, filters);

  res.render('expenses', {
    title: 'Expenses',
    expenses,
    categories,
    filters: req.query,
    error: null,
  });
});

router.get('/expenses/new', (req, res) => {
  const categories = CategoryModel.listForUser(req.session.userId);
  if (categories.length === 0) {
    return res.redirect('/categories');
  }
  res.render('expense-form', {
    title: 'Add expense',
    categories,
    expense: null,
    error: null,
    action: '/expenses',
  });
});

router.post('/expenses', (req, res) => {
  const { categoryId, amount, date, description } = req.body;
  const categories = CategoryModel.listForUser(req.session.userId);
  const category = CategoryModel.findById(categoryId, req.session.userId);

  const errors = [];
  if (!category) errors.push('Please select a valid category.');
  if (!isPositiveAmount(amount)) errors.push('Amount must be a positive number.');
  if (!isValidDate(date)) errors.push('Please enter a valid date (YYYY-MM-DD).');

  if (errors.length) {
    return res.status(400).render('expense-form', {
      title: 'Add expense',
      categories,
      expense: { category_id: categoryId, amount, date, description },
      error: errors.join(' '),
      action: '/expenses',
    });
  }

  ExpenseModel.create(
    req.session.userId,
    Number(categoryId),
    Number(amount),
    date,
    sanitizeText(description)
  );
  res.redirect('/expenses');
});

router.get('/expenses/:id/edit', (req, res) => {
  const expense = ExpenseModel.findById(req.params.id, req.session.userId);
  if (!expense) {
    return res.status(404).render('error', {
      title: 'Not found',
      message: 'Expense not found.',
    });
  }
  const categories = CategoryModel.listForUser(req.session.userId);
  res.render('expense-form', {
    title: 'Edit expense',
    categories,
    expense,
    error: null,
    action: `/expenses/${expense.id}`,
  });
});

router.post('/expenses/:id', (req, res) => {
  const expense = ExpenseModel.findById(req.params.id, req.session.userId);
  if (!expense) {
    return res.status(404).render('error', {
      title: 'Not found',
      message: 'Expense not found.',
    });
  }

  const { categoryId, amount, date, description } = req.body;
  const categories = CategoryModel.listForUser(req.session.userId);
  const category = CategoryModel.findById(categoryId, req.session.userId);

  const errors = [];
  if (!category) errors.push('Please select a valid category.');
  if (!isPositiveAmount(amount)) errors.push('Amount must be a positive number.');
  if (!isValidDate(date)) errors.push('Please enter a valid date (YYYY-MM-DD).');

  if (errors.length) {
    return res.status(400).render('expense-form', {
      title: 'Edit expense',
      categories,
      expense: {
        id: expense.id,
        category_id: categoryId,
        amount,
        date,
        description,
      },
      error: errors.join(' '),
      action: `/expenses/${expense.id}`,
    });
  }

  ExpenseModel.update(
    expense.id,
    req.session.userId,
    Number(categoryId),
    Number(amount),
    date,
    sanitizeText(description)
  );
  res.redirect('/expenses');
});

router.post('/expenses/:id/delete', (req, res) => {
  const expense = ExpenseModel.findById(req.params.id, req.session.userId);
  if (!expense) {
    return res.status(404).render('error', {
      title: 'Not found',
      message: 'Expense not found.',
    });
  }
  ExpenseModel.remove(req.params.id, req.session.userId);
  req.session.success = 'Expense deleted.';
  res.redirect('/expenses');
});

module.exports = router;