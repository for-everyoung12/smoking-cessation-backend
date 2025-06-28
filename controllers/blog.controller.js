const Blog = require('../models/blog.model');
const UserBadge = require('../models/userBadge.model');
const Comment = require('../models/comment.model');

// Tạo blog
exports.createBlog = async (req, res) => {
  try {
    const { title, content, shared_badges } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' });
    }

    let validBadges = [];
    if (shared_badges && shared_badges.length > 0) {
      validBadges = await UserBadge.find({
        _id: { $in: shared_badges },
        user_id: req.user.id
      });
    }

    const blog = new Blog({
      title,
      content,
      author_id: req.user.id,
      shared_badges: validBadges.map(b => b._id)
    });

    await blog.save();
    res.status(201).json({ message: 'Blog created', blog });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Lấy danh sách blog
exports.getBlogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const blogs = await Blog.find()
      .sort({ published_at: -1 })
      .skip(skip)
      .limit(limit)
      .populate('author_id', 'full_name') 
      .populate('shared_badges');

    const total = await Blog.countDocuments();

    res.json({
      total,
      page,
      pages: Math.ceil(total / limit),
      blogs
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Lấy chi tiết blog
exports.getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id)
      .populate('author_id', 'full_name')
      .populate('shared_badges');

    if (!blog) return res.status(404).json({ message: 'Blog not found' });

    const commentCount = await Comment.countDocuments({ blog_id: blog._id });

    res.json({
      blog,
      likeCount: blog.likes.length,
      commentCount
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Like blog
exports.likeBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: 'Blog not found' });

    if (blog.likes.includes(req.user.id)) {
      return res.status(400).json({ message: 'Already liked' });
    }

    blog.likes.push(req.user.id);
    await blog.save();
    res.json({ message: 'Blog liked', likeCount: blog.likes.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Unlike blog
exports.unlikeBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: 'Blog not found' });

    blog.likes = blog.likes.filter(uid => uid.toString() !== req.user.id.toString());
    await blog.save();
    res.json({ message: 'Blog unliked', likeCount: blog.likes.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update blog
exports.updateBlog = async (req, res) => {
  try {
    const { title, content } = req.body;
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: 'Blog not found' });

    if (blog.author_id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (title) blog.title = title;
    if (content) blog.content = content;

    await blog.save();
    res.json({ message: 'Blog updated', blog });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete blog
exports.deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: 'Blog not found' });

    if (blog.author_id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await blog.deleteOne();
    res.json({ message: 'Blog deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Share badge
exports.shareBadges = async (req, res) => {
  try {
    const { shared_badges } = req.body;
    if (!shared_badges || !Array.isArray(shared_badges)) {
      return res.status(400).json({ message: 'shared_badges must be an array' });
    }

    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: 'Blog not found' });

    if (blog.author_id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const validBadges = await UserBadge.find({
      _id: { $in: shared_badges },
      user_id: req.user.id
    });

    if (validBadges.length === 0) {
      return res.status(400).json({ message: 'No valid badges to share' });
    }

    const currentBadges = blog.shared_badges.map(b => b.toString());
    validBadges.forEach(b => {
      if (!currentBadges.includes(b._id.toString())) {
        blog.shared_badges.push(b._id);
      }
    });

    await blog.save();
    res.json({ message: 'Badges shared successfully', shared_badges: blog.shared_badges });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
