const nodemailer = require('nodemailer');

const LOGO_URL = 'https://res.cloudinary.com/dupcvl7np/image/upload/v1742236573/logo-black_khkfxd.png';

// Create transporter with Gmail SMTP
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // Use TLS
  auth: {
    user: process.env.EMAIL,
    pass: process.env.APP_PASSWORD
  },
  tls: {
    rejectUnauthorized: false
  }
});

/**
 * Email Service - Matches Spring Boot EmailService
 */
const emailService = {
  /**
   * Send HTML email
   */
  async sendHtmlEmail(toEmail, subject, htmlBody) {
    try {
      await transporter.sendMail({
        from: process.env.EMAIL,
        to: toEmail,
        subject,
        html: htmlBody
      });
      console.log(`Email sent to ${toEmail}`);
    } catch (error) {
      console.error('Failed to send email:', error.message);
    }
  },

  /**
   * Send welcome email to new user
   * Matches EmailService.sendWelcomeEmail(String toEmail, String name)
   */
  async sendWelcomeEmail(toEmail, name) {
    const subject = '🎉 Welcome to SmartBlog!';
    const body = this.getWelcomeEmailContent(name);
    await this.sendHtmlEmail(toEmail, subject, body);
  },

  /**
   * Send subscription confirmation email
   * Matches EmailService.sendSubscriptionConfirmation(String toEmail)
   */
  async sendSubscriptionConfirmation(toEmail) {
    const subject = "✅ You're subscribed to SmartBlog Weekly!";
    const body = this.getSubscriptionConfirmationEmailContent();
    await this.sendHtmlEmail(toEmail, subject, body);
  },

  /**
   * Send weekly newsletter
   * Matches EmailService.sendWeeklyNewsletter(String toEmail, List<BlogPost> topPosts)
   */
  async sendWeeklyNewsletter(toEmail, topPosts) {
    const subject = "📚 This Week's Top 5 Posts from SmartBlog";
    const body = this.getWeeklyNewsletterContent(topPosts);
    await this.sendHtmlEmail(toEmail, subject, body);
  },

  /**
   * Get welcome email HTML content
   */
  getWelcomeEmailContent(name) {
    return `<div style='font-family: Arial, sans-serif; text-align: center; padding: 20px; background-color: #f4f4f4;'>
      <div style='max-width: 600px; margin: auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);'>
        <img src='${LOGO_URL}' alt='SmartBlog Logo' style='max-width: 180px; margin-bottom: 20px;' />
        <h2 style='color: #333;'>Welcome to <span style='color: #007bff;'>SmartBlog</span>, ${name}!</h2>
        <p style='color: #555; font-size: 16px;'>We're excited to have you on board. 🌟<br>
        Start sharing your thoughts, engaging with the community, and exploring amazing content.</p>
        <a href='https://smart-blog-one.vercel.app' style='display: inline-block; background-color: #007bff; color: white; 
        padding: 12px 25px; text-decoration: none; font-size: 16px; border-radius: 5px; margin-top: 20px;'>Start Writing</a>
        <p style='color: #777; font-size: 14px; margin-top: 20px;'>If you did not sign up for SmartBlog, please ignore this email or contact our support.</p>
        <hr style='border: none; border-top: 1px solid #ddd; margin: 20px 0;' />
        <p style='color: #999; font-size: 12px;'>Need help? Contact me at <a href='mailto:yadavpranjal2105@gmail.com' style='color: #007bff; text-decoration: none;'>dev support</a></p>
      </div>
    </div>`;
  },

  /**
   * Get subscription confirmation email HTML content
   */
  getSubscriptionConfirmationEmailContent() {
    return `<div style='font-family: Arial, sans-serif; text-align: center; padding: 20px; background-color: #f4f4f4;'>
      <div style='max-width: 600px; margin: auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);'>
        <img src='${LOGO_URL}' alt='SmartBlog Logo' style='max-width: 180px; margin-bottom: 20px;' />
        <h2 style='color: #333;'>You're Subscribed to <span style='color: #007bff;'>SmartBlog Weekly</span>!</h2>
        <p style='color: #555; font-size: 16px;'>Thank you for subscribing to our weekly newsletter. 🌟<br>
        Every week, we'll send you the top 5 most engaging posts from our community.</p>
        <p style='color: #555; font-size: 16px;'>Your first newsletter will arrive next week!</p>
        <a href='https://smart-blog-one.vercel.app' style='display: inline-block; background-color: #007bff; color: white; 
        padding: 12px 25px; text-decoration: none; font-size: 16px; border-radius: 5px; margin-top: 20px;'>Visit SmartBlog</a>
        <p style='color: #777; font-size: 14px; margin-top: 20px;'>If you did not subscribe to SmartBlog Weekly, 
        you can unsubscribe by clicking <a href='https://smart-blog-one.vercel.app/unsubscribe' style='color: #007bff; text-decoration: none;'>here</a>.</p>
        <hr style='border: none; border-top: 1px solid #ddd; margin: 20px 0;' />
        <p style='color: #999; font-size: 12px;'>Need help? Contact me at <a href='mailto:yadavpranjal2105@gmail.com' style='color: #007bff; text-decoration: none;'>dev support</a></p>
      </div>
    </div>`;
  },

  /**
   * Get weekly newsletter HTML content
   */
  getWeeklyNewsletterContent(topPosts) {
    const formatDate = (date) => {
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(date).toLocaleDateString('en-US', options);
    };

    let postsHtml = '';

    const postsToShow = topPosts.slice(0, 5);
    for (const post of postsToShow) {
      const formattedDate = formatDate(post.createdAt);
      const excerpt = post.content && post.content.length > 150 
        ? post.content.substring(0, 150) + '...' 
        : (post.content || '');

      postsHtml += `<div style='margin-bottom: 25px; border-bottom: 1px solid #eee; padding-bottom: 20px;'>`;
      
      // Post title with link
      postsHtml += `<h3 style='margin-bottom: 10px;'><a href='https://smart-blog-one.vercel.app/blog/${post.id}' style='color: #0066cc; text-decoration: none;'>${post.title}</a></h3>`;
      
      // Post image if available
      if (post.imageUrl) {
        postsHtml += `<img src='${post.imageUrl}' alt='${post.title}' style='width: 100%; max-height: 200px; object-fit: cover; border-radius: 5px; margin-bottom: 15px;' />`;
      }
      
      // Post excerpt
      postsHtml += `<p style='color: #444; margin-bottom: 10px;'>${excerpt}</p>`;
      
      // Author and date
      const authorName = post.author ? post.author.name : 'Unknown';
      postsHtml += `<p style='color: #777; font-size: 13px;'>By: ${authorName} • ${formattedDate}</p>`;
      
      // Read more link
      postsHtml += `<a href='https://smart-blog-one.vercel.app/blog/${post.id}' style='color: #0066cc; text-decoration: none; font-weight: bold;'>Read more →</a>`;
      
      postsHtml += `</div>`;
    }

    return `<div style='font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;'>
      <div style='max-width: 600px; margin: auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);'>
        <div style='text-align: center; margin-bottom: 20px;'>
          <img src='${LOGO_URL}' alt='SmartBlog Logo' style='max-width: 180px;' />
        </div>
        <h1 style='color: #333; text-align: center; margin-bottom: 30px;'>This Week's Top Posts</h1>
        ${postsHtml}
        <div style='background-color: #f9f9f9; padding: 20px; border-radius: 5px; margin-top: 30px;'>
          <h3 style='color: #333; margin-top: 0;'>Want to contribute?</h3>
          <p style='color: #555;'>Share your knowledge and insights with our growing community!</p>
          <a href='https://smart-blog-one.vercel.app/create' style='display: inline-block; background-color: #007bff; color: white; 
          padding: 10px 20px; text-decoration: none; font-size: 16px; border-radius: 5px; margin-top: 10px;'>Write a Post</a>
        </div>
        <hr style='border: none; border-top: 1px solid #ddd; margin: 30px 0 20px;' />
        <p style='color: #777; font-size: 14px; text-align: center;'>
          You're receiving this email because you subscribed to SmartBlog Weekly. 
          <a href='https://smart-blog-one.vercel.app/unsubscribe' style='color: #007bff; text-decoration: none;'>Unsubscribe</a>
        </p>
        <p style='color: #999; font-size: 12px; text-align: center;'>
          © 2024 SmartBlog • <a href='mailto:yadavpranjal2105@gmail.com' style='color: #007bff; text-decoration: none;'>Contact</a>
        </p>
      </div>
    </div>`;
  }
};

module.exports = emailService;
