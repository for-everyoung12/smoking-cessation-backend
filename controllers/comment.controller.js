const Comment = require("../models/comment.model");

// Tạo bình luận hoặc reply
exports.createComment = async (req, res) => {
  try {
    const { content, blog_id, parent_id = null } = req.body;
    // Support both blog_id from body and from URL params
    const blogId = blog_id || req.params.id;

    if (!content) {
      return res.status(400).json({
        success: false,
        error: "Content is required",
      });
    }

    if (!blogId) {
      return res.status(400).json({
        success: false,
        error: "Blog ID is required",
      });
    }

    const comment = new Comment({
      blog_id: blogId,
      user_id: req.user.id,
      content,
      parent_id,
    });

    await comment.save();

    // Populate user info for response
    await comment.populate("user_id", "full_name profilePicture");

    res.status(201).json({
      success: true,
      comment,
      message: "Comment created successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

// Trả về toàn bộ comment + reply theo blog_id, phân cấp luôn
exports.getCommentsByBlog = async (req, res) => {
  try {
    // Support both blogId from URL params and blog_id from body
    const blogId = req.params.blogId || req.params.id;

    if (!blogId) {
      return res.status(400).json({
        success: false,
        error: "Blog ID is required",
      });
    }

    // 1. Lấy tất cả comment của blog đó
    const allComments = await Comment.find({ blog_id: blogId })
      .sort({ createdAt: 1 })
      .populate("user_id", "full_name profilePicture");

    // 2. Group phân cấp theo parent_id
    const commentMap = {};
    const rootComments = [];

    allComments.forEach((cmt) => {
      commentMap[cmt._id] = {
        ...cmt.toObject(),
        replies: [],
        likeCount: cmt.likes ? cmt.likes.length : 0,
        isLiked: cmt.likes ? cmt.likes.includes(req.user?.id) : false,
      };
    });

    allComments.forEach((cmt) => {
      if (cmt.parent_id) {
        const parent = commentMap[cmt.parent_id];
        if (parent) {
          parent.replies.push(commentMap[cmt._id]);
        }
      } else {
        rootComments.push(commentMap[cmt._id]);
      }
    });

    res.json({
      success: true,
      comments: rootComments,
      total: allComments.length,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

// Reply to comment
exports.replyToComment = async (req, res) => {
  try {
    const { content } = req.body;
    const parentId = req.params.id;

    if (!content) {
      return res.status(400).json({
        success: false,
        error: "Content is required",
      });
    }

    // Check if parent comment exists
    const parentComment = await Comment.findById(parentId);
    if (!parentComment) {
      return res.status(404).json({
        success: false,
        error: "Parent comment not found",
      });
    }

    const reply = new Comment({
      blog_id: parentComment.blog_id,
      user_id: req.user.id,
      content,
      parent_id: parentId,
    });

    await reply.save();
    await reply.populate("user_id", "full_name profilePicture");

    res.status(201).json({
      success: true,
      comment: reply,
      message: "Reply created successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

// Like bình luận
exports.likeComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({
        success: false,
        error: "Comment not found",
      });
    }

    if (!comment.likes) {
      comment.likes = [];
    }

    if (comment.likes.includes(req.user.id)) {
      return res.status(400).json({
        success: false,
        error: "Already liked",
      });
    }

    comment.likes.push(req.user.id);
    await comment.save();

    res.json({
      success: true,
      message: "Comment liked",
      likeCount: comment.likes.length,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

// Unlike
exports.unlikeComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({
        success: false,
        error: "Comment not found",
      });
    }

    if (!comment.likes) {
      comment.likes = [];
    }

    comment.likes = comment.likes.filter(
      (uid) => uid.toString() !== req.user.id
    );
    await comment.save();

    res.json({
      success: true,
      message: "Comment unliked",
      likeCount: comment.likes.length,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

// Update
exports.updateComment = async (req, res) => {
  try {
    const { content } = req.body;
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        error: "Comment not found",
      });
    }

    // Check if user owns the comment or is admin
    if (
      comment.user_id.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        error: "Not authorized to update this comment",
      });
    }

    if (!content) {
      return res.status(400).json({
        success: false,
        error: "Content is required",
      });
    }

    comment.content = content;
    await comment.save();
    await comment.populate("user_id", "full_name profilePicture");

    res.json({
      success: true,
      comment,
      message: "Comment updated successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

// Delete
exports.deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        error: "Comment not found",
      });
    }

    // Check if user owns the comment or is admin
    if (
      comment.user_id.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        error: "Not authorized to delete this comment",
      });
    }

    await Comment.deleteOne({ _id: req.params.id });

    res.json({
      success: true,
      message: "Comment deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};
