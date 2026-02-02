require('dotenv').config();

const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const { sequelize } = require('./src/models');
const routes = require('./src/routes');
const errorHandler = require('./src/middleware/errorHandler');
const newsletterScheduler = require('./src/services/newsletterScheduler');

// Initialize passport configuration
require('./src/config/passport');

const app = express();
const PORT = process.env.PORT || 8080;

// CORS Configuration (matching Spring Boot)
const corsOptions = {
  origin: process.env.FRONTEND_URL,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Authorization', 'Content-Type', 'X-Auth-Token'],
  exposedHeaders: ['Authorization'],
  credentials: true,
  maxAge: 3600
};

app.use(cors(corsOptions));

// Handle OPTIONS preflight requests
app.options('*', cors(corsOptions));

// Parse JSON bodies
app.use(express.json());

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// Session configuration (for OAuth)
app.use(session({
  secret: process.env.SESSION_SECRET || 'smartblog-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// API Routes
app.use('/api', routes);

// OAuth routes (at root level for Spring Boot compatibility)
app.use('/', require('./src/routes/oauthRoutes'));

// Error handling middleware
app.use(errorHandler);

// Database connection and server startup
const startServer = async () => {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');

    // Sync models (without altering existing tables)
    await sequelize.sync({ alter: false });
    console.log('✅ Database models synchronized.');

    // Start newsletter scheduler
    newsletterScheduler.start();
    console.log('✅ Newsletter scheduler started.');

    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 SmartBlog Node.js Backend running on port ${PORT}`);
      console.log(`📍 API available at http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('❌ Unable to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
