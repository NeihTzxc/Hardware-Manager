export default defineEventHandler(async (event) => {
    const refreshTokenCookie = getCookie(event, 'refresh_token')

    if (!refreshTokenCookie) {
        throw createError({
            statusCode: 401,
            message: 'Refresh token không tìm thấy.',
        })
    }

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
            await prismaBase.refreshToken.delete({ where: { id: storedToken.id } })
        }
        deleteCookie(event, 'access_token')
        deleteCookie(event, 'refresh_token')
        throw createError({
            statusCode: 401,
            message: 'Refresh token đã hết hạn. Vui lòng đăng nhập lại.',
        })
    }

    const user = storedToken.user

    // Token rotation — delete old, create new
    await prismaBase.refreshToken.delete({ where: { id: storedToken.id } })

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
})
