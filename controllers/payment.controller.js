// controllers/paypal.controller.js
const paypalService = require("../services/payment.service");
const Payment = require("../models/payment.model");
const UserMembership = require("../models/userMembership.model");
const MembershipPackage = require("../models/membershipPackage.model");
const transactionService = require("../services/transaction.service");

exports.createPaypalOrder = async (req, res) => {
  try {
    const userId = req.user._id;
    const { package_id } = req.body;

    const pkg = await MembershipPackage.findById(package_id);
    if (!pkg)
      return res.status(404).json({ message: "Không tìm thấy gói membership" });

    const order = await paypalService.createOrder(pkg.price);
    const transactionId = order.id;

    // Tạo bản ghi Payment với trạng thái pending
    await Payment.create({
      user_id: userId,
      package_id,
      payment_method: "paypal",
      amount: pkg.price,
      transaction_id: transactionId,
      status: "pending",
    });

    const approveUrl = order.links.find((l) => l.rel === "approve")?.href;
    res.json({ approveUrl, orderId: transactionId });
  } catch (err) {
    console.error("[PayPal Create Order Error]", err);
    res.status(500).json({ message: "Không tạo được đơn PayPal" });
  }
};

exports.capturePaypalOrder = async (req, res) => {
  try {
    const userId = req.user._id;
    const { orderId } = req.body;

    const captured = await paypalService.captureOrder(orderId);

    // Cập nhật Payment thành công
    const payment = await Payment.findOneAndUpdate(
      { transaction_id: orderId },
      { status: "success", payment_date: new Date() },
      { new: true }
    );

    if (!payment)
      return res.status(404).json({ message: "Không tìm thấy giao dịch" });

    // Hủy các membership cũ
    await UserMembership.updateMany(
      { user_id: userId, status: "active" },
      { $set: { status: "expired" } }
    );

    const pkg = await MembershipPackage.findById(payment.package_id);
    const expireDate = new Date();
    expireDate.setDate(expireDate.getDate() + pkg.duration_days);

    const userMembership = await UserMembership.create({
      user_id: userId,
      package_id: pkg._id,
      payment_id: payment._id,
      payment_date: new Date(),
      expire_date: expireDate,
      status: "active",
    });

    await transactionService.createTransaction(
      userId,
      pkg.price,
      "membership_payment",
      payment._id,
      `Mua gói ${pkg.name}`
    );

    res.json({ message: "Thanh toán thành công", userMembership });
  } catch (err) {
    console.error("[PayPal Capture Error]", err);
    res.status(500).json({ message: "Không xác nhận được thanh toán" });
  }
};
