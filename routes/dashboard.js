const express = require('express');
const router = express.Router();
const ExpenseModel = require('../models/expenseModel');
const BudgetModel = require('../models/budgetModel');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth);

router.get('/dashboard', (req, res) => {
  const month = req.query.month || new Date().toISOString().slice(0, 7);

  // Simple list of recent months for the selector
  const months = [];
  const now = new Date();
  for (let i = 0; i < 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(d.toISOString().slice(0, 7));
  }

  const spendByCategory = ExpenseModel.spendByCategoryForMonth(req.session.userId, month);
  const budgets = BudgetModel.listForUserMonth(req.session.userId, month);

  const budgetByCategory = {};
  budgets.forEach((b) => (budgetByCategory[b.category_id] = b.amount));

  const summary = spendByCategory.map((row) => {
    const budget = budgetByCategory[row.category_id] || 0;
    const percent = budget > 0 ? Math.round((row.total_spent / budget) * 100) : null;
    let status = 'no-budget';
    if (budget > 0) {
      if (percent >= 100) status = 'over';
      else if (percent >= 80) status = 'near';
      else status = 'ok';
    }
    return { ...row, budget, percent, status };
  });

  const totalSpent = summary.reduce((sum, r) => sum + r.total_spent, 0);
  const totalBudget = summary.reduce((sum, r) => sum + r.budget, 0);

  res.render('dashboard', {
    title: 'Dashboard',
    summary,
    totalSpent,
    totalBudget,
    month,
    months,
  });
});

module.exports = router;