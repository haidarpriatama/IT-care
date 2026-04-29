// Middleware: pastikan user sudah login
const ensureAuthenticated = (req, res, next) => {
  if (req.session && req.session.user) {
    return next();
  }
  req.flash('error', 'Silakan login terlebih dahulu.');
  res.redirect('/login');
};

// Middleware: batasi akses berdasarkan role
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.session.user || !roles.includes(req.session.user.role)) {
      req.flash('error', 'Anda tidak memiliki akses ke halaman ini.');
      return res.redirect('/dashboard');
    }
    next();
  };
};

module.exports = { ensureAuthenticated, authorizeRoles };
