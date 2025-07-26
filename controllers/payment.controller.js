// controllers/paypal.controller.js
const paypalService = require("../services/payment.service");
const Payment = require("../models/payment.model");
const UserMembership = require("../models/userMembership.model");
const MembershipPackage = require("../models/membershipPackage.model");
const transactionService = require("../services/transaction.service");
const { calculateUpgradeCost } = require("../services/userMembership.service");

exports.createPaypalOrder = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { package_id, return_url, cancel_url } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "User not authenticated" });
    }

    // 1. Kiểm tra tồn tại gói
    const pkg = await MembershipPackage.findById(package_id);
    if (!pkg) {
      return res.status(404).json({ message: "Membership package not found" });
    }

    // 2. Kiểm tra membership hiện tại
    const existingMembership = await UserMembership.findOne({
      user_id: userId,
      status: "active",
      expire_date: { $gte: new Date() }
    });

    let amountToPay = pkg.price;
    let upgradeMode = false;

    // 3. Nếu có gói đang active và là gói khác → xử lý upgrade
    if (existingMembership && String(existingMembership.package_id) !== String(package_id)) {
      const upgradeInfo = await calculateUpgradeCost(userId, package_id);
      amountToPay = upgradeInfo.upgradeCost;
      upgradeMode = true;
    }

    // 4. Kiểm tra đơn pending cho cùng gói
    const existingPending = await Payment.findOne({
      user_id: userId,
      package_id,
      payment_method: "paypal",
      status: "pending"
    });

    if (existingPending) {
      return res.status(400).json({
        message: "You already have a pending PayPal transaction for this package. Please complete or cancel it before creating a new one."
      });
    }

    // 5. Tạo đơn PayPal với giá trị đúng (full hoặc upgrade)
    const order = await paypalService.createOrder(
      amountToPay,
      "USD",
      return_url,
      cancel_url
    );
    const transactionId = order.id;

    // 6. Lưu Payment vào DB
    await Payment.create({
      user_id: userId,
      package_id,
      payment_method: "paypal",
      amount: amountToPay,
      transaction_id: transactionId,
      status: "pending",
      note: upgradeMode ? "upgrade" : "new"
    });

    const approveUrl = order.links.find((l) => l.rel === "approve")?.href;
    res.json({ approveUrl, orderId: transactionId });
  } catch (err) {
    console.error("[PayPal Create Order Error]", err);
    res.status(500).json({ message: "Failed to create PayPal order" });
  }
};


exports.capturePaypalOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { orderId } = req.body;

    const captured = await paypalService.captureOrder(orderId);
    const payerEmail = captured?.payer?.email_address || null;

    if (captured.status !== "COMPLETED") {
      await Payment.findOneAndUpdate(
        { transaction_id: orderId },
        {
          status: "failed",
          paypal_response: captured,
          payer_email: payerEmail,
        }
      );
      return res.status(400).json({ message: "Thanh toán thất bại", details: captured });
    }

    const payment = await Payment.findOneAndUpdate(
      { transaction_id: orderId },
      {
        status: "success",
        payment_date: new Date(),
        payer_email: payerEmail,
        paypal_response: captured,
      },
      { new: true }
    );

    if (!payment)
      return res.status(404).json({ message: "Không tìm thấy giao dịch" });

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

exports.cancelPaypalOrder = async (req, res) => {
  try {
    const { orderId } = req.body;

    const payment = await Payment.findOneAndUpdate(
      { transaction_id: orderId },
      { status: "cancelled" },
      { new: true }
    );

    if (!payment) {
      return res.status(404).json({ message: "Không tìm thấy đơn thanh toán để huỷ" });
    }

    res.json({ message: "Đơn đã bị huỷ", payment });
  } catch (err) {
    console.error("[PayPal Cancel Error]", err);
    res.status(500).json({ message: "Không thể cập nhật trạng thái cancel" });
  }
};
