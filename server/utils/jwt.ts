import jwt from 'jsonwebtoken'

interface JwtUserPayload {
    userId: string
    email: string
}

const ACCESS_TOKEN_EXPIRY = '15m'
const REFRESH_TOKEN_EXPIRY = '30d'
const REFRESH_TOKEN_MAX_AGE = 30 * 24 * 60 * 60 // 30 days in seconds

function getSecrets() {
    const accessSecret = process.env.JWT_SECRET
    const refreshSecret = process.env.JWT_REFRESH_SECRET

    if (!accessSecret || !refreshSecret) {
        throw new Error('JWT_SECRET and JWT_REFRESH_SECRET must be set in environment variables')
    }

    return { accessSecret, refreshSecret }
}

export function generateAccessToken(user: { id: string; email: string }): string {
    const { accessSecret } = getSecrets()
    const payload: JwtUserPayload = { userId: user.id, email: user.email }
    return jwt.sign(payload, accessSecret, { expiresIn: ACCESS_TOKEN_EXPIRY })
}

export function generateRefreshToken(user: { id: string; email: string }): string {
    const { refreshSecret } = getSecrets()
    const payload: JwtUserPayload = { userId: user.id, email: user.email }
    return jwt.sign(payload, refreshSecret, { expiresIn: REFRESH_TOKEN_EXPIRY })
}

export function verifyAccessToken(token: string): JwtUserPayload | null {
    try {
        const { accessSecret } = getSecrets()
        return jwt.verify(token, accessSecret) as JwtUserPayload
    } catch {
        return null
    }
}

export function verifyRefreshToken(token: string): JwtUserPayload | null {
    try {
        const { refreshSecret } = getSecrets()
        return jwt.verify(token, refreshSecret) as JwtUserPayload
    } catch {
        return null
    }
}

/** Cookie options for access token */
export const ACCESS_COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 15 * 60, // 15 minutes in seconds
}

/** Cookie options for refresh token */
export const REFRESH_COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: REFRESH_TOKEN_MAX_AGE,
}

/** Refresh token expiry as a Date (for DB storage) */
export function getRefreshTokenExpiry(): Date {
    return new Date(Date.now() + REFRESH_TOKEN_MAX_AGE * 1000)
}
