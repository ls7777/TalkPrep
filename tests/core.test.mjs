import { test } from 'node:test'
import assert from 'node:assert/strict'
import { corpus } from '../scripts/corpus.mjs'
import { spawn } from 'node:child_process'
import { mkdir,writeFile,rm,readFile } from 'node:fs/promises'
import { resolve,sep } from 'node:path'
import { runPython } from '../server/python.mjs'
import { chineseFormation } from '../scripts/formation.mjs'
import { japaneseError } from '../shared/errors.mjs'
async function cleanup(relative){const target=resolve(relative),root=resolve('.runtime');if(!target.startsWith(root+sep))throw new Error('测试清理路径超出 .runtime');await rm(target,{recursive:true,force:true})}

test('用户可见错误统一为日语，不泄漏供应商英文错误',()=>{
 assert.equal(japaneseError({code:'invalid_credentials',message:'Invalid login credentials'}),'メールアドレスまたはパスワードが正しくありません。')
 assert.equal(japaneseError({message:'Unknown provider internals'}),'処理に失敗しました。しばらく待ってからもう一度お試しください。')
 assert.match(japaneseError({name:'NotAllowedError'}),/マイク/)
 assert.match(japaneseError('请先登录'),/ログイン/)
 assert.equal(japaneseError('音声を確認してください。'),'音声を確認してください。')
})

test('固定语料结构、关联和可重复 ID',async()=>{
 const a=await corpus(),b=await corpus()
 assert.equal(a.lessons.length,5094);assert.equal(a.examples.length,8631)
 assert.deepEqual(a.lessons.map(l=>l.id),b.lessons.map(l=>l.id))
 const ids=new Set(a.lessons.map(l=>l.id));assert.equal(ids.size,a.lessons.length)
 assert.ok(a.examples.every(e=>ids.has(e.lesson_id)&&e.ja&&e.source_url))
 assert.equal(a.report.invalid.length,0);assert.equal(a.report.missingExamples.length,515)
 assert.ok(a.lessons.filter(l=>l.category==='grammar').every(l=>!/[A-Za-z]/.test(chineseFormation(l.formation))))
 const edits=JSON.parse(await readFile('data/overrides.zh.json','utf8'))
 assert.equal(Object.keys(edits).length,80)
 for(const [id,edit] of Object.entries(edits)){assert.ok(ids.has(id));assert.ok(!/[A-Za-z\u3040-\u30ff]/.test(edit.meaning));if(edit.firstExample){assert.ok(a.examples.some(e=>e.lesson_id===id&&e.position===0));assert.ok(!/[\u3040-\u30ff]/.test(edit.firstExample))}}
})
test('未配置 API 明确报错，语音拒绝匿名请求',async()=>{
 const child=spawn(process.execPath,['server/index.mjs'],{env:{...process.env,PORT:'3199',RUNTIME_DIR:resolve('.runtime/test-api'),SUPABASE_URL:'',SUPABASE_ANON_KEY:'',SUPABASE_SERVICE_ROLE_KEY:''},stdio:'pipe',windowsHide:true})
 let stderr='';child.stderr.on('data',b=>stderr+=b.toString())
 try{
  await new Promise((yes,no)=>{const timeout=setTimeout(()=>no(new Error('API 启动超时')),15000);child.stdout.on('data',()=>{clearTimeout(timeout);yes()});child.once('error',no);child.once('exit',code=>{clearTimeout(timeout);no(new Error('API 提前退出 '+code+' '+stderr))})})
  const request=p=>fetch('http://127.0.0.1:3199/api'+p)
  assert.equal((await request('/lessons?level=n3')).status,400)
  const missing=await request('/lessons?level=n1');assert.equal(missing.status,503);assert.match((await missing.json()).error.message,/設定/)
  assert.equal((await request('/voice')).status,401)
  assert.equal((await request('/voice/not-a-uuid')).status,401)
  const health=await (await request('/health')).json();assert.equal(health.database.ready,false)
 }finally{if(child.exitCode===null&&!child.killed)await new Promise(r=>{const timeout=setTimeout(r,5000);child.once('exit',()=>{clearTimeout(timeout);r()});child.kill()});await cleanup('.runtime/test-api')}
})
function wav(seconds){const rate=8000,size=seconds*rate*2,b=Buffer.alloc(44+size);b.write('RIFF');b.writeUInt32LE(36+size,4);b.write('WAVEfmt ',8);b.writeUInt32LE(16,16);b.writeUInt16LE(1,20);b.writeUInt16LE(1,22);b.writeUInt32LE(rate,24);b.writeUInt32LE(rate*2,28);b.writeUInt16LE(2,32);b.writeUInt16LE(16,34);b.write('data',36);b.writeUInt32LE(size,40);return b}
test('真实音频解码：有效 WAV、损坏文件和超长录音',async()=>{
 await mkdir('.runtime/test-audio',{recursive:true})
 try{
  await writeFile('.runtime/test-audio/short.wav',wav(1));await writeFile('.runtime/test-audio/long.wav',wav(1801));await writeFile('.runtime/test-audio/broken.wav','not audio')
  assert.ok(Math.abs((await runPython(['probe','.runtime/test-audio/short.wav'])).duration-1)<0.001)
  await assert.rejects(runPython(['probe','.runtime/test-audio/long.wav']),/30 分钟/)
  await assert.rejects(runPython(['probe','.runtime/test-audio/broken.wav']))
 }finally{await cleanup('.runtime/test-audio')}
})
