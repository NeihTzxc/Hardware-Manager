import { defineEventHandler, createError, getRouterParam } from 'h3'
import db from '../../../utils/db'

export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id')
    const auth = event.context.auth

    if (!id || !auth) {
        throw createError({
            statusCode: 400,
            message: 'Tham số hoặc quyền không hợp lệ.'
        })
    }

    try {
        const ticket = await db.ticket.findUnique({
            where: { id },
            include: {
                requester: { select: { id: true, name: true, email: true } },
                assignee: { select: { id: true, name: true, email: true } },
                device: { select: { id: true, name: true, serialNumber: true } }
            }
        })

        if (!ticket) {
            throw createError({ statusCode: 404, message: 'Không tìm thấy yêu cầu.' })
        }

        // Access control: only ADMIN or requester can see details
        if (auth.role !== 'ADMIN' && ticket.requesterId !== auth.userId) {
            throw createError({ statusCode: 403, message: 'Bạn không có quyền truy cập.' })
        }

        return {
            success: true,
            ticket
        }
    } catch (error: any) {
        if (error.statusCode) throw error
        console.error('Get ticket error:', error)
        throw createError({
            statusCode: 500,
            message: 'Lỗi khi lấy chi tiết yêu cầu.'
        })
    }
})
