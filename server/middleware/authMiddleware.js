const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { errorResponse } = require('../utils/response');

/**
 * Middleware to protect routes
 * Checks for token in cookies or Authorization header
 */
const protect = async (req, res, next) => {
  let token;

  // Check cookies first
  if (req.cookies.token) {
    token = req.cookies.token;
  } 
  // Fallback to Authorization header
  else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json(errorResponse('Not authorized to access this route, no token'));
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user to request
    req.user = await User.findById(decoded.id).select('-password');
    
    if (!req.user) {
      return res.status(401).json(errorResponse('Not authorized, user not found'));
    }

    next();
  } catch (error) {
    console.error('Token verification error:', error.message);
    return res.status(401).json(errorResponse('Not authorized, token failed'));
  }
};

/**
 * Middleware to authorize specific global roles (if applicable)
 */
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json(errorResponse(`Role ${req.user?.role} is not authorized`));
    }
    next();
  };
};

/**
 * Middleware to check role within a specific Workspace
 * Assumes req.params.workspaceId exists or req.body.workspace exists
 */
const checkWorkspaceRole = (...roles) => {
  return async (req, res, next) => {
    try {
      const workspaceId = req.params.workspaceId || req.body.workspace;
      if (!workspaceId) return res.status(400).json(errorResponse('Workspace ID required for role check'));

      const Workspace = require('../models/Workspace');
      const workspace = await Workspace.findById(workspaceId);
      
      if (!workspace) return res.status(404).json(errorResponse('Workspace not found'));

      // Owner has implicit full access
      if (String(workspace.owner) === String(req.user.id)) {
        return next();
      }

      // Check members list
      const member = workspace.members.find(m => String(m.user) === String(req.user.id));
      
      if (!member) {
        return res.status(403).json(errorResponse('You are not a member of this workspace'));
      }

      if (!roles.includes(member.role)) {
        return res.status(403).json(errorResponse(`Workspace role ${member.role} is not authorized for this action`));
      }

      next();
    } catch (err) {
      next(err);
    }
  };
};

module.exports = { protect, authorizeRoles, checkWorkspaceRole };
