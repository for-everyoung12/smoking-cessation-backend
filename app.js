// app.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const swaggerUI = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger.config');

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


app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerSpec));
// Load models
const authRoutes = require('./routes/auth.routes');
app.use('/api/auth', authRoutes);
const userRoutes = require('./routes/user.routes');
app.use('/api/users', userRoutes);

const quitPlanRoutes = require('./routes/quitPlan.routes');
app.use('/api/quit-plans', quitPlanRoutes);

const quitPlanProgressRoutes = require('./routes/quitPlanProgress.routes');
app.use('/api/quit-plans', quitPlanProgressRoutes);

const quitStageRoutes = require('./routes/quitStage.routes');
app.use('/api/quit-plans', quitStageRoutes);

const smokingStatusRoutes = require('./routes/smokingStatus.routes');
app.use('/api/quit-plans', smokingStatusRoutes);

app.use('/api/smoking-status',smokingStatusRoutes)

// Membership routes
const membershipRoutes = require('./routes/membership.routes');
app.use('/api/memberships', membershipRoutes);

// User membership routes
const userMembershipRoutes = require('./routes/userMembership.routes');
app.use('/api/user-membership', userMembershipRoutes);

// Payment routes
const paymentRoutes = require('./routes/payment.routes');
app.use('/api/payments', paymentRoutes);

// Transaction routes
const transactionRoutes = require('./routes/transaction.routes'); 
app.use('/api/transactions', transactionRoutes);

//Badge routes
const badgeRoutes = require('./routes/badge.routes');
app.use('/api/badges', badgeRoutes);

require('./models/user.model');
require('./models/quitPlan.model');
require('./models/progressTracking.model');
require('./models/quitStage.model');
require('./models/membershipPackage.model');
require('./models/payment.model');
require('./models/transaction.model');
require('./models/userMembership.model');
require('./models/reminder.model');
require('./models/blog.model');
require('./models/notification.model');
require('./models/smokingStatus.model');
require('./models/feedback.model');
require('./models/badge.model');
require('./models/userBadge.model');
require('./models/communityMessage.model');
require('./models/chatSession.model');
require('./models/coachUser.model');
require('./models/coachMessage.model');
require('./models/progressTracking.model');




// Test route
app.get('/', (req, res) => {
  res.send('API server is running...');
});

module.exports = app;
