// Supabase Authentication Engine (Email OTP & Refresh Token)
import { CONFIG } from '../../config.js';
import { HttpClient } from './client.js';

export class AuthService {
  constructor(proxy = null) {
    this.http = new HttpClient({ proxy });
  }

  // Request 6-digit OTP to user's email
  async requestOtp(email) {
    const url = `${CONFIG.SUPABASE.URL}/auth/v1/otp`;
    const res = await this.http.request(url, {
      method: 'POST',
      headers: {
        'apikey': CONFIG.SUPABASE.KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email,
        create_user: true
      })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.msg || err.error_description || `Failed to send OTP (${res.status})`);
    }

    return true;
  }

  // Verify the 6-digit OTP code received in email
  async verifyOtp(email, token) {
    const url = `${CONFIG.SUPABASE.URL}/auth/v1/verify`;
    const res = await this.http.request(url, {
      method: 'POST',
      headers: {
        'apikey': CONFIG.SUPABASE.KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        type: 'email',
        email,
        token: token.trim()
      })
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(data.msg || data.error_description || `Invalid or expired OTP code (${res.status})`);
    }

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: Date.now() + (data.expires_in || 3600) * 1000,
      user: data.user
    };
  }

  // Refresh expired access_token using refresh_token
  async refreshSession(refreshToken) {
    const url = `${CONFIG.SUPABASE.URL}/auth/v1/token?grant_type=refresh_token`;
    const res = await this.http.request(url, {
      method: 'POST',
      headers: {
        'apikey': CONFIG.SUPABASE.KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        refresh_token: refreshToken
      })
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(data.msg || data.error_description || `Failed to refresh token (${res.status})`);
    }

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: Date.now() + (data.expires_in || 3600) * 1000,
      user: data.user
    };
  }

  // Check if JWT token is expired or expiring within 2 minutes
  isTokenExpired(token) {
    if (!token) return true;
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return true;
      const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
      if (!payload.exp) return false;
      const bufferMs = 2 * 60 * 1000; // 2 minutes buffer
      return (payload.exp * 1000) < (Date.now() + bufferMs);
    } catch {
      return true;
    }
  }
}
