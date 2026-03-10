export default defineEventHandler(async (event) => {
    const body = await readBody(event)

    // Validation
    if (!body.name) {
        throw createError({
            statusCode: 400,
            message: 'Tên danh mục là bắt buộc.'
        })
    }

    try {
        // Check if name already exists
        const existingCategory = await db.category.findUnique({
            where: { name: body.name }
        })

        if (existingCategory) {
            throw createError({
                statusCode: 400,
                message: 'Tên danh mục này đã tồn tại.'
            })
        }

        // Create the category
        const category = await db.category.create({
            data: {
                id: generateId('CAT'),
                name: body.name,
                description: body.description || null
            }
        })

        return {
            success: true,
            category
        }
    } catch (error: any) {
        console.error('Create category error:', error)
        throw createError({
            statusCode: error.statusCode || 500,
            message: error.message || 'Lỗi máy chủ khi tạo danh mục.'
        })
    }
})
