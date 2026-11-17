import solarLunar from './solarlunar.js'

export function pad2(n) {
  return n < 10 ? '0' + n : '' + n
}

export function dateOf(y, m, d) {
  return new Date(y, m - 1, d)
}

export function formatDate(d) {
  return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate())
}

export function today() {
  const n = new Date()
  return new Date(n.getFullYear(), n.getMonth(), n.getDate())
}

export function diffDays(a, b) {
  const a0 = new Date(a.getFullYear(), a.getMonth(), a.getDate()).getTime()
  const b0 = new Date(b.getFullYear(), b.getMonth(), b.getDate()).getTime()
  return Math.round((b0 - a0) / 86400000)
}

export function solarToLunar(y, m, d) {
  return solarLunar.solar2lunar(y, m, d)
}

// 农历日期转公历；若当前年份没有对应闰月，自动回退到平月
export function lunarDateToSolar(y, m, d, isLeap) {
  let res = solarLunar.lunar2solar(y, m, d, !!isLeap)
  if (res === -1 && isLeap) {
    res = solarLunar.lunar2solar(y, m, d, false)
  }
  if (!res || res === -1) return null
  return res
}

// 计算某人在指定公历年份里的生日公历日期
export function birthdayToSolar(record, year) {
  const b = record.birthday
  if (b.type === 'solar') {
    return { date: dateOf(year, b.month, b.day), lunar: null }
  }
  const res = lunarDateToSolar(year, b.month, b.day, b.isLeapMonth)
  if (!res) return null
  return { date: dateOf(res.cYear, res.cMonth, res.cDay), lunar: res }
}

export function computeAge(record, referenceDate) {
  const b = record.birthday
  let age = referenceDate.getFullYear() - b.year
  if (age < 0) age = 0
  const thisYear = birthdayToSolar(record, referenceDate.getFullYear())
  if (thisYear && thisYear.date.getTime() > referenceDate.getTime()) {
    age = Math.max(0, age - 1)
  }
  return age
}

export function getZodiac(record) {
  const b = record.birthday
  if (b.type === 'solar') {
    return solarLunar.getAnimal(b.year, b.month, b.day)
  }
  const res = lunarDateToSolar(b.year, b.month, b.day, b.isLeapMonth)
  if (!res) return ''
  return solarLunar.getAnimal(res.cYear, res.cMonth, res.cDay)
}

export function formatLunarMonthDay(m, d, isLeap) {
  const mm = solarLunar.toChinaMonth(m)
  const dd = solarLunar.toChinaDay(d)
  return (isLeap ? '闰' : '') + mm + dd
}

export function formatBirthday(record) {
  const b = record.birthday
  if (b.type === 'lunar') {
    return '农历' + formatLunarMonthDay(b.month, b.day, b.isLeapMonth)
  }
  return '阳历' + b.month + '月' + b.day + '日'
}

// 计算下一个生日（含今天），返回距离天数、年龄、生肖等
export function computeNextBirthday(record, from) {
  const base = from || today()
  const base0 = new Date(base.getFullYear(), base.getMonth(), base.getDate())

  let result = birthdayToSolar(record, base0.getFullYear())
  if (!result) {
    result = birthdayToSolar(record, base0.getFullYear() + 1)
  }
  if (result && result.date.getTime() < base0.getTime()) {
    const next = birthdayToSolar(record, base0.getFullYear() + 1)
    if (next) result = next
  }

  const daysLeft = result ? diffDays(base0, result.date) : null
  const age = computeAge(record, result ? result.date : base0)

  return {
    date: result ? result.date : null,
    dateText: result ? formatDate(result.date) : '',
    daysLeft,
    age,
    zodiac: getZodiac(record),
    isToday: daysLeft === 0,
    birthdayText: formatBirthday(record)
  }
}

export function todayBirthdayRecords(records) {
  const t = today()
  return records.filter((r) => {
    const n = computeNextBirthday(r, t)
    return n.isToday
  })
}
