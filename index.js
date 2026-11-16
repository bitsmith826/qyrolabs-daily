#!/usr/bin/env node
// Main entry point for Qyro Labs Airdrop Automation
import { logger } from './src/utils/logger.js';
import { handleLogin, handleList, handleLeaderboard, handleHelp } from './src/cli.js';
import { runAllAccounts, startDaemonLoop } from './src/services/scheduler.js';

async function main() {
  const command = (process.argv[2] || 'run').toLowerCase();

  switch (command) {
    case 'login':
    case 'add':
      await handleLogin();
      break;

    case 'list':
    case 'accounts':
      await handleList();
      break;

    case 'top':
    case 'leaderboard':
      await handleLeaderboard();
      break;

    case 'cron':
    case 'daemon':
    case 'loop':
      logger.banner();
      const intervalArg = process.argv[3] ? parseInt(process.argv[3], 10) : 24;
      await startDaemonLoop(isNaN(intervalArg) ? 24 : intervalArg);
      break;

    case 'help':
    case '-h':
    case '--help':
      await handleHelp();
      break;

    case 'run':
    default:
      logger.banner();
      await runAllAccounts();
      break;
  }
}

main().catch(err => {
  logger.error(`Fatal unexpected error: ${err.stack || err.message}`);
  process.exit(1);
});
