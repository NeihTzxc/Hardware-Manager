import { AuditAction, AuditEntity, logAudit } from '../../utils/audit'

export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id')
    const body = await readBody(event)

    try {
        const existingSoftware = await db.software.findUnique({
            where: { id }
        })

        if (!existingSoftware) {
            throw createError({
                statusCode: 404,
                message: 'Không tìm thấy phần mềm này.'
            })
        }

        if (body.name && body.name !== existingSoftware.name) {
            const nameConflict = await db.software.findUnique({
                where: { name: body.name }
            })

            if (nameConflict) {
                throw createError({
                    statusCode: 400,
                    message: 'Tên phần mềm này đã được sử dụng.'
                })
            }
        }

        const software = await db.software.update({
            where: { id },
            data: {
                name: body.name,
                vendor: body.vendor,
                version: body.version,
                category: body.category,
                website: body.website,
                notes: body.notes
            }
        })

        await logAudit(event, {
            action: AuditAction.UPDATE,
            entity: AuditEntity.SOFTWARE,
            entityId: id,
            details: {
                before: existingSoftware,
                after: software
            }
        })

        return {
            success: true,
            software
        }
    } catch (error: any) {
        console.error('Update software error:', error)
        throw createError({
            statusCode: error.statusCode || 500,
            message: error.message || 'Lỗi máy chủ khi cập nhật phần mềm.'
        })
    }
})
