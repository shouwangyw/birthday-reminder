import { computeNextBirthday } from './date.js'

const RELATION_MAP = {
  '妈妈': { salutation: '亲爱的妈妈', emoji: ['🌹', '❤️', '👩', '💐'] },
  '母亲': { salutation: '亲爱的妈妈', emoji: ['🌹', '❤️', '💐'] },
  '爸爸': { salutation: '亲爱的爸爸', emoji: ['👨', '❤️', '🌟', '🍻'] },
  '父亲': { salutation: '亲爱的爸爸', emoji: ['👨', '❤️', '🌟'] },
  '爷爷': { salutation: '敬爱的爷爷', emoji: ['👴', '🎉', '🍀', '⭐'] },
  '奶奶': { salutation: '亲爱的奶奶', emoji: ['👵', '🌸', '🍀', '⭐'] },
  '外公': { salutation: '亲爱的外公', emoji: ['👴', '🎂', '🍀', '⭐'] },
  '外婆': { salutation: '亲爱的外婆', emoji: ['👵', '🌷', '🍀', '⭐'] },
  '老婆': { salutation: '亲爱的老婆', emoji: ['💍', '❤️', '🌹', '😘'] },
  '老公': { salutation: '亲爱的老公', emoji: ['💍', '❤️', '🌟', '😘'] },
  '朋友': { salutation: '亲爱的朋友', emoji: ['🎉', '🥳', '🎂', '🎈'] },
  '闺蜜': { salutation: '我的好闺蜜', emoji: ['💕', '🌸', '🎂', '🥳'] },
  '兄弟': { salutation: '我的好兄弟', emoji: ['🍻', '🎉', '👍', '🥳'] },
  '同事': { salutation: '亲爱的同事', emoji: ['🤝', '🎂', '🎉', '☕'] },
  '同学': { salutation: '亲爱的同学', emoji: ['🎓', '🎉', '🎂', '📚'] },
  '孩子': { salutation: '亲爱的宝贝', emoji: ['🎂', '🎈', '🧸', '⭐'] },
  '儿子': { salutation: '亲爱的儿子', emoji: ['🎂', '🎈', '⭐', '💪'] },
  '女儿': { salutation: '亲爱的女儿', emoji: ['🎂', '🎀', '⭐', '💖'] },
  '老师': { salutation: '敬爱的老师', emoji: ['📚', '🌹', '🎂', '🙏'] },
  '领导': { salutation: '尊敬的领导', emoji: ['🎂', '🎉', '🙏', '🌟'] }
}

const RELATION_WISHES = {
  '妈妈': ['感谢您一直以来的付出和陪伴，愿您健康长寿，笑容常在。', '愿您被岁月温柔以待，平安喜乐每一天。', '谢谢您给我最温暖的港湾，愿您永远年轻、幸福安康。'],
  '母亲': ['感谢您一直以来的付出和陪伴，愿您健康长寿，笑容常在。', '愿您被岁月温柔以待，平安喜乐每一天。', '谢谢您给我最温暖的港湾，愿您永远年轻、幸福安康。'],
  '爸爸': ['谢谢您撑起我们的家，愿您身体健康，万事顺遂。', '愿您少操劳、多快乐，岁岁平安。', '您辛苦了，愿往后的日子舒心自在，健康常伴。'],
  '父亲': ['谢谢您撑起我们的家，愿您身体健康，万事顺遂。', '愿您少操劳、多快乐，岁岁平安。', '您辛苦了，愿往后的日子舒心自在，健康常伴。'],
  '爷爷': ['祝您福如东海、寿比南山，天天开心。', '愿您身体硬朗，笑口常开，晚年幸福。', '祝您健康长寿，子孙绕膝，其乐融融。'],
  '外公': ['祝您福如东海、寿比南山，天天开心。', '愿您身体硬朗，笑口常开，晚年幸福。', '祝您健康长寿，子孙绕膝，其乐融融。'],
  '奶奶': ['祝您福寿安康，天天好心情。', '愿您身体康健，晚年生活温馨如意。', '祝您笑口常开，健康长寿，我们永远爱您。'],
  '外婆': ['祝您福寿安康，天天好心情。', '愿您身体康健，晚年生活温馨如意。', '祝您笑口常开，健康长寿，我们永远爱您。'],
  '老婆': ['谢谢你一直陪在我身边，愿我们岁岁年年都在一起。', '愿你的每一天都像今天一样被宠爱。', '遇见你是我最大的幸运，生日快乐，我的爱人。'],
  '老公': ['谢谢你一直以来的包容和照顾，愿我们相伴到老。', '愿你的努力都有回报，生日快乐，我的爱人。', '余生请继续多多指教，生日快乐！'],
  '朋友': ['愿我们的友谊天长地久，一起奔赴更好的明天。', '愿你眼里有光，心中有梦，脚下有路。', '祝你前程似锦，永远热泪盈眶、永远年轻。'],
  '闺蜜': ['愿我们的友谊天长地久，永远做彼此的靠山。', '愿你的每一天都被爱包围，美到发光。', '一起变老，一起漂亮，生日快乐！'],
  '兄弟': ['愿我们兄弟情义长存，一起闯荡一起赢。', '有需要随时喊我，生日快乐！', '愿你越来越强，前程似锦，兄弟挺你。'],
  '同事': ['感谢工作中的互相支持，愿你工作顺利、步步高升。', '愿你在新的岁月里，事业蒸蒸日上。', '合作愉快，生日快乐，前程无量。'],
  '同学': ['愿我们的青春不散场，友谊地久天长。', '愿你历尽千帆，归来仍是少年。', '祝你学业事业双丰收，生日快乐。'],
  '孩子': ['愿你的童年充满欢笑，健康快乐地长大。', '愿你被世界温柔以待，平安喜乐。', '你永远是我们的小太阳，生日快乐！'],
  '儿子': ['愿你健康成长，勇敢追梦，爸爸妈妈永远支持你。', '愿你心怀梦想，脚踏实地，生日快乐！', '你是我们的骄傲，愿你的每一天都闪闪发光。'],
  '女儿': ['愿你被爱包围，快乐成长，做自己的公主。', '愿你善良勇敢，永远自信美丽，生日快乐！', '你是我们的小棉袄，愿你的每一天都甜甜蜜蜜。'],
  '老师': ['感谢您的悉心教导，祝您桃李满天下，健康幸福。', '愿您工作顺利、生活美满，教师节和生日都快乐。', '您的教诲如春风化雨，祝您生日快乐。'],
  '领导': ['感谢您的带领和提携，祝您生日快乐、事业更上一层楼。', '愿您工作顺利、阖家幸福，生日快乐。', '祝您在新的一岁里，顺风顺水，心想事成。']
}

const GENERAL_WISHES = [
  '愿所有的美好都如期而至，天天开心！',
  '生日快乐！愿你的生活像蛋糕一样甜，日子越过越红火。',
  '又长大一岁啦，愿你健康平安，笑口常开！',
  '在这个特别的日子里，把最真挚的祝福送给你，生日快乐！',
  '愿你的每一个愿望都能实现，每一份努力都有回报，生日快乐！',
  '愿你被世界温柔以待，所遇皆温柔，所行皆坦途。',
  '新的一岁，愿你继续闪闪发光，生日快乐！'
]

const HUMOR_WISHES = [
  '祝你生日快乐，年龄永远停留在18岁的心态！',
  '又老了一岁，但你依然是最靓的仔！',
  '蛋糕可以多吃，减肥的事明天再说，生日快乐！',
  '祝你生日快乐，烦恼像蜡烛一样，吹吹就灭！',
  '新的一岁，愿你发量不减、快乐加倍！',
  '恭喜你成功续费一年，请查收这份快乐！'
]

const FORMAL_WISHES = [
  '值此生日之际，谨致以最诚挚的祝福，愿您身体健康、万事顺遂。',
  '恭祝生日快乐，愿您事业蒸蒸日上，阖家幸福安康。',
  '祝愿您在新的一岁里，诸事顺遂、吉祥如意。',
  '谨祝生辰快乐，愿您福寿安康、心想事成。'
]

function hashStr(s) {
  let h = 0
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) >>> 0
  }
  return h
}

function pick(arr, seed) {
  if (!arr || !arr.length) return ''
  return arr[seed % arr.length]
}

function buildGreeting(record, rel) {
  const relation = record.appellation || '朋友'
  const name = record.name ? record.name.trim() : ''
  return (name && name !== relation) ? rel.salutation + name : rel.salutation
}

function buildBlessing(record, now, style, seed) {
  const next = computeNextBirthday(record, now)
  const relation = record.appellation || '朋友'
  const rel = RELATION_MAP[relation] || { salutation: relation ? '亲爱的' + relation : '亲爱的朋友', emoji: ['🎂', '🎉', '🎁'] }
  const zodiac = next.yearZodiac
  const age = next.age >= 0 ? next.age : null

  let wish
  if (style === '幽默') {
    wish = pick(HUMOR_WISHES, seed)
  } else if (style === '正式') {
    wish = pick(FORMAL_WISHES, seed)
  } else {
    wish = pick(RELATION_WISHES[relation] || GENERAL_WISHES, seed)
  }

  const lines = []
  lines.push(buildGreeting(record, rel) + '，生日快乐！' + pick(rel.emoji, seed) + pick(rel.emoji, seed + 1))
  lines.push(wish)
  if (zodiac) lines.push('愿你在新的 ' + zodiac + ' 年里好运连连！')
  if (age !== null && age !== undefined) lines.push('祝 ' + age + ' 岁的你，更加闪闪发光！')
  if (record.note && record.note.trim()) lines.push('还记得你的小心愿：' + record.note.trim() + '，祝它早日实现！')
  return lines.join('\n')
}

export function generateEmojis(record) {
  const relation = record.appellation || '朋友'
  const rel = RELATION_MAP[relation] || { emoji: ['🎂', '🎉', '🎁', '🎈'] }
  const seed = hashStr(record.id || relation)
  const emoji = ['🎂']
  emoji.push(pick(rel.emoji, seed))
  emoji.push(pick(['🎉', '🥳', '🎈', '🎁', '🎊'], seed + 1))
  emoji.push(pick(rel.emoji, seed + 2))
  emoji.push(pick(['❤️', '💛', '💚', '💙', '💜', '✨', '🌟'], seed + 3))
  return [...new Set(emoji)].join('')
}

export function generateBlessing(record, now) {
  return buildBlessing(record, now, '温馨', hashStr(record.id || (record.appellation || '')))
}

// 生成多条不同风格/文案的祝福语，供“切换/筛选”
export function generateBlessingList(record, now) {
  const base = hashStr(record.id || (record.appellation || ''))
  const styles = ['温馨', '温馨', '温馨', '幽默', '幽默', '幽默', '正式', '正式', '正式']
  return styles.map((style, i) => ({ style, text: buildBlessing(record, now, style, base + i * 7 + 1) }))
}

export const BLESSING_STYLES = ['全部', '温馨', '幽默', '正式']

