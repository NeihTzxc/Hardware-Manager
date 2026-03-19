export default defineEventHandler(async (event) => {
    try {
        const [
            totalDevices,
            totalCategories,
            inUseDevices,
            maintenanceDevices,
            recentActivities
        ] = await Promise.all([
            db.device.count(),
            db.category.count(),
            db.device.count({ where: { status: 'IN_USE' } }),
            db.device.count({ where: { status: 'MAINTENANCE' } }),
            db.assignment.findMany({
                take: 5,
                orderBy: { assignedAt: 'desc' },
                include: {
                    device: { select: { id: true, name: true, serialNumber: true } },
                    user: { select: { name: true, email: true } }
                }
            })
        ])

        return {
            success: true,
            stats: {
                totalDevices,
                totalCategories,
                inUseDevices,
                maintenanceDevices
            },
            recentActivities
        }
    } catch (error: any) {
        console.error('Fetch dashboard stats error:', error)
        throw createError({
            statusCode: 500,
            message: 'Không thể lấy dữ liệu tổng quan.'
        })
    }
})
