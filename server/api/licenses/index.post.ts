import { AuditAction, AuditEntity, logAudit } from '../../utils/audit'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)

    if (!body.softwareId) {
        throw createError({
            statusCode: 400,
            message: 'Phần mềm liên kết là bắt buộc.'
        })
    }

    try {
        const license = await db.license.create({
            data: {
                id: generateId('LIC'),
                softwareId: body.softwareId,
                licenseKey: body.licenseKey || null,
                type: body.type || 'SUBSCRIPTION',
                status: body.status || 'ACTIVE',
                seats: parseInt(body.seats) || 1,
                assignedTo: body.assignedTo || null,
                purchasedAt: body.purchasedAt ? new Date(body.purchasedAt) : null,
                expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
                cost: parseFloat(body.cost) || null,
                notes: body.notes || null
            }
        })

        await logAudit(event, {
            action: AuditAction.CREATE,
            entity: AuditEntity.LICENSE,
            entityId: license.id,
            details: license
        })

        return {
            success: true,
            license
        }
    } catch (error: any) {
        console.error('Create license error:', error)
        throw createError({
            statusCode: error.statusCode || 500,
            message: error.message || 'Lỗi máy chủ khi tạo license.'
        })
    }
})
