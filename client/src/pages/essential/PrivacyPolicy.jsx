import React from 'react';

const PrivacyPolicy = () => {
  return (
    <div className="policy-container">
      <style>{`
        .policy-container {
          max-width: 900px;
          margin: 40px auto;
          padding: 40px;
          background-color: #f5f5f5;
          border-radius: 12px;
          font-family: 'Segoe UI', sans-serif;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
          color: #212121;
        }
        h1 {
          color: #3949ab;
          font-size: 2.2rem;
          border-bottom: 3px solid #3f51b5;
          padding-bottom: 10px;
          margin-bottom: 20px;
        }
        h2 {
          color: #3f51b5;
          margin-top: 30px;
          font-size: 1.5rem;
        }
        p, li {
          font-size: 1.05rem;
          line-height: 1.7;
          color: #424242;
        }
        ul {
          margin-left: 20px;
          padding-left: 20px;
        }
      `}</style>

      <h1>Privacy Policy</h1>
      <p>Last updated: August 23, 2025</p>
      <p>
        At <strong>Back2Campus</strong>, your privacy is important to us. This Privacy Policy outlines how we collect, use, store, and protect your information.
      </p>

      <h2>Information We Collect</h2>
      <ul>
        <li>Name</li>
        <li>Email address</li>
        <li>Phone number</li>
        <li>Profession</li>
        <li>College credentials (PRN, course, batch, etc.)</li>
      </ul>

      <h2>How We Use Information</h2>
      <ul>
        <li>Mentorship and internship matching</li>
        <li>Alumni meet event participation</li>
        <li>Donations through Razorpay</li>
        <li>Platform communications and updates</li>
      </ul>

      <h2>Data Security</h2>
      <p>We store your data securely using MongoDB and follow industry best practices to ensure protection.</p>

      <h2>Contact</h2>
      <p>Questions? Email us at <strong>privacy@example.com</strong></p>
    </div>
  );
};

export default PrivacyPolicy;