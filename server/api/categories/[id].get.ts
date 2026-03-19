export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id')

    if (!id) {
        throw createError({
            statusCode: 400,
            message: 'Thiếu ID danh mục.'
        })
    }

    try {
        const category = await db.category.findUnique({
            where: { id },
            include: {
                devices: {
                    select: {
                        id: true,
                        name: true,
                        status: true,
                        serialNumber: true
                    },
                    orderBy: {
                        createdAt: 'desc'
                    }
                },
                components: {
                    select: {
                        id: true,
                        name: true,
                        status: true,
                        serialNumber: true
                    },
                    orderBy: {
                        createdAt: 'desc'
                    }
                },
                accessories: {
                    select: {
                        id: true,
                        name: true,
                        totalQuantity: true
                    },
                    orderBy: {
                        createdAt: 'desc'
                    }
                }
            }
        })

        if (!category) {
            throw createError({
                statusCode: 404,
                message: 'Không tìm thấy danh mục.'
            })
        }

        return {
            success: true,
            category
        }
    } catch (error: any) {
        console.error('Fetch category detail error:', error)
        throw createError({
            statusCode: error.statusCode || 500,
            message: error.message || 'Không thể lấy thông tin danh mục.'
        })
    }
})
