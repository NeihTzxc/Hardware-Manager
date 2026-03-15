export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id')
    const body = await readBody(event)

    if (!id) {
        throw createError({
            statusCode: 400,
            message: 'ID phụ kiện là bắt buộc.'
        })
    }

    if (!body.name || !body.categoryId) {
        throw createError({
            statusCode: 400,
            message: 'Tên và Danh mục là bắt buộc.'
        })
    }

    try {
        const existing = await db.accessory.findUnique({ where: { id } })

        if (!existing) {
            throw createError({
                statusCode: 404,
                message: 'Không tìm thấy phụ kiện.'
            })
        }

        const accessory = await db.accessory.update({
            where: { id },
            data: {
                name: body.name,
                categoryId: body.categoryId,
                manufacturer: body.manufacturer || null,
                totalQuantity: body.totalQuantity !== undefined ? parseInt(body.totalQuantity) : existing.totalQuantity,
                minQuantity: body.minQuantity !== undefined ? parseInt(body.minQuantity) : existing.minQuantity,
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
        console.error('Update accessory error:', error)
        throw createError({
            statusCode: error.statusCode || 500,
            message: error.message || 'Lỗi máy chủ khi cập nhật phụ kiện.'
        })
    }
})
