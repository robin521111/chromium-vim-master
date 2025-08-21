/**
 * rVim 搜索功能性能基准测试脚本
 * 专门用于详细的性能评估和监控
 */

class PerformanceBenchmark {
    constructor() {
        this.metrics = {
            searchResponseTimes: [],
            memoryUsage: [],
            cpuUsage: [],
            renderingPerformance: [],
            domManipulation: []
        };
        this.testConfig = {
            iterations: 50,
            warmupIterations: 10,
            memoryCheckInterval: 100,
            performanceThresholds: {
                maxSearchTime: 100, // ms
                maxMemoryIncrease: 2048, // KB
                maxRenderTime: 50 // ms
            }
        };
    }

    // 格式化输出
    log(message, type = 'info') {
        const timestamp = new Date().toLocaleTimeString();
        const styles = {
            info: 'color: #2196F3; font-weight: bold;',
            success: 'color: #4CAF50; font-weight: bold;',
            warning: 'color: #FF9800; font-weight: bold;',
            error: 'color: #F44336; font-weight: bold;',
            header: 'color: #9C27B0; font-size: 16px; font-weight: bold;',
            data: 'color: #607D8B; font-family: monospace;'
        };
        
        console.log(`%c[${timestamp}] ${message}`, styles[type] || styles.info);
    }

    // 等待函数
    async wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // 获取内存使用情况
    getMemoryUsage() {
        if (performance.memory) {
            return {
                used: performance.memory.usedJSHeapSize,
                total: performance.memory.totalJSHeapSize,
                limit: performance.memory.jsHeapSizeLimit,
                timestamp: Date.now()
            };
        }
        return null;
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

    // 清理搜索状态
    async cleanupSearch() {
        this.simulateKey('Escape');
        await this.wait(50);
        
        // 清除所有高亮
        const highlights = document.querySelectorAll('.rVim-find-mark');
        highlights.forEach(el => el.remove());
        
        // 隐藏 HUD
        const hud = document.getElementById('rVim-hud');
        if (hud) {
            hud.style.display = 'none';
        }
    }

    // 搜索响应时间基准测试
    async benchmarkSearchResponseTime() {
        this.log('⚡ 开始搜索响应时间基准测试', 'header');
        
        const testCases = [
            { query: 'test', description: '短词搜索' },
            { query: 'function', description: '中等长度词搜索' },
            { query: 'JavaScript', description: '长词搜索' },
            { query: 'a', description: '单字符搜索' },
            { query: '测试', description: '中文搜索' },
            { query: 'test function', description: '多词搜索' },
            { query: '123', description: '数字搜索' },
            { query: '@#$', description: '特殊字符搜索' }
        ];
        
        const results = [];
        
        for (const testCase of testCases) {
            this.log(`  测试: ${testCase.description} ("${testCase.query}")`);
            
            const responseTimes = [];
            
            // 预热
            for (let i = 0; i < this.testConfig.warmupIterations; i++) {
                await this.cleanupSearch();
                this.simulateKey('/');
                await this.wait(10);
                const input = document.getElementById('rVim-command-bar-input');
                this.simulateInput(testCase.query, input);
                await this.wait(20);
            }
            
            // 正式测试
            for (let i = 0; i < this.testConfig.iterations; i++) {
                await this.cleanupSearch();
                
                const startTime = performance.now();
                
                this.simulateKey('/');
                const input = document.getElementById('rVim-command-bar-input');
                this.simulateInput(testCase.query, input);
                
                // 等待搜索完成
                await this.wait(10);
                
                const endTime = performance.now();
                const responseTime = endTime - startTime;
                responseTimes.push(responseTime);
                
                if (i % 10 === 0) {
                    this.log(`    进度: ${i + 1}/${this.testConfig.iterations}`);
                }
            }
            
            const stats = this.calculateStatistics(responseTimes);
            results.push({
                testCase: testCase,
                stats: stats
            });
            
            this.log(`    结果: 平均 ${stats.mean.toFixed(2)}ms, 中位数 ${stats.median.toFixed(2)}ms, 95% ${stats.p95.toFixed(2)}ms`, 'data');
            
            if (stats.mean > this.testConfig.performanceThresholds.maxSearchTime) {
                this.log(`    ⚠️  警告: 平均响应时间超过阈值 (${this.testConfig.performanceThresholds.maxSearchTime}ms)`, 'warning');
            }
        }
        
        this.metrics.searchResponseTimes = results;
        return results;
    }

    // 内存使用基准测试
    async benchmarkMemoryUsage() {
        this.log('🧠 开始内存使用基准测试', 'header');
        
        if (!performance.memory) {
            this.log('  浏览器不支持内存监控 API', 'warning');
            return null;
        }
        
        const initialMemory = this.getMemoryUsage();
        this.log(`  初始内存: ${(initialMemory.used / 1024 / 1024).toFixed(2)}MB`, 'data');
        
        const memorySnapshots = [initialMemory];
        
        // 执行大量搜索操作
        const searchQueries = [
            'test', 'function', 'JavaScript', 'HTML', 'CSS',
            '测试', '功能', '搜索', '性能', '内存',
            '123', '456', '789', '@#$', '%^&'
        ];
        
        for (let cycle = 0; cycle < 10; cycle++) {
            this.log(`  内存测试周期 ${cycle + 1}/10`);
            
            for (const query of searchQueries) {
                await this.cleanupSearch();
                
                this.simulateKey('/');
                await this.wait(5);
                
                const input = document.getElementById('rVim-command-bar-input');
                this.simulateInput(query, input);
                await this.wait(20);
                
                // 模拟导航
                this.simulateKey('Enter');
                await this.wait(10);
                this.simulateKey('n');
                await this.wait(10);
                this.simulateKey('N');
                await this.wait(10);
                
                // 记录内存使用
                if (memorySnapshots.length % this.testConfig.memoryCheckInterval === 0) {
                    const currentMemory = this.getMemoryUsage();
                    memorySnapshots.push(currentMemory);
                    
                    const memoryIncrease = (currentMemory.used - initialMemory.used) / 1024;
                    this.log(`    内存增长: ${memoryIncrease.toFixed(2)}KB`, 'data');
                }
            }
            
            // 强制垃圾回收（如果可用）
            if (window.gc) {
                window.gc();
                await this.wait(100);
            }
        }
        
        const finalMemory = this.getMemoryUsage();
        const totalIncrease = (finalMemory.used - initialMemory.used) / 1024;
        
        this.log(`  最终内存: ${(finalMemory.used / 1024 / 1024).toFixed(2)}MB`, 'data');
        this.log(`  总内存增长: ${totalIncrease.toFixed(2)}KB`, 'data');
        
        if (totalIncrease > this.testConfig.performanceThresholds.maxMemoryIncrease) {
            this.log(`  ⚠️  警告: 内存增长超过阈值 (${this.testConfig.performanceThresholds.maxMemoryIncrease}KB)`, 'warning');
        }
        
        const memoryStats = {
            initial: initialMemory,
            final: finalMemory,
            increase: totalIncrease,
            snapshots: memorySnapshots
        };
        
        this.metrics.memoryUsage = memoryStats;
        return memoryStats;
    }

    // DOM 操作性能基准测试
    async benchmarkDOMPerformance() {
        this.log('🏗️ 开始 DOM 操作性能基准测试', 'header');
        
        const results = [];
        
        // 测试高亮创建性能
        this.log('  测试高亮元素创建性能');
        const highlightTimes = [];
        
        for (let i = 0; i < 20; i++) {
            await this.cleanupSearch();
            
            const startTime = performance.now();
            
            this.simulateKey('/');
            const input = document.getElementById('rVim-command-bar-input');
            this.simulateInput('test', input);
            
            // 等待高亮完成
            await this.wait(50);
            
            const endTime = performance.now();
            const highlightTime = endTime - startTime;
            highlightTimes.push(highlightTime);
        }
        
        const highlightStats = this.calculateStatistics(highlightTimes);
        results.push({
            operation: '高亮创建',
            stats: highlightStats
        });
        
        this.log(`    高亮创建: 平均 ${highlightStats.mean.toFixed(2)}ms`, 'data');
        
        // 测试 HUD 更新性能
        this.log('  测试 HUD 更新性能');
        const hudUpdateTimes = [];
        
        for (let i = 0; i < 30; i++) {
            const startTime = performance.now();
            
            // 模拟 HUD 更新
            const hud = document.getElementById('rVim-hud');
            if (hud) {
                hud.textContent = `${i + 1} / 100`;
                hud.style.display = 'block';
            }
            
            const endTime = performance.now();
            const updateTime = endTime - startTime;
            hudUpdateTimes.push(updateTime);
            
            await this.wait(10);
        }
        
        const hudStats = this.calculateStatistics(hudUpdateTimes);
        results.push({
            operation: 'HUD 更新',
            stats: hudStats
        });
        
        this.log(`    HUD 更新: 平均 ${hudStats.mean.toFixed(2)}ms`, 'data');
        
        this.metrics.domManipulation = results;
        return results;
    }

    // 渲染性能基准测试
    async benchmarkRenderingPerformance() {
        this.log('🎨 开始渲染性能基准测试', 'header');
        
        const results = [];
        
        // 创建大量测试内容
        const testContent = this.createLargeTestContent();
        const testDiv = document.createElement('div');
        testDiv.innerHTML = testContent;
        testDiv.style.display = 'none';
        testDiv.id = 'rendering-test-content';
        document.body.appendChild(testDiv);
        
        this.log(`  添加了 ${testContent.length} 字符的测试内容`);
        
        // 测试大文档搜索渲染性能
        const renderTimes = [];
        
        for (let i = 0; i < 10; i++) {
            await this.cleanupSearch();
            
            // 显示测试内容
            testDiv.style.display = 'block';
            
            const startTime = performance.now();
            
            this.simulateKey('/');
            const input = document.getElementById('rVim-command-bar-input');
            this.simulateInput('performance', input);
            
            // 等待渲染完成
            await this.wait(100);
            
            const endTime = performance.now();
            const renderTime = endTime - startTime;
            renderTimes.push(renderTime);
            
            // 隐藏测试内容
            testDiv.style.display = 'none';
            
            this.log(`    第 ${i + 1} 次渲染: ${renderTime.toFixed(2)}ms`);
        }
        
        const renderStats = this.calculateStatistics(renderTimes);
        results.push({
            operation: '大文档搜索渲染',
            stats: renderStats
        });
        
        this.log(`  大文档渲染: 平均 ${renderStats.mean.toFixed(2)}ms`, 'data');
        
        if (renderStats.mean > this.testConfig.performanceThresholds.maxRenderTime) {
            this.log(`  ⚠️  警告: 渲染时间超过阈值 (${this.testConfig.performanceThresholds.maxRenderTime}ms)`, 'warning');
        }
        
        // 清理测试内容
        document.body.removeChild(testDiv);
        
        this.metrics.renderingPerformance = results;
        return results;
    }

    // 创建大量测试内容
    createLargeTestContent() {
        const words = [
            'performance', 'test', 'benchmark', 'search', 'function',
            'JavaScript', 'HTML', 'CSS', 'DOM', 'rendering',
            '性能', '测试', '基准', '搜索', '功能',
            'optimization', 'memory', 'speed', 'efficiency', 'quality'
        ];
        
        let content = '';
        for (let i = 0; i < 1000; i++) {
            const randomWords = [];
            for (let j = 0; j < 10; j++) {
                randomWords.push(words[Math.floor(Math.random() * words.length)]);
            }
            content += `<p>Paragraph ${i + 1}: ${randomWords.join(' ')}. This is a performance test paragraph with various keywords for searching and highlighting.</p>`;
        }
        
        return content;
    }

    // 计算统计数据
    calculateStatistics(values) {
        if (values.length === 0) return null;
        
        const sorted = [...values].sort((a, b) => a - b);
        const sum = values.reduce((a, b) => a + b, 0);
        
        return {
            count: values.length,
            min: Math.min(...values),
            max: Math.max(...values),
            mean: sum / values.length,
            median: sorted[Math.floor(sorted.length / 2)],
            p95: sorted[Math.floor(sorted.length * 0.95)],
            p99: sorted[Math.floor(sorted.length * 0.99)],
            stdDev: Math.sqrt(values.reduce((sq, n) => sq + Math.pow(n - (sum / values.length), 2), 0) / values.length)
        };
    }

    // 生成性能报告
    generatePerformanceReport() {
        this.log('📊 生成性能基准测试报告', 'header');
        
        const report = {
            timestamp: new Date().toISOString(),
            testConfig: this.testConfig,
            metrics: this.metrics,
            summary: {
                searchPerformance: null,
                memoryEfficiency: null,
                renderingSpeed: null,
                overallScore: null
            }
        };
        
        // 分析搜索性能
        if (this.metrics.searchResponseTimes.length > 0) {
            const avgResponseTimes = this.metrics.searchResponseTimes.map(r => r.stats.mean);
            const overallAvg = avgResponseTimes.reduce((a, b) => a + b, 0) / avgResponseTimes.length;
            
            report.summary.searchPerformance = {
                averageResponseTime: overallAvg,
                rating: overallAvg < 50 ? 'Excellent' : overallAvg < 100 ? 'Good' : 'Needs Improvement'
            };
        }
        
        // 分析内存效率
        if (this.metrics.memoryUsage) {
            const memoryIncrease = this.metrics.memoryUsage.increase;
            report.summary.memoryEfficiency = {
                memoryIncrease: memoryIncrease,
                rating: memoryIncrease < 512 ? 'Excellent' : memoryIncrease < 1024 ? 'Good' : 'Needs Improvement'
            };
        }
        
        // 分析渲染速度
        if (this.metrics.renderingPerformance.length > 0) {
            const renderStats = this.metrics.renderingPerformance[0].stats;
            report.summary.renderingSpeed = {
                averageRenderTime: renderStats.mean,
                rating: renderStats.mean < 30 ? 'Excellent' : renderStats.mean < 60 ? 'Good' : 'Needs Improvement'
            };
        }
        
        // 计算总体评分
        const ratings = Object.values(report.summary)
            .filter(item => item && item.rating)
            .map(item => item.rating);
        
        const excellentCount = ratings.filter(r => r === 'Excellent').length;
        const goodCount = ratings.filter(r => r === 'Good').length;
        
        if (excellentCount === ratings.length) {
            report.summary.overallScore = 'Excellent';
        } else if (excellentCount + goodCount === ratings.length) {
            report.summary.overallScore = 'Good';
        } else {
            report.summary.overallScore = 'Needs Improvement';
        }
        
        // 输出报告
        this.log('=' .repeat(60), 'header');
        this.log('📈 性能基准测试报告摘要', 'header');
        this.log('=' .repeat(60), 'header');
        
        if (report.summary.searchPerformance) {
            this.log(`搜索性能: ${report.summary.searchPerformance.averageResponseTime.toFixed(2)}ms (${report.summary.searchPerformance.rating})`, 'data');
        }
        
        if (report.summary.memoryEfficiency) {
            this.log(`内存效率: +${report.summary.memoryEfficiency.memoryIncrease.toFixed(2)}KB (${report.summary.memoryEfficiency.rating})`, 'data');
        }
        
        if (report.summary.renderingSpeed) {
            this.log(`渲染速度: ${report.summary.renderingSpeed.averageRenderTime.toFixed(2)}ms (${report.summary.renderingSpeed.rating})`, 'data');
        }
        
        this.log(`总体评分: ${report.summary.overallScore}`, report.summary.overallScore === 'Excellent' ? 'success' : report.summary.overallScore === 'Good' ? 'info' : 'warning');
        this.log('=' .repeat(60), 'header');
        
        return report;
    }

    // 运行完整的性能基准测试
    async runCompleteBenchmark() {
        this.log('🚀 开始 rVim 搜索功能性能基准测试', 'header');
        this.log('=' .repeat(80), 'header');
        
        try {
            // 搜索响应时间测试
            await this.benchmarkSearchResponseTime();
            await this.wait(1000);
            
            // 内存使用测试
            await this.benchmarkMemoryUsage();
            await this.wait(1000);
            
            // DOM 操作性能测试
            await this.benchmarkDOMPerformance();
            await this.wait(1000);
            
            // 渲染性能测试
            await this.benchmarkRenderingPerformance();
            await this.wait(1000);
            
            // 生成报告
            const report = this.generatePerformanceReport();
            
            // 保存到全局变量
            window.performanceBenchmarkResults = report;
            
            this.log('💾 性能基准测试结果已保存到 window.performanceBenchmarkResults', 'info');
            this.log('🎉 性能基准测试完成！', 'success');
            
            return report;
            
        } catch (error) {
            this.log(`❌ 性能基准测试失败: ${error.message}`, 'error');
            console.error('详细错误信息:', error);
            throw error;
        }
    }
}

// 导出到全局
window.PerformanceBenchmark = PerformanceBenchmark;

// 提供快捷方法
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            console.log('⚡ rVim 搜索功能性能基准测试器已准备就绪');
            console.log('💡 使用 window.runPerformanceBenchmark() 开始性能基准测试');
            
            window.runPerformanceBenchmark = async () => {
                const benchmark = new PerformanceBenchmark();
                return await benchmark.runCompleteBenchmark();
            };
        }, 2000);
    });
} else {
    setTimeout(() => {
        console.log('⚡ rVim 搜索功能性能基准测试器已准备就绪');
        console.log('💡 使用 window.runPerformanceBenchmark() 开始性能基准测试');
        
        window.runPerformanceBenchmark = async () => {
            const benchmark = new PerformanceBenchmark();
            return await benchmark.runCompleteBenchmark();
        };
    }, 1000);
}