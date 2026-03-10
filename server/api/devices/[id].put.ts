export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id')
    const body = await readBody(event)

    if (!id) {
        throw createError({
            statusCode: 400,
            message: 'ID thiết bị là bắt buộc.'
        })
    }

    // Validation
    if (!body.name || !body.serialNumber || !body.categoryId) {
        throw createError({
            statusCode: 400,
            message: 'Tên, số Serial và Danh mục là bắt buộc.'
        })
    }

    try {
        // Check if device exists
        const device = await db.device.findUnique({
            where: { id }
        })

        if (!device) {
            throw createError({
                statusCode: 404,
                message: 'Không tìm thấy thiết bị.'
            })
        }

        // Check if serial number already exists for OTHER devices
        const existingDevice = await db.device.findFirst({
            where: {
                serialNumber: body.serialNumber,
                NOT: { id }
            }
        })

        if (existingDevice) {
            throw createError({
                statusCode: 400,
                message: 'Số Serial này đã tồn tại trong hệ thống.'
            })
        }

        // Update the device
        const updatedDevice = await db.device.update({
            where: { id },
            data: {
                name: body.name,
                serialNumber: body.serialNumber,
                model: body.model || null,
                manufacturer: body.manufacturer || null,
                categoryId: body.categoryId,
                status: body.status || device.status,
                condition: body.condition || device.condition
            }
        })

        return {
            success: true,
            device: updatedDevice
        }
    } catch (error: any) {
        console.error('Update device error:', error)
        throw createError({
            statusCode: error.statusCode || 500,
            message: error.message || 'Lỗi máy chủ khi cập nhật thiết bị.'
        })
    }
})
