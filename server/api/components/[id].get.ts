export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id')

    if (!id) {
        throw createError({
            statusCode: 400,
            message: 'Thiếu ID linh kiện.'
        })
    }

    try {
        const component = await db.component.findUnique({
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
                        name: true
                    }
                },
                location: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                device: {
                    select: {
                        id: true,
                        name: true,
                        status: true
                    }
                },
                installations: {
                    include: {
                        device: {
                            select: {
                                id: true,
                                name: true
                            }
                        }
                    },
                    orderBy: {
                        installedAt: 'desc'
                    }
                }
            }
        })

        if (!component) {
            throw createError({
                statusCode: 404,
                message: 'Không tìm thấy linh kiện.'
            })
        }

        return {
            success: true,
            component
        }
    } catch (error: any) {
        console.error('Fetch component detail error:', error)
        throw createError({
            statusCode: error.statusCode || 500,
            message: error.message || 'Không thể lấy thông tin linh kiện.'
        })
    }
})
