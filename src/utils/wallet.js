// Wallet Validation & Generator Utilities (Zero external dependency)
import crypto from 'crypto';

const BASE58_ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

function encodeBase58(buffer) {
  const digits = [0];
  for (let i = 0; i < buffer.length; i++) {
    for (let j = 0; j < digits.length; j++) digits[j] <<= 8;
    digits[0] += buffer[i];
    let carry = 0;
    for (let j = 0; j < digits.length; ++j) {
      digits[j] += carry;
      carry = (digits[j] / 58) | 0;
      digits[j] %= 58;
    }
    while (carry) {
      digits.push(carry % 58);
      carry = (carry / 58) | 0;
    }
  }
  for (let i = 0; buffer[i] === 0 && i < buffer.length - 1; i++) digits.push(0);
  return digits.reverse().map(digit => BASE58_ALPHABET[digit]).join('');
}

export const wallet = {
  isValidEvm(address) {
    return typeof address === 'string' && /^0x[a-fA-F0-9]{40}$/.test(address);
  },

  isValidSolana(address) {
    return typeof address === 'string' && /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
  },

  generateEvm() {
    // Generate valid random EVM address format
    const randomBytes = crypto.randomBytes(20);
    return '0x' + randomBytes.toString('hex');
  },

  generateSolana() {
    // Generate valid 32-byte Base58 Solana public key format
    const randomBytes = crypto.randomBytes(32);
    return encodeBase58(randomBytes);
  }
};
