const express = require('express');
const bcrypt = require('bcrypt');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const router = express.Router();
const UserModel = require('../models/userModel');
const { requireAuth } = require('../middleware/auth');
const { isValidEmail, isValidPassword, isNonEmptyString } = require('../middleware/validate');

router.use(requireAuth);

// Ensure uploads folder exists
const uploadDir = path.join(__dirname, '../public/uploads/profiles');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `user-${req.session.userId}-${Date.now()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB
  fileFilter: (req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error('Only image files are allowed'));
  },
});

router.get('/profile', (req, res) => {
  const user = UserModel.findById(req.session.userId);
  if (!user) {
    return res.status(404).render('error', {
      title: 'Not found',
      message: 'User not found.',
    });
  }
  res.render('profile', {
    title: 'My Profile',
    user,
    error: null,
  });
});

router.post('/profile', upload.single('profilePicture'), async (req, res) => {
  const user = UserModel.findById(req.session.userId);
  if (!user) {
    return res.status(404).render('error', {
      title: 'Not found',
      message: 'User not found.',
    });
  }

  const { fullName, username, email, currentPassword, newPassword, confirmPassword } = req.body;
  const errors = [];

  if (!isNonEmptyString(fullName, 100)) errors.push('Full name is required.');
  if (!username || !/^[a-zA-Z0-9_]{3,30}$/.test(username)) {
    errors.push('Username must be 3–30 characters (letters, numbers, underscores).');
  }
  if (!isValidEmail(email)) errors.push('Please enter a valid email address.');

  // Check username uniqueness (if changed)
  if (username.toLowerCase() !== user.username) {
    const existing = UserModel.findByUsername(username.toLowerCase());
    if (existing) errors.push('That username is already taken.');
  }

  // Check email uniqueness (if changed)
  if (email.toLowerCase() !== user.email) {
    const existing = UserModel.findByEmail(email.toLowerCase());
    if (existing) errors.push('That email is already registered.');
  }

  // Password change (optional)
  if (newPassword) {
    if (!currentPassword) errors.push('Current password is required to set a new password.');
    else {
      const fullUser = UserModel.findByEmail(user.email); // need hash
      const match = await bcrypt.compare(currentPassword, fullUser.password_hash);
      if (!match) errors.push('Current password is incorrect.');
    }
    if (!isValidPassword(newPassword)) errors.push('New password must be at least 8 characters.');
    if (newPassword !== confirmPassword) errors.push('New passwords do not match.');
  }

  if (errors.length) {
    return res.status(400).render('profile', {
      title: 'My Profile',
      user: { ...user, full_name: fullName, username, email },
      error: errors.join(' '),
    });
  }

  let profilePicturePath = user.profile_picture;
  if (req.file) {
    profilePicturePath = '/uploads/profiles/' + req.file.filename;
  }

  UserModel.updateProfile(user.id, {
    fullName: fullName.trim(),
    username: username.trim().toLowerCase(),
    email: email.trim().toLowerCase(),
    profilePicture: profilePicturePath,
  });

  if (newPassword) {
    const hash = await bcrypt.hash(newPassword, 10);
    UserModel.updatePassword(user.id, hash);
  }

  // Update session
  req.session.username = username.trim().toLowerCase();
  req.session.fullName = fullName.trim();
  req.session.email = email.trim().toLowerCase();
  if (profilePicturePath) {
    req.session.profilePicture = profilePicturePath;
  }

  req.session.success = 'Profile updated successfully.';
  res.redirect('/profile');
});

module.exports = router;