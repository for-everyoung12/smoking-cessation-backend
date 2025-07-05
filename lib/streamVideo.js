const { StreamChat } = require("stream-chat");
const dotenv = require("dotenv");
dotenv.config();

const apiKey = process.env.STREAM_API_KEY;
const apiSecret = process.env.STREAM_API_SECRET;

if (!apiKey || !apiSecret) {
  throw new Error("STREAM_API_KEY or STREAM_API_SECRET is missing in .env");
}

const streamClient = StreamChat.getInstance(apiKey, apiSecret);

const upsertStreamUser = async (user) => {
  return await streamClient.upsertUsers([user]);
};

const generateStreamToken = (userId) => {
  return streamClient.createToken(userId.toString());
};

module.exports = {
  upsertStreamUser,
  generateStreamToken
};
