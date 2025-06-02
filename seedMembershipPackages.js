const mongoose = require('mongoose');
const MembershipPackage = require('./models/membershipPackage.model');

// Kết nối DB
mongoose.connect('mongodb://localhost:27017/nosmoking', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(async () => {
  console.log('Connected to MongoDB');

  // Dữ liệu mẫu
  const packages = [
    {
      name: 'default',
      description: 'Free basic access for new users',
      duration_days: null,
      price: 0,
      can_message_coach: false,
      can_assign_coach: false,
      can_use_quitplan: true,
      can_use_reminder: false,
      can_earn_special_badges: false,
    },
    {
      name: 'pro',
      description: 'Full access with coaching & reminders',
      duration_days: 30,
      price: 99000,
      can_message_coach: true,
      can_assign_coach: true,
      can_use_quitplan: true,
      can_use_reminder: true,
      can_earn_special_badges: true,
    }
  ];

  // Insert hoặc update
  for (const pack of packages) {
    await MembershipPackage.findOneAndUpdate(
      { name: pack.name },
      { $set: pack },
      { upsert: true }
    );
    console.log(`Seeded membership package: ${pack.name}`);
  }

  mongoose.disconnect();
})
.catch(err => {
  console.error('MongoDB connection error:', err);
});
