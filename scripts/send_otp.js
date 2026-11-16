// Send OTP to email directly via CLI arg
import { AuthService } from '../src/api/auth.js';
import { logger } from '../src/utils/logger.js';

const email = process.argv[2];

if (!email || !email.includes('@')) {
  logger.error('Usage: node scripts/send_otp.js <your-email@example.com>');
  process.exit(1);
}

const auth = new AuthService();

logger.info(`Sending OTP login code to: ${email}...`, 'AUTH');
try {
  await auth.requestOtp(email);
  logger.success(`OTP code successfully sent to ${email}! Silakan cek inbox atau folder spam email Anda.`, 'AUTH');
} catch (err) {
  logger.error(`Gagal mengirim OTP: ${err.message}`, 'AUTH');
  process.exit(1);
}
