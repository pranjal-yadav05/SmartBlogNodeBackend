const express = require('express');
const router = express.Router();
const blogPostController = require('../controllers/blogPostController');
const { authenticate, optionalAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');

// ========== Published Post Routes ==========

// Public routes
router.get('/', blogPostController.getAllPosts);
router.get('/paginated', blogPostController.getAllPostsPaginated);
router.get('/categories/counts', blogPostController.getCategoryCounts);
router.get('/category/:category', blogPostController.getPostsByCategory);
router.get('/user/:email/paginated', blogPostController.getPostsByUser);
router.get('/:id', blogPostController.getPostById);

// Views and engagement
router.post('/:id/view', blogPostController.incrementViews);
router.post('/:id/claps', blogPostController.incrementClaps);

// AI suggestions
router.post('/suggestions', blogPostController.getAISuggestions);

// Create post (public - author email in body)
router.post('/create', upload.single('image'), blogPostController.createPost);

// Protected routes
router.put('/:id', authenticate, upload.single('imageFile'), blogPostController.updatePost);
router.delete('/:id', authenticate, blogPostController.deletePost);

// Comments
router.get('/:id/comments', blogPostController.getComments);
router.post('/:id/comments', authenticate, blogPostController.addComment);

// ========== Draft Routes ==========

router.get('/drafts/user/:email', blogPostController.getDraftsByUser);
router.get('/drafts/:id', authenticate, blogPostController.getDraftById);
router.post('/drafts/:id/publish', authenticate, blogPostController.publishDraft);
router.put('/drafts/:id', authenticate, upload.single('imageFile'), blogPostController.updateDraft);
router.delete('/drafts/:id', authenticate, blogPostController.deleteDraft);

module.exports = router;
