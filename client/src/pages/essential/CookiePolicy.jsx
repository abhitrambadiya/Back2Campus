import React from 'react';

const CookiePolicy = () => {
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

      <h1>Cookie Policy</h1>
      <p>Last updated: August 23, 2025</p>

      <p><strong>Back2Campus</strong> uses cookies to improve your browsing experience.</p>

      <h2>What Are Cookies?</h2>
      <p>Cookies are small files stored on your device to remember settings, preferences, and improve performance.</p>

      <h2>Why We Use Them</h2>
      <ul>
        <li>Keep you logged in</li>
        <li>Analyze site traffic and usage</li>
        <li>Enhance your user experience</li>
      </ul>

      <h2>Third-Party Cookies</h2>
      <p>We may use cookies from Razorpay and analytics tools to support transactions and track engagement.</p>

      <h2>Managing Cookies</h2>
      <p>You can manage cookie settings via your browser preferences. Disabling them may affect functionality.</p>

      <h2>Contact</h2>
      <p>Email <strong>cookies@example.com</strong> for cookie-related inquiries.</p>
    </div>
  );
};

export default CookiePolicy;