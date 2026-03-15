export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id')

    if (!id) {
        throw createError({
            statusCode: 400,
            message: 'ID linh kiện là bắt buộc.'
        })
    }

    try {
        const component = await db.component.findUnique({ where: { id } })

        if (!component) {
            throw createError({
                statusCode: 404,
                message: 'Không tìm thấy linh kiện.'
            })
        }

        if (component.status !== 'INSTALLED' || !component.deviceId) {
            throw createError({
                statusCode: 400,
                message: 'Linh kiện này hiện không được lắp trong thiết bị nào.'
            })
        }

        // Update component and close installation record
        const [updatedComponent] = await db.$transaction([
            db.component.update({
                where: { id },
                data: {
                    deviceId: null,
                    status: 'AVAILABLE'
                }
            }),
            // Close the current installation record
            db.componentInstallation.updateMany({
                where: {
                    componentId: id,
                    deviceId: component.deviceId,
                    removedAt: null
                },
                data: {
                    removedAt: new Date()
                }
            })
        ])

        return {
            success: true,
            component: updatedComponent,
            message: `Đã tháo linh kiện "${component.name}" khỏi thiết bị.`
        }
    } catch (error: any) {
        console.error('Uninstall component error:', error)
        throw createError({
            statusCode: error.statusCode || 500,
            message: error.message || 'Lỗi máy chủ khi tháo linh kiện.'
        })
    }
})
