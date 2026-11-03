<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { ArrowLeft, Volume2 } from 'lucide-vue-next'
import { lessons } from '../data/courses'
import EmptyState from '../components/EmptyState.vue'
const route = useRoute()
const lesson = computed(() => lessons.find(item => item.id === route.params.id))
</script>
<template><article v-if="lesson" class="lesson-detail"><RouterLink :to="lesson.level === 'business' ? '/business' : `/learn/${lesson.level}`" class="text-link"><ArrowLeft :size="16" />返回学习板块</RouterLink><div class="page-title"><span class="eyebrow">{{ lesson.level.toUpperCase() }} · 示例内容</span><h1>{{ lesson.title }}</h1><p>{{ lesson.description }}</p></div><section class="detail-panel"><span class="eyebrow">EXPRESSION · 核心表达</span><h2 lang="ja">{{ lesson.japanese }}</h2><div class="placeholder-note">讲解区域：后续可在这里补充用法、接续方式及注意事项。</div></section><section class="detail-panel"><h2>例句与翻译</h2><div class="example-block"><p lang="ja">{{ lesson.example }}</p><span>{{ lesson.translation }}</span></div><div class="audio-placeholder"><Volume2 :size="18" />音频区域已预留，暂未添加录音。</div></section><section class="detail-panel"><h2>巩固练习</h2><p class="muted">此处预留选择题、填空题或跟读练习，后续逐步完善。</p></section></article><EmptyState v-else title="内容尚未收录" description="请从学习板块选择已提供的示例内容。"><RouterLink to="/" class="button primary">返回首页</RouterLink></EmptyState></template>
