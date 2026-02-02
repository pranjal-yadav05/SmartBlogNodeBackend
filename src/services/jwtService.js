const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRATION = '7d'; // 7 days, matching Spring Boot (1000L * 60 * 60 * 24 * 7)

/**
 * JWT Service - Matches Spring Boot JwtUtil
 */
const jwtService = {
  /**
   * Generate JWT token from user object
   * Matches JwtUtil.generateJwtToken(User user)
   */
  generateToken(user) {
    if (!JWT_SECRET) {
      throw new Error('JWT secret key is not configured');
    }

    return jwt.sign(
      {
        sub: user.email,  // Subject - user's email
        email: user.email,
        name: user.name,
        userId: user.id,
        profileImage: user.profileImage
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRATION }
    );
  },

  /**
   * Verify and decode token
   */
  verifyToken(token) {
    if (!token) {
      throw new Error('Token cannot be null or empty');
    }

    // Handle "Bearer " prefix if present
    if (token.startsWith('Bearer ')) {
      token = token.substring(7);
    }

    return jwt.verify(token, JWT_SECRET);
  },

  /**
   * Extract email from token
   * Matches JwtUtil.extractEmail(String token)
   */
  extractEmail(token) {
    const decoded = this.verifyToken(token);
    return decoded.email;
  },

  /**
   * Extract userId from token
   * Matches JwtUtil.extractUserId(String token)
   */
  extractUserId(token) {
    const decoded = this.verifyToken(token);
    return decoded.userId;
  },

  /**
   * Get email from token (alias)
   * Matches JwtUtil.getEmailFromToken(String token)
   */
  getEmailFromToken(token) {
    const decoded = this.verifyToken(token);
    return decoded.sub;
  },

  /**
   * Get name from token
   * Matches JwtUtil.getNameFromToken(String token)
   */
  getNameFromToken(token) {
    const decoded = this.verifyToken(token);
    return decoded.name;
  },

  /**
   * Validate token against email
   * Matches JwtUtil.validateToken(String token, String email)
   */
  validateToken(token, email) {
    try {
      const tokenEmail = this.getEmailFromToken(token);
      return email === tokenEmail;
    } catch (error) {
      return false;
    }
  }
};

module.exports = jwtService;
