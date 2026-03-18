export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id')

    if (!id) {
        throw createError({
            statusCode: 400,
            message: 'Thiếu ID phụ kiện.'
        })
    }

    try {
        const accessory = await db.accessory.findUnique({
            where: { id },
            include: {
                category: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                location: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                checkouts: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true
                            }
                        }
                    },
                    orderBy: {
                        checkedOutAt: 'desc'
                    }
                }
            }
        })

        if (!accessory) {
            throw createError({
                statusCode: 404,
                message: 'Không tìm thấy phụ kiện.'
            })
        }

        return {
            success: true,
            accessory
        }
    } catch (error: any) {
        console.error('Fetch accessory detail error:', error)
        throw createError({
            statusCode: error.statusCode || 500,
            message: error.message || 'Không thể lấy thông tin phụ kiện.'
        })
    }
})
