const http = require('http');
const express = require('express');
const app = require('./app');
const { Server } = require('socket.io');

const setupCommunityChat = require('./socket/communityChat');
const setupChatSession = require('./socket/chatSession');

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

setupCommunityChat(io); // sẽ dùng io.of('/community')
setupChatSession(io);   // dùng io.of('/coach')

server.listen(3000, () => {
  console.log('Server is running on port 3000');
});
