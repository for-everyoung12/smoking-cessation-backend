const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/user.model');
const sendEmail = require('../utils/sendmail');
const crypto = require('crypto');
const admin = require('../firebase/firebase-config');
const MembershipPackage = require('../models/membershipPackage.model');
const UserMembership = require('../models/userMembership.model');
const JWT_SECRET = process.env.JWT_SECRET;
const FRONTEND_URL = process.env.FRONTEND_URL;


// Giao diện email HTML
const generateVerificationEmail = (username, verificationUrl) => `
  <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:20px;border:1px solid #ddd;border-radius:10px;">
    <h2 style="color:#2e6da4;"> Welcome to MyApp!</h2>
    <p>Hello <strong>${username}</strong>,</p>
    <p>Thanks for signing up! Please verify your email by clicking the button below:</p>
    <a href="${verificationUrl}" style="display:inline-block;padding:10px 20px;background-color:#28a745;color:#fff;text-decoration:none;border-radius:5px;">Verify Email</a>
    <p>If the button doesn't work, paste this link into your browser:</p>
    <code style="background:#f1f1f1;padding:10px;display:block;border-radius:5px;">${verificationUrl}</code>
    <p>Regards,<br/>MyApp Team</p>
  </div>
`;

const generateResetEmail = (name, resetUrl) => `
  <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:20px;border:1px solid #ddd;border-radius:10px;">
    <h2 style="color:#d9534f;"> Reset Your Password</h2>
    <p>Hello <strong>${name}</strong>,</p>
    <p>We received a request to reset your password. Click below to continue:</p>
    <a href="${resetUrl}" style="display:inline-block;padding:10px 20px;background-color:#007bff;color:#fff;text-decoration:none;border-radius:5px;">Reset Password</a>
    <p>This link will expire in 1 hour. If you didn’t request a reset, ignore this email.</p>
    <p>Regards,<br/>MyApp Team</p>
  </div>
`;

// REGISTER
exports.register = async (req, res) => {
  try {
    const { username, email, password, full_name, birth_date, gender } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: 'Email already registered' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const emailToken = crypto.randomBytes(32).toString('hex');

    const user = new User({
      username,
      email,
      password: hashedPassword,
      full_name,
      birth_date,
      gender,
      role: 'member',
      emailVerificationToken: emailToken,
      isEmailVerified: false
    });

    await user.save();


    const defaultPackage = await MembershipPackage.findOne({ name: 'default' });
    if (defaultPackage) {
      await UserMembership.create({
        user_id: user._id,
        package_id: defaultPackage._id,
        status: 'active',
        payment_date: new Date(),
        expire_date: null
      });
    } else {
      console.warn('[REGISTER] Default membership package not found');
    }

    const verificationUrl = `${FRONTEND_URL}/verify-email?token=${emailToken}`;
    await sendEmail(email, 'Verify your email', generateVerificationEmail(username || email, verificationUrl));

    res.status(201).json({ message: 'Registered. Please check your email to verify.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Registration failed' });
  }
};

// VERIFY EMAIL
exports.verifyEmail = async (req, res) => {
  try {
    const user = await User.findOne({ emailVerificationToken: req.query.token });
    if (!user) return res.status(400).json({ error: 'Invalid or expired token' });

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    await user.save();

    res.json({ message: 'Email verified successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Email verification failed' });
  }
};

// LOGIN
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !user.isEmailVerified) {
      return res.status(400).json({ error: 'Invalid credentials or email not verified' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      {
        id: user._id,
        full_name: user.full_name,
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { password: _, ...userData } = user.toObject();

    res.json({
      message: 'Login successful',
      token,
      user: userData
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Login failed' });
  }
};


// LOGIN WITH GOOGLE
exports.loginWithGoogle = async (req, res) => {
  const { idToken } = req.body;
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const { email, name, picture } = decodedToken;

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        username: name.replace(/\s+/g, '').toLowerCase(),
        email,
        full_name: name,
        gender: 'other',
        role: 'member',
        isEmailVerified: true
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        full_name: user.full_name,
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { password: _, ...userData } = user.toObject();
    userData.profilePicture = picture || 'https://example.com/default-profile.png';

    res.json({
      message: 'Login successful',
      token,
      user: userData
    });

  } catch (error) {
    console.error('Error verifying Google ID Token:', error);
    res.status(401).json({ error: 'Invalid Google token' });
  }
};


// FORGOT PASSWORD
exports.forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = Date.now() + 3600000; // 1 hour
    await user.save();

    const resetUrl = `${FRONTEND_URL}/reset-password?token=${resetToken}`;
    await sendEmail(user.email, 'Reset your password', generateResetEmail(user.full_name || user.email, resetUrl));

    res.json({ message: 'Password reset link sent to your email.' });
  } catch (error) {
    res.status(500).json({ error: 'Forgot password failed' });
  }
};

// RESET PASSWORD
exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) return res.status(400).json({ error: 'Invalid or expired token' });

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Reset password failed' });
  }
};

// Mời coach qua email
exports.inviteCoach = async (req, res) => {
  try {
    const { full_name, email } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(409).json({ error: 'Email already exists' });

    const inviteToken = crypto.randomBytes(32).toString('hex');

    const newCoach = await User.create({
      full_name,
      email,
      role: 'coach',
      isEmailVerified: false,
      emailVerificationToken: inviteToken
    });

    const inviteUrl = `${FRONTEND_URL}/coach-invite/confirm?token=${inviteToken}`;
    const emailContent = `
      <div style="font-family:Arial,sans-serif;">
        <h2>You're invited to be a Coach!</h2>
        <p>Hello ${full_name || email},</p>
        <p>You have been invited to join as a coach on our platform. Click the link below to set your password and activate your account:</p>
        <a href="${inviteUrl}" style="background:#007bff;color:#fff;padding:10px 20px;border-radius:5px;text-decoration:none;">Accept Invitation</a>
        <p>Or copy this link to your browser:</p>
        <code>${inviteUrl}</code>
      </div>
    `;
    await sendEmail(email, 'Coach Invitation', emailContent);

    res.status(201).json({ message: 'Invitation sent to coach' });
  } catch (error) {
    console.error('[inviteCoach]', error);
    res.status(500).json({ error: 'Failed to invite coach' });
  }
};

exports.confirmCoachInvite = async (req, res) => {
  try {
    const { token, password } = req.body;

    const user = await User.findOne({ emailVerificationToken: token });
    if (!user || user.role !== 'coach') {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }

    user.password = await bcrypt.hash(password, 10);
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    await user.save();

    res.json({ message: 'Coach account activated successfully' });
  } catch (error) {
    console.error('[confirmCoachInvite]', error);
    res.status(500).json({ error: 'Failed to activate coach account' });
  }
};
