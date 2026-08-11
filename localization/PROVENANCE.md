# 汉化来源与许可说明

## 原始英文来源

本项目的英文键来自本机已安装的 n8n 2.34.4 发行包，包括官方 `@n8n/i18n` 英文资源、`n8n-nodes-base` 与 `@n8n/n8n-nodes-langchain` 的可见节点定义。中文由本项目独立翻译并按本机版本校验。

## 社区参考边界

对 [other-blowsnow/n8n-i18n-chinese](https://github.com/other-blowsnow/n8n-i18n-chinese) 的研究仅用于：

- 确认社区对中文界面的需求与构建思路；
- 使用其 JSON key 的存在性作为覆盖范围基准；
- 对比词条数与节点翻译管线。

本项目没有读入、复制或改写该项目的中文译文。该仓库当前未见明确的许可证文件，因此不将其词库当作可重新授权的源素材。

## 生成产物

`scripts/build-localization.mjs` 和 `scripts/install-node-localization.mjs` 生成的文件位于 `node_modules` 及 n8n 本地缓存目录，不是翻译源文件。`scripts/translate-node-localization.mjs` 只以当前安装包中的英文可见文案为输入，通过 stdin 批量生成并严格校验翻译源。重新安装依赖后可通过 `npm run localize` 幂等重建。

当前 n8n 2.34.4 的节点覆盖审计为 27,853/27,853；安装器生成 563 个节点翻译文件、48,962 个原生翻译落点。该口径排除代码、表达式、用户数据、品牌名和应保持原样的纯技术标记，并非对未来版本或任意社区节点的永久覆盖承诺。

## 许可状态

本项目原创安装脚本与中文译文按 MIT License 发布，并在仓库中保留 `LICENSE` 与 `NOTICE`。n8n 本体不包含在本项目中，仍遵循 [n8n LICENSE.md](https://github.com/n8n-io/n8n/blob/master/LICENSE.md)。
