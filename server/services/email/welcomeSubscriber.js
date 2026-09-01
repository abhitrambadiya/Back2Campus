import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Configure transporter with your email service details
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

/**
 * Send welcome email to newly added alumni
 */
const sendWelcomeEmail = async (email) => {
  try {
    const mailOptions = {
      from: `"Back2Campus" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Welcome to Back2Campus!",
      html: `
        <div style="max-width: 600px; margin: auto; padding: 24px; background-color: #f9f9f9; font-family: 'Segoe UI', sans-serif; border-radius: 12px; box-shadow: 0 6px 16px rgba(0,0,0,0.1);">
  <div style="text-align: center; padding-bottom: 5px;">
    <h2 style="color: #2D3748;">Thank You for Subscribing!</h2>
  </div>

  <p style="font-size: 16px; color: #4A5568; line-height: 1.6;">
    Welcome to Back2Campus. We're excited to have you join our community.
    <br /><br />
    You'll now receive updates about alumni events, news, and opportunities.
  </p>

  <hr style="margin: 32px 0; border: none; border-top: 1px solid #E2E8F0;" />

  <p style="font-size: 14px; color: #A0AEC0; text-align: center;">
    Need help? Reach out to our support.
    <br /><br />
    © ${new Date().getFullYear()} Back2Campus. All rights reserved.
  </p>
</div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

export { sendWelcomeEmail };
