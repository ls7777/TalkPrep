import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'
import { resolve, join } from 'node:path'
import { tmpdir } from 'node:os'
import { createHash } from 'node:crypto'
export const runtime = resolve(process.env.RUNTIME_DIR || '.runtime')
// The checkout is inside OneDrive on this computer. Keep private source audio
// in the OS temp directory rather than in a potentially synchronized checkout.
export const audioSpool = join(tmpdir(),'japanese-learning',createHash('sha256').update(runtime).digest('hex').slice(0,16),'audio')
export const ollamaUrl = process.env.OLLAMA_URL || 'http://127.0.0.1:11434'
export const ollamaModel = process.env.OLLAMA_MODEL || 'qwen3:4b-instruct-2507-q4_K_M'
export function database(token, publicOnly = false) {
 const url = process.env.SUPABASE_URL
 const key = token || publicOnly ? process.env.SUPABASE_ANON_KEY : process.env.SUPABASE_SERVICE_ROLE_KEY
 if (!url || !key) throw Object.assign(new Error('尚未配置 Supabase。请按 README 创建项目并填写 .env。'), { status: 503 })
 return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false }, ...(token ? {global:{headers:{Authorization:`Bearer ${token}`}}} : {}) })
}
export function checked(result) { if (result.error) throw Object.assign(new Error('データベース操作に失敗しました。設定を確認してください。'),{status:503,code:result.error.code}); return result.data }
export async function translate(messages, format) {
 // Pin the non-thinking Instruct checkpoint: the mutable qwen3:4b alias may select a thinking-only model.
 const response = await fetch(`${ollamaUrl}/api/chat`, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({model:ollamaModel,messages,stream:false,format,keep_alive:'5m',options:{temperature:0,num_predict:4096}}), signal:AbortSignal.timeout(300000)})
 if (!response.ok) throw new Error(`本地翻译服务不可用，请启动 Ollama 并下载 ${ollamaModel}。`)
 const body = await response.json()
 if (!body.message?.content?.trim()||body.done_reason==='length') throw new Error('翻译结果为空或长度超限，请分段重试')
 const text=body.message.content.replace(/^[\s\S]*<\/think>\s*/,'').trim()
 if(text.includes('<think>')||!text)throw new Error('翻译输出不完整，请重试')
 return text
}
export async function unloadTranslation(){try{await fetch(`${ollamaUrl}/api/generate`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model:ollamaModel,keep_alive:0}),signal:AbortSignal.timeout(10000)})}catch{}}
