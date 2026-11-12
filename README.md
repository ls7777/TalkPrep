# 日语学习

Vue 3 + TypeScript + Vite，Node.js / Express API，Supabase PostgreSQL / Auth，faster-whisper + Ollama 本地语音处理。
需要 Node.js 22+、Python 3.12；不调用付费转写/翻译 API。

## 1. 配置免费数据库

1. 在 https://supabase.com/dashboard 创建免费项目，建议 Tokyo 区域。
2. 在项目 **SQL Editor** 按顺序执行 `supabase/migrations/001_learning.sql` 与 `002_learning_activity.sql`（各只执行一次）。它们建立课程、例句、来源、导入批次、用户资料、语音任务、最近学习和收藏表及 RLS。已执行第一份的项目只需补执行第二份。
3. 在 **Authentication → Providers → Email** 启用邮箱密码登录，测试阶段关闭 Confirm email。密码最低长度设置为 8。面向公众开放前开启邮箱验证并配置自定义 SMTP；本版不实现找回密码邮件。
4. 将 `.env.example` 复制为 `.env`，在本机填写：

| 变量 | 值 |
|---|---|
| `SUPABASE_URL`、`VITE_SUPABASE_URL` | 项目 URL |
| `SUPABASE_ANON_KEY`、`VITE_SUPABASE_ANON_KEY` | 相同的 Publishable key 或旧版 anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Secret key 或旧版 service_role key，**仅后端使用** |

不要给 service_role/Secret key 添加 `VITE_` 前缀，不要提交 `.env`，不要在聊天发送密钥。更改前端环境配置后需重启 Vite。
密码由 Supabase Auth 保存和验证，profiles 表不存密码。课程匿名可读，个人资料和语音文本按用户隔离；语音写操作仅允许通过 Node API。

免费档目前有 500 MB 数据库，闲置一周可能暂停，详见 https://supabase.com/pricing 。本项目仅支持**一台电脑的一个后端实例**，模型计算及原始录音都在该电脑上。

## 2. 安装与启动

```powershell
npm install
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r server/requirements.txt
npm run audio:setup
```

若系统 `python` 是商店占位符，请安装 Python 3.12 或用可用的 Python 3.12 完整路径创建虚拟环境。后端会自动使用项目 `.venv`，也可在 `.env` 设置 `PYTHON` 完整路径。

从 https://ollama.com/download/windows 安装 Ollama，保持服务运行，然后：

```powershell
ollama pull qwen3:4b-instruct-2507-q4_K_M
```

如果已下载项目便携版，可用 `npm run models:serve` 启动（仅监听 127.0.0.1:11434，模型保存在 `.runtime`），另一个终端运行 `npm run models:pull`。

模型下载需要数 GB 空间。默认 Whisper medium / CPU int8。`WHISPER_DEVICE=cuda` 和 `WHISPER_COMPUTE_TYPE=float16` 仅在 CUDA/cuDNN 与 CTranslate2 兼容并验证后使用。识别 Python 进程退出后才启动翻译推理；Ollama 翻译后卸载模型，避免同时占用内存。不承诺实时速度。

分别在两个终端运行：

```powershell
npm run server
npm run dev
```

打开 Vite 显示的地址。`/api` 由 Vite 转发到 127.0.0.1:3001；后端只监听回环地址。健康状态：`http://127.0.0.1:3001/api/health`。缺少配置时显示真实错误，不用示例数据冒充数据库内容。
`.runtime/server.lock` 防止多个本地队列；异常退出后会检测已结束的进程并恢复。若 PID 被重用，请确认后端未运行再删除锁文件。

## 3. 导入真实课程

上游固定版本与许可见 `data/README.md`。已随项目保存 N1/N2 原始数据，缺失例句不会自动编造。

```powershell
npm run data:check
npm run data:import
npm run data:translate
```

`data:check` 只校验并生成报告；`data:import` 将原始内容及已缓存的中文写入 Supabase；`data:translate` 使用官方 Argos OPUS-MT 英中离线模型批量翻译并导入；`data:refine` 使用固定 Qwen3 Instruct 校对全部语法、抽样及检测到异常的内容。均支持缓存续跑，全部 5,094 条可能耗时较长。中文默认展示，英文来源折叠保留；接续术语使用中文。
中文释义和例句翻译标记为机器翻译，英文原文保留。报告是 `data/reports/import-report.json`，20 条/等级/类别的抽样是 `data/reports/review-sample.json`。`reviewed_by: Codex` 表示助手抽查，reviewed_fields 指明核对范围，不代表人工全面审核。修正存放在 `data/overrides.zh.json` 与 `data/repairs.zh.json`，导入时优先应用。`npm run data:repair` 重新处理照抄日语、乱码和异常重复的字段。
导入按稳定 ID upsert，重复运行不增加重复行；新增数据库写入命令只能在本机通过管理密钥执行，无公开课程写入 API。首版没有网页管理后台。

数据库准备好后运行 `npm run test:database`，会创建两个临时测试用户，验证登录恢复、幂等写入和 RLS 隔离，随后删除测试用户及其任务。

## 4. 语音备忘录

登录后进入“语音备忘录”，上传 M4A / MP3 / WAV / WebM 或允许麦克风录音。最多 30 分钟、100 MB；服务器实际解码验证时长，不信任扩展名和容器时长。网页录音需浏览器支持 WebM MediaRecorder；不支持时仍可上传文件。

任务顺序为排队 → 识别 → 日语转换 → 完成。保存时间戳、原始转写和日语结果；可编辑已完成结果、复制、导出 TXT、重试失败任务及删除已结束任务。首页列出最近 100 条。
不自动区分说话人。日中混合识别与翻译仍会出错，尤其专名、口音和重叠对话；原始转写用于人工核对。中文转换不是摘要。

原音频保存在操作系统临时目录 `japanese-learning/<项目标识>/audio`，不放在可能被 OneDrive 同步的项目目录，也不上传 Supabase；成功后删除，失败后最多保留 24 小时（后端运行时清理，停机后下次启动清理）。即使原录音已清理，已识别任务仍可重试翻译；未识别任务需重新上传。删除数据库记录会同时删除本机对应音频。系统自行清理临时目录后，未完成任务可能需要重新上传。
电脑关机时不处理任务，重新启动后恢复。数据库/模型未就绪时健康状态会明确提示。不要把本地 API 直接公开到互联网。

## 接口与验证

- `GET /api/lessons?level=n1&category=grammar&page=1&search=...`：每页 24 条。
- `GET /api/lessons/:id`：课程、例句与来源。
- `GET /api/daily?date=YYYY-MM-DD`：按浏览器本地日期稳定选择每日课程。
- `GET/POST /api/voice`、`GET/PATCH/DELETE /api/voice/:id`、`POST /api/voice/:id/retry`：Bearer 用户会话验证及归属检查，上传字段为 `audio`。
- `GET /api/health`：分别返回数据库、识别、翻译的就绪状态。
- `GET /api/learning/recent`、`GET /api/learning/favorites`：按单词/语法筛选和分页读取个人记录。`POST /api/learning/history/:id` 保存最近浏览；`GET/PUT/DELETE /api/learning/favorites/:id` 查询、收藏和取消收藏。所有操作校验用户身份并由 RLS 隔离。

登录成功后统一进入学习首页。登录用户查看 N1/N2 课程详情时保存最近学习记录，详情页可收藏和取消收藏；“我的学习”仅展示这两类内容，不嵌入语音入口。错误提示统一为日语，包括 Supabase 登录错误、网络错误和语音处理错误，未知内部错误不直接显示给用户。

```powershell
npm test
npm run build
npm run test:database
npm run test:voice
npm run test:learning
```

`npm test` 包含语料校验、未配置 API 错误与匿名拒绝、实际 WAV 解码、损坏音频和超长限制。真实账号隔离测试需先配置数据库。完整转写验收还需实际日语、日中混合和静音样本；模型未准备好时不能算通过。

`test:voice` 使用 Windows 内置日语和中文声音生成无隐私的合成录音，验证完整上传、识别、转换、静音失败、编辑及删除。报告位于 data/reports/voice-qa.json；合成样本不能代表真实口音和嘈杂场景的识别准确率。

配置完成后可运行 `npm start` 或双击根目录“启动网站.cmd”，以隐藏后台进程启动本机服务并检查就绪状态。更改 .env 后需重启已运行的后端；Vite 会自动检测环境文件变化。

课程辅助翻译使用 Argos 打包的 OPUS-MT en_zh 1.9（Jörg Tiedemann、Santhosh Thottingal，CC BY 4.0），以及 Qwen3-4B-Instruct-2507（Apache 2.0）；版本和模型哈希见 data/reports/translation-model.json。数据衍生文件继续按 CC BY-SA 4.0 发布。

## 备份与更新

免费档不依赖托管自动备份。安装 PostgreSQL 客户端后，在本机设置 `PGHOST`、`PGPORT`、`PGUSER`、`PGDATABASE`、`PGPASSWORD`（从 Supabase Connect 获取连接参数，密码不写入仓库），使用 `pg_dump --format=custom --file=backup.dump` 导出；用 `pg_restore` 恢复到空的兼容数据库。备份包含私人文本，存放在仓库之外，不提交。托管 Auth 的完整迁移还应遵循 Supabase 官方备份/恢复文档。

升级语料时先固定新的提交，校验字段、许可及数量，审阅抽样再导入。本版原始数据及中文衍生数据按 CC BY-SA 4.0 发布并保留来源；课程等级来自社区，不代表官方考纲。商务课程仍为示例，阅读、听力题库与掌握度统计尚未实现。
