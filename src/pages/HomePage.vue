<script setup lang="ts">
import { ArrowRight, BookOpen, BriefcaseBusiness, ChevronRight, Headphones, Layers3 } from 'lucide-vue-next'
import { levels } from '../data/courses'
import LevelCard from '../components/LevelCard.vue'
import SectionHeading from '../components/SectionHeading.vue'
import DailyStudy from '../components/DailyStudy.vue'
const skills = [ { name: '单词积累', ja: 'ことば', icon: BookOpen, category: 'vocabulary' }, { name: '语法理解', ja: 'ぶんぽう', icon: Layers3, category: 'grammar' }, { name: '阅读训练', ja: 'どっかい', icon: BookOpen, category: 'reading' }, { name: '听力练习', ja: 'ちょうかい', icon: Headphones, category: 'listening' } ]
</script>
<template>
  <div class="home-page">
    <DailyStudy />
    <section id="learning-path" class="section-block"><SectionHeading eyebrow="YOUR LEARNING PATH" title="找到你的学习起点" description="从入门到精通，沿着自己的节奏，一步一步向前。"><span class="section-aside">JLPT 日本语能力测试</span></SectionHeading><div class="level-grid"><LevelCard v-for="level in levels" :key="level.id" :level="level" /></div></section>
    <section class="business-banner"><div class="business-symbol" aria-hidden="true"><BriefcaseBusiness :size="35" :stroke-width="1.2" /></div><div class="business-copy"><span class="eyebrow">BEYOND THE CLASSROOM</span><h2>让日语，成为你的职场底气。</h2><p>敬语表达 · 商务邮件 · 会议交流 · 电话应对 · 求职面试</p></div><RouterLink to="/business" class="button light">探索商务日语<ArrowRight :size="17" /></RouterLink><span class="business-watermark" aria-hidden="true">仕事</span></section>
    <div class="home-bottom"><section class="skills-section"><SectionHeading eyebrow="BUILD YOUR FOUNDATION" title="每一种能力，都值得练习" /><div class="skills-grid"><RouterLink v-for="skill in skills" :key="skill.category" :to="{ path: '/learn/n5', query: { category: skill.category } }" class="skill-card"><component :is="skill.icon" :size="21" :stroke-width="1.5" /><div><h3>{{ skill.name }}</h3><span lang="ja">{{ skill.ja }}</span></div><ChevronRight :size="15" /></RouterLink></div></section><section class="daily-note"><span class="eyebrow">今日のことば · 每日一句</span><blockquote lang="ja">千里の道も一歩から。</blockquote><p>千里之行，始于足下。</p><div><span>从一个单词、一句表达开始。</span><span class="note-seal">一歩</span></div></section></div>
  </div>
</template>
