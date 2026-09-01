import React from 'react';

const TermsOfService = () => {
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

      <h1>Terms of Service</h1>
      <p>Last updated: August 23, 2025</p>
      <p>By using <strong>Back2Campus</strong>, you agree to the following terms:</p>

      <h2>Eligibility</h2>
      <p>Only registered alumni, students, and authorized college staff may use this platform.</p>

      <h2>Platform Use</h2>
      <ul>
        <li>Do not impersonate others or misuse credentials</li>
        <li>Use the platform respectfully and legally</li>
        <li>Do not share confidential information without consent</li>
      </ul>

      <h2>Account Termination</h2>
      <p>Back2Campus may suspend or terminate accounts for violations or misuse of services.</p>

      <h2>Liability Disclaimer</h2>
      <p>We are not liable for outcomes of mentorships, donations, or events organized via the platform.</p>

      <h2>Contact</h2>
      <p>Reach us at <strong>legal@example.com</strong></p>
    </div>
  );
};

export default TermsOfService;