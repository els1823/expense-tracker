const express = require('express');
const router = express.Router();
const CategoryModel = require('../models/categoryModel');
const BudgetModel = require('../models/budgetModel');
const { requireAuth } = require('../middleware/auth');
const { isNonEmptyString, isNonNegativeAmount, sanitizeText } = require('../middleware/validate');

router.use(requireAuth);

function currentMonth() {
  return new Date().toISOString().slice(0, 7); // YYYY-MM
}

router.get('/categories', (req, res) => {
  const categories = CategoryModel.listForUser(req.session.userId);
  const month = currentMonth();
  const budgets = BudgetModel.listForUserMonth(req.session.userId, month);
  const budgetByCategory = {};
  budgets.forEach((b) => (budgetByCategory[b.category_id] = b.amount));

  res.render('categories', {
    title: 'Categories',
    categories,
    budgetByCategory,
    month,
    error: null,
  });
});

router.post('/categories', (req, res) => {
  const name = sanitizeText(req.body.name);
  if (!isNonEmptyString(name, 100)) {
    return res.redirect('/categories');
  }
  try {
    CategoryModel.create(req.session.userId, name);
    req.session.success = 'Category created successfully.';
  } catch (err) {
      req.session.error = 'A category with that name already exists.';
  }
    // Duplicate name (UNIQUE constraint)
  res.redirect('/categories');
});

router.post('/categories/:id/delete', (req, res) => {
  const category = CategoryModel.findById(req.params.id, req.session.userId);
  if (!category) {
    return res.status(404).render('error', {
      title: 'Not found',
      message: 'Category not found.',
    });
  }
  CategoryModel.remove(req.params.id, req.session.userId);
  res.redirect('/categories');
});

router.post('/categories/:id/budget', (req, res) => {
  const category = CategoryModel.findById(req.params.id, req.session.userId);
  if (!category) {
    return res.status(404).render('error', {
      title: 'Not found',
      message: 'Category not found.',
    });
  }
  const amount = req.body.amount;
  if (!isNonNegativeAmount(amount)) {
    return res.redirect('/categories');
  }
  BudgetModel.upsert(category.id, currentMonth(), Number(amount));
  req.session.success = 'Budget updated.';
  res.redirect('/categories');
});

module.exports = router;