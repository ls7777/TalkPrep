<script setup lang="ts">
import { Code2 } from 'lucide-vue-next'

const editorUrl = import.meta.env.DEV ? import.meta.env.VITE_EDITOR_URL : ''
</script>

<template>
  <a v-if="editorUrl" :href="editorUrl" class="login-link editor-link" title="在本机 VS Code 中打开当前项目（浏览器可能要求允许打开应用）" aria-label="在 VS Code 中打开当前项目">
    <Code2 :size="15" />VS Code
  </a>
</template>
