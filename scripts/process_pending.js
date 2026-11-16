// Pending Accounts Batch Processor
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { AuthService } from '../src/api/auth.js';
import { CONFIG } from '../config.js';
import { logger } from '../src/utils/logger.js';
import { loadAccounts, saveAccounts } from '../src/services/scheduler.js';
import { processAccount } from '../src/services/bot.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PENDING_FILE = path.resolve(__dirname, '../pending_accounts.json');

function loadPending() {
  if (!fs.existsSync(PENDING_FILE)) return [];
  return JSON.parse(fs.readFileSync(PENDING_FILE, 'utf-8'));
}

function savePending(data) {
  fs.writeFileSync(PENDING_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

const action = process.argv[2]; // 'send', 'verify', 'list'
const arg1 = process.argv[3];
const arg2 = process.argv[4];

const auth = new AuthService();

async function main() {
  const pending = loadPending();

  if (action === 'send') {
    if (arg1 === 'all') {
      logger.info(`Sending OTP to all ${pending.length} pending accounts...`);
      for (const acc of pending) {
        if (acc.status !== 'COMPLETED') {
          try {
            await auth.requestOtp(acc.email);
            logger.success(`[#${acc.index}] OTP sent to: ${acc.email}`);
            acc.status = 'OTP_SENT';
          } catch (e) {
            logger.error(`[#${acc.index}] Failed ${acc.email}: ${e.message}`);
          }
        }
      }
      savePending(pending);
    } else {
      const idx = parseInt(arg1, 10);
      const acc = pending.find(p => p.index === idx || p.email.toLowerCase() === (arg1 || '').toLowerCase());
      if (!acc) {
        logger.error(`Account not found for index/email: ${arg1}`);
        return;
      }
      logger.info(`[#${acc.index}] Sending OTP to: ${acc.email}...`);
      await auth.requestOtp(acc.email);
      acc.status = 'OTP_SENT';
      savePending(pending);
      logger.success(`[#${acc.index}] OTP sent to: ${acc.email}! Silakan cek inbox email.`);
    }
  } else if (action === 'verify') {
    const query = arg1;
    const otpCode = arg2;
    if (!query || !otpCode) {
      logger.error('Usage: node scripts/process_pending.js verify <index_or_email> <otpCode>');
      return;
    }
    const idx = parseInt(query, 10);
    const acc = pending.find(p => p.index === idx || p.email.toLowerCase() === query.toLowerCase());
    if (!acc) {
      logger.error(`Account not found for: ${query}`);
      return;
    }

    logger.info(`[#${acc.index}] Verifying OTP for: ${acc.email}...`);
    const session = await auth.verifyOtp(acc.email, otpCode);
    logger.success(`[#${acc.index}] Logged in successfully: ${acc.email}`);

    const newAccount = {
      email: acc.email,
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
      expiresAt: session.expiresAt,
      displayName: acc.displayName || acc.twitterUsername,
      ethereumAddress: acc.ethereumAddress,
      solanaAddress: acc.solanaAddress,
      twitterUsername: acc.twitterUsername,
      referralCode: acc.referralCode || CONFIG.APP.DEFAULT_REF || '',
      proxy: acc.proxy || null,
      addedAt: new Date().toISOString()
    };

    const accounts = loadAccounts();
    const existingIdx = accounts.findIndex(a => a.email.toLowerCase() === acc.email.toLowerCase());
    if (existingIdx !== -1) {
      accounts[existingIdx] = newAccount;
    } else {
      accounts.push(newAccount);
    }
    saveAccounts(accounts);

    acc.status = 'COMPLETED';
    savePending(pending);

    logger.info(`Running all missions for [#${acc.index}] ${acc.email}...`);
    await processAccount(newAccount, acc.index, pending.length);
    saveAccounts(accounts);
  } else {
    // List
    console.log('\n--- PENDING QUEUE ---');
    for (const p of pending) {
      console.log(`[#${p.index}] ${p.email.padEnd(30)} | EVM: ${p.ethereumAddress.slice(0, 10)}... | SOL: ${p.solanaAddress.slice(0, 10)}... | Status: ${p.status}`);
    }
    console.log();
  }
}

main().catch(err => {
  logger.error(err.message);
  process.exit(1);
});
