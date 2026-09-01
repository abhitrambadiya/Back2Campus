import nodemailer from 'nodemailer';

// Configure email transporter
const createEmailTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Send email to registered alumni
export const sendEmailToRegisteredAlumni = async (meet, subject, message, googleFormLink = null) => {
  try {
    if (!subject || !message) {
      throw new Error('Subject and message are required');
    }

    if (meet.registeredAlumni.length === 0) {
      throw new Error('No alumni are registered for this event yet.');
    }

    // 1. Collect all recipient email addresses
    const recipients = meet.registeredAlumni.map(reg => reg.alumniId.email).filter(Boolean);

    if (recipients.length === 0) {
      throw new Error('No valid recipient email addresses found.');
    }

    // 2. Create the email transporter
    const transporter = createEmailTransporter();

    // 3. Construct the beautiful email HTML
    const emailHtml = `
      <div style="max-width: 600px; margin: auto; padding: 24px; background-color: #f9f9f9; font-family: 'Segoe UI', sans-serif; border-radius: 12px; box-shadow: 0 6px 16px rgba(0,0,0,0.1);">
        <div style="text-align: center; padding-bottom: 5px;">
          <h2 style="color: #2D3748;">Back2Campus Update</h2>
        </div>

        <p style="font-size: 16px; color: #4A5568; line-height: 1.6;">
          Dear Alumni,
          <br/><br/>
          We hope this message finds you well. We have an important update regarding your registered event.
        </p>

        <div style="background-color: #EDF2F7; padding: 20px; margin: 24px 0; border-radius: 8px;">
          <p style="font-size: 18px; color: #2B6CB0; font-weight: bold; margin: 0 0 16px;">Message:</p>
          <p style="font-size: 16px; color: #2D3748; line-height: 1.6; margin: 0;">
            ${message.replace(/\n/g, '<br/>')}
          </p>
        </div>

        ${googleFormLink ? `
        <div style="background-color: #E6FFFA; border-left: 4px solid #38B2AC; padding: 16px; margin: 24px 0; border-radius: 8px;">
          <p style="font-size: 16px; color: #2B6CB0; font-weight: bold; margin: 0 0 8px;">Event Link:</p>
          <p style="font-size: 15px; color: #4A5568; margin: 0; line-height: 1.6;">
            <a href="${googleFormLink}" style="color: #3182CE; text-decoration: none; font-weight: 500;">Click here to access the event</a>
          </p>
        </div>
        ` : ''}

        <p style="font-size: 15px; color: #718096; line-height: 1.6;">
          Thank you for being a valuable part of our alumni community. We look forward to your continued engagement.
        </p>

        <hr style="margin: 32px 0; border: none; border-top: 1px solid #E2E8F0;" />

        <p style="font-size: 14px; color: #A0AEC0; text-align: center;">
          Need help? Reach out to our support at <a href="mailto:${process.env.EMAIL_USER}" style="color: #3182CE;">${process.env.EMAIL_USER}</a>
          <br/><br/>
          © ${new Date().getFullYear()} Back2Campus. All rights reserved.
        </p>
      </div>
    `;

    // 4. Define email options, using BCC for privacy
    const mailOptions = {
      from: `"Back2Campus" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER, // The 'to' field is required, you can send it to yourself
      bcc: recipients, // Use BCC to send to all alumni privately
      subject: subject,
      html: emailHtml
    };

    // 5. Send the email
    await transporter.sendMail(mailOptions);
    
    return {
      success: true,
      message: `Email sent successfully to ${recipients.length} registered alumni.`,
      recipientCount: recipients.length
    };

  } catch (error) {
    console.error('ERROR SENDING EMAILS:', error);
    throw error;
  }
};

// Send test email
export const sendTestEmail = async (testEmail, subject = "Test Email", message = "This is a test email.") => {
  try {
    if (!testEmail) {
      throw new Error('Test email address is required');
    }

    const transporter = createEmailTransporter();
    
    const emailHtml = `
      <div style="max-width: 600px; margin: auto; padding: 24px; background-color: #f9f9f9; font-family: 'Segoe UI', sans-serif; border-radius: 12px; box-shadow: 0 6px 16px rgba(0,0,0,0.1);">
        <div style="text-align: center; padding-bottom: 5px;">
          <h2 style="color: #2D3748;">Test Email</h2>
        </div>

        <p style="font-size: 16px; color: #4A5568; line-height: 1.6;">
          Dear User,
          <br/><br/>
          This is a test email from the Alumni Meet system to verify your email configuration.
        </p>

        <div style="background-color: #EDF2F7; padding: 20px; margin: 24px 0; border-radius: 8px;">
          <p style="font-size: 18px; color: #2B6CB0; font-weight: bold; margin: 0 0 16px;">Test Message:</p>
          <p style="font-size: 16px; color: #2D3748; line-height: 1.6; margin: 0;">
            ${message.replace(/\n/g, '<br/>')}
          </p>
        </div>

        <div style="background-color: #E6FFFA; border-left: 4px solid #38B2AC; padding: 16px; margin: 24px 0; border-radius: 8px;">
          <p style="font-size: 16px; color: #2B6CB0; font-weight: bold; margin: 0 0 8px;">Status:</p>
          <p style="font-size: 15px; color: #4A5568; margin: 0; line-height: 1.6;">
            If you received this email, your email configuration is working correctly! ✅
          </p>
        </div>

        <p style="font-size: 15px; color: #718096; line-height: 1.6;">
          Your email system is properly configured and ready to send emails to alumni.
        </p>

        <hr style="margin: 32px 0; border: none; border-top: 1px solid #E2E8F0;" />

        <p style="font-size: 14px; color: #A0AEC0; text-align: center;">
          Need help? Reach out to our support at <a href="mailto:${process.env.EMAIL_USER}" style="color: #3182CE;">${process.env.EMAIL_USER}</a>
          <br/><br/>
          © ${new Date().getFullYear()} Back2Campus. All rights reserved.
        </p>
      </div>
    `;
    
    const mailOptions = {
      from: `"Back2Campus" <${process.env.EMAIL_USER}>`,
      to: testEmail,
      subject: subject,
      html: emailHtml
    };

    await transporter.sendMail(mailOptions);
    
    return {
      success: true,
      message: `Test email sent successfully to ${testEmail}`
    };

  } catch (error) {
    console.error('Error sending test email:', error);
    throw error;
  }
};

// Generic email sender function (for future use)
export const sendEmail = async (to, subject, htmlContent, options = {}) => {
  try {
    const transporter = createEmailTransporter();
    
    // Wrap custom HTML content in the beautiful design template
    const styledHtmlContent = `
      <div style="max-width: 600px; margin: auto; padding: 24px; background-color: #f9f9f9; font-family: 'Segoe UI', sans-serif; border-radius: 12px; box-shadow: 0 6px 16px rgba(0,0,0,0.1);">
        <div style="text-align: center; padding-bottom: 5px;">
          <h2 style="color: #2D3748;">Back2Campus</h2>
        </div>

        <div style="background-color: #ffffff; padding: 20px; margin: 24px 0; border-radius: 8px;">
          ${htmlContent}
        </div>

        <hr style="margin: 32px 0; border: none; border-top: 1px solid #E2E8F0;" />

        <p style="font-size: 14px; color: #A0AEC0; text-align: center;">
          Need help? Reach out to our support at <a href="mailto:${process.env.EMAIL_USER}" style="color: #3182CE;">${process.env.EMAIL_USER}</a>
          <br/><br/>
          © ${new Date().getFullYear()} Back2Campus. All rights reserved.
        </p>
      </div>
    `;
    
    const mailOptions = {
      from: `"Back2Campus" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html: styledHtmlContent,
      ...options // spread any additional options
    };

    await transporter.sendMail(mailOptions);
    
    return {
      success: true,
      message: `Email sent successfully to ${to}`
    };

  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};
