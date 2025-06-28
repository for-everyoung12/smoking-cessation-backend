// chatSession.js (updated to fetch full_name from DB)
const jwt = require('jsonwebtoken');
const ChatSession = require('../models/chatSession.model');
const CoachUser = require('../models/coachUser.model');
const CoachMessage = require('../models/coachMessage.model');
const User = require('../models/user.model');

module.exports = function(io) {
  const coachNamespace = io.of('/coach');

  coachNamespace.use(async (socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('No token provided'));

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;

      const user = await User.findById(decoded.id).select('full_name');
      socket.full_name = user?.full_name || 'NoName';

      next();
    } catch (err) {
      return next(new Error('Invalid token'));
    }
  });

  coachNamespace.on('connection', (socket) => {
    console.log(`[COACH] Socket connected: ${socket.id}`);

    socket.on('joinSession', (sessionId) => {
      socket.join(sessionId);
      console.log(`[COACH] Socket ${socket.id} joined session ${sessionId}`);
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

        coachNamespace.to(sessionId).emit('newMessage', {
          ...msg.toObject(),
          author: {
            _id: socket.userId,
            full_name: socket.full_name
          }
        });
      } catch (err) {
        console.error('[COACH] Socket error:', err);
        socket.emit('errorMessage', 'Server error');
      }
    });

    socket.on('disconnect', () => {
      console.log(`[COACH] Socket disconnected: ${socket.id}`);
    });
  });
};
