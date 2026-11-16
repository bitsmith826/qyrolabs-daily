// Configuration for Qyro Labs Airdrop Automation System
import dotenv from 'dotenv';
dotenv.config();

export const CONFIG = {
  APP: {
    NAME: 'Qyro Labs Daily Automation',
    VERSION: '1.0.0',
    DEFAULT_REF: process.env.DEFAULT_REF || '',
    BASE_URL: 'https://qyrolabs.space',
    SERVER_FN_BASE: 'https://qyrolabs.space/_serverFn'
  },
  SUPABASE: {
    PROJECT_ID: 'zxoxvhbhazkkybhfbozu',
    URL: process.env.SUPABASE_URL || 'https://zxoxvhbhazkkybhfbozu.supabase.co',
    KEY: process.env.SUPABASE_KEY || 'sb_publishable_wkzFV7pvw8LrlSkDhnEmMA_EbnlwdrE'
  },
  FUNCTIONS: {
    // TanStack Start RPC server functions mapped from production build
    INIT_PROFILE: '7268bb4ec30f2d925d85ab83553e91dfb1b62644de6f0dabbae697ad38b92821', // GET
    CLAIM_LOOT: 'ca9c4af43f078843c18d49e8f6ed97ca38ed2b4250c966cd3d11a54936c14e7b', // POST
    UPDATE_PROFILE: 'e25129eb4b5c7afd9438a5713acbb371b18fef48dd6317298548e2038ee49819', // POST
    CLAIM_ARENA: '2101d4cfbd102f9007c03061d7edeb3645203db75a0fbabe55ec41a726aa24f6', // POST
    CLAIM_BADGE: '2a35e3021c8c8ef56564a4cb558355672ab9294f39248d2d738d3bcb3e81c782', // POST
    LEADERBOARD: '4eb9299686bb733b3d54003d1ee6096265bc68f8841f74c5cb32e7ea05fb5ccd', // GET
    MISSIONS: {
      LIKE_REPOST_1: '5d7ab5179ec228109a38ed17ff4e94dba95d69f733d66dbffd095314ccb0e9b3',
      LIKE_REPOST_2: 'd36b0992db632c6d044031d4ae7e0a14012a5e251f4ec679975f5822a6a9db37',
      FOLLOW_QYRO: '2ddae6b66355cf49b925a5720f3a37c924f73b27b0ad47e09c9aa9ebd64f5319',
      FOLLOW_AXIE: '825552b2bc837943c8523eb1ab6f3142b6391bf89393ab006992f5e490b503be',
      FOLLOW_BIGTIME: 'f91447c93b16aaecf27061a525801163a196d0df5cf681ede233c52a1f5f598d'
    }
  },
  SETTINGS: {
    // Delays in ms
    DELAY_BETWEEN_ACTIONS_MIN: 1500,
    DELAY_BETWEEN_ACTIONS_MAX: 3500,
    DELAY_BETWEEN_ACCOUNTS_MIN: 3000,
    DELAY_BETWEEN_ACCOUNTS_MAX: 7000,
    CRON_INTERVAL_HOURS: 24, // Runs every 24 hours in daemon/cron mode
    ARENA_SIMULATION: {
      MIN_SCORE: 12,
      MAX_SCORE: 25,
      MIN_DURATION_MS: 31000,
      MAX_DURATION_MS: 38000
    }
  },
  DEFAULT_HEADERS: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
    'Accept': 'application/x-tss-framed, application/x-ndjson, application/json',
    'Referer': 'https://qyrolabs.space/',
    'Origin': 'https://qyrolabs.space',
    'sec-ch-ua': '"Chromium";v="128", "Not;A=Brand";v="24", "Google Chrome";v="128"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'same-origin',
    'x-tsr-serverFn': 'true'
  }
};
