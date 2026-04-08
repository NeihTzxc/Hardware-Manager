import { defineEventHandler, readBody, createError } from 'h3'
import db from '../../utils/db'
import { generateId } from '../../utils/id'
import { AuditAction, AuditEntity, logAudit } from '../../utils/audit'

export default defineEventHandler(async (event) => {
    const auth = event.context.auth
    if (!auth) {
        throw createError({ statusCode: 401, message: 'Unauthorized' })
    }

    const body = await readBody(event)

    if (!body.title || !body.description) {
        throw createError({
            statusCode: 400,
            message: 'Tiêu đề và nội dung là bắt buộc.'
        })
    }

    try {
        const ticket = await db.ticket.create({
            data: {
                id: generateId('TKT'),
                title: body.title,
                description: body.description,
                type: body.type || 'HARDWARE_REQUEST',
                priority: body.priority || 'MEDIUM',
                status: 'OPEN',
                requesterId: auth.userId,
                deviceId: body.deviceId || null
            }
        })

        await logAudit(event, {
            action: AuditAction.CREATE,
            entity: AuditEntity.TICKET,
            entityId: ticket.id,
            details: { title: ticket.title, type: ticket.type, priority: ticket.priority }
        })

        return {
            success: true,
            ticket
        }
    } catch (error: any) {
        console.error('Create ticket error:', error)
        throw createError({
            statusCode: 500,
            message: 'Lỗi khi tạo yêu cầu mới.'
        })
    }
})
