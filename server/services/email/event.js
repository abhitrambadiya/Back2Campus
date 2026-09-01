import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// This private helper function sends the actual email
const sendEmail = async ({ to, subject, html }) => {
  try {
    const info = await transporter.sendMail({
      from: `"Back2Campus" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
  } catch (error) {
    console.error('[EMAIL_SERVICE_ERROR] Failed to send email:', error);
  }
};

/**
 * @desc    Sends the email to an alumnus whose event application was approved.
 */
export const sendEventApprovalEmail = async (alumnusEmail, alumnusName, eventDetails) => {
  const subject = `Congratulations! Your Application for "${eventDetails.name}" is Approved`;
  const html = `
    <div style="max-width: 600px; margin: auto; padding: 24px; background-color: #f9f9f9; font-family: 'Segoe UI', sans-serif; border-radius: 12px; box-shadow: 0 6px 16px rgba(0,0,0,0.1);">
      <div style="text-align: center; padding-bottom: 5px;">
        <h2 style="color: #2D3748;">Event Application Approved</h2>
      </div>

      <p style="font-size: 16px; color: #4A5568; line-height: 1.6;">
        Dear ${alumnusName},
        <br/><br/>
        Congratulations! We are thrilled to inform you that your application to be a speaker has been approved. We appreciate your willingness to share your expertise and experience with our community.
      </p>

      <div style="background-color: #EDF2F7; padding: 20px; margin: 24px 0; border-radius: 8px;">
        <p style="font-size: 18px; color: #2B6CB0; font-weight: bold; margin: 0 0 16px;">Event Details:</p>
        
        <div style="margin-bottom: 12px;">
          <span style="font-size: 16px; color: #2B6CB0; font-weight: bold;">Event Name:</span>
          <span style="font-size: 16px; color: #2D3748; margin-left: 8px;">${eventDetails.name}</span>
        </div>
        
        <div style="margin-bottom: 12px;">
          <span style="font-size: 16px; color: #2B6CB0; font-weight: bold;">Date:</span>
          <span style="font-size: 16px; color: #2D3748; margin-left: 8px;">${new Date(eventDetails.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
        </div>
        
        <div style="margin-bottom: 0;">
          <span style="font-size: 16px; color: #2B6CB0; font-weight: bold;">Time:</span>
          <span style="font-size: 16px; color: #2D3748; margin-left: 8px;">${eventDetails.time}</span>
        </div>
      </div>

      <div style="background-color: #E6FFFA; border-left: 4px solid #38B2AC; padding: 16px; margin: 24px 0; border-radius: 8px;">
        <p style="font-size: 16px; color: #2B6CB0; font-weight: bold; margin: 0 0 8px;">Next Steps:</p>
        <p style="font-size: 15px; color: #4A5568; margin: 0; line-height: 1.6;">
          Our team will contact you with more specific details about the event, including the agenda, technical requirements, and any additional information you may need to prepare for your session.
        </p>
      </div>

      <p style="font-size: 15px; color: #718096; line-height: 1.6;">
        Thank you for your contribution to the Back2Campus community. Your expertise and insights will be invaluable to our participants.
      </p>

      <hr style="margin: 32px 0; border: none; border-top: 1px solid #E2E8F0;" />

      <p style="font-size: 14px; color: #A0AEC0; text-align: center;">
        Need help? Reach out to our support at <a href="mailto:info@example.in" style="color: #3182CE;">info@example.in</a>
        <br/><br/>
        © ${new Date().getFullYear()} Back2Campus. All rights reserved.
      </p>
    </div>
  `;

  await sendEmail({ to: alumnusEmail, subject, html });
};
