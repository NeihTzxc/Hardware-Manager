import { AuditAction, AuditEntity, logAudit } from '../../utils/audit'

export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id')

    try {
        const domain = await db.domain.findUnique({
            where: { id }
        })

        if (!domain) {
            throw createError({
                statusCode: 404,
                message: 'Không tìm thấy tên miền.'
            })
        }

        await db.domain.delete({
            where: { id }
        })

        // Audit log
        await logAudit(event, {
            action: AuditAction.DELETE,
            entity: AuditEntity.DOMAIN,
            entityId: id,
            details: domain
        })

        return {
            success: true,
            message: 'Xóa tên miền thành công.'
        }
    } catch (error: any) {
        console.error('Delete domain error:', error)
        throw createError({
            statusCode: error.statusCode || 500,
            message: error.message || 'Lỗi máy chủ khi xóa tên miền.'
        })
    }
})
