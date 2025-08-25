# rVim Chrome Extension 分支管理策略

## 📋 概述

本文档定义了 rVim Chrome 扩展项目的 Git 分支管理策略，旨在支持 Chrome Web Store 发布、版本控制、功能开发和问题修复的完整工作流程。

## 🌳 分支结构

### 主要分支

#### 1. `main` 分支
- **用途**: 生产就绪代码，对应 Chrome Web Store 发布版本
- **保护级别**: 高度保护，仅允许通过 PR 合并
- **版本标签**: 所有发布版本都在此分支打标签
- **稳定性**: 必须始终保持可发布状态

#### 2. `develop` 分支
- **用途**: 开发集成分支，包含下一个发布版本的最新功能
- **来源**: 从 `main` 分支创建
- **合并目标**: 功能分支合并到此分支
- **测试要求**: 所有功能必须通过完整测试

### 支持分支

#### 3. `feature/*` 分支
- **命名规范**: `feature/功能描述` 或 `feature/issue-编号`
- **用途**: 新功能开发
- **生命周期**: 功能完成后删除
- **示例**: 
  - `feature/style-optimization`
  - `feature/double-click-search`
  - `feature/issue-123`

#### 4. `release/*` 分支
- **命名规范**: `release/版本号`
- **用途**: 发布准备，版本号调整，最终测试
- **生命周期**: 发布后合并到 `main` 和 `develop`，然后删除
- **示例**: `release/1.3.0`

#### 5. `hotfix/*` 分支
- **命名规范**: `hotfix/问题描述` 或 `hotfix/版本号`
- **用途**: 紧急修复生产环境问题
- **来源**: 从 `main` 分支创建
- **合并目标**: 同时合并到 `main` 和 `develop`
- **示例**: `hotfix/critical-security-fix`

#### 6. `chrome-store/*` 分支
- **命名规范**: `chrome-store/版本号`
- **用途**: Chrome Web Store 特定的发布准备
- **包含**: 商店特定的配置、描述、截图等
- **示例**: `chrome-store/1.3.0`

## 🔄 工作流程

### 功能开发流程

```bash
# 1. 从 develop 创建功能分支
git checkout develop
git pull origin develop
git checkout -b feature/new-feature

# 2. 开发功能
# ... 编码、测试 ...

# 3. 提交更改
git add .
git commit -m "feat: 添加新功能描述"
git push origin feature/new-feature

# 4. 创建 Pull Request 到 develop 分支
# 5. 代码审查通过后合并
# 6. 删除功能分支
git branch -d feature/new-feature
```

### 发布流程

```bash
# 1. 从 develop 创建发布分支
git checkout develop
git pull origin develop
git checkout -b release/1.3.0

# 2. 更新版本号和发布说明
# 更新 manifest.json 中的版本号
# 更新 CHANGELOG.md
# 最终测试和 bug 修复

# 3. 合并到 main 分支
git checkout main
git merge --no-ff release/1.3.0
git tag -a v1.3.0 -m "Release version 1.3.0"

# 4. 合并回 develop 分支
git checkout develop
git merge --no-ff release/1.3.0

# 5. 推送所有更改
git push origin main
git push origin develop
git push origin v1.3.0

# 6. 删除发布分支
git branch -d release/1.3.0
```

### Chrome Web Store 发布流程

```bash
# 1. 从 main 分支创建商店发布分支
git checkout main
git pull origin main
git checkout -b chrome-store/1.3.0

# 2. 准备商店特定文件
# 更新商店描述文件
# 准备截图和宣传材料
# 验证扩展包

# 3. 创建发布包
make build  # 或相应的构建命令

# 4. 上传到 Chrome Web Store
# 5. 发布成功后合并回 main
git checkout main
git merge --no-ff chrome-store/1.3.0
git tag -a store-v1.3.0 -m "Chrome Store release 1.3.0"

# 6. 清理
git branch -d chrome-store/1.3.0
```

### 紧急修复流程

```bash
# 1. 从 main 创建热修复分支
git checkout main
git pull origin main
git checkout -b hotfix/critical-fix

# 2. 修复问题
# ... 编码、测试 ...

# 3. 更新版本号（补丁版本）
# 例如：1.3.0 -> 1.3.1

# 4. 合并到 main
git checkout main
git merge --no-ff hotfix/critical-fix
git tag -a v1.3.1 -m "Hotfix version 1.3.1"

# 5. 合并到 develop
git checkout develop
git merge --no-ff hotfix/critical-fix

# 6. 推送和清理
git push origin main
git push origin develop
git push origin v1.3.1
git branch -d hotfix/critical-fix
```

## 📝 提交信息规范

采用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

```
<类型>[可选的作用域]: <描述>

[可选的正文]

[可选的脚注]
```

### 提交类型

- `feat`: 新功能
- `fix`: 错误修复
- `docs`: 文档更新
- `style`: 代码格式化（不影响功能）
- `refactor`: 代码重构
- `perf`: 性能优化
- `test`: 测试相关
- `chore`: 构建过程或辅助工具的变动
- `ci`: CI/CD 相关
- `build`: 构建系统或外部依赖的变动

### 示例

```bash
feat(search): 添加双击激活搜索功能
fix(styles): 修复样式冲突导致的显示问题
docs: 更新安装说明
chore(release): 准备 1.3.0 版本发布
```

## 🏷️ 版本标签策略

### 版本号规范

采用 [Semantic Versioning](https://semver.org/) (SemVer)：

```
主版本号.次版本号.修订号
```

- **主版本号**: 不兼容的 API 修改
- **次版本号**: 向下兼容的功能性新增
- **修订号**: 向下兼容的问题修正

### 标签类型

- `v1.3.0`: 正式发布版本
- `v1.3.0-beta.1`: 测试版本
- `v1.3.0-alpha.1`: 内测版本
- `store-v1.3.0`: Chrome Web Store 发布标记

## 🛡️ 分支保护规则

### `main` 分支保护

- ✅ 要求 Pull Request 审查
- ✅ 要求状态检查通过
- ✅ 要求分支为最新
- ✅ 限制推送权限
- ✅ 限制强制推送
- ✅ 限制删除

### `develop` 分支保护

- ✅ 要求 Pull Request 审查
- ✅ 要求状态检查通过
- ✅ 限制强制推送

## 🔍 代码审查流程

### Pull Request 要求

1. **描述清晰**: 详细说明更改内容和原因
2. **测试覆盖**: 包含相应的测试用例
3. **文档更新**: 必要时更新相关文档
4. **截图/演示**: UI 更改需要提供截图或演示
5. **向后兼容**: 确保不破坏现有功能

### 审查检查清单

- [ ] 代码质量和可读性
- [ ] 功能正确性
- [ ] 性能影响
- [ ] 安全性考虑
- [ ] 测试覆盖率
- [ ] 文档完整性
- [ ] Chrome 扩展规范合规性

## 🚀 Chrome Web Store 发布策略

### 发布环境

1. **开发环境**: `develop` 分支
2. **测试环境**: `release/*` 分支
3. **预发布环境**: `chrome-store/*` 分支
4. **生产环境**: `main` 分支 + Chrome Web Store

### 发布检查清单

#### 技术检查
- [ ] 所有测试通过
- [ ] 性能基准测试通过
- [ ] 安全扫描通过
- [ ] 兼容性测试通过
- [ ] 扩展包大小检查

#### 商店合规检查
- [ ] 权限声明合理
- [ ] 隐私政策更新
- [ ] 商店描述准确
- [ ] 截图和图标更新
- [ ] 版本说明完整

### 发布时间策略

- **主要版本**: 每季度发布
- **次要版本**: 每月发布
- **修复版本**: 按需发布
- **紧急修复**: 24小时内发布

## 🔧 自动化工具

### GitHub Actions 工作流

```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm install
      - name: Run tests
        run: npm test
      - name: Build extension
        run: npm run build
      - name: Validate extension
        run: npm run validate
```

### 自动化脚本

```bash
# scripts/release.sh
#!/bin/bash
# 自动化发布脚本

VERSION=$1
if [ -z "$VERSION" ]; then
  echo "Usage: ./release.sh <version>"
  exit 1
fi

# 创建发布分支
git checkout develop
git pull origin develop
git checkout -b release/$VERSION

# 更新版本号
sed -i "s/\"version\": \".*\"/\"version\": \"$VERSION\"/g" manifest.json

# 提交更改
git add manifest.json
git commit -m "chore(release): bump version to $VERSION"

echo "Release branch release/$VERSION created successfully!"
echo "Next steps:"
echo "1. Test the release"
echo "2. Create PR to main branch"
echo "3. Tag the release after merge"
```

## 📊 监控和分析

### 发布指标

- 发布频率
- 发布成功率
- 回滚次数
- 用户反馈评分
- 下载量变化

### 分支健康度

- 分支存活时间
- 合并冲突频率
- 代码审查时间
- 测试覆盖率

## 🆘 应急响应计划

### 严重问题响应

1. **立即响应** (< 1小时)
   - 评估问题影响范围
   - 决定是否需要紧急回滚
   - 通知相关团队成员

2. **快速修复** (< 4小时)
   - 创建 hotfix 分支
   - 实施最小化修复
   - 快速测试验证

3. **发布修复** (< 8小时)
   - 发布到 Chrome Web Store
   - 监控修复效果
   - 更新用户通知

### 回滚策略

```bash
# 紧急回滚到上一个版本
git checkout main
git revert HEAD
git tag -a v1.2.9-rollback -m "Emergency rollback"
git push origin main
git push origin v1.2.9-rollback
```

## 📚 相关文档

- [Chrome Extension 开发指南](https://developer.chrome.com/docs/extensions/)
- [Chrome Web Store 发布指南](https://developer.chrome.com/docs/webstore/)
- [Git Flow 工作流](https://nvie.com/posts/a-successful-git-branching-model/)
- [Semantic Versioning](https://semver.org/)
- [Conventional Commits](https://www.conventionalcommits.org/)

## 🔄 策略更新

本策略文档应定期审查和更新：

- **季度审查**: 评估策略有效性
- **年度更新**: 根据项目发展调整策略
- **问题驱动**: 根据实际问题优化流程

---

**最后更新**: 2024年1月
**版本**: 1.0
**维护者**: rVim 开发团队