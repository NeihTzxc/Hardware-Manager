export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id')

    if (!id) {
        throw createError({
            statusCode: 400,
            message: 'ID danh mục là bắt buộc.'
        })
    }

    try {
        // Check if category exists
        const category = await db.category.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { devices: true }
                }
            }
        })

        if (!category) {
            throw createError({
                statusCode: 404,
                message: 'Không tìm thấy danh mục.'
            })
        }

        // Check if category has devices
        if (category._count.devices > 0) {
            throw createError({
                statusCode: 400,
                message: 'Không thể xóa danh mục đang có thiết bị. Vui lòng chuyển hoặc xóa thiết bị trước.'
            })
        }

        // Delete the category
        await db.category.delete({
            where: { id }
        })

        return {
            success: true,
            message: 'Danh mục đã được xóa thành công.'
        }
    } catch (error: any) {
        console.error('Delete category error:', error)
        throw createError({
            statusCode: error.statusCode || 500,
            message: error.message || 'Lỗi máy chủ khi xóa danh mục.'
        })
    }
})
