export default defineEventHandler(async (event) => {
    const accessToken = getCookie(event, 'access_token')
    let payload = accessToken ? verifyAccessToken(accessToken) : null

    // Nếu access_token không hợp lệ hoặc không có, thử dùng refresh_token
    if (!payload) {
        const refreshTokenCookie = getCookie(event, 'refresh_token')

        if (!refreshTokenCookie) {
            throw createError({ statusCode: 401, message: 'Chưa đăng nhập.' })
        }

        const refreshPayload = verifyRefreshToken(refreshTokenCookie)

        if (!refreshPayload) {
            deleteCookie(event, 'access_token')
            deleteCookie(event, 'refresh_token')
            throw createError({ statusCode: 401, message: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.' })
        }

        // Kiểm tra refresh_token trong DB
        const storedToken = await prismaBase.refreshToken.findUnique({
            where: { token: refreshTokenCookie },
            include: { user: true },
        })

        if (!storedToken || storedToken.expiresAt < new Date()) {
            if (storedToken) {
                await prismaBase.refreshToken.delete({ where: { id: storedToken.id } })
            }
            deleteCookie(event, 'access_token')
            deleteCookie(event, 'refresh_token')
            throw createError({ statusCode: 401, message: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.' })
        }

        // Token hợp lệ → CHỈ cấp access_token mới, KHÔNG rotate refresh_token
        // Lý do: SSR có thể gọi song song nhiều request, nếu rotate sẽ gây race condition
        // (request đầu xóa token khỏi DB, request sau không tìm thấy → logout)
        // Token rotation vẫn xảy ra bình thường ở /api/auth/refresh khi client gọi tường minh
        const user = storedToken.user
        const newAccessToken = generateAccessToken(user)
        setCookie(event, 'access_token', newAccessToken, ACCESS_COOKIE_OPTIONS)

        const { password: _, ...userWithoutPassword } = user
        return { success: true, user: userWithoutPassword }
    }

    // access_token hợp lệ → fetch user từ DB bình thường
    const user = await db.user.findUnique({
        where: { id: payload.userId },
        select: {
            id: true,
            email: true,
            name: true,
            role: true,
            createdAt: true,
            updatedAt: true,
        },
    })

    if (!user) {
        throw createError({ statusCode: 404, message: 'Người dùng không tồn tại.' })
    }

    return { success: true, user }
})
