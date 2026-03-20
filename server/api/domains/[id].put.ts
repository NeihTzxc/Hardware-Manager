import { AuditAction, AuditEntity, logAudit } from '../../utils/audit'

export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id')
    const body = await readBody(event)

    try {
        const existing = await db.domain.findUnique({
            where: { id }
        })

        if (!existing) {
            throw createError({
                statusCode: 404,
                message: 'Không tìm thấy tên miền.'
            })
        }

        // Potential name change check
        if (body.name && body.name !== existing.name) {
            const nameConflict = await db.domain.findUnique({
                where: { name: body.name }
            })
            if (nameConflict) {
                throw createError({
                    statusCode: 400,
                    message: 'Tên miền đã tồn tại.'
                })
            }
        }

        const domain = await db.domain.update({
            where: { id },
            data: {
                name: body.name,
                registrar: body.registrar,
                registeredAt: body.registeredAt ? new Date(body.registeredAt) : null,
                expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
                autoRenew: !!body.autoRenew,
                status: body.status,
                dnsProvider: body.dnsProvider,
                nameservers: body.nameservers,
                notes: body.notes
            }
        })

        // Audit log
        await logAudit(event, {
            action: AuditAction.UPDATE,
            entity: AuditEntity.DOMAIN,
            entityId: domain.id,
            details: {
                old: existing,
                new: domain
            }
        })

        return {
            success: true,
            domain
        }
    } catch (error: any) {
        console.error('Update domain error:', error)
        throw createError({
            statusCode: error.statusCode || 500,
            message: error.message || 'Lỗi máy chủ khi cập nhật tên miền.'
        })
    }
})
