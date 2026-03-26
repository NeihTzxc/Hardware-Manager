import { AuditAction, AuditEntity, logAudit } from '../../utils/audit'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)

    if (!body.deviceId || !body.userId) {
        throw createError({
            statusCode: 400,
            message: 'Thiết bị và người nhận là bắt buộc.'
        })
    }

    try {
        const device = await db.device.findUnique({
            where: { id: body.deviceId }
        })

        if (!device) {
            throw createError({
                statusCode: 404,
                message: 'Không tìm thấy thiết bị.'
            })
        }

        if (device.status !== 'AVAILABLE') {
            throw createError({
                statusCode: 400,
                message: 'Thiết bị không sẵn sàng để mượn.'
            })
        }

        const assignment = await db.$transaction(async (tx) => {
            const newAssignment = await tx.assignment.create({
                data: {
                    deviceId: body.deviceId,
                    userId: body.userId,
                    conditionBefore: body.conditionBefore || device.condition,
                    notes: body.notes
                }
            })

            await tx.device.update({
                where: { id: body.deviceId },
                data: {
                    status: 'IN_USE'
                }
            })

            return newAssignment
        })

        // Audit log
        await logAudit(event, {
            action: AuditAction.ASSIGN,
            entity: AuditEntity.ASSIGNMENT,
            entityId: assignment.id,
            details: assignment
        })

        return {
            success: true,
            assignment
        }
    } catch (error: any) {
        console.error('Borrow device error:', error)
        throw createError({
            statusCode: error.statusCode || 500,
            message: error.message || 'Lỗi khi mượn thiết bị.'
        })
    }
})
