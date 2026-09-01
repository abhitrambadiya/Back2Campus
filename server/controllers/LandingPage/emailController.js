import Subscriber from '../../models/subscriberModel.js';
import { sendWelcomeEmail } from '../../services/email/welcomeSubscriber.js';

// Changed from exports.subscribe to named export
export const subscribe = async (req, res) => {
  try {
    const { email } = req.body;

    // Save to database
    const newSubscriber = await Subscriber.create({ email });

    // Send welcome email
    await sendWelcomeEmail(email);
    res.status(200).json({ 
      success: true,
      data: newSubscriber
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ 
        success: false,
        message: 'Email already subscribed'
      });
    }
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// Alternative if you prefer default export:
export default { subscribe };