export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id')

    if (!id) {
        throw createError({
            statusCode: 400,
            message: 'ID linh kiện là bắt buộc.'
        })
    }

    try {
        const component = await db.component.findUnique({ where: { id } })

        if (!component) {
            throw createError({
                statusCode: 404,
                message: 'Không tìm thấy linh kiện.'
            })
        }

        if (component.status === 'INSTALLED') {
            throw createError({
                statusCode: 400,
                message: 'Không thể xóa linh kiện đang được lắp trong thiết bị. Vui lòng tháo ra trước.'
            })
        }

        await db.component.delete({ where: { id } })

        return {
            success: true,
            message: 'Linh kiện đã được xóa thành công.'
        }
    } catch (error: any) {
        console.error('Delete component error:', error)
        throw createError({
            statusCode: error.statusCode || 500,
            message: error.message || 'Lỗi máy chủ khi xóa linh kiện.'
        })
    }
})
