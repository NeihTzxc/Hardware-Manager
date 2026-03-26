export default defineEventHandler(async (event) => {
    const query = getQuery(event)
    const q = query.q as string | undefined
    const status = query.status as string | undefined

    try {
        const where: any = {}
        const conditions: any[] = []

        if (q) {
            conditions.push({
                OR: [
                    { name: { contains: q, mode: 'insensitive' } },
                    { registrar: { contains: q, mode: 'insensitive' } },
                    { id: { contains: q, mode: 'insensitive' } }
                ]
            })
        }

        if (status) {
            conditions.push({ status })
        }

        if (conditions.length > 0) {
            where.AND = conditions
        }

        const sortField = (query.field as string) || 'createdAt'
        const sortValue = (query.value as string) || 'desc'

        const validSortFields = ['name', 'registrar', 'expiresAt', 'status', 'createdAt']
        const orderBy: any = {}
        
        if (validSortFields.includes(sortField)) {
            orderBy[sortField] = sortValue === 'asc' ? 'asc' : 'desc'
        } else {
            orderBy.createdAt = 'desc'
        }

        const domains = await db.domain.findMany({
            where,
            include: {
                _count: {
                    select: { sslCertificates: true }
                }
            },
            orderBy
        })

        return {
            success: true,
            domains
        }
    } catch (error: any) {
        console.error('Fetch domains error:', error)
        throw createError({
            statusCode: 500,
            message: 'Không thể lấy danh sách tên miền.'
        })
    }
})
