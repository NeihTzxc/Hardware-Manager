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
        const component = await db.component.create({
            data: {
                id: generateId('CMP'),
                name: body.name,
                serialNumber: body.serialNumber || null,
                categoryId: body.categoryId,
                manufacturer: body.manufacturer || null,
                status: 'AVAILABLE',
                purchaseDate: body.purchaseDate ? new Date(body.purchaseDate) : null,
                purchasePrice: body.purchasePrice ? parseFloat(body.purchasePrice) : null,
                warrantyExpiry: body.warrantyExpiry ? new Date(body.warrantyExpiry) : null,
                notes: body.notes || null,
                supplierId: body.supplierId || null,
                locationId: body.locationId || null,
                deviceId: body.deviceId || null
            }
        })

        return {
            success: true,
            component
        }
    } catch (error: any) {
        console.error('Create component error:', error)
        throw createError({
            statusCode: error.statusCode || 500,
            message: error.message || 'Lỗi máy chủ khi tạo linh kiện.'
        })
    }
})
