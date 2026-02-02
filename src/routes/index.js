const express = require('express');
const router = express.Router();

const userRoutes = require('./userRoutes');
const postRoutes = require('./postRoutes');
const contactRoutes = require('./contactRoutes');
const newsletterRoutes = require('./newsletterRoutes');
const debugController = require('../controllers/debugController');
const { optionalAuth } = require('../middleware/auth');

// Mount routes (matching Spring Boot @RequestMapping paths)
router.use('/users', userRoutes);
router.use('/posts', postRoutes);
router.use('/', contactRoutes);  // /api/contact
router.use('/newsletter', newsletterRoutes);

// Debug routes
router.get('/debug/auth-status', optionalAuth, debugController.getAuthStatus);
router.get('/debug/session-info', debugController.getSessionInfo);

module.exports = router;
