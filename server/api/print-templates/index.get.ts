export default defineEventHandler(async (event) => {
  try {
    const templates = await db.printTemplate.findMany({
      orderBy: { createdAt: 'desc' }
    })
    return { success: true, templates }
  } catch (error: any) {
    console.error('Fetch templates error:', error)
    throw createError({
      statusCode: 500,
      message: 'Lỗi khi lấy danh sách biểu mẫu in'
    })
  }
})
