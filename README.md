# n8n 简体中文汉化包

适用于自托管 n8n 的简体中文界面扩展（n8n Chinese localization / zh-CN）。项目只提供汉化文件和安装工具，不包含或重新分发 n8n。

汉化仅作用于界面显示，不修改工作流、凭据、数据库、接口数据或用户输入。

## 特点

- 在已有 n8n 上安装，不替换整套编辑器构建产物。
- 安装过程受清单管理，支持安全卸载。
- 主界面与节点参数分别使用前端覆盖层和 n8n 原生翻译机制。
- 版本不完全匹配时保留无法识别的英文，不阻止安装或启动。
- 安装脚本在 macOS、Windows 和 Linux 上持续验证。

适合已经部署 n8n、希望单独安装中文界面并保留卸载能力的用户。如果需要包含 n8n 本体的中文 Docker 镜像，应选择镜像发行方案。

## 兼容性

- 支持 macOS、Windows 和 Linux。
- 支持 npm 局部安装或全局安装的 n8n。
- 以 n8n 2.33.7 为完整适配基线。
- 其他版本按英文原文精确匹配；无法匹配的内容保留英文，不影响 n8n 运行。
- 不支持 n8n Cloud。
- Docker 部署需要在镜像构建阶段执行安装器。

## 安装

要求：本机已安装并能正常运行 n8n，Node.js 版本不低于 18。

```bash
npx --yes --package git+https://github.com/Melaszzzz/n8n-chinese-localization.git n8n-zh-cn
```

安装器会自动查找 n8n。也可以指定 n8n 项目、`node_modules` 或包目录：

```bash
npx --yes --package git+https://github.com/Melaszzzz/n8n-chinese-localization.git n8n-zh-cn --target /path/to/n8n/project
```

Windows PowerShell 示例：

```powershell
npx --yes --package git+https://github.com/Melaszzzz/n8n-chinese-localization.git n8n-zh-cn --target "C:\path\to\n8n\project"
```

安装完成后重启 n8n，并强制刷新浏览器页面。

## 卸载

```bash
npx --yes --package git+https://github.com/Melaszzzz/n8n-chinese-localization.git n8n-zh-cn --uninstall
```

卸载器只恢复本项目管理的文件。用户自行修改的文件不会被覆盖或删除。

## 使用下载包

macOS / Linux：

```bash
bash install.sh
```

Windows PowerShell：

```powershell
powershell -ExecutionPolicy Bypass -File .\install.ps1
```

卸载时运行对应的 `uninstall.sh` 或 `uninstall.ps1`。

## 翻译原则

- 优先使用 n8n 原生节点翻译机制，主界面缺失部分由前端覆盖层补充。
- AI、API、HTTP、JSON、MCP、Webhook 等通用技术术语保留原文。
- 容易歧义或涉及风险的术语采用“中文（English）”。
- 不翻译代码、表达式、用户数据、字段值、错误原文、工作流名称、凭据名称和密钥内容。
- 只做精确匹配，不使用模糊替换。

## 开发

```bash
npm test
npm pack --dry-run
```

GitHub Actions 在 macOS、Windows 和 Linux 上检查词典、安装脚本及 npm 包内容。来源与授权说明见 [localization/PROVENANCE.md](localization/PROVENANCE.md)。

## 许可

安装脚本与中文译文采用 [MIT License](LICENSE)。n8n 本体不包含在本项目中，其许可证以 [n8n 官方仓库](https://github.com/n8n-io/n8n/blob/master/LICENSE.md) 为准。其他说明见 [NOTICE](NOTICE)。
