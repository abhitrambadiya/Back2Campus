// Razorpay Configuration
// Using Razorpay's test credentials for demo purposes

export const RAZORPAY_CONFIG = {
  // Test Key ID (replace with your actual test key)
  keyId: 'rzp_test_1DP5mmOlF5G5ag', // This is a demo key - replace with your actual test key
  
  // Test Key Secret (replace with your actual test secret)
  keySecret: 'thisissecret', // This is a demo secret - replace with your actual test secret
  
  // Currency
  currency: 'INR',
  
  // Company details
  companyName: 'Back2Campus',
  companyDescription: 'Alumni Donation Portal',
  
  // Theme colors
  theme: {
    color: '#6366F1' // Indigo color matching the site theme
  }
};

// Razorpay options for different donation purposes
export const getRazorpayOptions = (amount, purpose, alumniName, alumniEmail) => {
  const purposeText = {
    infrastructure: 'Infrastructure Development',
    scholarship: 'Student Scholarships',
    research: 'Research & Innovation',
    library: 'Library Resources',
    sports: 'Sports Facilities',
    events: 'Alumni Events',
    general: 'General Fund'
  };

  return {
    key: RAZORPAY_CONFIG.keyId,
    amount: amount * 100, // Razorpay expects amount in paise
    currency: RAZORPAY_CONFIG.currency,
    name: RAZORPAY_CONFIG.companyName,
    description: `Donation for ${purposeText[purpose] || purpose}`,
    image: '/logo.png', // Add your college logo path
    order_id: '', // This will be set when order is created
    handler: function (response) {
      // This will be handled in the component
      console.log('Payment successful:', response);
    },
    prefill: {
      name: alumniName,
      email: alumniEmail,
      contact: '' // Add contact if available
    },
    notes: {
      purpose: purpose,
      alumni_email: alumniEmail,
      donation_type: 'alumni_donation'
    },
    theme: RAZORPAY_CONFIG.theme,
    modal: {
      ondismiss: function() {
        console.log('Payment modal closed');
      }
    }
  };
};

// Utility function to format amount for display
export const formatAmount = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0
  }).format(amount);
};

// Utility function to validate payment response
export const validatePaymentResponse = (response) => {
  // In a real application, you would verify the signature
  // For demo purposes, we'll just check if required fields exist
  return response && 
         response.razorpay_payment_id && 
         response.razorpay_order_id && 
         response.razorpay_signature;
};
