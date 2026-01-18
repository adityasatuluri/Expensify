// Simple PIN verification - hardcoded PIN: 3721
const VALID_PIN = '3721';

export function verifyPin(pin: string): boolean {
  return pin === VALID_PIN;
}

// JWT token generation (client-side placeholder)
export function generateToken(userId: string): {
  token: string;
  expiresAt: number;
} {
  // Note: In a real app, this should be done server-side
  // This is a simplified client-side version for demo purposes
  const now = Date.now();
  const expiresAt = now + 24 * 60 * 60 * 1000; // 24 hours

  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(
    JSON.stringify({
      userId,
      iat: Math.floor(now / 1000),
      exp: Math.floor(expiresAt / 1000),
    })
  );

  // Simplified signature (not cryptographically secure, for demo only)
  const signature = btoa('signature');
  const token = `${header}.${payload}.${signature}`;

  return { token, expiresAt };
}

export function parseToken(
  token: string
): { userId: string; isValid: boolean } {
  try {
    const [, payloadB64] = token.split('.');
    const payload = JSON.parse(atob(payloadB64));

    const isValid = payload.exp * 1000 > Date.now();
    return { userId: payload.userId, isValid };
  } catch {
    return { userId: '', isValid: false };
  }
}

// Local storage utilities
export const TokenStorage = {
  set: (token: string, expiresAt: number) => {
    localStorage.setItem('auth_token', token);
    localStorage.setItem('auth_expires_at', expiresAt.toString());
  },
  get: (): { token: string | null; isValid: boolean } => {
    const token = localStorage.getItem('auth_token');
    const expiresAt = localStorage.getItem('auth_expires_at');

    if (!token || !expiresAt) {
      return { token: null, isValid: false };
    }

    const isValid = parseInt(expiresAt) > Date.now();
    return { token: isValid ? token : null, isValid };
  },
  clear: () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_expires_at');
    localStorage.removeItem('user_id');
  },
};

export const UserStorage = {
  setUserId: (userId: string) => {
    localStorage.setItem('user_id', userId);
  },
  getUserId: (): string | null => {
    return localStorage.getItem('user_id') || 'single-user';
  },
  clear: () => {
    localStorage.removeItem('user_id');
  },
};
