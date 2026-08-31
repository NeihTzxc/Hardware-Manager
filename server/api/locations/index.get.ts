export default defineEventHandler(async () => {
    try {
        const locations = await db.location.findMany({
            select: { id: true, name: true },
            orderBy: { name: 'asc' }
        })

        return { success: true, locations }
    } catch (error) {
        console.error('Fetch locations error:', error)
        throw createError({ statusCode: 500, message: 'Không thể lấy danh sách vị trí.' })
    }
})
