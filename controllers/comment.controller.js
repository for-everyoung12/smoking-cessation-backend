const Comment = require('../models/comment.model');

// Thêm bình luận mới
exports.createComment = async (req, res) => {
  try {
    const { content } = req.body;
    const blog_id = req.params.id;

    if (!content) return res.status(400).json({ message: 'Content is required' });

    const comment = new Comment({
      blog_id,
      user_id: req.user.id,
      content
    });

    await comment.save();
    res.status(201).json({ message: 'Comment added', comment });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Lấy danh sách bình luận theo blog
exports.getCommentsByBlog = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const blog_id = req.params.id;

    const comments = await Comment.find({ blog_id })
      .sort({ created_at: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('user_id', 'full_name');

    const total = await Comment.countDocuments({ blog_id });

    res.json({
      total,
      page,
      pages: Math.ceil(total / limit),
      comments
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Like bình luận
exports.likeComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    if (comment.likes.includes(req.user.id)) {
      return res.status(400).json({ message: 'Already liked' });
    }

    comment.likes.push(req.user.id);
    await comment.save();
    res.json({ message: 'Comment liked', likeCount: comment.likes.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Unlike bình luận
exports.unlikeComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    comment.likes = comment.likes.filter(uid => uid.toString() !== req.user.id);
    await comment.save();
    res.json({ message: 'Comment unliked', likeCount: comment.likes.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Cập nhật bình luận
exports.updateComment = async (req, res) => {
  try {
    const { content } = req.body;
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    if (comment.user_id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    comment.content = content;
    await comment.save();
    res.json({ message: 'Comment updated', comment });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Xoá bình luận
exports.deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    if (comment.user_id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await comment.deleteOne();
    res.json({ message: 'Comment deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
