const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const CommunityMessage = require('../models/communityMessage.model');

module.exports = function (server) {
  const io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('No token provided'));
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return next(new Error('Invalid token'));
      }

      socket.userId = decoded.id;
      socket.full_name = decoded.full_name;
      next();
    });
  });

  io.on('connection', (socket) => {
    socket.join('community');

    socket.on('chat message', async (data) => {
      try {
        const savedMessage = await CommunityMessage.create({
          author_id: socket.userId,
          content: data.message,
          type: data.type || 'message',
          parent_post_id: data.parent_post_id || null
        });

        io.to('community').emit('chat message', {
          fromUserId: socket.userId,
          full_name: socket.full_name,
          message: savedMessage.content,
          created_at: savedMessage.created_at,
          _id: savedMessage._id
        });

      } catch (err) {
        console.error('Failed to save message:', err);
      }
    });
  });
};
