#!/bin/bash

# rVim Chrome Extension Chrome Web Store 发布脚本
# 用法: ./scripts/chrome-store-release.sh <version> [environment]
# 环境: production, beta (默认: production)

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
    log_error "用法: $0 <version> [environment]"
    log_info "示例: $0 1.3.0 production"
    log_info "环境: production, beta (默认: production)"
    exit 1
fi

VERSION=$1
ENVIRONMENT=${2:-production}

# 验证版本号格式
if ! [[ $VERSION =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
    log_error "版本号格式错误，应为 x.y.z 格式"
    exit 1
fi

# 验证环境参数
if [[ "$ENVIRONMENT" != "production" && "$ENVIRONMENT" != "beta" ]]; then
    log_error "环境参数错误，应为 production 或 beta"
    exit 1
fi

# 检查是否在正确的目录
if [ ! -f "manifest.json" ]; then
    log_error "请在项目根目录运行此脚本"
    exit 1
fi

# 检查必要的工具
if ! command -v zip &> /dev/null; then
    log_error "zip 命令未找到，请安装 zip 工具"
    exit 1
fi

# 检查环境变量
if [ "$ENVIRONMENT" = "production" ]; then
    if [ -z "$CHROME_EXTENSION_ID" ]; then
        log_warning "CHROME_EXTENSION_ID 环境变量未设置"
        log_info "请在 .env 文件中设置或导出环境变量"
    fi
    
    if [ -z "$CHROME_CLIENT_ID" ] || [ -z "$CHROME_CLIENT_SECRET" ] || [ -z "$CHROME_REFRESH_TOKEN" ]; then
        log_warning "Chrome Web Store API 凭据未完全设置"
        log_info "需要设置: CHROME_CLIENT_ID, CHROME_CLIENT_SECRET, CHROME_REFRESH_TOKEN"
        log_info "请参考 Chrome Web Store API 文档获取这些凭据"
    fi
fi

# 加载环境变量
if [ -f ".env" ]; then
    log_info "加载 .env 文件..."
    export $(cat .env | grep -v '^#' | xargs)
fi

# 验证 manifest.json 中的版本号
MANIFEST_VERSION=$(grep '"version"' manifest.json | sed 's/.*"version": "\([^"]*\)".*/\1/')
if [ "$MANIFEST_VERSION" != "$VERSION" ]; then
    log_error "manifest.json 中的版本号 ($MANIFEST_VERSION) 与指定版本 ($VERSION) 不匹配"
    exit 1
fi

# 检查版本标签是否存在
if ! git tag -l | grep -q "^v$VERSION$"; then
    log_warning "版本标签 v$VERSION 不存在"
    log_info "建议先运行: ./scripts/tag-release.sh $VERSION"
fi

# 创建构建目录
BUILD_DIR="build"
DIST_DIR="dist"
ZIP_NAME="rVim-v$VERSION-$ENVIRONMENT.zip"

log_info "准备构建目录..."
rm -rf "$BUILD_DIR" "$DIST_DIR"
mkdir -p "$BUILD_DIR" "$DIST_DIR"

# 复制文件到构建目录
log_info "复制扩展文件..."

# 基本文件
cp manifest.json "$BUILD_DIR/"
cp service_worker.js "$BUILD_DIR/" 2>/dev/null || log_warning "未找到根级 service_worker.js，若 manifest 指向根路径需确保复制"
cp -r content_scripts "$BUILD_DIR/"
cp -r background_scripts "$BUILD_DIR/"
cp -r pages "$BUILD_DIR/"
cp -r icons "$BUILD_DIR/"

# 可选文件
[ -f "README.md" ] && cp README.md "$BUILD_DIR/"
[ -f "LICENSE" ] && cp LICENSE "$BUILD_DIR/"
[ -d "_locales" ] && cp -r _locales "$BUILD_DIR/"

# 根据环境调整配置
if [ "$ENVIRONMENT" = "beta" ]; then
    log_info "配置 Beta 环境..."
    
    # 修改扩展名称
    sed -i.bak 's/"name": "rVim"/"name": "rVim Beta"/g' "$BUILD_DIR/manifest.json"
    
    # 修改版本号添加 beta 后缀
    sed -i.bak "s/\"version\": \"$VERSION\"/\"version\": \"$VERSION.1\"/g" "$BUILD_DIR/manifest.json"
    
    # 添加 beta 标识
    sed -i.bak 's/"description": "/"description": "[BETA] /g' "$BUILD_DIR/manifest.json"
    
    rm "$BUILD_DIR/manifest.json.bak"
    
    ZIP_NAME="rVim-v$VERSION-beta.zip"
fi

# 清理不需要的文件
log_info "清理构建文件..."
find "$BUILD_DIR" -name ".DS_Store" -delete 2>/dev/null || true
find "$BUILD_DIR" -name "*.map" -delete 2>/dev/null || true
find "$BUILD_DIR" -name "*.log" -delete 2>/dev/null || true
find "$BUILD_DIR" -name "node_modules" -type d -exec rm -rf {} + 2>/dev/null || true

# 运行构建脚本（如果存在）
if [ -f "package.json" ] && command -v npm &> /dev/null; then
    if npm run build:production 2>/dev/null; then
        log_success "生产构建完成"
    elif npm run build 2>/dev/null; then
        log_success "构建完成"
    else
        log_warning "未找到构建脚本或构建失败"
    fi
fi

# 创建 ZIP 包
log_info "创建 ZIP 包..."
cd "$BUILD_DIR"
zip -r "../$DIST_DIR/$ZIP_NAME" . -x "*.DS_Store" "*.map" "*.log"
cd ..

# 验证 ZIP 包
ZIP_SIZE=$(du -h "$DIST_DIR/$ZIP_NAME" | cut -f1)
log_success "ZIP 包创建成功: $ZIP_NAME ($ZIP_SIZE)"

# 显示 ZIP 包内容
log_info "ZIP 包内容:"
unzip -l "$DIST_DIR/$ZIP_NAME" | head -20
if [ $(unzip -l "$DIST_DIR/$ZIP_NAME" | wc -l) -gt 25 ]; then
    echo "... (更多文件)"
fi

# Chrome Web Store 上传（如果配置了 API 凭据）
if [ "$ENVIRONMENT" = "production" ] && [ -n "$CHROME_EXTENSION_ID" ] && [ -n "$CHROME_CLIENT_ID" ]; then
    log_info "准备上传到 Chrome Web Store..."
    
    # 获取访问令牌
    log_info "获取访问令牌..."
    ACCESS_TOKEN_RESPONSE=$(curl -s -X POST \
        -d "client_id=$CHROME_CLIENT_ID" \
        -d "client_secret=$CHROME_CLIENT_SECRET" \
        -d "refresh_token=$CHROME_REFRESH_TOKEN" \
        -d "grant_type=refresh_token" \
        "https://oauth2.googleapis.com/token")
    
    ACCESS_TOKEN=$(echo "$ACCESS_TOKEN_RESPONSE" | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)
    
    if [ -z "$ACCESS_TOKEN" ]; then
        log_error "获取访问令牌失败"
        log_info "响应: $ACCESS_TOKEN_RESPONSE"
        log_warning "将跳过自动上传，请手动上传 ZIP 包"
    else
        log_success "访问令牌获取成功"
        
        # 上传 ZIP 包
        log_info "上传扩展包到 Chrome Web Store..."
        UPLOAD_RESPONSE=$(curl -s -X PUT \
            -H "Authorization: Bearer $ACCESS_TOKEN" \
            -H "x-goog-api-version: 2" \
            -T "$DIST_DIR/$ZIP_NAME" \
            "https://www.googleapis.com/upload/chromewebstore/v1.1/items/$CHROME_EXTENSION_ID")
        
        if echo "$UPLOAD_RESPONSE" | grep -q '"uploadState":"SUCCESS"'; then
            log_success "扩展包上传成功"
            
            # 发布扩展（可选）
            read -p "是否立即发布到 Chrome Web Store? (y/N): " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                log_info "发布扩展..."
                PUBLISH_RESPONSE=$(curl -s -X POST \
                    -H "Authorization: Bearer $ACCESS_TOKEN" \
                    -H "x-goog-api-version: 2" \
                    -H "Content-Length: 0" \
                    "https://www.googleapis.com/chromewebstore/v1.1/items/$CHROME_EXTENSION_ID/publish")
                
                if echo "$PUBLISH_RESPONSE" | grep -q '"status":\["OK"\]'; then
                    log_success "扩展发布成功"
                else
                    log_warning "扩展发布失败或需要审核"
                    log_info "响应: $PUBLISH_RESPONSE"
                fi
            else
                log_info "扩展已上传但未发布，请在开发者控制台手动发布"
            fi
        else
            log_error "扩展包上传失败"
            log_info "响应: $UPLOAD_RESPONSE"
        fi
    fi
else
    log_info "跳过自动上传（API 凭据未配置或为 Beta 环境）"
fi

# 清理构建目录
log_info "清理构建目录..."
rm -rf "$BUILD_DIR"

# 显示成功信息和后续步骤
echo
log_success "Chrome Web Store 发布包准备完成!"
echo
log_info "发布包信息:"
echo "  文件: $DIST_DIR/$ZIP_NAME"
echo "  大小: $ZIP_SIZE"
echo "  版本: $VERSION"
echo "  环境: $ENVIRONMENT"
echo
log_info "后续步骤:"
if [ "$ENVIRONMENT" = "production" ]; then
    echo "1. 访问 Chrome Web Store 开发者控制台"
    echo "   https://chrome.google.com/webstore/developer/dashboard"
    echo "2. 上传 $ZIP_NAME 文件（如果未自动上传）"
    echo "3. 填写发布说明和更新描述"
    echo "4. 提交审核"
    echo "5. 等待审核通过（通常 1-3 个工作日）"
else
    echo "1. 这是 Beta 版本，用于内部测试"
    echo "2. 可以通过开发者模式加载测试"
    echo "3. 或上传到 Chrome Web Store 作为未发布版本测试"
fi
echo
log_info "相关链接:"
echo "  开发者控制台: https://chrome.google.com/webstore/developer/dashboard"
echo "  发布指南: https://developer.chrome.com/docs/webstore/publish/"
echo "  API 文档: https://developer.chrome.com/docs/webstore/using_webstore_api/"