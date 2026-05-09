const { errorResponse } = require('../utils/apiResponse');

const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return errorResponse(res, 'Access denied. Admin privileges required.', 403);
};

const isAdminOrMember = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'member')) {
    return next();
  }
  return errorResponse(res, 'Access denied.', 403);
};

module.exports = { isAdmin, isAdminOrMember };
