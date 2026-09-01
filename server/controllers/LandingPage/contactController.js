import { sendContactEmail } from '../../services/email/contactForm.js';

export const submitContact = async (req, res) => {
  try {
    const { firstName, lastName, email, message } = req.body;

    // 2. Validate fields (more thorough example)
  const errors = [];
  if (!firstName?.trim()) errors.push('First name is required');
  if (!lastName?.trim()) errors.push('Last name is required');
  if (!email?.trim()) errors.push('Email is required');
  else if (!/^\S+@\S+\.\S+$/.test(email)) errors.push('Invalid email format');
  if (!message?.trim()) errors.push('Message is required');
  else if (message.trim().length < 10) errors.push('Message needs 10+ characters');

  if (errors.length > 0) {
    return res.status(400).json({ 
      success: false,
      message: 'Validation failed',
      errors 
    });
  }

    // Send email
    await sendContactEmail(firstName, lastName, email, message);

    res.status(200).json({
      success: true,
      message: 'Thanks for your message! We\'ll respond soon.'
    });

  } catch (error) {
    console.error('Email send error:', error);
    res.status(500).json({
      success: false,
      message: 'Message failed to send. Please try again later.'
    });
  }
};