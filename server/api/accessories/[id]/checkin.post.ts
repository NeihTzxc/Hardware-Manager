export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id')
    const body = await readBody(event)

    if (!id) {
        throw createError({
            statusCode: 400,
            message: 'ID phụ kiện là bắt buộc.'
        })
    }

    if (!body.checkoutId) {
        throw createError({
            statusCode: 400,
            message: 'ID phiếu cấp phát là bắt buộc.'
        })
    }

    try {
        const checkout = await db.accessoryCheckout.findUnique({
            where: { id: body.checkoutId },
            include: {
                accessory: { select: { name: true } },
                user: { select: { name: true, email: true } }
            }
        })

        if (!checkout) {
            throw createError({
                statusCode: 404,
                message: 'Không tìm thấy phiếu cấp phát.'
            })
        }

        if (checkout.accessoryId !== id) {
            throw createError({
                statusCode: 400,
                message: 'Phiếu cấp phát không thuộc phụ kiện này.'
            })
        }

        if (checkout.returnedAt) {
            throw createError({
                statusCode: 400,
                message: 'Phụ kiện này đã được thu hồi trước đó.'
            })
        }

        const updatedCheckout = await db.accessoryCheckout.update({
            where: { id: body.checkoutId },
            data: { returnedAt: new Date() }
        })

        return {
            success: true,
            checkout: updatedCheckout,
            message: `Đã thu hồi ${checkout.quantity} "${checkout.accessory.name}" từ "${checkout.user.name || checkout.user.email}".`
        }
    } catch (error: any) {
        console.error('Checkin accessory error:', error)
        throw createError({
            statusCode: error.statusCode || 500,
            message: error.message || 'Lỗi máy chủ khi thu hồi phụ kiện.'
        })
    }
})
