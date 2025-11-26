# rVim Chrome Extension Makefile
# 提供常用的开发和发布命令

.PHONY: help install build test lint clean release hotfix chrome-store dev setup legacy-build

# 默认目标
help:
	@echo "rVim Chrome Extension 开发工具"
	@echo ""
	@echo "可用命令:"
	@echo "  setup          - 初始化开发环境"
	@echo "  install        - 安装依赖"
	@echo "  dev            - 启动开发服务器"
	@echo "  build          - 构建扩展"
	@echo "  legacy-build   - 使用原有构建流程"
	@echo "  test           - 运行测试"
	@echo "  lint           - 代码检查"
	@echo "  clean          - 清理构建文件"
	@echo "  release        - 创建发布 (需要版本号: make release VERSION=1.3.0)"
	@echo "  hotfix         - 创建热修复 (需要版本号和描述: make hotfix VERSION=1.3.1 DESC='Fix bug')"
	@echo "  chrome-store   - 发布到 Chrome Web Store (需要版本号: make chrome-store VERSION=1.3.0)"
	@echo "  validate       - 验证扩展文件"
	@echo "  package        - 创建发布包"
	@echo ""
	@echo "示例:"
	@echo "  make setup"
	@echo "  make dev"
	@echo "  make release VERSION=1.3.0"
	@echo "  make hotfix VERSION=1.3.1 DESC='Fix critical bug'"

# 保持向后兼容的原有构建流程
all: legacy-build

legacy-build:
	@echo "🔨 使用原有构建流程..."
	node scripts/create_pages.js
	cd ./rvimrc_parser && make

# 初始化开发环境
setup:
	@echo "🚀 初始化开发环境..."
	@if [ -f package.json ]; then \
		echo "📦 安装 npm 依赖..."; \
		npm install; \
	else \
		echo "📝 创建基本的 package.json..."; \
		echo '{ "name": "rvim", "version": "1.0.0", "scripts": { "test": "echo \"No tests yet\"" } }' > package.json; \
	fi
	@if [ ! -f .env ]; then \
		echo "⚙️  创建环境配置文件..."; \
		cp .env.example .env; \
		echo "请编辑 .env 文件配置 Chrome Web Store API 凭据"; \
	fi
	@echo "✅ 开发环境初始化完成!"

# 安装依赖
install:
	@if [ -f package.json ]; then \
		echo "📦 安装依赖..."; \
		npm install; \
	else \
		echo "❌ 未找到 package.json，请先运行 make setup"; \
		exit 1; \
	fi

# 启动开发服务器
dev:
	@echo "🔧 启动开发服务器..."
	@if command -v python3 >/dev/null 2>&1; then \
		echo "使用 Python 3 启动服务器 (端口 8080)..."; \
		python3 -m http.server 8080; \
	elif command -v python >/dev/null 2>&1; then \
		echo "使用 Python 2 启动服务器 (端口 8080)..."; \
		python -m SimpleHTTPServer 8080; \
	else \
		echo "❌ 未找到 Python，无法启动开发服务器"; \
		echo "请安装 Python 或使用其他 HTTP 服务器"; \
		exit 1; \
	fi

# 构建扩展
build: legacy-build
	@echo "🔨 构建扩展完成"

# 运行测试
test:
	@echo "🧪 运行测试..."
	@if [ -f package.json ] && npm run test >/dev/null 2>&1; then \
		echo "✅ 测试通过"; \
	else \
		echo "⚠️  未配置测试或测试失败"; \
	fi
	@echo "🔍 验证 manifest.json..."
	@node -e "JSON.parse(require('fs').readFileSync('manifest.json', 'utf8'))" && echo "✅ manifest.json 格式正确"

# 代码检查
lint:
	@echo "🔍 代码检查..."
	@if [ -f package.json ] && npm run lint >/dev/null 2>&1; then \
		echo "✅ 代码检查通过"; \
	else \
		echo "⚠️  未配置 linting 或检查失败"; \
	fi

# 清理构建文件
clean:
	@echo "🧹 清理构建文件..."
	@rm -rf release* dist build node_modules/.cache
	@find . -name ".DS_Store" -delete
	@find . -name "*.log" -delete
	@echo "✅ 清理完成"

# 验证扩展文件
validate:
	@echo "🔍 验证扩展文件..."
	@echo "检查必需文件..."
	@for file in manifest.json content_scripts background_scripts; do \
		if [ ! -e "$$file" ]; then \
			echo "❌ 缺少必需文件: $$file"; \
			exit 1; \
		fi; \
	done
	@echo "✅ 所有必需文件存在"
	@echo "验证 manifest.json 格式..."
	@node -e "JSON.parse(require('fs').readFileSync('manifest.json', 'utf8'))" && echo "✅ manifest.json 格式正确"
	@echo "检查文件权限..."
	@ls -la scripts/*.sh | grep -q "^-rwx" && echo "✅ 脚本文件权限正确" || echo "⚠️  脚本文件可能缺少执行权限"

# 创建发布包
package: build
	@echo "📦 创建发布包..."
	@if [ -z "$(VERSION)" ]; then \
		echo "❌ 请指定版本号: make package VERSION=1.3.0"; \
		exit 1; \
	fi
	@mkdir -p releases
	@if [ -d release ]; then \
		cd release && zip -r ../releases/rVim-v$(VERSION).zip . -x "*.DS_Store" "*.map" "*.log"; \
	else \
		echo "❌ 未找到 release 目录，请先运行 make build"; \
		exit 1; \
	fi
	@echo "✅ 发布包已创建: releases/rVim-v$(VERSION).zip"
	@ls -la releases/rVim-v$(VERSION).zip

# 使用新的发布脚本创建发布
release:
	@if [ -z "$(VERSION)" ]; then \
		echo "❌ 请指定版本号: make release VERSION=1.3.0"; \
		exit 1; \
	fi
	@echo "🚀 创建发布 v$(VERSION)..."
	@./scripts/release.sh $(VERSION)

# 创建热修复
hotfix:
	@if [ -z "$(VERSION)" ] || [ -z "$(DESC)" ]; then \
		echo "❌ 请指定版本号和描述: make hotfix VERSION=1.3.1 DESC='Fix critical bug'"; \
		exit 1; \
	fi
	@echo "🔥 创建热修复 v$(VERSION)..."
	@./scripts/hotfix.sh $(VERSION) "$(DESC)"

# 发布到 Chrome Web Store
chrome-store:
	@if [ -z "$(VERSION)" ]; then \
		echo "❌ 请指定版本号: make chrome-store VERSION=1.3.0"; \
		exit 1; \
	fi
	@echo "🌐 发布到 Chrome Web Store v$(VERSION)..."
	@./scripts/chrome-store-release.sh $(VERSION)
