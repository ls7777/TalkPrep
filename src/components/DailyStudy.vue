<script setup lang="ts">
import { ref,onMounted,onUnmounted } from 'vue'
import { api,type Course } from '../lib/api'
const items=ref<{grammar?:Course;vocabulary?:Course}>({}),error=ref(''),date=ref(''),loading=ref(true)
let timer:ReturnType<typeof setInterval>|undefined,alive=true
function localDate(){const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}
async function load(){const key=localDate();if(key===date.value)return;date.value=key;loading.value=true;try{const data=await api<typeof items.value>(`/daily?date=${key}`);if(alive){items.value=data;error.value=''}}catch(e){if(alive)error.value=(e as Error).message}finally{if(alive)loading.value=false}}
onMounted(()=>{void load();timer=setInterval(load,30000)})
onUnmounted(()=>{alive=false;clearInterval(timer)})
</script>
<template><section class="daily-study"><div class="daily-study-heading"><h2>每日学习</h2><span>{{ date }}</span></div><p v-if="loading" role="status">正在读取每日内容…</p><p v-else-if="error" class="muted">{{ error }}</p><p v-else-if="!items.grammar&&!items.vocabulary">数据库尚无课程，请先导入学习资料。</p><div v-else class="daily-study-grid"><template v-for="category in (['grammar','vocabulary'] as const)" :key="category"><article v-if="items[category]" class="daily-study-card"><div class="daily-card-heading"><span>{{ category==='grammar'?'每日语法':'每日单词' }}</span><span class="pill">{{ items[category]!.level.toUpperCase() }}</span></div><h3 lang="ja">{{ items[category]!.japanese }}</h3><p>{{ items[category]!.meaning_zh||'中文释义待补充' }}</p><div v-if="items[category]!.examples?.length" class="daily-example"><p lang="ja">{{ items[category]!.examples![0]!.ja }}</p><span>{{ items[category]!.examples![0]!.zh||'中文翻译待补充' }}</span></div><RouterLink :to="'/lesson/'+items[category]!.id" class="text-link">查看详情 →</RouterLink></article></template></div></section></template>
