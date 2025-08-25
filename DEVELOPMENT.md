# rVim 开发指南

本文档介绍 rVim Chrome 扩展的开发流程、分支管理策略和发布流程。

## 🚀 快速开始

### 环境准备

```bash
# 克隆项目
git clone <repository-url>
cd chromium-vim-master

# 初始化开发环境
make setup

# 启动开发服务器
make dev
```

### 在浏览器中加载扩展

1. 打开 Chrome 扩展管理页面 (`chrome://extensions/`)
2. 启用「开发者模式」
3. 点击「加载已解压的扩展程序」
4. 选择项目根目录

## 📋 开发工作流

### 日常开发命令

```bash
# 查看所有可用命令
make help

# 构建扩展
make build

# 运行测试
make test

# 代码检查
make lint

# 验证扩展文件
make validate

# 清理构建文件
make clean
```

### 功能开发流程

1. **创建功能分支**
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/your-feature-name
   ```

2. **开发和测试**
   ```bash
   # 进行开发工作
   make test
   make lint
   ```

3. **提交代码**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   git push origin feature/your-feature-name
   ```

4. **创建 Pull Request**
   - 从 `feature/your-feature-name` 到 `develop`
   - 使用提供的 PR 模板
   - 等待代码审查

## 🌿 分支管理策略

### 分支类型

- **`main`**: 生产环境分支，包含稳定的发布版本
- **`develop`**: 开发分支，包含最新的开发功能
- **`feature/*`**: 功能分支，用于开发新功能
- **`release/*`**: 发布分支，用于准备新版本发布
- **`hotfix/*`**: 热修复分支，用于紧急修复生产问题
- **`chrome-store/*`**: Chrome Web Store 特定分支

### 分支保护规则

- `main` 和 `develop` 分支受保护
- 需要通过 Pull Request 合并
- 需要至少一个审查者批准
- 需要通过 CI 检查

## 🚀 发布流程

### 常规发布

1. **创建发布分支**
   ```bash
   # 确保在 develop 分支
   git checkout develop
   git pull origin develop
   
   # 创建发布分支
   make release VERSION=1.3.0
   ```

2. **完善发布信息**
   - 编辑 `CHANGELOG.md` 添加详细的发布说明
   - 进行最终测试和验证

3. **创建 Pull Request**
   - 从 `release/1.3.0` 到 `main`
   - 合并后自动触发 CI/CD

4. **创建版本标签**
   ```bash
   git checkout main
   git pull origin main
   ./scripts/tag-release.sh 1.3.0
   ```

5. **发布到 Chrome Web Store**
   ```bash
   make chrome-store VERSION=1.3.0
   ```

### 热修复发布

1. **创建热修复分支**
   ```bash
   make hotfix VERSION=1.3.1 DESC="Fix critical security vulnerability"
   ```

2. **进行修复**
   ```bash
   # 实现修复代码
   git add .
   git commit -m "fix: critical security vulnerability"
   git push origin hotfix/1.3.1
   ```

3. **快速发布**
   - 创建 PR 合并到 `main`
   - 立即创建标签和发布
   - 紧急发布到 Chrome Web Store

## 🔧 配置管理

### 环境变量配置

复制 `.env.example` 为 `.env` 并配置：

```bash
cp .env.example .env
```

编辑 `.env` 文件，配置 Chrome Web Store API 凭据：

```env
CHROME_EXTENSION_ID=your_extension_id
CHROME_CLIENT_ID=your_client_id
CHROME_CLIENT_SECRET=your_client_secret
CHROME_REFRESH_TOKEN=your_refresh_token
```

### Chrome Web Store API 设置

1. 访问 [Google Cloud Console](https://console.cloud.google.com/)
2. 创建项目并启用 Chrome Web Store API
3. 创建 OAuth 2.0 凭据
4. 获取刷新令牌

详细步骤请参考 [Chrome Web Store API 文档](https://developer.chrome.com/docs/webstore/using_webstore_api/)

## 🧪 测试策略

### 测试类型

- **单元测试**: 测试独立的函数和模块
- **集成测试**: 测试组件间的交互
- **端到端测试**: 测试完整的用户流程
- **兼容性测试**: 测试不同浏览器和网站的兼容性

### 测试环境

- **开发环境**: 本地开发和调试
- **测试环境**: 自动化测试和集成测试
- **预发布环境**: 发布前的最终验证
- **生产环境**: Chrome Web Store 发布版本

## 📊 监控和分析

### 性能监控

- 扩展加载时间
- 内存使用情况
- CPU 使用率
- 网络请求性能

### 错误监控

- JavaScript 错误
- 扩展 API 错误
- 网站兼容性问题
- 用户反馈问题

### 使用分析

- 功能使用频率
- 用户行为模式
- 性能瓶颈分析
- 错误率统计

## 🆘 故障处理

### 紧急响应流程

1. **问题识别**: 通过监控或用户反馈发现问题
2. **影响评估**: 评估问题的严重程度和影响范围
3. **快速修复**: 创建热修复分支进行紧急修复
4. **测试验证**: 快速测试修复效果
5. **紧急发布**: 通过热修复流程快速发布
6. **事后分析**: 分析问题原因并改进流程

### 回滚策略

```bash
# 回滚到上一个版本
git checkout main
git reset --hard v1.2.9
git push origin main --force-with-lease

# 重新发布上一个版本
make chrome-store VERSION=1.2.9
```

## 📚 相关文档

- [分支管理策略](BRANCH_STRATEGY.md) - 详细的分支管理规范
- [贡献指南](CONTRIBUTING.md) - 如何为项目做贡献
- [API 文档](docs/API.md) - 扩展 API 文档
- [故障排除](docs/TROUBLESHOOTING.md) - 常见问题解决方案

## 🤝 团队协作

### 代码审查

- 所有代码变更都需要经过 Pull Request
- 至少需要一个团队成员的审查
- 关注代码质量、安全性和性能
- 使用提供的 PR 模板确保信息完整

### 沟通渠道

- **GitHub Issues**: 问题报告和功能请求
- **Pull Requests**: 代码审查和讨论
- **GitHub Discussions**: 技术讨论和问答
- **Release Notes**: 版本发布说明

### 最佳实践

- 遵循 [Conventional Commits](https://www.conventionalcommits.org/) 规范
- 保持代码简洁和可读性
- 编写有意义的提交信息
- 及时更新文档
- 积极参与代码审查

---

如有任何问题或建议，请创建 GitHub Issue 或参与讨论。