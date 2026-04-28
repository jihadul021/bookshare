const nodemailer = require('nodemailer');

const getTransporter = () => {
  const SMTP_HOST = process.env.SMTP_HOST?.trim();
  const SMTP_PORT = process.env.SMTP_PORT?.trim();
  const SMTP_USER = process.env.SMTP_USER?.trim();
  const SMTP_PASS = process.env.SMTP_PASS?.replace(/\s+/g, '');

  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    throw new Error('SMTP email settings are missing. Please set SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASS in server/.env');
  }

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS
    }
  });
};

const sendBookShareEmail = async ({ to, subject, html, text }) => {
  const transporter = getTransporter();
  const from = process.env.SMTP_FROM?.trim() || `"BookShare" <${process.env.SMTP_USER?.trim()}>`;

  await transporter.sendMail({
    from,
    to,
    subject,
    text,
    html
  });
};

module.exports = {
  sendBookShareEmail
};
