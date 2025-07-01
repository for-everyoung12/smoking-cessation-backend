const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

/**
 * Gửi email (dùng giao diện HTML)
 * @param {string} to - Email người nhận
 * @param {string} subject - Tiêu đề email
 * @param {string} html - Nội dung HTML
 */
const sendEmail = async (to, subject, html) => {
  try {
    await transporter.sendMail({
      from: `"MyApp Support" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html
    });
  } catch (error) {
    console.error(' Error sending email:', error);
    throw error;
  }
};

module.exports = sendEmail;
