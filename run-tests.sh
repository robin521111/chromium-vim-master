#!/bin/bash

# rVim 扩展测试运行脚本
# 使用方法: ./run-tests.sh [test-type]
# test-type 可以是: unit, html, scripts, all

set -e

TEST_TYPE=${1:-all}
PORT=8080

echo "🧪 rVim 扩展测试运行器"
echo "==================="

case $TEST_TYPE in
  "unit")
    echo "📋 运行单元测试..."
    npm test
    ;;
  "html")
    echo "🌐 启动HTML测试服务器..."
    echo "请在浏览器中访问: http://localhost:$PORT/tests/html/test_pages_index.html"
    python3 -m http.server $PORT
    ;;
  "scripts")
    echo "🤖 运行自动化测试脚本..."
    node tests/scripts/run_comprehensive_tests.js
    ;;
  "all")
    echo "🔄 运行所有测试..."
    echo
    echo "1️⃣ 运行单元测试:"
    npm test
    echo
    echo "2️⃣ 运行自动化脚本测试:"
    node tests/scripts/run_comprehensive_tests.js
    echo
    echo "3️⃣ HTML测试需要手动运行:"
    echo "   启动服务器: python3 -m http.server $PORT"
    echo "   访问: http://localhost:$PORT/tests/html/test_pages_index.html"
    ;;
  *)
    echo "❌ 未知的测试类型: $TEST_TYPE"
    echo "可用选项: unit, html, scripts, all"
    echo
    echo "使用示例:"
    echo "  ./run-tests.sh unit     # 运行单元测试"
    echo "  ./run-tests.sh html     # 启动HTML测试服务器"
    echo "  ./run-tests.sh scripts  # 运行自动化脚本"
    echo "  ./run-tests.sh all      # 运行所有测试"
    exit 1
    ;;
esac

echo
echo "✅ 测试完成!"