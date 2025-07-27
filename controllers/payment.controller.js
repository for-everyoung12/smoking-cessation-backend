// controllers/paypal.controller.js
const axios = require("axios");
const paypalService = require("../services/payment.service");
const Payment = require("../models/payment.model");
const UserMembership = require("../models/userMembership.model");
const MembershipPackage = require("../models/membershipPackage.model");
const transactionService = require("../services/transaction.service");
const { calculateUpgradeCost } = require("../services/userMembership.service");

// Create PayPal order
exports.createPaypalOrder = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { package_id, return_url, cancel_url } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "User not authenticated" });
    }

    const pkg = await MembershipPackage.findById(package_id);
    if (!pkg) {
      return res.status(404).json({ message: "Membership package not found" });
    }

    const existingMembership = await UserMembership.findOne({
      user_id: userId,
      status: "active",
      expire_date: { $gte: new Date() },
    }).populate("package_id");

    if (
      existingMembership &&
      String(existingMembership.package_id._id) === package_id
    ) {
      return res.status(400).json({
        message: `You are currently using package \"${existingMembership.package_id.name}\", which is still active. Please wait for it to expire or upgrade to another package.`,
      });
    }

    let amountToPay = pkg.price;
    let upgradeMode = false;

    if (
      existingMembership &&
      String(existingMembership.package_id._id) !== package_id
    ) {
      const upgradeInfo = await calculateUpgradeCost(userId, package_id);
      amountToPay = upgradeInfo.upgradeCost;
      upgradeMode = true;
    }

    const existingPending = await Payment.findOne({
      user_id: userId,
      package_id,
      payment_method: "paypal",
      status: "pending",
    });

    if (existingPending) {
      try {
        const accessToken = await paypalService.getAccessToken();
        const response = await axios.get(
          `${process.env.PAYPAL_API}/v2/checkout/orders/${existingPending.transaction_id}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        const approveUrl = response.data.links.find((l) => l.rel === "approve")?.href;

        return res.status(200).json({
          message: "You already have a pending PayPal transaction. Please complete it.",
          approveUrl,
          orderId: existingPending.transaction_id,
        });
      } catch (err) {
        console.error("Failed to retrieve existing PayPal order", err);
        return res.status(500).json({ message: "Could not retrieve existing PayPal order" });
      }
    }

    const order = await paypalService.createOrder(
      amountToPay,
      "USD",
      return_url,
      cancel_url
    );
    const transactionId = order.id;

    await Payment.create({
      user_id: userId,
      package_id,
      payment_method: "paypal",
      amount: amountToPay,
      transaction_id: transactionId,
      status: "pending",
      note: upgradeMode ? "upgrade" : "new",
    });

    const approveUrl = order.links.find((l) => l.rel === "approve")?.href;
    res.json({ approveUrl, orderId: transactionId });
  } catch (err) {
    console.error("[PayPal Create Order Error]", err);
    res.status(500).json({ message: "Failed to create PayPal order" });
  }
};

// Capture PayPal order
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
      return res.status(400).json({ message: "Payment failed", details: captured });
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

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    // ❗ FIX 1: Nếu đã tạo membership cho payment này rồi thì không tạo nữa
    const existingMembership = await UserMembership.findOne({
      payment_id: payment._id,
    });

    if (existingMembership) {
      return res.json({
        message: "Membership already created",
        userMembership: existingMembership,
      });
    }

    // ❗ FIX 2: Chỉ expire những dòng còn hạn
    await UserMembership.updateMany(
      {
        user_id: userId,
        status: "active",
        expire_date: { $gte: new Date() },
      },
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
      `Purchased ${pkg.name} package`
    );

    res.json({ message: "Payment successful", userMembership });
  } catch (err) {
    console.error("[PayPal Capture Error]", err);
    res.status(500).json({ message: "Failed to capture payment" });
  }
};

// Cancel PayPal order
exports.cancelPaypalOrder = async (req, res) => {
  try {
    const { orderId } = req.body;

    const payment = await Payment.findOneAndUpdate(
      { transaction_id: orderId },
      { status: "cancelled" },
      { new: true }
    );

    if (!payment) {
      return res.status(404).json({ message: "Payment not found for cancellation" });
    }

    res.json({ message: "Order cancelled", payment });
  } catch (err) {
    console.error("[PayPal Cancel Error]", err);
    res.status(500).json({ message: "Failed to cancel payment" });
  }
};
