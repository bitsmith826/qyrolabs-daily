// General helper utilities

export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function randomDelay(minMs = 1500, maxMs = 3500) {
  const ms = randomInt(minMs, maxMs);
  return sleep(ms);
}

export function formatTimeRemaining(ms) {
  if (ms <= 0) return 'Ready';
  const totalSecs = Math.floor(ms / 1000);
  const hours = Math.floor(totalSecs / 3600);
  const minutes = Math.floor((totalSecs % 3600) / 60);
  const seconds = totalSecs % 60;
  return `${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`;
}

export function randomGamerTag() {
  const prefixes = ['Neo', 'Volt', 'Aero', 'Cyber', 'Echo', 'Frost', 'Shadow', 'Apex', 'Vanguard', 'Strike', 'Hyper', 'Titan'];
  const nouns = ['Pilot', 'Hunter', 'Drifter', 'Striker', 'Rider', 'Spectre', 'Ghost', 'Blade', 'Raven', 'Wolf', 'Captain', 'Viper'];
  const num = randomInt(10, 999);
  return `${prefixes[randomInt(0, prefixes.length - 1)]}${nouns[randomInt(0, nouns.length - 1)]}${num}`;
}
