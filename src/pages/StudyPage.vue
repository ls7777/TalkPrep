<script setup lang="ts">
import { computed, ref, watch, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { api, type Course } from '../lib/api'
import { levels,categories,businessCategories,lessons } from '../data/courses'
import EmptyState from '../components/EmptyState.vue'
const route=useRoute(),business=computed(()=>route.path==='/business')
const level=computed(()=>String(route.params.level||'business'))
const category=ref('all'),search=ref(''),page=ref(1),total=ref(0),items=ref<Course[]>([]),error=ref(''),loading=ref(false)
const tabs=computed(()=>business.value?businessCategories:categories)
const businessLessons=computed(()=>lessons.filter(l=>l.level==='business'&&(category.value==='all'||l.category===category.value)&&`${l.japanese}${l.title}${l.description}`.includes(search.value)))
let request=0,timer:ReturnType<typeof setTimeout>|undefined
async function load(){
 const current=++request
 if(business.value){loading.value=false;error.value='';return}
 loading.value=true;error.value=''
 try{const r=await api<{items:Course[];total:number}>(`/lessons?${new URLSearchParams({level:level.value,category:category.value,search:search.value,page:String(page.value)})}`);if(current===request){items.value=r.items;total.value=r.total}}
 catch(e){if(current===request){error.value=(e as Error).message;items.value=[]}}
 finally{if(current===request)loading.value=false}
}
watch(()=>route.fullPath,()=>{clearTimeout(timer);category.value=tabs.value.some(t=>t.id===route.query.category)?String(route.query.category):'all';search.value='';page.value=1;void load()},{immediate:true})
watch([category,search],()=>{clearTimeout(timer);page.value=1;timer=setTimeout(load,250)})
watch(page,()=>void load())
onUnmounted(()=>{request++;clearTimeout(timer)})
</script>
<template><div><div class="page-title"><span class="eyebrow">{{ business?'BUSINESS JAPANESE':'JLPT · '+level.toUpperCase() }}</span><h1>{{ business?'商务日语':level.toUpperCase() }}</h1><p>{{ business?'从得体的表达开始，走进真实的职场。':levels.find(l=>l.id===level)?.description }}</p></div>
 <div class="study-toolbar"><div class="tabs"><button v-for="tab in tabs" :key="tab.id" :class="{selected:category===tab.id}" :aria-pressed="category===tab.id" @click="category=tab.id">{{ tab.label }}</button></div><label class="search-field"><input v-model="search" type="search" aria-label="搜索课程" placeholder="搜索日语、读音或释义…" /></label></div>
 <p v-if="!business" class="muted">社区整理的 N1 / N2 学习资料，非官方完整考纲。中文辅助翻译标注为机器翻译。</p>
 <p v-if="loading" role="status">正在读取课程…</p><div v-else-if="error" class="detail-panel"><p role="alert" class="error-text">{{ error }}</p><button class="button" @click="load">重新加载</button></div>
 <template v-else-if="business"><p class="content-caption">{{ businessLessons.length }} 条示例内容</p><div class="lesson-grid"><RouterLink v-for="l in businessLessons" :key="l.id" :to="'/lesson/'+l.id" class="lesson-card"><span class="pill">商务示例</span><h2>{{ l.japanese }}</h2><p>{{ l.description }}</p></RouterLink></div></template>
 <template v-else><p class="content-caption">共 {{ total }} 条内容 · 第 {{ page }} 页</p><div v-if="items.length" class="lesson-grid"><RouterLink v-for="l in items" :key="l.id" :to="'/lesson/'+l.id" class="lesson-card"><span class="pill">{{ l.category==='grammar'?'语法':'单词' }}</span><h2 lang="ja">{{ l.japanese }}</h2><p lang="ja">{{ l.reading }}</p><p>{{ l.meaning_zh||'中文释义待补充' }}</p><small v-if="l.translation_machine">中文机器翻译</small></RouterLink></div><EmptyState v-else title="暂无匹配内容" description="可尝试其他关键词。阅读、听力和练习题库尚未开放。" />
 <div class="pagination"><button class="button" :disabled="page<=1" @click="page--">上一页</button><span>{{ page }} / {{ Math.max(1,Math.ceil(total/24)) }}</span><button class="button" :disabled="page*24>=total" @click="page++">下一页</button></div></template>
 </div></template>
