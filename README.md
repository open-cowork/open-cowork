<div align="center">
  <img src="assets/logo.JPG" alt="Poco Logo" width="150" height="150" style="border-radius: 25px;">

# Poco: Your Pocket Coworker

**基于云端 Claude Code，打造 Manus 般的 Agent 体验**

你也可以把它看作是 **OpenClaw** 的**更安全**（沙盒隔离）、**更漂亮**（现代 UI）、**配置更简单**（开箱即用）的替代方案。

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Docker](https://img.shields.io/badge/Docker-Enabled-blue)](https://www.docker.com/)
[![Python 3.12+](https://img.shields.io/badge/python-3.12+-blue.svg)](https://www.python.org/downloads/)
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-green.svg)](https://fastapi.tiangolo.com/)
[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/poco-ai/poco-agent)

[English](./README_EN.md) | [中文](./README.md)

</div>

---

## 核心功能

- **安全沙盒**：任务在隔离容器中运行，随意安装依赖或修改文件，绝不破坏宿主机环境。
- **高颜值 UI & 移动端适配**：提供美观的 Web 界面和产物预览，手机上也能随时指挥 Agent。
- **零配置开箱即用**：无需繁琐的本地环境配置，通过 Docker 一键启动，包含完整运行环境。
- **全面能力 & MCP/skills 扩展**：完整复刻 Claude Code 原生功能（Slash Command、Plan Mode、AskQuestion），并支持 MCP 协议或自定义 Skills，能力无上限。
- **异步与定时任务**：支持后台挂机运行和定时触发，关掉网页 Agent 依然在云端自动干活。
- **更多功能**：内置**浏览器**可自主上网查资料，支持**GitHub 仓库连接**……更多强大功能等你发掘！

![home](assets/home.png)

<details>
<summary><strong>点击查看更多功能截图</strong></summary>
<br>

**1. 产物前端渲染，页面高颜值**

![output](assets/output.png)

**2. mcp/skills全面支持，配置容易**

![home](assets/capability.png)

![skills](assets/skills.png)

**3. 定时任务**

![schedule](assets/schedule.png)

</details>

<details>
<summary><strong>点击查看功能演示</strong></summary>
<br>

**1. 手机端操作演示**
完美适配移动端，口袋里的 AI Coworker。
![Demo4](https://github.com/user-attachments/assets/ccf680bb-358c-4fc9-ad97-50f75b5ea3ac)

**2. 写代码与产物预览**
通过几次对话做一个游戏，右侧直接预览运行结果。
![Demo1](https://github.com/user-attachments/assets/0ef59c4c-8363-44a6-b9ed-7005ccfd71cb)

**3. 复杂文件处理**
支持读取和分析各类项目文件。
![Demo3](https://github.com/user-attachments/assets/8135dab4-6396-4af8-97af-6f665853fb56)

</details>

## 快速开始

运行一键启动脚本，按提示输入 API Key，自动生成配置文件并启动服务：

```bash
./scripts/quickstart.sh
```

启动完成后访问：http://localhost:3000

(可选) 如需使用外部 S3/R2 存储，请使用 docker-compose.r2.yml 启动。

详细的部署文档与可能遇到的问题，请参考[部署文档](./docs/README.md)。

## 社区

扫码加入微信群交流：

<img src="assets/wx_group.jpg" alt="微信群二维码" width="180">

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=poco-ai/poco-agent&type=date&legend=top-left)](https://www.star-history.com/#poco-ai/poco-agent&type=date&legend=top-left)

## 致谢

本项目灵感来源于[wegent](https://github.com/wecode-ai/Wegent)，并参考了其架构设计。感谢原作者的辛勤工作！
