# zh-TW terminology

This candidate locale follows common Taiwan software terminology. The English
source keys are authoritative; the existing zh-CN values are used only to
identify UI context and seed script conversion.

## Core terms

| English | zh-TW | Notes |
| --- | --- | --- |
| workflow | 工作流程 | Do not shorten to `工作流`. |
| credential | 憑證 | n8n credential object; not `憑據`. |
| execution | 執行 / 執行記錄 | Choose by UI context. |
| node | 節點 | Keep product node names untranslated when required. |
| trigger | 觸發器 | `Schedule Trigger` is `排程觸發器（Schedule Trigger）`. |
| project | 專案 | Reserved for n8n projects. |
| item | 項目 | Must not be translated as `專案`. |
| data | 資料 | Includes data table (`資料表`) and database (`資料庫`). |
| user | 使用者 | Avoid `用戶`. |
| account | 帳號 | Prefer over `帳戶` in UI labels. |
| settings | 設定 | Avoid `配置` for general UI settings. |
| publish | 發布 | Workflow publishing; avoid automatic `釋出`. |
| template | 範本 | Avoid `模板`. |
| file / folder | 檔案 / 資料夾 | `documentation` is `說明文件`, not `檔案`. |
| create / add | 建立 / 新增 | `建立` for a new entity; `新增` for adding to a collection. |
| save / load | 儲存 / 載入 | Taiwan UI convention. |
| import / export | 匯入 / 匯出 | Taiwan UI convention. |
| search | 搜尋 | Avoid `搜索`. |
| default / custom | 預設 / 自訂 | Taiwan UI convention. |
| software / hardware | 軟體 / 硬體 | Taiwan terminology. |
| server / network | 伺服器 / 網路 | Taiwan terminology. |
| code / source code | 程式碼 / 原始碼 | Keep code examples unchanged. |
| cache | 快取 | Avoid `緩存`. |
| plugin / component | 外掛 / 元件 | Use product names unchanged where applicable. |
| quality | 品質 | Avoid `質量` for quality. |
| response | 回應 | `HTTP response` may be shown as `HTTP 回應`. |
| return | 傳回 | For program output; navigation may use `返回`. |
| access | 存取 | Use `前往` or `瀏覽` only when screen context requires it. |
| instance | 執行個體 | n8n deployment instance; avoid mechanical `例項`. |
| object / array | 物件 / 陣列 | Programming terms. |
| parameter / field | 參數 / 欄位 | Programming and form terms. |

## Terms kept in English

Keep established technical identifiers and protocols unchanged, including
AI, API, HTTP, HTTPS, JSON, XML, MCP, Webhook, OAuth, URL, URI, ID, SQL, npm,
n8n, product names, code, expressions, property names, and example payloads.

## Bilingual safety labels

Irreversible or potentially ambiguous short actions may show Chinese and the
English source together, for example `刪除帳號（Delete account）` and
`全部重設（Reset all）`. This is intentional and should not be normalized away.
