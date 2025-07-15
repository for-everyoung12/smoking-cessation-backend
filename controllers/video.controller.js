const { upsertStreamUser, generateStreamToken } = require("../lib/streamVideo");
const User = require("../models/user.model");
// const { generateJitsiJwt } = require("../lib/jitsiJwt");

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

const getJitsiRoomLink = async (req, res) => {
  const { coachId, memberId } = req.params;
  // Lấy 4 ký tự cuối, chỉ gồm chữ và số
  const shortCoach = String(coachId).replace(/[^a-zA-Z0-9]/g, '').slice(-4);
  const shortMember = String(memberId).replace(/[^a-zA-Z0-9]/g, '').slice(-4);
  const roomName = `c${shortCoach}m${shortMember}`.toLowerCase(); // không dấu cách, không viết hoa
  const roomUrl = `https://meet.jit.si/${roomName}`;
  res.json({ roomUrl });
};



module.exports = {
  createStreamUser,
  getStreamToken, 
  getJitsiRoomLink, // <-- thêm dòng này

};
