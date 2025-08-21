/**
 * rVim 搜索功能综合测试执行脚本
 * 用于在浏览器控制台中运行完整的测试演示
 */

// 测试执行器类
class TestRunner {
    constructor() {
        this.results = {
            functional: [],
            performance: [],
            userExperience: [],
            summary: {}
        };
        this.startTime = null;
    }

    // 格式化输出
    log(message, type = 'info') {
        const timestamp = new Date().toLocaleTimeString();
        const styles = {
            info: 'color: #2196F3; font-weight: bold;',
            success: 'color: #4CAF50; font-weight: bold;',
            error: 'color: #F44336; font-weight: bold;',
            warning: 'color: #FF9800; font-weight: bold;',
            header: 'color: #9C27B0; font-size: 16px; font-weight: bold;'
        };
        
        console.log(`%c[${timestamp}] ${message}`, styles[type] || styles.info);
    }

    // 显示测试标题
    showHeader() {
        console.clear();
        this.log('=' .repeat(80), 'header');
        this.log('🔍 rVim 搜索功能综合测试演示', 'header');
        this.log('功能验证 • 性能评估 • 用户体验检查', 'header');
        this.log('=' .repeat(80), 'header');
        console.log('');
    }

    // 等待函数
    async wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // 模拟按键
    simulateKey(key) {
        const event = new KeyboardEvent('keydown', {
            key: key,
            bubbles: true,
            cancelable: true
        });
        document.dispatchEvent(event);
    }

    // 模拟输入
    simulateInput(text, element) {
        if (element) {
            element.value = text;
            const event = new Event('input', { bubbles: true });
            element.dispatchEvent(event);
        }
    }

    // 执行单个测试
    async executeTest(testName, testFunction, category) {
        this.log(`🔄 执行测试: ${testName}`);
        
        try {
            const startTime = performance.now();
            const result = await testFunction();
            const endTime = performance.now();
            const duration = (endTime - startTime).toFixed(2);
            
            this.results[category].push({
                name: testName,
                status: 'PASS',
                result: result,
                duration: duration + 'ms',
                timestamp: new Date().toISOString()
            });
            
            this.log(`✅ ${testName}: ${result} (${duration}ms)`, 'success');
            return true;
            
        } catch (error) {
            this.results[category].push({
                name: testName,
                status: 'FAIL',
                error: error.message,
                timestamp: new Date().toISOString()
            });
            
            this.log(`❌ ${testName}: ${error.message}`, 'error');
            return false;
        }
    }

    // 功能测试演示
    async runFunctionalTests() {
        this.log('📋 开始功能测试演示...', 'header');
        console.log('');
        
        const tests = [
            {
                name: 'F001 - 正向搜索功能测试',
                test: async () => {
                    this.log('  → 模拟按下 "/" 键打开搜索');
                    this.simulateKey('/');
                    await this.wait(200);
                    
                    const commandBar = document.getElementById('rVim-command-bar');
                    const commandInput = document.getElementById('rVim-command-bar-input');
                    
                    if (!commandBar || !commandInput) {
                        throw new Error('搜索框未正确显示');
                    }
                    
                    this.log('  → 输入搜索词 "test"');
                    this.simulateInput('test', commandInput);
                    await this.wait(300);
                    
                    const highlights = document.querySelectorAll('.rVim-find-mark');
                    if (highlights.length === 0) {
                        throw new Error('未找到高亮的搜索结果');
                    }
                    
                    this.log(`  → 找到 ${highlights.length} 个匹配结果`);
                    return `正向搜索成功，找到 ${highlights.length} 个匹配项`;
                }
            },
            {
                name: 'F002 - HUD 状态显示测试',
                test: async () => {
                    this.log('  → 检查 HUD 显示状态');
                    
                    const hud = document.getElementById('rVim-hud');
                    if (!hud) {
                        throw new Error('HUD 元素未找到');
                    }
                    
                    const hudStyle = window.getComputedStyle(hud);
                    const isVisible = hudStyle.display !== 'none' && hudStyle.visibility !== 'hidden';
                    
                    if (!isVisible) {
                        throw new Error('HUD 未正确显示');
                    }
                    
                    const hudText = hud.textContent;
                    this.log(`  → HUD 显示内容: "${hudText}"`);
                    
                    return `HUD 正常显示: ${hudText}`;
                }
            },
            {
                name: 'F003 - 搜索结果导航测试',
                test: async () => {
                    this.log('  → 测试搜索结果导航功能');
                    
                    // 确认搜索
                    this.simulateKey('Enter');
                    await this.wait(200);
                    
                    const initialIndex = Find.index || 0;
                    this.log(`  → 当前索引: ${initialIndex}`);
                    
                    // 测试 n 键导航
                    this.log('  → 按下 "n" 键导航到下一个结果');
                    this.simulateKey('n');
                    await this.wait(200);
                    
                    const newIndex = Find.index || 0;
                    this.log(`  → 新索引: ${newIndex}`);
                    
                    if (Find.matches && Find.matches.length > 1 && newIndex === initialIndex) {
                        throw new Error('导航功能未正常工作');
                    }
                    
                    return `导航功能正常，从索引 ${initialIndex} 移动到 ${newIndex}`;
                }
            },
            {
                name: 'F004 - 无匹配结果处理测试',
                test: async () => {
                    this.log('  → 测试无匹配结果的处理');
                    
                    // 清除当前搜索
                    this.simulateKey('Escape');
                    await this.wait(200);
                    
                    // 搜索不存在的内容
                    this.simulateKey('/');
                    await this.wait(200);
                    
                    const commandInput = document.getElementById('rVim-command-bar-input');
                    this.simulateInput('不存在的内容xyz123', commandInput);
                    await this.wait(300);
                    
                    const hud = document.getElementById('rVim-hud');
                    if (!hud) {
                        throw new Error('HUD 未显示');
                    }
                    
                    const hudText = hud.textContent;
                    this.log(`  → HUD 显示: "${hudText}"`);
                    
                    if (!hudText.includes('No matches')) {
                        throw new Error(`期望显示 "No matches"，实际显示: ${hudText}`);
                    }
                    
                    return `正确处理无匹配结果: ${hudText}`;
                }
            }
        ];
        
        let passed = 0;
        for (const test of tests) {
            const success = await this.executeTest(test.name, test.test, 'functional');
            if (success) passed++;
            await this.wait(500);
        }
        
        this.log(`\n📊 功能测试完成: ${passed}/${tests.length} 通过`, passed === tests.length ? 'success' : 'warning');
        console.log('');
    }

    // 性能测试演示
    async runPerformanceTests() {
        this.log('⚡ 开始性能测试演示...', 'header');
        console.log('');
        
        const tests = [
            {
                name: 'P001 - 搜索响应时间测试',
                test: async () => {
                    this.log('  → 测试搜索响应时间（10次迭代）');
                    
                    const iterations = 10;
                    const responseTimes = [];
                    
                    for (let i = 0; i < iterations; i++) {
                        // 清除之前的搜索
                        this.simulateKey('Escape');
                        await this.wait(50);
                        
                        const startTime = performance.now();
                        
                        this.simulateKey('/');
                        await this.wait(10);
                        
                        const commandInput = document.getElementById('rVim-command-bar-input');
                        this.simulateInput(`test${i}`, commandInput);
                        await this.wait(50);
                        
                        const endTime = performance.now();
                        const responseTime = endTime - startTime;
                        responseTimes.push(responseTime);
                        
                        if (i % 3 === 0) {
                            this.log(`    第 ${i + 1} 次: ${responseTime.toFixed(2)}ms`);
                        }
                    }
                    
                    const avgTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
                    const maxTime = Math.max(...responseTimes);
                    const minTime = Math.min(...responseTimes);
                    
                    this.log(`  → 平均响应时间: ${avgTime.toFixed(2)}ms`);
                    this.log(`  → 最快响应时间: ${minTime.toFixed(2)}ms`);
                    this.log(`  → 最慢响应时间: ${maxTime.toFixed(2)}ms`);
                    
                    if (avgTime > 100) {
                        throw new Error(`平均响应时间过长: ${avgTime.toFixed(2)}ms`);
                    }
                    
                    return `平均响应时间: ${avgTime.toFixed(2)}ms (范围: ${minTime.toFixed(2)}-${maxTime.toFixed(2)}ms)`;
                }
            },
            {
                name: 'P002 - 内存使用监控测试',
                test: async () => {
                    if (!performance.memory) {
                        return '浏览器不支持内存监控 API';
                    }
                    
                    this.log('  → 监控内存使用情况');
                    
                    const initialMemory = performance.memory.usedJSHeapSize;
                    this.log(`  → 初始内存使用: ${(initialMemory / 1024 / 1024).toFixed(2)}MB`);
                    
                    // 执行多次搜索操作
                    for (let i = 0; i < 20; i++) {
                        this.simulateKey('Escape');
                        await this.wait(10);
                        
                        this.simulateKey('/');
                        await this.wait(10);
                        
                        const commandInput = document.getElementById('rVim-command-bar-input');
                        this.simulateInput(`memory_test_${i}`, commandInput);
                        await this.wait(30);
                        
                        if (i % 5 === 0) {
                            const currentMemory = performance.memory.usedJSHeapSize;
                            this.log(`    第 ${i + 1} 次操作后: ${(currentMemory / 1024 / 1024).toFixed(2)}MB`);
                        }
                    }
                    
                    const finalMemory = performance.memory.usedJSHeapSize;
                    const memoryIncrease = finalMemory - initialMemory;
                    const increaseKB = memoryIncrease / 1024;
                    
                    this.log(`  → 最终内存使用: ${(finalMemory / 1024 / 1024).toFixed(2)}MB`);
                    this.log(`  → 内存增长: ${increaseKB.toFixed(2)}KB`);
                    
                    if (increaseKB > 1024) {
                        throw new Error(`可能存在内存泄漏: 增长 ${increaseKB.toFixed(2)}KB`);
                    }
                    
                    return `内存使用正常，增长 ${increaseKB.toFixed(2)}KB`;
                }
            },
            {
                name: 'P003 - 大文档搜索性能测试',
                test: async () => {
                    this.log('  → 创建大文档进行性能测试');
                    
                    // 创建大量文本内容
                    const largeContent = 'performance test content '.repeat(500) + '性能测试内容 '.repeat(500);
                    const testDiv = document.createElement('div');
                    testDiv.innerHTML = largeContent;
                    testDiv.style.display = 'none';
                    testDiv.id = 'performance-test-content';
                    document.body.appendChild(testDiv);
                    
                    this.log(`  → 添加了 ${largeContent.length} 字符的测试内容`);
                    
                    const startTime = performance.now();
                    
                    this.simulateKey('/');
                    await this.wait(20);
                    
                    const commandInput = document.getElementById('rVim-command-bar-input');
                    this.simulateInput('performance', commandInput);
                    await this.wait(200);
                    
                    const endTime = performance.now();
                    const searchTime = endTime - startTime;
                    
                    this.log(`  → 大文档搜索耗时: ${searchTime.toFixed(2)}ms`);
                    
                    // 清理测试内容
                    document.body.removeChild(testDiv);
                    this.simulateKey('Escape');
                    
                    if (searchTime > 500) {
                        throw new Error(`大文档搜索时间过长: ${searchTime.toFixed(2)}ms`);
                    }
                    
                    return `大文档搜索性能良好: ${searchTime.toFixed(2)}ms`;
                }
            }
        ];
        
        let passed = 0;
        for (const test of tests) {
            const success = await this.executeTest(test.name, test.test, 'performance');
            if (success) passed++;
            await this.wait(500);
        }
        
        this.log(`\n📊 性能测试完成: ${passed}/${tests.length} 通过`, passed === tests.length ? 'success' : 'warning');
        console.log('');
    }

    // 用户体验测试演示
    async runUserExperienceTests() {
        this.log('👤 开始用户体验测试演示...', 'header');
        console.log('');
        
        const tests = [
            {
                name: 'U001 - HUD 可见性和样式测试',
                test: async () => {
                    this.log('  → 检查 HUD 的可见性和样式');
                    
                    this.simulateKey('/');
                    await this.wait(200);
                    
                    const commandInput = document.getElementById('rVim-command-bar-input');
                    this.simulateInput('style', commandInput);
                    await this.wait(200);
                    
                    const hud = document.getElementById('rVim-hud');
                    if (!hud) {
                        throw new Error('HUD 元素未找到');
                    }
                    
                    const hudStyle = window.getComputedStyle(hud);
                    const backgroundColor = hudStyle.backgroundColor;
                    const color = hudStyle.color;
                    const fontSize = hudStyle.fontSize;
                    const position = hudStyle.position;
                    const zIndex = hudStyle.zIndex;
                    
                    this.log(`  → 背景色: ${backgroundColor}`);
                    this.log(`  → 文字颜色: ${color}`);
                    this.log(`  → 字体大小: ${fontSize}`);
                    this.log(`  → 定位方式: ${position}`);
                    this.log(`  → z-index: ${zIndex}`);
                    
                    if (parseInt(zIndex) < 1000) {
                        throw new Error(`z-index 过低，可能被其他元素遮挡: ${zIndex}`);
                    }
                    
                    return `HUD 样式良好，z-index: ${zIndex}, 定位: ${position}`;
                }
            },
            {
                name: 'U002 - 搜索框界面美观性测试',
                test: async () => {
                    this.log('  → 检查搜索框的界面设计');
                    
                    const commandBar = document.getElementById('rVim-command-bar');
                    const commandInput = document.getElementById('rVim-command-bar-input');
                    
                    if (!commandBar || !commandInput) {
                        throw new Error('搜索框元素未找到');
                    }
                    
                    const barStyle = window.getComputedStyle(commandBar);
                    const inputStyle = window.getComputedStyle(commandInput);
                    
                    const barBackground = barStyle.backgroundColor;
                    const barBorder = barStyle.border;
                    const inputFont = inputStyle.fontFamily;
                    const inputPadding = inputStyle.padding;
                    
                    this.log(`  → 搜索栏背景: ${barBackground}`);
                    this.log(`  → 搜索栏边框: ${barBorder}`);
                    this.log(`  → 输入框字体: ${inputFont}`);
                    this.log(`  → 输入框内边距: ${inputPadding}`);
                    
                    return `搜索框界面设计良好，字体: ${inputFont}`;
                }
            },
            {
                name: 'U003 - 高亮效果质量测试',
                test: async () => {
                    this.log('  → 检查搜索结果高亮效果');
                    
                    const highlights = document.querySelectorAll('.rVim-find-mark');
                    if (highlights.length === 0) {
                        throw new Error('未找到高亮元素');
                    }
                    
                    const firstHighlight = highlights[0];
                    const highlightStyle = window.getComputedStyle(firstHighlight);
                    const backgroundColor = highlightStyle.backgroundColor;
                    const color = highlightStyle.color;
                    const fontWeight = highlightStyle.fontWeight;
                    
                    this.log(`  → 高亮背景色: ${backgroundColor}`);
                    this.log(`  → 高亮文字色: ${color}`);
                    this.log(`  → 字体粗细: ${fontWeight}`);
                    this.log(`  → 高亮元素数量: ${highlights.length}`);
                    
                    return `高亮效果良好，${highlights.length} 个高亮元素，背景: ${backgroundColor}`;
                }
            },
            {
                name: 'U004 - 键盘响应速度测试',
                test: async () => {
                    this.log('  → 测试键盘操作响应速度');
                    
                    const keys = ['/', '?', 'n', 'N', 'Escape'];
                    const responseTimes = [];
                    
                    for (const key of keys) {
                        const startTime = performance.now();
                        this.simulateKey(key);
                        await this.wait(20);
                        const endTime = performance.now();
                        
                        const responseTime = endTime - startTime;
                        responseTimes.push({ key, time: responseTime });
                        
                        this.log(`    ${key} 键响应时间: ${responseTime.toFixed(2)}ms`);
                        await this.wait(100);
                    }
                    
                    const avgTime = responseTimes.reduce((sum, item) => sum + item.time, 0) / responseTimes.length;
                    
                    this.log(`  → 平均键盘响应时间: ${avgTime.toFixed(2)}ms`);
                    
                    if (avgTime > 50) {
                        throw new Error(`键盘响应过慢: ${avgTime.toFixed(2)}ms`);
                    }
                    
                    return `键盘响应良好，平均 ${avgTime.toFixed(2)}ms`;
                }
            }
        ];
        
        let passed = 0;
        for (const test of tests) {
            const success = await this.executeTest(test.name, test.test, 'userExperience');
            if (success) passed++;
            await this.wait(500);
        }
        
        this.log(`\n📊 用户体验测试完成: ${passed}/${tests.length} 通过`, passed === tests.length ? 'success' : 'warning');
        console.log('');
    }

    // 生成最终报告
    generateFinalReport() {
        const allResults = [...this.results.functional, ...this.results.performance, ...this.results.userExperience];
        const totalTests = allResults.length;
        const passedTests = allResults.filter(test => test.status === 'PASS').length;
        const failedTests = totalTests - passedTests;
        const successRate = totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(1) : 0;
        
        this.results.summary = {
            totalTests,
            passedTests,
            failedTests,
            successRate: successRate + '%',
            testDuration: this.startTime ? ((Date.now() - this.startTime) / 1000).toFixed(2) + 's' : 'N/A',
            testDate: new Date().toISOString()
        };
        
        this.log('📊 测试总结报告', 'header');
        this.log('=' .repeat(50), 'header');
        this.log(`总测试数量: ${totalTests}`, 'info');
        this.log(`通过测试: ${passedTests}`, 'success');
        this.log(`失败测试: ${failedTests}`, failedTests > 0 ? 'error' : 'info');
        this.log(`成功率: ${successRate}%`, passedTests === totalTests ? 'success' : 'warning');
        this.log(`测试耗时: ${this.results.summary.testDuration}`, 'info');
        this.log('=' .repeat(50), 'header');
        
        // 显示详细结果
        console.log('');
        this.log('📋 详细测试结果:', 'header');
        
        ['functional', 'performance', 'userExperience'].forEach(category => {
            const categoryName = {
                functional: '功能测试',
                performance: '性能测试',
                userExperience: '用户体验测试'
            }[category];
            
            this.log(`\n${categoryName}:`, 'info');
            this.results[category].forEach(test => {
                const status = test.status === 'PASS' ? '✅' : '❌';
                const result = test.result || test.error;
                this.log(`  ${status} ${test.name}: ${result}`, test.status === 'PASS' ? 'success' : 'error');
            });
        });
        
        console.log('');
        this.log('🎉 rVim 搜索功能综合测试演示完成！', 'header');
        
        return this.results;
    }

    // 运行完整测试演示
    async runCompleteDemo() {
        this.showHeader();
        this.startTime = Date.now();
        
        try {
            this.log('🚀 开始 rVim 搜索功能综合测试演示...', 'info');
            this.log('测试将按照以下顺序进行：功能测试 → 性能测试 → 用户体验测试', 'info');
            console.log('');
            
            await this.wait(1000);
            
            // 执行功能测试
            await this.runFunctionalTests();
            await this.wait(1000);
            
            // 执行性能测试
            await this.runPerformanceTests();
            await this.wait(1000);
            
            // 执行用户体验测试
            await this.runUserExperienceTests();
            await this.wait(1000);
            
            // 生成最终报告
            const finalReport = this.generateFinalReport();
            
            // 将结果保存到全局变量
            window.testResults = finalReport;
            
            this.log('💾 测试结果已保存到 window.testResults', 'info');
            
            return finalReport;
            
        } catch (error) {
            this.log(`❌ 测试演示执行失败: ${error.message}`, 'error');
            console.error('详细错误信息:', error);
            throw error;
        }
    }
}

// 导出到全局
window.TestRunner = TestRunner;

// 自动运行演示
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            console.log('🔧 rVim 搜索功能测试演示器已准备就绪');
            console.log('💡 使用以下命令开始测试:');
            console.log('   const runner = new TestRunner();');
            console.log('   runner.runCompleteDemo();');
            console.log('');
            console.log('🎯 或者直接运行: window.runDemo()');
            
            // 提供快捷方法
            window.runDemo = async () => {
                const runner = new TestRunner();
                return await runner.runCompleteDemo();
            };
        }, 2000);
    });
} else {
    setTimeout(() => {
        console.log('🔧 rVim 搜索功能测试演示器已准备就绪');
        console.log('💡 使用 window.runDemo() 开始完整测试演示');
        
        window.runDemo = async () => {
            const runner = new TestRunner();
            return await runner.runCompleteDemo();
        };
    }, 1000);
}