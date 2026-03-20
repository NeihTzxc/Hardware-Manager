import { AuditAction, AuditEntity, logAudit } from '../../utils/audit'

export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id')
    const body = await readBody(event)

    try {
        const existingLicense = await db.license.findUnique({
            where: { id }
        })

        if (!existingLicense) {
            throw createError({
                statusCode: 404,
                message: 'Không tìm thấy license này.'
            })
        }

        const license = await db.license.update({
            where: { id },
            data: {
                softwareId: body.softwareId,
                licenseKey: body.licenseKey,
                type: body.type,
                status: body.status,
                seats: parseInt(body.seats),
                assignedTo: body.assignedTo,
                purchasedAt: body.purchasedAt ? new Date(body.purchasedAt) : null,
                expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
                cost: parseFloat(body.cost),
                notes: body.notes
            }
        })

        await logAudit(event, {
            action: AuditAction.UPDATE,
            entity: AuditEntity.LICENSE,
            entityId: id,
            details: {
                before: existingLicense,
                after: license
            }
        })

        return {
            success: true,
            license
        }
    } catch (error: any) {
        console.error('Update license error:', error)
        throw createError({
            statusCode: error.statusCode || 500,
            message: error.message || 'Lỗi máy chủ khi cập nhật license.'
        })
    }
})
