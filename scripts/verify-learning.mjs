import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { database,checked } from '../server/config.mjs'
const admin=database(),users=[],base='http://127.0.0.1:3001/api/learning'
try{
 const clients=[],tokens=[]
 for(let i=0;i<2;i++){
  const email=`learning-test-${randomUUID()}@example.com`,password=randomUUID()+'Aa1!'
  const user=checked(await admin.auth.admin.createUser({email,password,email_confirm:true})).user;users.push(user.id)
  const client=database(undefined,true);clients.push(client);tokens.push(checked(await client.auth.signInWithPassword({email,password})).session.access_token)
 }
 const lessonIds=[]
 for(const category of ['grammar','vocabulary'])lessonIds.push(checked(await admin.from('lessons').select('id').eq('category',category).limit(1))[0].id)
 async function call(user,path,method='GET'){
  const response=await fetch(base+path,{method,headers:{Authorization:`Bearer ${tokens[user]}`}})
  const body=response.status===204?null:await response.json()
  assert.ok(response.ok,JSON.stringify(body));return body
 }
 assert.equal((await fetch(base+'/recent')).status,401)
 for(const id of lessonIds)await call(0,'/history/'+id,'POST')
 await call(0,'/history/'+lessonIds[0],'POST')
 assert.equal((await call(0,'/recent')).total,2)
 assert.equal((await call(0,'/recent?category=grammar')).total,1)
 assert.equal((await call(1,'/recent')).total,0)
 await call(0,'/favorites/'+lessonIds[0],'PUT');await call(0,'/favorites/'+lessonIds[0],'PUT')
 assert.equal((await call(0,'/favorites')).total,1)
 assert.equal((await call(1,'/favorites')).total,0)
 await call(1,'/favorites/'+lessonIds[0],'DELETE')
 assert.equal((await call(0,'/favorites/'+lessonIds[0])).saved,true)
 assert.ok((await clients[1].from('favorites').insert({user_id:users[0],lesson_id:lessonIds[1]})).error)
 await call(0,'/favorites/'+lessonIds[1],'PUT')
 assert.equal((await call(0,'/favorites?category=vocabulary')).items[0].lesson.id,lessonIds[1])
 await call(0,'/favorites/'+lessonIds[0],'DELETE')
 assert.equal((await call(0,'/favorites/'+lessonIds[0])).saved,false)
 assert.equal((await call(0,'/favorites')).total,1)
 console.log('真实学习记录、重复浏览去重、收藏/取消、分类和双账号隔离通过。')
}finally{for(const id of users)checked(await admin.auth.admin.deleteUser(id))}
