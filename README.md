# n8n 简体中文汉化包

面向已有自托管 n8n 的第三方简体中文汉化包。它不是 n8n 本体，不会下载、托管或重新发布 n8n，也不会创建另一套 n8n。

汉化只改变显示层，不修改工作流 JSON、接口数据、字段名、输入值、凭据或数据库。

## 支持范围

- macOS（苹果 Mac 系统）、Windows、Linux 上通过 npm 安装的自托管 n8n。
- 项目局部安装和 npm 全局安装；安装器可以自动查找，也可以指定路径。
- 完整覆盖基线为 n8n 2.33.7。其他版本按英文原文精确匹配：能匹配的继续汉化，新增或含义已经变化的文案保留英文，不会因为版本不同而中止安装。
- n8n Cloud 不支持，因为用户无权修改云端 n8n 的服务器文件。
- Docker 自托管需要在镜像构建阶段运行安装器；本仓库不包含 n8n 镜像。

## 安装

前提：电脑上已经安装并能够运行 n8n，Node.js 版本不低于 18。

发布到 npm 后，macOS、Windows、Linux 使用同一条命令：

```bash
npx n8n-zh-cn
```

如果自动查找不到 n8n，可以指定 n8n 项目、`node_modules` 或 n8n 包目录：

```bash
npx n8n-zh-cn --target /path/to/n8n/project
```

Windows PowerShell 示例：

```powershell
npx n8n-zh-cn --target "C:\path\to\n8n\project"
```

安装后重启原来的 n8n 服务，并在浏览器中强制刷新页面。

## 卸载

```bash
npx n8n-zh-cn --uninstall
```

安装器会依据安装清单恢复被修改的编辑器入口，并移除由本汉化包生成的节点翻译。用户自己修改过或不属于本安装器管理的文件不会被强制删除。

## 从下载的源码包安装

macOS / Linux：

```bash
bash install.sh
```

Windows PowerShell：

```powershell
powershell -ExecutionPolicy Bypass -File .\install.ps1
```

卸载时分别运行 `bash uninstall.sh` 或 `powershell -ExecutionPolicy Bypass -File .\uninstall.ps1`。

## 汉化策略

项目同时使用两层汉化：

1. n8n 的原生节点翻译机制负责节点参数、选项和动态值。
2. 前端覆盖层补齐主界面及官方当前没有中文资源的固定文案。

策略是“能翻尽翻”，同时避免改变技术含义：

- AI、API、HTTP、JSON、MCP、SSO、LDAP、Webhook 等通用术语保留。
- 风险、教程或容易歧义的术语使用“中文（English）”并排。
- 代码、表达式、用户数据、输入值、错误原文、工作流名称、凭据名称、项目名称和密钥 JSON 不翻译。
- 新版 n8n 中无法精确匹配的文案保持英文，不做模糊替换。

## 覆盖情况

以 n8n 2.33.7 为基线：

- 主界面覆盖层：33,345 个独立匹配项。
- 节点可见候选文案：27,818 / 27,818。
- 原生节点翻译：563 个节点文件、48,919 个翻译落点。

审计会排除代码、表达式、用户数据、品牌名和应保持原样的纯技术标记。这些数字只对应当前基线版本，不代表未来 n8n 新增文案会自动获得正确译文。

## 开发与验证

```bash
npm test
npm pack --dry-run
```

GitHub Actions 会在 macOS、Windows、Linux 上验证词典 JSON、跨分片冲突、安装器语法和 npm 包内容。n8n 更新后的新英文文案仍需维护者翻译、复核并发布新版本，不会让模型或机器翻译未经审核地自动上线。

英文键和翻译来源说明见 [localization/PROVENANCE.md](localization/PROVENANCE.md)。

## 许可

本项目原创安装脚本与中文译文按 [MIT License](LICENSE) 免费提供，允许使用、修改和再发布。n8n 本体不包含在本项目中，并继续遵循 [n8n 官方许可证](https://github.com/n8n-io/n8n/blob/master/LICENSE.md)。详见 [NOTICE](NOTICE)。
