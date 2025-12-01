/**
 * CSRF Protection for API endpoints
 * Generates and validates CSRF tokens to prevent cross-site request forgery
 */

import { cookies } from 'next/headers';

const CSRF_TOKEN_NAME = 'csrf_token';
const CSRF_HEADER_NAME = 'x-csrf-token';
const CSRF_SECRET = process.env.AUTH_SECRET || 'default-csrf-secret';

/**
 * Generate a random CSRF token
 */
function generateToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join(
    ''
  );
}

/**
 * Create a signed CSRF token with timestamp
 */
async function signToken(token: string): Promise<string> {
  const timestamp = Date.now();
  const data = `${token}:${timestamp}`;

  const encoder = new TextEncoder();
  const keyData = encoder.encode(CSRF_SECRET);
  const messageData = encoder.encode(data);

  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', key, messageData);
  const signatureHex = Array.from(new Uint8Array(signature), (byte) =>
    byte.toString(16).padStart(2, '0')
  ).join('');

  return `${token}:${timestamp}:${signatureHex}`;
}

/**
 * Verify a signed CSRF token
 */
async function verifyToken(signedToken: string): Promise<boolean> {
  try {
    const parts = signedToken.split(':');
    if (parts.length !== 3) return false;

    const [token, timestampStr, signature] = parts;
    const timestamp = parseInt(timestampStr, 10);

    // Token expires after 24 hours
    const maxAge = 24 * 60 * 60 * 1000;
    if (Date.now() - timestamp > maxAge) {
      return false;
    }

    // Verify signature
    const data = `${token}:${timestamp}`;
    const encoder = new TextEncoder();
    const keyData = encoder.encode(CSRF_SECRET);
    const messageData = encoder.encode(data);

    const key = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    const signatureBytes = new Uint8Array(
      signature.match(/.{2}/g)!.map((byte) => parseInt(byte, 16))
    );

    return await crypto.subtle.verify('HMAC', key, signatureBytes, messageData);
  } catch {
    return false;
  }
}

/**
 * Generate and set a new CSRF token cookie
 * Call this from a server component or API route
 */
export async function generateCSRFToken(): Promise<string> {
  const token = generateToken();
  const signedToken = await signToken(token);

  const cookieStore = await cookies();
  cookieStore.set(CSRF_TOKEN_NAME, signedToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 24 * 60 * 60, // 24 hours
  });

  return signedToken;
}

/**
 * Get the current CSRF token from cookies
 */
export async function getCSRFToken(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(CSRF_TOKEN_NAME);
  return token?.value || null;
}

/**
 * Validate CSRF token from request header against cookie
 */
export async function validateCSRFToken(
  headerToken: string | null
): Promise<boolean> {
  if (!headerToken) return false;

  const cookieToken = await getCSRFToken();
  if (!cookieToken) return false;

  // Tokens must match
  if (headerToken !== cookieToken) return false;

  // Verify signature
  return verifyToken(cookieToken);
}

/**
 * Get CSRF header name for client-side use
 */
export function getCSRFHeaderName(): string {
  return CSRF_HEADER_NAME;
}

/**
 * Middleware helper to check CSRF token in API routes
 */
export async function checkCSRF(
  request: Request
): Promise<{ valid: boolean; error?: string }> {
  const headerToken = request.headers.get(CSRF_HEADER_NAME);

  if (!headerToken) {
    return { valid: false, error: 'CSRF token missing' };
  }

  const isValid = await validateCSRFToken(headerToken);

  if (!isValid) {
    return { valid: false, error: 'Invalid CSRF token' };
  }

  return { valid: true };
}
