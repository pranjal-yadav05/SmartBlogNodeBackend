const { Sequelize } = require('sequelize');
const mysql2 = require('mysql2');

// Parse database URL from Spring Boot format
const DATABASE_HOST = process.env.DATABASE_HOST;
const DATABASE_PORT = process.env.DATABASE_PORT || 3306;
const DATABASE_NAME = process.env.DATABASE_NAME;
const DATABASE_USERNAME = process.env.DATABASE_USERNAME;
const DATABASE_PASSWORD = process.env.DATABASE_PASSWORD;

// Serverless-optimized connection settings
const isServerless = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME;

const sequelize = new Sequelize(DATABASE_NAME, DATABASE_USERNAME, DATABASE_PASSWORD, {
  host: DATABASE_HOST,
  port: DATABASE_PORT,
  dialect: 'mysql',
  dialectModule: mysql2,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    },
    connectTimeout: 60000 // 60 seconds for cold starts
  },
  pool: isServerless ? {
    // Serverless: minimal pooling
    max: 2,
    min: 0,
    acquire: 60000,
    idle: 0,
    evict: 1000
  } : {
    // Local development: standard pooling
    max: parseInt(process.env.HIKARI_MAX_POOL_SIZE) || 10,
    min: 0,
    acquire: parseInt(process.env.HIKARI_CONNECTION_TIMEOUT) || 30000,
    idle: parseInt(process.env.HIKARI_IDLE_TIMEOUT) || 30000
  },
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  define: {
    timestamps: false, // We manage timestamps manually to match Spring Boot
    underscored: true  // Use snake_case for column names
  },
  // Retry logic for serverless
  retry: {
    max: 3  // Retry up to 3 times on connection errors
  }
});

module.exports = sequelize;
