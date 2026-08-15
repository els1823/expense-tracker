const express = require('express');
const router = express.Router();
const ExpenseModel = require('../models/expenseModel');
const BudgetModel = require('../models/budgetModel');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth);

router.get('/dashboard', (req, res) => {
  const month = req.query.month || new Date().toISOString().slice(0, 7);

  // Recent months for the selector
  const months = [];
  const now = new Date();
  for (let i = 0; i < 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(d.toISOString().slice(0, 7));
  }

  // Current month summary (existing feature)
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

  // ===== Track my expenditure (date range) =====
  const from = req.query.from || new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
  const to = req.query.to || now.toISOString().slice(0, 10);

  const rangeExpenses = ExpenseModel.listForUser(req.session.userId, { from, to });

  // Group by category for the pie chart
  const categoryTotals = {};
  rangeExpenses.forEach((exp) => {
    const name = exp.category_name || 'Uncategorised';
    categoryTotals[name] = (categoryTotals[name] || 0) + Number(exp.amount);
  });

  const chartLabels = Object.keys(categoryTotals);
  const chartData = Object.values(categoryTotals);
  const rangeTotalSpent = chartData.reduce((sum, v) => sum + v, 0);

  // Approximate budget for the selected range (using current month budgets as reference)
  const rangeTotalBudget = totalBudget; // simple approach for now

  let rangeMessage = '';
  let rangeStatus = 'ok';

  if (rangeTotalBudget > 0) {
    const difference = rangeTotalBudget - rangeTotalSpent;
    if (difference > 0) {
      rangeMessage = `Congratulations! You saved ${difference.toFixed(2)} in this period. Keep up the good financial discipline!`;
      rangeStatus = 'saved';
    } else if (difference < 0) {
      rangeMessage = `You overspent by ${Math.abs(difference).toFixed(2)}. Try to spend more cautiously and judiciously next time.`;
      rangeStatus = 'over';
    } else {
      rangeMessage = `You spent exactly your budget. Well balanced!`;
      rangeStatus = 'ok';
    }
  } else {
    rangeMessage = 'Set some category budgets to get savings insights.';
  }

  res.render('dashboard', {
    title: 'Dashboard',
    summary,
    totalSpent,
    totalBudget,
    month,
    months,
    // Track section
    from,
    to,
    chartLabels: JSON.stringify(chartLabels),
    chartData: JSON.stringify(chartData),
    rangeTotalSpent,
    rangeTotalBudget,
    rangeMessage,
    rangeStatus,
  });
});

module.exports = router;