// Re-export dari authMiddleware agar bisa diimport secara terpisah jika perlu
const { authorizeRoles } = require('./authMiddleware');

module.exports = { authorizeRoles };
