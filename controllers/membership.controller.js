const service = require('../services/membership.service');

exports.create = async (req, res) => {
  try {
    const pkg = await service.create(req.body);
    res.status(201).json(pkg);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi tạo gói', error: err.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    const list = await service.getAll();
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi truy vấn' });
  }
};

exports.getById = async (req, res) => {
  try {
    const pkg = await service.getById(req.params.id);
    if (!pkg) return res.status(404).json({ message: 'Không tìm thấy' });
    res.json(pkg);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi truy vấn' });
  }
};

exports.update = async (req, res) => {
  try {
    const updated = await service.update(req.params.id, req.body);
    if (!updated) return res.status(404).json({ message: 'Không tìm thấy' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi cập nhật' });
  }
};

exports.remove = async (req, res) => {
  try {
    const removed = await service.remove(req.params.id);
    if (!removed) return res.status(404).json({ message: 'Không tìm thấy' });
    res.json({ message: 'Đã xoá gói' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi xoá' });
  }
};
