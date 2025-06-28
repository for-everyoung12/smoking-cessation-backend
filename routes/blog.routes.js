const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blog.controller');
const authenticateToken = require('../middlewares/auth.middleware');

/**
 * @swagger
 * /blogs:
 *   post:
 *     summary: Create a new blog post
 *     tags: [Blogs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               shared_badges:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Blog created
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
 */
router.post('/blogs', authenticateToken, blogController.createBlog);

/**
 * @swagger
 * /blogs:
 *   get:
 *     summary: Get list of blogs
 *     tags: [Blogs]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of blogs
 *       500:
 *         description: Server error
 */
router.get('/blogs', blogController.getBlogs);

/**
 * @swagger
 * /blogs/{id}:
 *   get:
 *     summary: Get blog detail
 *     tags: [Blogs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Blog detail
 *       404:
 *         description: Blog not found
 *       500:
 *         description: Server error
 */
router.get('/blogs/:id', blogController.getBlogById);

/**
 * @swagger
 * /blogs/{id}:
 *   put:
 *     summary: Update a blog post
 *     tags: [Blogs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: Blog updated
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Blog not found
 *       500:
 *         description: Server error
 */
router.put('/blogs/:id', authenticateToken, blogController.updateBlog);

/**
 * @swagger
 * /blogs/{id}:
 *   delete:
 *     summary: Delete a blog post
 *     tags: [Blogs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Blog deleted
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Blog not found
 *       500:
 *         description: Server error
 */
router.delete('/blogs/:id', authenticateToken, blogController.deleteBlog);

/**
 * @swagger
 * /blogs/{id}/like:
 *   post:
 *     summary: Like a blog
 *     tags: [Blogs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Blog liked
 *       400:
 *         description: Already liked
 *       404:
 *         description: Blog not found
 *       500:
 *         description: Server error
 */
router.post('/blogs/:id/like', authenticateToken, blogController.likeBlog);

/**
 * @swagger
 * /blogs/{id}/unlike:
 *   post:
 *     summary: Unlike a blog
 *     tags: [Blogs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Blog unliked
 *       404:
 *         description: Blog not found
 *       500:
 *         description: Server error
 */
router.post('/blogs/:id/unlike', authenticateToken, blogController.unlikeBlog);

/**
 * @swagger
 * /blogs/{id}/share-badges:
 *   post:
 *     summary: Share badges in a blog
 *     tags: [Blogs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               shared_badges:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Badges shared successfully
 *       400:
 *         description: Validation error
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Blog not found
 *       500:
 *         description: Server error
 */
router.post('/blogs/:id/share-badges', authenticateToken, blogController.shareBadges);

module.exports = router;
