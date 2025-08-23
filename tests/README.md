# 测试文件目录结构

本目录包含了 rVim 扩展的所有测试文件，按功能分类整理。

## 目录结构

### `/html` - HTML测试页面
包含各种功能测试的HTML页面：
- `comprehensive_test_suite.html` - 综合测试套件
- `search_test.html` - 搜索功能测试
- `visual_mode_test.html` - 可视模式测试
- `command_mode_test.html` - 命令模式测试
- `test_functionality.html` - 基础功能测试
- `extension_basic_test.html` - 扩展基础测试
- `bookmark_history_test.html` - 书签和历史测试
- `style_conflict_test.html` - 样式冲突测试
- `test_pages_index.html` - 测试页面索引
- 其他专项测试页面

### `/scripts` - JavaScript测试脚本
包含自动化测试和辅助脚本：
- `automated_search_test.js` - 自动化搜索测试
- `run_comprehensive_tests.js` - 综合测试运行器
- `test_execution_script.js` - 测试执行脚本
- `test_pages_manager.js` - 测试页面管理器
- `chrome_test_automation.js` - Chrome自动化测试
- `cleanup_test_pages.js` - 测试页面清理脚本

### `/reports` - 测试报告和文档
包含测试计划、报告和检查清单：
- `comprehensive_test_report.md` - 综合测试报告
- `detailed_test_report.md` - 详细测试报告
- `test_execution_report.md` - 测试执行报告
- `comprehensive_search_test_plan.md` - 搜索测试计划
- `keyboard_shortcuts_test_checklist.md` - 快捷键测试清单
- `test_extension_loading.md` - 扩展加载测试文档

### `/unit` - 单元测试
包含各模块的单元测试：
- `actions.test.js` - 动作模块测试
- `search.test.js` - 搜索模块测试
- `options.test.js` - 选项模块测试
- `utils.test.js` - 工具函数测试
- `cvimrc-parser.test.js` - 配置解析器测试
- `simple.test.js` - 简单测试示例

### `/integration` - 集成测试
预留目录，用于存放集成测试文件

### `/docs` - 测试文档
预留目录，用于存放测试相关文档

## 使用说明

### 运行HTML测试
1. 启动本地服务器：`python3 -m http.server 8080`
2. 在浏览器中访问：`http://localhost:8080/tests/html/test_pages_index.html`
3. 选择要运行的测试页面

### 运行单元测试
```bash
# 安装依赖
npm install

# 运行所有单元测试
npm test

# 运行特定测试文件
npx mocha tests/unit/search.test.js
```

### 运行自动化测试
```bash
# 运行综合测试
node tests/scripts/run_comprehensive_tests.js

# 运行搜索测试
node tests/scripts/automated_search_test.js
```

## 测试文件命名规范

- HTML测试页面：`功能名_test.html`
- JavaScript测试脚本：`功能名_test.js` 或 `功能名.test.js`
- 测试报告：`测试类型_test_report.md`
- 测试计划：`测试类型_test_plan.md`

## 添加新测试

1. **HTML测试页面**：放入 `/html` 目录
2. **单元测试**：放入 `/unit` 目录，使用 `.test.js` 后缀
3. **集成测试**：放入 `/integration` 目录
4. **测试脚本**：放入 `/scripts` 目录
5. **测试报告**：放入 `/reports` 目录

记得更新 `test_pages_index.html` 以包含新的测试页面链接。