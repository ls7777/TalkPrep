import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { createHash } from 'node:crypto'
export const revision='0d1d3410bec90bd4098a7c72de820543cb4f707c'
export const source={id:'openjlpt',name:'OpenJLPT',url:'https://github.com/evanclan/OpenJLPT',version:revision,license:'CC-BY-SA-4.0',attribution:'OpenJLPT; JMdict (EDRDG); Jonathan Waller; Tatoeba. Derived data: CC BY-SA 4.0.'}
export async function corpus(){
 const lessons=[],examples=[],report={version:revision,groups:{},missingExamples:[],invalid:[],translationFailures:[]},hashes={}
 for(const category of ['grammar','vocabulary'])for(const level of ['n1','n2']){
  const filename=`data/upstream/${category==='grammar'?'grammar':'vocab'}-${level}.json`,raw=await readFile(filename,'utf8');hashes[filename]=createHash('sha256').update(raw).digest('hex')
  const rows=JSON.parse(raw);let valid=0
  for(const row of rows){
   const japanese=row.pattern||row.word,meaning=row.meaning||row.meanings?.join('; ')
   if(!row.id||!japanese||!meaning||row.level?.toLowerCase()!==level){report.invalid.push({level,category,id:row.id});continue}
   const id=`openjlpt-${level}-${category}-${row.id}`
   lessons.push({id,upstream_id:row.id,source_id:source.id,level,category,japanese,reading:row.reading||'',meanings_en:meaning,meaning_zh:null,notes_zh:null,translation_machine:false,formation:row.formation||'',notes_en:row.notes||'',pos:row.pos||[],other_forms:row.other_forms||[]})
   let count=0
   for(const [position,e] of (row.examples||[]).entries()){
    if(!e.ja?.trim()){report.invalid.push({id,example:position});continue}
    examples.push({id:`${id}-${position}`,lesson_id:id,position,ja:e.ja,en:e.en||'',zh:null,furigana:e.furigana||null,source_url:e.tatoeba_id?`https://tatoeba.org/en/sentences/show/${e.tatoeba_id}`:`${source.url}/blob/${revision}/data/json/grammar/${level}.json`});count++
   }
   if(!count)report.missingExamples.push(id)
   valid++
  }report.groups[`${level}-${category}`]={total:rows.length,valid}
 }
 if(new Set(lessons.map(l=>l.id)).size!==lessons.length)throw new Error('重复课程 ID')
 return {lessons,examples,report,hashes}
}
export async function writeReport(data){await mkdir('data/reports',{recursive:true});await writeFile('data/reports/import-report.json',JSON.stringify(data,null,2)+'\n')}
