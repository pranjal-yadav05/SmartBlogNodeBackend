const { Subscriber, BlogPost, User } = require('../models');
const emailService = require('../services/emailService');

/**
 * Subscriber Controller - Matches Spring Boot SubscriberController
 */
const subscriberController = {
  /**
   * Subscribe to newsletter
   * POST /api/newsletter/subscribe
   */
  async subscribe(req, res) {
    try {
      const { email } = req.query;

      if (!email || email.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'Email is required'
        });
      }

      // Check if already subscribed
      const existingSubscriber = await Subscriber.findOne({ where: { email } });

      if (existingSubscriber) {
        // Reactivate if previously unsubscribed
        if (!existingSubscriber.active) {
          existingSubscriber.active = true;
          await existingSubscriber.save();
          
          // Send confirmation email
          await emailService.sendSubscriptionConfirmation(email);
          
          return res.status(200).json({
            success: true,
            message: 'Successfully subscribed to the newsletter'
          });
        }
        
        return res.status(409).json({
          success: false,
          message: 'Email is already subscribed'
        });
      }

      // Create new subscription
      await Subscriber.create({
        email,
        active: true,
        subscribedAt: new Date()
      });

      // Send confirmation email
      await emailService.sendSubscriptionConfirmation(email);

      res.status(200).json({
        success: true,
        message: 'Successfully subscribed to the newsletter'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  /**
   * Unsubscribe from newsletter
   * POST /api/newsletter/unsubscribe
   */
  async unsubscribe(req, res) {
    try {
      const { email } = req.query;

      if (!email || email.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'Email is required'
        });
      }

      const subscriber = await Subscriber.findOne({ where: { email } });

      if (!subscriber) {
        return res.status(404).json({
          success: false,
          message: 'Email is not subscribed'
        });
      }

      subscriber.active = false;
      await subscriber.save();

      res.status(200).json({
        success: true,
        message: 'Successfully unsubscribed from the newsletter'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  /**
   * Send test newsletter (admin only in production)
   * POST /api/newsletter/send-test-newsletter
   */
  async sendTestNewsletter(req, res) {
    try {
      // Get top 5 posts
      const topPosts = await BlogPost.findAll({
        include: [{
          model: User,
          as: 'author',
          attributes: ['id', 'name', 'email', 'profileImage']
        }],
        order: [['createdAt', 'DESC']],
        limit: 5
      });

      if (topPosts.length === 0) {
        return res.status(200).json({
          success: true,
          message: 'No posts to send in newsletter'
        });
      }

      // Get all active subscribers
      const activeSubscribers = await Subscriber.findAll({
        where: { active: true }
      });

      // Send newsletter to each subscriber
      for (const subscriber of activeSubscribers) {
        await emailService.sendWeeklyNewsletter(subscriber.email, topPosts);
        
        // Update last email sent timestamp
        subscriber.lastEmailSent = new Date();
        await subscriber.save();
      }

      res.status(200).json({
        success: true,
        message: 'Newsletter sent successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to send newsletter: ' + error.message
      });
    }
  }
};

module.exports = subscriberController;
