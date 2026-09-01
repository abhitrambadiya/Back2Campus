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
const sendWelcomeEmail = async (alumni, password) => {
  try {
    const mailOptions = {
      from: `"Back2Campus" <${process.env.EMAIL_USER}>`,
      to: alumni.email,
      subject: "🔐 Welcome, Alumni! Here are your login credentials.",
      html: `
        <div style="max-width: 600px; margin: auto; padding: 24px; background-color: #f9f9f9; font-family: 'Segoe UI', sans-serif; border-radius: 12px; box-shadow: 0 6px 16px rgba(0,0,0,0.1);">
      <div style="text-align: center; padding-bottom: 5px;">
        <h2 style="color: #2D3748;">Login Credentials</h2>
      </div>

      <p style="font-size: 16px; color: #4A5568; line-height: 1.6;">
        Hello ${alumni.fullName},
        <br/><br/>
        Your alumni account has been successfully created on <strong>Back2Campus</strong>. You can now log in using the credentials below. Please make sure to change your password after your first login for security purposes.
      </p>

      <div style="background-color: #EDF2F7; padding: 20px; margin: 24px 0; border-radius: 8px;">
        <p style="font-size: 18px; color: #2B6CB0; font-weight: bold; margin: 0 0 10px;">Email:</p>
        <div style="font-size: 16px; color: #2D3748; margin-bottom: 16px;">${alumni.email}</div>

        <p style="font-size: 18px; color: #2B6CB0; font-weight: bold; margin: 0 0 10px;">Password:</p>
        <div style="font-size: 16px; color: #2D3748;">${password}</div>
      </div>

      <p style="font-size: 15px; color: #718096; line-height: 1.6;">
        If you did not request this account, please ignore this email or contact us immediately.
      </p>

      <hr style="margin: 32px 0; border: none; border-top: 1px solid #E2E8F0;" />

      <p style="font-size: 14px; color: #A0AEC0; text-align: center;">
        Need help? Reach out to our support at <a href="mailto:info@example.in" style="color: #3182CE;">info@example.in</a>
        <br/><br/>
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
