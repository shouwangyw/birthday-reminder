import { computeNextBirthday, today } from './date.js'
import { generateEmojis } from './blessing.js'

function parseRemindTime(timeStr) {
  const parts = (timeStr || '09:00').split(':')
  const h = parseInt(parts[0], 10) || 9
  const m = parseInt(parts[1], 10) || 0
  return { h, m }
}

function normalizeAdvanceDays(record) {
  if (Array.isArray(record.advanceDays)) {
    const arr = record.advanceDays.map((d) => Number(d) || 0)
    return arr.length ? arr : [0]
  }
  return [Number(record.advanceDays) || 0]
}

// H5 浏览器通知权限（可选）
export function requestNotificationPermission() {
  // #ifdef H5
  if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
    Notification.requestPermission()
  }
  // #endif
}

// 重新计算并调度未来一年的本地提醒（App 端），支持同一天多个提前提醒
export function rescheduleAll(records) {
  // #ifdef APP-PLUS
  if (typeof plus !== 'undefined' && plus.push) {
    try {
      plus.push.clear()
    } catch (e) {}

    const now = today()
    let count = 0
    records
      .filter((r) => r.enabled !== false)
      .forEach((record) => {
        const next = computeNextBirthday(record, now)
        if (!next.date) return

        const { h, m } = parseRemindTime(record.remindTime)
        const advanceDays = normalizeAdvanceDays(record)

        advanceDays.forEach((advance) => {
          const when = new Date(next.date.getFullYear(), next.date.getMonth(), next.date.getDate(), h, m)
          when.setDate(when.getDate() - advance)
          if (when.getTime() <= Date.now()) {
            when.setFullYear(when.getFullYear() + 1)
          }

          const title = '🎂 生日提醒'
          const content = (record.appellation ? record.appellation + ' · ' : '') + (record.name || '朋友') + ' 生日快乐！' + generateEmojis(record)
          try {
            plus.push.createMessage(content, JSON.stringify({ type: 'birthday', id: record.id, advance }), {
              title,
              delay: when.getTime() - Date.now(),
              when
            })
            count++
          } catch (e) {
            console.error('schedule notification failed', e)
          }
        })
      })
    return count
  }
  // #endif
  return 0
}

// 微信小程序订阅消息：需要后端配合下发，这里仅做订阅授权占位
export function requestWeixinSubscribe(record) {
  // #ifdef MP-WEIXIN
  const templateId = '' // TODO: 在小程序后台申请并替换为订阅消息模板 ID
  if (!templateId) {
    uni.showToast({ title: '请先配置订阅消息模板 ID', icon: 'none' })
    return
  }
  const next = computeNextBirthday(record, today())
  uni.requestSubscribeMessage({
    tmplIds: [templateId],
    success(res) {
      console.log('subscribe result', res, 'birthday', next.dateText)
    }
  })
  // #endif
}
