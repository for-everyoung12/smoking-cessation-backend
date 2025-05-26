const admin = require('../firebase/firebase-config');

exports.loginWithGoogle = async (req, res) => {
  const { idToken } = req.body;

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const { uid, email, name, picture } = decodedToken;

    // Có thể thêm code tạo/sync user vào DB

    res.status(200).json({
      message: 'Login successful',
      user: { uid, email, name, picture }
    });
  } catch (error) {
    console.error('Error verifying Google ID Token:', error);
    res.status(401).json({ error: 'Invalid Google token' });
  }
};
