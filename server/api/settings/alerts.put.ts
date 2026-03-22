import { defineEventHandler, readBody } from 'h3'
import db from '../../utils/db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const { email, slack, telegram } = body || {}

  const updates = []
  
  if (email) {
    updates.push(db.systemSetting.upsert({
      where: { key: 'ALERT_EMAIL' },
      update: { value: email },
      create: { key: 'ALERT_EMAIL', value: email }
    }))
  }

  if (slack) {
    updates.push(db.systemSetting.upsert({
      where: { key: 'ALERT_SLACK' },
      update: { value: slack },
      create: { key: 'ALERT_SLACK', value: slack }
    }))
  }

  if (telegram) {
    updates.push(db.systemSetting.upsert({
      where: { key: 'ALERT_TELEGRAM' },
      update: { value: telegram },
      create: { key: 'ALERT_TELEGRAM', value: telegram }
    }))
  }

  if (updates.length > 0) {
    await db.$transaction(updates)
  }

  return { success: true }
})
