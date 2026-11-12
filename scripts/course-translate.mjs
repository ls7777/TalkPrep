import '../server/config.mjs'
import { python } from '../server/python.mjs'
import { spawn } from 'node:child_process'
const child=spawn(python,['-u','scripts/course-translate.py'],{stdio:'inherit',windowsHide:true,env:{...process.env,PYTHONIOENCODING:'utf-8'}})
child.on('error',()=>{console.error('请安装 Python 环境和 server/requirements.txt。');process.exitCode=1})
child.on('exit',code=>process.exitCode=code||0)
