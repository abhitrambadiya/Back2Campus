import Donation from '../../models/Donation.js';
import Alumni from '../../models/Alumni.js';
import { createOrder, verifyPaymentSignature, fetchPayment } from '../../config/razorpay.js';

// @desc    Create a new donation
// @route   POST /api/alumni/donations
// @access  Private (Alumni)
export const createDonation = async (req, res) => {
  try {
    const {
      amount,
      purpose,
      message,
      anonymous,
      paymentMethod
    } = req.body;

    // Validate required fields
    if (!amount || !purpose || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: 'Amount, purpose, and payment method are required'
      });
    }

    // Validate amount
    if (amount < 100) {
      return res.status(400).json({
        success: false,
        message: 'Minimum donation amount is ₹100'
      });
    }

    // Get alumni info from token (set by middleware)
    const alumniId = req.alumni.id;
    const alumni = await Alumni.findById(alumniId).select('fullName email companyName jobPosition');
    
    if (!alumni) {
      return res.status(404).json({
        success: false,
        message: 'Alumni not found'
      });
    }

    // Create donation record
    const donationData = {
      alumniName: alumni.fullName,
      alumniEmail: alumni.email,
      alumniCompany: alumni.companyName || '',
      alumniPosition: alumni.jobPosition || '',
      amount: parseInt(amount),
      purpose,
      message: message || '',
      anonymous: anonymous || false,
      paymentMethod,
      status: 'pending'
    };

    const donation = new Donation(donationData);
    await donation.save();

    res.status(201).json({
      success: true,
      message: 'Donation submitted successfully',
      data: {
        donationId: donation._id,
        amount: donation.amount,
        purpose: donation.purpose,
        status: donation.status,
        paymentMethod: donation.paymentMethod
      }
    });

  } catch (error) {
    console.error('Error creating donation:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// @desc    Get alumni's donation history
// @route   GET /api/alumni/donations
// @access  Private (Alumni)
export const getDonationHistory = async (req, res) => {
  try {
    const alumniId = req.alumni.id;
    const alumni = await Alumni.findById(alumniId).select('email');
    
    if (!alumni) {
      return res.status(404).json({
        success: false,
        message: 'Alumni not found'
      });
    }

    const donations = await Donation.find({ alumniEmail: alumni.email })
      .sort({ donationDate: -1 })
      .select('-__v');

    res.status(200).json({
      success: true,
      data: donations
    });

  } catch (error) {
    console.error('Error fetching donation history:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// @desc    Get donation statistics for public display
// @route   GET /api/alumni/donations/stats
// @access  Public
export const getDonationStats = async (req, res) => {
  try {
    const stats = await Donation.aggregate([
      {
        $match: { status: 'completed' }
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' },
          totalDonations: { $sum: 1 },
          averageAmount: { $avg: '$amount' }
        }
      }
    ]);

    const purposeStats = await Donation.aggregate([
      {
        $match: { status: 'completed' }
      },
      {
        $group: {
          _id: '$purpose',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      },
      {
        $sort: { totalAmount: -1 }
      }
    ]);

    const recentDonations = await Donation.find({ 
      status: 'completed',
      anonymous: false 
    })
    .sort({ donationDate: -1 })
    .limit(10)
    .select('alumniName amount purpose donationDate');

    res.status(200).json({
      success: true,
      data: {
        overall: stats[0] || { totalAmount: 0, totalDonations: 0, averageAmount: 0 },
        byPurpose: purposeStats,
        recent: recentDonations
      }
    });

  } catch (error) {
    console.error('Error fetching donation stats:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// @desc    Update donation status (for payment processing)
// @route   PUT /api/alumni/donations/:id/status
// @access  Private (Admin or Payment Gateway)
export const updateDonationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, paymentId, transactionId } = req.body;

    if (!status || !['pending', 'completed', 'failed', 'cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
    }

    const updateData = { status };
    if (paymentId) updateData.paymentId = paymentId;
    if (transactionId) updateData.transactionId = transactionId;
    if (status === 'completed') updateData.processedDate = new Date();

    const donation = await Donation.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Donation not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Donation status updated successfully',
      data: donation
    });

  } catch (error) {
    console.error('Error updating donation status:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// @desc    Create Razorpay order for donation
// @route   POST /api/alumni/donations/create-order
// @access  Private (Alumni)
export const createDonationOrder = async (req, res) => {
  try {
    const { amount, currency, donationId } = req.body;

    if (!amount || !donationId) {
      return res.status(400).json({
        success: false,
        message: 'Amount and donation ID are required'
      });
    }

    // Create Razorpay order
    const order = await createOrder(amount, currency, donationId);

    res.status(200).json({
      success: true,
      message: 'Order created successfully',
      data: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt
      }
    });

  } catch (error) {
    console.error('Error creating donation order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create payment order',
      error: error.message
    });
  }
};

// @desc    Verify payment and update donation status
// @route   POST /api/alumni/donations/verify-payment
// @access  Private (Alumni)
export const verifyDonationPayment = async (req, res) => {
  try {
    const { donationId, paymentId, orderId, signature } = req.body;

    if (!donationId || !paymentId || !orderId || !signature) {
      return res.status(400).json({
        success: false,
        message: 'All payment details are required'
      });
    }

    // Verify payment signature
    const isValidSignature = verifyPaymentSignature(orderId, paymentId, signature);
    
    if (!isValidSignature) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment signature'
      });
    }

    // Fetch payment details from Razorpay
    const payment = await fetchPayment(paymentId);
    
    if (!payment || payment.status !== 'captured') {
      return res.status(400).json({
        success: false,
        message: 'Payment not captured'
      });
    }

    // Update donation status
    const donation = await Donation.findByIdAndUpdate(
      donationId,
      {
        status: 'completed',
        paymentId: paymentId,
        transactionId: paymentId,
        processedDate: new Date()
      },
      { new: true, runValidators: true }
    );

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Donation not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Payment verified and donation completed successfully',
      data: {
        donationId: donation._id,
        status: donation.status,
        amount: donation.amount,
        paymentId: donation.paymentId
      }
    });

  } catch (error) {
    console.error('Error verifying donation payment:', error);
    res.status(500).json({
      success: false,
      message: 'Payment verification failed',
      error: error.message
    });
  }
};
