import { supabase } from './auth'
import { japaneseError } from '../../shared/errors.mjs'
export interface Example { id:string; ja:string; en:string; zh?:string; furigana?:string; source_url?:string; position:number }
export interface Course { id:string;level:string;category:string;japanese:string;reading:string;meanings_en:string;meaning_zh?:string;formation:string;notes_en:string;notes_zh?:string;pos:string[];other_forms:string[];translation_machine:boolean;examples?:Example[];data_sources?:{name:string;url:string;license:string;version:string;attribution:string} }
export interface VoiceTask {id:string;title:string;status:'queued'|'transcribing'|'translating'|'completed'|'failed';progress:number;duration:number;original_text:string;japanese_text:string;error?:string;created_at:string;segments:{start:number;end:number;text:string}[]}
export async function api<T>(path:string,options:RequestInit={}):Promise<T>{
 try{
 const headers=new Headers(options.headers)
 const {data}=supabase?await supabase.auth.getSession():{data:{session:null}}
 if(data.session)headers.set('Authorization',`Bearer ${data.session.access_token}`)
 if(options.body&&!(options.body instanceof FormData))headers.set('Content-Type','application/json')
 const response=await fetch(`/api${path}`,{...options,headers})
 if(!response.ok){let message='サーバーに接続できません。';try{const body=await response.json();message=japaneseError(body.error)}catch{}throw new Error(message)}
 return response.status===204?undefined as T:response.json()
 }catch(error){throw new Error(japaneseError(error))}
}
