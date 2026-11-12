import 'dotenv/config'
import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
const executable=existsSync('.runtime/ollama/ollama.exe')?resolve('.runtime/ollama/ollama.exe'):'ollama'
const serve=process.argv.includes('serve')
const child=spawn(executable,serve?['serve']:['pull',process.env.OLLAMA_MODEL||'qwen3:4b-instruct-2507-q4_K_M'],{stdio:'inherit',windowsHide:true,env:{...process.env,OLLAMA_HOST:'127.0.0.1:11434',OLLAMA_MODELS:resolve('.runtime/ollama-models'),OLLAMA_NO_CLOUD:'1'}})
child.on('error',()=>{console.error('请先安装 Ollama，或下载便携版到 .runtime/ollama。');process.exitCode=1})
child.on('exit',code=>process.exitCode=code||0)
