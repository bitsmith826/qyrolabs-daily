// Verify OTP, save account, and run tasks immediately
import { AuthService } from '../src/api/auth.js';
import { logger } from '../src/utils/logger.js';
import { wallet } from '../src/utils/wallet.js';
import { randomGamerTag } from '../src/utils/helpers.js';
import { loadAccounts, saveAccounts } from '../src/services/scheduler.js';
import { processAccount } from '../src/services/bot.js';
import { CONFIG } from '../config.js';

const email = process.argv[2];
const otpCode = process.argv[3];
const customEvm = process.argv[4];
const customSol = process.argv[5];

if (!email || !otpCode) {
  logger.error('Usage: node scripts/verify_and_run.js <email> <otpCode> [evmAddress] [solAddress]');
  process.exit(1);
}

const auth = new AuthService();

logger.banner();
logger.info(`Verifying OTP for ${email}...`, 'AUTH');

try {
  const session = await auth.verifyOtp(email, otpCode);
  logger.success(`Berhasil login ke QyroLabs sebagai: ${email}`, 'AUTH');

  const evm = (customEvm && wallet.isValidEvm(customEvm)) ? customEvm : wallet.generateEvm();
  const sol = (customSol && wallet.isValidSolana(customSol)) ? customSol : wallet.generateSolana();
  const displayName = randomGamerTag();
  const twitterUsername = email.split('@')[0];

  const newAccount = {
    email,
    accessToken: session.accessToken,
    refreshToken: session.refreshToken,
    expiresAt: session.expiresAt,
    displayName,
    ethereumAddress: evm,
    solanaAddress: sol,
    twitterUsername,
    referralCode: CONFIG.APP.DEFAULT_REF || '',
    proxy: null,
    addedAt: new Date().toISOString()
  };

  const accounts = loadAccounts();
  const existingIdx = accounts.findIndex(a => a.email.toLowerCase() === email.toLowerCase());
  if (existingIdx !== -1) {
    accounts[existingIdx] = newAccount;
  } else {
    accounts.push(newAccount);
  }
  saveAccounts(accounts);
  logger.success(`Akun berhasil disimpan ke accounts.json!`);

  logger.info(`Memulai eksekusi tugas airdrop untuk ${email}...`);
  await processAccount(newAccount, 1, 1);
  saveAccounts(accounts);

} catch (err) {
  logger.error(`Error: ${err.message}`);
  process.exit(1);
}
