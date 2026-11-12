import express from 'express'
import { database, checked, ollamaUrl, ollamaModel } from './config.mjs'
import { runPython } from './python.mjs'
import { voiceRouter, startWorker } from './voice.mjs'
import { learningRouter } from './learning.mjs'
import { japaneseError } from '../shared/errors.mjs'
const app=express()
app.disable('x-powered-by')
app.use(express.json({limit:'1mb'}))
app.use((req,res,next)=>{res.setHeader('Cache-Control','no-store');next()})
export const wrap=fn=>(req,res,next)=>Promise.resolve(fn(req,res,next)).catch(next)
const fail=(message,status=400)=>Object.assign(new Error(message),{status})
function publicDb(){return database(undefined,true)}
app.get('/api/health',wrap(async(req,res)=>{
 const health={database:{ready:false,message:''},recognition:{ready:false,message:''},translation:{ready:false,message:''}}
 await Promise.all([
  (async()=>{try{checked(await database().from('lessons').select('id').limit(1).abortSignal(AbortSignal.timeout(5000)));health.database.ready=true}catch(e){health.database.message=e.message}})(),
  (async()=>{try{const r=await runPython(['health'],()=>{},10000);health.recognition.ready=!!r.ready;health.recognition.message=r.ready?'':'请运行 npm run audio:setup 下载模型'}catch(e){health.recognition.message=e.message}})(),
  (async()=>{try{const r=await fetch(`${ollamaUrl}/api/tags`,{signal:AbortSignal.timeout(3000)});const b=await r.json();health.translation.ready=b.models?.some(m=>m.name===ollamaModel)||false;health.translation.message=health.translation.ready?'':'请运行 ollama pull qwen3:4b-instruct-2507-q4_K_M'}catch{health.translation.message='请安装并启动 Ollama'}})()
 ]);for(const status of Object.values(health))if(!status.ready)status.message=japaneseError(status.message);res.json(health)
}))
app.get('/api/lessons',wrap(async(req,res)=>{
 const {level,category}=req.query
 if(!['n1','n2'].includes(level)||!['all','grammar','vocabulary','reading','listening','practice'].includes(category||'all'))throw fail('等级或分类不正确')
 const page=Number(req.query.page||1),size=24
 if(!Number.isInteger(page)||page<1||page>10000)throw fail('页码不正确')
 let q=publicDb().from('lessons').select('*',{count:'exact'}).eq('level',level)
 if(category&&category!=='all')q=q.eq('category',category)
 const search=String(req.query.search||'').trim().slice(0,100).replace(/[,%_()"\\]/g,' ')
 if(search)q=q.or(`japanese.ilike.%${search}%,reading.ilike.%${search}%,meanings_en.ilike.%${search}%,meaning_zh.ilike.%${search}%`)
 const r=await q.order('id').range((page-1)*size,page*size-1);checked(r);res.json({items:r.data,total:r.count,page,pageSize:size})
}))
app.get('/api/lessons/:id',wrap(async(req,res)=>{
 const lesson=checked(await publicDb().from('lessons').select('*,examples(*),data_sources(*)').eq('id',req.params.id).maybeSingle())
 if(!lesson)throw fail('课程不存在',404)
 lesson.examples.sort((a,b)=>a.position-b.position);res.json(lesson)
}))
app.get('/api/daily',wrap(async(req,res)=>{
 const date=String(req.query.date||new Date().toISOString().slice(0,10))
 if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||!Number.isFinite(Date.parse(date)))throw fail('日期不正确')
 const seed=Math.floor(Date.parse(date)/86400000),items={}
 for(const category of ['grammar','vocabulary']){
  const count=await publicDb().from('lessons').select('id',{count:'exact',head:true}).eq('category',category);checked(count)
  if(count.count){const n=((seed%count.count)+count.count)%count.count;items[category]=checked(await publicDb().from('lessons').select('*,examples(*)').eq('category',category).order('id').range(n,n))[0]}
 }res.json(items)
}))
app.use('/api/voice',voiceRouter)
app.use('/api/learning',learningRouter)
app.use((req,res)=>res.status(404).json({error:{message:'指定されたAPIが見つかりません。'}}))
app.use((error,req,res,next)=>res.status(error.code==='LIMIT_FILE_SIZE'?413:error.status||500).json({error:{message:error.code==='LIMIT_FILE_SIZE'?'音声ファイルは100 MB以下にしてください。':japaneseError(error)}}))
await startWorker()
app.listen(Number(process.env.PORT||3001),'127.0.0.1',()=>console.log(`日语学习 API: http://127.0.0.1:${process.env.PORT||3001}`))
