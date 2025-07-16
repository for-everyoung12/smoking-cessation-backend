const Notification = require('../models/notification.model');
let io;

function setSocketIO(socketIOInstance) {
  io = socketIOInstance;
}

function getSocketIO() {
  if (!io) throw new Error('Socket.IO instance not set');
  return io;
}

async function sendNotification(userId, title, content, type = 'system') {
  if (!io) throw new Error('Socket.IO instance not set in notify.js');

  const noti = await Notification.create({
    user_id: userId,
    title,
    content,
    sent_at: new Date(),
    type,
    is_read: false
  });

  io.to(userId.toString()).emit('newNotification', noti);
}

module.exports = {
  sendNotification,
  setSocketIO,
  getSocketIO 
};
