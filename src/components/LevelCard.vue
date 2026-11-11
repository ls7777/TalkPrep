<script setup lang="ts">
import { ArrowUpRight } from 'lucide-vue-next'
import type { Level } from '../data/courses'
defineProps<{ level: Level }>()
</script>
<template>
  <RouterLink :to="`/learn/${level.id}`" class="level-card" :class="level.color">
    <div class="level-top"><span class="track-label">JLPT 日本语能力测试</span><ArrowUpRight :size="19" /></div>
    <h3 class="level-code">{{ level.name }}</h3>
    <p>{{ level.description }}</p>
    <div class="track-topics"><span>单词</span><span>语法</span><span>阅读</span><span>听力</span><span>练习</span></div>
    <div class="level-bottom"><span>进入 {{ level.name }} 学习</span><span>→</span></div>
  </RouterLink>
</template>
