export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id')
    const body = await readBody(event)

    if (!id) {
        throw createError({
            statusCode: 400,
            message: 'ID linh kiện là bắt buộc.'
        })
    }

    if (!body.name || !body.categoryId) {
        throw createError({
            statusCode: 400,
            message: 'Tên và Danh mục là bắt buộc.'
        })
    }

    try {
        const existing = await db.component.findUnique({ where: { id } })

        if (!existing) {
            throw createError({
                statusCode: 404,
                message: 'Không tìm thấy linh kiện.'
            })
        }

        const component = await db.component.update({
            where: { id },
            data: {
                name: body.name,
                serialNumber: body.serialNumber || null,
                categoryId: body.categoryId,
                manufacturer: body.manufacturer || null,
                status: body.status || existing.status,
                purchaseDate: body.purchaseDate ? new Date(body.purchaseDate) : null,
                purchasePrice: body.purchasePrice ? parseFloat(body.purchasePrice) : null,
                warrantyExpiry: body.warrantyExpiry ? new Date(body.warrantyExpiry) : null,
                notes: body.notes || null,
                supplierId: body.supplierId || null,
                locationId: body.locationId || null
            }
        })

        return {
            success: true,
            component
        }
    } catch (error: any) {
        console.error('Update component error:', error)
        throw createError({
            statusCode: error.statusCode || 500,
            message: error.message || 'Lỗi máy chủ khi cập nhật linh kiện.'
        })
    }
})
