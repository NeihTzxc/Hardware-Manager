import { AuditAction, AuditEntity, logAudit } from '../../../utils/audit'

type ReclaimItem = {
    assignmentId: string
    conditionAfter?: 'NEW' | 'GOOD' | 'FAIR' | 'POOR' | 'DAMAGED'
    notes?: string
}

export default defineEventHandler(async (event) => {
    const userId = getRouterParam(event, 'id')
    const body = await readBody<{ items?: ReclaimItem[] }>(event) || {}

    const accessToken = getCookie(event, 'access_token')
    const payload = accessToken ? verifyAccessToken(accessToken) : null
    const currentUser = payload
        ? await db.user.findUnique({ where: { id: payload.userId }, select: { role: true } })
        : null
    if (!currentUser || currentUser.role !== 'ADMIN') {
        throw createError({ statusCode: 403, message: 'Không có quyền thực hiện thu hồi thiết bị.' })
    }

    if (!userId || !Array.isArray(body.items) || body.items.length === 0) {
        throw createError({
            statusCode: 400,
            message: 'Cần chọn ít nhất một thiết bị để thu hồi.'
        })
    }

    const itemByAssignmentId = new Map(body.items.map(item => [item.assignmentId, item]))
    if (itemByAssignmentId.size !== body.items.length || [...itemByAssignmentId.keys()].some(id => !id)) {
        throw createError({ statusCode: 400, message: 'Danh sách thiết bị thu hồi không hợp lệ.' })
    }

    try {
        const user = await db.user.findUnique({
            where: { id: userId },
            select: { id: true, name: true, email: true }
        })
        if (!user) {
            throw createError({ statusCode: 404, message: 'Không tìm thấy nhân viên.' })
        }

        const activeAssignments = await db.assignment.findMany({
            where: {
                id: { in: [...itemByAssignmentId.keys()] },
                userId,
                returnedAt: null
            },
            include: { device: { select: { id: true, name: true, condition: true } } }
        })

        if (activeAssignments.length !== itemByAssignmentId.size) {
            throw createError({
                statusCode: 400,
                message: 'Một hoặc nhiều thiết bị không còn được nhân viên này sử dụng.'
            })
        }

        const reclaimedAssignments = await db.$transaction(async (tx) => {
            return Promise.all(activeAssignments.map(async (assignment) => {
                const item = itemByAssignmentId.get(assignment.id)!
                const conditionAfter = item.conditionAfter || assignment.device.condition
                const notes = item.notes?.trim()

                const updatedAssignment = await tx.assignment.update({
                    where: { id: assignment.id },
                    data: {
                        returnedAt: new Date(),
                        conditionAfter,
                        notes: [assignment.notes, '[Thu hồi khi nhân viên nghỉ việc]', notes]
                            .filter(Boolean)
                            .join('\n')
                    }
                })

                await tx.device.update({
                    where: { id: assignment.deviceId },
                    data: { status: 'AVAILABLE', condition: conditionAfter }
                })

                return { assignment, updatedAssignment, conditionAfter, notes }
            }))
        })

        await Promise.all(reclaimedAssignments.map(({ assignment, updatedAssignment, conditionAfter, notes }) =>
            logAudit(event, {
                action: AuditAction.RETURN,
                entity: AuditEntity.ASSIGNMENT,
                entityId: assignment.id,
                details: {
                    old: assignment,
                    new: updatedAssignment,
                    reason: 'EMPLOYEE_OFFBOARDING',
                    userId,
                    conditionAfter,
                    notes: notes || null
                }
            })
        ))

        return {
            success: true,
            count: reclaimedAssignments.length,
            message: `Đã thu hồi ${reclaimedAssignments.length} thiết bị từ ${user.name || user.email}.`
        }
    } catch (error: any) {
        console.error('Reclaim employee devices error:', error)
        throw createError({
            statusCode: error.statusCode || 500,
            message: error.message || 'Không thể thu hồi thiết bị của nhân viên.'
        })
    }
})
