<script setup lang="ts">
import { ref } from 'vue'
import { ArrowUpRight, BookOpen, BriefcaseBusiness, ChevronRight, Headphones, Layers3 } from 'lucide-vue-next'
import { levels } from '../data/courses'
import LevelCard from '../components/LevelCard.vue'
import SectionHeading from '../components/SectionHeading.vue'
import DailyStudy from '../components/DailyStudy.vue'

const practiceLevel = ref('n1')
const skills = [
  { name: '单词', description: '积累词义与搭配', icon: BookOpen, category: 'vocabulary' },
  { name: '语法', description: '理解句型与语感', icon: Layers3, category: 'grammar' },
  { name: '阅读', description: '读懂长文与逻辑', icon: BookOpen, category: 'reading' },
  { name: '听力', description: '把握信息与意图', icon: Headphones, category: 'listening' },
]
</script>

<template>
  <div class="home-page">
    <div class="home-heading"><div><span class="eyebrow">YOUR JAPANESE STUDY DESK</span><h1>让每一次学习，都更进一步。</h1><p>专注 N1、N2 与商务日语，从理解到运用。</p></div><span class="home-heading-note" lang="ja">今日も、ひとつ深く。</span></div>
    <section class="track-section" aria-labelledby="track-title">
      <div class="compact-heading"><h2 id="track-title">选择学习方向</h2><span>备考与职场，各有路径</span></div>
      <div class="track-grid">
        <LevelCard v-for="level in levels" :key="level.id" :level="level" />
        <RouterLink to="/business" class="level-card business-card">
          <div class="level-top"><span class="track-label">BUSINESS JAPANESE</span><ArrowUpRight :size="19" /></div>
          <div class="business-card-title"><BriefcaseBusiness :size="26" :stroke-width="1.4" /><h3>商务日语</h3></div>
          <p>把得体的表达，带进真实的职场场景。</p>
          <div class="track-topics"><span>敬语</span><span>邮件</span><span>会议</span><span>电话</span><span>面试</span></div>
          <div class="level-bottom"><span>进入商务日语</span><span>→</span></div>
        </RouterLink>
      </div>
    </section>
    <div class="study-desk">
      <DailyStudy />
      <section class="practice-panel" aria-labelledby="practice-title">
        <SectionHeading eyebrow="FOCUS PRACTICE" title="按能力学习" />
        <h2 id="practice-title" class="sr-only">选择等级和学习分类</h2>
        <div class="level-switch" aria-label="练习等级"><button v-for="level in levels" :key="level.id" :aria-pressed="practiceLevel === level.id" :class="{ selected: practiceLevel === level.id }" @click="practiceLevel = level.id">{{ level.name }}</button></div>
        <div class="skills-grid"><RouterLink v-for="skill in skills" :key="skill.category" :to="{ path: `/learn/${practiceLevel}`, query: { category: skill.category } }" class="skill-card"><component :is="skill.icon" :size="19" :stroke-width="1.5" /><div><h3>{{ skill.name }}</h3><span>{{ skill.description }}</span></div><ChevronRight :size="15" /></RouterLink></div>
        <RouterLink :to="{ path: `/learn/${practiceLevel}`, query: { category: 'practice' } }" class="practice-link">查看 {{ practiceLevel.toUpperCase() }} 练习板块<ArrowUpRight :size="15" /></RouterLink>
      </section>
    </div>
    <div class="study-reminder"><span>少一点泛学，多一点深入。</span><p>先理解一个表达，再放进一句属于自己的日语里。</p><span lang="ja">一歩ずつ、確かに。</span></div>
  </div>
</template>
