export default defineEventHandler(async (event) => {
    const query = getQuery(event)
    const domainId = query.domainId as string | undefined
    const status = query.status as string | undefined
    const q = query.q as string | undefined

    try {
        const where: any = {}
        const conditions: any[] = []

        if (domainId) conditions.push({ domainId })
        if (status) conditions.push({ status })
        
        if (q) {
            conditions.push({
                OR: [
                    { domainName: { contains: q, mode: 'insensitive' } },
                    { issuer: { contains: q, mode: 'insensitive' } },
                    { id: { contains: q, mode: 'insensitive' } }
                ]
            })
        }

        if (conditions.length > 0) {
            where.AND = conditions
        }

        const certificates = await db.sslCertificate.findMany({
            where,
            include: {
                domain: {
                    select: { id: true, name: true }
                }
            },
            orderBy: { expiresAt: 'asc' }
        })

        return {
            success: true,
            certificates
        }
    } catch (error: any) {
        console.error('Fetch certificates error:', error)
        throw createError({
            statusCode: 500,
            message: 'Không thể lấy danh sách chứng chỉ SSL.'
        })
    }
})
