import { AuditAction, AuditEntity, logAudit } from '../../utils/audit'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)

    if (!body.domainId && !body.domainName) {
        throw createError({
            statusCode: 400,
            message: 'Tên miền hoặc ID tên miền là bắt buộc.'
        })
    }

    try {
        let finalDomainName = body.domainName

        if (body.domainId) {
            const domain = await db.domain.findUnique({
                where: { id: body.domainId }
            })

            if (!domain) {
                throw createError({
                    statusCode: 404,
                    message: 'Không tìm thấy tên miền này.'
                })
            }
            // Overwrite domainName from the referenced domain if not provided manually
            if (!finalDomainName) {
                finalDomainName = domain.name
            }
        }

        const certificate = await db.sslCertificate.create({
            data: {
                id: generateId('SSL'),
                domainId: body.domainId || null,
                domainName: finalDomainName,
                issuer: body.issuer || null,
                type: body.type || null,
                status: body.status || 'VALID',
                issuedAt: body.issuedAt ? new Date(body.issuedAt) : null,
                expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
                autoRenew: !!body.autoRenew,
                notes: body.notes || null
            }
        })

        await logAudit(event, {
            action: AuditAction.CREATE,
            entity: AuditEntity.SSL_CERTIFICATE,
            entityId: certificate.id,
            details: certificate
        })

        return {
            success: true,
            certificate
        }
    } catch (error: any) {
        console.error('Create certificate error:', error)
        throw createError({
            statusCode: error.statusCode || 500,
            message: error.message || 'Lỗi máy chủ khi thêm chứng chỉ SSL.'
        })
    }
})
