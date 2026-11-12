import { spawn } from 'node:child_process'
import { mkdir,open } from 'node:fs/promises'
import { resolve } from 'node:path'
await mkdir('.runtime',{recursive:true})
async function launch(name,args){const out=await open(`.runtime/${name}.out.log`,'a'),err=await open(`.runtime/${name}.err.log`,'a');const child=spawn(process.execPath,args,{cwd:process.cwd(),detached:true,windowsHide:true,stdio:['ignore',out.fd,err.fd]});child.on('error',e=>console.error(`${name} 启动失败：${e.message}`));child.unref();await out.close();await err.close()}
async function json(url){try{const r=await fetch(url,{signal:AbortSignal.timeout(10000)});return r.ok?await r.json():null}catch{return null}}
if(!await json('http://127.0.0.1:11434/api/tags'))await launch('ollama',['scripts/ollama.mjs','serve'])
if(!await json('http://127.0.0.1:3001/api/health'))await launch('api',['server/index.mjs'])
let frontend=false
try{const r=await fetch('http://127.0.0.1:5175/',{signal:AbortSignal.timeout(3000)});if(r.ok){if(!(await r.text()).includes('日语学习'))throw new Error('5175 已被其他网站占用');frontend=true}}catch(e){if(e.message.includes('其他网站'))throw e}
if(!frontend)await launch('vite',['node_modules/vite/bin/vite.js','--host','127.0.0.1','--port','5175','--strictPort'])
for(let i=0;i<30;i++){
 try{const r=await fetch('http://127.0.0.1:5175/',{signal:AbortSignal.timeout(1500)});if(r.ok){console.log('网站：http://127.0.0.1:5175/');console.log('日志目录：'+resolve('.runtime'));break}}catch{}
 if(i===29)throw new Error('前端启动失败，请查看 .runtime/vite.err.log')
 await new Promise(r=>setTimeout(r,1000))
}
const health=await json('http://127.0.0.1:3001/api/health')
if(health)for(const [name,status] of Object.entries(health))console.log(`${name}：${status.ready?'可用':status.message}`)
else console.error('后端尚未就绪，请查看 .runtime/api.err.log')
