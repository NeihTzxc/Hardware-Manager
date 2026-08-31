import { AuditAction, AuditEntity, logAudit } from '../../../utils/audit'

export default defineEventHandler(async (event) => {
    const deviceId = getRouterParam(event, 'id')
    const body = await readBody(event)

    if (!deviceId || !body.userId) {
        throw createError({
            statusCode: 400,
            message: 'Thiết bị và người sử dụng mới là bắt buộc.'
        })
    }

    try {
        const device = await db.device.findUnique({
            where: { id: deviceId },
            include: {
                assignments: {
                    where: { returnedAt: null },
                    include: { user: true },
                    orderBy: { assignedAt: 'desc' },
                    take: 1
                }
            }
        })

        if (!device) {
            throw createError({ statusCode: 404, message: 'Không tìm thấy thiết bị.' })
        }

        const newUser = await db.user.findUnique({ where: { id: body.userId } })
        if (!newUser) {
            throw createError({ statusCode: 404, message: 'Không tìm thấy người sử dụng mới.' })
        }

        const currentAssignment = device.assignments[0]
        if (!currentAssignment) {
            throw createError({
                statusCode: 400,
                message: 'Thiết bị hiện không có người sử dụng đang hoạt động.'
            })
        }

        if (currentAssignment.userId === body.userId) {
            throw createError({
                statusCode: 400,
                message: 'Người sử dụng mới trùng với người đang sử dụng.'
            })
        }

        const condition = body.conditionBefore || device.condition
        const result = await db.$transaction(async (tx) => {
            const returnedAssignment = await tx.assignment.update({
                where: { id: currentAssignment.id },
                data: {
                    returnedAt: new Date(),
                    conditionAfter: condition,
                    notes: `${currentAssignment.notes || ''}\n[Đổi người sử dụng]`.trim()
                }
            })

            const newAssignment = await tx.assignment.create({
                data: {
                    deviceId,
                    userId: body.userId,
                    conditionBefore: condition,
                    notes: body.notes || null
                }
            })

            await tx.device.update({
                where: { id: deviceId },
                data: { status: 'IN_USE', condition }
            })

            return { returnedAssignment, newAssignment }
        })

        await logAudit(event, {
            action: AuditAction.RETURN,
            entity: AuditEntity.ASSIGNMENT,
            entityId: result.returnedAssignment.id,
            details: { reason: 'TRANSFER', oldUserId: currentAssignment.userId, newUserId: body.userId }
        })
        await logAudit(event, {
            action: AuditAction.ASSIGN,
            entity: AuditEntity.ASSIGNMENT,
            entityId: result.newAssignment.id,
            details: result.newAssignment
        })

        return {
            success: true,
            assignment: result.newAssignment
        }
    } catch (error: any) {
        console.error('Transfer device user error:', error)
        throw createError({
            statusCode: error.statusCode || 500,
            message: error.message || 'Lỗi khi đổi người sử dụng thiết bị.'
        })
    }
})
