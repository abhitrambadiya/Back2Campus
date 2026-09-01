import Razorpay from 'razorpay';
import crypto from 'crypto';

// Razorpay configuration
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_1DP5mmOlF5G5ag', // Demo key
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'thisissecret', // Demo secret
});

// Verify payment signature
export const verifyPaymentSignature = (razorpay_order_id, razorpay_payment_id, razorpay_signature) => {
  const body = razorpay_order_id + '|' + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'thisissecret')
    .update(body.toString())
    .digest('hex');

  return expectedSignature === razorpay_signature;
};

// Create Razorpay order
export const createOrder = async (amount, currency = 'INR', receipt = null) => {
  try {
    const options = {
      amount: amount, // Amount in paise
      currency: currency,
      receipt: receipt || `receipt_${Date.now()}`,
      notes: {
        source: 'alumni_donation_portal'
      }
    };

    const order = await razorpay.orders.create(options);
    return order;
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    throw error;
  }
};

// Fetch payment details
export const fetchPayment = async (paymentId) => {
  try {
    const payment = await razorpay.payments.fetch(paymentId);
    return payment;
  } catch (error) {
    console.error('Error fetching payment:', error);
    throw error;
  }
};

// Fetch order details
export const fetchOrder = async (orderId) => {
  try {
    const order = await razorpay.orders.fetch(orderId);
    return order;
  } catch (error) {
    console.error('Error fetching order:', error);
    throw error;
  }
};

export default razorpay;
