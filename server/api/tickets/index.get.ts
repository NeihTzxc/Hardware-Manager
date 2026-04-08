import { defineEventHandler, getQuery, createError } from 'h3'
import db from '../../utils/db'

export default defineEventHandler(async (event) => {
    // Check authentication and user role
    const auth = event.context.auth
    if (!auth) {
        throw createError({ statusCode: 401, message: 'Unauthorized' })
    }

    const role = auth.role
    const userId = auth.userId

    const query = getQuery(event)
    const status = query.status as string | undefined
    const priority = query.priority as string | undefined
    const type = query.type as string | undefined

    try {
        const where: any = {}

        // If user is not admin and not support, they can only see their own tickets
        // The prompt says "Admin/support", assuming 'ADMIN' role here.
        if (role !== 'ADMIN') {
            where.requesterId = userId
        }

        if (status) {
            where.status = status
        }

        if (priority) {
            where.priority = priority
        }

        if (type) {
            where.type = type
        }

        const tickets = await db.ticket.findMany({
            where,
            include: {
                requester: {
                    select: { id: true, name: true, email: true }
                },
                assignee: {
                    select: { id: true, name: true, email: true }
                },
                device: {
                    select: { id: true, name: true, serialNumber: true }
                }
            },
            orderBy: {
                createdAt: 'desc' // List newest tickets first by default
            }
        })

        return {
            success: true,
            tickets
        }
    } catch (error: any) {
        console.error('Fetch tickets error:', error)
        throw createError({
            statusCode: 500,
            message: 'Không thể lấy danh sách yêu cầu.'
        })
    }
})
