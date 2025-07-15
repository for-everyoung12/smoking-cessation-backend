const http = require('http');
const express = require('express');
const app = require('./app');
const setupSocket = require("./socket");
const { setSocketIO } = require("./utils/notify");

const server = http.createServer(app); 

const io = setupSocket(server); 
setSocketIO(io);                



require("./cron/index.js");
app.use(express.static('public'));

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`🚀 Server is running on port ${port}`);
});
