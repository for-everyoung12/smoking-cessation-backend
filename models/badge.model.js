const mongoose = require('mongoose');

const badgeSchema = new mongoose.Schema({
  name: String,
  type: String,
  date: Date,
  description: String,
  condition: String,
  proOnly: {
    type: Boolean,
    default: false,
  }
});

const Badge = mongoose.model('Badge', badgeSchema);
module.exports = Badge;