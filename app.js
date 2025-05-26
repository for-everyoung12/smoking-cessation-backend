// app.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Connect MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('MongoDB connected');
}).catch((err) => {
  console.error('MongoDB connection error:', err);
});

// Load models
require('./models/user.model');
require('./models/membershipPackage.model');
require('./models/payment.model');
require('./models/transaction.model');
require('./models/userMembership.model');
require('./models/reminder.model');
require('./models/blog.model');
require('./models/notification.model');
require('./models/smokingStatus.model');
require('./models/quitPlan.model');
require('./models/quitStage.model');
require('./models/feedback.model');
require('./models/badge.model');
require('./models/userBadge.model');
require('./models/communityMessage.model');
require('./models/chatSession.model');
require('./models/coachUser.model');
require('./models/coachMessage.model');
require('./models/progressTracking.model');


const authRoutes = require('./routes/auth.routes');
app.use('/api', authRoutes);


// Test route
app.get('/', (req, res) => {
  res.send('API server is running...');
});

module.exports = app;
