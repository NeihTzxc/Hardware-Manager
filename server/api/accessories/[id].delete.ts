export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id')

    if (!id) {
        throw createError({
            statusCode: 400,
            message: 'ID phụ kiện là bắt buộc.'
        })
    }

    try {
        const accessory = await db.accessory.findUnique({
            where: { id },
            include: {
                checkouts: {
                    where: { returnedAt: null },
                    select: { id: true }
                }
            }
        })

        if (!accessory) {
            throw createError({
                statusCode: 404,
                message: 'Không tìm thấy phụ kiện.'
            })
        }

        if (accessory.checkouts.length > 0) {
            throw createError({
                statusCode: 400,
                message: 'Không thể xóa phụ kiện đang được cấp phát. Vui lòng thu hồi trước.'
            })
        }

        await db.accessory.delete({ where: { id } })

        return {
            success: true,
            message: 'Phụ kiện đã được xóa thành công.'
        }
    } catch (error: any) {
        console.error('Delete accessory error:', error)
        throw createError({
            statusCode: error.statusCode || 500,
            message: error.message || 'Lỗi máy chủ khi xóa phụ kiện.'
        })
    }
})
