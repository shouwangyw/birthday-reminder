const KEY = 'birthday_reminder_records'
const SETTING_KEY = 'birthday_reminder_settings'

export function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

export function loadRecords() {
  try {
    const raw = uni.getStorageSync(KEY)
    if (!raw) return []
    const arr = typeof raw === 'string' ? JSON.parse(raw) : raw
    return Array.isArray(arr) ? arr : []
  } catch (e) {
    return []
  }
}

export function saveRecords(records) {
  uni.setStorageSync(KEY, JSON.stringify(records))
}

export function getRecord(id) {
  return loadRecords().find((r) => r.id === id)
}

export function saveRecord(record) {
  const records = loadRecords()
  const idx = records.findIndex((r) => r.id === record.id)
  if (idx >= 0) {
    records[idx] = record
  } else {
    records.unshift(record)
  }
  saveRecords(records)
  return record
}

export function deleteRecord(id) {
  const records = loadRecords().filter((r) => r.id !== id)
  saveRecords(records)
  return records
}

export function loadSettings() {
  const defaults = {
    defaultRemindTime: '09:00',
    defaultAdvanceDays: 0,
    defaultBirthdayType: 'solar'
  }
  try {
    const raw = uni.getStorageSync(SETTING_KEY)
    if (!raw) return defaults
    const obj = typeof raw === 'string' ? JSON.parse(raw) : raw
    return Object.assign({}, defaults, obj)
  } catch (e) {
    return defaults
  }
}

export function saveSettings(settings) {
  uni.setStorageSync(SETTING_KEY, JSON.stringify(settings))
}
