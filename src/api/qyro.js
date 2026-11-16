// Qyro Labs Server Functions RPC Client
import { CONFIG } from '../../config.js';
import { HttpClient } from './client.js';
import { serialize, deserialize } from './seroval.js';

export class QyroApi {
  constructor(accessToken, proxy = null) {
    this.http = new HttpClient({ accessToken, proxy });
  }

  setToken(token) {
    this.http.setToken(token);
  }

  // Core RPC invoker for TanStack Start server functions
  async callServerFn(hash, method = 'POST', data = undefined) {
    let url = `${CONFIG.APP.SERVER_FN_BASE}/${hash}`;
    let body = undefined;

    if (method === 'GET') {
      if (data !== undefined) {
        const serialized = await serialize({ data });
        const param = new URLSearchParams({ payload: serialized }).toString();
        url += (url.includes('?') ? '&' : '?') + param;
      }
    } else if (method === 'POST') {
      if (data !== undefined) {
        body = await serialize({ data });
      }
    }

    const res = await this.http.request(url, {
      method,
      body,
      headers: {
        'x-tsr-serverFn': 'true',
        'Accept': 'application/x-tss-framed, application/x-ndjson, application/json'
      }
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      throw new Error(`ServerFn ${hash.slice(0, 8)} failed (${res.status}): ${errText}`);
    }

    const json = await res.json();
    const parsed = deserialize(json);

    if (parsed.error) {
      const msg = parsed.error.message || String(parsed.error);
      throw new Error(msg);
    }

    return parsed.result;
  }

  // 1. Initialize session & bind referral code, returns user profile + stats
  async initProfile(referralCode = null) {
    const data = referralCode ? { referralCode } : {};
    return await this.callServerFn(CONFIG.FUNCTIONS.INIT_PROFILE, 'GET', data);
  }

  // 2. Claim daily loot drop (300 - 1,000 XP)
  async claimDailyLoot() {
    return await this.callServerFn(CONFIG.FUNCTIONS.CLAIM_LOOT, 'POST');
  }

  // 3. Complete player profile with EVM and Solana addresses (+1,000 XP)
  async updateProfile(displayName, solanaAddress, ethereumAddress) {
    return await this.callServerFn(CONFIG.FUNCTIONS.UPDATE_PROFILE, 'POST', {
      displayName,
      solanaAddress,
      ethereumAddress
    });
  }

  // 4. Daily Star Dogfight Arena battle survival (+1,000 XP)
  async claimDailyArena(score = 18, durationMs = 33500) {
    return await this.callServerFn(CONFIG.FUNCTIONS.CLAIM_ARENA, 'POST', {
      score,
      durationMs
    });
  }

  // 5. Complete social task (Follows, Likes, Reposts) (+1,000 XP each)
  async completeSocialTask(taskKey, username) {
    const hash = CONFIG.FUNCTIONS.MISSIONS[taskKey];
    if (!hash) {
      throw new Error(`Unknown mission task: ${taskKey}`);
    }
    const cleanUser = username.replace(/^@/, '').trim();
    return await this.callServerFn(hash, 'POST', { username: cleanUser });
  }

  // 6. Claim pilot rank badge (e.g. 'rookie' for 1,000 XP)
  async claimBadge(tier = 'rookie') {
    return await this.callServerFn(CONFIG.FUNCTIONS.CLAIM_BADGE, 'POST', { tier });
  }

  // 7. Get leaderboard
  async getLeaderboard() {
    return await this.callServerFn(CONFIG.FUNCTIONS.LEADERBOARD, 'GET');
  }
}
