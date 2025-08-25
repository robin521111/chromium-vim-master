#!/bin/bash

# rVim Chrome Extension 热修复脚本
# 用法: ./scripts/hotfix.sh <version> <description>
# 从 main 分支创建热修复分支

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 函数定义
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查参数
if [ $# -lt 2 ]; then
    log_error "用法: $0 <version> <description>"
    log_info "示例: $0 1.3.1 'Fix critical security vulnerability'"
    exit 1
fi

VERSION=$1
DESCRIPTION="$2"

# 验证版本号格式
if ! [[ $VERSION =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
    log_error "版本号格式错误，应为 x.y.z 格式"
    exit 1
fi

# 检查是否在正确的目录
if [ ! -f "manifest.json" ]; then
    log_error "请在项目根目录运行此脚本"
    exit 1
fi

# 检查工作目录是否干净
if [ -n "$(git status --porcelain)" ]; then
    log_error "工作目录不干净，请先提交或暂存所有更改"
    git status --short
    exit 1
fi

# 获取当前版本号
CURRENT_VERSION=$(grep '"version"' manifest.json | sed 's/.*"version": "\([^"]*\)".*/\1/')

# 验证新版本号是否合理（应该是补丁版本递增）
CURRENT_MAJOR=$(echo $CURRENT_VERSION | cut -d. -f1)
CURRENT_MINOR=$(echo $CURRENT_VERSION | cut -d. -f2)
CURRENT_PATCH=$(echo $CURRENT_VERSION | cut -d. -f3)

NEW_MAJOR=$(echo $VERSION | cut -d. -f1)
NEW_MINOR=$(echo $VERSION | cut -d. -f2)
NEW_PATCH=$(echo $VERSION | cut -d. -f3)

if [ "$NEW_MAJOR" != "$CURRENT_MAJOR" ] || [ "$NEW_MINOR" != "$CURRENT_MINOR" ]; then
    log_error "热修复版本号应该只递增补丁版本号"
    log_info "当前版本: $CURRENT_VERSION"
    log_info "建议版本: $CURRENT_MAJOR.$CURRENT_MINOR.$((CURRENT_PATCH + 1))"
    exit 1
fi

if [ "$NEW_PATCH" -le "$CURRENT_PATCH" ]; then
    log_error "新版本号应该大于当前版本号"
    log_info "当前版本: $CURRENT_VERSION"
    log_info "指定版本: $VERSION"
    exit 1
fi

# 检查版本号是否已存在
if git tag -l | grep -q "^v$VERSION$"; then
    log_error "版本 v$VERSION 已存在"
    exit 1
fi

# 确保在 main 分支
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ]; then
    log_warning "当前不在 main 分支 (当前: $CURRENT_BRANCH)"
    read -p "是否切换到 main 分支? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git checkout main
        git pull origin main
    else
        log_error "热修复必须从 main 分支开始"
        exit 1
    fi
fi

# 确保 main 分支是最新的
log_info "更新 main 分支..."
git pull origin main

# 显示热修复信息
echo
log_info "热修复信息:"
echo "  当前版本: $CURRENT_VERSION"
echo "  热修复版本: $VERSION"
echo "  描述: $DESCRIPTION"
echo "  基于分支: main"
echo

# 确认创建热修复
read -p "确认创建热修复分支? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    log_info "热修复创建已取消"
    exit 0
fi

# 创建热修复分支
HOTFIX_BRANCH="hotfix/$VERSION"
log_info "创建热修复分支 $HOTFIX_BRANCH..."
git checkout -b "$HOTFIX_BRANCH"

# 更新版本号
log_info "更新 manifest.json 中的版本号..."
sed -i.bak "s/\"version\": \"$CURRENT_VERSION\"/\"version\": \"$VERSION\"/g" manifest.json
rm manifest.json.bak

# 更新 CHANGELOG.md
log_info "更新 CHANGELOG.md..."
if [ -f "CHANGELOG.md" ]; then
    # 创建临时文件
    TEMP_CHANGELOG=$(mktemp)
    
    # 添加新版本条目
    echo "# Changelog" > $TEMP_CHANGELOG
    echo "" >> $TEMP_CHANGELOG
    echo "## [${VERSION}] - $(date +%Y-%m-%d) - HOTFIX" >> $TEMP_CHANGELOG
    echo "" >> $TEMP_CHANGELOG
    echo "### Fixed" >> $TEMP_CHANGELOG
    echo "- $DESCRIPTION" >> $TEMP_CHANGELOG
    echo "" >> $TEMP_CHANGELOG
    
    # 添加现有内容（跳过第一行标题）
    tail -n +2 CHANGELOG.md >> $TEMP_CHANGELOG
    
    # 替换原文件
    mv $TEMP_CHANGELOG CHANGELOG.md
else
    # 创建新的 CHANGELOG.md
    cat > CHANGELOG.md << EOF
# Changelog

## [${VERSION}] - $(date +%Y-%m-%d) - HOTFIX

### Fixed
- $DESCRIPTION
EOF
fi

# 提交版本更新
log_info "提交版本更新..."
git add manifest.json CHANGELOG.md
git commit -m "chore(hotfix): bump version to $VERSION

$DESCRIPTION

Type: hotfix
Urgency: high"

# 推送热修复分支
log_info "推送热修复分支到远程仓库..."
git push origin "$HOTFIX_BRANCH"

# 显示后续步骤
echo
log_success "热修复分支 $HOTFIX_BRANCH 创建成功!"
echo
log_warning "重要提醒: 这是一个热修复分支，请尽快完成修复并发布"
echo
log_info "后续步骤:"
echo "1. 在当前分支进行必要的修复"
echo "2. 运行测试确保修复有效: npm test"
echo "3. 提交修复代码:"
echo "   git add ."
echo "   git commit -m 'fix: $DESCRIPTION'"
echo "4. 推送更改: git push origin $HOTFIX_BRANCH"
echo "5. 创建 Pull Request 合并到 main 分支"
echo "6. 合并后立即运行:"
echo "   git checkout main"
echo "   git pull origin main"
echo "   ./scripts/tag-release.sh $VERSION"
echo "7. 紧急发布到 Chrome Web Store:"
echo "   ./scripts/chrome-store-release.sh $VERSION"
echo "8. 将 main 合并回 develop:"
echo "   git checkout develop"
echo "   git pull origin develop"
echo "   git merge main"
echo "   git push origin develop"
echo
log_info "当前分支: $(git branch --show-current)"
log_info "开始修复工作..."
echo
log_warning "热修复检查清单:"
echo "□ 修复代码已实现"
echo "□ 单元测试通过"
echo "□ 手动测试验证"
echo "□ 安全性检查"
echo "□ 性能影响评估"
echo "□ 文档更新（如需要）"
echo
log_info "如需取消热修复，运行:"
echo "  git checkout main"
echo "  git branch -D $HOTFIX_BRANCH"
echo "  git push origin --delete $HOTFIX_BRANCH"