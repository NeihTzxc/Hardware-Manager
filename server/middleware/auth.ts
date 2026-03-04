export default defineEventHandler(async (event) => {
    const url = getRequestURL(event)

    // Skip auth check for auth routes and public assets
    if (
        url.pathname.startsWith('/api/auth/') ||
        !url.pathname.startsWith('/api/')
    ) {
        return
    }

    const accessToken = getCookie(event, 'access_token')

    if (!accessToken) {
        throw createError({
            statusCode: 401,
            message: 'Chưa đăng nhập. Vui lòng đăng nhập để tiếp tục.',
        })
    }

    const payload = verifyAccessToken(accessToken)

    if (!payload) {
        throw createError({
            statusCode: 401,
            message: 'Token không hợp lệ hoặc đã hết hạn.',
        })
    }

    // Attach user info to event context for downstream handlers
    event.context.auth = {
        userId: payload.userId,
        email: payload.email,
    }
})
