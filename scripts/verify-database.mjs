// Explicit integration check against the configured real project. Temporary users are deleted in finally.
import { randomUUID } from 'node:crypto'
import assert from 'node:assert/strict'
import { database,checked } from '../server/config.mjs'
const admin=database(),ids=[]
try{
 const clients=[]
 for(let i=0;i<2;i++){
  const email=`integration-${randomUUID()}@example.com`,password=randomUUID()+'Aa1!'
  const user=checked(await admin.auth.admin.createUser({email,password,email_confirm:true})).user;ids.push(user.id)
  const client=database(undefined,true),auth=await client.auth.signInWithPassword({email,password});checked(auth)
  assert.equal(auth.data.user.id,user.id);clients.push(client)
 }
 const task=checked(await admin.from('voice_tasks').insert({user_id:ids[0],title:'隔离验证',duration:1,status:'completed'}).select().single())
 assert.equal(checked(await clients[0].from('voice_tasks').select('id').eq('id',task.id)).length,1)
 assert.equal(checked(await clients[1].from('voice_tasks').select('id').eq('id',task.id)).length,0)
 assert.ok((await clients[1].from('voice_tasks').update({title:'禁止修改'}).eq('id',task.id)).error)
 assert.ok((await database(undefined,true).from('voice_tasks').select('id')).error)
 const courses=checked(await clients[0].from('lessons').select('id').limit(1));assert.equal(courses.length,1)
 const a=checked(await admin.from('lessons').select('*').limit(1))[0]
 checked(await admin.from('lessons').upsert(a));checked(await admin.from('lessons').upsert(a))
 assert.equal(checked(await admin.from('lessons').select('id').eq('id',a.id)).length,1)
 const {meaning_zh,notes_zh,translation_machine,...baseLesson}=a
 checked(await admin.from('lessons').upsert(baseLesson))
 assert.equal(checked(await admin.from('lessons').select('meaning_zh').eq('id',a.id).single()).meaning_zh,meaning_zh)
 const token=(await clients[0].auth.getSession()).data.session
 const restored=database(undefined,true);checked(await restored.auth.setSession({access_token:token.access_token,refresh_token:token.refresh_token}));assert.equal((await restored.auth.getUser()).data.user.id,ids[0])
 for(const client of clients)checked(await client.auth.signOut())
 console.log('真实数据库读写、幂等更新、登录恢复、退出与双账号隔离通过。')
}finally{for(const id of ids)checked(await admin.auth.admin.deleteUser(id))}
