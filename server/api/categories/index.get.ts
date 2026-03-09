export default defineEventHandler(async (event) => {
    // Basic protection (optional, can depend on auth middleware)
    // const user = event.context.user
    
    try {
        const categories = await db.category.findMany({
            orderBy: { name: 'asc' }
        })
        
        return {
            success: true,
            categories
        }
    } catch (error: any) {
        throw createError({
            statusCode: 500,
            message: 'Không thể lấy danh sách danh mục.'
        })
    }
})
