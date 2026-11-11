<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { ArrowUpRight, BookOpen, Search } from 'lucide-vue-next'
import { levels, categories, businessCategories, lessons } from '../data/courses'
import EmptyState from '../components/EmptyState.vue'
const route = useRoute()
const isBusiness = computed(() => route.path === '/business')
const level = computed(() => levels.find(item => item.id === String(route.params.level).toLowerCase()))
const valid = computed(() => isBusiness.value || !!level.value)
const levelId = computed(() => isBusiness.value ? 'business' : level.value?.id)
const tabs = computed(() => isBusiness.value ? businessCategories : categories)
const category = ref('all')
const search = ref('')
watch(() => route.fullPath, () => { category.value = tabs.value.some(t => t.id === route.query.category) ? String(route.query.category) : 'all'; search.value = '' }, { immediate: true })
const filtered = computed(() => lessons.filter(item => item.level === levelId.value && (category.value === 'all' || item.category === category.value) && `${item.title}${item.japanese}${item.description}`.toLowerCase().includes(search.value.trim().toLowerCase())))
</script>
<template>
  <div v-if="valid"><div class="page-title"><span class="eyebrow">{{ isBusiness ? 'BUSINESS JAPANESE' : `JLPT · ${level?.id.toUpperCase()}` }}</span><h1>{{ isBusiness ? '商务日语' : level?.name }}</h1><p>{{ isBusiness ? '从得体的问候开始，逐步建立职场中的日语表达能力。' : level?.description }}</p></div><div class="study-layout"><section class="study-main"><div class="study-toolbar"><div class="tabs" aria-label="内容分类"><button v-for="tab in tabs" :key="tab.id" :class="{ selected: category === tab.id }" :aria-pressed="category === tab.id" @click="category = tab.id">{{ tab.label }}</button></div><label class="search-field"><Search :size="17" /><input v-model="search" aria-label="搜索课程" placeholder="搜索本板块内容…" type="search" /></label></div><div class="content-caption">{{ filtered.length }} 个示例内容<span>课程内容将逐步完善</span></div><div v-if="filtered.length" class="lesson-grid"><RouterLink v-for="lesson in filtered" :key="lesson.id" :to="`/lesson/${lesson.id}`" class="lesson-card"><div class="lesson-card-top"><BookOpen :size="22" :stroke-width="1.4" /><span class="pill">示例内容</span></div><span class="lesson-japanese" lang="ja">{{ lesson.japanese }}</span><h2>{{ lesson.title }}</h2><p>{{ lesson.description }}</p><div class="lesson-card-footer"><span>查看内容</span><ArrowUpRight :size="18" /></div></RouterLink></div><EmptyState v-else :title="search ? '没有找到匹配的内容' : '这片学习园地，等待新的内容'" :description="search ? '试试其他关键词，或切换内容分类。' : '板块已经准备好，后续将在这里添加课程与练习。'" /></section><aside class="study-aside"><span class="eyebrow">LEARNING GUIDE</span><h3>按照自己的节奏学习</h3><ol><li>选择想学习的分类</li><li>理解表达与例句</li><li>尝试复述并定期复习</li></ol><div class="aside-divider"></div><h3>学习进度</h3><p>学习记录功能将在后续开放。</p><RouterLink to="/profile" class="text-link">查看个人中心 →</RouterLink></aside></div></div>
  <EmptyState v-else title="没有这个学习等级" description="请选择 N1、N2 或商务日语板块。"><RouterLink to="/" class="button primary">返回首页</RouterLink></EmptyState>
</template>
