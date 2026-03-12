export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  
  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'Thiếu ID biểu mẫu'
    })
  }

  try {
    const body = await readBody(event)
    const { name, description, content, type, isDefault } = body

    if (isDefault) {
      await db.printTemplate.updateMany({
        where: { type, id: { not: id } },
        data: { isDefault: false }
      })
    }

    const template = await db.printTemplate.update({
      where: { id },
      data: {
        name,
        description,
        content,
        type,
        isDefault
      }
    })

    return { success: true, template }
  } catch (error: any) {
    console.error('Update template error:', error)
    if (error.code === 'P2025') {
        throw createError({
            statusCode: 404,
            message: 'Không tìm thấy biểu mẫu'
        })
    }
    if (error.code === 'P2002') {
      throw createError({
        statusCode: 400,
        message: 'Tên biểu mẫu đã tồn tại'
      })
    }
    throw createError({
      statusCode: 500,
      message: 'Lỗi khi cập nhật biểu mẫu in'
    })
  }
})
