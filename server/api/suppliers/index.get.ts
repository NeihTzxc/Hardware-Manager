export default defineEventHandler(async () => {
    try {
        const suppliers = await db.supplier.findMany({
            select: { id: true, name: true },
            orderBy: { name: 'asc' }
        })

        return { success: true, suppliers }
    } catch (error) {
        console.error('Fetch suppliers error:', error)
        throw createError({ statusCode: 500, message: 'Không thể lấy danh sách nhà cung cấp.' })
    }
})
