import assert from 'node:assert/strict'
import { readFile,writeFile } from 'node:fs/promises'
import { randomUUID } from 'node:crypto'
import { database,checked } from '../server/config.mjs'
const admin=database(),base='http://127.0.0.1:3001/api/voice',records=[]
let user
try{
 const email=`voice-test-${randomUUID()}@example.com`,password=randomUUID()+'Aa1!'
 user=checked(await admin.auth.admin.createUser({email,password,email_confirm:true})).user
 const client=database(undefined,true),auth=checked(await client.auth.signInWithPassword({email,password})),token=auth.session.access_token
 const headers={Authorization:`Bearer ${token}`}
 async function call(path='',options={}){const r=await fetch(base+path,{...options,headers:{...headers,...options.headers}});const body=r.status===204?null:await r.json();if(!r.ok)throw new Error(JSON.stringify(body));return body}
 // Authentication is validated before multipart parsing.
 assert.equal((await fetch(base,{method:'POST'})).status,401)
 const broken=new FormData();broken.append('audio',new Blob(['broken'],{type:'audio/wav'}),'broken.wav');assert.equal((await fetch(base,{method:'POST',headers,body:broken})).status,422)
 const inputs=['japanese','mixed','silence']
 for(const name of inputs){
  const body=new FormData();body.append('audio',new Blob([await readFile(`.runtime/qa/${name}.wav`)],{type:'audio/wav'}),`${name}.wav`)
  const task=await call('',{method:'POST',body});records.push({name,id:task.id});console.log(`已上传 ${name}`)
 }
 for(const record of records){
  let last='',task,finished=false
  for(let i=0;i<600;i++){
   task=await call('/'+record.id)
   if(task.status!==last){console.log(`${record.name}: ${task.status}`);last=task.status}
   if(['completed','failed'].includes(task.status)){finished=true;break}
   await new Promise(r=>setTimeout(r,2000))
  }
  assert.ok(finished,'转写超时')
  if(record.name==='silence'){
   assert.equal(task.status,'failed');assert.match(task.error,/音声/)
   const retry=await call('/'+record.id+'/retry',{method:'POST'});assert.equal(retry.status,'queued')
   for(let i=0;i<120;i++){await new Promise(r=>setTimeout(r,1000));task=await call('/'+record.id);if(task.status==='failed')break}
   assert.equal(task.status,'failed');record.retryVerified=true
  }
  else{
   assert.equal(task.status,'completed',task.error);assert.ok(task.original_text);assert.ok(task.japanese_text);assert.ok(task.segments.length)
   assert.ok(!task.japanese_text.includes('<think>'));assert.ok(!task.japanese_text.includes('请帮'))
   console.log(`${record.name} 原文：${task.original_text}\n日语结果：${task.japanese_text}`)
   const saved=await call('/'+record.id,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({japanese_text:task.japanese_text+'\nテスト済み。'})});assert.ok(saved.japanese_text.endsWith('テスト済み。'))
  }
  record.result=task
  await call('/'+record.id,{method:'DELETE'})
  assert.equal((await fetch(base+'/'+record.id,{headers})).status,404)
 }
 await writeFile('data/reports/voice-qa.json',JSON.stringify({synthetic:true,date:new Date().toISOString(),results:records},null,2)+'\n')
 console.log('真实音频上传、转写、日语转换、静音失败、编辑及删除通过。')
}finally{if(user){checked(await admin.auth.admin.deleteUser(user.id))}}
