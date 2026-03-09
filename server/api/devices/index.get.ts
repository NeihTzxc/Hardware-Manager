export default defineEventHandler(async (event) => {
    try {
        const devices = await db.device.findMany({
            include: {
                category: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        return {
            success: true,
            devices
        }
    } catch (error: any) {
        console.error('Fetch devices error:', error)
        throw createError({
            statusCode: 500,
            message: 'Không thể lấy danh sách thiết bị.'
        })
    }
})
