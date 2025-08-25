#!/bin/bash

# rVim Chrome Extension 标签发布脚本
# 用法: ./scripts/tag-release.sh <version>
# 在发布分支合并到 main 后运行

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
if [ $# -lt 1 ]; then
    log_error "用法: $0 <version>"
    log_info "示例: $0 1.3.0"
    exit 1
fi

VERSION=$1

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

# 检查是否在 main 分支
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ]; then
    log_warning "当前不在 main 分支 (当前: $CURRENT_BRANCH)"
    read -p "是否切换到 main 分支? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git checkout main
        git pull origin main
    else
        log_error "标签发布必须在 main 分支进行"
        exit 1
    fi
fi

# 确保 main 分支是最新的
log_info "更新 main 分支..."
git pull origin main

# 检查版本号是否已存在
if git tag -l | grep -q "^v$VERSION$"; then
    log_error "版本标签 v$VERSION 已存在"
    exit 1
fi

# 验证 manifest.json 中的版本号
MANIFEST_VERSION=$(grep '"version"' manifest.json | sed 's/.*"version": "\([^"]*\)".*/\1/')
if [ "$MANIFEST_VERSION" != "$VERSION" ]; then
    log_error "manifest.json 中的版本号 ($MANIFEST_VERSION) 与指定版本 ($VERSION) 不匹配"
    log_info "请确保发布分支已正确合并到 main 分支"
    exit 1
fi

# 获取发布说明
log_info "从 CHANGELOG.md 提取发布说明..."
RELEASE_NOTES=""
if [ -f "CHANGELOG.md" ]; then
    # 提取当前版本的发布说明
    RELEASE_NOTES=$(awk "/^## \[$VERSION\]/{flag=1; next} /^## \[/{flag=0} flag" CHANGELOG.md | sed '/^$/d')
fi

if [ -z "$RELEASE_NOTES" ]; then
    RELEASE_NOTES="Release version $VERSION

Please check CHANGELOG.md for detailed release notes."
fi

# 显示即将创建的标签信息
echo
log_info "即将创建版本标签:"
echo "  版本: v$VERSION"
echo "  分支: $CURRENT_BRANCH"
echo "  提交: $(git rev-parse --short HEAD)"
echo
log_info "发布说明:"
echo "$RELEASE_NOTES"
echo

# 确认创建标签
read -p "确认创建标签? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    log_info "标签创建已取消"
    exit 0
fi

# 创建带注释的标签
log_info "创建版本标签 v$VERSION..."
echo "$RELEASE_NOTES" | git tag -a "v$VERSION" -F -

# 推送标签到远程仓库
log_info "推送标签到远程仓库..."
git push origin "v$VERSION"

# 合并 main 到 develop
log_info "将 main 分支的更改合并回 develop..."
git checkout develop
git pull origin develop
git merge main --no-ff -m "chore: merge main into develop after release v$VERSION"
git push origin develop

# 清理发布分支
log_info "清理发布分支..."
RELEASE_BRANCH="release/$VERSION"
if git branch -r | grep -q "origin/$RELEASE_BRANCH"; then
    read -p "是否删除远程发布分支 $RELEASE_BRANCH? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git push origin --delete "$RELEASE_BRANCH"
        log_success "远程发布分支已删除"
    fi
fi

if git branch | grep -q "$RELEASE_BRANCH"; then
    git branch -d "$RELEASE_BRANCH"
    log_success "本地发布分支已删除"
fi

# 显示成功信息和后续步骤
echo
log_success "版本 v$VERSION 发布成功!"
echo
log_info "标签信息:"
git show "v$VERSION" --no-patch --format="  提交: %H%n  作者: %an <%ae>%n  日期: %ad%n  消息: %s"
echo
log_info "后续步骤:"
echo "1. 检查 GitHub Releases 页面是否自动创建了发布"
echo "2. 如需要，手动编辑 GitHub Release 说明"
echo "3. 运行 Chrome Web Store 发布脚本:"
echo "   ./scripts/chrome-store-release.sh $VERSION"
echo "4. 通知团队新版本已发布"
echo
log_info "相关链接:"
echo "  GitHub Releases: https://github.com/YOUR_USERNAME/YOUR_REPO/releases"
echo "  Chrome Web Store: https://chrome.google.com/webstore/developer/dashboard"
echo
log_info "当前分支: $(git branch --show-current)"