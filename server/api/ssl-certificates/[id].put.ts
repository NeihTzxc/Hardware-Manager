import { AuditAction, AuditEntity, logAudit } from '../../utils/audit'

export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id')
    const body = await readBody(event)

    try {
        const existing = await db.sslCertificate.findUnique({
            where: { id }
        })

        if (!existing) {
            throw createError({
                statusCode: 404,
                message: 'Không tìm thấy chứng chỉ SSL.'
            })
        }

        const certificate = await db.sslCertificate.update({
            where: { id },
            data: {
                issuer: body.issuer,
                type: body.type,
                status: body.status,
                issuedAt: body.issuedAt ? new Date(body.issuedAt) : null,
                expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
                autoRenew: !!body.autoRenew,
                notes: body.notes
            }
        })

        await logAudit(event, {
            action: AuditAction.UPDATE,
            entity: AuditEntity.SSL_CERTIFICATE,
            entityId: id,
            details: {
                old: existing,
                new: certificate
            }
        })

        return {
            success: true,
            certificate
        }
    } catch (error: any) {
        console.error('Update certificate error:', error)
        throw createError({
            statusCode: error.statusCode || 500,
            message: error.message || 'Lỗi máy chủ khi cập nhật chứng chỉ SSL.'
        })
    }
})
