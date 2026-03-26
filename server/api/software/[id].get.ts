export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id')

    try {
        const software = await db.software.findUnique({
            where: { id },
            include: {
                licenses: {
                    orderBy: { expiresAt: 'asc' }
                }
            }
        })

        if (!software) {
            throw createError({
                statusCode: 404,
                message: 'Không tìm thấy phần mềm này.'
            })
        }

        return {
            success: true,
            software
        }
    } catch (error: any) {
        console.error('Get software detail error:', error)
        throw createError({
            statusCode: error.statusCode || 500,
            message: error.message || 'Lỗi máy chủ khi lấy chi tiết phần mềm.'
        })
    }
})
