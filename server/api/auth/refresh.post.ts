export default defineEventHandler(async (event) => {
    const refreshTokenCookie = getCookie(event, 'refresh_token')

    if (!refreshTokenCookie) {
        throw createError({
            statusCode: 401,
            message: 'Refresh token không tìm thấy.',
        })
    }

    try {
        // Verify the refresh token JWT
        const payload = verifyRefreshToken(refreshTokenCookie)

        if (!payload) {
            // Invalid token — clear cookies
            deleteCookie(event, 'access_token')
            deleteCookie(event, 'refresh_token')
            throw createError({
                statusCode: 401,
                message: 'Refresh token không hợp lệ hoặc đã hết hạn.',
            })
        }

        // Check if refresh token exists in DB
        const storedToken = await prismaBase.refreshToken.findUnique({
            where: { token: refreshTokenCookie },
            include: { user: true },
        })

        if (!storedToken || storedToken.expiresAt < new Date()) {
            // Token not in DB or expired — delete it and clear cookies
            if (storedToken) {
                await prismaBase.refreshToken.deleteMany({ where: { id: storedToken.id } })
            }
            deleteCookie(event, 'access_token')
            deleteCookie(event, 'refresh_token')
            throw createError({
                statusCode: 401,
                message: 'Refresh token đã hết hạn. Vui lòng đăng nhập lại.',
            })
        }

        const user = storedToken.user

        // Token rotation — delete old (silently if already gone due to race condition)
        await prismaBase.refreshToken.deleteMany({ where: { id: storedToken.id } })

        const newAccessToken = generateAccessToken(user)
        const newRefreshToken = generateRefreshToken(user)

        await prismaBase.refreshToken.create({
            data: {
                token: newRefreshToken,
                userId: user.id,
                expiresAt: getRefreshTokenExpiry(),
            },
        })

        // Set new cookies
        setCookie(event, 'access_token', newAccessToken, ACCESS_COOKIE_OPTIONS)
        setCookie(event, 'refresh_token', newRefreshToken, REFRESH_COOKIE_OPTIONS)

        return { success: true }
    } catch (err: any) {
        if (err.statusCode) throw err
        
        console.error('Refresh Token Error:', err)
        throw createError({
            statusCode: 401,
            message: 'Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.',
        })
    }
})
