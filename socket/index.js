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

  io.on("connection", (socket) => {
    console.log("[Socket] Client connected");

    setupCommunityChat(io, socket);
    setupNotificationSocket(io, socket);
    setupChatSession(io, socket);
    socket.on("disconnect", () => {
      console.log("[Socket] Client disconnected");
    });
  });

  return io;
}

module.exports = setupSocket;
