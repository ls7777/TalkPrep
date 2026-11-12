import '../server/config.mjs'
import { runPython } from '../server/python.mjs'
console.log('下载 Whisper 模型到 .runtime/models；首次运行需要网络和数 GB 磁盘空间。')
console.log(await runPython(['setup'],()=>{},3600000))
