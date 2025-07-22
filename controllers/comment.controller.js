const Comment = require('../models/comment.model');

// Tạo bình luận hoặc reply
exports.createComment = async (req, res) => {
  try {
    const { content, parent_comment_id = null } = req.body;
    const blog_id = req.params.id;

    if (!content) return res.status(400).json({ message: 'Content is required' });

    const comment = new Comment({
      blog_id,
      user_id: req.user.id,
      content,
      parent_comment_id
    });

    await comment.save();
    res.status(201).json({ message: 'Comment added', comment });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Trả về toàn bộ comment + reply theo blog_id, phân cấp luôn
exports.getCommentsByBlog = async (req, res) => {
  try {
    const blog_id = req.params.id;

    // 1. Lấy tất cả comment của blog đó
    const allComments = await Comment.find({ blog_id })
      .sort({ created_at: 1 })
      .populate('user_id', 'full_name');

    // 2. Group phân cấp theo parent_comment_id
    const commentMap = {};
    const rootComments = [];

    allComments.forEach(cmt => {
      commentMap[cmt._id] = { ...cmt._doc, replies: [] };
    });

    allComments.forEach(cmt => {
      if (cmt.parent_comment_id) {
        const parent = commentMap[cmt.parent_comment_id];
        if (parent) {
          parent.replies.push(commentMap[cmt._id]);
        }
      } else {
        rootComments.push(commentMap[cmt._id]);
      }
    });

    res.json({
      total: allComments.length,
      comments: rootComments
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

// Unlike
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

// Update
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

// Delete
exports.deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    if (comment.user_id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Optional: Xoá cả replies nếu cần
    await Comment.deleteMany({
      $or: [
        { _id: comment._id },
        { parent_comment_id: comment._id }
      ]
    });

    res.json({ message: 'Comment and replies deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


exports.replyToComment = async (req, res) => {
  try {
    const { content } = req.body;
    const parent_comment_id = req.params.id;

    if (!content) return res.status(400).json({ message: "Content is required" });

    // Tìm comment cha để lấy blog_id
    const parentComment = await Comment.findById(parent_comment_id);
    if (!parentComment) {
      return res.status(404).json({ message: "Parent comment not found" });
    }

    const reply = new Comment({
      blog_id: parentComment.blog_id,
      user_id: req.user.id,
      content,
      parent_comment_id
    });

    await reply.save();

    res.status(201).json({ message: "Reply added", reply });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};