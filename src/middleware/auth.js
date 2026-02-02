const jwtService = require('../services/jwtService');

/**
 * JWT Authentication Middleware
 * Matches Spring Boot's JwtAuthenticationFilter
 */
const authenticate = (req, res, next) => {
  // Skip OPTIONS requests (CORS preflight)
  if (req.method === 'OPTIONS') {
    return next();
  }

  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Missing or invalid Authorization header' });
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwtService.verifyToken(token);
    // Set user email in request (matches Spring Security Authentication.getName())
    req.user = {
      email: decoded.email,
      userId: decoded.userId,
      name: decoded.name
    };
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

/**
 * Optional authentication - doesn't fail if no token present
 * Used for endpoints that work with or without authentication
 */
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    try {
      const decoded = jwtService.verifyToken(token);
      req.user = {
        email: decoded.email,
        userId: decoded.userId,
        name: decoded.name
      };
    } catch (error) {
      // Token invalid but continue anyway
      req.user = null;
    }
  } else {
    req.user = null;
  }
  next();
};

module.exports = {
  authenticate,
  optionalAuth
};
