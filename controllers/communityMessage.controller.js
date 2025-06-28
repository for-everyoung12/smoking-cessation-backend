const CommunityMessage = require('../models/communityMessage.model')

exports.getCommunityMessages = async (req, res) => {
  try {
    const messages = await CommunityMessage.find()
      .populate('author_id', 'full_name') 
      .sort({ created_at: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load messages' });
  }
};
