export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  
  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'Thiếu ID biểu mẫu'
    })
  }

  try {
    await db.printTemplate.delete({
      where: { id }
    })

    return { success: true, message: 'Xóa biểu mẫu in thành công' }
  } catch (error: any) {
    console.error('Delete template error:', error)
    if (error.code === 'P2025') {
        throw createError({
            statusCode: 404,
            message: 'Không tìm thấy biểu mẫu'
        })
    }
    throw createError({
      statusCode: 500,
      message: 'Lỗi khi xóa biểu mẫu in'
    })
  }
})
