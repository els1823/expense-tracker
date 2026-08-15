function requireAuth(req, res, next) {
  if (!req.session || !req.session.userId) {
    return res.redirect('/login');
  }
  next();
}

function requireAdmin(req, res, next) {
  if (!req.session || !req.session.userId) {
    return res.redirect('/login');
  }
  if (req.session.role !== 'admin') {
    return res.status(403).render('error', {
      title: 'Forbidden',
      message: 'You do not have permission to view this page.',
    });
  }
  next();
}

// Makes the logged-in user available in every EJS template
function attachUserToLocals(req, res, next) {
  res.locals.currentUser = req.session && req.session.userId
    ? {
        id: req.session.userId,
        email: req.session.email,
        username: req.session.username,
        fullName: req.session.fullName,
        profilePicture: req.session.profilePicture || null,
        role: req.session.role,
      }
    : null;
  next();
}


module.exports = { requireAuth, requireAdmin, attachUserToLocals };