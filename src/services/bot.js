// Full Airdrop Task Execution Workflow for an Account
import { CONFIG } from '../../config.js';
import { AuthService } from '../api/auth.js';
import { QyroApi } from '../api/qyro.js';
import { logger } from '../utils/logger.js';
import { randomDelay, randomInt, formatTimeRemaining, randomGamerTag } from '../utils/helpers.js';
import { wallet } from '../utils/wallet.js';

// All official Qyro Labs badge tiers
const BADGE_TIERS = [
  { tier: 'rookie', name: 'Rookie Pilot (1k XP)', minXp: 1000, symbol: '✦' },
  { tier: 'striker', name: 'Neon Striker (10k XP)', minXp: 10000, symbol: '⚡' },
  { tier: 'vanguard', name: 'Vanguard (30k XP)', minXp: 30000, symbol: '⛨' },
  { tier: 'elite', name: 'Elite Ace (50k XP)', minXp: 50000, symbol: '✪' },
  { tier: 'legend', name: 'Qyro Legend (100k XP)', minXp: 100000, symbol: '♛' },
  { tier: 'mythic', name: 'Mythic Genesis (1M XP)', minXp: 1000000, symbol: '❂' }
];

export async function processAccount(account, accountIndex = 1, totalAccounts = 1) {
  const result = {
    email: account.email,
    xp: 0,
    loot: '—',
    arena: '—',
    profileUpdated: false,
    missionsCompleted: 0,
    success: false,
    error: null
  };

  const authService = new AuthService(account.proxy || null);
  let accessToken = account.accessToken;
  let refreshToken = account.refreshToken;

  // 1. Session & Token Validation
  try {
    if (!accessToken || authService.isTokenExpired(accessToken)) {
      if (refreshToken) {
        logger.info('Access token expired. Refreshing session...', 'AUTH');
        const session = await authService.refreshSession(refreshToken);
        accessToken = session.accessToken;
        refreshToken = session.refreshToken;
        account.accessToken = accessToken;
        account.refreshToken = refreshToken;
        account.expiresAt = session.expiresAt;
        logger.success('Session token refreshed successfully!', 'AUTH');
      } else {
        throw new Error('No valid token found. Please re-login this account.');
      }
    }
  } catch (err) {
    logger.accountCard(accountIndex, totalAccounts, account.email);
    logger.error(`Authentication error: ${err.message}`, 'AUTH');
    result.error = err.message;
    return result;
  }

  const qyro = new QyroApi(accessToken, account.proxy || null);

  try {
    // 2. Initialize / Load Player Profile & Bind Referral
    let initData;
    const refToUse = account.referralCode || CONFIG.APP.DEFAULT_REF;

    try {
      initData = await qyro.initProfile(refToUse);
    } catch (refErr) {
      if (/own referral code|already referred/i.test(refErr.message)) {
        initData = await qyro.initProfile(null);
      } else {
        throw refErr;
      }
    }

    const profile = initData.profile;
    result.xp = profile.xp_balance || 0;

    if (profile.referral_code) {
      account.myReferralCode = profile.referral_code;
    }

    // Display formatted card
    logger.accountCard(
      accountIndex,
      totalAccounts,
      account.email,
      profile.display_name || account.displayName || 'Pilot',
      result.xp,
      profile.referral_code
    );
    await randomDelay(800, 1500);

    // 3. Setup Profile (SOL & EVM Addresses)
    const isProfileClaimed = !!profile.profile_reward_claimed_at;
    const hasAddresses = !!(profile.solana_address && profile.ethereum_address);

    if (!isProfileClaimed || !hasAddresses) {
      let evm = account.ethereumAddress || profile.ethereum_address;
      let sol = account.solanaAddress || profile.solana_address;
      let name = profile.display_name || account.displayName || randomGamerTag();

      if (!evm || !wallet.isValidEvm(evm)) {
        evm = wallet.generateEvm();
        account.ethereumAddress = evm;
      }
      if (!sol || !wallet.isValidSolana(sol)) {
        sol = wallet.generateSolana();
        account.solanaAddress = sol;
      }

      try {
        const updateRes = await qyro.updateProfile(name, sol, evm);
        result.profileUpdated = true;
        if (updateRes && updateRes.awarded) {
          logger.step('SETUP', 'Solana & EVM Wallets', 'CLAIMED', 1000);
          result.xp += 1000;
        } else {
          logger.step('SETUP', 'Solana & EVM Wallets', 'OK');
        }
      } catch (err) {
        logger.step('SETUP', 'Solana & EVM Wallets', `Note: ${err.message}`);
      }
      await randomDelay();
    } else {
      logger.step('SETUP', 'Solana & EVM Wallets', 'OK');
    }

    // 4. Daily Loot Drop Claim
    const now = Date.now();
    const nextLootAt = profile.last_daily_claim_at ? new Date(profile.last_daily_claim_at).getTime() + 86400000 : 0;
    const lootTimeRemaining = nextLootAt - now;

    if (lootTimeRemaining <= 0) {
      try {
        const lootRes = await qyro.claimDailyLoot();
        const awarded = lootRes?.awarded || 0;
        if (awarded > 0) {
          logger.step('LOOT BOX', 'Daily Loot Drop', 'UNLOCKED', awarded);
          result.loot = `+${awarded} XP`;
          result.xp += awarded;
        } else {
          logger.step('LOOT BOX', 'Daily Loot Drop', 'Recharging');
          result.loot = 'Recharging';
        }
      } catch (err) {
        logger.step('LOOT BOX', 'Daily Loot Drop', `Error: ${err.message}`);
        result.loot = 'Error';
      }
      await randomDelay();
    } else {
      const waitStr = formatTimeRemaining(lootTimeRemaining);
      logger.step('LOOT BOX', 'Daily Loot Drop', `Cooldown (${waitStr})`);
      result.loot = `Cooldown (${waitStr})`;
    }

    // 5. Daily Star Dogfight Arena
    const nextArenaAt = profile.last_game_claim_at ? new Date(profile.last_game_claim_at).getTime() + 86400000 : 0;
    const arenaTimeRemaining = nextArenaAt - now;

    if (arenaTimeRemaining <= 0) {
      const simScore = randomInt(CONFIG.SETTINGS.ARENA_SIMULATION.MIN_SCORE, CONFIG.SETTINGS.ARENA_SIMULATION.MAX_SCORE);
      const simDuration = randomInt(CONFIG.SETTINGS.ARENA_SIMULATION.MIN_DURATION_MS, CONFIG.SETTINGS.ARENA_SIMULATION.MAX_DURATION_MS);

      try {
        const arenaRes = await qyro.claimDailyArena(simScore, simDuration);
        const awarded = arenaRes?.awarded || 0;
        if (awarded > 0) {
          logger.step('ARENA', 'Star Dogfight Combat', 'CLEARED', awarded);
          result.arena = `+${awarded.toLocaleString()} XP`;
          result.xp += awarded;
        } else {
          logger.step('ARENA', 'Star Dogfight Combat', 'Recharging');
          result.arena = 'Recharging';
        }
      } catch (err) {
        logger.step('ARENA', 'Star Dogfight Combat', `Error: ${err.message}`);
        result.arena = 'Error';
      }
      await randomDelay();
    } else {
      const waitStr = formatTimeRemaining(arenaTimeRemaining);
      logger.step('ARENA', 'Star Dogfight Combat', `Cooldown (${waitStr})`);
      result.arena = `Cooldown (${waitStr})`;
    }

    // 6. Complete Social Tasks (Mission Deck)
    const twitterHandle = account.twitterUsername || account.email.split('@')[0];

    const socialTasks = [
      { key: 'FOLLOW_QYRO', name: 'Follow @QyroLabsofc', claimed: !!profile.qyrolabsofc_follow_username },
      { key: 'LIKE_REPOST_1', name: 'Like & Repost Post 1', claimed: !!profile.likert_a_username },
      { key: 'LIKE_REPOST_2', name: 'Like & Repost Post 2', claimed: !!profile.likert_b_username },
      { key: 'FOLLOW_AXIE', name: 'Follow @AxieInfinity', claimed: !!profile.axie_follow_username },
      { key: 'FOLLOW_BIGTIME', name: 'Follow @PlayBigTime', claimed: !!profile.bigtime_follow_username }
    ];

    for (const t of socialTasks) {
      if (!t.claimed) {
        try {
          await qyro.completeSocialTask(t.key, twitterHandle);
          logger.step('MISSION', t.name, 'VERIFIED', 1000);
          result.missionsCompleted++;
          result.xp += 1000;
        } catch (err) {
          logger.step('MISSION', t.name, `Note: ${err.message}`);
        }
        await randomDelay();
      } else {
        logger.step('MISSION', t.name, 'OK');
      }
    }

    // 7. Check & Auto-Claim All Eligible Badges
    for (const b of BADGE_TIERS) {
      if (result.xp >= b.minXp) {
        try {
          const claimRes = await qyro.claimBadge(b.tier);
          if (claimRes && (claimRes.status === 'claimed' || claimRes.awarded)) {
            logger.step('PILOT RANK', `${b.symbol} ${b.name}`, 'CLAIMED');
          } else {
            logger.step('PILOT RANK', `${b.symbol} ${b.name}`, 'ACTIVE');
          }
        } catch {
          logger.step('PILOT RANK', `${b.symbol} ${b.name}`, 'ACTIVE');
        }
      }
    }

    // Refresh final stats
    try {
      const finalProfile = (await qyro.initProfile(null)).profile;
      result.xp = finalProfile.xp_balance || result.xp;
    } catch {}

    result.success = true;
    console.log(`\n    ✔ Account Finished · Final Balance: ${result.xp.toLocaleString()} XP`);
  } catch (err) {
    logger.error(`Error processing account: ${err.message}`, 'ACCOUNT');
    result.error = err.message;
  }

  return result;
}
