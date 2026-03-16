export default defineEventHandler(async (event) => {
    const query = getQuery(event)
    const q = query.q as string | undefined
    const categoryId = query.categoryId as string | undefined
    const status = query.status as string | undefined

    try {
        const where: any = {}
        const conditions: any[] = []

        if (q) {
            conditions.push({
                OR: [
                    { name: { contains: q, mode: 'insensitive' } },
                    { serialNumber: { contains: q, mode: 'insensitive' } },
                    { id: { contains: q, mode: 'insensitive' } }
                ]
            })
        }

        if (categoryId) {
            conditions.push({ categoryId })
        }

        if (status) {
            conditions.push({ status })
        }

        if (conditions.length > 0) {
            where.AND = conditions
        }

        const devices = await db.device.findMany({
            where,
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
