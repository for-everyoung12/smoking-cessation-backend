const express = require('express');
const app = require('./app');
const http = require('http');
const setupCommunityChat = require('./socket/communityChat');
const setupChatSession = require('./socket/chatSession');

const server = http.createServer(app);

app.use(express.static('public'));

// Setup community chat socket
setupCommunityChat(server);

// Setup chat session socket (PHẦN MỚI)
setupChatSession(server);

const port = process.env.PORT || 3000;

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
