// socket/communityChat.js (refactored to use shared io)
const jwt = require('jsonwebtoken');
const CommunityMessage = require('../models/communityMessage.model');

module.exports = function(io) {
  const communityNamespace = io.of('/community');

  communityNamespace.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('No token provided'));

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) return next(new Error('Invalid token'));

      socket.userId = decoded.id;
      socket.full_name = decoded.full_name;
      next();
    });
  });

  communityNamespace.on('connection', (socket) => {
    console.log(`[COMMUNITY] Socket connected: ${socket.id}`);

    socket.join('community');

    socket.on('chat message', async (data) => {
      try {
        const savedMessage = await CommunityMessage.create({
          author_id: socket.userId,
          content: data.message,
          type: data.type || 'message',
          parent_post_id: data.parent_post_id || null
        });

        communityNamespace.to('community').emit('chat message', {
          _id: savedMessage._id,
          content: savedMessage.content,
          created_at: savedMessage.created_at,
          author_id: {
            _id: socket.userId,
            full_name: socket.full_name
          }
        });
      } catch (err) {
        console.error('[COMMUNITY] Failed to save message:', err);
      }
    });

    socket.on('disconnect', () => {
      console.log(`[COMMUNITY] Socket disconnected: ${socket.id}`);
    });
  });
};
