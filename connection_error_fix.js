/**
 * 连接错误修复脚本
 * 专门处理 'Could not establish connection. Receiving end does not exist' 错误
 */

var ConnectionErrorFix = {
  // 错误计数器
  errorCount: 0,
  maxRetries: 3,
  retryDelay: 1000, // 1秒
  
  // 连接状态
  connectionState: {
    port: null,
    isConnected: false,
    lastError: null,
    reconnectAttempts: 0
  },
  
  /**
   * 初始化连接错误修复
   */
  init: function() {
    this.setupErrorHandling();
    this.monitorConnection();
    this.setupReconnectionLogic();
  },
  
  /**
   * 设置错误处理
   */
  setupErrorHandling: function() {
    // 捕获未处理的Promise拒绝
    window.addEventListener('unhandledrejection', (event) => {
      if (event.reason && event.reason.message && 
          event.reason.message.includes('Could not establish connection')) {
        console.log('ConnectionErrorFix: 捕获到连接错误，尝试修复');
        this.handleConnectionError(event.reason);
        event.preventDefault();
      }
    });
    
    // 捕获运行时错误
    window.addEventListener('error', (event) => {
      if (event.message && event.message.includes('Could not establish connection')) {
        console.log('ConnectionErrorFix: 捕获到运行时连接错误');
        this.handleConnectionError(new Error(event.message));
      }
    });
  },
  
  /**
   * 监控连接状态
   */
  monitorConnection: function() {
    // 定期检查连接状态
    setInterval(() => {
      this.checkConnectionHealth();
    }, 5000); // 每5秒检查一次
  },
  
  /**
   * 检查连接健康状态
   */
  checkConnectionHealth: function() {
    if (typeof chrome !== 'undefined' && chrome.runtime) {
      try {
        // 尝试发送ping消息
        chrome.runtime.sendMessage({action: 'ping'}, (response) => {
          if (chrome.runtime.lastError) {
            console.log('ConnectionErrorFix: 检测到连接问题:', chrome.runtime.lastError.message);
            this.handleConnectionError(chrome.runtime.lastError);
          } else {
            this.connectionState.isConnected = true;
            this.connectionState.reconnectAttempts = 0;
          }
        });
      } catch (error) {
        console.log('ConnectionErrorFix: 连接检查失败:', error.message);
        this.handleConnectionError(error);
      }
    }
  },
  
  /**
   * 处理连接错误
   */
  handleConnectionError: function(error) {
    this.errorCount++;
    this.connectionState.lastError = error;
    this.connectionState.isConnected = false;
    
    console.log(`ConnectionErrorFix: 处理连接错误 #${this.errorCount}:`, error.message);
    
    // 如果错误次数超过最大重试次数，停止重试
    if (this.errorCount > this.maxRetries) {
      console.log('ConnectionErrorFix: 超过最大重试次数，停止重试');
      this.showPersistentError();
      return;
    }
    
    // 尝试重新连接
    this.attemptReconnection();
  },
  
  /**
   * 尝试重新连接
   */
  attemptReconnection: function() {
    this.connectionState.reconnectAttempts++;
    
    console.log(`ConnectionErrorFix: 尝试重新连接 #${this.connectionState.reconnectAttempts}`);
    
    setTimeout(() => {
      this.reconnectPort();
    }, this.retryDelay * this.connectionState.reconnectAttempts);
  },
  
  /**
   * 重新连接端口
   */
  reconnectPort: function() {
    try {
      // 清理旧连接
      if (this.connectionState.port) {
        try {
          this.connectionState.port.disconnect();
        } catch (e) {
          // 忽略断开连接时的错误
        }
      }
      
      // 创建新连接
      if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.connect) {
        this.connectionState.port = chrome.runtime.connect({name: 'main'});
        
        this.connectionState.port.onConnect.addListener(() => {
          console.log('ConnectionErrorFix: 重新连接成功');
          this.connectionState.isConnected = true;
          this.errorCount = 0;
          this.connectionState.reconnectAttempts = 0;
        });
        
        this.connectionState.port.onDisconnect.addListener(() => {
          console.log('ConnectionErrorFix: 连接断开');
          this.connectionState.isConnected = false;
          
          if (chrome.runtime.lastError) {
            this.handleConnectionError(chrome.runtime.lastError);
          }
        });
        
        // 更新全局port变量（如果存在）
        if (typeof port !== 'undefined') {
          port = this.connectionState.port;
        }
      }
    } catch (error) {
      console.log('ConnectionErrorFix: 重新连接失败:', error.message);
      this.handleConnectionError(error);
    }
  },
  
  /**
   * 设置重连逻辑
   */
  setupReconnectionLogic: function() {
    // 监听页面可见性变化
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && !this.connectionState.isConnected) {
        console.log('ConnectionErrorFix: 页面变为可见，检查连接状态');
        this.checkConnectionHealth();
      }
    });
    
    // 监听焦点变化
    window.addEventListener('focus', () => {
      if (!this.connectionState.isConnected) {
        console.log('ConnectionErrorFix: 窗口获得焦点，检查连接状态');
        this.checkConnectionHealth();
      }
    });
  },
  
  /**
   * 显示持久性错误
   */
  showPersistentError: function() {
    const errorMessage = '扩展连接出现问题，请尝试以下解决方案：\n' +
                        '1. 刷新当前页面\n' +
                        '2. 重启浏览器\n' +
                        '3. 禁用并重新启用扩展\n' +
                        '4. 检查扩展是否需要更新';
    
    // 使用HUD显示错误（如果可用）
    if (typeof HUD !== 'undefined') {
      HUD.display(errorMessage, 10, 'error');
    }
    
    // 使用ErrorHandler显示错误（如果可用）
    if (typeof ErrorHandler !== 'undefined') {
      ErrorHandler.showError('unknown_error', '扩展连接失败', 10);
    }
    
    console.error('ConnectionErrorFix:', errorMessage);
  },
  
  /**
   * 获取连接状态
   */
  getConnectionState: function() {
    return {
      isConnected: this.connectionState.isConnected,
      errorCount: this.errorCount,
      reconnectAttempts: this.connectionState.reconnectAttempts,
      lastError: this.connectionState.lastError ? this.connectionState.lastError.message : null
    };
  },
  
  /**
   * 重置错误计数
   */
  resetErrorCount: function() {
    this.errorCount = 0;
    this.connectionState.reconnectAttempts = 0;
    console.log('ConnectionErrorFix: 错误计数已重置');
  },
  
  /**
   * 手动触发重连
   */
  forceReconnect: function() {
    console.log('ConnectionErrorFix: 手动触发重连');
    this.connectionState.isConnected = false;
    this.attemptReconnection();
  }
};

// 自动初始化
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      ConnectionErrorFix.init();
    });
  } else {
    ConnectionErrorFix.init();
  }
}

// 导出到全局作用域
if (typeof window !== 'undefined') {
  window.ConnectionErrorFix = ConnectionErrorFix;
}

console.log('ConnectionErrorFix: 连接错误修复脚本已加载');