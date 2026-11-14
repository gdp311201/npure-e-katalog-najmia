// Server-only module. JANGAN import di client component atau middleware.
// Dipake di: API routes, server components, server actions.

import { scryptSync, randomBytes, timingSafeEqual, createHmac } from 'crypto'

const COOKIE_NAME = 'npure_admin_token'
const TOKEN_EXPIRY_DAYS = 7

function getJwtSecret(): string {
  const secret = process.env.ADMIN_JWT_SECRET
  if (!secret) {
    throw new Error('Missing ADMIN_JWT_SECRET env var. Set it in Vercel.')
  }
  return secret
}

// ============== Password hashing (scrypt — built-in Node) ==============

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex')
  const hash = scryptSync(password, salt, 64).toString('hex')
  return `${salt}:${hash}`
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(':')
  if (!salt || !hash) return false
  try {
    const hashBuf = Buffer.from(hash, 'hex')
    const testBuf = scryptSync(password, salt, 64)
    if (hashBuf.length !== testBuf.length) return false
    return timingSafeEqual(hashBuf, testBuf)
  } catch {
    return false
  }
}

// ============== Token (HMAC-SHA256, JWT-like) ==============

export type TokenPayload = {
  sub: string
  username: string
  name: string
  role: 'admin' | 'editor'
  exp: number
}

export function createToken(payload: Omit<TokenPayload, 'exp'>): string {
  const exp = Math.floor(Date.now() / 1000) + TOKEN_EXPIRY_DAYS * 86400
  const secret = getJwtSecret()
  const data = Buffer.from(JSON.stringify({ ...payload, exp })).toString('base64url')
  const sig = createHmac('sha256', secret).update(data).digest('base64url')
  return `${data}.${sig}`
}

export function verifyToken(token: string): TokenPayload | null {
  const [data, sig] = token.split('.')
  if (!data || !sig) return null
  try {
    const secret = getJwtSecret()
    const expectedSig = createHmac('sha256', secret).update(data).digest('base64url')
    const sigBuf = Buffer.from(sig)
    const expectedBuf = Buffer.from(expectedSig)
    if (sigBuf.length !== expectedBuf.length) return false as any
    if (!timingSafeEqual(sigBuf, expectedBuf)) return null
    const payload = JSON.parse(
      Buffer.from(data, 'base64url').toString()
    ) as TokenPayload
    if (payload.exp < Math.floor(Date.now() / 1000)) return null
    return payload
  } catch {
    return null
  }
}

export function getCookieName(): string {
  return COOKIE_NAME
}

export function getTokenExpirySeconds(): number {
  return TOKEN_EXPIRY_DAYS * 86400
}
