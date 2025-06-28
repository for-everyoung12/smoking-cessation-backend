const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const ChatSession = require('../models/chatSession.model');
const CoachUser = require('../models/coachUser.model');
const CoachMessage = require('../models/coachMessage.model');

const setupChatSession = (server) => {
  const io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('No token provided'));

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) return next(new Error('Invalid token'));

      socket.userId = decoded.id;
      socket.full_name = decoded.full_name;
      next();
    });
  });

  io.on('connection', (socket) => {
    console.log(`Chat coach socket connected: ${socket.id}`);

    socket.on('joinSession', (sessionId) => {
      socket.join(sessionId);
      console.log(`Socket ${socket.id} joined session ${sessionId}`);
    });

    socket.on('sendMessage', async ({ sessionId, content }) => {
      try {
        if (!content || !sessionId) {
          return socket.emit('errorMessage', 'Missing data');
        }

        const session = await ChatSession.findById(sessionId);
        if (!session) return socket.emit('errorMessage', 'Session not found');

        const validRelation = await CoachUser.findOne({
          user_id: session.user_id,
          coach_id: session.coach_id,
          status: 'active'
        });
        if (!validRelation) {
          return socket.emit('errorMessage', 'Invalid coach-user relation');
        }

        const msg = await CoachMessage.create({
          session_id: sessionId,
          user_id: socket.userId,
          content,
          sent_at: new Date(),
          is_read: false
        });

        await ChatSession.findByIdAndUpdate(sessionId, { last_active_at: new Date() });

        io.to(sessionId).emit('newMessage', {
          ...msg.toObject(),
          author: {
            _id: socket.userId,
            full_name: socket.full_name
          }
        });
      } catch (err) {
        console.error('[ChatCoach Socket Error]', err);
        socket.emit('errorMessage', 'Server error');
      }
    });

    socket.on('disconnect', () => {
      console.log(`Chat coach socket disconnected: ${socket.id}`);
    });
  });
};

module.exports = setupChatSession;
