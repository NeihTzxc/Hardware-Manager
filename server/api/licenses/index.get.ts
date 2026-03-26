export default defineEventHandler(async (event) => {
    const query = getQuery(event)
    const q = query.q as string | undefined
    const status = query.status as string | undefined
    const softwareId = query.softwareId as string | undefined

    try {
        const where: any = {}
        const conditions: any[] = []

        if (q) {
            conditions.push({
                OR: [
                    { licenseKey: { contains: q, mode: 'insensitive' } },
                    { assignedTo: { contains: q, mode: 'insensitive' } },
                    { notes: { contains: q, mode: 'insensitive' } }
                ]
            })
        }

        if (status) {
            conditions.push({ status })
        }

        if (softwareId) {
            conditions.push({ softwareId })
        }

        if (conditions.length > 0) {
            where.AND = conditions
        }

        const licenses = await db.license.findMany({
            where,
            include: {
                software: {
                    select: { id: true, name: true }
                }
            },
            orderBy: { expiresAt: 'asc' }
        })

        return {
            success: true,
            licenses
        }
    } catch (error: any) {
        console.error('Fetch licenses error:', error)
        throw createError({
            statusCode: 500,
            message: 'Không thể lấy danh sách license.'
        })
    }
})
