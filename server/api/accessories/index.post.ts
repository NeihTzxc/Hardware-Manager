export default defineEventHandler(async (event) => {
    const body = await readBody(event)

    if (!body.name || !body.categoryId) {
        throw createError({
            statusCode: 400,
            message: 'Tên và Danh mục là bắt buộc.'
        })
    }

    if (!body.totalQuantity || body.totalQuantity < 0) {
        throw createError({
            statusCode: 400,
            message: 'Số lượng phải lớn hơn hoặc bằng 0.'
        })
    }

    try {
        const accessory = await db.accessory.create({
            data: {
                id: generateId('ACC'),
                name: body.name,
                categoryId: body.categoryId,
                manufacturer: body.manufacturer || null,
                totalQuantity: parseInt(body.totalQuantity),
                minQuantity: body.minQuantity ? parseInt(body.minQuantity) : 0,
                unitPrice: body.unitPrice ? parseFloat(body.unitPrice) : null,
                notes: body.notes || null,
                supplierId: body.supplierId || null,
                locationId: body.locationId || null
            }
        })

        return {
            success: true,
            accessory
        }
    } catch (error: any) {
        console.error('Create accessory error:', error)
        throw createError({
            statusCode: error.statusCode || 500,
            message: error.message || 'Lỗi máy chủ khi tạo phụ kiện.'
        })
    }
})
