/**
 * 系统健康检查器
 * 全面检查和测试修复后的系统稳定性和功能完整性
 */

var SystemHealthChecker = {
  // 测试结果
  testResults: {
    connection: { status: 'pending', details: [] },
    messaging: { status: 'pending', details: [] },
    visibility: { status: 'pending', details: [] },
    performance: { status: 'pending', details: [] },
    overall: { status: 'pending', score: 0 }
  },
  
  // 测试配置
  config: {
    timeout: 5000, // 5秒超时
    retryCount: 3,
    performanceThreshold: 100 // 100ms性能阈值
  },
  
  /**
   * 开始全面健康检查
   */
  runFullHealthCheck: function() {
    console.log('SystemHealthChecker: 开始全面系统健康检查');
    
    this.resetResults();
    
    // 按顺序执行测试
    this.testConnectionHealth()
      .then(() => this.testMessagingSystem())
      .then(() => this.testVisibilityOptimization())
      .then(() => this.testPerformance())
      .then(() => this.generateReport())
      .catch(error => {
        console.error('SystemHealthChecker: 健康检查失败:', error);
        this.testResults.overall.status = 'failed';
        this.generateReport();
      });
  },
  
  /**
   * 重置测试结果
   */
  resetResults: function() {
    Object.keys(this.testResults).forEach(key => {
      if (key !== 'overall') {
        this.testResults[key] = { status: 'pending', details: [] };
      }
    });
    this.testResults.overall = { status: 'pending', score: 0 };
  },
  
  /**
   * 测试连接健康状态
   */
  testConnectionHealth: function() {
    return new Promise((resolve, reject) => {
      console.log('SystemHealthChecker: 测试连接健康状态');
      
      const startTime = Date.now();
      const details = [];
      
      try {
        // 检查ConnectionErrorFix是否存在并正常工作
        if (typeof ConnectionErrorFix !== 'undefined') {
          details.push('✓ ConnectionErrorFix 模块已加载');
          
          const connectionState = ConnectionErrorFix.getConnectionState();
          details.push(`✓ 连接状态: ${connectionState.isConnected ? '已连接' : '未连接'}`);
          details.push(`✓ 错误计数: ${connectionState.errorCount}`);
          details.push(`✓ 重连尝试: ${connectionState.reconnectAttempts}`);
          
          if (connectionState.errorCount === 0) {
            details.push('✓ 无连接错误');
          } else {
            details.push(`⚠ 检测到 ${connectionState.errorCount} 个连接错误`);
          }
        } else {
          details.push('✗ ConnectionErrorFix 模块未加载');
        }
        
        // 检查端口连接
        if (typeof port !== 'undefined' && port) {
          details.push('✓ 端口对象存在');
          
          // 尝试发送ping消息
          try {
            port.postMessage({ action: 'ping', timestamp: Date.now() });
            details.push('✓ 端口消息发送成功');
          } catch (error) {
            details.push(`✗ 端口消息发送失败: ${error.message}`);
          }
        } else {
          details.push('✗ 端口对象不存在或无效');
        }
        
        // 检查chrome.runtime连接
        if (typeof chrome !== 'undefined' && chrome.runtime) {
          details.push('✓ Chrome runtime 可用');
          
          if (chrome.runtime.lastError) {
            details.push(`⚠ Runtime 错误: ${chrome.runtime.lastError.message}`);
          } else {
            details.push('✓ 无 runtime 错误');
          }
        } else {
          details.push('✗ Chrome runtime 不可用');
        }
        
        const duration = Date.now() - startTime;
        details.push(`✓ 连接测试完成，耗时: ${duration}ms`);
        
        this.testResults.connection = {
          status: details.some(d => d.startsWith('✗')) ? 'failed' : 'passed',
          details: details
        };
        
        resolve();
      } catch (error) {
        details.push(`✗ 连接测试异常: ${error.message}`);
        this.testResults.connection = { status: 'failed', details: details };
        reject(error);
      }
    });
  },
  
  /**
   * 测试消息传递系统
   */
  testMessagingSystem: function() {
    return new Promise((resolve, reject) => {
      console.log('SystemHealthChecker: 测试消息传递系统');
      
      const startTime = Date.now();
      const details = [];
      
      try {
        // 检查RUNTIME函数
        if (typeof RUNTIME !== 'undefined') {
          details.push('✓ RUNTIME 函数可用');
        } else {
          details.push('✗ RUNTIME 函数不可用');
        }
        
        // 检查PORT函数
        if (typeof PORT !== 'undefined') {
          details.push('✓ PORT 函数可用');
        } else {
          details.push('✗ PORT 函数不可用');
        }
        
        // 检查消息监听器
        if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
          details.push('✓ 消息监听器可用');
        } else {
          details.push('✗ 消息监听器不可用');
        }
        
        // 测试消息发送（如果可能）
        let messageSent = false;
        if (typeof RUNTIME !== 'undefined') {
          try {
            RUNTIME('ping', { timestamp: Date.now() }, function(response) {
              details.push('✓ 消息发送和回调成功');
              messageSent = true;
            });
            details.push('✓ 消息发送尝试成功');
          } catch (error) {
            details.push(`✗ 消息发送失败: ${error.message}`);
          }
        }
        
        const duration = Date.now() - startTime;
        details.push(`✓ 消息系统测试完成，耗时: ${duration}ms`);
        
        this.testResults.messaging = {
          status: details.some(d => d.startsWith('✗')) ? 'failed' : 'passed',
          details: details
        };
        
        resolve();
      } catch (error) {
        details.push(`✗ 消息系统测试异常: ${error.message}`);
        this.testResults.messaging = { status: 'failed', details: details };
        reject(error);
      }
    });
  },
  
  /**
   * 测试可见性优化
   */
  testVisibilityOptimization: function() {
    return new Promise((resolve, reject) => {
      console.log('SystemHealthChecker: 测试可见性优化');
      
      const startTime = Date.now();
      const details = [];
      
      try {
        // 检查VisibilityStateOptimizer是否存在
        if (typeof VisibilityStateOptimizer !== 'undefined') {
          details.push('✓ VisibilityStateOptimizer 模块已加载');
          
          const currentState = VisibilityStateOptimizer.getCurrentState();
          details.push(`✓ 当前可见性状态: ${currentState.visibilityState}`);
          details.push(`✓ 状态变化次数: ${currentState.changeCount}`);
          details.push(`✓ 总变化次数: ${currentState.stats.totalChanges}`);
          details.push(`✓ 防抖后执行次数: ${currentState.stats.debouncedChanges}`);
          
          // 计算优化效果
          const optimizationRate = currentState.stats.totalChanges > 0 ? 
            ((currentState.stats.totalChanges - currentState.stats.debouncedChanges) / currentState.stats.totalChanges * 100).toFixed(1) : 0;
          details.push(`✓ 优化效果: 减少了 ${optimizationRate}% 的不必要处理`);
          
          // 测试手动状态检查
          const manualState = VisibilityStateOptimizer.checkState();
          details.push(`✓ 手动状态检查: ${manualState}`);
        } else {
          details.push('✗ VisibilityStateOptimizer 模块未加载');
        }
        
        // 检查document.visibilityState
        details.push(`✓ 原生可见性状态: ${document.visibilityState}`);
        
        const duration = Date.now() - startTime;
        details.push(`✓ 可见性优化测试完成，耗时: ${duration}ms`);
        
        this.testResults.visibility = {
          status: details.some(d => d.startsWith('✗')) ? 'failed' : 'passed',
          details: details
        };
        
        resolve();
      } catch (error) {
        details.push(`✗ 可见性优化测试异常: ${error.message}`);
        this.testResults.visibility = { status: 'failed', details: details };
        reject(error);
      }
    });
  },
  
  /**
   * 测试性能
   */
  testPerformance: function() {
    return new Promise((resolve, reject) => {
      console.log('SystemHealthChecker: 测试性能');
      
      const startTime = Date.now();
      const details = [];
      
      try {
        // 测试DOM操作性能
        const domStartTime = performance.now();
        const testElement = document.createElement('div');
        testElement.style.display = 'none';
        document.body.appendChild(testElement);
        document.body.removeChild(testElement);
        const domDuration = performance.now() - domStartTime;
        details.push(`✓ DOM操作性能: ${domDuration.toFixed(2)}ms`);
        
        // 测试事件处理性能
        const eventStartTime = performance.now();
        const testEvent = new Event('test');
        document.dispatchEvent(testEvent);
        const eventDuration = performance.now() - eventStartTime;
        details.push(`✓ 事件处理性能: ${eventDuration.toFixed(2)}ms`);
        
        // 检查内存使用（如果可用）
        if (performance.memory) {
          const memoryInfo = performance.memory;
          details.push(`✓ 内存使用: ${(memoryInfo.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB`);
          details.push(`✓ 内存限制: ${(memoryInfo.jsHeapSizeLimit / 1024 / 1024).toFixed(2)}MB`);
        }
        
        // 检查页面加载性能
        if (performance.timing) {
          const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
          if (loadTime > 0) {
            details.push(`✓ 页面加载时间: ${loadTime}ms`);
          }
        }
        
        const duration = Date.now() - startTime;
        details.push(`✓ 性能测试完成，耗时: ${duration}ms`);
        
        // 判断性能是否合格
        const performanceIssues = [];
        if (domDuration > this.config.performanceThreshold) {
          performanceIssues.push('DOM操作性能较慢');
        }
        if (eventDuration > this.config.performanceThreshold) {
          performanceIssues.push('事件处理性能较慢');
        }
        
        if (performanceIssues.length > 0) {
          details.push(`⚠ 性能问题: ${performanceIssues.join(', ')}`);
        }
        
        this.testResults.performance = {
          status: performanceIssues.length === 0 ? 'passed' : 'warning',
          details: details
        };
        
        resolve();
      } catch (error) {
        details.push(`✗ 性能测试异常: ${error.message}`);
        this.testResults.performance = { status: 'failed', details: details };
        reject(error);
      }
    });
  },
  
  /**
   * 生成健康检查报告
   */
  generateReport: function() {
    console.log('SystemHealthChecker: 生成健康检查报告');
    
    // 计算总体得分
    let totalScore = 0;
    let testCount = 0;
    
    Object.keys(this.testResults).forEach(key => {
      if (key !== 'overall') {
        testCount++;
        const result = this.testResults[key];
        if (result.status === 'passed') {
          totalScore += 100;
        } else if (result.status === 'warning') {
          totalScore += 70;
        } else if (result.status === 'failed') {
          totalScore += 0;
        }
      }
    });
    
    const averageScore = testCount > 0 ? Math.round(totalScore / testCount) : 0;
    
    // 确定总体状态
    let overallStatus = 'passed';
    if (averageScore < 50) {
      overallStatus = 'failed';
    } else if (averageScore < 80) {
      overallStatus = 'warning';
    }
    
    this.testResults.overall = {
      status: overallStatus,
      score: averageScore
    };
    
    // 输出报告
    console.log('\n=== 系统健康检查报告 ===');
    console.log(`总体状态: ${overallStatus.toUpperCase()}`);
    console.log(`总体得分: ${averageScore}/100`);
    console.log('');
    
    Object.keys(this.testResults).forEach(key => {
      if (key !== 'overall') {
        const result = this.testResults[key];
        console.log(`${key.toUpperCase()}: ${result.status.toUpperCase()}`);
        result.details.forEach(detail => {
          console.log(`  ${detail}`);
        });
        console.log('');
      }
    });
    
    // 提供建议
    this.generateRecommendations();
    
    // 如果有HUD，显示简要报告
    if (typeof HUD !== 'undefined') {
      const summary = `系统健康检查完成 - 得分: ${averageScore}/100 - 状态: ${overallStatus.toUpperCase()}`;
      HUD.display(summary, 5, overallStatus === 'passed' ? 'info' : 'warning');
    }
    
    return this.testResults;
  },
  
  /**
   * 生成改进建议
   */
  generateRecommendations: function() {
    console.log('=== 改进建议 ===');
    
    const recommendations = [];
    
    // 连接问题建议
    if (this.testResults.connection.status === 'failed') {
      recommendations.push('• 检查扩展权限和后台脚本状态');
      recommendations.push('• 尝试重新加载扩展或重启浏览器');
    }
    
    // 消息传递问题建议
    if (this.testResults.messaging.status === 'failed') {
      recommendations.push('• 检查消息监听器是否正确设置');
      recommendations.push('• 验证端口连接是否稳定');
    }
    
    // 可见性优化建议
    if (this.testResults.visibility.status === 'failed') {
      recommendations.push('• 确保VisibilityStateOptimizer正确加载');
      recommendations.push('• 检查页面可见性事件监听器');
    }
    
    // 性能问题建议
    if (this.testResults.performance.status !== 'passed') {
      recommendations.push('• 优化DOM操作，减少不必要的重绘');
      recommendations.push('• 使用防抖和节流技术优化事件处理');
      recommendations.push('• 定期清理不需要的事件监听器');
    }
    
    if (recommendations.length === 0) {
      console.log('✓ 系统运行良好，无需特别改进');
    } else {
      recommendations.forEach(rec => console.log(rec));
    }
    
    console.log('========================\n');
  },
  
  /**
   * 获取测试结果
   */
  getResults: function() {
    return this.testResults;
  },
  
  /**
   * 快速健康检查（简化版）
   */
  quickHealthCheck: function() {
    console.log('SystemHealthChecker: 执行快速健康检查');
    
    const issues = [];
    
    // 检查关键组件
    if (typeof ConnectionErrorFix === 'undefined') {
      issues.push('ConnectionErrorFix 未加载');
    }
    
    if (typeof VisibilityStateOptimizer === 'undefined') {
      issues.push('VisibilityStateOptimizer 未加载');
    }
    
    if (typeof port === 'undefined' || !port) {
      issues.push('端口连接异常');
    }
    
    if (typeof chrome === 'undefined' || !chrome.runtime) {
      issues.push('Chrome runtime 不可用');
    }
    
    if (issues.length === 0) {
      console.log('✓ 快速检查通过，系统状态良好');
      return { status: 'healthy', issues: [] };
    } else {
      console.log('⚠ 快速检查发现问题:');
      issues.forEach(issue => console.log(`  - ${issue}`));
      return { status: 'issues', issues: issues };
    }
  }
};

// 自动执行快速检查
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      setTimeout(() => SystemHealthChecker.quickHealthCheck(), 2000);
    });
  } else {
    setTimeout(() => SystemHealthChecker.quickHealthCheck(), 2000);
  }
}

// 导出到全局作用域
if (typeof window !== 'undefined') {
  window.SystemHealthChecker = SystemHealthChecker;
}

console.log('SystemHealthChecker: 系统健康检查器已加载');