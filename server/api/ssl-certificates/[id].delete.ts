import { AuditAction, AuditEntity, logAudit } from '../../utils/audit'

export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id')

    try {
        const certificate = await db.sslCertificate.findUnique({
            where: { id }
        })

        if (!certificate) {
            throw createError({
                statusCode: 404,
                message: 'Không tìm thấy chứng chỉ SSL.'
            })
        }

        await db.sslCertificate.delete({
            where: { id }
        })

        await logAudit(event, {
            action: AuditAction.DELETE,
            entity: AuditEntity.SSL_CERTIFICATE,
            entityId: id,
            details: certificate
        })

        return {
            success: true,
            message: 'Xóa chứng chỉ SSL thành công.'
        }
    } catch (error: any) {
        console.error('Delete certificate error:', error)
        throw createError({
            statusCode: error.statusCode || 500,
            message: error.message || 'Lỗi máy chủ khi xóa chứng chỉ SSL.'
        })
    }
})
