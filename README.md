# 研究生工作记录 / Graduate Work Journal

> 专为研究生设计的本地工作记录工具，帮你在组会、汇报、答辩时不再"脑子一片空白"。
>
> A local work journal designed for graduate students. Never go blank when your advisor asks "What did you do last week?"

---

## 为什么做这个？ / Why?

读研之后你会发现一件事——**记忆是不可靠的**。

上周做了什么实验？调了什么参数？导师上次说了什么？踩过什么坑？

翻聊天记录？翻备忘录？翻了半小时找不到。

这个工具就是为了解决这个问题：**每天花两分钟记一下，需要的时候秒搜到。**

---

One thing you learn in grad school: **your memory is unreliable**.

What experiment did you run last week? What parameters did you use? What did your advisor say? What bugs did you hit?

Searching through chat logs and notes for half an hour? No more.

This tool solves that: **spend two minutes a day logging your work, and find anything in seconds when you need it.**

## 软件优势 / Features

### 1. 专为研究生场景设计 / Designed for Grad Students

不是通用笔记软件，而是**专门为读研设计**的分类体系：

Not a generic note app. Built specifically for research with purpose-built categories:

| 分类 Category | 记录什么 What to Log |
|------|---------|
| 论文 Paper | 文献阅读、写作进度、投稿状态 / Literature review, writing progress, submission status |
| 实验 Experiment | 实验设计、参数记录、结果分析 / Experiment design, parameters, result analysis |
| 代码 Code | 踩坑记录、环境配置、代码重构 / Bug notes, environment setup, refactoring |
| 组会 Meeting | 导师反馈、讨论要点、待办事项 / Advisor feedback, discussion points, to-dos |
| 项目 Project | 基金报告、项目进展、材料整理 / Grant reports, project progress, materials |
| 其他 Other | 日常记录、学习笔记、杂事 / Daily notes, study notes, misc |

### 2. 全文搜索 / Full-Text Search

标题和内容都能搜，不记得具体措辞也没关系，输个关键词就能找到。

Search across titles and content. Don't remember the exact wording? Just type a keyword.

### 3. 自定义标签 / Custom Tags

每条记录可以打多个标签，支持按标签筛选。

Add multiple tags to each record. Filter by tag.

### 4. 统计面板 / Statistics

- 本月记录了多少条 / How many entries this month
- 各分类的分布比例 / Category distribution
- 按月的时间线图表 / Monthly timeline chart

**说得直白点——能看到自己到底有没有在干活。**

**Bluntly speaking — you can see whether you've actually been working.**

### 5. Markdown 支持 / Markdown Support

内容区支持 Markdown 语法：标题、粗体、斜体、代码块、列表、引用、表格。

Content supports Markdown: headings, bold, italic, code blocks, lists, blockquotes, tables.

### 6. 数据导出 / Data Export

- **JSON 导出**：完整备份，随时恢复 / Full backup, restore anytime
- **Markdown 导出**：按时间线整理成可读文档，方便生成周报 / Timeline export for weekly reports

### 7. 100% 本地运行 / 100% Local

| 特性 Feature | 说明 Description |
|------|------|
| 不联网 No Internet | 所有数据存在本地 / All data stored locally |
| 不注册 No Account | 打开就用 / Just open and use |
| 不上传 No Upload | 你的数据只在你的电脑上 / Your data stays on your machine |
| 隐私安全 Private | 离线运行，没有数据泄露风险 / Offline, no data leak risk |

### 8. 零依赖 / Zero Dependencies

不需要安装 Python、Node.js 或任何运行时。Windows 双击安装包即可使用。

No Python, Node.js, or any runtime needed. Just double-click the installer on Windows.

### 9. 本地数据库 / Local Database

使用 SQLite（sql.js WASM 版本），无需安装数据库服务。启动即用，关闭即存。

Uses SQLite (sql.js WASM). No database server needed. Opens instantly, saves on close.

## 使用场景 / Use Cases

### 场景一：组会前 / Before Group Meeting

> 组会 10 分钟后开始，导师可能会问上周做了什么。
>
> 打开工作记录 → 搜"上周" → 30秒回顾完毕 → 心里有底了。

> Meeting starts in 10 minutes. Your advisor will ask about last week.
>
> Open the journal → search "last week" → 30 seconds to review → ready.

### 场景二：写周报 / Writing Weekly Reports

> 每周要交周报，但想不起来这周具体干了啥。
>
> 打开工作记录 → 按本周日期筛选 → 导出 Markdown → 稍微整理就是周报。

> Weekly report due, but can't remember what you did.
>
> Open journal → filter by this week → export Markdown → done.

### 场景三：踩坑复现 / Revisiting Past Bugs

> 三个月前配过一个环境，当时踩了个坑解决了，现在又遇到同样的问题。
>
> 搜"环境配置" → 找到当时的记录 → 按步骤解决。

> You hit the same environment bug from 3 months ago.
>
> Search "environment config" → find the old note → follow the steps.

### 场景四：论文写作 / Writing Papers

> 写论文的实验部分，需要回忆当时某个实验的参数和结果。
>
> 搜"实验参数" → 找到当时的记录 → 数据直接引用。

> Writing the experiment section, need to recall parameters and results.
>
> Search "experiment parameters" → find the record → cite directly.

## 安装 / Installation

### 方式一：下载安装包（推荐）/ Download Installer (Recommended)

从 [Releases](../../releases) 下载最新版安装包，双击安装即可。

Download the latest installer from [Releases](../../releases) and double-click to install.

### 方式二：源码运行 / Run from Source

```bash
git clone https://github.com/zhexatu-bot/grad-journal.git
cd grad-journal
npm install
npm start
```

## 技术栈 / Tech Stack

| 模块 Module | 技术 Tech | 说明 Description |
|------|------|------|
| 桌面框架 Desktop | Electron | 跨平台桌面应用 / Cross-platform desktop app |
| 后端 Backend | Express | 本地 HTTP API / Local HTTP API |
| 数据库 Database | sql.js (SQLite WASM) | 无需安装数据库服务 / No database server needed |
| 前端 Frontend | HTML + CSS + JS | 轻量无框架 / Lightweight, no framework |
| 打包 Packaging | electron-builder | NSIS 安装包 / NSIS installer |

## 数据存储 / Data Storage

- **开发模式 Dev**: `data.db` in project directory
- **安装模式 Installed**: `%APPDATA%/grad-journal/data.db`

备份数据只需拷贝 `data.db` 文件即可。/ Back up by copying `data.db`.

## 系统要求 / Requirements

- Windows 10/11 (64-bit)
- No additional software needed

## 许可证 / License

MIT License

## 联系方式 / Contact

- GitHub: [zhexatu-bot](https://github.com/zhexatu-bot)
- WeChat: matlabpython888
