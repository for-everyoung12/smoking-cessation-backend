const mongoose = require('mongoose');

const communityMessageSchema = new mongoose.Schema({
  author_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  content: String,
  created_at: Date,
  type: String,
  parent_post_id: { type: mongoose.Schema.Types.ObjectId, ref: 'CommunityMessage' }
});

const communityMessage = mongoose.model('CommunityMessage', communityMessageSchema); 
module.exports = communityMessage;