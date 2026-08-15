const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const UserModel = require('../models/userModel');
const { isValidEmail, isValidPassword } = require('../middleware/validate');

const SALT_ROUNDS = 10;

router.get('/register', (req, res) => {
  if (req.session.userId) return res.redirect('/dashboard');
  res.render('register', { title: 'Register', error: null, formData: {} });
});

router.post('/register', async (req, res) => {
  const { fullName, username, email, password, confirmPassword } = req.body;
  const errors = [];

  if (!fullName || fullName.trim().length < 2) {
    errors.push('Please enter your full name.');
  }
  if (!username || !/^[a-zA-Z0-9_]{3,30}$/.test(username)) {
    errors.push('Username must be 3–30 characters (letters, numbers, underscores).');
  }
  if (!isValidEmail(email)) errors.push('Please enter a valid email address.');
  if (!isValidPassword(password)) errors.push('Password must be at least 8 characters.');
  if (password !== confirmPassword) errors.push('Passwords do not match.');

  if (errors.length) {
    return res.status(400).render('register', {
      title: 'Register',
      error: errors.join(' '),
      formData: { fullName, username, email },
    });
  }

  const existingEmail = UserModel.findByEmail(email.trim().toLowerCase());
  if (existingEmail) {
    return res.status(409).render('register', {
      title: 'Register',
      error: 'An account with that email already exists.',
      formData: { fullName, username, email },
    });
  }

  const existingUsername = UserModel.findByUsername(username.trim().toLowerCase());
  if (existingUsername) {
    return res.status(409).render('register', {
      title: 'Register',
      error: 'That username is already taken.',
      formData: { fullName, username, email },
    });
  }

  try {
    const hash = await bcrypt.hash(password, SALT_ROUNDS);
    const userId = UserModel.create(
      email.trim().toLowerCase(),
      username.trim().toLowerCase(),
      fullName.trim(),
      hash
    );

    req.session.userId = userId;
    req.session.email = email.trim().toLowerCase();
    req.session.username = username.trim().toLowerCase();
    req.session.fullName = fullName.trim();
    req.session.role = 'user';
    
    req.session.profilePicture = user.profile_picture || null;
    req.session.success = `Welcome, ${fullName.trim()}! Your account has been created.`;
    res.redirect('/dashboard');
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).render('register', {
      title: 'Register',
      error: 'Something went wrong. Please try again.',
      formData: { fullName, username, email },
    });
  }
});

router.get('/login', (req, res) => {
  if (req.session.userId) return res.redirect('/dashboard');
  res.render('login', { title: 'Login', error: null, formData: {} });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).render('login', {
      title: 'Login',
      error: 'Email and password are required.',
      formData: { email },
    });
  }

  const user = UserModel.findByEmail(email.trim().toLowerCase());
  const genericError = 'Invalid email or password.';

  if (!user) {
    return res.status(401).render('login', {
      title: 'Login',
      error: genericError,
      formData: { email },
    });
  }

  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) {
    return res.status(401).render('login', {
      title: 'Login',
      error: genericError,
      formData: { email },
    });
  }

  req.session.userId = user.id;
  req.session.email = user.email;
  req.session.username = user.username;
  req.session.fullName = user.full_name;
  req.session.role = user.role;

  
  if (user.role === 'admin') {
    return res.redirect('/admin');
  }
  res.redirect('/dashboard');
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
});

module.exports = router;