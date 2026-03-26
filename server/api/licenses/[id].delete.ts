import { AuditAction, AuditEntity, logAudit } from '../../utils/audit'

export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id')

    try {
        const license = await db.license.findUnique({
            where: { id }
        })

        if (!license) {
            throw createError({
                statusCode: 404,
                message: 'Không tìm thấy license này.'
            })
        }

        await db.license.delete({
            where: { id }
        })

        await logAudit(event, {
            action: AuditAction.DELETE,
            entity: AuditEntity.LICENSE,
            entityId: id,
            details: license
        })

        return {
            success: true,
            message: 'Đã xóa license thành công.'
        }
    } catch (error: any) {
        console.error('Delete license error:', error)
        throw createError({
            statusCode: error.statusCode || 500,
            message: error.message || 'Lỗi máy chủ khi xóa license.'
        })
    }
})
