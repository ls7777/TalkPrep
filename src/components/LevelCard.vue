<script setup lang="ts">
import { ArrowUpRight } from 'lucide-vue-next'
import type { Level } from '../data/courses'
defineProps<{ level: Level }>()
</script>
<template>
  <RouterLink :to="`/learn/${level.id}`" class="level-card" :class="level.color">
    <div class="level-top"><span class="level-code">{{ level.id.toUpperCase() }}</span><ArrowUpRight :size="18" /></div>
    <span class="level-kana" lang="ja">{{ level.kana }}</span><p>{{ level.description }}</p>
    <div class="level-bottom"><span>探索学习板块</span><span>→</span></div>
  </RouterLink>
</template>
