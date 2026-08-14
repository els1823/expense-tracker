require('dotenv').config();
// Auto-seed the database if it is empty (useful on Render free tier)
require('./db/seed');
const express = require('express');
const session = require('express-session');
const path = require('path');
const { attachUserToLocals } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3000;

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'fallback-secret-change-me',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 }, // 1 day
  })
);
app.use(attachUserToLocals);

// Flash message helper
app.use((req, res, next) => {
  res.locals.success = req.session.success || null;
  res.locals.error = req.session.error || null;
  delete req.session.success;
  delete req.session.error;
  next();
});

// Routes
app.use('/', require('./routes/auth'));
app.use('/', require('./routes/categories'));
app.use('/', require('./routes/expenses'));
app.use('/', require('./routes/dashboard'));
app.use('/', require('./routes/admin'));

// Temporary homepage redirect
app.get('/', (req, res) => {
  if (req.session.userId) {
    return res.redirect(req.session.role === 'admin' ? '/admin' : '/dashboard');
  }
  res.redirect('/login');
});

// 404 handler
app.use((req, res) => {
  res.status(404).render('error', {
    title: 'Not Found',
    message: 'The page you requested does not exist.',
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).render('error', {
    title: 'Server Error',
    message: 'Something went wrong. Please try again later.',
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});