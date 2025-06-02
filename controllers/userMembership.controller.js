// controllers/userMembership.controller.js
const service = require('../services/userMembership.service');

exports.getCurrentMembership = async (req, res) => {
  try {
    const membership = await service.getCurrentMembership(req.user._id);
    if (!membership) return res.status(404).json({ message: 'Không có membership đang hoạt động' });
    res.json(membership);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi truy vấn membership', error: err.message });
  }
};

exports.getMyMembershipHistory = async (req, res) => {
  try {
    const history = await service.getMembershipsByUser(req.user._id);
    res.json(history);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi truy vấn lịch sử membership' });
  }
};

exports.getAllMemberships = async (req, res) => {
  try {
    const all = await service.getAllMemberships();
    res.json(all);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi truy vấn toàn bộ membership' });
  }
};
