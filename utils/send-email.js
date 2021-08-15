const nodemailer = require("nodemailer");
require("dotenv").config();

exports.sendEmail = async ({ to, subject, html }) => {
  // Transporter
  const transport = nodemailer.createTransport({
    host: process.env.MAILTRAP_EMAIL_HOST,
    port: process.env.MAILTRAP_EMAIL_PORT,
    auth: {
      user: process.env.MAILTRAP_EMAIL_USERNAME,
      pass: process.env.MAILTRAP_EMAIL_PASSWORD,
    },
  });
  // 2 describing email options and actually sending them to the user
  await transport.sendMail({
    from: process.env.FROM,
    to,
    subject,
    // text: options.message,
    html,
  });
};
