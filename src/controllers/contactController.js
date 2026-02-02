const { ContactForm } = require('../models');

/**
 * Contact Controller - Matches Spring Boot ContactController
 */
const contactController = {
  /**
   * Submit contact form
   * POST /api/contact
   */
  async submitContactForm(req, res) {
    try {
      const { name, email, message } = req.body;

      // Create contact form entry
      await ContactForm.create({
        name,
        email,
        message
      });

      res.status(200).send('Message received successfully from: ' + name);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
};

module.exports = contactController;
