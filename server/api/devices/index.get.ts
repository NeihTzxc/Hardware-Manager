export default defineEventHandler(async (event) => {
    const query = getQuery(event)
    const q = query.q as string | undefined
    const categoryId = query.categoryId as string | undefined
    const status = query.status as string | undefined
    const condition = query.condition as string | undefined
    const userId = query.userId as string | undefined
    const supplierId = query.supplierId as string | undefined
    const locationId = query.locationId as string | undefined
    const name = query.name as string | undefined
    const deviceId = query.id as string | undefined
    const serialNumber = query.serialNumber as string | undefined
    const model = query.model as string | undefined
    const manufacturer = query.manufacturer as string | undefined
    const notes = query.notes as string | undefined
    const purchasePriceMin = query.purchasePriceMin as string | undefined
    const purchasePriceMax = query.purchasePriceMax as string | undefined
    const purchaseDateFrom = query.purchaseDateFrom as string | undefined
    const purchaseDateTo = query.purchaseDateTo as string | undefined

    try {
        const where: any = {}
        const conditions: any[] = []

        if (q) {
            conditions.push({
                OR: [
                    { name: { contains: q, mode: 'insensitive' } },
                    { serialNumber: { contains: q, mode: 'insensitive' } },
                    { id: { contains: q, mode: 'insensitive' } },
                    { model: { contains: q, mode: 'insensitive' } },
                    { manufacturer: { contains: q, mode: 'insensitive' } },
                    { notes: { contains: q, mode: 'insensitive' } },
                    { category: { name: { contains: q, mode: 'insensitive' } } },
                    { supplier: { name: { contains: q, mode: 'insensitive' } } },
                    { location: { name: { contains: q, mode: 'insensitive' } } },
                    { assignments: { some: { returnedAt: null, user: { name: { contains: q, mode: 'insensitive' } } } } },
                    { assignments: { some: { returnedAt: null, user: { email: { contains: q, mode: 'insensitive' } } } } }
                ]
            })
        }

        const containsFields = { name, deviceId, serialNumber, model, manufacturer, notes }
        for (const [field, value] of Object.entries(containsFields)) {
            if (value) conditions.push({ [field === 'deviceId' ? 'id' : field]: { contains: value, mode: 'insensitive' } })
        }

        if (categoryId) {
            conditions.push({ categoryId })
        }

        if (status) {
            conditions.push({ status })
        }

        if (condition) conditions.push({ condition })
        if (userId) conditions.push({ assignments: { some: { returnedAt: null, userId } } })
        if (supplierId) conditions.push({ supplierId })
        if (locationId) conditions.push({ locationId })
        if (purchasePriceMin) conditions.push({ purchasePrice: { gte: Number(purchasePriceMin) } })
        if (purchasePriceMax) conditions.push({ purchasePrice: { lte: Number(purchasePriceMax) } })
        if (purchaseDateFrom) conditions.push({ purchaseDate: { gte: new Date(`${purchaseDateFrom}T00:00:00.000Z`) } })
        if (purchaseDateTo) conditions.push({ purchaseDate: { lte: new Date(`${purchaseDateTo}T23:59:59.999Z`) } })

        if (conditions.length > 0) {
            where.AND = conditions
        }

        const sortField = (query.field as string) || 'createdAt'
        const sortValue = (query.value as string) || 'desc'

        // Define valid sort fields to prevent injection
        const validSortFields = ['name', 'serialNumber', 'status', 'createdAt', 'model', 'manufacturer']
        const orderBy: any = {}
        
        if (validSortFields.includes(sortField)) {
            orderBy[sortField] = sortValue === 'asc' ? 'asc' : 'desc'
        } else {
            orderBy.createdAt = 'desc'
        }

        const devices = await db.device.findMany({
            where,
            include: {
                category: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                supplier: {
                    select: { id: true, name: true }
                },
                location: {
                    select: { id: true, name: true }
                },
                assignments: {
                    where: { returnedAt: null },
                    include: {
                        user: {
                            select: { id: true, name: true, email: true }
                        }
                    },
                    orderBy: { assignedAt: 'desc' },
                    take: 1
                }
            },
            orderBy
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
