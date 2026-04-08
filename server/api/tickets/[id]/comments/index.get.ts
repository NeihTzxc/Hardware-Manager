import { defineEventHandler, getRouterParam, createError } from 'h3'
import db from '../../../../utils/db'

export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id')
    const auth = event.context.auth

    if (!id || !auth) {
        throw createError({ statusCode: 400, message: 'Invalid params or auth' })
    }

    try {
        const ticket = await db.ticket.findUnique({
            where: { id },
            select: { requesterId: true }
        })

        if (!ticket) {
            throw createError({ statusCode: 404, message: 'Không tìm thấy yêu cầu' })
        }

        if (auth.role !== 'ADMIN' && ticket.requesterId !== auth.userId) {
            throw createError({ statusCode: 403, message: 'Forbidden' })
        }

        const query = {
            where: {
                ticketId: id,
                ...(auth.role !== 'ADMIN' ? { isInternal: false } : {})
            },
            include: {
                author: { select: { id: true, name: true, role: true } }
            },
            orderBy: { createdAt: 'asc' as const }
        }

        const comments = await db.ticketComment.findMany(query)

        return {
            success: true,
            comments
        }
    } catch (error: any) {
        if (error.statusCode) throw error
        throw createError({
            statusCode: 500,
            message: 'Lỗi server khi lấy lịch sử/bình luận.'
        })
    }
})
