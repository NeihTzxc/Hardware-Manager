import db from '../../utils/db'

export default defineEventHandler(async (event) => {
    const query = getQuery(event)
    const page = parseInt(query.page as string) || 1
    const limit = parseInt(query.limit as string) || 20
    const skip = (page - 1) * limit

    const { action, entity, entityId, userId } = query

    // Build the query where object
    const where: any = {}
    if (action) where.action = action
    if (entity) where.entity = entity
    if (entityId) where.entityId = entityId
    if (userId) where.userId = userId

    try {
        const [logs, total] = await Promise.all([
            db.auditLog.findMany({
                where,
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
                    createdAt: 'desc'
                },
                skip,
                take: limit
            }),
            db.auditLog.count({ where })
        ])

        return {
            success: true,
            logs,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        }
    } catch (error: any) {
        console.error('Fetch audit logs error:', error)
        throw createError({
            statusCode: 500,
            message: 'Lỗi máy chủ khi tải lịch sử hoạt động.'
        })
    }
})
