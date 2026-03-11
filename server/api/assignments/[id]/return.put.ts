export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id')
    const body = await readBody(event)

    if (!id) {
        throw createError({
            statusCode: 400,
            message: 'ID mượn trả là bắt buộc.'
        })
    }

    try {
        const assignment = await db.assignment.findUnique({
            where: { id },
            include: { device: true }
        })

        if (!assignment) {
            throw createError({
                statusCode: 404,
                message: 'Không tìm thấy thông tin mượn trả.'
            })
        }

        if (assignment.returnedAt) {
            throw createError({
                statusCode: 400,
                message: 'Thiết bị này đã được trả trước đó.'
            })
        }

        const updatedAssignment = await db.$transaction(async (tx) => {
            const updated = await tx.assignment.update({
                where: { id },
                data: {
                    returnedAt: new Date(),
                    conditionAfter: body.conditionAfter || assignment.device.condition,
                    notes: body.notes ? `${assignment.notes || ''}\n[Trả máy]: ${body.notes}` : assignment.notes
                }
            })

            await tx.device.update({
                where: { id: assignment.deviceId },
                data: {
                    status: 'AVAILABLE',
                    condition: body.conditionAfter || assignment.device.condition
                }
            })

            return updated
        })

        return {
            success: true,
            assignment: updatedAssignment
        }
    } catch (error: any) {
        console.error('Return device error:', error)
        throw createError({
            statusCode: error.statusCode || 500,
            message: error.message || 'Lỗi khi trả thiết bị.'
        })
    }
})
