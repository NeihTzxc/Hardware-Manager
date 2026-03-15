export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id')
    const body = await readBody(event)

    if (!id) {
        throw createError({
            statusCode: 400,
            message: 'ID linh kiện là bắt buộc.'
        })
    }

    if (!body.deviceId) {
        throw createError({
            statusCode: 400,
            message: 'Vui lòng chọn thiết bị để lắp linh kiện.'
        })
    }

    try {
        // Check component exists and is available
        const component = await db.component.findUnique({ where: { id } })

        if (!component) {
            throw createError({
                statusCode: 404,
                message: 'Không tìm thấy linh kiện.'
            })
        }

        if (component.status === 'INSTALLED') {
            throw createError({
                statusCode: 400,
                message: 'Linh kiện này đang được lắp trong thiết bị khác. Vui lòng tháo ra trước.'
            })
        }

        // Check device exists
        const device = await db.device.findUnique({ where: { id: body.deviceId } })

        if (!device) {
            throw createError({
                statusCode: 404,
                message: 'Không tìm thấy thiết bị.'
            })
        }

        // Update component and create installation record
        const [updatedComponent] = await db.$transaction([
            db.component.update({
                where: { id },
                data: {
                    deviceId: body.deviceId,
                    status: 'INSTALLED'
                }
            }),
            db.componentInstallation.create({
                data: {
                    componentId: id,
                    deviceId: body.deviceId,
                    notes: body.notes || null
                }
            })
        ])

        return {
            success: true,
            component: updatedComponent,
            message: `Đã lắp linh kiện "${component.name}" vào thiết bị "${device.name}".`
        }
    } catch (error: any) {
        console.error('Install component error:', error)
        throw createError({
            statusCode: error.statusCode || 500,
            message: error.message || 'Lỗi máy chủ khi lắp linh kiện.'
        })
    }
})
