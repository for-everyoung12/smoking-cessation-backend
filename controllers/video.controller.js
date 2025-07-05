const { upsertStreamUser, generateStreamToken } = require("../lib/streamVideo");
const User = require("../models/user.model");

const createStreamUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    await upsertStreamUser({
      id: user.id.toString(),
      name: user.full_name || user.username || "NoName",
      image: "" // nếu có avatar thì gắn vào
    });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Upsert user failed", details: err.message });
  }
};

const getStreamToken = (req, res) => {
  try {
    const token = generateStreamToken(req.user.id);
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: "Token generation failed", details: err.message });
  }
};

module.exports = {
  createStreamUser,
  getStreamToken
};
