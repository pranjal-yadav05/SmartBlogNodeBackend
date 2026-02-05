const express = require('express');
const router = express.Router();
const passport = require('passport');
const oauthController = require('../controllers/oauthController');

// Google OAuth routes (matching Spring Boot OAuth2 flow)

// Initiate Google OAuth
router.get('/oauth2/authorization/google', 
  passport.authenticate('google', { scope: ['email', 'profile'], session: false })
);

// Google OAuth callback
router.get('/login/oauth2/code/google',
  passport.authenticate('google', { 
    failureRedirect: '/api/oauth2/failure',
    session: false
  }),
  oauthController.oauthSuccess
);

// API OAuth routes
router.get('/api/oauth2/success', oauthController.oauthSuccess);
router.get('/api/oauth2/failure', oauthController.oauthFailure);
router.get('/api/oauth2/login/oauth2/code/google', oauthController.handleGoogleCallback);

module.exports = router;
