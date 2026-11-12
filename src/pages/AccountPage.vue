<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { supabase } from '../lib/auth'
import { japaneseError } from '../../shared/errors.mjs'
const route=useRoute(),router=useRouter()
const register=computed(()=>route.path==='/register')
const email=ref(''),password=ref(''),confirm=ref(''),busy=ref(false),error=ref(''),message=ref('')
async function submit(){
 error.value='';message.value=''
 if(!supabase){error.value='アカウントサービスが設定されていません。設定を確認してください。';return}
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())){error.value='有効なメールアドレスを入力してください。';return}
 if(password.value.length<8||password.value.length>128){error.value='パスワードは8文字以上128文字以下で入力してください。';return}
 if(register.value&&password.value!==confirm.value){error.value='確認用パスワードが一致しません。';return}
 busy.value=true
 try{
  const result=register.value?await supabase.auth.signUp({email:email.value.trim(),password:password.value}):await supabase.auth.signInWithPassword({email:email.value.trim(),password:password.value})
  if(result.error)throw result.error
  password.value='';confirm.value=''
  if(result.data.session)await router.replace('/')
  else message.value='確認メールを送信しました。メールアドレスを確認してからログインしてください。'
 }catch(e){error.value=japaneseError(e)}finally{busy.value=false}
}
</script>
<template><div class="account-container"><div class="page-title"><span class="eyebrow">JAPANESE LEARNING</span><h1>{{ register?'注册日语学习账号':'欢迎回来' }}</h1><p>登录后保存你的学习记录和收藏。</p></div><section class="detail-panel">
 <p v-if="!supabase" class="auth-notice">アカウントサービスが設定されていません。</p>
 <form novalidate @submit.prevent="submit"><fieldset :disabled="busy||!supabase"><label>邮箱地址<input v-model="email" type="email" required maxlength="254" autocomplete="email" placeholder="your@email.com" /></label><label>密码<input v-model="password" type="password" required minlength="8" maxlength="128" :autocomplete="register?'new-password':'current-password'" placeholder="至少 8 位" /></label><label v-if="register">确认密码<input v-model="confirm" type="password" required minlength="8" autocomplete="new-password" /></label><button class="button primary" type="submit">{{ busy?'正在提交…':register?'注册':'登录' }}</button></fieldset></form>
 <p v-if="error" role="alert" class="error-text">{{ error }}</p><p v-if="message" role="status">{{ message }}</p>
 <p class="auth-switch">{{ register?'已有账号？':'还没有账号？' }} <RouterLink :to="register?'/login':'/register'">{{ register?'登录':'注册' }}</RouterLink></p>
 </section></div></template>
