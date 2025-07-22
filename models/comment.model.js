const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  blog_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Blog',
    required: true,
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  parent_comment_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
    default: null, // null => comment gốc
  },
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  created_at: {
    type: Date,
    default: Date.now,
  },
});

// Gợi ý: Index để truy vấn phân cấp nhanh hơn
commentSchema.index({ blog_id: 1, parent_comment_id: 1, created_at: 1 });

const Comment = mongoose.model('Comment', commentSchema);
module.exports = Comment;
