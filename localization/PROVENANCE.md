# 翻译来源与许可说明

## 原始英文来源

本项目的英文键来自 npm 发布的 n8n 2.34.6 依赖包，包括 `n8n-editor-ui` 2.34.5 中的官方英文资源，以及 `n8n-nodes-base` 2.34.4 与 `@n8n/n8n-nodes-langchain` 2.34.4 的可见节点定义。当前基线包含 34,041 个唯一英文键。

## 各语言生成方式

- `zh-CN`：由本项目独立翻译，并在真实 n8n 界面中持续复核。
- `zh-TW`：以现有简体词库作候选种子，再逐键参照英文源校正台湾软件术语、歧义和地区用法；当前仍为等待台湾熟练使用者界面审校的预览版。
- `es`：直接以英文键为输入。高频界面使用本机 Codex CLI 分批生成，节点长尾使用离线 `Helsinki-NLP/opus-mt-en-es` 生成，再执行术语统一及代码、JSON、URL、占位符等安全复核；当前仍为等待西语熟练使用者界面审校的预览版。

自动化生成只用于候选文本，不等同于母语质量证明。每种语言的具体审计结果记录在对应语言目录中。

## 社区参考边界

对 [other-blowsnow/n8n-i18n-chinese](https://github.com/other-blowsnow/n8n-i18n-chinese) 的研究仅用于：

- 确认社区对中文界面的需求与构建思路；
- 使用其 JSON key 的存在性作为覆盖范围基准；
- 对比词条数与节点翻译管线。

本项目没有读入、复制或改写该项目的中文译文。该仓库当前未见明确的许可证文件，因此不将其词库当作可重新授权的源素材。

## 生成产物

`scripts/build-localization.mjs` 和 `scripts/install-node-localization.mjs` 生成的文件位于 `node_modules` 及 n8n 本地缓存目录，不是翻译源文件。`scripts/translate-node-localization.mjs` 只以当前安装包中的英文可见文案为输入，通过 stdin 批量生成并严格校验翻译源。重新安装依赖后可通过 `npm run localize` 幂等重建。

当前三个语言包均保留同一组 34,041 个英文键；不应翻译的代码、表达式、用户数据、品牌名和纯技术标记会保持原样。安装到其他 n8n 版本时只处理仍能精确匹配的内容，未匹配文案保留英文，不对未来版本或任意社区节点作永久覆盖承诺。

## 许可状态

本项目原创安装脚本与翻译词库从 `v0.4.0` 起按 PolyForm Strict License 1.0.0 提供；此前至 `v0.3.3` 的发布版本仍适用其发布时的 MIT License。仓库保留 `LICENSE`、`LICENSING.md` 与 `NOTICE`。n8n 本体不包含在本项目中，仍遵循 [n8n LICENSE.md](https://github.com/n8n-io/n8n/blob/master/LICENSE.md)。
