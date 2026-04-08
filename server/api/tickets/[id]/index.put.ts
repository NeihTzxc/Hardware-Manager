import { defineEventHandler, readBody, createError, getRouterParam } from 'h3'
import db from '../../../utils/db'
import { AuditAction, AuditEntity, logAudit } from '../../../utils/audit'

export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id')
    const auth = event.context.auth

    if (!id || !auth) {
        throw createError({ statusCode: 400, message: 'Invalid params or auth' })
    }

    const body = await readBody(event)

    try {
        const existingTicket = await db.ticket.findUnique({ where: { id } })
        
        if (!existingTicket) {
            throw createError({ statusCode: 404, message: 'Ticket not found' })
        }

        // Note: For simplicity, user can only update description or something if it's still OPEN?
        // But the main spec says admin/support updates status/assignee.
        // Let's enforce that if role !== ADMIN, they can't change assignee or sensitive status.
        if (auth.role !== 'ADMIN') {
            if (body.assigneeId || (body.status && body.status !== existingTicket.status && body.status !== 'CLOSED')) {
                // User can maybe CLOSE their own ticket, but for now we enforce simple rules.
                 throw createError({ statusCode: 403, message: 'Không có quyền cập nhật trạng thái này.' })
            }
        }

        const updatedData: any = {}
        if (body.status) updatedData.status = body.status
        if (body.priority) updatedData.priority = body.priority
        if (body.type) updatedData.type = body.type
        if (body.assigneeId !== undefined) updatedData.assigneeId = body.assigneeId

        const updateLogDescription = `Đã cập nhật trạng thái: ${body.status || existingTicket.status}`
        
        if (Object.keys(updatedData).length === 0) {
            return { success: true, ticket: existingTicket }
        }

        const ticket = await db.ticket.update({
            where: { id },
            data: updatedData
        })

        // Add auto comment for state change if provided
        if (body.status && body.status !== existingTicket.status) {
             await db.ticketComment.create({
                 data: {
                     ticketId: id,
                     authorId: auth.userId,
                     content: `Trạng thái yêu cầu được cập nhật thành: ${body.status}`,
                     isInternal: false
                 }
             })
        }

        await logAudit(event, {
            action: AuditAction.UPDATE,
            entity: AuditEntity.TICKET,
            entityId: id,
            details: updatedData
        })

        return {
            success: true,
            ticket
        }

    } catch (error: any) {
        if (error.statusCode) throw error
        console.error('Update ticket error:', error)
        throw createError({
            statusCode: 500,
            message: 'Lỗi khi cập nhật yêu cầu.'
        })
    }
})
