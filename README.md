# 言葉 Kotoba · 日语学习空间

第一阶段：中文界面、日语示例内容、响应式页面框架。Vue 3 + TypeScript + Vue Router + Vite，附 Node.js 原生 HTTP 接口脚手架。

## 运行

需要 Node.js 22 或更高版本。

```sh
npm install
npm run dev
```

打开终端显示的本地地址。生产构建：`npm run build`；本地查看构建：`npm run preview`。

可另开终端运行 `npm run server`，健康检查为 `http://127.0.0.1:3001/api/health`。开发服务器将 `/api` 转发到该服务。目前页面读取本地数据，无需启动后端即可浏览。

## 文件和扩展方式

- `src/styles/tokens.css`：全站颜色、字体、圆角、侧栏宽度。改版优先修改这里。
- `src/styles/main.css`：公共布局、页面样式及响应式规则。
- `src/App.vue`：公共侧边栏、顶部导航、页脚和手机菜单。
- `src/components/`：等级卡片、章节标题、空状态等公共组件。
- `src/data/courses.ts`：等级、分类和 Lesson 类型；在 lessons 数组追加对象即可添加示例课程。id 须唯一，level 使用 n5/n4/n3/n2/n1/business，category 对应分类 id。
- `src/data/daily.ts`：每日单词内容池与日期抽取函数。首页每日语法从 courses.ts 的语法条目抽取；单词从 dailyWords 抽取。以浏览器本地日期为准，同一天保持一致，跨日自动更新。
- `src/components/DailyStudy.vue` 与 `src/styles/daily.css`：首页紧凑的每日语法和单词板块。
- `src/pages/StudyPage.vue`：等级学习和商务日语复用的列表模板，支持分类筛选、站内板块搜索。
- `src/pages/LessonPage.vue`：表达、例句、翻译、讲解、音频及练习的详情布局。
- `src/pages/AccountPage.vue`：个人中心、登录与注册布局。
- `src/router.ts`：页面路由；使用 history 模式，正式托管时需配置未知前端路径回退到 index.html，同时保留 /api 的独立路由。
- `server/index.mjs`：Node.js 接口入口，后续可拆分路由和服务、接入数据库。

## 当前边界

课程仅有每等级一条语法示例及一条商务敬语示例，其余分类显示空状态。没有虚构课程数量和学习进度。账号表单明确禁用；收藏、学习记录、音频、题库及后台管理尚未实现。本阶段不收集用户账号或密码。

后续建议：先确定课程字段和内容编辑流程，再逐步实现数据库、内容管理、账号认证及学习进度。不要将数据库密码或服务密钥写入前端。
