// Check live status & XP of all accounts
import { loadAccounts, saveAccounts } from '../src/services/scheduler.js';
import { QyroApi } from '../src/api/qyro.js';
import { AuthService } from '../src/api/auth.js';
import { logger, pad } from '../src/utils/logger.js';

const C = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  white: '\x1b[37m',
  brightWhite: '\x1b[97m',
  brightGreen: '\x1b[92m',
  gray: '\x1b[90m'
};

async function checkAll() {
  logger.banner();
  const accounts = loadAccounts();
  logger.info(`Fetching live stats from Qyro Labs for ${accounts.length} accounts...`);

  const results = [];
  let totalXp = 0;

  for (let i = 0; i < accounts.length; i++) {
    const acc = accounts[i];
    try {
      const auth = new AuthService(acc.proxy || null);
      if (!acc.accessToken || auth.isTokenExpired(acc.accessToken)) {
        if (acc.refreshToken) {
          const session = await auth.refreshSession(acc.refreshToken);
          acc.accessToken = session.accessToken;
          acc.refreshToken = session.refreshToken;
          acc.expiresAt = session.expiresAt;
        }
      }

      const qyro = new QyroApi(acc.accessToken, acc.proxy || null);
      const res = await qyro.initProfile(null);
      const p = res.profile;
      acc.xp_balance = p.xp_balance || 0;
      totalXp += acc.xp_balance;

      results.push({
        no: `#${i + 1}`,
        email: acc.email,
        name: p.display_name || acc.displayName || 'Pilot',
        xp: acc.xp_balance,
        evm: acc.ethereumAddress,
        sol: acc.solanaAddress
      });
    } catch (e) {
      results.push({
        no: `#${i + 1}`,
        email: acc.email,
        name: acc.displayName || 'Pilot',
        xp: acc.xp_balance || 0,
        evm: acc.ethereumAddress,
        sol: acc.solanaAddress
      });
    }
  }
  saveAccounts(accounts);

  const colWidths = [4, 30, 16, 12, 16, 16];
  const headers = ['No', 'Email', 'Pilot Name', 'XP Balance', 'EVM Address', 'SOL Address'];

  const hr = (left, mid, right) => {
    const parts = colWidths.map(w => '─'.repeat(w + 2));
    return `${C.cyan}${left}${parts.join(mid)}${right}${C.reset}`;
  };

  const totalContentWidth = colWidths.reduce((a, b) => a + b, 0) + (colWidths.length * 2) + (colWidths.length - 1);

  console.log(`\n${C.cyan}┌${'─'.repeat(totalContentWidth)}┐${C.reset}`);
  console.log(`${C.cyan}│${C.bold}${C.brightWhite}${pad(`QYRO LABS SQUAD STATUS (${accounts.length} PILOTS)`, totalContentWidth, 'center')}${C.reset}${C.cyan}│${C.reset}`);
  console.log(hr('├', '┬', '┤'));

  const headerCols = headers.map((h, i) => {
    const align = i === 0 ? 'center' : (i === 3 ? 'right' : 'left');
    return C.bold + C.brightWhite + pad(h, colWidths[i], align) + C.reset;
  });
  console.log(`${C.cyan}│ ${headerCols.join(' │ ')} │${C.reset}`);
  console.log(hr('├', '┼', '┤'));

  for (const r of results) {
    const noCol = C.gray + pad(r.no, colWidths[0], 'center') + C.reset;
    const emailCol = C.brightWhite + pad(r.email, colWidths[1]) + C.reset;
    const nameCol = C.cyan + pad(r.name, colWidths[2]) + C.reset;
    const xpCol = C.brightGreen + C.bold + pad(`${r.xp.toLocaleString()} XP`, colWidths[3], 'right') + C.reset;
    const evmShort = r.evm ? `${r.evm.slice(0, 6)}...${r.evm.slice(-4)}` : '—';
    const evmCol = C.yellow + pad(evmShort, colWidths[4]) + C.reset;
    const solShort = r.sol ? `${r.sol.slice(0, 6)}...${r.sol.slice(-4)}` : '—';
    const solCol = C.yellow + pad(solShort, colWidths[5]) + C.reset;

    console.log(`${C.cyan}│ ${noCol} │ ${emailCol} │ ${nameCol} │ ${xpCol} │ ${evmCol} │ ${solCol} │${C.reset}`);
  }

  console.log(hr('├', '┴', '┤'));
  const footerText = `TOTAL SQUAD XP: ${totalXp.toLocaleString()} XP`;
  console.log(`${C.cyan}│${C.bold}${C.brightGreen}${pad(footerText, totalContentWidth, 'center')}${C.reset}${C.cyan}│${C.reset}`);
  console.log(`${C.cyan}└${'─'.repeat(totalContentWidth)}┘${C.reset}\n`);
}

checkAll().catch(console.error);
