<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { ArrowUpRight, Menu, UserRound, X } from 'lucide-vue-next'
import { levels } from './data/courses'
import OpenInEditor from './components/OpenInEditor.vue'

const route = useRoute()
const menuOpen = ref(false)
watch(() => route.fullPath, () => { menuOpen.value = false })
</script>

<template>
  <div class="app-shell">
    <a href="#main-content" class="skip-link">跳到主要内容</a>
    <header class="site-header">
      <div class="header-inner">
        <RouterLink to="/" class="brand" aria-label="言葉 Kotoba 首页">
          <span class="brand-mark">言</span>
          <span><strong>言葉 <small>KOTOBA</small></strong><em>日语学习空间</em></span>
        </RouterLink>
        <nav id="main-navigation" class="main-navigation" :class="{ open: menuOpen }" aria-label="主导航">
          <RouterLink to="/" exact-active-class="active">学习首页</RouterLink>
          <RouterLink v-for="level in levels" :key="level.id" :to="`/learn/${level.id}`" active-class="active">{{ level.name }}</RouterLink>
          <RouterLink to="/business" active-class="active">商务日语</RouterLink>
          <RouterLink to="/profile" active-class="active" class="profile-nav"><UserRound :size="15" />我的学习</RouterLink>
        </nav>
        <div class="header-actions">
          <OpenInEditor />
          <RouterLink to="/login" class="login-link">登录 / 注册<ArrowUpRight :size="14" /></RouterLink>
          <button class="icon-button mobile-menu" :aria-expanded="menuOpen" aria-controls="main-navigation" :aria-label="menuOpen ? '关闭导航' : '展开导航'" @click="menuOpen = !menuOpen">
            <X v-if="menuOpen" :size="22" /><Menu v-else :size="22" />
          </button>
        </div>
      </div>
    </header>
    <div class="workspace">
      <div class="location-bar"><RouterLink to="/">学习空间</RouterLink><span>/</span><span>{{ route.meta.title }}</span><span class="location-motto" lang="ja">学びを、次のステージへ。</span></div>
      <main id="main-content" class="page-container" tabindex="-1"><RouterView /></main>
      <footer class="page-footer"><span>© {{ new Date().getFullYear() }} 言葉 Kotoba</span><span>N1 · N2 · 商务日语</span><RouterLink to="/">返回首页 ↑</RouterLink></footer>
    </div>
  </div>
</template>
