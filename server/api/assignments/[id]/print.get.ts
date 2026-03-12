export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'Content-Type', 'text/html; charset=utf-8')
  
  const id = getRouterParam(event, 'id')
  const query = getQuery(event)
  const type = String(query.type || 'HANDOVER') // HANDOVER or RETURN

  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'Thiếu ID lượt mượn'
    })
  }

  try {
    const assignment = await db.assignment.findUnique({
      where: { id },
      include: {
        device: true,
        user: true
      }
    })

    if (!assignment) {
      throw createError({
        statusCode: 404,
        message: 'Không tìm thấy lượt mượn'
      })
    }

    // 1. Thử tìm biểu mẫu mặc định cho loại này
    let template = await db.printTemplate.findFirst({
      where: { type, isDefault: true }
    })

    // 2. Nếu không có mẫu mặc định, lấy mẫu đầu tiên bất kỳ của loại này
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
          <p>Vui lòng vào mục <b>"Biểu mẫu in"</b> trong ứng dụng để tạo ít nhất một biểu mẫu trước khi in.</p>
          <button onclick="window.close()" style="margin-top: 20px; padding: 10px 20px; cursor: pointer;">Đóng cửa sổ</button>
        </div>
      `
    }

    // Render variables
    let renderedHtml = template.content
    renderedHtml = renderedHtml.replace(/\{\{userName\}\}/g, assignment.user.name || assignment.user.email)
    renderedHtml = renderedHtml.replace(/\{\{userEmail\}\}/g, assignment.user.email)
    renderedHtml = renderedHtml.replace(/\{\{deviceName\}\}/g, assignment.device.name)
    renderedHtml = renderedHtml.replace(/\{\{serialNumber\}\}/g, assignment.device.serialNumber)
    
    const date = type === 'RETURN' && assignment.returnedAt ? assignment.returnedAt : assignment.assignedAt
    renderedHtml = renderedHtml.replace(/\{\{date\}\}/g, new Date(date).toLocaleDateString('vi-VN'))
    
    const condition = type === 'RETURN' ? ((assignment as any).conditionAfter || '') : (assignment as any).conditionBefore
    renderedHtml = renderedHtml.replace(/\{\{condition\}\}/g, condition)

    renderedHtml += `\n<script>window.onload = function() { setTimeout(() => { window.print(); }, 500); }<\/script>`

    return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="utf-8">
  <title>In biên bản - ${assignment.device.name}</title>
  <style>
    body { margin: 0; padding: 20px; font-family: sans-serif; }
    @media print {
      body { padding: 0; }
    }
  </style>
</head>
<body>
  ${renderedHtml}
</body>
</html>`

  } catch (error: any) {
    console.error('Print assignment error:', error)
    throw createError({
      statusCode: 500,
      message: 'Lỗi khi tạo biểu mẫu in'
    })
  }
})
