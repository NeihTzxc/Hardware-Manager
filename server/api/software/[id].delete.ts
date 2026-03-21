import { AuditAction, AuditEntity, logAudit } from '../../utils/audit'

export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id')

    try {
        const software = await db.software.findUnique({
            where: { id }
        })

        if (!software) {
            throw createError({
                statusCode: 404,
                message: 'Không tìm thấy phần mềm này.'
            })
        }

        await db.software.delete({
            where: { id }
        })

        await logAudit(event, {
            action: AuditAction.DELETE,
            entity: AuditEntity.SOFTWARE,
            entityId: id,
            details: software
        })

        return {
            success: true,
            message: 'Đã xóa phần mềm thành công.'
        }
    } catch (error: any) {
        console.error('Delete software error:', error)
        throw createError({
            statusCode: error.statusCode || 500,
            message: error.message || 'Lỗi máy chủ khi xóa phần mềm.'
        })
    }
})
