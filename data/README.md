# 课程数据

`upstream/` 是 OpenJLPT 固定提交 `0d1d3410bec90bd4098a7c72de820543cb4f707c` 的 N1/N2 原始数据。
上游：https://github.com/evanclan/OpenJLPT 。来源和许可见 upstream/NOTICE.md、upstream/LICENSE。
原始数据与本项目翻译等衍生数据均按 CC BY-SA 4.0 发布；不改变应用代码许可。

等级为社区整理，不是官方完整考纲。语法例句包含上游项目创作内容；词汇例句多数来自 Tatoeba，不代表考试真题。
校验与导入：`npm run data:check`、`npm run data:import`。
生成中文辅助翻译并导入：`npm run data:translate`（Argos OPUS-MT 英中模型）；`npm run data:refine` 使用固定 Qwen3 Instruct 校对语法及异常项。翻译缓存位于忽略提交的 `.runtime/translations.json`，可中断续跑。语法接续使用中文术语，来源英文仅作折叠参考。
reports/review-sample.json 每组抽样 20 条。`reviewed_by: Codex` 表示助手抽查，reviewed_fields 列出范围，不代表人工全面审核。data/overrides.zh.json 保存抽样的中文释义、首条例句和部分用法修正，导入时优先于模型缓存；未凭空添加缺失例句。
