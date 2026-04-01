import { describe, it, expect, vi, beforeEach } from 'vitest'
import { 
    generateAccessToken, 
    generateRefreshToken, 
    verifyAccessToken, 
    verifyRefreshToken,
    ACCESS_COOKIE_OPTIONS,
    REFRESH_COOKIE_OPTIONS,
    getRefreshTokenExpiry
} from './jwt'

// Mock environment variables
process.env.JWT_SECRET = 'test-access-secret'
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret'

describe('JWT Utilities', () => {
    const user = { id: 'USR-123', email: 'test@example.com' }

    describe('AccessToken', () => {
        it('should generate and verify a valid access token', () => {
            const token = generateAccessToken(user)
            const payload = verifyAccessToken(token)
            
            expect(payload).not.toBeNull()
            expect(payload?.userId).toBe(user.id)
            expect(payload?.email).toBe(user.email)
        })

        it('should return null for invalid access token', () => {
            const payload = verifyAccessToken('invalid-token')
            expect(payload).toBeNull()
        })
    })

    describe('RefreshToken', () => {
        it('should generate and verify a valid refresh token', () => {
            const token = generateRefreshToken(user)
            const payload = verifyRefreshToken(token)
            
            expect(payload).not.toBeNull()
            expect(payload?.userId).toBe(user.id)
            expect(payload?.email).toBe(user.email)
        })

        it('should return null for invalid refresh token', () => {
            const payload = verifyRefreshToken('invalid-token')
            expect(payload).toBeNull()
        })

        it('should expire refresh token correctly', () => {
             // Mock Date.now to test expiration
             vi.useFakeTimers()
             const now = new Date('2026-01-01T00:00:00Z').getTime()
             vi.setSystemTime(now)

             const token = generateRefreshToken(user)
             
             // Move forward 30 days and 1 second
             const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000
             vi.advanceTimersByTime(thirtyDaysMs + 1000)

             const payload = verifyRefreshToken(token)
             expect(payload).toBeNull()
             
             vi.useRealTimers()
        })
    })

    describe('Cookie Options', () => {
        it('should have consistent maxAge for refresh token', () => {
            // maxAge 30 days = 2592000 seconds
            expect(REFRESH_COOKIE_OPTIONS.maxAge).toBe(30 * 24 * 60 * 60)
        })

        it('should have consistent maxAge for access token', () => {
            // maxAge 15 minutes = 900 seconds
            expect(ACCESS_COOKIE_OPTIONS.maxAge).toBe(15 * 60)
        })
    })

    describe('Database Expiry', () => {
        it('should return a date 30 days in the future', () => {
            vi.useFakeTimers()
            const now = new Date('2026-01-01T00:00:00Z').getTime()
            vi.setSystemTime(now)
            
            const expiry = getRefreshTokenExpiry()
            const expected = new Date(now + 30 * 24 * 60 * 60 * 1000)
            
            expect(expiry.getTime()).toBe(expected.getTime())
            vi.useRealTimers()
        })
    })
})
