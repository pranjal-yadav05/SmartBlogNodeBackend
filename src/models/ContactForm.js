const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ContactForm = sequelize.define('ContactForm', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'contact_form_entity',
  timestamps: false
});

module.exports = ContactForm;
