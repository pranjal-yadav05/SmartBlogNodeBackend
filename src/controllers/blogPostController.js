const { BlogPost, DraftPost, Comment, User } = require('../models');
const cloudinaryService = require('../services/cloudinaryService');
const openRouterService = require('../services/openRouterService');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

/**
 * Blog Post Controller - Matches Spring Boot BlogPostController
 */
const blogPostController = {
  /**
   * Get all posts
   * GET /api/posts/
   */
  async getAllPosts(req, res) {
    try {
      const posts = await BlogPost.findAll({
        include: [{
          model: User,
          as: 'author',
          attributes: ['id', 'name', 'email', 'profileImage']
        }],
        order: [['createdAt', 'DESC']]
      });
      res.status(200).json(posts);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  /**
   * Get all posts with pagination
   * GET /api/posts/paginated
   */
  async getAllPostsPaginated(req, res) {
    try {
      let { page = 0, size = 10, sortBy = 'createdAt', direction = 'desc' } = req.query;
      page = parseInt(page);
      size = parseInt(size);

      const order = [[sortBy, direction.toUpperCase()]];

      const { count, rows } = await BlogPost.findAndCountAll({
        include: [{
          model: User,
          as: 'author',
          attributes: ['id', 'name', 'email', 'profileImage']
        }],
        order,
        limit: size,
        offset: page * size
      });

      res.status(200).json({
        content: rows,
        currentPage: page,
        totalItems: count,
        totalPages: Math.ceil(count / size)
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  /**
   * Get category counts with search
   * GET /api/posts/categories/counts
   */
  async getCategoryCounts(req, res) {
    try {
      let { search, page = 0, size = 10 } = req.query;
      page = parseInt(page);
      size = parseInt(size);

      let whereClause = {};
      if (search && search.trim() !== '') {
        whereClause = {
          category: {
            [Op.like]: `%${search}%`
          }
        };
      }

      const categories = await BlogPost.findAll({
        attributes: [
          'category',
          [sequelize.fn('COUNT', sequelize.col('category')), 'count']
        ],
        where: whereClause,
        group: ['category'],
        limit: size,
        offset: page * size,
        raw: true
      });

      // Get total count for pagination
      const totalCategories = await BlogPost.findAll({
        attributes: [[sequelize.fn('DISTINCT', sequelize.col('category')), 'category']],
        where: whereClause,
        raw: true
      });

      const results = categories.map(c => ({
        name: c.category,
        count: parseInt(c.count)
      }));

      res.status(200).json({
        categories: results,
        currentPage: page,
        totalItems: totalCategories.length,
        totalPages: Math.ceil(totalCategories.length / size)
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  /**
   * Get posts by category with pagination
   * GET /api/posts/category/:category
   */
  async getPostsByCategory(req, res) {
    try {
      const { category } = req.params;
      let { page = 0, size = 10, sortBy = 'createdAt', direction = 'desc' } = req.query;
      page = parseInt(page);
      size = parseInt(size);

      const order = [[sortBy, direction.toUpperCase()]];

      const { count, rows } = await BlogPost.findAndCountAll({
        where: { category },
        include: [{
          model: User,
          as: 'author',
          attributes: ['id', 'name', 'email', 'profileImage']
        }],
        order,
        limit: size,
        offset: page * size
      });

      res.status(200).json({
        content: rows,
        currentPage: page,
        totalItems: count,
        totalPages: Math.ceil(count / size)
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  /**
   * Get post by ID
   * GET /api/posts/:id
   */
  async getPostById(req, res) {
    try {
      const { id } = req.params;
      const post = await BlogPost.findByPk(id, {
        include: [{
          model: User,
          as: 'author',
          attributes: ['id', 'name', 'email', 'profileImage']
        }]
      });

      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }

      res.status(200).json(post);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  /**
   * Increment post views
   * POST /api/posts/:id/view
   */
  async incrementViews(req, res) {
    try {
      const { id } = req.params;
      await BlogPost.increment('views', { where: { id } });
      res.status(200).send();
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  /**
   * Create post
   * POST /api/posts/create
   */
  async createPost(req, res) {
    try {
      const { title, content, category, authorEmail, published = 'true' } = req.body;

      if (!title || !content || !authorEmail) {
        return res.status(400).json('Missing required fields');
      }

      const user = await User.findOne({ where: { email: authorEmail } });
      if (!user) {
        return res.status(400).json('User not found: ' + authorEmail);
      }

      let imageUrl = null;
      if (req.file) {
        imageUrl = await cloudinaryService.uploadImage(req.file.buffer);
      }

      const isPublished = published === 'true' || published === true;

      if (isPublished) {
        const blogPost = await BlogPost.create({
          title,
          content,
          category,
          userId: user.id,
          imageUrl,
          published: true
        });

        const postWithAuthor = await BlogPost.findByPk(blogPost.id, {
          include: [{
            model: User,
            as: 'author',
            attributes: ['id', 'name', 'email', 'profileImage']
          }]
        });

        res.status(200).json(postWithAuthor);
      } else {
        const draftPost = await DraftPost.create({
          title,
          content,
          category,
          userId: user.id,
          imageUrl
        });

        const draftWithAuthor = await DraftPost.findByPk(draftPost.id, {
          include: [{
            model: User,
            as: 'author',
            attributes: ['id', 'name', 'email', 'profileImage']
          }]
        });

        res.status(200).json(draftWithAuthor);
      }
    } catch (error) {
      res.status(400).json('Failed to create post: ' + error.message);
    }
  },

  /**
   * Get AI suggestions for post
   * POST /api/posts/suggestions
   */
  async getAISuggestions(req, res) {
    try {
      const { title, content } = req.body;

      if (!title || !content) {
        return res.status(400).json('Missing required fields: title or content');
      }

      const suggestions = await openRouterService.getAISuggestions(title, content);

      res.status(200).json({ suggestions });
    } catch (error) {
      res.status(400).json('Failed to get suggestions: ' + error.message);
    }
  },

  /**
   * Update post
   * PUT /api/posts/:id
   */
  async updatePost(req, res) {
    try {
      const { id } = req.params;
      const userEmail = req.user.email;

      const post = await BlogPost.findByPk(id, {
        include: [{
          model: User,
          as: 'author',
          attributes: ['id', 'name', 'email', 'profileImage']
        }]
      });

      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }

      if (post.author.email !== userEmail) {
        return res.status(403).json('You can only update your own posts.');
      }

      // Handle both multipart and JSON requests
      let title, content, category;
      if (req.body.title) {
        title = req.body.title;
        content = req.body.content;
        category = req.body.category;
      } else {
        ({ title, content, category } = req.body);
      }

      let imageUrl = null;
      if (req.file) {
        // Delete old image if exists
        if (post.imageUrl) {
          await cloudinaryService.deleteImage(post.imageUrl);
        }
        imageUrl = await cloudinaryService.uploadImage(req.file.buffer);
      }

      post.title = title;
      post.content = content;
      post.category = category;
      if (imageUrl) {
        post.imageUrl = imageUrl;
      }

      await post.save();

      const updatedPost = await BlogPost.findByPk(id, {
        include: [{
          model: User,
          as: 'author',
          attributes: ['id', 'name', 'email', 'profileImage']
        }]
      });

      res.status(200).json(updatedPost);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  /**
   * Delete post
   * DELETE /api/posts/:id
   */
  async deletePost(req, res) {
    try {
      const { id } = req.params;
      const userEmail = req.user.email;

      console.log(req.user)
      

      const post = await BlogPost.findByPk(id, {
        include: [{
          model: User,
          as: 'author',
          attributes: ['id', 'name', 'email', 'profileImage']
        }]
      });
      console.log(post.author.email)

      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }

      if (post.author.email !== userEmail) {
        return res.status(403).json('You can only delete your own posts.');
      }

      // Delete image from Cloudinary
      if (post.imageUrl) {
         try {
          await cloudinaryService.deleteImage(post.imageUrl);
        } catch (err) {
          console.error('Cloudinary error:', err);
        }
      }

      await post.destroy();

      res.status(200).json('Post deleted successfully.');
    } catch (error) {
      console.error('DELETE POST FAILED:', error);
      res.status(500).json({ message: error.message });
    }
  },

  /**
   * Get user posts with pagination
   * GET /api/posts/user/:email/paginated
   */
  async getPostsByUser(req, res) {
    try {
      const { email } = req.params;
      let { page = 0, size = 10, sortBy = 'createdAt', direction = 'desc' } = req.query;
      page = parseInt(page);
      size = parseInt(size);

      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(200).json({
          content: [],
          currentPage: page,
          totalItems: 0,
          totalPages: 0
        });
      }

      const order = [[sortBy, direction.toUpperCase()]];

      const { count, rows } = await BlogPost.findAndCountAll({
        where: { userId: user.id },
        include: [{
          model: User,
          as: 'author',
          attributes: ['id', 'name', 'email', 'profileImage']
        }],
        order,
        limit: size,
        offset: page * size
      });

      res.status(200).json({
        content: rows,
        currentPage: page,
        totalItems: count,
        totalPages: Math.ceil(count / size)
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // ========== Draft Methods ==========

  /**
   * Get drafts by user
   * GET /api/posts/drafts/user/:email
   */
  async getDraftsByUser(req, res) {
    try {
      const { email } = req.params;

      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(200).json([]);
      }

      const drafts = await DraftPost.findAll({
        where: { userId: user.id },
        include: [{
          model: User,
          as: 'author',
          attributes: ['id', 'name', 'email', 'profileImage']
        }],
        order: [['createdAt', 'DESC']]
      });

      res.status(200).json(drafts);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  /**
   * Get draft by ID
   * GET /api/posts/drafts/:id
   */
  async getDraftById(req, res) {
    try {
      const { id } = req.params;
      const userEmail = req.user.email;

      const draft = await DraftPost.findByPk(id, {
        include: [{
          model: User,
          as: 'author',
          attributes: ['id', 'name', 'email', 'profileImage']
        }]
      });

      if (!draft) {
        return res.status(404).json({ message: 'Draft not found' });
      }

      if (draft.author.email !== userEmail) {
        return res.status(403).send();
      }

      res.status(200).json(draft);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  /**
   * Publish draft
   * POST /api/posts/drafts/:id/publish
   */
  async publishDraft(req, res) {
    try {
      const { id } = req.params;
      const userEmail = req.user.email;

      const draft = await DraftPost.findByPk(id, {
        include: [{
          model: User,
          as: 'author',
          attributes: ['id', 'name', 'email', 'profileImage']
        }]
      });

      if (!draft) {
        return res.status(404).json({ message: 'Draft not found' });
      }

      if (draft.author.email !== userEmail) {
        return res.status(403).json('You can only publish your own drafts.');
      }

      // Create blog post from draft
      const blogPost = await BlogPost.create({
        title: draft.title,
        content: draft.content,
        category: draft.category,
        userId: draft.userId,
        imageUrl: draft.imageUrl,
        createdAt: draft.createdAt,
        published: true
      });

      // Delete draft
      await draft.destroy();

      const postWithAuthor = await BlogPost.findByPk(blogPost.id, {
        include: [{
          model: User,
          as: 'author',
          attributes: ['id', 'name', 'email', 'profileImage']
        }]
      });

      res.status(200).json(postWithAuthor);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  /**
   * Delete draft
   * DELETE /api/posts/drafts/:id
   */
  async deleteDraft(req, res) {
    try {
      const { id } = req.params;
      const userEmail = req.user.email;

      const draft = await DraftPost.findByPk(id, {
        include: [{
          model: User,
          as: 'author',
          attributes: ['id', 'name', 'email', 'profileImage']
        }]
      });

      if (!draft) {
        return res.status(404).json({ message: 'Draft not found' });
      }

      if (draft.author.email !== userEmail) {
        return res.status(403).json('You can only delete your own drafts.');
      }

      // Delete image from Cloudinary
      if (draft.imageUrl) {
        await cloudinaryService.deleteImage(draft.imageUrl);
      }

      await draft.destroy();

      res.status(200).json('Draft deleted successfully.');
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  /**
   * Update draft
   * PUT /api/posts/drafts/:id
   */
  async updateDraft(req, res) {
    try {
      const { id } = req.params;
      const userEmail = req.user.email;

      const draft = await DraftPost.findByPk(id, {
        include: [{
          model: User,
          as: 'author',
          attributes: ['id', 'name', 'email', 'profileImage']
        }]
      });

      if (!draft) {
        return res.status(404).json({ message: 'Draft not found' });
      }

      if (draft.author.email !== userEmail) {
        return res.status(403).json('You can only update your own drafts.');
      }

      // Handle both multipart and JSON requests
      let title, content, category;
      if (req.body.title) {
        title = req.body.title;
        content = req.body.content;
        category = req.body.category;
      } else {
        ({ title, content, category } = req.body);
      }

      let imageUrl = null;
      if (req.file) {
        // Delete old image if exists
        if (draft.imageUrl) {
          await cloudinaryService.deleteImage(draft.imageUrl);
        }
        imageUrl = await cloudinaryService.uploadImage(req.file.buffer);
      }

      draft.title = title;
      draft.content = content;
      draft.category = category;
      if (imageUrl) {
        draft.imageUrl = imageUrl;
      }

      await draft.save();

      const updatedDraft = await DraftPost.findByPk(id, {
        include: [{
          model: User,
          as: 'author',
          attributes: ['id', 'name', 'email', 'profileImage']
        }]
      });

      res.status(200).json(updatedDraft);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // ========== Engagement Methods (Claps & Comments) ==========

  /**
   * Increment claps
   * POST /api/posts/:id/claps
   */
  async incrementClaps(req, res) {
    try {
      const { id } = req.params;
      const amount = parseInt(req.query.amount) || 1;

      await BlogPost.increment('claps', { by: amount, where: { id } });
      res.status(200).send();
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  /**
   * Add comment
   * POST /api/posts/:id/comments
   */
  async addComment(req, res) {
    try {
      const { id } = req.params;
      const userEmail = req.user.email;
      const { content } = req.body;

      if (!content || content.trim() === '') {
        return res.status(400).send();
      }

      const post = await BlogPost.findByPk(id);
      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }

      const user = await User.findOne({ where: { email: userEmail } });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const comment = await Comment.create({
        content,
        postId: id,
        userId: user.id
      });

      const commentWithAuthor = await Comment.findByPk(comment.id, {
        include: [{
          model: User,
          as: 'author',
          attributes: ['id', 'name', 'email', 'profileImage']
        }]
      });

      res.status(200).json(commentWithAuthor);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  /**
   * Get comments for post
   * GET /api/posts/:id/comments
   */
  async getComments(req, res) {
    try {
      const { id } = req.params;

      const comments = await Comment.findAll({
        where: { postId: id },
        include: [{
          model: User,
          as: 'author',
          attributes: ['id', 'name', 'email', 'profileImage']
        }],
        order: [['createdAt', 'DESC']]
      });

      res.status(200).json(comments);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
};

module.exports = blogPostController;
