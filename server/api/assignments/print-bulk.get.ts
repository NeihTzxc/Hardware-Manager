export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'Content-Type', 'text/html; charset=utf-8')
  
  const query = getQuery(event)
  const idsStr = String(query.ids || '')
  const type = String(query.type || 'HANDOVER') // HANDOVER or RETURN

  if (!idsStr) {
    throw createError({
      statusCode: 400,
      message: 'Thiếu danh sách ID lượt mượn'
    })
  }

  const ids = idsStr.split(',').filter(id => !!id)

  try {
    // 1. Fetch all assignments
    const assignments = await db.assignment.findMany({
      where: { id: { in: ids } },
      include: {
        device: true,
        user: true
      },
      orderBy: { createdAt: 'asc' }
    })

    if (assignments.length === 0) {
      throw createError({ statusCode: 404, message: 'Không tìm thấy các lượt mượn tương ứng' })
    }

    // 2. Validation: Same user and same type
    const firstAssignment = assignments[0]!
    const firstUserId = firstAssignment.userId
    const invalidUser = assignments.find(a => a.userId !== firstUserId)
    if (invalidUser) {
      throw createError({ statusCode: 400, message: 'Tất cả thiết bị phải thuộc về cùng một người để in gộp' })
    }

    if (type === 'RETURN') {
        const notReturned = assignments.find(a => !a.returnedAt)
        if (notReturned) {
            throw createError({ statusCode: 400, message: 'Một số thiết bị chưa được đánh dấu là đã trả' })
        }
    }

    // 3. Find Template
    let template = await db.printTemplate.findFirst({
      where: { type, isDefault: true }
    })

    if (!template) {
      template = await db.printTemplate.findFirst({
        where: { type }
      })
    }

    if (!template) {
      const typeLabel = type === 'RETURN' ? 'Thu hồi (RETURN)' : 'Giao máy (HANDOVER)'
      return `
        <div style="font-family: sans-serif; padding: 40px; text-align: center; color: #374151;">
          <h1 style="color: #ef4444;">Không tìm thấy biểu mẫu in</h1>
          <p>Hệ thống không tìm thấy bất kỳ biểu mẫu nào thuộc loại <b>${typeLabel}</b>.</p>
          <button onclick="window.close()" style="margin-top: 20px; padding: 10px 20px; cursor: pointer;">Đóng cửa sổ</button>
        </div>
      `
    }

    // 4. Generate Device List Table
    const getConditionLabel = (condition: string) => {
        const labels: Record<string, string> = {
          NEW: 'Mới', GOOD: 'Tốt', FAIR: 'Trung bình', POOR: 'Kém', DAMAGED: 'Hỏng'
        }
        return labels[condition] || condition
    }

    let deviceRows = ''
    assignments.forEach((a: any, index) => {
        const condition = type === 'RETURN' ? (a.conditionAfter || '') : a.conditionBefore
        deviceRows += `
            <tr>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${index + 1}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">${a.device.name}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">${a.device.serialNumber}</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${getConditionLabel(condition)}</td>
            </tr>
        `
    })

    const deviceListHtml = `
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <thead>
                <tr style="background-color: #f3f4f6;">
                    <th style="border: 1px solid #ddd; padding: 8px; width: 40px;">STT</th>
                    <th style="border: 1px solid #ddd; padding: 8px;">Tên thiết bị</th>
                    <th style="border: 1px solid #ddd; padding: 8px;">Số Seri</th>
                    <th style="border: 1px solid #ddd; padding: 8px;">Tình trạng</th>
                </tr>
            </thead>
            <tbody>
                ${deviceRows}
            </tbody>
        </table>
    `

    // 5. Render variables
    let renderedHtml = template.content
    const mainAssignment = assignments[0]!
    
    renderedHtml = renderedHtml.replace(/\{\{userName\}\}/g, (mainAssignment as any).user.name || (mainAssignment as any).user.email)
    renderedHtml = renderedHtml.replace(/\{\{userEmail\}\}/g, (mainAssignment as any).user.email)
    
    // For bulk, deviceName and serialNumber display summary
    renderedHtml = renderedHtml.replace(/\{\{deviceName\}\}/g, assignments.length > 1 ? `Danh sách ${assignments.length} thiết bị (xem bảng)` : (assignments[0] as any).device.name)
    renderedHtml = renderedHtml.replace(/\{\{serialNumber\}\}/g, assignments.length > 1 ? `Đính kèm theo danh sách` : (assignments[0] as any).device.serialNumber)
    
    const date = (type === 'RETURN' && mainAssignment.returnedAt) ? mainAssignment.returnedAt : mainAssignment.assignedAt
    renderedHtml = renderedHtml.replace(/\{\{date\}\}/g, new Date(date).toLocaleDateString('vi-VN'))
    
    // Inject device list
    if (renderedHtml.includes('{{deviceList}}')) {
        renderedHtml = renderedHtml.replace(/\{\{deviceList\}\}/g, deviceListHtml)
    } else {
        // Fallback: Append device list at the end if placeholder not found
        renderedHtml = renderedHtml.replace(/<\/div>\s*$/, `${deviceListHtml}</div>`)
        if (!renderedHtml.includes(deviceListHtml)) {
             renderedHtml += `<div style="margin-top: 20px;"><strong>Danh sách chi tiết:</strong>${deviceListHtml}</div>`
        }
    }

    renderedHtml += `\n<script>window.onload = function() { setTimeout(() => { window.print(); }, 500); }<\/script>`

    return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="utf-8">
  <title>In biên bản gộp - ${mainAssignment.user.name || mainAssignment.user.email}</title>
  <style>
    body { margin: 0; padding: 20px; font-family: sans-serif; line-height: 1.5; }
    @media print {
      body { padding: 0; }
    }
    table { border-collapse: collapse; }
    th, td { border: 1px solid #333; }
  </style>
</head>
<body>
  ${renderedHtml}
</body>
</html>`

  } catch (error: any) {
    console.error('Print bulk error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Lỗi khi tạo biểu mẫu in gộp'
    })
  }
})
