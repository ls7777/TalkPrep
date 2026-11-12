<script setup lang="ts">
import { reactive,onMounted } from 'vue'
import { api,type Course } from '../lib/api'
interface Section {kind:'recent'|'favorites';title:string;category:string;page:number;total:number;items:{lesson:Course;date:string}[];loading:boolean;error:string;request:number}
const sections=reactive<Section[]>([
 {kind:'recent',title:'最近学习',category:'all',page:1,total:0,items:[],loading:true,error:'',request:0},
 {kind:'favorites',title:'我的收藏',category:'all',page:1,total:0,items:[],loading:true,error:'',request:0}
])
const tabs=[{id:'all',label:'全部'},{id:'vocabulary',label:'单词'},{id:'grammar',label:'语法'}]
async function load(section:Section){const n=++section.request;section.loading=true;section.error='';try{const data=await api<{items:Section['items'];total:number}>(`/learning/${section.kind}?${new URLSearchParams({category:section.category,page:String(section.page)})}`);if(n===section.request){section.items=data.items;section.total=data.total}}catch(e){if(n===section.request)section.error=(e as Error).message}finally{if(n===section.request)section.loading=false}}
function filter(section:Section,category:string){section.category=category;section.page=1;void load(section)}
function page(section:Section,delta:number){section.page+=delta;void load(section)}
async function remove(section:Section,id:string){section.error='';try{await api('/learning/favorites/'+id,{method:'DELETE'});if(section.items.length===1&&section.page>1)section.page--;await load(section)}catch(e){section.error=(e as Error).message}}
onMounted(()=>{for(const section of sections)void load(section)})
</script>
<template><div><div class="page-title"><h1>我的学习</h1><p>回顾最近学过的内容，复习收藏的单词和语法。</p></div>
 <section v-for="section in sections" :key="section.kind" class="learning-section"><h2>{{ section.title }}</h2><div class="tabs"><button v-for="tab in tabs" :key="tab.id" :class="{selected:section.category===tab.id}" :aria-pressed="section.category===tab.id" @click="filter(section,tab.id)">{{ tab.label }}</button></div>
 <p v-if="section.error" role="alert" class="error-text">{{ section.error }} <button class="button" @click="load(section)">重试</button></p><p v-else-if="section.loading" role="status">正在读取…</p><p v-else-if="!section.items.length" class="muted">{{ section.kind==='recent'?'还没有学习记录。打开一条单词或语法详情后，会自动保存在这里。':'还没有收藏。可以在单词或语法详情页点击收藏。' }}</p>
 <div v-else class="lesson-grid"><article v-for="item in section.items" :key="item.lesson.id" class="lesson-card"><RouterLink :to="'/lesson/'+item.lesson.id"><span class="pill">{{ item.lesson.level.toUpperCase() }} · {{ item.lesson.category==='grammar'?'语法':'单词' }}</span><h3 lang="ja">{{ item.lesson.japanese }}</h3><p>{{ item.lesson.meaning_zh||'中文释义待补充' }}</p></RouterLink><time>{{ new Date(item.date).toLocaleString('zh-CN') }}</time><button v-if="section.kind==='favorites'" class="button" @click="remove(section,item.lesson.id)">取消收藏</button></article></div>
 <div v-if="section.total>24" class="pagination"><button class="button" :disabled="section.loading||section.page<=1" @click="page(section,-1)">上一页</button><span>{{ section.page }} / {{ Math.ceil(section.total/24) }}</span><button class="button" :disabled="section.loading||section.page*24>=section.total" @click="page(section,1)">下一页</button></div></section>
 </div></template>
