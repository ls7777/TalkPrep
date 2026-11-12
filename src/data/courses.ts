export interface Level {
  id: string
  name: string
  subtitle: string
  description: string
  kana: string
  color: string
}
export const levels: Level[] = [
  { id: 'n1', name: 'N1', subtitle: '理解语言的细微之处', description: '探索复杂表达，提升综合理解与语言运用。', kana: 'その先へ', color: 'ink' },
  { id: 'n2', name: 'N2', subtitle: '走向更广阔的世界', description: '深入阅读与听力，应对学习和工作场景。', kana: '一歩先へ', color: 'clay' },
]
export const categories = [
  { id: 'all', label: '全部内容' }, { id: 'vocabulary', label: '单词' },
  { id: 'grammar', label: '语法' }, { id: 'reading', label: '阅读' },
  { id: 'listening', label: '听力' }, { id: 'practice', label: '练习' },
]
export const businessCategories = [
  { id: 'all', label: '全部场景' }, { id: 'keigo', label: '敬语表达' },
  { id: 'email', label: '商务邮件' }, { id: 'meeting', label: '会议交流' },
  { id: 'phone', label: '电话应对' }, { id: 'interview', label: '求职面试' },
]
export interface Lesson {
  id: string
  level: string
  category: string
  title: string
  japanese: string
  description: string
  example: string
  translation: string
}
// 商务板块仍为示例；真实 N1/N2 内容统一从数据库读取。
export const lessons: Lesson[] = [
  { id: 'business-greeting', level: 'business', category: 'keigo', title: '职场中的初次问候', japanese: 'よろしくお願いいたします', description: '用得体的表达开启职场交流。', example: '本日からお世話になります。どうぞよろしくお願いいたします。', translation: '从今天起承蒙关照。请多多指教。' },
]
