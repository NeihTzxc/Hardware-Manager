export default defineEventHandler(async (event) => {
    try {
        const accessories = await db.accessory.findMany({
            include: {
                category: {
                    select: { id: true, name: true }
                },
                supplier: {
                    select: { id: true, name: true }
                },
                location: {
                    select: { id: true, name: true }
                },
                checkouts: {
                    where: { returnedAt: null },
                    select: { quantity: true }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        // Compute available quantity
        const result = accessories.map(acc => {
            const checkedOut = acc.checkouts.reduce((sum, c) => sum + c.quantity, 0)
            const { checkouts, ...rest } = acc
            return {
                ...rest,
                checkedOutQuantity: checkedOut,
                availableQuantity: acc.totalQuantity - checkedOut
            }
        })

        return {
            success: true,
            accessories: result
        }
    } catch (error: any) {
        console.error('Fetch accessories error:', error)
        throw createError({
            statusCode: 500,
            message: 'Không thể lấy danh sách phụ kiện.'
        })
    }
})
