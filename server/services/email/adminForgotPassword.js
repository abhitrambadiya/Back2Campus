import nodemailer from 'nodemailer';

// Create a transporter object once, to be reused for all emails.
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async (options) => {
  const mailOptions = {
    from: `"Back2Campus" <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: "🔐 Your Secure OTP Code - Back2Campus Verification",
    text: `Your OTP code is ${options.otp}. It will expire in 5 minutes.`,
    html: options.html,
  };

  await transporter.sendMail(mailOptions);
};

export const sendForgotPasswordEmail = async (email, otp) => {
  const resetMessage = `
    <div style="max-width: 600px; margin: auto; padding: 24px; background-color: #f9f9f9; font-family: 'Segoe UI', sans-serif; border-radius: 12px; box-shadow: 0 6px 16px rgba(0,0,0,0.1);">
      <div style="text-align: center; padding-bottom: 15px;">
        <h2 style="color: #2D3748;">Your One-Time Password (OTP)</h2>
      </div>

      <p style="font-size: 16px; color: #4A5568; line-height: 1.6;">
        Hello,
        <br/><br/>
        To proceed with your verification on <strong>Back2Campus</strong>, please use the following OTP. This code is valid for the next <strong>5 minutes</strong> only.
      </p>

      <div style="background-color: #EDF2F7; padding: 20px; margin: 24px 0; text-align: center; border-radius: 8px;">
        <span style="font-size: 32px; color: #2B6CB0; font-weight: bold; letter-spacing: 4px;">${otp}</span>
      </div>

      <p style="font-size: 15px; color: #718096; line-height: 1.6;">
        If you didn’t request this code, you can safely ignore this email. Someone else might have typed your email by mistake.
      </p>

      <hr style="margin: 32px 0; border: none; border-top: 1px solid #E2E8F0;" />

      <p style="font-size: 14px; color: #A0AEC0; text-align: center;">
        Need help? Reach out to our support at <a href="mailto:info@example.in" style="color: #3182CE;">info@example.in</a>
        <br/><br/>
        © ${new Date().getFullYear()} Back2Campus. All rights reserved.
      </p>
    </div>
  `;

  await sendEmail({
    email: email,
    subject: 'Password Reset OTP',
    html: resetMessage,
  });
};