import { AuditAction, AuditEntity, logAudit } from '../../utils/audit'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)

    if (!body.name) {
        throw createError({
            statusCode: 400,
            message: 'Tên phần mềm là bắt buộc.'
        })
    }

    try {
        const existingSoftware = await db.software.findUnique({
            where: { name: body.name }
        })

        if (existingSoftware) {
            throw createError({
                statusCode: 400,
                message: 'Phần mềm này đã tồn tại trong hệ thống.'
            })
        }

        const software = await db.software.create({
            data: {
                id: generateId('SFT'),
                name: body.name,
                vendor: body.vendor || null,
                version: body.version || null,
                category: body.category || null,
                website: body.website || null,
                notes: body.notes || null
            }
        })

        await logAudit(event, {
            action: AuditAction.CREATE,
            entity: AuditEntity.SOFTWARE,
            entityId: software.id,
            details: software
        })

        return {
            success: true,
            software
        }
    } catch (error: any) {
        console.error('Create software error:', error)
        throw createError({
            statusCode: error.statusCode || 500,
            message: error.message || 'Lỗi máy chủ khi tạo phần mềm.'
        })
    }
})
