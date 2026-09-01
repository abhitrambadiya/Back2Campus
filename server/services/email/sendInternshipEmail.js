import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Generate internship email template
export const generateInternshipEmailTemplate = (internship, formUrl) => {
  return `
    <div style="max-width: 600px; margin: auto; padding: 24px; background-color: #f9f9f9; font-family: 'Segoe UI', sans-serif; border-radius: 12px; box-shadow: 0 6px 16px rgba(0,0,0,0.1);">
      <div style="text-align: center; padding-bottom: 5px;">
        <h2 style="color: #2D3748;">Internship Program Update</h2>
      </div>

      <p style="font-size: 16px; color: #4A5568; line-height: 1.6;">
        Dear Student,
        <br/><br/>
        We hope this email finds you well. We are writing to inform you about an important update regarding the internship program. Your participation is valuable to us and we appreciate your prompt response.
      </p>

      <div style="background-color: #EDF2F7; padding: 20px; margin: 24px 0; border-radius: 8px;">
        <p style="font-size: 18px; color: #2B6CB0; font-weight: bold; margin: 0 0 16px;">internship Details:</p>
        
        <div style="margin-bottom: 12px;">
          <span style="font-size: 16px; color: #2B6CB0; font-weight: bold;">Title:</span>
          <span style="font-size: 16px; color: #2D3748; margin-left: 8px;">${internship.title}</span>
        </div>
        
        <div style="margin-bottom: 12px;">
          <span style="font-size: 16px; color: #2B6CB0; font-weight: bold;">Mentor:</span>
          <span style="font-size: 16px; color: #2D3748; margin-left: 8px;">${internship.alumniName}</span>
        </div>
        
        <div style="margin-bottom: 12px;">
          <span style="font-size: 16px; color: #2B6CB0; font-weight: bold;">Company:</span>
          <span style="font-size: 16px; color: #2D3748; margin-left: 8px;">${internship.company}</span>
        </div>
        
        <div style="margin-bottom: 12px;">
          <span style="font-size: 16px; color: #2B6CB0; font-weight: bold;">Date:</span>
          <span style="font-size: 16px; color: #2D3748; margin-left: 8px;">${internship.deadline}</span>
        </div>
        
        <div style="margin-bottom: 0;">
          <span style="font-size: 16px; color: #2B6CB0; font-weight: bold;">Mode:</span>
          <span style="font-size: 16px; color: #2D3748; margin-left: 8px;">${internship.mode}</span>
        </div>
      </div>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${formUrl}" 
           style="background-color: #3182CE; color: white; padding: 14px 28px; 
                  text-decoration: none; border-radius: 8px; display: inline-block;
                  font-weight: bold; font-size: 16px; box-shadow: 0 4px 12px rgba(49, 130, 206, 0.3);">
          Complete Form
        </a>
      </div>

      <p style="font-size: 15px; color: #718096; line-height: 1.6;">
        If you have any questions or concerns about this internship program, please don't hesitate to contact our support team.
      </p>

      <hr style="margin: 32px 0; border: none; border-top: 1px solid #E2E8F0;" />

      <p style="font-size: 14px; color: #A0AEC0; text-align: center;">
        Need help? Reach out to our support at <a href="mailto:info@example.in" style="color: #3182CE;">info@example.in</a>
        <br/><br/>
        © ${new Date().getFullYear()} Back2Campus. All rights reserved.
      </p>
    </div>
  `;
};

// Send internship emails to participants
export const sendInternshipEmails = async (recipients, internship, formUrl, customSubject = null) => {
  const subject = customSubject || `Important: ${internship.title} - Action Required`;
  const html = generateInternshipEmailTemplate(internship, formUrl);
  // Clean email addresses - remove quotes and trim whitespace
  const cleanRecipients = recipients.map(email => {
    let cleanEmail = email;
    if (typeof email === 'object' && email.email) {
      cleanEmail = email.email;
    }
    return cleanEmail.toString().replace(/['"`]/g, '').trim();
  });
  
  const text = `
    Dear Student,

    We hope this email finds you well. We are writing to inform you about an important update regarding the internship program "${internship.title}".

    Please take a moment to complete the following form: ${formUrl}

    Internship Details:
    - Title: ${internship.title}
    - Mentor: ${internship.fullName}
    - Company: ${internship.companyName}
    - Date: ${internship.date}
    - Mode: ${internship.mode}

    Your participation is important to us, and we appreciate your prompt response.

    If you have any questions or concerns about this internship program, please don't hesitate to contact our support team at info@example.in.

    Best regards,
    Team Back2Campus
  `;

  // Send emails to all participants
  const emailPromises = cleanRecipients.map(async (email) => {
    try {
      await transporter.sendMail({
        from: `"Back2Campus" <${process.env.EMAIL_USER}>`,
        to: email, // Now using cleaned email
        subject,
        html,
        text
      });
      return { email, status: 'sent' };
    } catch (error) {
      console.error(`Failed to send email to ${email}:`, error);
      return { email, status: 'failed', error: error.message };
    }
  });

  const results = await Promise.all(emailPromises);
  const successful = results.filter(r => r.status === 'sent').length;
  const failed = results.filter(r => r.status === 'failed').length;

  return {
    success: true,
    totalRecipients: recipients.length,
    successful,
    failed,
    results
  };
};
