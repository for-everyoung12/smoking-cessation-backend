// cron/paymentCleaner.js
const Payment = require("../models/payment.model");

// Hàm thực thi cleanup các đơn pending quá lâu
async function cleanupPendingPayments() {
  const cutoff = new Date(Date.now() - 30 * 60 * 1000); // 30 phút trước

  const result = await Payment.updateMany(
    {
      status: "pending",
      createdAt: { $lte: cutoff }
    },
    {
      $set: {
        status: "failed",
        reason: "auto-timeout"
      }
    }
  );

  if (result.modifiedCount > 0) {
    console.log(`[CRON] Auto-failed ${result.modifiedCount} pending PayPal orders`);
  }
}

module.exports = cleanupPendingPayments;
