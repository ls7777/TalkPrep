import { test } from 'node:test'
import assert from 'node:assert/strict'
import { PGlite } from '@electric-sql/pglite'
import { readFile } from 'node:fs/promises'
test('真实 PostgreSQL 引擎执行迁移，验证用户隔离与禁止客户端写入',async()=>{
 const db=new PGlite()
 try{
  await db.exec(`create role anon; create role authenticated; create schema auth; create table auth.users(id uuid primary key); create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$; grant usage on schema public,auth to anon,authenticated; grant execute on function auth.uid() to anon,authenticated;`)
  await db.exec(await readFile('supabase/migrations/001_learning.sql','utf8'))
  await db.exec(await readFile('supabase/migrations/002_learning_activity.sql','utf8'))
  const a='11111111-1111-4111-8111-111111111111',b='22222222-2222-4222-8222-222222222222'
  await db.exec(`insert into auth.users values('${a}'),('${b}'); insert into public.voice_tasks(user_id,title,duration,status) values('${a}','A',1,'completed'),('${b}','B',1,'completed');`)
  await db.exec(`insert into data_sources values('test','test','https://example.com','v1','CC-BY-SA-4.0','test'); insert into lessons(id,upstream_id,source_id,level,category,japanese,meanings_en) values('one','one','test','n1','grammar','例','example'); insert into favorites(user_id,lesson_id) values('${a}','one');insert into learning_history(user_id,lesson_id) values('${a}','one');`)
  assert.equal((await db.query('select * from public.profiles')).rows.length,2)
  await db.exec(`set role authenticated; select set_config('request.jwt.claim.sub','${a}',false);`)
  assert.deepEqual((await db.query('select title from public.voice_tasks')).rows,[{title:'A'}])
  assert.equal((await db.query('select * from public.profiles')).rows.length,1)
  assert.equal((await db.query('select * from public.favorites')).rows.length,1)
  assert.equal((await db.query('select * from public.learning_history')).rows.length,1)
  await assert.rejects(db.exec(`update public.voice_tasks set title='tampered'`),/permission denied/)
  await db.exec(`update public.profiles set display_name='合法修改' where id='${a}';`)
  assert.equal((await db.query(`update public.profiles set display_name='非法修改' where id='${b}' returning id`)).rows.length,0)
  await db.exec(`select set_config('request.jwt.claim.sub','${b}',false)`)
  assert.equal((await db.query('select * from favorites')).rows.length,0)
  assert.equal((await db.query('select * from learning_history')).rows.length,0)
  await assert.rejects(db.exec(`insert into favorites(user_id,lesson_id) values('${a}','one')`),/row-level security/)
  await db.exec(`reset role; set role anon;`)
  assert.equal((await db.query('select * from public.lessons')).rows.length,1)
  await assert.rejects(db.query('select * from public.voice_tasks'),/permission denied/)
 }finally{await db.close()}
})
