export default defineEventHandler(async (event) => {
    const query = getQuery(event)
    const q = query.q as string | undefined
    const category = query.category as string | undefined

    try {
        const where: any = {}
        const conditions: any[] = []

        if (q) {
            conditions.push({
                OR: [
                    { name: { contains: q, mode: 'insensitive' } },
                    { vendor: { contains: q, mode: 'insensitive' } }
                ]
            })
        }

        if (category) {
            conditions.push({ category })
        }

        if (conditions.length > 0) {
            where.AND = conditions
        }

        const software = await db.software.findMany({
            where,
            include: {
                _count: {
                    select: { licenses: true }
                }
            },
            orderBy: { name: 'asc' }
        })

        return {
            success: true,
            software
        }
    } catch (error: any) {
        console.error('Fetch software error:', error)
        throw createError({
            statusCode: 500,
            message: 'Không thể lấy danh sách phần mềm.'
        })
    }
})
