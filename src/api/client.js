// HTTP Request Client with Proxy and Cloudflare header support
import { CONFIG } from '../../config.js';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { SocksProxyAgent } from 'socks-proxy-agent';

export class HttpClient {
  constructor(options = {}) {
    this.proxy = options.proxy || null;
    this.accessToken = options.accessToken || null;
    this.agent = this.initAgent(this.proxy);
  }

  setToken(token) {
    this.accessToken = token;
  }

  initAgent(proxyUrl) {
    if (!proxyUrl) return null;
    try {
      if (proxyUrl.startsWith('socks')) {
        return new SocksProxyAgent(proxyUrl);
      }
      return new HttpsProxyAgent(proxyUrl);
    } catch (e) {
      const masked = proxyUrl.replace(/:\/\/([^:]+):([^@]+)@/, '://$1:***@');
      console.warn(`[HttpClient] Failed to initialize proxy ${masked}: ${e.message}`);
      return null;
    }
  }

  async request(url, options = {}) {
    const headers = {
      ...CONFIG.DEFAULT_HEADERS,
      ...(options.headers || {})
    };

    if (this.accessToken && !headers['Authorization']) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    const fetchOptions = {
      method: options.method || 'GET',
      headers,
      signal: AbortSignal.timeout(options.timeout || 20000)
    };

    if (options.body) {
      fetchOptions.body = options.body;
      if (!headers['content-type']) {
        headers['content-type'] = 'application/json';
      }
    }

    if (this.agent) {
      // In Node fetch, agent / dispatcher
      fetchOptions.agent = this.agent;
    }

    const res = await fetch(url, fetchOptions);
    return res;
  }
}
