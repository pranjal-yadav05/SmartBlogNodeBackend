const express = require('express');
const router = express.Router();
const subscriberController = require('../controllers/subscriberController');

// Newsletter subscription routes
router.post('/subscribe', subscriberController.subscribe);
router.post('/unsubscribe', subscriberController.unsubscribe);
router.post('/send-test-newsletter', subscriberController.sendTestNewsletter);

module.exports = router;
