const http = require('http');
const express = require('express');
const app = require('./app');
const setupSocket = require("./socket");
const { setSocketIO } = require("./utils/notify"); // ✅ THÊM DÒNG NÀY

const server = http.createServer(app); 

const io = setupSocket(server); // ✅ LẤY socket instance
setSocketIO(io);                // ✅ GÁN vào utils để cron dùng được



require("./cron/index.js");
app.use(express.static('public'));

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`🚀 Server is running on port ${port}`);
});
