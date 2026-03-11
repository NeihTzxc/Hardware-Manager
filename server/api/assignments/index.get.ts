export default defineEventHandler(async (event) => {
    try {
        const assignments = await db.assignment.findMany({
            include: {
                device: {
                    select: {
                        id: true,
                        name: true,
                        serialNumber: true,
                        model: true
                    }
                },
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            },
            orderBy: {
                assignedAt: 'desc'
            }
        })

        return {
            success: true,
            assignments
        }
    } catch (error: any) {
        console.error('Fetch assignments error:', error)
        throw createError({
            statusCode: 500,
            message: 'Không thể lấy danh sách mượn trả.'
        })
    }
})
