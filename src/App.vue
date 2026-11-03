<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { ArrowUpRight, BookOpen, BriefcaseBusiness, ChevronRight, Home, Menu, Sprout, UserRound, X } from 'lucide-vue-next'
import { levels } from './data/courses'
const route = useRoute()
const menuOpen = ref(false)
watch(() => route.fullPath, () => { menuOpen.value = false })
</script>
<template>
  <div class="app-shell">
    <aside class="sidebar" :class="{ open: menuOpen }">
      <RouterLink to="/" class="brand"><span class="brand-mark">言</span><span><strong>言葉 <small>KOTOBA</small></strong><em>日语学习空间</em></span></RouterLink>
      <div class="sidebar-body">
        <span class="nav-caption">你的学习空间</span>
        <RouterLink to="/" class="nav-link" exact-active-class="active"><Home :size="18" />学习首页</RouterLink>
        <div class="nav-group-label"><BookOpen :size="17" />JLPT 等级学习</div>
        <RouterLink v-for="level in levels" :key="level.id" :to="`/learn/${level.id}`" class="nav-link level-nav" active-class="active"><span class="nav-level">{{ level.id.toUpperCase() }}</span><ChevronRight :size="13" /></RouterLink>
        <RouterLink to="/business" class="nav-link business-nav" active-class="active"><BriefcaseBusiness :size="18" />商务日语<span class="tiny-tag">职场</span></RouterLink>
        <div class="nav-divider"></div><span class="nav-caption">个人空间</span>
        <RouterLink to="/profile" class="nav-link" active-class="active"><UserRound :size="18" />我的学习</RouterLink>
      </div>
      <div class="sidebar-note"><Sprout :size="23" /><p>每天一点，慢慢走远。</p><span lang="ja">継続は力なり。</span></div>
      <div class="sidebar-footer">KOTOBA · 学びのある日々</div>
    </aside>
    <button v-if="menuOpen" class="menu-overlay" aria-label="关闭导航" @click="menuOpen = false"></button>
    <div class="workspace">
      <header class="topbar"><div class="topbar-left"><button class="icon-button mobile-menu" :aria-expanded="menuOpen" aria-label="展开导航" @click="menuOpen = !menuOpen"><X v-if="menuOpen" :size="21" /><Menu v-else :size="21" /></button><span>学习空间</span><ChevronRight :size="14" /><strong>{{ route.meta.title }}</strong></div><div class="topbar-right"><span class="topbar-motto" lang="ja">今日も、一歩ずつ。</span><RouterLink to="/login" class="login-link">登录 / 注册<ArrowUpRight :size="15" /></RouterLink></div></header>
      <main id="main-content" class="page-container"><RouterView /></main>
      <footer class="page-footer"><span>© {{ new Date().getFullYear() }} 言葉 Kotoba</span><span>让日语学习，成为日常的一部分。</span><RouterLink to="/">返回首页 ↑</RouterLink></footer>
    </div>
  </div>
</template>
