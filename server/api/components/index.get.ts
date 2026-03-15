export default defineEventHandler(async (event) => {
    try {
        const components = await db.component.findMany({
            include: {
                category: {
                    select: { id: true, name: true }
                },
                supplier: {
                    select: { id: true, name: true }
                },
                location: {
                    select: { id: true, name: true }
                },
                device: {
                    select: { id: true, name: true, serialNumber: true }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        return {
            success: true,
            components
        }
    } catch (error: any) {
        console.error('Fetch components error:', error)
        throw createError({
            statusCode: 500,
            message: 'Không thể lấy danh sách linh kiện.'
        })
    }
})
