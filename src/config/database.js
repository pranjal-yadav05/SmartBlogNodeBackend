const { Sequelize } = require('sequelize');

// Parse database URL from Spring Boot format
const DATABASE_HOST = process.env.DATABASE_HOST;
const DATABASE_PORT = process.env.DATABASE_PORT || 3306;
const DATABASE_NAME = process.env.DATABASE_NAME;
const DATABASE_USERNAME = process.env.DATABASE_USERNAME;
const DATABASE_PASSWORD = process.env.DATABASE_PASSWORD;

const sequelize = new Sequelize(DATABASE_NAME, DATABASE_USERNAME, DATABASE_PASSWORD, {
  host: DATABASE_HOST,
  port: DATABASE_PORT,
  dialect: 'mysql',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  },
  pool: {
    max: parseInt(process.env.HIKARI_MAX_POOL_SIZE) || 10,
    min: 0,
    acquire: parseInt(process.env.HIKARI_CONNECTION_TIMEOUT) || 30000,
    idle: parseInt(process.env.HIKARI_IDLE_TIMEOUT) || 30000
  },
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  define: {
    timestamps: false, // We manage timestamps manually to match Spring Boot
    underscored: true  // Use snake_case for column names
  }
});

module.exports = sequelize;
