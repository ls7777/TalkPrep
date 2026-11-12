import { mkdir,writeFile } from 'node:fs/promises'
import { spawnSync } from 'node:child_process'
import { resolve } from 'node:path'
await mkdir('.runtime/qa',{recursive:true})
if(process.platform!=='win32')throw new Error('此合成样本生成器使用 Windows 内置日语/中文语音。其他平台请提供 .runtime/qa/japanese.wav 和 mixed.wav。')
const path=resolve('.runtime/qa').replaceAll("'","''")
const script=`$ProgressPreference='SilentlyContinue'
Add-Type -AssemblyName System.Speech
$s=New-Object System.Speech.Synthesis.SpeechSynthesizer
try {
 $s.SetOutputToWaveFile('${path}/japanese.wav')
 $s.SelectVoice('Microsoft Haruka Desktop')
 $s.Speak('明日の会議は十時からです。資料を三部用意してください。ありがとうございます。')
 $s.SetOutputToNull()
 $s.SetOutputToWaveFile('${path}/mixed.wav')
 $s.SelectVoice('Microsoft Haruka Desktop');$s.Speak('明日の会議は十時からです。')
 $s.SelectVoice('Microsoft Huihui Desktop');$s.Speak('请帮我准备三份资料。')
 $s.SelectVoice('Microsoft Haruka Desktop');$s.Speak('ありがとうございます。')
 $s.SetOutputToNull()
} finally { $s.Dispose() }`
const r=spawnSync('powershell.exe',['-NoProfile','-NonInteractive','-EncodedCommand',Buffer.from(script,'utf16le').toString('base64')],{stdio:'inherit',windowsHide:true})
if(r.status!==0)throw new Error('请安装 Windows 内置日语和中文语音，或自行提供无隐私的测试音频。')
const b=Buffer.alloc(32044);b.write('RIFF');b.writeUInt32LE(32036,4);b.write('WAVEfmt ',8);b.writeUInt32LE(16,16);b.writeUInt16LE(1,20);b.writeUInt16LE(1,22);b.writeUInt32LE(16000,24);b.writeUInt32LE(32000,28);b.writeUInt16LE(2,32);b.writeUInt16LE(16,34);b.write('data',36);b.writeUInt32LE(32000,40)
await writeFile('.runtime/qa/silence.wav',b)
console.log('无隐私的合成验收音频已生成。')
