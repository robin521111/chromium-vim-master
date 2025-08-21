/**
 * Document Visibility State 优化器
 * 解决 document.visibilityState 频繁变化导致的性能问题
 */

var VisibilityStateOptimizer = {
  // 状态跟踪
  lastState: null,
  stateChangeCount: 0,
  debounceTimer: null,
  debounceDelay: 100, // 100ms防抖
  
  // 监听器管理
  listeners: [],
  originalAddEventListener: null,
  
  // 统计信息
  stats: {
    totalChanges: 0,
    debouncedChanges: 0,
    startTime: Date.now()
  },
  
  /**
   * 初始化优化器
   */
  init: function() {
    this.lastState = document.visibilityState;
    this.setupDebouncing();
    this.monitorStateChanges();
    this.optimizeEventListeners();
    console.log('VisibilityStateOptimizer: 已初始化');
  },
  
  /**
   * 设置防抖机制
   */
  setupDebouncing: function() {
    var self = this;
    
    // 保存原始的addEventListener
    this.originalAddEventListener = document.addEventListener;
    
    // 重写addEventListener以拦截visibilitychange事件
    document.addEventListener = function(type, listener, options) {
      if (type === 'visibilitychange') {
        self.addDebouncedListener(listener, options);
      } else {
        self.originalAddEventListener.call(document, type, listener, options);
      }
    };
  },
  
  /**
   * 添加防抖监听器
   */
  addDebouncedListener: function(listener, options) {
    var self = this;
    
    // 存储监听器信息
    this.listeners.push({
      original: listener,
      options: options,
      debounced: function(event) {
        // 清除之前的定时器
        if (self.debounceTimer) {
          clearTimeout(self.debounceTimer);
        }
        
        // 设置新的防抖定时器
        self.debounceTimer = setTimeout(function() {
          self.stats.debouncedChanges++;
          listener.call(document, event);
        }, self.debounceDelay);
      }
    });
    
    // 使用防抖版本的监听器
    var listenerInfo = this.listeners[this.listeners.length - 1];
    this.originalAddEventListener.call(document, 'visibilitychange', listenerInfo.debounced, options);
  },
  
  /**
   * 监控状态变化
   */
  monitorStateChanges: function() {
    var self = this;
    
    // 使用原始的addEventListener添加监控
    this.originalAddEventListener.call(document, 'visibilitychange', function() {
      self.stats.totalChanges++;
      
      var currentState = document.visibilityState;
      if (currentState !== self.lastState) {
        self.stateChangeCount++;
        self.lastState = currentState;
        
        // 如果变化过于频繁，记录警告
        if (self.stateChangeCount > 10) {
          console.warn('VisibilityStateOptimizer: 检测到频繁的可见性状态变化');
          self.logStats();
          self.stateChangeCount = 0; // 重置计数
        }
      }
    });
  },
  
  /**
   * 优化事件监听器
   */
  optimizeEventListeners: function() {
    var self = this;
    
    // 监听页面焦点变化，这通常与可见性变化相关
    window.addEventListener('focus', function() {
      self.handleFocusChange('focus');
    });
    
    window.addEventListener('blur', function() {
      self.handleFocusChange('blur');
    });
    
    // 监听页面卸载
    window.addEventListener('beforeunload', function() {
      self.cleanup();
    });
  },
  
  /**
   * 处理焦点变化
   */
  handleFocusChange: function(type) {
    // 延迟处理，避免与visibilitychange事件冲突
    setTimeout(function() {
      console.log(`VisibilityStateOptimizer: 窗口${type}事件`);
    }, 50);
  },
  
  /**
   * 记录统计信息
   */
  logStats: function() {
    var runtime = Date.now() - this.stats.startTime;
    var avgChangesPerSecond = (this.stats.totalChanges / (runtime / 1000)).toFixed(2);
    
    console.log('VisibilityStateOptimizer 统计信息:');
    console.log(`- 总变化次数: ${this.stats.totalChanges}`);
    console.log(`- 防抖后执行次数: ${this.stats.debouncedChanges}`);
    console.log(`- 运行时间: ${(runtime / 1000).toFixed(2)}秒`);
    console.log(`- 平均变化频率: ${avgChangesPerSecond}次/秒`);
    console.log(`- 优化效果: 减少了${this.stats.totalChanges - this.stats.debouncedChanges}次不必要的处理`);
  },
  
  /**
   * 获取当前状态
   */
  getCurrentState: function() {
    return {
      visibilityState: document.visibilityState,
      lastState: this.lastState,
      changeCount: this.stateChangeCount,
      stats: Object.assign({}, this.stats)
    };
  },
  
  /**
   * 手动触发状态检查
   */
  checkState: function() {
    var currentState = document.visibilityState;
    console.log(`VisibilityStateOptimizer: 当前状态 = ${currentState}`);
    return currentState;
  },
  
  /**
   * 调整防抖延迟
   */
  setDebounceDelay: function(delay) {
    this.debounceDelay = Math.max(50, Math.min(1000, delay)); // 限制在50-1000ms之间
    console.log(`VisibilityStateOptimizer: 防抖延迟设置为 ${this.debounceDelay}ms`);
  },
  
  /**
   * 清理资源
   */
  cleanup: function() {
    // 清除防抖定时器
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
    
    // 恢复原始的addEventListener
    if (this.originalAddEventListener) {
      document.addEventListener = this.originalAddEventListener;
    }
    
    // 记录最终统计
    this.logStats();
    
    console.log('VisibilityStateOptimizer: 已清理');
  },
  
  /**
   * 重置统计信息
   */
  resetStats: function() {
    this.stats = {
      totalChanges: 0,
      debouncedChanges: 0,
      startTime: Date.now()
    };
    this.stateChangeCount = 0;
    console.log('VisibilityStateOptimizer: 统计信息已重置');
  }
};

// 自动初始化
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      VisibilityStateOptimizer.init();
    });
  } else {
    VisibilityStateOptimizer.init();
  }
}

// 导出到全局作用域
if (typeof window !== 'undefined') {
  window.VisibilityStateOptimizer = VisibilityStateOptimizer;
}

console.log('VisibilityStateOptimizer: 可见性状态优化器已加载');