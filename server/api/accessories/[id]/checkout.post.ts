export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id')
    const body = await readBody(event)

    if (!id) {
        throw createError({
            statusCode: 400,
            message: 'ID phụ kiện là bắt buộc.'
        })
    }

    if (!body.userId) {
        throw createError({
            statusCode: 400,
            message: 'Vui lòng chọn người nhận.'
        })
    }

    const quantity = parseInt(body.quantity) || 1
    if (quantity < 1) {
        throw createError({
            statusCode: 400,
            message: 'Số lượng phải lớn hơn 0.'
        })
    }

    try {
        // Check accessory exists and has enough stock
        const accessory = await db.accessory.findUnique({
            where: { id },
            include: {
                checkouts: {
                    where: { returnedAt: null },
                    select: { quantity: true }
                }
            }
        })

        if (!accessory) {
            throw createError({
                statusCode: 404,
                message: 'Không tìm thấy phụ kiện.'
            })
        }

        const checkedOut = accessory.checkouts.reduce((sum, c) => sum + c.quantity, 0)
        const available = accessory.totalQuantity - checkedOut

        if (quantity > available) {
            throw createError({
                statusCode: 400,
                message: `Không đủ số lượng. Hiện chỉ còn ${available} khả dụng.`
            })
        }

        // Check user exists
        const user = await db.user.findUnique({ where: { id: body.userId } })
        if (!user) {
            throw createError({
                statusCode: 404,
                message: 'Không tìm thấy người dùng.'
            })
        }

        const checkout = await db.accessoryCheckout.create({
            data: {
                accessoryId: id,
                userId: body.userId,
                quantity,
                notes: body.notes || null
            }
        })

        return {
            success: true,
            checkout,
            message: `Đã cấp phát ${quantity} "${accessory.name}" cho "${user.name || user.email}".`
        }
    } catch (error: any) {
        console.error('Checkout accessory error:', error)
        throw createError({
            statusCode: error.statusCode || 500,
            message: error.message || 'Lỗi máy chủ khi cấp phát phụ kiện.'
        })
    }
})
