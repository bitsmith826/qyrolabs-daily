// Precision Web3 & Cyberpunk ANSI Logger with Mathematically Aligned Tables
import { CONFIG } from '../../config.js';

const C = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  italic: '\x1b[3m',
  underline: '\x1b[4m',

  // Foreground
  black: '\x1b[30m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',

  // Bright Foreground
  gray: '\x1b[90m',
  brightRed: '\x1b[91m',
  brightGreen: '\x1b[92m',
  brightYellow: '\x1b[93m',
  brightBlue: '\x1b[94m',
  brightMagenta: '\x1b[95m',
  brightCyan: '\x1b[96m',
  brightWhite: '\x1b[97m',

  // Background
  bgBlack: '\x1b[40m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m',
  bgMagenta: '\x1b[45m',
  bgCyan: '\x1b[46m',
  bgWhite: '\x1b[47m'
};

// Strips ANSI escape codes to calculate visual string width
export function stripAnsi(str) {
  return String(str).replace(/\x1b\[[0-9;]*m/g, '');
}

// Pads plain string to exact visual width
export function pad(str, targetLen, align = 'left') {
  const plain = stripAnsi(String(str));
  const diff = Math.max(0, targetLen - plain.length);
  if (align === 'right') {
    return ' '.repeat(diff) + plain;
  } else if (align === 'center') {
    const left = Math.floor(diff / 2);
    const right = diff - left;
    return ' '.repeat(left) + plain + ' '.repeat(right);
  }
  return plain + ' '.repeat(diff);
}

function timeTag() {
  const now = new Date();
  const time = now.toTimeString().split(' ')[0];
  return `${C.gray}[${time}]${C.reset}`;
}

export const logger = {
  banner() {
    const refText = CONFIG?.APP?.DEFAULT_REF ? `Ref: ${C.brightYellow}${CONFIG.APP.DEFAULT_REF}${C.reset} · ` : '';
    console.log(`
${C.brightCyan}${C.bold}  ██████╗ ██╗   ██╗██████╗  ██████╗     ██╗      █████╗ ██████╗ ███████╗
 ██╔═══██╗╚██╗ ██╔╝██╔══██╗██╔═══██╗    ██║     ██╔══██╗██╔══██╗██╔════╝
 ██║   ██║ ╚████╔╝ ██████╔╝██║   ██║    ██║     ███████║██████╔╝███████╗
 ██║▄▄ ██║  ╚██╔╝  ██╔══██╗██║   ██║    ██║     ██╔══██║██╔══██╗╚════██║
 ╚██████╔╝   ██║   ██║  ██║╚██████╔╝    ███████╗██║  ██║██████╔╝███████║
  ╚══▀▀═╝    ╚═╝   ╚═╝  ╚═╝ ╚═════╝     ╚══════╝╚═╝  ╚═╝╚═════╝ ╚══════╝${C.reset}
  ${C.brightMagenta}${C.bold}✦ QYRO LABS AIRDROP AUTOMATION SUITE · DAILY XP & MISSION ENGINE ✦${C.reset}
  ${C.gray}  ${refText}Target: ${C.brightGreen}$QYRO Confirmed Airdrop${C.reset}
`);
  },

  info(msg, tag = 'INFO') {
    console.log(`${timeTag()} ${C.cyan}ℹ [${tag}]${C.reset} ${msg}`);
  },

  success(msg, tag = 'SUCCESS') {
    console.log(`${timeTag()} ${C.brightGreen}✔ [${tag}]${C.reset} ${C.brightGreen}${msg}${C.reset}`);
  },

  warn(msg, tag = 'WARN') {
    console.log(`${timeTag()} ${C.brightYellow}⚠ [${tag}]${C.reset} ${C.yellow}${msg}${C.reset}`);
  },

  error(msg, tag = 'ERROR') {
    console.log(`${timeTag()} ${C.brightRed}✖ [${tag}]${C.reset} ${C.brightRed}${msg}${C.reset}`);
  },

  step(category, action, status, xp = null) {
    const cat = `[${category}]`;
    const catFormatted = `${C.gray}${cat.padEnd(12)}${C.reset}`;
    const actFormatted = `${C.bold}${action.padEnd(24)}${C.reset}`;
    
    let statusFormatted = status;
    if (status === 'CLAIMED' || status === 'UNLOCKED' || status === 'VERIFIED' || status === 'CLEARED' || status === 'OK' || status === 'ACTIVE') {
      statusFormatted = `${C.brightGreen}${C.bold}${status}${C.reset}`;
    } else if (status === 'COOLDOWN' || status.startsWith('Cooldown')) {
      statusFormatted = `${C.brightYellow}${status}${C.reset}`;
    } else if (status === 'FAILED' || status === 'ERROR') {
      statusFormatted = `${C.brightRed}${C.bold}${status}${C.reset}`;
    }

    const xpFormatted = xp ? ` ${C.brightYellow}${C.bold}(+${xp.toLocaleString()} XP)${C.reset}` : '';
    console.log(`${timeTag()}   ${C.brightBlue}➜${C.reset} ${catFormatted} ${actFormatted} : ${statusFormatted}${xpFormatted}`);
  },

  accountCard(index, total, email, name = null, balance = null, ref = null) {
    const width = 96;
    console.log(`\n${C.cyan}┌${'─'.repeat(width)}┐${C.reset}`);
    
    const title = ` ACCOUNT [${index}/${total}] · ${email}`;
    const titlePlain = pad(title, width - 2);
    console.log(`${C.cyan}│${C.reset} ${C.bold}${C.brightWhite}${titlePlain}${C.reset} ${C.cyan}│${C.reset}`);
    
    if (name || balance !== null || ref) {
      const p1 = `Pilot: ${name || 'Pilot'}`;
      const p2 = `Ref: ${ref || '—'}`;
      const p3 = `Balance: ${balance !== null ? balance.toLocaleString() : '0'} XP`;
      const details = ` ${p1}  │  ${p2}  │  ${p3}`;
      const detailsPlain = pad(details, width - 2);
      console.log(`${C.cyan}│${C.reset} ${C.cyan}${detailsPlain}${C.reset} ${C.cyan}│${C.reset}`);
    }
    console.log(`${C.cyan}└${'─'.repeat(width)}┘${C.reset}`);
  },

  summaryTable(results) {
    const colWidths = [32, 14, 16, 16, 12];
    const headers = ['Email', 'XP Balance', 'Daily Loot Box', 'Star Dogfight', 'Status'];

    // Total content width = 32+14+16+16+12 + (5 * 2 spaces) + (4 middle dividers) = 90 + 10 + 4 = 104
    const totalContentWidth = colWidths.reduce((a, b) => a + b, 0) + (colWidths.length * 2) + (colWidths.length - 1);

    const hr = (left, mid, right) => {
      const parts = colWidths.map(w => '─'.repeat(w + 2));
      return `${C.cyan}${left}${parts.join(mid)}${right}${C.reset}`;
    };

    console.log(`\n${C.cyan}┌${'─'.repeat(totalContentWidth)}┐${C.reset}`);
    const bannerTitle = pad('MASTER EXECUTION RECAP', totalContentWidth, 'center');
    console.log(`${C.cyan}│${C.bold}${C.brightCyan}${bannerTitle}${C.reset}${C.cyan}│${C.reset}`);
    console.log(hr('├', '┬', '┤'));

    // Header row
    const headerCols = headers.map((h, i) => {
      const align = i === 4 ? 'center' : (i === 1 ? 'right' : 'left');
      return C.bold + C.brightWhite + pad(h, colWidths[i], align) + C.reset;
    });
    console.log(`${C.cyan}│ ${headerCols.join(' │ ')} │${C.reset}`);
    console.log(hr('├', '┼', '┤'));

    // Data rows
    for (const r of results) {
      // 1. Email (Clean, never truncated up to 32 chars)
      const rawEmail = (r.email || 'Unknown').slice(0, 32);
      const emailCol = C.brightWhite + pad(rawEmail, colWidths[0], 'left') + C.reset;

      // 2. XP Balance
      const rawXp = r.xp !== undefined && r.xp !== null ? `${r.xp.toLocaleString()} XP` : '—';
      const xpCol = C.brightGreen + C.bold + pad(rawXp, colWidths[1], 'right') + C.reset;

      // 3. Loot Box
      let rawLoot = r.loot || '—';
      rawLoot = rawLoot.replace('Cooldown (', '').replace(')', '').trim();
      let lootColor = C.gray;
      if (rawLoot.startsWith('+')) {
        lootColor = C.brightGreen;
      } else if (rawLoot.includes('h ') || rawLoot.includes('m ') || rawLoot.includes('s')) {
        lootColor = C.brightYellow;
      }
      const lootCol = lootColor + pad(rawLoot, colWidths[2], 'center') + C.reset;

      // 4. Arena
      let rawArena = r.arena || '—';
      rawArena = rawArena.replace('Cooldown (', '').replace(')', '').trim();
      let arenaColor = C.gray;
      if (rawArena.startsWith('+')) {
        arenaColor = C.brightGreen;
      } else if (rawArena.includes('h ') || rawArena.includes('m ') || rawArena.includes('s')) {
        arenaColor = C.brightYellow;
      }
      const arenaCol = arenaColor + pad(rawArena, colWidths[3], 'center') + C.reset;

      // 5. Status
      const statusText = r.success ? 'SUCCESS' : 'FAILED';
      const statusColor = r.success ? (C.bgGreen + C.black + C.bold) : (C.bgRed + C.brightWhite + C.bold);
      const statusCol = statusColor + pad(statusText, colWidths[4], 'center') + C.reset;

      console.log(`${C.cyan}│ ${C.reset}${emailCol}${C.cyan} │ ${C.reset}${xpCol}${C.cyan} │ ${C.reset}${lootCol}${C.cyan} │ ${C.reset}${arenaCol}${C.cyan} │ ${C.reset}${statusCol}${C.cyan} │${C.reset}`);
    }

    console.log(hr('└', '┴', '┘') + '\n');
  }
};
