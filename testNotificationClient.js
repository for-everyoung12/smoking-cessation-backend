const { io } = require("socket.io-client");

const SOCKET_URL = "http://localhost:3000"; // 🔁 Đổi thành URL server backend của bạn
const TEST_USER_ID = "68483d979b8e424037015a49";      // 🔁 Đổi thành _id thực tế của người dùng

const socket = io(SOCKET_URL, {
  transports: ["websocket"],
  reconnection: false
});

socket.on("connect", () => {
  console.log("✅ Connected to socket server");

  // Tham gia room theo userId
  socket.emit("join", TEST_USER_ID);
  console.log(`🔔 Joined room: ${TEST_USER_ID}`);

  // Gửi notification thử
  const fakeNotification = {
    userId: TEST_USER_ID,
    title: "📢 Notification từ client test",
    content: "Đây là thông báo thử gửi qua Socket.IO",
    type: "reminder"
  };

  socket.emit("sendNotification", fakeNotification);
  console.log("📤 Notification sent:", fakeNotification);

  // Ngắt kết nối sau khi gửi
  setTimeout(() => {
    socket.disconnect();
    console.log("❌ Disconnected");
  }, 2000);
});

socket.on("connect_error", (err) => {
  console.error("❌ Socket connection error:", err.message);
});
