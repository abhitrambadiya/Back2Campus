import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

export const sendContactEmail = async (firstName, lastName, email, message) => {
  const mailOptions = {
    from: `"Back2Campus" <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_USER, // Your receiving email address
    subject: `New message from ${firstName} ${lastName}`,
    text: `
      Name: ${firstName} ${lastName}
      Email: ${email}
      Message: ${message}
    `,
    html: `
      <div style="max-width: 600px; margin: auto; padding: 24px; background-color: #f9f9f9; font-family: 'Segoe UI', sans-serif; border-radius: 12px; box-shadow: 0 6px 16px rgba(0,0,0,0.1);">
        <div style="text-align: center; padding-bottom: 5px;">
          <h2 style="color: #2D3748;">New Contact Form Submission</h2>
        </div>

        <div style="background-color: #EDF2F7; padding: 20px; margin: 24px 0; border-radius: 8px;">
          <p style="font-size: 18px; color: #2B6CB0; font-weight: bold; margin: 0 0 10px;">Name:</p>
          <div style="font-size: 16px; color: #2D3748; margin-bottom: 16px;">${firstName} ${lastName}</div>

          <p style="font-size: 18px; color: #2B6CB0; font-weight: bold; margin: 0 0 10px;">Email:</p>
          <div style="font-size: 16px; color: #2D3748; margin-bottom: 16px;"><a href="mailto:${email}" style="color: #2D3748; text-decoration: none;">${email}</a></div>

          <p style="font-size: 18px; color: #2B6CB0; font-weight: bold; margin: 0 0 10px;">Message:</p>
          <div style="font-size: 16px; color: #2D3748; line-height: 1.6;">${message.replace(/\n/g, '<br>')}</div>
        </div>

        <hr style="margin: 32px 0; border: none; border-top: 1px solid #E2E8F0;" />

        <p style="font-size: 14px; color: #A0AEC0; text-align: center;">
          This message was sent via your contact form.
        </p>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};