const { Server } = require("socket.io");
const setupCommunityChat = require('./communityChat');
const setupNotificationSocket = require('./notificationSocket');
const setupChatSession = require("./chatSession");
const { setSocketIO } = require('../utils/notify');

function setupSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  setSocketIO(io);

  // CHỈ GỌI 1 LẦN CHO IO
  setupCommunityChat(io);
  setupChatSession(io);

  // Còn thằng này thì vẫn cần socket riêng vì dùng .on()
  io.on("connection", (socket) => {
    console.log("[Socket] Client connected");

    setupNotificationSocket(io, socket);

    socket.on("disconnect", () => {
      console.log("[Socket] Client disconnected");
    });
  });

  return io;
}

module.exports = setupSocket;
