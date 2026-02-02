const cron = require('node-cron');
const { Subscriber, BlogPost, User } = require('../models');
const emailService = require('./emailService');

/**
 * Newsletter Scheduler - Matches Spring Boot NewsletterScheduler
 */
const newsletterScheduler = {
  /**
   * Start the weekly newsletter scheduler
   * Runs every Sunday at 10:00 AM
   */
  start() {
    // Schedule: Every Sunday at 10:00 AM
    cron.schedule('0 10 * * 0', async () => {
      console.log('Running weekly newsletter job...');
      await this.sendWeeklyNewsletter();
    });
    
    console.log('Newsletter scheduler configured: Every Sunday at 10:00 AM');
  },

  /**
   * Send weekly newsletter to all active subscribers
   * Matches SubscriberService.sendWeeklyNewsletter()
   */
  async sendWeeklyNewsletter() {
    try {
      // Get top 5 posts of the week
      const topPosts = await this.getTopPostsOfTheWeek();
      
      if (topPosts.length === 0) {
        console.log('No posts to send in newsletter');
        return;
      }

      // Get all active subscribers
      const activeSubscribers = await Subscriber.findAll({
        where: { active: true }
      });

      console.log(`Sending newsletter to ${activeSubscribers.length} subscribers`);

      // Send newsletter to each subscriber
      for (const subscriber of activeSubscribers) {
        await emailService.sendWeeklyNewsletter(subscriber.email, topPosts);
        
        // Update last email sent timestamp
        subscriber.lastEmailSent = new Date();
        await subscriber.save();
      }

      console.log('Weekly newsletter sent successfully');
    } catch (error) {
      console.error('Failed to send weekly newsletter:', error);
    }
  },

  /**
   * Get top 5 posts from the past week
   * Matches SubscriberService.getTopPostsOfTheWeek()
   */
  async getTopPostsOfTheWeek() {
    try {
      const posts = await BlogPost.findAll({
        include: [{
          model: User,
          as: 'author',
          attributes: ['id', 'name', 'email', 'profileImage']
        }],
        order: [['createdAt', 'DESC']],
        limit: 5
      });

      return posts;
    } catch (error) {
      console.error('Failed to get top posts:', error);
      return [];
    }
  }
};

module.exports = newsletterScheduler;
