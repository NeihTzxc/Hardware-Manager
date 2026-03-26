import { defineEventHandler } from 'h3'
import db from '../../utils/db'

export default defineEventHandler(async (event) => {
  const settings = await db.systemSetting.findMany({
    where: {
      key: {
        in: ['ALERT_EMAIL', 'ALERT_SLACK', 'ALERT_TELEGRAM']
      }
    }
  })

  // Convert the array of settings into a flat object for the client
  const rawConfig = settings.reduce((acc: Record<string, any>, curr: any) => {
    acc[curr.key] = curr.value
    return acc
  }, {} as Record<string, any>)

  // Provide defaults if they don't exist in DB
  return {
    email: rawConfig['ALERT_EMAIL'] || {
      active: false,
      host: '',
      port: 587,
      user: '',
      password: '',
      from: ''
    },
    slack: rawConfig['ALERT_SLACK'] || {
      active: false,
      webhookUrl: ''
    },
    telegram: rawConfig['ALERT_TELEGRAM'] || {
      active: false,
      botToken: '',
      chatId: ''
    }
  }
})
