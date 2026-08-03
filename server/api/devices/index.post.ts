import { AuditAction, AuditEntity, logAudit } from '../../utils/audit'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)

    // Validation
    if (!body.name || !body.categoryId) {
        throw createError({
            statusCode: 400,
            message: 'Tên và Danh mục là bắt buộc.'
        })
    }

    try {
        const serialNumber = String(body.serialNumber || '').trim() || null
        const existingDevice = serialNumber
            ? await db.device.findUnique({ where: { serialNumber } })
            : null

        if (existingDevice) {
            throw createError({
                statusCode: 400,
                message: 'Số Serial này đã tồn tại trong hệ thống.'
            })
        }

        // Create the device
        const device = await db.device.create({
            data: {
                id: generateId('DEV'),
                name: body.name,
                serialNumber,
                model: body.model || null,
                manufacturer: body.manufacturer || null,
                categoryId: body.categoryId,
                status: 'AVAILABLE',
                condition: 'NEW'
            }
        })

        // Audit log
        await logAudit(event, {
            action: AuditAction.CREATE,
            entity: AuditEntity.DEVICE,
            entityId: device.id,
            details: device
        })

        return {
            success: true,
            device
        }
    } catch (error: any) {
        console.error('Create device error:', error)
        throw createError({
            statusCode: error.statusCode || 500,
            message: error.message || 'Lỗi máy chủ khi tạo thiết bị.'
        })
    }
})
