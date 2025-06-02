// cron/expireMemberships.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const UserMembership = require('../models/userMembership.model');

dotenv.config();

async function expireMemberships() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const now = new Date();

    const result = await UserMembership.updateMany(
      {
        expire_date: { $lte: now },
        status: 'active',
      },
      { $set: { status: 'expired' } }
    );

    console.log(`Đã hết hạn ${result.modifiedCount} gói membership`);
  } catch (err) {
    console.error('Lỗi khi cập nhật membership:', err);
  } finally {
    await mongoose.disconnect();
  }
}

expireMemberships();
