export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id')
    const body = await readBody(event)

    if (!id) {
        throw createError({
            statusCode: 400,
            message: 'ID danh mục là bắt buộc.'
        })
    }

    // Validation
    if (!body.name) {
        throw createError({
            statusCode: 400,
            message: 'Tên danh mục là bắt buộc.'
        })
    }

    try {
        // Check if category exists
        const category = await db.category.findUnique({
            where: { id }
        })

        if (!category) {
            throw createError({
                statusCode: 404,
                message: 'Không tìm thấy danh mục.'
            })
        }

        // Check name uniqueness if changed
        if (body.name !== category.name) {
            const existingCategory = await db.category.findUnique({
                where: { name: body.name }
            })
            if (existingCategory) {
                throw createError({
                    statusCode: 400,
                    message: 'Tên danh mục này đã tồn tại.'
                })
            }
        }

        // Update the category
        const updatedCategory = await db.category.update({
            where: { id },
            data: {
                name: body.name,
                description: body.description || null
            }
        })

        return {
            success: true,
            category: updatedCategory
        }
    } catch (error: any) {
        console.error('Update category error:', error)
        throw createError({
            statusCode: error.statusCode || 500,
            message: error.message || 'Lỗi máy chủ khi cập nhật danh mục.'
        })
    }
})
