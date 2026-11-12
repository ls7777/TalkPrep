import { corpus } from './corpus.mjs'
import { translate } from '../server/config.mjs'
import { readFile,writeFile,rename } from 'node:fs/promises'
const {lessons,examples}=await corpus()
const cache=JSON.parse(await readFile('.runtime/translations.json','utf8'))
const overrides=JSON.parse(await readFile('data/overrides.zh.json','utf8'))
const bad=t=>!t?.trim()||/[\u3040-\u30ff]/.test(t)||/(.)\1{5,}|(.{2,6})\2{4,}|QQ|⁇|▁/.test(t)
let repaired=0,failures=[]
for(const l of lessons){
 const t=cache[l.id];if(!t)continue
 const list=examples.filter(e=>e.lesson_id===l.id)
 const fields=[]
 if(!overrides[l.id]?.meaning&&(bad(t.meaning)||/[A-Za-z]/.test(t.meaning)))fields.push({key:'meaning',input:`日语词条：${l.japanese}\n英文释义：${l.meanings_en}`})
 for(let i=0;i<list.length;i++)if(!(i===0&&overrides[l.id]?.firstExample)&&(bad(t.examples[i])||t.examples[i]===list[i].ja))fields.push({key:i,input:`日语原句：${list[i].ja}\n英文参考：${list[i].en}`})
 for(const field of fields){
  try{
   const text=(await translate([{role:'system',content:'请将输入翻译成准确自然的简体中文。日语原文和英文是互相对应的参考材料，只需输出一份中文译文。不要抄写日语或英文，不要解释，不要加引号，不要保留日语假名。'},{role:'user',content:field.input}])).trim()
   if(bad(text)||!/[\u4e00-\u9fff]/.test(text))throw new Error('中文校验未通过')
   if(field.key==='meaning')t.meaning=text;else t.examples[field.key]=text
   repaired++
   if(repaired%25===0){await writeFile('.runtime/repair-translations.tmp.json',JSON.stringify(cache));await rename('.runtime/repair-translations.tmp.json','.runtime/translations.json');console.log(`已修正 ${repaired} 个异常翻译字段`)}
  }catch(e){failures.push({id:l.id,field:field.key,error:e.message});if(field.key==='meaning')t.meaning='中文释义待核对';else t.examples[field.key]='中文翻译待核对'}
 }
}
await writeFile('.runtime/repair-translations.tmp.json',JSON.stringify(cache));await rename('.runtime/repair-translations.tmp.json','.runtime/translations.json')
await writeFile('data/reports/translation-repair.json',JSON.stringify({repaired,failures},null,2)+'\n')
console.log(`异常翻译修正完成 ${repaired} 个字段，仍待核对 ${failures.length} 个`)
