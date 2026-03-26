export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id')

    try {
        const domain = await db.domain.findUnique({
            where: { id },
            include: {
                sslCertificates: {
                    orderBy: { expiresAt: 'desc' }
                }
            }
        })

        if (!domain) {
            throw createError({
                statusCode: 404,
                message: 'Không tìm thấy tên miền.'
            })
        }

        return {
            success: true,
            domain
        }
    } catch (error: any) {
        console.error('Fetch domain detail error:', error)
        throw createError({
            statusCode: error.statusCode || 500,
            message: error.message || 'Lỗi máy chủ khi lấy chi tiết tên miền.'
        })
    }
})
