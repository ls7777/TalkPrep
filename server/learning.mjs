import { Router } from 'express'
import { authenticate } from './auth.mjs'
import { checked } from './config.mjs'
export const learningRouter=Router()
const wrap=fn=>(req,res,next)=>Promise.resolve(fn(req,res,next)).catch(next)
learningRouter.use(authenticate)
async function lesson(req){
 if(!/^[a-z0-9-]{1,200}$/.test(req.params.id))throw Object.assign(new Error('学習項目が見つかりません。'),{status:404})
 const row=checked(await req.userDb.from('lessons').select('id').eq('id',req.params.id).maybeSingle())
 if(!row)throw Object.assign(new Error('学習項目が見つかりません。'),{status:404})
}
learningRouter.get('/favorites/:id',wrap(async(req,res)=>{await lesson(req);const row=checked(await req.userDb.from('favorites').select('lesson_id').eq('lesson_id',req.params.id).eq('user_id',req.user.id).maybeSingle());res.json({saved:!!row})}))
learningRouter.put('/favorites/:id',wrap(async(req,res)=>{await lesson(req);checked(await req.userDb.from('favorites').upsert({user_id:req.user.id,lesson_id:req.params.id},{onConflict:'user_id,lesson_id',ignoreDuplicates:true}));res.json({saved:true})}))
learningRouter.delete('/favorites/:id',wrap(async(req,res)=>{checked(await req.userDb.from('favorites').delete().eq('user_id',req.user.id).eq('lesson_id',req.params.id));res.status(204).end()}))
learningRouter.post('/history/:id',wrap(async(req,res)=>{await lesson(req);checked(await req.userDb.from('learning_history').upsert({user_id:req.user.id,lesson_id:req.params.id,viewed_at:new Date().toISOString()},{onConflict:'user_id,lesson_id'}));res.status(204).end()}))
learningRouter.get('/:kind',wrap(async(req,res)=>{
 const kind=req.params.kind,category=String(req.query.category||'all'),page=Number(req.query.page||1),pageSize=24
 if(!['recent','favorites'].includes(kind)||!['all','grammar','vocabulary'].includes(category)||!Number.isInteger(page)||page<1||page>10000)throw Object.assign(new Error('表示条件が正しくありません。'),{status:400})
 const table=kind==='recent'?'learning_history':'favorites',time=kind==='recent'?'viewed_at':'created_at'
 let q=req.userDb.from(table).select(`${time},lessons!inner(*)`,{count:'exact'}).eq('user_id',req.user.id)
 if(category!=='all')q=q.eq('lessons.category',category)
 const result=await q.order(time,{ascending:false}).order('lesson_id').range((page-1)*pageSize,page*pageSize-1);checked(result)
 res.json({items:result.data.map(row=>({lesson:row.lessons,date:row[time]})),total:result.count,page,pageSize})
}))
