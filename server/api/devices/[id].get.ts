export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id')

    if (!id) {
        throw createError({
            statusCode: 400,
            message: 'Thiếu ID thiết bị.'
        })
    }

    try {
        const device = await db.device.findUnique({
            where: { id },
            include: {
                category: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                supplier: {
                    select: {
                        id: true,
                        name: true,
                        contactEmail: true,
                        contactPhone: true
                    }
                },
                location: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                assignments: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true
                            }
                        }
                    },
                    orderBy: {
                        assignedAt: 'desc'
                    }
                },
                maintenances: {
                    include: {
                        performedBy: {
                            select: {
                                id: true,
                                name: true
                            }
                        }
                    },
                    orderBy: {
                        performedAt: 'desc'
                    }
                },
                components: {
                    include: {
                        category: {
                            select: {
                                name: true
                            }
                        }
                    }
                }
            }
        })

        if (!device) {
            throw createError({
                statusCode: 404,
                message: 'Không tìm thấy thiết bị.'
            })
        }

        return {
            success: true,
            device
        }
    } catch (error: any) {
        console.error('Fetch device detail error:', error)
        throw createError({
            statusCode: error.statusCode || 500,
            message: error.message || 'Không thể lấy thông tin thiết bị.'
        })
    }
})
