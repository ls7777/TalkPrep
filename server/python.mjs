import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
export const python = process.env.PYTHON || (existsSync('.venv/Scripts/python.exe') ? resolve('.venv/Scripts/python.exe') : existsSync('.venv/bin/python') ? resolve('.venv/bin/python') : 'python')
export function runPython(args, onEvent = () => {}, timeout = 3600000) {
 return new Promise((resolvePromise,reject) => {
  const child = spawn(python, ['-u','server/audio.py',...args],{windowsHide:true,env:{...process.env,PYTHONIOENCODING:'utf-8'}})
  let buffer='', result
  const timer=setTimeout(()=>{child.kill(); reject(new Error('语音处理超时，请重试较短录音。'))},timeout)
  child.stdout.on('data',chunk=>{buffer+=chunk.toString();let index;while((index=buffer.indexOf('\n'))>=0){const line=buffer.slice(0,index);buffer=buffer.slice(index+1);try{const event=JSON.parse(line); if(event.type==='result') result=event; else onEvent(event)}catch{}}})
  child.stderr.on('data',()=>{})
  child.once('error',()=>{clearTimeout(timer);reject(new Error('Python 语音环境未就绪，请运行 README 中的安装命令。'))})
  child.once('close',code=>{clearTimeout(timer);code===0&&result?resolvePromise(result):reject(new Error(result?.error || '音频处理失败：请检查文件和本地模型配置。'))})
 })
}
