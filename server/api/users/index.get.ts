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

    // Fetch all users
    const users = await db.user.findMany({
        select: {
            id: true,
            email: true,
            name: true,
            role: true,
            createdAt: true,
            updatedAt: true,
            assignments: {
                where: { returnedAt: null },
                select: {
                    id: true,
                    device: {
                        select: {
                            id: true,
                            name: true,
                            serialNumber: true,
                            condition: true
                        }
                    }
                }
            }
        },
        orderBy: {
            createdAt: 'desc'
        }
    })

    return { success: true, data: users }
})
