import { defineEventHandler, readBody, createError } from 'h3'
import { sendEmailAlert, sendSlackAlert, sendTelegramAlert } from '../../../utils/alert'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { type, config } = body

  if (!type || !config) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Thiếu thông tin loại hoặc cấu hình'
    })
  }

  const title = 'Kiểm tra Cấu hình Cảnh báo'
  const details = {
    'Thời gian': new Date().toLocaleString('vi-VN'),
    'Trạng thái': 'Gửi thử nghiệm thành công',
    'Ứng dụng': 'Hardware Manager'
  }

  try {
    switch (type) {
      case 'email':
        await sendEmailAlert(config, title, details)
        break
      case 'slack':
        await sendSlackAlert(config, title, details)
        break
      case 'telegram':
        await sendTelegramAlert(config, title, details)
        break
      default:
        throw createError({
          statusCode: 400,
          statusMessage: 'Loại thông báo không hợp lệ'
        })
    }
    return { success: true, message: 'Gửi thử thành công!' }
  } catch (error: any) {
    console.error(`[Alert Test] Error testing ${type}:`, error)
    throw createError({
      statusCode: 500,
      statusMessage: `Lỗi khi gửi thử: ${error.message || 'Lỗi không xác định'}`
    })
  }
})
