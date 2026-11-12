"""Fast offline English→Chinese auxiliary course translation using the official Argos OPUS-MT package.
Original Japanese data is never sent through this translator or replaced.
"""
import os, json, sys, zipfile, urllib.request, hashlib
from pathlib import Path
root=Path('.runtime')
root.mkdir(exist_ok=True)
archive=root/'en-zh.argosmodel'
model=root/'translation-models'/'translate-en_zh-1_9'
url='https://argos-net.com/v1/translate-en_zh-1_9.argosmodel'
if not archive.exists():
    print('下载 Argos OPUS-MT 英中离线模型',flush=True)
    urllib.request.urlretrieve(url,archive)
if not model.exists():
    destination=(root/'translation-models').resolve()
    with zipfile.ZipFile(archive) as z:
        for entry in z.namelist():
            if not (destination/entry).resolve().is_relative_to(destination):
                raise ValueError('模型压缩包路径不合法')
        z.extractall(destination)
import ctranslate2, sentencepiece
sp=sentencepiece.SentencePieceProcessor(model_file=str(model/'sentencepiece.model'))
translator=ctranslate2.Translator(str(model/'model'),device='cpu',compute_type='int8',inter_threads=1,intra_threads=6)
cache_path=root/'translations.json'
cache=json.loads(cache_path.read_text(encoding='utf-8')) if cache_path.exists() else {}
# Reject stale LLM responses that merely echo English instead of translating.
cache={id:value for id,value in cache.items() if any('\u4e00' <= c <= '\u9fff' for c in value.get('meaning',''))}
entries=[]
for category, filename in [('grammar','grammar'),('vocabulary','vocab')]:
    for level in ['n1','n2']:
        for row in json.loads(Path(f'data/upstream/{filename}-{level}.json').read_text(encoding='utf-8')):
            entries.append((f"openjlpt-{level}-{category}-{row['id']}",row))
def persist():
    tmp=root/'translations.tmp.json'
    tmp.write_text(json.dumps(cache,ensure_ascii=False),encoding='utf-8')
    os.replace(tmp,cache_path)
todo={}
for id,row in entries:
    if id in cache:
        continue
    fields={'meaning':row.get('meaning') or '; '.join(row.get('meanings',[])), 'notes':row.get('notes','')}
    fields.update({f'example-{i}':e.get('en','') for i,e in enumerate(row.get('examples',[]))})
    cache[id]={'meaning':'','notes':'','examples':['' for _ in row.get('examples',[])]}
    for key,text in fields.items():
        if text.strip():
            todo.setdefault(text,[]).append((id,key))
texts=list(todo)
print(f'需翻译 {len(texts)} 个去重文本；已有 {len(entries)-sum(1 for id,row in entries if not cache[id]["meaning"])} 条缓存',flush=True)
try:
    for offset in range(0,len(texts),48):
        batch=texts[offset:offset+48]
        tokens=[sp.encode(t,out_type=str) for t in batch]
        if any(len(t)>512 for t in tokens):
            raise ValueError('来源文本超过模型上下文限制，需分段')
        results=translator.translate_batch(tokens,beam_size=2,max_batch_size=4096,batch_type='tokens',max_input_length=512,max_decoding_length=512)
        for source,result in zip(batch,results):
            translated=sp.decode(result.hypotheses[0]).replace('▁',' ').strip()
            if not translated:
                raise ValueError('翻译结果为空')
            for id,key in todo[source]:
                if key.startswith('example-'):
                    cache[id]['examples'][int(key[8:])]=translated
                else:
                    cache[id][key]=translated
        if offset%480==0:
            # Only persist complete records so interruption never poisons resumable cache.
            complete={id:value for id,value in cache.items() if value['meaning'] and all(value['examples'])}
            tmp=root/'translations.tmp.json';tmp.write_text(json.dumps(complete,ensure_ascii=False),encoding='utf-8');os.replace(tmp,cache_path)
            print(f'中文翻译 {min(offset+len(batch),len(texts))}/{len(texts)} 个文本，完整课程 {len(complete)}/{len(entries)}',flush=True)
    persist()
except BaseException:
    cache={id:value for id,value in cache.items() if value['meaning'] and all(value['examples'])}
    persist()
    raise
Path('data/reports/translation-model.json').write_text(json.dumps({'name':'Argos OPUS-MT en_zh 1.9','url':url,'sha256':hashlib.sha256(archive.read_bytes()).hexdigest(),'license':'CC-BY-4.0','attribution':'Jörg Tiedemann and Santhosh Thottingal, OPUS-MT (2020)','translated':len(cache)},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(f'完成：{len(cache)} 条中文辅助翻译',flush=True)
