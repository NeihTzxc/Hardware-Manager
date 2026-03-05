import db from '../../utils/db'

export default defineEventHandler(async (event) => {
    // Check auth and role
    const accessToken = getCookie(event, 'access_token')
    if (!accessToken) {
        throw createError({ statusCode: 401, message: 'Chưa đăng nhập.' })
    }

    const payload = verifyAccessToken(accessToken)
    if (!payload) {
        throw createError({ statusCode: 401, message: 'Token không hợp lệ.' })
    }

    const currentUser = await db.user.findUnique({ where: { id: payload.userId } })

    if (!currentUser || currentUser.role !== 'ADMIN') {
        throw createError({ statusCode: 403, message: 'Không có quyền truy cập.' })
    }

    const userId = getRouterParam(event, 'id')

    if (!userId) {
        throw createError({ statusCode: 400, message: 'Thiếu ID người dùng.' })
    }

    if (userId === currentUser.id) {
        throw createError({ statusCode: 400, message: 'Không thể xóa chính tài khoản đang đăng nhập.' })
    }

    try {
        await db.user.delete({
            where: { id: userId }
        })

        return { success: true, message: 'Đã xóa người dùng.' }
    } catch (err) {
        throw createError({
            statusCode: 400,
            message: 'Không thể xóa người dùng này. Có thể họ đang có thiết bị đang mượn.'
        })
    }
})
