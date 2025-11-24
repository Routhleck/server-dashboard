# 服务器状态监控面板

这是一个基于 GitHub Pages 的服务器状态监控面板，使用 React + Vite + TypeScript 构建，通过 GitHub Actions 定期检查服务器 SSH 连接状态。

## 功能特性

- 实时显示服务器连接状态（在线/离线）
- 显示服务器响应时间
- 7天历史数据可视化
- 计算服务器可用性百分比
- 每20分钟自动更新状态
- 页面每5分钟自动刷新数据
- 响应式设计，支持移动端

## 部署步骤

### 1. 克隆并推送到 GitHub

```bash
# 如果还没有设置远程仓库
git remote add origin https://github.com/YOUR_USERNAME/server-dashboard.git
git branch -M master
git push -u origin master
```

### 2. 配置 GitHub Secrets

在 GitHub 仓库设置中添加以下 Secrets：

1. 进入仓库的 Settings → Secrets and variables → Actions
2. 点击 "New repository secret"
3. 添加第一个 Secret：
   - Name: `SSH_PRIVATE_KEY`
   - Value: 你的 `admin_recovery_key` 文件的完整内容
4. 添加第二个 Secret：
   - Name: `SSH_USERNAME`
   - Value: `adminuser`（SSH 连接用的用户名）

### 3. 配置 GitHub Pages

1. 进入仓库的 Settings → Pages
2. 在 "Build and deployment" 部分：
   - Source: 选择 "GitHub Actions"
3. 保存设置

### 4. 触发首次部署

推送代码后，GitHub Actions 会自动运行：
- `deploy.yml` 会构建并部署网站
- `check-servers.yml` 会开始定期检查服务器状态

你也可以手动触发工作流：
1. 进入 Actions 标签
2. 选择相应的 workflow
3. 点击 "Run workflow"

## 本地开发

### 安装依赖

```bash
npm install
```

### 运行开发服务器

```bash
npm run dev
```

访问 http://localhost:5173 查看本地开发版本。

### 构建生产版本

```bash
npm run build
```

### 预览生产构建

```bash
npm run preview
```

## 手动测试服务器检查脚本

在本地测试服务器检查功能：

```bash
cd scripts
npm install
node check-servers.js
```

注意：需要确保 `admin_recovery_key` 文件存在于项目根目录。

## 项目结构

```
server-dashboard/
├── .github/
│   └── workflows/
│       ├── check-servers.yml    # 服务器状态检查工作流
│       └── deploy.yml           # GitHub Pages 部署工作流
├── public/
│   └── data/
│       ├── servers.json         # 服务器列表配置
│       ├── status.json          # 当前状态数据
│       └── history.json         # 历史数据
├── scripts/
│   ├── check-servers.js         # SSH 检查脚本
│   └── package.json             # 脚本依赖
├── src/
│   ├── components/
│   │   ├── ServerCard.tsx       # 服务器状态卡片组件
│   │   └── HistoryChart.tsx     # 历史数据图表组件
│   ├── types.ts                 # TypeScript 类型定义
│   ├── App.tsx                  # 主应用组件
│   ├── main.tsx                 # 入口文件
│   └── index.css                # 全局样式
├── index.html
├── package.json
├── vite.config.ts
└── README.md
```

## 配置说明

### 修改服务器列表

编辑 `public/data/servers.json` 文件：

```json
[
  {
    "name": "server1",
    "ip": "192.168.1.100",
    "port": 22
  }
]
```

### 修改检查频率

编辑 `.github/workflows/check-servers.yml` 中的 cron 表达式：

```yaml
schedule:
  - cron: '*/20 * * * *'  # 每20分钟运行
```

### 修改页面刷新频率

编辑 `src/App.tsx` 中的刷新间隔：

```typescript
const interval = setInterval(fetchData, 5 * 60 * 1000); // 5分钟
```

## 技术栈

- **前端框架**: React 18
- **构建工具**: Vite 5
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **图表**: Recharts
- **SSH 连接**: ssh2
- **CI/CD**: GitHub Actions
- **托管**: GitHub Pages

## 注意事项

1. **凭据安全**: 确保 SSH 私钥和用户名只存储在 GitHub Secrets 中，不要提交到仓库
2. **防火墙**: 确保服务器允许 GitHub Actions 的 IP 访问 SSH 端口
3. **用户权限**: 确保 SSH_USERNAME 指定的用户在服务器上存在且配置了对应的 SSH 公钥
4. **数据保留**: 历史数据保留最近7天（约504个数据点）
5. **超时设置**: SSH 连接超时时间设置为10秒

## 故障排查

### 服务器检查失败

1. 检查 GitHub Secrets 中的 SSH_PRIVATE_KEY 和 SSH_USERNAME 是否正确
2. 确认服务器 SSH 端口开放且可从公网访问
3. 验证 SSH 用户名在服务器上存在且配置了正确的公钥
4. 查看 Actions 日志了解详细错误信息

### 页面无法访问

1. 确认 GitHub Pages 已启用
2. 检查部署工作流是否成功运行
3. 确认仓库设置中的 Pages 配置正确

### 数据不更新

1. 检查 check-servers.yml 工作流是否正常运行
2. 确认工作流有权限提交更改
3. 查看 Actions 日志了解详细错误

## 许可证

MIT License
