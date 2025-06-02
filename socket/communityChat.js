// socket/communityChat.js
const { Server } = require('socket.io');
const CommunityMessage = require('../models/communityMessage.model');

function setupCommunityChat(server) {
  const io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    console.log(`[Socket] Guest connected`);

    socket.on('sendMessage', async (msg) => {
      if (!msg || typeof msg !== 'string') return;

      const savedMsg = await CommunityMessage.create({
        author_id: null,
        content: msg,
        type: 'message'
      });

      io.emit('newMessage', {
        _id: savedMsg._id,
        author_id: null,
        content: savedMsg.content,
        created_at: savedMsg.created_at
      });
    });

    socket.on('disconnect', () => {
      console.log(`[Socket] Guest disconnected`);
    });
  });

  return io; 
}

module.exports = setupCommunityChat;
