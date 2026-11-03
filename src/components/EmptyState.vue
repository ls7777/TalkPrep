<script setup lang="ts">
import { Sprout } from 'lucide-vue-next'
defineProps<{ title: string; description: string }>()
</script>
<template><div class="empty-state"><Sprout :size="32" :stroke-width="1.3" /><h3>{{ title }}</h3><p>{{ description }}</p><slot /></div></template>
