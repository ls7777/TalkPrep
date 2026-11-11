<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { BookOpen, Layers3 } from 'lucide-vue-next'
import { lessons } from '../data/courses'
import { dailyIndex, dailyWords } from '../data/daily'

const today = ref(new Date())
const grammarPool = lessons.filter(lesson => lesson.category === 'grammar')
const grammar = computed(() => grammarPool[dailyIndex(today.value, grammarPool.length, 17)])
const word = computed(() => dailyWords[dailyIndex(today.value, dailyWords.length, 43)])
const dateLabel = computed(() => today.value.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' }))
let timer: ReturnType<typeof setInterval> | undefined
function refreshDate() { today.value = new Date() }
onMounted(() => {
  timer = setInterval(refreshDate, 1000)
  document.addEventListener('visibilitychange', refreshDate)
})
onUnmounted(() => {
  clearInterval(timer)
  document.removeEventListener('visibilitychange', refreshDate)
})
</script>

<template>
  <section class="daily-study" aria-labelledby="daily-study-title">
    <div class="daily-study-heading"><h2 id="daily-study-title">每日学习</h2><span>{{ dateLabel }} · 每日随机更新</span></div>
    <div class="daily-study-grid">
      <article v-if="grammar" class="daily-study-card">
        <div class="daily-card-heading"><span><Layers3 :size="16" />每日语法</span><span class="pill">{{ grammar.level.toUpperCase() }}</span></div>
        <h3 lang="ja">{{ grammar.japanese }}</h3>
        <p class="daily-meaning">{{ grammar.description }}</p>
        <div class="daily-example"><p lang="ja">{{ grammar.example }}</p><span>{{ grammar.translation }}</span></div>
        <RouterLink :to="`/lesson/${grammar.id}`" class="text-link">查看语法详情 →</RouterLink>
      </article>
      <article v-if="word" class="daily-study-card daily-word-card">
        <div class="daily-card-heading"><span><BookOpen :size="16" />每日单词</span><span class="daily-reading" lang="ja">{{ word.reading }}</span></div>
        <h3 lang="ja">{{ word.word }}</h3>
        <p class="daily-meaning">{{ word.meaning }}</p>
        <div class="daily-example"><p lang="ja">{{ word.example }}</p><span>{{ word.translation }}</span></div>
      </article>
    </div>
  </section>
</template>
