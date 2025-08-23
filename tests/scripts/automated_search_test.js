/**
 * rVim 搜索功能自动化测试脚本
 * 包含功能验证、性能评估和用户体验检查
 */

class SearchFunctionTester {
    constructor() {
        this.testResults = {
            functional: [],
            performance: [],
            userExperience: []
        };
        this.startTime = null;
        this.performanceMetrics = {
            searchResponseTimes: [],
            memoryUsage: [],
            cpuUsage: []
        };
    }

    // 工具函数：等待指定时间
    async wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // 工具函数：模拟按键事件
    simulateKeyPress(key, element = document) {
        const event = new KeyboardEvent('keydown', {
            key: key,
            code: key,
            keyCode: key.charCodeAt(0),
            which: key.charCodeAt(0),
            bubbles: true,
            cancelable: true
        });
        element.dispatchEvent(event);
    }

    // 工具函数：模拟输入文本
    simulateTextInput(text, element) {
        element.value = text;
        const inputEvent = new Event('input', { bubbles: true });
        element.dispatchEvent(inputEvent);
    }

    // 工具函数：获取性能指标
    getPerformanceMetrics() {
        const memory = performance.memory ? {
            usedJSHeapSize: performance.memory.usedJSHeapSize,
            totalJSHeapSize: performance.memory.totalJSHeapSize,
            jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
        } : null;
        
        return {
            timestamp: Date.now(),
            memory: memory,
            timing: performance.now()
        };
    }

    // 功能测试：基础搜索功能
    async testBasicSearchFunction() {
        console.log('🔍 开始基础搜索功能测试...');
        
        const tests = [
            {
                name: 'F001 - 正向搜索功能',
                test: async () => {
                    this.simulateKeyPress('/');
                    await this.wait(100);
                    
                    const commandBar = document.getElementById('rVim-command-bar');
                    const commandInput = document.getElementById('rVim-command-bar-input');
                    
                    if (!commandBar || !commandInput) {
                        throw new Error('搜索框未正确显示');
                    }
                    
                    this.simulateTextInput('test', commandInput);
                    await this.wait(200);
                    
                    // 检查是否有高亮结果
                    const highlights = document.querySelectorAll('.rVim-find-mark');
                    if (highlights.length === 0) {
                        throw new Error('未找到高亮的搜索结果');
                    }
                    
                    return `找到 ${highlights.length} 个匹配结果`;
                }
            },
            {
                name: 'F002 - 反向搜索功能',
                test: async () => {
                    // 清除之前的搜索
                    this.simulateKeyPress('Escape');
                    await this.wait(100);
                    
                    this.simulateKeyPress('?');
                    await this.wait(100);
                    
                    const commandInput = document.getElementById('rVim-command-bar-input');
                    if (!commandInput) {
                        throw new Error('反向搜索框未显示');
                    }
                    
                    this.simulateTextInput('测试', commandInput);
                    await this.wait(200);
                    
                    const highlights = document.querySelectorAll('.rVim-find-mark');
                    return `反向搜索找到 ${highlights.length} 个匹配结果`;
                }
            },
            {
                name: 'F003 - 搜索结果导航',
                test: async () => {
                    // 先执行搜索
                    this.simulateKeyPress('/');
                    await this.wait(100);
                    
                    const commandInput = document.getElementById('rVim-command-bar-input');
                    this.simulateTextInput('test', commandInput);
                    await this.wait(200);
                    
                    // 按回车确认搜索
                    this.simulateKeyPress('Enter');
                    await this.wait(100);
                    
                    // 测试 n 键导航
                    const initialIndex = Find.index;
                    this.simulateKeyPress('n');
                    await this.wait(100);
                    
                    if (Find.index === initialIndex && Find.matches.length > 1) {
                        throw new Error('n 键导航未正常工作');
                    }
                    
                    // 测试 N 键导航
                    this.simulateKeyPress('N');
                    await this.wait(100);
                    
                    return '搜索结果导航功能正常';
                }
            }
        ];
        
        for (const test of tests) {
            try {
                const result = await test.test();
                this.testResults.functional.push({
                    name: test.name,
                    status: 'PASS',
                    result: result,
                    timestamp: new Date().toISOString()
                });
                console.log(`✅ ${test.name}: ${result}`);
            } catch (error) {
                this.testResults.functional.push({
                    name: test.name,
                    status: 'FAIL',
                    error: error.message,
                    timestamp: new Date().toISOString()
                });
                console.log(`❌ ${test.name}: ${error.message}`);
            }
        }
    }

    // 功能测试：搜索状态显示
    async testSearchStatusDisplay() {
        console.log('📊 开始搜索状态显示测试...');
        
        const tests = [
            {
                name: 'F004 - HUD 位置显示',
                test: async () => {
                    this.simulateKeyPress('/');
                    await this.wait(100);
                    
                    const commandInput = document.getElementById('rVim-command-bar-input');
                    this.simulateTextInput('test', commandInput);
                    await this.wait(200);
                    
                    const hud = document.getElementById('rVim-hud');
                    if (!hud) {
                        throw new Error('HUD 元素未找到');
                    }
                    
                    const hudStyle = window.getComputedStyle(hud);
                    const position = hudStyle.position;
                    const right = hudStyle.right;
                    const bottom = hudStyle.bottom;
                    
                    if (position !== 'fixed') {
                        throw new Error(`HUD 定位错误: ${position}`);
                    }
                    
                    return `HUD 正确定位: position=${position}, right=${right}, bottom=${bottom}`;
                }
            },
            {
                name: 'F005 - 无匹配结果处理',
                test: async () => {
                    this.simulateKeyPress('/');
                    await this.wait(100);
                    
                    const commandInput = document.getElementById('rVim-command-bar-input');
                    this.simulateTextInput('不存在的词汇xyz123', commandInput);
                    await this.wait(200);
                    
                    const hud = document.getElementById('rVim-hud');
                    if (!hud) {
                        throw new Error('HUD 未显示');
                    }
                    
                    const hudText = hud.textContent;
                    if (!hudText.includes('No matches')) {
                        throw new Error(`HUD 文本错误: ${hudText}`);
                    }
                    
                    return `正确显示无匹配结果: ${hudText}`;
                }
            },
            {
                name: 'F006 - 搜索状态实时更新',
                test: async () => {
                    this.simulateKeyPress('/');
                    await this.wait(100);
                    
                    const commandInput = document.getElementById('rVim-command-bar-input');
                    
                    // 逐步输入，检查状态更新
                    this.simulateTextInput('t', commandInput);
                    await this.wait(100);
                    
                    let hud = document.getElementById('rVim-hud');
                    const firstUpdate = hud ? hud.textContent : '';
                    
                    this.simulateTextInput('te', commandInput);
                    await this.wait(100);
                    
                    hud = document.getElementById('rVim-hud');
                    const secondUpdate = hud ? hud.textContent : '';
                    
                    this.simulateTextInput('test', commandInput);
                    await this.wait(100);
                    
                    hud = document.getElementById('rVim-hud');
                    const finalUpdate = hud ? hud.textContent : '';
                    
                    return `状态实时更新: "${firstUpdate}" → "${secondUpdate}" → "${finalUpdate}"`;
                }
            }
        ];
        
        for (const test of tests) {
            try {
                const result = await test.test();
                this.testResults.functional.push({
                    name: test.name,
                    status: 'PASS',
                    result: result,
                    timestamp: new Date().toISOString()
                });
                console.log(`✅ ${test.name}: ${result}`);
            } catch (error) {
                this.testResults.functional.push({
                    name: test.name,
                    status: 'FAIL',
                    error: error.message,
                    timestamp: new Date().toISOString()
                });
                console.log(`❌ ${test.name}: ${error.message}`);
            }
        }
    }

    // 性能测试：响应时间
    async testPerformance() {
        console.log('⚡ 开始性能测试...');
        
        const tests = [
            {
                name: 'P001 - 搜索响应时间',
                test: async () => {
                    const iterations = 10;
                    const responseTimes = [];
                    
                    for (let i = 0; i < iterations; i++) {
                        const startTime = performance.now();
                        
                        this.simulateKeyPress('/');
                        await this.wait(10);
                        
                        const commandInput = document.getElementById('rVim-command-bar-input');
                        this.simulateTextInput(`test${i}`, commandInput);
                        
                        // 等待搜索完成
                        await this.wait(50);
                        
                        const endTime = performance.now();
                        const responseTime = endTime - startTime;
                        responseTimes.push(responseTime);
                        
                        // 清除搜索
                        this.simulateKeyPress('Escape');
                        await this.wait(50);
                    }
                    
                    const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
                    const maxResponseTime = Math.max(...responseTimes);
                    const minResponseTime = Math.min(...responseTimes);
                    
                    this.performanceMetrics.searchResponseTimes = responseTimes;
                    
                    if (avgResponseTime > 100) {
                        throw new Error(`平均响应时间过长: ${avgResponseTime.toFixed(2)}ms`);
                    }
                    
                    return `平均响应时间: ${avgResponseTime.toFixed(2)}ms (最小: ${minResponseTime.toFixed(2)}ms, 最大: ${maxResponseTime.toFixed(2)}ms)`;
                }
            },
            {
                name: 'P002 - 大文档搜索性能',
                test: async () => {
                    // 创建大量文本内容
                    const largeContent = 'test '.repeat(1000) + '测试 '.repeat(1000);
                    const testDiv = document.createElement('div');
                    testDiv.innerHTML = largeContent;
                    testDiv.style.display = 'none';
                    document.body.appendChild(testDiv);
                    
                    const startTime = performance.now();
                    
                    this.simulateKeyPress('/');
                    await this.wait(10);
                    
                    const commandInput = document.getElementById('rVim-command-bar-input');
                    this.simulateTextInput('test', commandInput);
                    
                    await this.wait(200);
                    
                    const endTime = performance.now();
                    const responseTime = endTime - startTime;
                    
                    // 清理
                    document.body.removeChild(testDiv);
                    this.simulateKeyPress('Escape');
                    
                    if (responseTime > 500) {
                        throw new Error(`大文档搜索时间过长: ${responseTime.toFixed(2)}ms`);
                    }
                    
                    return `大文档搜索时间: ${responseTime.toFixed(2)}ms`;
                }
            },
            {
                name: 'P004 - 内存使用监控',
                test: async () => {
                    if (!performance.memory) {
                        return '浏览器不支持内存监控';
                    }
                    
                    const initialMemory = performance.memory.usedJSHeapSize;
                    
                    // 执行多次搜索操作
                    for (let i = 0; i < 20; i++) {
                        this.simulateKeyPress('/');
                        await this.wait(10);
                        
                        const commandInput = document.getElementById('rVim-command-bar-input');
                        this.simulateTextInput(`search${i}`, commandInput);
                        await this.wait(50);
                        
                        this.simulateKeyPress('Escape');
                        await this.wait(10);
                    }
                    
                    const finalMemory = performance.memory.usedJSHeapSize;
                    const memoryIncrease = finalMemory - initialMemory;
                    const memoryIncreaseKB = memoryIncrease / 1024;
                    
                    this.performanceMetrics.memoryUsage.push({
                        initial: initialMemory,
                        final: finalMemory,
                        increase: memoryIncrease
                    });
                    
                    if (memoryIncreaseKB > 1024) { // 超过 1MB 认为可能有内存泄漏
                        throw new Error(`可能存在内存泄漏: 增加 ${memoryIncreaseKB.toFixed(2)}KB`);
                    }
                    
                    return `内存使用正常: 增加 ${memoryIncreaseKB.toFixed(2)}KB`;
                }
            }
        ];
        
        for (const test of tests) {
            try {
                const result = await test.test();
                this.testResults.performance.push({
                    name: test.name,
                    status: 'PASS',
                    result: result,
                    timestamp: new Date().toISOString()
                });
                console.log(`✅ ${test.name}: ${result}`);
            } catch (error) {
                this.testResults.performance.push({
                    name: test.name,
                    status: 'FAIL',
                    error: error.message,
                    timestamp: new Date().toISOString()
                });
                console.log(`❌ ${test.name}: ${error.message}`);
            }
        }
    }

    // 用户体验测试
    async testUserExperience() {
        console.log('👤 开始用户体验测试...');
        
        const tests = [
            {
                name: 'U001 - HUD 可见性',
                test: async () => {
                    this.simulateKeyPress('/');
                    await this.wait(100);
                    
                    const commandInput = document.getElementById('rVim-command-bar-input');
                    this.simulateTextInput('test', commandInput);
                    await this.wait(200);
                    
                    const hud = document.getElementById('rVim-hud');
                    if (!hud) {
                        throw new Error('HUD 未显示');
                    }
                    
                    const hudStyle = window.getComputedStyle(hud);
                    const backgroundColor = hudStyle.backgroundColor;
                    const color = hudStyle.color;
                    const fontSize = hudStyle.fontSize;
                    const zIndex = hudStyle.zIndex;
                    
                    // 检查样式是否合理
                    if (parseInt(zIndex) < 1000) {
                        throw new Error(`z-index 过低: ${zIndex}`);
                    }
                    
                    return `HUD 样式良好: 背景=${backgroundColor}, 文字=${color}, 字体=${fontSize}, z-index=${zIndex}`;
                }
            },
            {
                name: 'U002 - 搜索框样式',
                test: async () => {
                    this.simulateKeyPress('/');
                    await this.wait(100);
                    
                    const commandBar = document.getElementById('rVim-command-bar');
                    const commandInput = document.getElementById('rVim-command-bar-input');
                    
                    if (!commandBar || !commandInput) {
                        throw new Error('搜索框元素未找到');
                    }
                    
                    const barStyle = window.getComputedStyle(commandBar);
                    const inputStyle = window.getComputedStyle(commandInput);
                    
                    const barBg = barStyle.backgroundColor;
                    const barBorder = barStyle.border;
                    const inputFont = inputStyle.fontFamily;
                    
                    return `搜索框样式: 背景=${barBg}, 边框=${barBorder}, 字体=${inputFont}`;
                }
            },
            {
                name: 'U003 - 高亮效果',
                test: async () => {
                    this.simulateKeyPress('/');
                    await this.wait(100);
                    
                    const commandInput = document.getElementById('rVim-command-bar-input');
                    this.simulateTextInput('test', commandInput);
                    await this.wait(200);
                    
                    const highlights = document.querySelectorAll('.rVim-find-mark');
                    if (highlights.length === 0) {
                        throw new Error('未找到高亮元素');
                    }
                    
                    const firstHighlight = highlights[0];
                    const highlightStyle = window.getComputedStyle(firstHighlight);
                    const backgroundColor = highlightStyle.backgroundColor;
                    
                    return `高亮效果良好: ${highlights.length} 个高亮元素, 背景色=${backgroundColor}`;
                }
            },
            {
                name: 'U004 - 键盘响应',
                test: async () => {
                    const keys = ['/', '?', 'n', 'N', 'Escape'];
                    const responseTimes = [];
                    
                    for (const key of keys) {
                        const startTime = performance.now();
                        this.simulateKeyPress(key);
                        await this.wait(10);
                        const endTime = performance.now();
                        
                        responseTimes.push({
                            key: key,
                            time: endTime - startTime
                        });
                        
                        await this.wait(50);
                    }
                    
                    const avgResponseTime = responseTimes.reduce((sum, item) => sum + item.time, 0) / responseTimes.length;
                    
                    if (avgResponseTime > 50) {
                        throw new Error(`键盘响应过慢: ${avgResponseTime.toFixed(2)}ms`);
                    }
                    
                    return `键盘响应良好: 平均 ${avgResponseTime.toFixed(2)}ms`;
                }
            }
        ];
        
        for (const test of tests) {
            try {
                const result = await test.test();
                this.testResults.userExperience.push({
                    name: test.name,
                    status: 'PASS',
                    result: result,
                    timestamp: new Date().toISOString()
                });
                console.log(`✅ ${test.name}: ${result}`);
            } catch (error) {
                this.testResults.userExperience.push({
                    name: test.name,
                    status: 'FAIL',
                    error: error.message,
                    timestamp: new Date().toISOString()
                });
                console.log(`❌ ${test.name}: ${error.message}`);
            }
        }
    }

    // 生成测试报告
    generateReport() {
        const totalTests = this.testResults.functional.length + 
                          this.testResults.performance.length + 
                          this.testResults.userExperience.length;
        
        const passedTests = [...this.testResults.functional, ...this.testResults.performance, ...this.testResults.userExperience]
                           .filter(test => test.status === 'PASS').length;
        
        const failedTests = totalTests - passedTests;
        const successRate = ((passedTests / totalTests) * 100).toFixed(2);
        
        const report = {
            summary: {
                totalTests: totalTests,
                passedTests: passedTests,
                failedTests: failedTests,
                successRate: successRate + '%',
                testDate: new Date().toISOString()
            },
            functional: this.testResults.functional,
            performance: this.testResults.performance,
            userExperience: this.testResults.userExperience,
            performanceMetrics: this.performanceMetrics
        };
        
        return report;
    }

    // 运行所有测试
    async runAllTests() {
        console.log('🚀 开始 rVim 搜索功能综合测试...');
        console.log('=' .repeat(50));
        
        this.startTime = Date.now();
        
        try {
            await this.testBasicSearchFunction();
            await this.wait(500);
            
            await this.testSearchStatusDisplay();
            await this.wait(500);
            
            await this.testPerformance();
            await this.wait(500);
            
            await this.testUserExperience();
            
            const endTime = Date.now();
            const totalTime = endTime - this.startTime;
            
            console.log('=' .repeat(50));
            console.log(`🏁 测试完成，总耗时: ${totalTime}ms`);
            
            const report = this.generateReport();
            console.log('📊 测试报告:', report);
            
            return report;
            
        } catch (error) {
            console.error('❌ 测试执行失败:', error);
            throw error;
        }
    }
}

// 导出测试类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SearchFunctionTester;
} else {
    window.SearchFunctionTester = SearchFunctionTester;
}

// 如果直接运行，执行测试
if (typeof window !== 'undefined' && window.location) {
    // 等待页面加载完成后自动运行测试
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(() => {
                const tester = new SearchFunctionTester();
                window.searchTester = tester;
                console.log('🔧 搜索功能测试器已准备就绪');
                console.log('💡 使用 window.searchTester.runAllTests() 开始测试');
            }, 1000);
        });
    } else {
        setTimeout(() => {
            const tester = new SearchFunctionTester();
            window.searchTester = tester;
            console.log('🔧 搜索功能测试器已准备就绪');
            console.log('💡 使用 window.searchTester.runAllTests() 开始测试');
        }, 1000);
    }
}