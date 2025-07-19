const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  full_name: String,
  birth_date: Date,
  gender: String,
  avatar:  String ,
  role: { type: String, enum: ['member', 'coach', 'admin'] },
  created_at: { type: Date, default: Date.now },
  emailVerificationToken: String,
  isEmailVerified: { type: Boolean, default: false },
  resetPasswordToken: String,
  resetPasswordExpire: Date,

  max_users: {
    type: Number,
    default: 10,
  },
  current_users: {
    type: Number,
    default: 0
  }
});

const User = mongoose.model('User', userSchema);
module.exports = User;