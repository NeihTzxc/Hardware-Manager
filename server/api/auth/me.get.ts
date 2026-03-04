export default defineEventHandler(async (event) => {
    const accessToken = getCookie(event, 'access_token')

    if (!accessToken) {
        throw createError({
            statusCode: 401,
            message: 'Chưa đăng nhập.',
        })
    }

    const payload = verifyAccessToken(accessToken)

    if (!payload) {
        throw createError({
            statusCode: 401,
            message: 'Token không hợp lệ hoặc đã hết hạn.',
        })
    }

    // Fetch user from DB
    const user = await db.user.findUnique({
        where: { id: payload.userId },
        select: {
            id: true,
            email: true,
            name: true,
            createdAt: true,
            updatedAt: true,
        },
    })

    if (!user) {
        throw createError({
            statusCode: 404,
            message: 'Người dùng không tồn tại.',
        })
    }

    return { success: true, user }
})
