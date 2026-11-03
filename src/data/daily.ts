export interface DailyWord {
  word: string
  reading: string
  meaning: string
  example: string
  translation: string
}

// 每日单词内容池，后续可继续添加或替换成接口数据。
export const dailyWords: DailyWord[] = [
  { word: '習慣', reading: 'しゅうかん', meaning: '习惯', example: '毎朝、本を読む習慣があります。', translation: '我有每天早上读书的习惯。' },
  { word: '約束', reading: 'やくそく', meaning: '约定；承诺', example: '友達と映画を見る約束をしました。', translation: '我和朋友约好去看电影。' },
  { word: '準備', reading: 'じゅんび', meaning: '准备', example: '旅行の準備をしています。', translation: '我正在为旅行做准备。' },
  { word: '景色', reading: 'けしき', meaning: '景色；风景', example: '窓から見える景色がきれいです。', translation: '从窗户看到的景色很美。' },
  { word: '挑戦', reading: 'ちょうせん', meaning: '挑战；尝试', example: '新しいことに挑戦したいです。', translation: '我想尝试新的事物。' },
  { word: '確認', reading: 'かくにん', meaning: '确认；核实', example: '会議の時間を確認してください。', translation: '请确认会议时间。' },
  { word: '丁寧', reading: 'ていねい', meaning: '认真细致；有礼貌', example: '先生は丁寧に説明してくれました。', translation: '老师给我作了细致的说明。' },
]

// 日期作为种子：同一天保持不变，相邻日期切换内容。
export function dailyIndex(date: Date, length: number, salt = 0): number {
  if (length < 1) return -1
  const day = Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86400000)
  const cycle = Math.floor(day / length)
  let seed = (cycle ^ salt) >>> 0
  const order = Array.from({ length }, (_, index) => index)
  for (let i = length - 1; i > 0; i--) {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0
    const j = seed % (i + 1)
    ;[order[i], order[j]] = [order[j], order[i]]
  }
  return order[((day % length) + length) % length]
}
