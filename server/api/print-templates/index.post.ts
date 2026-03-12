export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { name, description, content, type, isDefault } = body

    if (!name || !content || !type) {
      throw createError({
        statusCode: 400,
        message: 'Tên, nội dung và loại biểu mẫu không được để trống'
      })
    }

    if (isDefault) {
      await db.printTemplate.updateMany({
        where: { type },
        data: { isDefault: false }
      })
    }

    const template = await db.printTemplate.create({
      data: {
        name,
        description,
        content,
        type,
        isDefault: isDefault || false
      }
    })

    return { success: true, template }
  } catch (error: any) {
    console.error('Create template error:', error)
    if (error.code === 'P2002') {
      throw createError({
        statusCode: 400,
        message: 'Tên biểu mẫu đã tồn tại'
      })
    }
    throw createError({
      statusCode: 500,
      message: 'Lỗi khi tạo biểu mẫu in' || error.message
    })
  }
})
