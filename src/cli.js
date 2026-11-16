// Interactive Command Line Interface for Qyro Labs Bot
import readline from 'readline';
import { CONFIG } from '../config.js';
import { logger } from './utils/logger.js';
import { AuthService } from './api/auth.js';
import { QyroApi } from './api/qyro.js';
import { wallet } from './utils/wallet.js';
import { randomGamerTag } from './utils/helpers.js';
import { loadAccounts, saveAccounts } from './services/scheduler.js';
import { processAccount } from './services/bot.js';
import { execSync } from 'child_process';

function askQuestion(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  return new Promise(resolve => rl.question(query, ans => {
    rl.close();
    resolve(ans.trim());
  }));
}

export async function handleLogin() {
  logger.banner();
  console.log('\n--- ACCOUNT LOGIN & SETUP WIZARD ---');

  const email = await askQuestion('Enter your Email address: ');
  if (!email || !email.includes('@')) {
    logger.error('Invalid email address!');
    return;
  }

  const proxy = await askQuestion('Proxy (http://... or socks5://... or leave blank for none): ');
  const authService = new AuthService(proxy || null);

  logger.info(`Sending OTP login code to ${email}...`, 'AUTH');
  try {
    await authService.requestOtp(email);
    logger.success('OTP sent successfully! Please check your email inbox/spam.', 'AUTH');
  } catch (err) {
    logger.error(`Failed to send OTP: ${err.message}`, 'AUTH');
    return;
  }

  const otp = await askQuestion('Enter the 6-8 digit OTP code from email: ');
  if (!otp) {
    logger.error('OTP code cannot be empty!');
    return;
  }

  logger.info('Verifying OTP with Supabase Auth...', 'AUTH');
  let session;
  try {
    session = await authService.verifyOtp(email, otp);
    logger.success('Authentication successful! Logged in as: ' + email, 'AUTH');
  } catch (err) {
    logger.error(`OTP verification failed: ${err.message}`, 'AUTH');
    return;
  }

  // Profile setup questions
  console.log('\n--- SETUP AIRDROP WALLETS & PROFILE ---');
  const defaultName = randomGamerTag();
  const displayName = (await askQuestion(`Display Name (Enter for default [${defaultName}]): `)) || defaultName;

  const defaultEvm = wallet.generateEvm();
  let evmAddress = (await askQuestion(`EVM Wallet (0x...) (Enter to auto-generate [${defaultEvm.slice(0, 8)}...]): `)) || defaultEvm;
  while (!wallet.isValidEvm(evmAddress)) {
    logger.warn('Invalid EVM address (must be 0x followed by 40 hex characters).');
    evmAddress = (await askQuestion('EVM Wallet: ')) || defaultEvm;
  }

  const defaultSol = wallet.generateSolana();
  let solAddress = (await askQuestion(`Solana Wallet (Enter to auto-generate [${defaultSol.slice(0, 8)}...]): `)) || defaultSol;
  while (!wallet.isValidSolana(solAddress)) {
    logger.warn('Invalid Solana address (must be Base58 32-44 characters).');
    solAddress = (await askQuestion('Solana Wallet: ')) || defaultSol;
  }

  const defaultTwitter = email.split('@')[0];
  const twitter = (await askQuestion(`X (Twitter) username without @ (Enter for default [${defaultTwitter}]): `)) || defaultTwitter;

  const defaultRef = CONFIG.APP.DEFAULT_REF || '';
  const refPrompt = defaultRef
    ? `Referral Code (Enter for default [${defaultRef}]): `
    : 'Referral Code (leave blank if none): ';
  const refCode = (await askQuestion(refPrompt)) || defaultRef;

  const newAccount = {
    email,
    accessToken: session.accessToken,
    refreshToken: session.refreshToken,
    expiresAt: session.expiresAt,
    displayName,
    ethereumAddress: evmAddress,
    solanaAddress: solAddress,
    twitterUsername: twitter,
    referralCode: refCode,
    proxy: proxy || null,
    addedAt: new Date().toISOString()
  };

  const accounts = loadAccounts();
  const existingIdx = accounts.findIndex(a => a.email.toLowerCase() === email.toLowerCase());
  if (existingIdx !== -1) {
    accounts[existingIdx] = newAccount;
    logger.info(`Updated existing account [${email}] in accounts.json`);
  } else {
    accounts.push(newAccount);
    logger.success(`Added new account [${email}] to accounts.json!`);
  }
  saveAccounts(accounts);

  const runNow = await askQuestion('\nDo you want to run tasks for this account now? (Y/n): ');
  if (runNow.toLowerCase() !== 'n') {
    await processAccount(newAccount, accounts.length, accounts.length);
    saveAccounts(accounts);
  }
}

export async function handleList() {
  execSync('node scripts/status.js', { stdio: 'inherit' });
}

export async function handleLeaderboard() {
  logger.banner();
  logger.info('Fetching live Qyro Labs leaderboard...', 'LEADERBOARD');
  const qyro = new QyroApi();
  try {
    const data = await qyro.getLeaderboard();
    const entries = data.entries || [];
    console.log(`\n🏆 TOP 15 PILOTS ON QYRO LABS (Total entries: ${entries.length})\n`);
    console.log(`${'Rank'.padEnd(6)} | ${'Pilot Name'.padEnd(25)} | ${'XP Balance'}`);
    console.log('-'.repeat(50));
    for (const e of entries.slice(0, 15)) {
      console.log(`#${String(e.rank).padEnd(5)} | ${(e.display_name || 'Anonymous').padEnd(25)} | ${e.xp_balance.toLocaleString()} XP`);
    }
    console.log('\n');
  } catch (err) {
    logger.error(`Failed to fetch leaderboard: ${err.message}`);
  }
}

export async function handleHelp() {
  logger.banner();
  console.log(`
Available Commands:
  npm start            Run all accounts once (claim daily loot & arena)
  npm run cron         Run daemon scheduler (executes automatically every 24 hours)
  npm run list         Show precision squad status table & balances
  npm run top          Show live leaderboard
  npm run help         Show this help menu
`);
}
