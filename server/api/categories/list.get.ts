export default defineEventHandler(async (event) => {
    const query = getQuery(event)
    const type = query.type as string | undefined

    try {
        const where: any = {}
        if (type && ['DEVICE', 'COMPONENT', 'ACCESSORY'].includes(type)) {
            where.type = type
        }

        const categories = await db.category.findMany({
            where,
            orderBy: { name: 'asc' }
        })
        
        return {
            success: true,
            data: categories
        }
    } catch (error: any) {
        throw createError({
            statusCode: 500,
            message: 'Không thể lấy danh sách danh mục.'
        })
    }
})
