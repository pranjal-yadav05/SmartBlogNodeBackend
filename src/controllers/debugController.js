/**
 * Debug Controller - Matches Spring Boot DebugController
 * Only for development purposes
 */
const debugController = {
  /**
   * Get authentication status
   * GET /api/debug/auth-status
   */
  getAuthStatus(req, res) {
    const response = {
      authenticated: !!req.user,
      authType: req.user ? 'JWT' : 'None'
    };

    if (req.user) {
      response.userInfo = {
        email: req.user.email,
        name: req.user.name,
        userId: req.user.userId
      };
    }

    res.status(200).json(response);
  },

  /**
   * Get session info
   * GET /api/debug/session-info
   */
  getSessionInfo(req, res) {
    const response = {};

    try {
      if (req.session) {
        response.sessionExists = true;
        response.sessionId = req.sessionID;
        response.maxAge = req.session.cookie ? req.session.cookie.maxAge : null;
      } else {
        response.sessionExists = false;
      }
    } catch (error) {
      response.error = 'Failed to get session info: ' + error.message;
    }

    res.status(200).json(response);
  }
};

module.exports = debugController;
