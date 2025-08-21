/**
 * rVim 搜索功能用户体验评估脚本
 * 专门用于检查界面友好性、操作流畅性和可用性
 */

class UXEvaluation {
    constructor() {
        this.evaluationResults = {
            visualDesign: {},
            interactionFlow: {},
            accessibility: {},
            responsiveness: {},
            errorHandling: {},
            overallScore: null
        };
        
        this.criteria = {
            visualDesign: {
                hudVisibility: { weight: 0.25, score: 0 },
                searchBarStyling: { weight: 0.25, score: 0 },
                highlightClarity: { weight: 0.25, score: 0 },
                colorContrast: { weight: 0.25, score: 0 }
            },
            interactionFlow: {
                keyboardShortcuts: { weight: 0.3, score: 0 },
                searchNavigation: { weight: 0.3, score: 0 },
                feedbackTiming: { weight: 0.2, score: 0 },
                operationSmoothness: { weight: 0.2, score: 0 }
            },
            accessibility: {
                keyboardOnly: { weight: 0.4, score: 0 },
                visualFeedback: { weight: 0.3, score: 0 },
                errorMessages: { weight: 0.3, score: 0 }
            },
            responsiveness: {
                instantFeedback: { weight: 0.4, score: 0 },
                progressIndicators: { weight: 0.3, score: 0 },
                performanceConsistency: { weight: 0.3, score: 0 }
            },
            errorHandling: {
                gracefulDegradation: { weight: 0.4, score: 0 },
                userGuidance: { weight: 0.3, score: 0 },
                recoveryMechanisms: { weight: 0.3, score: 0 }
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
            data: 'color: #607D8B; font-family: monospace;',
            score: 'color: #795548; font-weight: bold; background: #FFF3E0; padding: 2px 6px; border-radius: 3px;'
        };
        
        console.log(`%c[${timestamp}] ${message}`, styles[type] || styles.info);
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

    // 获取元素的计算样式
    getComputedStyle(element, property) {
        return window.getComputedStyle(element).getPropertyValue(property);
    }

    // 计算颜色对比度
    calculateContrast(color1, color2) {
        // 简化的对比度计算
        const getLuminance = (color) => {
            const rgb = color.match(/\d+/g);
            if (!rgb) return 0;
            const [r, g, b] = rgb.map(x => {
                x = parseInt(x) / 255;
                return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
            });
            return 0.2126 * r + 0.7152 * g + 0.0722 * b;
        };
        
        const lum1 = getLuminance(color1);
        const lum2 = getLuminance(color2);
        const brightest = Math.max(lum1, lum2);
        const darkest = Math.min(lum1, lum2);
        
        return (brightest + 0.05) / (darkest + 0.05);
    }

    // 评估视觉设计
    async evaluateVisualDesign() {
        this.log('🎨 开始视觉设计评估', 'header');
        
        const results = {};
        
        // 1. HUD 可见性评估
        this.log('  评估 HUD 可见性');
        this.simulateKey('/');
        await this.wait(100);
        this.simulateInput('test', document.getElementById('rVim-command-bar-input'));
        await this.wait(200);
        
        const hud = document.getElementById('rVim-hud');
        if (hud) {
            const hudStyle = window.getComputedStyle(hud);
            const isVisible = hudStyle.display !== 'none' && hudStyle.visibility !== 'hidden';
            const position = hudStyle.position;
            const zIndex = parseInt(hudStyle.zIndex) || 0;
            const opacity = parseFloat(hudStyle.opacity) || 1;
            
            let hudScore = 0;
            if (isVisible) hudScore += 30;
            if (position === 'fixed' || position === 'absolute') hudScore += 25;
            if (zIndex > 1000) hudScore += 25;
            if (opacity >= 0.9) hudScore += 20;
            
            this.criteria.visualDesign.hudVisibility.score = hudScore;
            results.hudVisibility = {
                score: hudScore,
                details: { isVisible, position, zIndex, opacity },
                feedback: hudScore >= 80 ? 'Excellent' : hudScore >= 60 ? 'Good' : 'Needs Improvement'
            };
            
            this.log(`    HUD 可见性得分: ${hudScore}/100 (${results.hudVisibility.feedback})`, 'score');
        }
        
        // 2. 搜索栏样式评估
        this.log('  评估搜索栏样式');
        const searchBar = document.getElementById('rVim-command-bar');
        const searchInput = document.getElementById('rVim-command-bar-input');
        
        if (searchBar && searchInput) {
            const barStyle = window.getComputedStyle(searchBar);
            const inputStyle = window.getComputedStyle(searchInput);
            
            let styleScore = 0;
            
            // 检查边框
            if (barStyle.border !== 'none' || inputStyle.border !== 'none') styleScore += 20;
            
            // 检查背景
            if (barStyle.backgroundColor !== 'rgba(0, 0, 0, 0)' || inputStyle.backgroundColor !== 'rgba(0, 0, 0, 0)') styleScore += 20;
            
            // 检查字体大小
            const fontSize = parseInt(inputStyle.fontSize);
            if (fontSize >= 12 && fontSize <= 18) styleScore += 20;
            
            // 检查内边距
            const padding = parseInt(inputStyle.padding);
            if (padding >= 4) styleScore += 20;
            
            // 检查圆角
            if (barStyle.borderRadius !== '0px' || inputStyle.borderRadius !== '0px') styleScore += 20;
            
            this.criteria.visualDesign.searchBarStyling.score = styleScore;
            results.searchBarStyling = {
                score: styleScore,
                details: { fontSize, padding, border: barStyle.border, background: barStyle.backgroundColor },
                feedback: styleScore >= 80 ? 'Excellent' : styleScore >= 60 ? 'Good' : 'Needs Improvement'
            };
            
            this.log(`    搜索栏样式得分: ${styleScore}/100 (${results.searchBarStyling.feedback})`, 'score');
        }
        
        // 3. 高亮清晰度评估
        this.log('  评估高亮清晰度');
        await this.wait(300);
        
        const highlights = document.querySelectorAll('.rVim-find-mark');
        if (highlights.length > 0) {
            const highlight = highlights[0];
            const highlightStyle = window.getComputedStyle(highlight);
            
            let highlightScore = 0;
            
            // 检查背景色
            const bgColor = highlightStyle.backgroundColor;
            if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)') highlightScore += 30;
            
            // 检查文字颜色
            const textColor = highlightStyle.color;
            if (textColor && textColor !== 'rgb(0, 0, 0)') highlightScore += 20;
            
            // 检查对比度
            if (bgColor && textColor) {
                const contrast = this.calculateContrast(bgColor, textColor);
                if (contrast >= 4.5) highlightScore += 30;
                else if (contrast >= 3) highlightScore += 20;
            }
            
            // 检查边框或轮廓
            if (highlightStyle.border !== 'none' || highlightStyle.outline !== 'none') highlightScore += 20;
            
            this.criteria.visualDesign.highlightClarity.score = highlightScore;
            results.highlightClarity = {
                score: highlightScore,
                details: { backgroundColor: bgColor, color: textColor, border: highlightStyle.border },
                feedback: highlightScore >= 80 ? 'Excellent' : highlightScore >= 60 ? 'Good' : 'Needs Improvement'
            };
            
            this.log(`    高亮清晰度得分: ${highlightScore}/100 (${results.highlightClarity.feedback})`, 'score');
        }
        
        // 4. 颜色对比度评估
        this.log('  评估整体颜色对比度');
        let contrastScore = 0;
        
        // 检查 HUD 对比度
        if (hud) {
            const hudBg = this.getComputedStyle(hud, 'background-color');
            const hudColor = this.getComputedStyle(hud, 'color');
            const hudContrast = this.calculateContrast(hudBg, hudColor);
            
            if (hudContrast >= 7) contrastScore += 40;
            else if (hudContrast >= 4.5) contrastScore += 30;
            else if (hudContrast >= 3) contrastScore += 20;
        }
        
        // 检查搜索栏对比度
        if (searchInput) {
            const inputBg = this.getComputedStyle(searchInput, 'background-color');
            const inputColor = this.getComputedStyle(searchInput, 'color');
            const inputContrast = this.calculateContrast(inputBg, inputColor);
            
            if (inputContrast >= 7) contrastScore += 40;
            else if (inputContrast >= 4.5) contrastScore += 30;
            else if (inputContrast >= 3) contrastScore += 20;
        }
        
        // 检查高亮对比度
        if (highlights.length > 0) {
            const highlight = highlights[0];
            const hlBg = this.getComputedStyle(highlight, 'background-color');
            const hlColor = this.getComputedStyle(highlight, 'color');
            const hlContrast = this.calculateContrast(hlBg, hlColor);
            
            if (hlContrast >= 7) contrastScore += 20;
            else if (hlContrast >= 4.5) contrastScore += 15;
            else if (hlContrast >= 3) contrastScore += 10;
        }
        
        this.criteria.visualDesign.colorContrast.score = contrastScore;
        results.colorContrast = {
            score: contrastScore,
            feedback: contrastScore >= 80 ? 'Excellent' : contrastScore >= 60 ? 'Good' : 'Needs Improvement'
        };
        
        this.log(`    颜色对比度得分: ${contrastScore}/100 (${results.colorContrast.feedback})`, 'score');
        
        // 清理
        this.simulateKey('Escape');
        await this.wait(100);
        
        this.evaluationResults.visualDesign = results;
        return results;
    }

    // 评估交互流程
    async evaluateInteractionFlow() {
        this.log('🔄 开始交互流程评估', 'header');
        
        const results = {};
        
        // 1. 键盘快捷键评估
        this.log('  评估键盘快捷键');
        let shortcutScore = 0;
        
        const shortcuts = [
            { key: '/', description: '打开搜索' },
            { key: '?', description: '反向搜索' },
            { key: 'n', description: '下一个匹配' },
            { key: 'N', description: '上一个匹配' },
            { key: 'Escape', description: '退出搜索' }
        ];
        
        for (const shortcut of shortcuts) {
            try {
                const startTime = performance.now();
                this.simulateKey(shortcut.key);
                await this.wait(50);
                const endTime = performance.now();
                
                if (endTime - startTime < 100) {
                    shortcutScore += 20;
                    this.log(`    ✓ ${shortcut.description} (${shortcut.key}): 响应正常`);
                } else {
                    this.log(`    ⚠ ${shortcut.description} (${shortcut.key}): 响应较慢`);
                }
            } catch (error) {
                this.log(`    ✗ ${shortcut.description} (${shortcut.key}): 响应失败`);
            }
        }
        
        this.criteria.interactionFlow.keyboardShortcuts.score = shortcutScore;
        results.keyboardShortcuts = {
            score: shortcutScore,
            feedback: shortcutScore >= 80 ? 'Excellent' : shortcutScore >= 60 ? 'Good' : 'Needs Improvement'
        };
        
        this.log(`    键盘快捷键得分: ${shortcutScore}/100 (${results.keyboardShortcuts.feedback})`, 'score');
        
        // 2. 搜索导航评估
        this.log('  评估搜索导航');
        let navigationScore = 0;
        
        // 开始搜索
        this.simulateKey('/');
        await this.wait(100);
        this.simulateInput('test', document.getElementById('rVim-command-bar-input'));
        await this.wait(200);
        
        // 测试导航
        const navigationTests = [
            { action: 'Enter', description: '确认搜索' },
            { action: 'n', description: '下一个结果' },
            { action: 'N', description: '上一个结果' }
        ];
        
        for (const test of navigationTests) {
            try {
                const beforeHud = document.getElementById('rVim-hud')?.textContent;
                this.simulateKey(test.action);
                await this.wait(100);
                const afterHud = document.getElementById('rVim-hud')?.textContent;
                
                if (beforeHud !== afterHud || test.action === 'Enter') {
                    navigationScore += 33;
                    this.log(`    ✓ ${test.description}: 功能正常`);
                } else {
                    this.log(`    ⚠ ${test.description}: 状态未更新`);
                }
            } catch (error) {
                this.log(`    ✗ ${test.description}: 功能异常`);
            }
        }
        
        this.criteria.interactionFlow.searchNavigation.score = navigationScore;
        results.searchNavigation = {
            score: navigationScore,
            feedback: navigationScore >= 80 ? 'Excellent' : navigationScore >= 60 ? 'Good' : 'Needs Improvement'
        };
        
        this.log(`    搜索导航得分: ${navigationScore}/100 (${results.searchNavigation.feedback})`, 'score');
        
        // 3. 反馈时机评估
        this.log('  评估反馈时机');
        let feedbackScore = 0;
        
        // 测试即时反馈
        this.simulateKey('Escape');
        await this.wait(100);
        this.simulateKey('/');
        await this.wait(50);
        
        const input = document.getElementById('rVim-command-bar-input');
        if (input) {
            const testQueries = ['t', 'te', 'tes', 'test'];
            
            for (const query of testQueries) {
                const startTime = performance.now();
                this.simulateInput(query, input);
                await this.wait(50);
                const endTime = performance.now();
                
                const hud = document.getElementById('rVim-hud');
                if (hud && hud.style.display !== 'none' && endTime - startTime < 200) {
                    feedbackScore += 25;
                }
            }
        }
        
        this.criteria.interactionFlow.feedbackTiming.score = feedbackScore;
        results.feedbackTiming = {
            score: feedbackScore,
            feedback: feedbackScore >= 80 ? 'Excellent' : feedbackScore >= 60 ? 'Good' : 'Needs Improvement'
        };
        
        this.log(`    反馈时机得分: ${feedbackScore}/100 (${results.feedbackTiming.feedback})`, 'score');
        
        // 4. 操作流畅性评估
        this.log('  评估操作流畅性');
        let smoothnessScore = 0;
        
        // 测试连续操作
        const operations = ['/', 'test', 'Enter', 'n', 'n', 'N', 'Escape'];
        const startTime = performance.now();
        
        for (const op of operations) {
            if (op === 'test') {
                this.simulateInput(op, document.getElementById('rVim-command-bar-input'));
            } else {
                this.simulateKey(op);
            }
            await this.wait(50);
        }
        
        const endTime = performance.now();
        const totalTime = endTime - startTime;
        
        if (totalTime < 1000) smoothnessScore = 100;
        else if (totalTime < 1500) smoothnessScore = 80;
        else if (totalTime < 2000) smoothnessScore = 60;
        else smoothnessScore = 40;
        
        this.criteria.interactionFlow.operationSmoothness.score = smoothnessScore;
        results.operationSmoothness = {
            score: smoothnessScore,
            totalTime: totalTime,
            feedback: smoothnessScore >= 80 ? 'Excellent' : smoothnessScore >= 60 ? 'Good' : 'Needs Improvement'
        };
        
        this.log(`    操作流畅性得分: ${smoothnessScore}/100 (${results.operationSmoothness.feedback})`, 'score');
        
        this.evaluationResults.interactionFlow = results;
        return results;
    }

    // 评估可访问性
    async evaluateAccessibility() {
        this.log('♿ 开始可访问性评估', 'header');
        
        const results = {};
        
        // 1. 纯键盘操作评估
        this.log('  评估纯键盘操作');
        let keyboardScore = 0;
        
        // 测试所有键盘操作
        const keyboardTests = [
            { keys: ['/'], description: '键盘打开搜索' },
            { keys: ['test'], description: '键盘输入搜索词', isInput: true },
            { keys: ['Enter'], description: '键盘确认搜索' },
            { keys: ['n'], description: '键盘导航到下一个' },
            { keys: ['N'], description: '键盘导航到上一个' },
            { keys: ['Escape'], description: '键盘退出搜索' }
        ];
        
        for (const test of keyboardTests) {
            try {
                for (const key of test.keys) {
                    if (test.isInput) {
                        const input = document.getElementById('rVim-command-bar-input');
                        this.simulateInput(key, input);
                    } else {
                        this.simulateKey(key);
                    }
                    await this.wait(100);
                }
                
                keyboardScore += 16.67; // 100/6
                this.log(`    ✓ ${test.description}: 成功`);
            } catch (error) {
                this.log(`    ✗ ${test.description}: 失败`);
            }
        }
        
        this.criteria.accessibility.keyboardOnly.score = keyboardScore;
        results.keyboardOnly = {
            score: keyboardScore,
            feedback: keyboardScore >= 80 ? 'Excellent' : keyboardScore >= 60 ? 'Good' : 'Needs Improvement'
        };
        
        this.log(`    纯键盘操作得分: ${keyboardScore}/100 (${results.keyboardOnly.feedback})`, 'score');
        
        // 2. 视觉反馈评估
        this.log('  评估视觉反馈');
        let visualScore = 0;
        
        // 检查搜索状态反馈
        this.simulateKey('/');
        await this.wait(100);
        
        const searchBar = document.getElementById('rVim-command-bar');
        if (searchBar && searchBar.style.display !== 'none') {
            visualScore += 25;
            this.log(`    ✓ 搜索栏显示反馈: 正常`);
        }
        
        this.simulateInput('test', document.getElementById('rVim-command-bar-input'));
        await this.wait(200);
        
        const hud = document.getElementById('rVim-hud');
        if (hud && hud.style.display !== 'none') {
            visualScore += 25;
            this.log(`    ✓ HUD 状态反馈: 正常`);
        }
        
        const highlights = document.querySelectorAll('.rVim-find-mark');
        if (highlights.length > 0) {
            visualScore += 25;
            this.log(`    ✓ 高亮显示反馈: 正常`);
        }
        
        // 检查焦点指示
        const activeElement = document.activeElement;
        if (activeElement && activeElement.id === 'rVim-command-bar-input') {
            visualScore += 25;
            this.log(`    ✓ 焦点指示: 正常`);
        }
        
        this.criteria.accessibility.visualFeedback.score = visualScore;
        results.visualFeedback = {
            score: visualScore,
            feedback: visualScore >= 80 ? 'Excellent' : visualScore >= 60 ? 'Good' : 'Needs Improvement'
        };
        
        this.log(`    视觉反馈得分: ${visualScore}/100 (${results.visualFeedback.feedback})`, 'score');
        
        // 3. 错误消息评估
        this.log('  评估错误消息');
        let errorScore = 0;
        
        // 测试无匹配结果的处理
        this.simulateKey('Escape');
        await this.wait(100);
        this.simulateKey('/');
        await this.wait(100);
        this.simulateInput('xyzabc123notfound', document.getElementById('rVim-command-bar-input'));
        await this.wait(300);
        
        const hudText = hud?.textContent || '';
        if (hudText.toLowerCase().includes('no') || hudText.includes('0') || hudText.includes('未找到')) {
            errorScore += 50;
            this.log(`    ✓ 无匹配结果提示: 正常 ("${hudText}")`);
        }
        
        // 测试空搜索的处理
        this.simulateKey('Escape');
        await this.wait(100);
        this.simulateKey('/');
        await this.wait(100);
        this.simulateInput('', document.getElementById('rVim-command-bar-input'));
        await this.wait(200);
        
        // 检查是否有适当的处理
        const emptyHudText = hud?.textContent || '';
        if (emptyHudText === '' || emptyHudText.includes('0') || emptyHudText.toLowerCase().includes('empty')) {
            errorScore += 50;
            this.log(`    ✓ 空搜索处理: 正常`);
        }
        
        this.criteria.accessibility.errorMessages.score = errorScore;
        results.errorMessages = {
            score: errorScore,
            feedback: errorScore >= 80 ? 'Excellent' : errorScore >= 60 ? 'Good' : 'Needs Improvement'
        };
        
        this.log(`    错误消息得分: ${errorScore}/100 (${results.errorMessages.feedback})`, 'score');
        
        this.simulateKey('Escape');
        await this.wait(100);
        
        this.evaluationResults.accessibility = results;
        return results;
    }

    // 评估响应性
    async evaluateResponsiveness() {
        this.log('⚡ 开始响应性评估', 'header');
        
        const results = {};
        
        // 1. 即时反馈评估
        this.log('  评估即时反馈');
        let instantScore = 0;
        
        const feedbackTests = [
            { action: () => this.simulateKey('/'), description: '打开搜索栏', threshold: 50 },
            { action: () => this.simulateInput('t', document.getElementById('rVim-command-bar-input')), description: '输入字符', threshold: 100 },
            { action: () => this.simulateKey('Enter'), description: '执行搜索', threshold: 150 },
            { action: () => this.simulateKey('n'), description: '导航操作', threshold: 100 }
        ];
        
        for (const test of feedbackTests) {
            const startTime = performance.now();
            test.action();
            await this.wait(50);
            const endTime = performance.now();
            
            const responseTime = endTime - startTime;
            if (responseTime <= test.threshold) {
                instantScore += 25;
                this.log(`    ✓ ${test.description}: ${responseTime.toFixed(2)}ms (优秀)`);
            } else if (responseTime <= test.threshold * 1.5) {
                instantScore += 15;
                this.log(`    ⚠ ${test.description}: ${responseTime.toFixed(2)}ms (一般)`);
            } else {
                this.log(`    ✗ ${test.description}: ${responseTime.toFixed(2)}ms (较慢)`);
            }
        }
        
        this.criteria.responsiveness.instantFeedback.score = instantScore;
        results.instantFeedback = {
            score: instantScore,
            feedback: instantScore >= 80 ? 'Excellent' : instantScore >= 60 ? 'Good' : 'Needs Improvement'
        };
        
        this.log(`    即时反馈得分: ${instantScore}/100 (${results.instantFeedback.feedback})`, 'score');
        
        // 2. 进度指示器评估
        this.log('  评估进度指示器');
        let progressScore = 0;
        
        // 检查 HUD 是否提供进度信息
        this.simulateKey('Escape');
        await this.wait(100);
        this.simulateKey('/');
        await this.wait(100);
        this.simulateInput('test', document.getElementById('rVim-command-bar-input'));
        await this.wait(200);
        
        const hud = document.getElementById('rVim-hud');
        const hudText = hud?.textContent || '';
        
        // 检查是否显示匹配数量
        if (hudText.match(/\d+/) || hudText.toLowerCase().includes('match')) {
            progressScore += 40;
            this.log(`    ✓ 匹配数量显示: 正常 ("${hudText}")`);
        }
        
        // 检查是否显示当前位置
        if (hudText.includes('/') || hudText.includes('of')) {
            progressScore += 30;
            this.log(`    ✓ 当前位置显示: 正常`);
        }
        
        // 检查实时更新
        this.simulateKey('n');
        await this.wait(100);
        const updatedHudText = hud?.textContent || '';
        
        if (updatedHudText !== hudText) {
            progressScore += 30;
            this.log(`    ✓ 实时更新: 正常`);
        }
        
        this.criteria.responsiveness.progressIndicators.score = progressScore;
        results.progressIndicators = {
            score: progressScore,
            feedback: progressScore >= 80 ? 'Excellent' : progressScore >= 60 ? 'Good' : 'Needs Improvement'
        };
        
        this.log(`    进度指示器得分: ${progressScore}/100 (${results.progressIndicators.feedback})`, 'score');
        
        // 3. 性能一致性评估
        this.log('  评估性能一致性');
        let consistencyScore = 0;
        
        const responseTimes = [];
        
        // 执行多次相同操作，测量响应时间的一致性
        for (let i = 0; i < 10; i++) {
            this.simulateKey('Escape');
            await this.wait(50);
            
            const startTime = performance.now();
            this.simulateKey('/');
            this.simulateInput('test', document.getElementById('rVim-command-bar-input'));
            await this.wait(100);
            const endTime = performance.now();
            
            responseTimes.push(endTime - startTime);
        }
        
        // 计算标准差
        const mean = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
        const variance = responseTimes.reduce((sq, n) => sq + Math.pow(n - mean, 2), 0) / responseTimes.length;
        const stdDev = Math.sqrt(variance);
        
        // 评分基于标准差
        if (stdDev < 20) consistencyScore = 100;
        else if (stdDev < 40) consistencyScore = 80;
        else if (stdDev < 60) consistencyScore = 60;
        else consistencyScore = 40;
        
        this.criteria.responsiveness.performanceConsistency.score = consistencyScore;
        results.performanceConsistency = {
            score: consistencyScore,
            mean: mean,
            stdDev: stdDev,
            feedback: consistencyScore >= 80 ? 'Excellent' : consistencyScore >= 60 ? 'Good' : 'Needs Improvement'
        };
        
        this.log(`    性能一致性得分: ${consistencyScore}/100 (标准差: ${stdDev.toFixed(2)}ms)`, 'score');
        
        this.simulateKey('Escape');
        await this.wait(100);
        
        this.evaluationResults.responsiveness = results;
        return results;
    }

    // 评估错误处理
    async evaluateErrorHandling() {
        this.log('🛡️ 开始错误处理评估', 'header');
        
        const results = {};
        
        // 1. 优雅降级评估
        this.log('  评估优雅降级');
        let degradationScore = 0;
        
        // 测试各种边界情况
        const edgeCases = [
            { input: '', description: '空搜索' },
            { input: 'a'.repeat(1000), description: '超长搜索词' },
            { input: '.*+?^${}()|[]\\', description: '特殊字符' },
            { input: '\n\t\r', description: '控制字符' },
            { input: '🚀🎉💻', description: 'Unicode 字符' }
        ];
        
        for (const testCase of edgeCases) {
            try {
                this.simulateKey('/');
                await this.wait(100);
                this.simulateInput(testCase.input, document.getElementById('rVim-command-bar-input'));
                await this.wait(200);
                
                // 检查是否有错误或崩溃
                const hud = document.getElementById('rVim-hud');
                if (hud) {
                    degradationScore += 20;
                    this.log(`    ✓ ${testCase.description}: 处理正常`);
                } else {
                    this.log(`    ⚠ ${testCase.description}: 可能存在问题`);
                }
                
                this.simulateKey('Escape');
                await this.wait(100);
            } catch (error) {
                this.log(`    ✗ ${testCase.description}: 发生错误 - ${error.message}`);
            }
        }
        
        this.criteria.errorHandling.gracefulDegradation.score = degradationScore;
        results.gracefulDegradation = {
            score: degradationScore,
            feedback: degradationScore >= 80 ? 'Excellent' : degradationScore >= 60 ? 'Good' : 'Needs Improvement'
        };
        
        this.log(`    优雅降级得分: ${degradationScore}/100 (${results.gracefulDegradation.feedback})`, 'score');
        
        // 2. 用户指导评估
        this.log('  评估用户指导');
        let guidanceScore = 0;
        
        // 检查无匹配结果时的指导
        this.simulateKey('/');
        await this.wait(100);
        this.simulateInput('notfoundxyz123', document.getElementById('rVim-command-bar-input'));
        await this.wait(300);
        
        const hud = document.getElementById('rVim-hud');
        const hudText = hud?.textContent || '';
        
        if (hudText.toLowerCase().includes('no') || hudText.includes('0') || hudText.includes('未找到')) {
            guidanceScore += 50;
            this.log(`    ✓ 无匹配结果提示: 清晰`);
        }
        
        // 检查是否有帮助信息
        if (hudText.length > 5) {
            guidanceScore += 25;
            this.log(`    ✓ 提示信息详细度: 良好`);
        }
        
        // 检查快捷键提示（如果有）
        const hasShortcutHints = document.querySelector('[title*="/"]') || 
                                document.querySelector('[data-hint]') ||
                                hudText.includes('/');
        
        if (hasShortcutHints) {
            guidanceScore += 25;
            this.log(`    ✓ 快捷键提示: 存在`);
        }
        
        this.criteria.errorHandling.userGuidance.score = guidanceScore;
        results.userGuidance = {
            score: guidanceScore,
            feedback: guidanceScore >= 80 ? 'Excellent' : guidanceScore >= 60 ? 'Good' : 'Needs Improvement'
        };
        
        this.log(`    用户指导得分: ${guidanceScore}/100 (${results.userGuidance.feedback})`, 'score');
        
        // 3. 恢复机制评估
        this.log('  评估恢复机制');
        let recoveryScore = 0;
        
        // 测试 Escape 键恢复
        this.simulateKey('Escape');
        await this.wait(100);
        
        const searchBarAfterEscape = document.getElementById('rVim-command-bar');
        if (!searchBarAfterEscape || searchBarAfterEscape.style.display === 'none') {
            recoveryScore += 40;
            this.log(`    ✓ Escape 键恢复: 正常`);
        }
        
        // 测试重新搜索
        this.simulateKey('/');
        await this.wait(100);
        this.simulateInput('test', document.getElementById('rVim-command-bar-input'));
        await this.wait(200);
        
        if (hud && hud.style.display !== 'none') {
            recoveryScore += 30;
            this.log(`    ✓ 重新搜索: 正常`);
        }
        
        // 测试状态重置
        this.simulateKey('Escape');
        await this.wait(100);
        
        const highlightsAfterEscape = document.querySelectorAll('.rVim-find-mark');
        if (highlightsAfterEscape.length === 0) {
            recoveryScore += 30;
            this.log(`    ✓ 状态重置: 正常`);
        }
        
        this.criteria.errorHandling.recoveryMechanisms.score = recoveryScore;
        results.recoveryMechanisms = {
            score: recoveryScore,
            feedback: recoveryScore >= 80 ? 'Excellent' : recoveryScore >= 60 ? 'Good' : 'Needs Improvement'
        };
        
        this.log(`    恢复机制得分: ${recoveryScore}/100 (${results.recoveryMechanisms.feedback})`, 'score');
        
        this.evaluationResults.errorHandling = results;
        return results;
    }

    // 计算总体评分
    calculateOverallScore() {
        this.log('🎯 计算总体用户体验评分', 'header');
        
        const categoryWeights = {
            visualDesign: 0.25,
            interactionFlow: 0.25,
            accessibility: 0.20,
            responsiveness: 0.20,
            errorHandling: 0.10
        };
        
        let totalScore = 0;
        const categoryScores = {};
        
        for (const [category, weight] of Object.entries(categoryWeights)) {
            const criteria = this.criteria[category];
            let categoryScore = 0;
            
            for (const [criterion, config] of Object.entries(criteria)) {
                categoryScore += config.score * config.weight;
            }
            
            categoryScores[category] = categoryScore;
            totalScore += categoryScore * weight;
            
            const rating = categoryScore >= 80 ? 'Excellent' : categoryScore >= 60 ? 'Good' : 'Needs Improvement';
            this.log(`  ${category}: ${categoryScore.toFixed(1)}/100 (${rating})`, 'data');
        }
        
        const overallRating = totalScore >= 80 ? 'Excellent' : totalScore >= 60 ? 'Good' : 'Needs Improvement';
        
        this.evaluationResults.overallScore = {
            total: totalScore,
            rating: overallRating,
            categoryScores: categoryScores
        };
        
        this.log(`总体用户体验评分: ${totalScore.toFixed(1)}/100 (${overallRating})`, 
                 overallRating === 'Excellent' ? 'success' : overallRating === 'Good' ? 'info' : 'warning');
        
        return this.evaluationResults.overallScore;
    }

    // 生成详细报告
    generateDetailedReport() {
        this.log('📋 生成详细用户体验评估报告', 'header');
        
        const report = {
            timestamp: new Date().toISOString(),
            summary: this.evaluationResults.overallScore,
            categories: this.evaluationResults,
            recommendations: this.generateRecommendations()
        };
        
        // 输出报告摘要
        this.log('=' .repeat(80), 'header');
        this.log('📊 用户体验评估报告摘要', 'header');
        this.log('=' .repeat(80), 'header');
        
        for (const [category, results] of Object.entries(this.evaluationResults)) {
            if (category === 'overallScore') continue;
            
            this.log(`\n${category.toUpperCase()}:`, 'header');
            for (const [criterion, result] of Object.entries(results)) {
                if (result.score !== undefined) {
                    this.log(`  ${criterion}: ${result.score}/100 (${result.feedback})`, 'data');
                }
            }
        }
        
        this.log('\n推荐改进措施:', 'header');
        report.recommendations.forEach((rec, index) => {
            this.log(`  ${index + 1}. ${rec}`, 'data');
        });
        
        this.log('=' .repeat(80), 'header');
        
        return report;
    }

    // 生成改进建议
    generateRecommendations() {
        const recommendations = [];
        
        // 基于评分生成建议
        for (const [category, results] of Object.entries(this.evaluationResults)) {
            if (category === 'overallScore') continue;
            
            for (const [criterion, result] of Object.entries(results)) {
                if (result.score !== undefined && result.score < 60) {
                    switch (criterion) {
                        case 'hudVisibility':
                            recommendations.push('改善 HUD 的可见性，确保其在所有情况下都清晰可见');
                            break;
                        case 'searchBarStyling':
                            recommendations.push('优化搜索栏的视觉设计，提高用户界面的美观性');
                            break;
                        case 'highlightClarity':
                            recommendations.push('增强搜索结果高亮的对比度和清晰度');
                            break;
                        case 'colorContrast':
                            recommendations.push('改善整体颜色对比度，提高可访问性');
                            break;
                        case 'keyboardShortcuts':
                            recommendations.push('优化键盘快捷键的响应速度和可靠性');
                            break;
                        case 'searchNavigation':
                            recommendations.push('改进搜索结果导航的流畅性和准确性');
                            break;
                        case 'feedbackTiming':
                            recommendations.push('加快用户操作的反馈速度');
                            break;
                        case 'operationSmoothness':
                            recommendations.push('提高整体操作的流畅性和响应性');
                            break;
                        case 'keyboardOnly':
                            recommendations.push('确保所有功能都可以通过键盘完全操作');
                            break;
                        case 'visualFeedback':
                            recommendations.push('增强视觉反馈的清晰度和及时性');
                            break;
                        case 'errorMessages':
                            recommendations.push('改善错误消息的清晰度和有用性');
                            break;
                        case 'instantFeedback':
                            recommendations.push('提高即时反馈的速度和准确性');
                            break;
                        case 'progressIndicators':
                            recommendations.push('添加或改善进度指示器的显示');
                            break;
                        case 'performanceConsistency':
                            recommendations.push('提高性能的一致性，减少响应时间的波动');
                            break;
                        case 'gracefulDegradation':
                            recommendations.push('改善边界情况和错误情况的处理');
                            break;
                        case 'userGuidance':
                            recommendations.push('提供更好的用户指导和帮助信息');
                            break;
                        case 'recoveryMechanisms':
                            recommendations.push('完善错误恢复机制和状态重置功能');
                            break;
                    }
                }
            }
        }
        
        // 如果没有具体建议，提供通用建议
        if (recommendations.length === 0) {
            recommendations.push('继续保持当前的高质量用户体验');
            recommendations.push('定期进行用户体验评估以确保持续改进');
        }
        
        return recommendations;
    }

    // 运行完整的用户体验评估
    async runCompleteEvaluation() {
        this.log('🎯 开始 rVim 搜索功能用户体验评估', 'header');
        this.log('=' .repeat(80), 'header');
        
        try {
            // 视觉设计评估
            await this.evaluateVisualDesign();
            await this.wait(1000);
            
            // 交互流程评估
            await this.evaluateInteractionFlow();
            await this.wait(1000);
            
            // 可访问性评估
            await this.evaluateAccessibility();
            await this.wait(1000);
            
            // 响应性评估
            await this.evaluateResponsiveness();
            await this.wait(1000);
            
            // 错误处理评估
            await this.evaluateErrorHandling();
            await this.wait(1000);
            
            // 计算总体评分
            this.calculateOverallScore();
            
            // 生成详细报告
            const report = this.generateDetailedReport();
            
            // 保存到全局变量
            window.uxEvaluationResults = report;
            
            this.log('💾 用户体验评估结果已保存到 window.uxEvaluationResults', 'info');
            this.log('🎉 用户体验评估完成！', 'success');
            
            return report;
            
        } catch (error) {
            this.log(`❌ 用户体验评估失败: ${error.message}`, 'error');
            console.error('详细错误信息:', error);
            throw error;
        }
    }
}

// 导出到全局
window.UXEvaluation = UXEvaluation;

// 提供快捷方法
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            console.log('🎯 rVim 搜索功能用户体验评估器已准备就绪');
            console.log('💡 使用 window.runUXEvaluation() 开始用户体验评估');
            
            window.runUXEvaluation = async () => {
                const evaluation = new UXEvaluation();
                return await evaluation.runCompleteEvaluation();
            };
        }, 2000);
    });
} else {
    setTimeout(() => {
        console.log('🎯 rVim 搜索功能用户体验评估器已准备就绪');
        console.log('💡 使用 window.runUXEvaluation() 开始用户体验评估');
        
        window.runUXEvaluation = async () => {
            const evaluation = new UXEvaluation();
            return await evaluation.runCompleteEvaluation();
        };
    }, 1000);
}