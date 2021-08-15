const { sendEmail } = require("../utils/send-email");
const sendVerificationEmail = async ({ email, verificationToken, origin }) => {
  let message;
  if (origin) {
    const verifyUrl = `${origin}/account/verify-email?token=${verificationToken}`;
    message = `<p>Please click the below link to verify your email address:</p>
                   <p><a href="${verifyUrl}">${verifyUrl}</a></p>`;
  } else {
    message = `<p>Please use this api to verify your email address <code>/api/auth/verify-email/${verificationToken}</code> as PUT request:</p>`;
  }

  await sendEmail({
    to: email,
    subject: "Sign-up Verification API - Verify Email",
    html: `<h4>Verify Email</h4>
               <p>Thanks for registering!</p>
               ${message}`,
  });
};

module.exports = sendVerificationEmail;
