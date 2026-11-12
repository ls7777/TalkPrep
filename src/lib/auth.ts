import { createClient, type Session } from '@supabase/supabase-js'
import { ref } from 'vue'
const url=import.meta.env.VITE_SUPABASE_URL,key=import.meta.env.VITE_SUPABASE_ANON_KEY
export const supabase=url&&key?createClient(url,key):null
export const session=ref<Session|null>(null)
export const authReady=(async()=>{if(supabase){const {data}=await supabase.auth.getSession();session.value=data.session}})()
supabase?.auth.onAuthStateChange((_event,value)=>{session.value=value})
