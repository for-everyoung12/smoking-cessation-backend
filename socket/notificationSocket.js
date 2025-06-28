const Notification = require("../models/notification.model");

function setupNotificationSocket(io, socket) {
  socket.on("join", (userId) => {
    if (userId) {
      socket.join(userId);
      console.log(`[Socket] User ${userId} joined`);
    }
  });

  socket.on("sendNotification", async ({ userId, title, content }) => {
    const noti = await Notification.create({
      user_id: userId,
      title,
      content,
      sent_at: new Date(),
      type: "system",
      is_read: false
    });

    io.to(userId).emit("newNotification", noti);
  });
}

module.exports = setupNotificationSocket;
