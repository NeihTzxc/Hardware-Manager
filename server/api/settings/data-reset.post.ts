import { createError, defineEventHandler, readBody } from 'h3'
import db from '../../utils/db'
import { logAudit } from '../../utils/audit'

const CONFIRMATION_TEXT = 'XÓA TOÀN BỘ'

export default defineEventHandler(async (event) => {
  const accessToken = getCookie(event, 'access_token')

  if (!accessToken) {
    throw createError({ statusCode: 401, message: 'Chưa đăng nhập.' })
  }

  const payload = verifyAccessToken(accessToken)
  if (!payload) {
    throw createError({ statusCode: 401, message: 'Token không hợp lệ hoặc đã hết hạn.' })
  }

  const currentUser = await db.user.findUnique({
    where: { id: payload.userId },
    select: { id: true, role: true }
  })

  if (!currentUser || currentUser.role !== 'ADMIN') {
    throw createError({ statusCode: 403, message: 'Chỉ quản trị viên mới được phép xóa toàn bộ dữ liệu.' })
  }

  const body = await readBody<{ confirmation?: string }>(event)
  if (body?.confirmation?.trim() !== CONFIRMATION_TEXT) {
    throw createError({
      statusCode: 400,
      message: `Vui lòng nhập chính xác “${CONFIRMATION_TEXT}” để xác nhận.`
    })
  }

  try {
    const summary = await db.$transaction(async (tx) => {
      const [
        devices,
        categories,
        components,
        accessories,
        suppliers,
        locations,
        assignments,
        maintenances,
        checkouts,
        installations,
        tickets
      ] = await Promise.all([
        tx.device.count(),
        tx.category.count(),
        tx.component.count(),
        tx.accessory.count(),
        tx.supplier.count(),
        tx.location.count(),
        tx.assignment.count(),
        tx.maintenanceLog.count(),
        tx.accessoryCheckout.count(),
        tx.componentInstallation.count(),
        tx.ticket.count({ where: { deviceId: { not: null } } })
      ])

      // Delete dependent records first so this is safe regardless of database FK rules.
      await tx.ticketComment.deleteMany({
        where: { ticket: { is: { deviceId: { not: null } } } }
      })
      await tx.ticket.deleteMany({ where: { deviceId: { not: null } } })
      await tx.assignmentDocument.deleteMany()
      await tx.assignment.deleteMany()
      await tx.maintenanceLog.deleteMany()
      await tx.accessoryCheckout.deleteMany()
      await tx.componentInstallation.deleteMany()
      await tx.component.deleteMany()
      await tx.accessory.deleteMany()
      await tx.device.deleteMany()
      await tx.category.deleteMany()
      await tx.supplier.deleteMany()
      await tx.location.deleteMany()

      return { devices, categories, components, accessories, suppliers, locations, assignments, maintenances, checkouts, installations, tickets }
    })

    await logAudit(event, {
      action: 'RESET_DATA',
      entity: 'HARDWARE_DATA',
      details: summary
    })

    return {
      success: true,
      message: 'Đã xóa toàn bộ dữ liệu quản lý phần cứng.',
      data: summary
    }
  } catch (error: any) {
    console.error('Reset hardware data error:', error)
    throw createError({
      statusCode: 500,
      message: 'Không thể xóa dữ liệu. Toàn bộ dữ liệu vẫn được giữ nguyên.'
    })
  }
})
