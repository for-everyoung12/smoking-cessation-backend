// server.js
const app = require('./app');
const http = require('http');
const setupCommunityChat = require('./socket/communityChat');

const server = http.createServer(app); 
setupCommunityChat(server);            

const port = process.env.PORT || 3000;

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
