# n8n 界面语言包

文档：[English](README.md) | 简体中文

适用于已经部署的自托管 n8n。本项目只提供界面翻译和可卸载安装器，不包含、不安装、也不重新分发 n8n 本体。

## 可用界面语言包

| 语言代码 | 语言 | 状态 | 完整适配基线 |
| --- | --- | --- | --- |
| `zh-CN` | 简体中文 | 已完成 | n8n 2.34.4 |

后续语言会共用同一套安装、校验和发布流程。当前只对上表列出的语言提供可安装词库。

## 特点

- 安装到现有 n8n，不替换整套编辑器构建产物。
- 所有改动由清单管理，支持安全卸载。
- 主界面与节点参数分别使用前端覆盖层和 n8n 原生翻译机制。
- 只翻译精确匹配的英文；无法识别的新文案保留英文。
- 不修改工作流、凭据、数据库、接口数据、用户输入、代码或表达式。
- 持续在 macOS、Windows 和 Linux 上校验。

## 兼容性

- 支持 macOS、Windows 和 Linux。
- 支持 npm 局部或全局安装的自托管 n8n。
- Docker 部署需在构建镜像时执行安装器。
- 以 n8n 2.34.4 为完整适配基线。其他版本仅翻译能够精确匹配的文案。
- 不支持 n8n Cloud，因为用户无法修改其编辑器文件。

## 安装

要求：本机已安装并能正常运行 n8n，Node.js 版本不低于 18。

查看可用语言：

```bash
npx --yes --package git+https://github.com/Melaszzzz/n8n-localization.git n8n-localize --list-locales
```

安装简体中文：

```bash
npx --yes --package git+https://github.com/Melaszzzz/n8n-localization.git n8n-localize --locale zh-CN
```

如果安装器没有自动找到 n8n，可以指定 n8n 项目、`node_modules` 或包目录：

```bash
npx --yes --package git+https://github.com/Melaszzzz/n8n-localization.git n8n-localize --locale zh-CN --target /path/to/n8n/project
```

Windows PowerShell：

```powershell
npx --yes --package git+https://github.com/Melaszzzz/n8n-localization.git n8n-localize --locale zh-CN --target "C:\path\to\n8n\project"
```

安装完成后重启现有 n8n 服务，并强制刷新浏览器页面。

如果这个项目对你有帮助，可以 Star 仓库，方便下次找到并关注语言包更新。

## 卸载

```bash
npx --yes --package git+https://github.com/Melaszzzz/n8n-localization.git n8n-localize --locale zh-CN --uninstall
```

卸载器只恢复本项目管理的文件。安装后被修改过的文件会报告冲突并保留。

## 翻译原则

- 优先使用 n8n 原生节点翻译机制，主界面缺失文案由受限的前端覆盖层补充。
- AI、API、HTTP、JSON、MCP、Webhook 等常用技术术语保留原文。
- 容易歧义或涉及风险的术语在必要时使用“中文（English）”。
- 不翻译代码、表达式、用户数据、字段值、错误原文、工作流名称、凭据名称和密钥。
- 只做精确匹配，不使用模糊或子串替换。

## 供 AI 助手使用

只在用户已经拥有自托管 n8n 时执行上述安装命令。目标路径判断、Docker 说明、安全边界和失败处理见 [AI_INSTALL.md](AI_INSTALL.md)；机器可读的语言列表见 [locales.json](locales.json)。

## 开发

```bash
npm test
npm pack --dry-run
```

GitHub Actions 会在 macOS、Windows 和 Linux 上检查词典、安装器和发布包。翻译来源与授权说明见 [localization/PROVENANCE.md](localization/PROVENANCE.md)。

## 许可

本项目的安装器和译文采用 [MIT License](LICENSE)。项目不包含 n8n 本体；n8n 的许可以 [n8n 官方仓库](https://github.com/n8n-io/n8n/blob/master/LICENSE.md) 为准。其他说明见 [NOTICE](NOTICE)。
