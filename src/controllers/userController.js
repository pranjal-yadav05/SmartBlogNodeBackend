const { User } = require('../models');
const jwtService = require('../services/jwtService');
const cloudinaryService = require('../services/cloudinaryService');
const emailService = require('../services/emailService');
const { Op } = require('sequelize');

/**
 * User Controller - Matches Spring Boot UserController
 */
const userController = {
  /**
   * Register new user
   * POST /api/users/register
   */
  async register(req, res) {
    try {
      const { email, password, name } = req.body;

      // Create user
      const user = await User.create({ email, password, name });

      // Send welcome email
      emailService.sendWelcomeEmail(user.email, user.name);

      // Return user without password
      res.status(200).json(user);
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json({ message: 'Email already exists' });
      }
      res.status(400).json({ message: error.message });
    }
  },

  /**
   * Login user
   * POST /api/users/login
   */
  async login(req, res) {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ where: { email } });

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Direct password comparison (matching Spring Boot behavior)
      if (user.password !== password) {
        return res.status(401).json({ message: 'Invalid password' });
      }

      // Generate JWT token
      const token = jwtService.generateToken(user);

      res.status(200).json({ token });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  /**
   * Get user profile from token
   * GET /api/users/profile
   */
  async getProfile(req, res) {
    try {
      console.log('======== inside getUserProfile --=========');
      
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Invalid or expired token' });
      }

      const token = authHeader.substring(7);
      const email = jwtService.extractEmail(token);
      console.log('email', email);

      const user = await User.findOne({ where: { email } });

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.status(200).json(user);
    } catch (error) {
      res.status(401).json({ message: 'Invalid or expired token' });
    }
  },

  /**
   * Update user profile
   * PUT /api/users/profile
   */
  async updateProfile(req, res) {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader.substring(7);
      const tokenEmail = jwtService.extractEmail(token);

      const { name, email, currentPassword, password: newPassword } = req.body;

      // Verify the email in token matches the email being updated
      if (tokenEmail !== email) {
        return res.status(403).json({ message: 'You can only update your own profile' });
      }

      const user = await User.findOne({ where: { email } });

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Handle password change
      if (newPassword && newPassword.trim() !== '') {
        const existingPassword = user.password;

        // Check if password looks like OAuth-generated UUID
        const looksLikeOauthGenerated = existingPassword && 
          existingPassword.length === 36 && 
          (existingPassword.match(/-/g) || []).length === 4;

        if (!looksLikeOauthGenerated) {
          // Regular local account: require current password
          if (!currentPassword || existingPassword !== currentPassword) {
            return res.status(400).json({ message: 'Current password is incorrect' });
          }
        }

        user.password = newPassword;
      }

      // Update name
      user.name = name;

      // Handle image upload
      if (req.file) {
        const imageUrl = await cloudinaryService.uploadImage(req.file.buffer);
        user.profileImage = imageUrl;
      }

      await user.save();

      res.status(200).json(user);
    } catch (error) {
      res.status(500).json({ message: 'Error updating profile: ' + error.message });
    }
  },

  /**
   * Get all users (with search)
   * GET /api/users
   */
  async getAllUsers(req, res) {
    try {
      const { search, page = 0, size = 10 } = req.query;

      // Require a search term to avoid returning all users
      if (!search || search.trim().length < 2) {
        return res.status(200).json([]);
      }

      const users = await User.findAll({
        where: {
          name: {
            [Op.like]: `%${search}%`
          }
        }
      });

      res.status(200).json(users);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  /**
   * Search users with pagination
   * GET /api/users/search
   */
  async searchUsers(req, res) {
    try {
      let { query, page = 0, size = 10, sortBy = 'name', direction = 'asc' } = req.query;

      page = parseInt(page);
      size = parseInt(size);

      // Return empty results if query is empty or too short
      if (!query || query.trim().length < 2) {
        return res.status(200).json({
          content: [],
          totalElements: 0,
          totalPages: 0,
          size,
          number: page,
          empty: true
        });
      }

      // Validate pagination
      if (page < 0) page = 0;
      if (size < 1 || size > 100) size = 10;

      const { count, rows } = await User.findAndCountAll({
        where: {
          [Op.or]: [
            { name: { [Op.like]: `%${query}%` } },
            { email: { [Op.like]: `%${query}%` } }
          ]
        },
        order: [[sortBy, direction.toUpperCase()]],
        limit: size,
        offset: page * size
      });

      res.status(200).json({
        content: rows,
        totalElements: count,
        totalPages: Math.ceil(count / size),
        size,
        number: page,
        empty: rows.length === 0
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  /**
   * Find users by initial letter
   * GET /api/users/by-initial/:initial
   */
  async findByInitial(req, res) {
    try {
      const { initial } = req.params;
      let { page = 0, size = 10 } = req.query;

      page = parseInt(page);
      size = parseInt(size);

      if (!initial) {
        return res.status(400).json({ message: 'Initial letter is required' });
      }

      const { count, rows } = await User.findAndCountAll({
        where: {
          name: {
            [Op.like]: `${initial}%`
          }
        },
        order: [['name', 'ASC']],
        limit: size,
        offset: page * size
      });

      res.status(200).json({
        content: rows,
        totalElements: count,
        totalPages: Math.ceil(count / size),
        size,
        number: page,
        empty: rows.length === 0
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
};

module.exports = userController;
