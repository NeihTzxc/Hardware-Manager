import { AuditAction, AuditEntity, logAudit } from '../../utils/audit'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)

    // Validation
    if (!body.name) {
        throw createError({
            statusCode: 400,
            message: 'Tên miền là bắt buộc.'
        })
    }

    try {
        // Check if domain already exists
        const existingDomain = await db.domain.findUnique({
            where: { name: body.name }
        })

        if (existingDomain) {
            throw createError({
                statusCode: 400,
                message: 'Tên miền này đã tồn tại trong hệ thống.'
            })
        }

        // Create the domain
        const domain = await db.domain.create({
            data: {
                id: generateId('DOM'),
                name: body.name,
                registrar: body.registrar || null,
                registeredAt: body.registeredAt ? new Date(body.registeredAt) : null,
                expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
                autoRenew: !!body.autoRenew,
                status: body.status || 'ACTIVE',
                dnsProvider: body.dnsProvider || null,
                nameservers: body.nameservers || null,
                notes: body.notes || null
            }
        })

        // Audit log
        await logAudit(event, {
            action: AuditAction.CREATE,
            entity: AuditEntity.DOMAIN,
            entityId: domain.id,
            details: domain
        })

        return {
            success: true,
            domain
        }
    } catch (error: any) {
        console.error('Create domain error:', error)
        throw createError({
            statusCode: error.statusCode || 500,
            message: error.message || 'Lỗi máy chủ khi tạo tên miền.'
        })
    }
})
