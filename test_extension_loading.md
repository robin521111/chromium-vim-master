# rVim 扩展本地加载测试指南

## 前置检查清单

### ✅ 文件完整性检查
- [x] manifest.json 语法正确
- [x] 所有必需图标文件存在 (16.png, 19.png, 38.png, 48.png, 128.png)
- [x] Service Worker 文件存在且语法正确
- [x] 所有 background scripts 文件存在且语法正确
- [x] 所有 content scripts 文件存在且语法正确
- [x] 所有 HTML 页面文件存在且语法正确
- [x] cmdline_frame.html 文件存在 (web_accessible_resources)

### ✅ 代码质量检查
- [x] 所有 JavaScript 文件语法检查通过
- [x] 单元测试全部通过 (107个测试用例)
- [x] Manifest V3 规范兼容性
- [x] 权限声明合理性

## 在 Chrome 中加载扩展

### 方法1: 手动加载
1. 打开 Chrome 浏览器
2. 访问 `chrome://extensions/`
3. 开启右上角的「开发者模式」
4. 点击「加载已解压的扩展程序」
5. 选择项目根目录: `/Users/robin/Documents/codeforfun/chromium-vim-master`
6. 确认加载

### 方法2: 命令行加载 (已执行)
```bash
open -a "Google Chrome" --args --load-extension="$(pwd)"
```

## 功能验证测试

### 基础功能测试
1. **扩展图标**: 检查浏览器工具栏是否显示 rVim 图标
2. **弹出窗口**: 点击图标查看弹出窗口是否正常显示
3. **选项页面**: 右键图标 → 选项，检查设置页面
4. **键盘绑定**: 在任意网页测试基本 Vim 键盘操作

### 核心功能测试
- `j/k` - 上下滚动
- `h/l` - 左右滚动
- `gg/G` - 页面顶部/底部
- `f` - 链接提示模式
- `/` - 搜索模式
- `t` - 新标签页
- `x` - 关闭标签页

### Service Worker 测试
1. 打开 `chrome://extensions/`
2. 找到 rVim 扩展
3. 点击「Service Worker」链接
4. 检查控制台是否有错误信息

## 常见问题排查

### 如果扩展无法加载
1. 检查 manifest.json 语法
2. 确认所有文件路径正确
3. 查看 Chrome 扩展页面的错误信息
4. 检查 Service Worker 控制台错误

### 如果功能异常
1. 检查网页控制台错误
2. 验证内容脚本是否正确注入
3. 确认权限是否足够
4. 测试不同网站的兼容性

## 扩展信息
- **名称**: rVim
- **版本**: 1.2.99
- **Manifest 版本**: 3
- **权限**: tabs, history, bookmarks, storage, sessions, downloads, topSites, downloads.shelf, clipboardRead, clipboardWrite, webNavigation, scripting
- **主机权限**: <all_urls>

## 测试结果
✅ 所有预检查项目通过  
✅ 代码语法检查通过  
✅ 单元测试通过  
✅ 扩展已准备好在本地加载测试