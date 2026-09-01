import React from 'react';

const Accessibility = () => {
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
      `}</style>

      <h1>Accessibility Statement</h1>
      <p>Last updated: August 23, 2025</p>

      <p>
        <strong>Back2Campus</strong> is committed to providing a user-friendly experience to everyone, including people with disabilities.
      </p>

      <h2>Accessibility Practices</h2>
      <ul>
        <li>Keyboard-friendly navigation</li>
        <li>Clear fonts and color contrast</li>
        <li>Responsive design for all screen sizes</li>
      </ul>

      <h2>Compliance Goals</h2>
      <p>We aim to meet <strong>WCAG 2.1 AA</strong> accessibility standards for all pages and features.</p>

      <h2>Feedback</h2>
      <p>If you encounter any accessibility barriers, email us at <strong>accessibility@example.com</strong>.</p>
    </div>
  );
};

export default Accessibility;