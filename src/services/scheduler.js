// Automation Scheduler & Multi-Account Runner
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { CONFIG } from '../../config.js';
import { logger } from '../utils/logger.js';
import { processAccount } from './bot.js';
import { randomDelay, sleep } from '../utils/helpers.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ACCOUNTS_FILE = path.resolve(__dirname, '../../accounts.json');

export function loadAccounts() {
  if (!fs.existsSync(ACCOUNTS_FILE)) {
    return [];
  }
  try {
    const raw = fs.readFileSync(ACCOUNTS_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    logger.error(`Failed to parse accounts.json: ${err.message}`);
    return [];
  }
}

export function saveAccounts(accounts) {
  try {
    fs.writeFileSync(ACCOUNTS_FILE, JSON.stringify(accounts, null, 2), 'utf-8');
  } catch (err) {
    logger.error(`Failed to save accounts.json: ${err.message}`);
  }
}

export async function runAllAccounts() {
  const accounts = loadAccounts();
  if (accounts.length === 0) {
    logger.warn('No accounts found in accounts.json! Run "npm start login" or add accounts first.');
    return [];
  }

  logger.info(`Starting execution for ${accounts.length} account(s)...`);
  const results = [];

  for (let i = 0; i < accounts.length; i++) {
    const account = accounts[i];
    const res = await processAccount(account, i + 1, accounts.length);
    results.push(res);

    // Save accounts back (tokens/wallets may have updated)
    saveAccounts(accounts);

    if (i < accounts.length - 1) {
      const waitMs = 3000;
      logger.info(`Waiting ${waitMs / 1000}s before next account...`);
      await sleep(waitMs);
    }
  }

  logger.summaryTable(results);
  return results;
}

export async function startDaemonLoop(intervalHours = CONFIG.SETTINGS.CRON_INTERVAL_HOURS) {
  logger.info(`Daemon mode started. Schedule interval: every ${intervalHours} hour(s).`);

  while (true) {
    logger.info('Executing scheduled cycle now...');
    try {
      await runAllAccounts();
    } catch (err) {
      logger.error(`Cycle execution error: ${err.message}`);
    }

    const waitMs = intervalHours * 60 * 60 * 1000;
    const nextRun = new Date(Date.now() + waitMs);
    logger.info(`Next cycle scheduled at: ${nextRun.toLocaleString()} (in ${intervalHours} hours). Sleeping...`);
    await sleep(waitMs);
  }
}
