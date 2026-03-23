import db from './db'
import nodemailer from 'nodemailer'

export interface AlertDetails {
  [key: string]: any
}

/**
 * Hàm hỗ trợ Escape HTML để tránh lỗi nội dung trong Email và Telegram
 */
function escapeHtml(text: string) {
  if (text == null) return ''
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Gửi Email Alert
 */
export async function sendEmailAlert(emailCfg: any, title: string, details: AlertDetails = {}) {
  if (!emailCfg.active || !emailCfg.host || !emailCfg.user) return

  const transporter = nodemailer.createTransport({
    host: emailCfg.host,
    port: Number(emailCfg.port) || 587,
    secure: Number(emailCfg.port) === 465,
    auth: {
      user: emailCfg.user,
      pass: emailCfg.password
    }
  });

  let tbody = '';
  for (const [key, value] of Object.entries(details)) {
    tbody += `
      <tr>
        <td style="padding: 10px 14px; border-bottom: 1px solid #e5e7eb; font-weight: 600; color: #374151; width: 35%;">
          ${escapeHtml(key)}
        </td>
        <td style="padding: 10px 14px; border-bottom: 1px solid #e5e7eb; color: #111827;">
          ${escapeHtml(String(value))}
        </td>
      </tr>
    `;
  }

  const htmlTemplate = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; background-color: #ffffff;">
      <div style="background-color: #4f46e5; padding: 20px;">
        <h2 style="margin: 0; color: #ffffff; font-size: 20px;">🚨 ${escapeHtml(title)}</h2>
      </div>
      <div style="padding: 0;">
        <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 14px;">
          ${tbody}
        </table>
      </div>
      <div style="background-color: #f9fafb; padding: 16px; font-size: 12px; color: #6b7280; text-align: center; border-top: 1px solid #e5e7eb;">
        Đây là email tự động từ Hệ thống Quản lý Phần cứng.<br>Vui lòng không phản hồi lại email này.
      </div>
    </div>
  `;

  await transporter.sendMail({
    from: emailCfg.from || emailCfg.user,
    to: emailCfg.user,
    subject: `[Hardware Cảnh báo] ${title}`,
    html: htmlTemplate
  });
}

/**
 * Gửi Slack Alert
 */
export async function sendSlackAlert(slackCfg: any, title: string, details: AlertDetails = {}) {
  if (!slackCfg.active || !slackCfg.webhookUrl) return

  let fields = Object.entries(details).map(([k, v]) => ({
    type: "mrkdwn",
    text: `*${k}:*\n${v}`
  }));
  // Slack block field array max length is 10
  fields = fields.slice(0, 10);

  const payload = {
    blocks: [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: `🚨 ${title}`,
          emoji: true
        }
      },
      {
        type: "divider"
      }
    ] as any[]
  };

  if (fields.length > 0) {
    payload.blocks.push({
      type: "section",
      fields: fields
    });
  }

  await $fetch(slackCfg.webhookUrl, {
    method: 'POST',
    body: payload
  });
}

/**
 * Gửi Telegram Alert
 */
export async function sendTelegramAlert(teleCfg: any, title: string, details: AlertDetails = {}) {
  if (!teleCfg.active || !teleCfg.botToken || !teleCfg.chatId) return

  let teleMessage = `🚨 <b>${escapeHtml(title)}</b>\n\n`;
  for (const [key, value] of Object.entries(details)) {
    teleMessage += `🔹 <b>${escapeHtml(key)}</b>: <code>${escapeHtml(String(value))}</code>\n`;
  }
  
  const teleUrl = `https://api.telegram.org/bot${teleCfg.botToken}/sendMessage`;
  
  await $fetch(teleUrl, {
    method: 'POST',
    body: {
      chat_id: teleCfg.chatId,
      text: teleMessage,
      parse_mode: 'HTML'
    }
  });
}

/**
 * Core Utility: Gửi cảnh báo tự động đa kênh
 * Sẽ đọc cấu hình từ bảng SystemSetting để gửi nếu kênh đó được Active
 */
export async function sendAlert(title: string, details: AlertDetails = {}) {
  try {
    // 1. Kéo tất cả config từ database
    const settings = await db.systemSetting.findMany({
      where: { key: { in: ['ALERT_EMAIL', 'ALERT_SLACK', 'ALERT_TELEGRAM'] } }
    });

    const config = settings.reduce((acc: any, curr: any) => {
      acc[curr.key] = curr.value || {};
      return acc;
    }, {});

    const emailCfg = config.ALERT_EMAIL || { active: false };
    const slackCfg = config.ALERT_SLACK || { active: false };
    const teleCfg = config.ALERT_TELEGRAM || { active: false };

    const promises = [];

    // 1. Email
    if (emailCfg.active) {
      promises.push(sendEmailAlert(emailCfg, title, details).catch(err => console.error('[Alert] Lỗi gửi Email:', err)));
    }

    // 2. Slack
    if (slackCfg.active) {
      promises.push(sendSlackAlert(slackCfg, title, details).catch(err => console.error('[Alert] Lỗi gửi Slack:', err)));
    }

    // 3. Telegram
    if (teleCfg.active) {
      promises.push(sendTelegramAlert(teleCfg, title, details).catch(err => console.error('[Alert] Lỗi gửi Telegram:', err)));
    }

    // Chạy song song không chờ đợi lẫn nhau để tiết kiệm thời gian Server
    await Promise.allSettled(promises);

  } catch (error) {
    console.error('[Alert] Lỗi cực kỳ nghiêm trọng khi xử lý cảnh báo alert:', error);
  }
}

