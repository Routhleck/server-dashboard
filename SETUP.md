# 快速设置指南

## 第一步：推送代码到 GitHub

```bash
# 设置远程仓库（替换为你的 GitHub 用户名）
git remote add origin https://github.com/YOUR_USERNAME/server-dashboard.git

# 推送代码
git add .
git commit -m "Initial setup"
git push -u origin master
```

## 第二步：配置 GitHub Secrets

你需要配置两个 Secrets：

1. 打开你的 GitHub 仓库页面
2. 进入 **Settings** → **Secrets and variables** → **Actions**
3. 点击 **New repository secret**
4. 配置第一个 Secret：
   - **Name**: `SSH_PRIVATE_KEY`
   - **Secret**: 复制 `admin_recovery_key` 文件的全部内容并粘贴
5. 点击 **New repository secret** 添加第二个 Secret：
   - **Name**: `SSH_USERNAME`
   - **Value**: `adminuser`（你用于 SSH 连接的用户名）

保存后，GitHub Actions 将使用这些凭据连接服务器。

## 第三步：启用 GitHub Pages

1. 在仓库页面进入 **Settings** → **Pages**
2. 在 **Build and deployment** 部分：
   - **Source**: 选择 **GitHub Actions**
3. 保存设置

## 第四步：触发部署

推送代码后，会自动触发两个工作流：

1. **Deploy to GitHub Pages** - 构建并部署网站
2. **Check Servers Status** - 开始定期检查服务器

你可以在 **Actions** 标签中查看工作流运行状态。

你也可以手动触发：
1. 进入 **Actions** 标签
2. 选择 **Check Servers Status**
3. 点击 **Run workflow** → **Run workflow**

## 第五步：访问你的状态页面

部署完成后，访问：
```
https://YOUR_USERNAME.github.io/server-dashboard/
```

## 常见问题

### Q: 如何添加或删除服务器？

编辑 `public/data/servers.json` 文件，然后提交并推送：

```bash
git add public/data/servers.json
git commit -m "Update server list"
git push
```

### Q: 如何更改检查频率？

编辑 `.github/workflows/check-servers.yml` 文件中的 cron 表达式：

```yaml
schedule:
  # 每10分钟：'*/10 * * * *'
  # 每30分钟：'*/30 * * * *'
  # 每小时：  '0 * * * *'
  - cron: '*/20 * * * *'
```

### Q: 服务器检查失败怎么办？

1. 检查 Actions 日志中的错误信息
2. 确保 SSH_PRIVATE_KEY 和 SSH_USERNAME 都配置正确
3. 确认服务器端口对外开放
4. 验证 SSH 用户在服务器上存在且已配置正确的 SSH 密钥

### Q: 如何本地测试？

```bash
# 测试服务器检查脚本
cd scripts
npm install
node check-servers.js

# 运行开发服务器
cd ..
npm run dev
```

## 下一步

- 监控 GitHub Actions 的运行日志
- 定期检查状态页面
- 根据需要调整检查频率和显示内容

祝使用愉快！
