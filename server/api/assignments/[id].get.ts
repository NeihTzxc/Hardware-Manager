export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id')

    if (!id) {
        throw createError({
            statusCode: 400,
            message: 'Thiếu ID cấp phát.'
        })
    }

    try {
        const assignment = await db.assignment.findUnique({
            where: { id },
            include: {
                device: {
                    include: {
                        category: true,
                        location: true
                    }
                },
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        })

        if (!assignment) {
            throw createError({
                statusCode: 404,
                message: 'Không tìm thấy thông tin cấp phát.'
            })
        }

        return {
            success: true,
            assignment
        }
    } catch (error: any) {
        console.error('Fetch assignment detail error:', error)
        throw createError({
            statusCode: error.statusCode || 500,
            message: error.message || 'Không thể lấy thông tin cấp phát.'
        })
    }
})
