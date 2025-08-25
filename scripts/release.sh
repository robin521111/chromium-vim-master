#!/bin/bash

# rVim Chrome Extension 发布脚本
# 用法: ./scripts/release.sh <version> [type]
# 类型: major, minor, patch (默认: minor)

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
    log_error "用法: $0 <version> [type]"
    log_info "示例: $0 1.3.0 minor"
    log_info "类型: major, minor, patch (默认: minor)"
    exit 1
fi

VERSION=$1
RELEASE_TYPE=${2:-minor}

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

# 检查是否在 develop 分支
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "develop" ]; then
    log_warning "当前不在 develop 分支 (当前: $CURRENT_BRANCH)"
    read -p "是否切换到 develop 分支? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git checkout develop
        git pull origin develop
    else
        log_error "发布必须从 develop 分支开始"
        exit 1
    fi
fi

# 确保 develop 分支是最新的
log_info "更新 develop 分支..."
git pull origin develop

# 检查版本号是否已存在
if git tag -l | grep -q "^v$VERSION$"; then
    log_error "版本 v$VERSION 已存在"
    exit 1
fi

# 获取当前版本号
CURRENT_VERSION=$(grep '"version"' manifest.json | sed 's/.*"version": "\([^"]*\)".*/\1/')
log_info "当前版本: $CURRENT_VERSION"
log_info "目标版本: $VERSION"

# 确认发布
echo
log_warning "即将创建发布分支 release/$VERSION"
read -p "确认继续? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    log_info "发布已取消"
    exit 0
fi

# 创建发布分支
log_info "创建发布分支 release/$VERSION..."
git checkout -b release/$VERSION

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
    echo "## [${VERSION}] - $(date +%Y-%m-%d)" >> $TEMP_CHANGELOG
    echo "" >> $TEMP_CHANGELOG
    echo "### Added" >> $TEMP_CHANGELOG
    echo "- 新功能描述 (请手动编辑)" >> $TEMP_CHANGELOG
    echo "" >> $TEMP_CHANGELOG
    echo "### Changed" >> $TEMP_CHANGELOG
    echo "- 更改描述 (请手动编辑)" >> $TEMP_CHANGELOG
    echo "" >> $TEMP_CHANGELOG
    echo "### Fixed" >> $TEMP_CHANGELOG
    echo "- 修复描述 (请手动编辑)" >> $TEMP_CHANGELOG
    echo "" >> $TEMP_CHANGELOG
    
    # 添加现有内容（跳过第一行标题）
    tail -n +2 CHANGELOG.md >> $TEMP_CHANGELOG
    
    # 替换原文件
    mv $TEMP_CHANGELOG CHANGELOG.md
else
    # 创建新的 CHANGELOG.md
    cat > CHANGELOG.md << EOF
# Changelog

## [${VERSION}] - $(date +%Y-%m-%d)

### Added
- 新功能描述 (请手动编辑)

### Changed
- 更改描述 (请手动编辑)

### Fixed
- 修复描述 (请手动编辑)
EOF
fi

# 运行测试
log_info "运行测试..."
if [ -f "package.json" ] && command -v npm &> /dev/null; then
    if npm run test 2>/dev/null; then
        log_success "测试通过"
    else
        log_warning "测试失败或未配置测试脚本"
    fi
fi

# 构建扩展
log_info "构建扩展..."
if [ -f "Makefile" ]; then
    make build
elif [ -f "package.json" ] && command -v npm &> /dev/null; then
    if npm run build 2>/dev/null; then
        log_success "构建完成"
    else
        log_warning "构建失败或未配置构建脚本"
    fi
fi

# 提交更改
log_info "提交版本更新..."
git add manifest.json CHANGELOG.md
git commit -m "chore(release): bump version to $VERSION

- Update manifest.json version to $VERSION
- Update CHANGELOG.md with release notes

Type: $RELEASE_TYPE"

# 推送发布分支
log_info "推送发布分支到远程仓库..."
git push origin release/$VERSION

# 显示后续步骤
echo
log_success "发布分支 release/$VERSION 创建成功!"
echo
log_info "后续步骤:"
echo "1. 编辑 CHANGELOG.md 添加详细的发布说明"
echo "2. 进行最终测试和验证"
echo "3. 创建 Pull Request 合并到 main 分支"
echo "4. 合并后运行: ./scripts/tag-release.sh $VERSION"
echo "5. 运行: ./scripts/chrome-store-release.sh $VERSION"
echo
log_info "当前分支: $(git branch --show-current)"
log_info "可以使用以下命令编辑 CHANGELOG:"
echo "  nano CHANGELOG.md"
echo "  code CHANGELOG.md"
echo
log_info "如需取消发布，运行:"
echo "  git checkout develop"
echo "  git branch -D release/$VERSION"
echo "  git push origin --delete release/$VERSION"