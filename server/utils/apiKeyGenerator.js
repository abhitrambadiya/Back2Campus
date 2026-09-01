// test.js
import crypto from 'crypto';

const generateAPIKey = () => {
  return crypto.randomBytes(32).toString('hex');
};

console.log('Main key:', generateAPIKey());