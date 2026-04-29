// Middleware: pastikan user sudah login
const ensureAuthenticated = (req, res, next) => {
  if (req.session && req.session.user) {
    return next();
  }
  res.status(401).json({ error: 'Silakan login terlebih dahulu.' });
};

// Middleware: batasi akses berdasarkan role
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.session.user || !roles.includes(req.session.user.role)) {
      return res.status(403).json({ error: 'Anda tidak memiliki akses ke endpoint ini.' });
    }
    next();
  };
};

module.exports = { ensureAuthenticated, authorizeRoles };
