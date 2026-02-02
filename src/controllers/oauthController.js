const jwtService = require('../services/jwtService');
const { User } = require('../models');
const { v4: uuidv4 } = require('uuid');

const FRONTEND_URL = process.env.FRONTEND_URL;

/**
 * OAuth Controller - Matches Spring Boot OAuthController and OAuthRedirectController
 */
const oauthController = {
  /**
   * OAuth success handler
   * GET /api/oauth2/success
   */
  async oauthSuccess(req, res) {
    try {
      console.log('OAuth success endpoint called');

      // Check if user is authenticated via OAuth
      if (!req.user) {
        console.error('OAuth2User is null - authentication failed');
        return res.redirect(`${FRONTEND_URL}/login?error=auth_failed`);
      }

      const email = req.user.email;
      console.log('OAuth authentication for email:', email);

      if (!email) {
        console.error('Email not found in OAuth attributes');
        return res.redirect(`${FRONTEND_URL}/login?error=email_missing`);
      }

      // Find or create user
      let user = await User.findOne({ where: { email } });

      if (!user) {
        console.log('User not found in database, creating new user');
        try {
          user = await User.create({
            email,
            name: req.user.name,
            profileImage: req.user.profileImage,
            password: uuidv4()
          });
          console.log('New user created and JWT token generated');
        } catch (error) {
          console.error('Error creating user from OAuth data:', error.message);
          return res.redirect(`${FRONTEND_URL}/login?error=user_creation_failed`);
        }
      }

      // Generate JWT token
      const token = jwtService.generateToken(user);
      console.log('JWT token generated for existing user');

      // Redirect to frontend with token
      res.redirect(`${FRONTEND_URL}/oauth/callback?token=${token}`);
    } catch (error) {
      console.error('OAuth success error:', error);
      res.redirect(`${FRONTEND_URL}/login?error=auth_failed`);
    }
  },

  /**
   * OAuth failure handler
   * GET /api/oauth2/failure
   */
  oauthFailure(req, res) {
    console.error('OAuth authentication failure reported');
    res.redirect(`${FRONTEND_URL}/login?error=oauth_failure`);
  },

  /**
   * Handle Google OAuth callback
   * GET /login/oauth2/code/google
   */
  async handleGoogleCallback(req, res) {
    try {
      if (!req.user) {
        return res.redirect(`${FRONTEND_URL}/login?error=auth_failed`);
      }

      const email = req.user.email;
      if (!email) {
        return res.redirect(`${FRONTEND_URL}/login?error=email_missing`);
      }

      let user = await User.findOne({ where: { email } });

      if (!user) {
        return res.redirect(`${FRONTEND_URL}/login?error=user_not_found`);
      }

      const token = jwtService.generateToken(user);
      res.redirect(`${FRONTEND_URL}/oauth/callback?token=${token}`);
    } catch (error) {
      console.error('Google callback error:', error);
      res.redirect(`${FRONTEND_URL}/login?error=auth_failed`);
    }
  }
};

module.exports = oauthController;
