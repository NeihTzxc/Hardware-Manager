import { defineEventHandler, readBody, getRouterParam, createError } from 'h3'
import db from '../../../../utils/db'

export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id')
    const auth = event.context.auth

    if (!id || !auth) {
        throw createError({ statusCode: 400, message: 'Invalid params or auth' })
    }

    const body = await readBody(event)

    if (!body.content) {
        throw createError({ statusCode: 400, message: 'Content is required' })
    }

    try {
        const ticket = await db.ticket.findUnique({
            where: { id },
            select: { requesterId: true }
        })

        if (!ticket) {
            throw createError({ statusCode: 404, message: 'Ticket not found' })
        }

        if (auth.role !== 'ADMIN' && ticket.requesterId !== auth.userId) {
            throw createError({ statusCode: 403, message: 'Forbidden' })
        }

        // Only ADMIN can post internal comments
        const isInternal = auth.role === 'ADMIN' ? (body.isInternal || false) : false

        const comment = await db.ticketComment.create({
            data: {
                ticketId: id,
                authorId: auth.userId,
                content: body.content,
                isInternal
            },
            include: {
                author: { select: { id: true, name: true, role: true } }
            }
        })

        return {
            success: true,
            comment
        }
    } catch (error: any) {
        if (error.statusCode) throw error
        throw createError({
            statusCode: 500,
            message: 'Server error creating comment.'
        })
    }
})
