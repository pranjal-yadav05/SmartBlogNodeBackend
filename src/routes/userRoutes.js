const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public routes
router.post('/register', userController.register);
router.post('/login', userController.login);

// Routes with optional authentication for search
router.get('/', userController.getAllUsers);
router.get('/search', userController.searchUsers);
router.get('/by-initial/:initial', userController.findByInitial);

// Protected routes
router.get('/profile', userController.getProfile);
router.put('/profile', authenticate, upload.single('image'), userController.updateProfile);

module.exports = router;
