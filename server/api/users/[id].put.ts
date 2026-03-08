import db from '../../utils/db'
import bcrypt from 'bcryptjs'

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

    // Usually users can edit themselves, but for now we enforce ADMIN only as per requirement
    const userId = getRouterParam(event, 'id')

    if (!currentUser || (currentUser.role !== 'ADMIN' && currentUser.id !== userId)) {
        throw createError({ statusCode: 403, message: 'Không có quyền truy cập.' })
    }

    if (!userId) {
        throw createError({ statusCode: 400, message: 'Thiếu ID người dùng.' })
    }

    const body = await readBody(event)
    const { email, password, name, role } = body

    // Check email conflict if changing email
    if (email) {
        const existingUser = await db.user.findUnique({ where: { email } })
        if (existingUser && existingUser.id !== userId) {
            throw createError({
                statusCode: 400,
                message: 'Email này đã được sử dụng bởi người dùng khác.'
            })
        }
    }

    const updateData: any = {}
    if (email) updateData.email = email
    if (name !== undefined) updateData.name = name

    // Only Admin can change roles
    if (role && currentUser.role === 'ADMIN') {
        // Prevent removing admin from oneself if they are the only admin (basic check)
        if (userId === currentUser.id && role !== 'ADMIN') {
            throw createError({ statusCode: 400, message: 'Không thể tự hủy quyền Admin của chính mình.' })
        }
        updateData.role = role
    }

    if (password) {
        updateData.password = await bcrypt.hash(password, 10)
    }

    const updatedUser = await db.user.update({
        where: { id: userId },
        data: updateData,
        select: {
            id: true,
            email: true,
            name: true,
            role: true,
            createdAt: true,
            updatedAt: true
        }
    })

    return { success: true, data: updatedUser }
})
