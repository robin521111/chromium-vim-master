/**
 * rVim 扩展功能测试执行脚本
 * 用于自动化测试和记录测试结果
 */

class rVimTester {
    constructor() {
        this.testResults = {};
        this.currentTest = null;
        this.testStartTime = null;
        this.extensionLoaded = false;
        this.init();
    }

    init() {
        console.log('🚀 rVim 测试器初始化中...');
        this.checkExtensionStatus();
        this.setupEventListeners();
        this.displayTestInstructions();
    }

    checkExtensionStatus() {
        const indicators = [
            { name: 'Find', obj: 'window.Find' },
            { name: 'Settings', obj: 'window.settings' },
            { name: 'HUD', obj: 'window.HUD' },
            { name: 'Command', obj: 'window.Command' },
            { name: 'Mappings', obj: 'window.Mappings' }
        ];

        let loadedCount = 0;
        const results = [];

        indicators.forEach(indicator => {
            try {
                const exists = eval(indicator.obj);
                if (exists) {
                    loadedCount++;
                    results.push(`✅ ${indicator.name}: 已加载`);
                } else {
                    results.push(`❌ ${indicator.name}: 未找到`);
                }
            } catch (e) {
                results.push(`❌ ${indicator.name}: 错误 - ${e.message}`);
            }
        });

        console.log('📊 扩展状态检查结果:');
        results.forEach(result => console.log(result));

        this.extensionLoaded = loadedCount > 0;
        
        if (this.extensionLoaded) {
            console.log(`🎉 rVim 扩展检测成功! (${loadedCount}/${indicators.length} 组件已加载)`);
            this.updateExtensionStatus('loaded');
        } else {
            console.log('⚠️ rVim 扩展未检测到。请检查扩展是否已安装并启用。');
            this.updateExtensionStatus('not-loaded');
        }

        return this.extensionLoaded;
    }

    updateExtensionStatus(status) {
        const statusElement = document.getElementById('extension-status');
        if (statusElement) {
            if (status === 'loaded') {
                statusElement.innerHTML = '🟢 扩展已加载';
                statusElement.className = 'status loaded';
            } else {
                statusElement.innerHTML = '🔴 扩展未加载';
                statusElement.className = 'status not-loaded';
            }
        }
    }

    setupEventListeners() {
        // 监听键盘事件
        document.addEventListener('keydown', (e) => {
            if (!e.target.matches('input, textarea')) {
                this.logKeyPress(e);
            }
        });

        // 监听页面滚动
        let scrollTimeout;
        window.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                this.logScrollPosition();
            }, 100);
        });
    }

    logKeyPress(e) {
        const keyInfo = {
            key: e.key,
            code: e.code,
            ctrl: e.ctrlKey,
            shift: e.shiftKey,
            alt: e.altKey,
            timestamp: Date.now()
        };
        
        console.log('⌨️ 按键:', keyInfo);
        
        // 检测特定的 rVim 快捷键
        this.detectrVimShortcuts(keyInfo);
    }

    detectrVimShortcuts(keyInfo) {
        const shortcuts = {
            'h': '向左滚动',
            'j': '向下滚动', 
            'k': '向上滚动',
            'l': '向右滚动',
            'd': '向下半页',
            'u': '向上半页',
            'f': '链接提示',
            'F': '新标签页链接提示',
            '/': '搜索',
            'n': '下一个搜索结果',
            'N': '上一个搜索结果',
            't': '新标签页',
            'x': '关闭标签页',
            'J': '上一个标签页',
            'K': '下一个标签页',
            ':': '命令模式',
            'v': '视觉模式',
            'y': '复制',
            'i': '插入模式',
            'Escape': '退出模式'
        };

        if (shortcuts[keyInfo.key]) {
            console.log(`🎯 检测到 rVim 快捷键: ${keyInfo.key} (${shortcuts[keyInfo.key]})`);
            this.recordShortcutUsage(keyInfo.key, shortcuts[keyInfo.key]);
        }
    }

    logScrollPosition() {
        const scrollInfo = {
            scrollTop: window.pageYOffset,
            scrollLeft: window.pageXOffset,
            documentHeight: document.documentElement.scrollHeight,
            windowHeight: window.innerHeight,
            timestamp: Date.now()
        };
        
        console.log('📜 滚动位置:', scrollInfo);
    }

    recordShortcutUsage(key, description) {
        if (!this.testResults.shortcuts) {
            this.testResults.shortcuts = {};
        }
        
        if (!this.testResults.shortcuts[key]) {
            this.testResults.shortcuts[key] = {
                description,
                usageCount: 0,
                lastUsed: null
            };
        }
        
        this.testResults.shortcuts[key].usageCount++;
        this.testResults.shortcuts[key].lastUsed = Date.now();
    }

    startTest(testName) {
        this.currentTest = testName;
        this.testStartTime = Date.now();
        console.log(`🧪 开始测试: ${testName}`);
        
        if (!this.testResults.tests) {
            this.testResults.tests = {};
        }
        
        this.testResults.tests[testName] = {
            status: 'running',
            startTime: this.testStartTime,
            endTime: null,
            duration: null,
            notes: []
        };
    }

    endTest(testName, status = 'completed', notes = []) {
        if (this.testResults.tests && this.testResults.tests[testName]) {
            const endTime = Date.now();
            this.testResults.tests[testName].status = status;
            this.testResults.tests[testName].endTime = endTime;
            this.testResults.tests[testName].duration = endTime - this.testResults.tests[testName].startTime;
            this.testResults.tests[testName].notes = notes;
            
            console.log(`✅ 测试完成: ${testName} (${status}) - 耗时: ${this.testResults.tests[testName].duration}ms`);
        }
        
        if (this.currentTest === testName) {
            this.currentTest = null;
            this.testStartTime = null;
        }
    }

    addTestNote(note) {
        if (this.currentTest && this.testResults.tests && this.testResults.tests[this.currentTest]) {
            this.testResults.tests[this.currentTest].notes.push({
                timestamp: Date.now(),
                note: note
            });
            console.log(`📝 测试备注 (${this.currentTest}): ${note}`);
        }
    }

    displayTestInstructions() {
        console.log(`
📋 rVim 扩展测试说明:

1. 基础导航测试:
   - 按 h/j/k/l 测试方向滚动
   - 按 gg 跳转到顶部，G 跳转到底部
   - 按 d/u 测试半页滚动

2. 链接提示测试:
   - 按 f 显示链接提示
   - 按 F 在新标签页打开链接

3. 搜索功能测试:
   - 按 / 开始搜索
   - 输入关键词后按回车
   - 使用 n/N 在结果间导航

4. 标签页管理测试:
   - 按 t 新建标签页
   - 按 x 关闭标签页
   - 按 J/K 切换标签页

5. 命令模式测试:
   - 按 : 打开命令栏
   - 输入 open/tabopen 命令

6. 视觉模式测试:
   - 按 v 进入视觉模式
   - 选择文本后按 y 复制

使用 tester.getResults() 查看测试结果
使用 tester.startTest('测试名称') 开始特定测试
使用 tester.endTest('测试名称', '状态') 结束测试
`);
    }

    getResults() {
        return {
            extensionLoaded: this.extensionLoaded,
            testResults: this.testResults,
            summary: this.generateSummary()
        };
    }

    generateSummary() {
        const summary = {
            totalTests: 0,
            completedTests: 0,
            passedTests: 0,
            failedTests: 0,
            shortcutsUsed: 0,
            totalDuration: 0
        };

        if (this.testResults.tests) {
            Object.values(this.testResults.tests).forEach(test => {
                summary.totalTests++;
                if (test.status === 'completed' || test.status === 'passed') {
                    summary.completedTests++;
                    summary.passedTests++;
                } else if (test.status === 'failed') {
                    summary.completedTests++;
                    summary.failedTests++;
                }
                if (test.duration) {
                    summary.totalDuration += test.duration;
                }
            });
        }

        if (this.testResults.shortcuts) {
            summary.shortcutsUsed = Object.keys(this.testResults.shortcuts).length;
        }

        return summary;
    }

    exportResults() {
        const results = this.getResults();
        const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `rvim-test-results-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        console.log('📁 测试结果已导出');
    }

    // 自动化测试序列
    async runAutomatedTests() {
        console.log('🤖 开始自动化测试序列...');
        
        // 测试扩展加载
        this.startTest('扩展加载检查');
        const extensionStatus = this.checkExtensionStatus();
        this.endTest('扩展加载检查', extensionStatus ? 'passed' : 'failed');
        
        if (!extensionStatus) {
            console.log('❌ 扩展未加载，跳过后续测试');
            return;
        }
        
        // 等待用户手动测试
        console.log('⏳ 请手动执行各项功能测试，测试器将自动记录结果');
        console.log('💡 提示: 使用 tester.startTest() 和 tester.endTest() 来标记测试进度');
    }
}

// 创建全局测试器实例
window.tester = new rVimTester();

// 页面加载完成后自动开始测试
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            window.tester.runAutomatedTests();
        }, 1000);
    });
} else {
    setTimeout(() => {
        window.tester.runAutomatedTests();
    }, 1000);
}

// 导出测试器到控制台
console.log('🎯 rVim 测试器已加载! 使用 window.tester 访问测试功能');
console.log('📖 常用命令:');
console.log('  - tester.getResults() - 查看测试结果');
console.log('  - tester.startTest("测试名") - 开始测试');
console.log('  - tester.endTest("测试名", "状态") - 结束测试');
console.log('  - tester.exportResults() - 导出测试结果');
console.log('  - tester.checkExtensionStatus() - 检查扩展状态');