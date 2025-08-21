var HUD = {
  visible: false,
  slideDuration: 40,
  _performanceStats: {
    displayCount: 0,
    totalTime: 0,
    maxTime: 0,
    minTime: Infinity
  },
  _elementCache: null,
  _lastMessage: '',
  _lastDuration: 0,
  _statusType: 'normal', // 'normal', 'warning', 'error'
  _progressValue: 0,
  _animationFrame: null
};

// 性能监控函数
HUD._recordPerformance = function(duration) {
  this._performanceStats.displayCount++;
  this._performanceStats.totalTime += duration;
  this._performanceStats.maxTime = Math.max(this._performanceStats.maxTime, duration);
  this._performanceStats.minTime = Math.min(this._performanceStats.minTime, duration);
  
  // 性能警告
  if (duration > 50) {
    console.warn('⚠️ HUD display took', duration.toFixed(2), 'ms (target: <50ms)');
  }
};

// 获取性能统计
HUD.getPerformanceStats = function() {
  var stats = this._performanceStats;
  return {
    displayCount: stats.displayCount,
    averageTime: stats.displayCount > 0 ? stats.totalTime / stats.displayCount : 0,
    maxTime: stats.maxTime === -Infinity ? 0 : stats.maxTime,
    minTime: stats.minTime === Infinity ? 0 : stats.minTime,
    totalTime: stats.totalTime
  };
};

// 重置性能统计
HUD.resetPerformanceStats = function() {
  this._performanceStats = {
    displayCount: 0,
    totalTime: 0,
    maxTime: 0,
    minTime: Infinity
  };
};

// 优化的快速显示方法
HUD.fastDisplay = function(text) {
  if (!this.element || !this.visible) {
    return this.display(text);
  }
  
  // 直接更新文本，避免重新创建元素
  var span = this.element.firstElementChild;
  if (span && span.textContent !== text) {
    span.textContent = text;
    this._lastMessage = text;
  }
};

HUD.transitionEvent = function() {
  if (HUD.overflowValue) {
    document.body.style.overflowX = HUD.overflowValue;
  }
  delete HUD.overflowValue;
  HUD.element.removeEventListener('transitionend', HUD.transitionEvent, true);
  HUD.element.parentNode.removeChild(HUD.element);
  delete HUD.element;
  HUD.visible = false;
  HUD.transition = false;
};

HUD.hide = function(ignoreSetting) {
  if (!ignoreSetting) {
    if (!settings.hud || this.element === void 0) {
      return false;
    }
    if (Find.matches.length) {
      return HUD.display(Find.index + 1 + ' / ' + Find.matches.length);
    }
  }
  if (!this.element) {
    return false;
  }
  HUD.transition = true;
  this.element.addEventListener('transitionend', this.transitionEvent, true);
  var width = this.element.offsetWidth;
  this.element.style.right = -width + 'px';
};

HUD.setMessage = function(text, duration) {
  var startTime = performance.now();
  
  // 缓存检查：避免重复设置相同消息
  if (this._lastMessage === text && this._lastDuration === duration) {
    return true;
  }
  
  window.clearTimeout(this.hideTimeout);
  if (!settings.hud || this.element === void 0) {
    return false;
  }
  
  // 批量DOM更新
  requestAnimationFrame(() => {
    this.element.firstElementChild.textContent = text;
  });
  
  this._lastMessage = text;
  this._lastDuration = duration;
  
  if (duration) {
    this.hideTimeout = window.setTimeout(function() {
      HUD.hide();
    }, duration * 1000);
  }
  
  this._recordPerformance(performance.now() - startTime);
};

HUD.display = function(text, duration, statusType) {
  var startTime = performance.now();
  
  // 快速缓存检查
  if (this._lastMessage === text && this._statusType === statusType && this._lastDuration === duration && this.visible) {
    this._pulseHUD();
    return true;
  }
  
  if (HUD.visible && HUD.transition) {
    this.element.removeEventListener('transitionend', this.transitionEvent, true);
    if (this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
    delete this.element;
  }
  
  this._statusType = statusType || 'normal';
  HUD.visible = true;
  if (!settings.hud || HUD.element !== void 0) {
    return HUD.setMessage(text, duration);
  }
  
  if (this.element) {
    this.element.removeEventListener('transitionend', this.transitionEvent, true);
    if (this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
    delete this.element;
  }
  
  window.clearTimeout(this.hideTimeout);
  
  // 元素缓存和重用
  if (!this._elementCache) {
    this._elementCache = document.createElement('div');
    this._elementCache.id = 'rVim-hud';
    
    // 预设样式以减少重排
    this._elementCache.style.cssText = `
      position: fixed !important;
      right: 10px !important;
      bottom: 10px !important;
      z-index: 24724289 !important;
      will-change: transform, opacity !important;
      transition: opacity 0.15s ease-out, transform 0.2s ease-out !important;
    `;
  }
  
  this.element = this._elementCache;
  
  if (Command.onBottom) {
    this.element.style.bottom = 'initial';
    this.element.style.top = '0';
  } else {
    this.element.style.bottom = '10px';
    this.element.style.top = 'initial';
  }
  
  // 批量DOM操作
  if (this._animationFrame) {
    window.cancelAnimationFrame(this._animationFrame);
  }
  
  this._animationFrame = requestAnimationFrame(() => {
    SecurityUtils.safeClearContent(this.element);
    
    // 添加状态指示器
    var statusIndicator = document.createElement('span');
    statusIndicator.className = 'rVim-status-indicator';
    if (this._statusType === 'warning') {
      statusIndicator.classList.add('warning');
      this.element.style.borderLeftColor = '#FFC107';
    } else if (this._statusType === 'error') {
      statusIndicator.classList.add('error');
      this.element.style.borderLeftColor = '#FF5252';
    } else {
      this.element.style.borderLeftColor = '#4CAF50';
    }
    this.element.appendChild(statusIndicator);
    
    var span = document.createElement('span');
    span.textContent = text;
    this.element.appendChild(span);
    
    // 应用入场动画
    this.element.style.opacity = '0';
    this.element.style.transform = 'translateY(5px)';
    
    // 优化的DOM插入
    try {
      if (!this.element.parentNode) {
        (document.lastElementChild || document.body).appendChild(this.element);
      }
    } catch (e) {
      if (document.body) {
        document.body.appendChild(this.element);
      }
    }
    
    // 强制重绘并应用动画
    this.element.offsetHeight;
    this.element.style.opacity = '1';
    this.element.style.transform = 'translateY(0)';
    
    // 优化的溢出处理
    var screenWidth = document.documentElement.clientWidth;
    var pageWidth = document.body.scrollWidth;
    if (screenWidth === pageWidth) {
      this.overflowValue = getComputedStyle(document.body).overflowX;
      document.body.style.overflowX = 'hidden';
    }
    
    this._animationFrame = null;
  });
  
  this._lastMessage = text;
  this._lastDuration = duration;
  
  if (duration) {
    this.hideTimeout = window.setTimeout(function() {
      HUD.hide();
    }, duration * 1000);
  }
  
  this._recordPerformance(performance.now() - startTime);
};

HUD._pulseHUD = function() {
  if (!this.element) return;
  
  // 添加脉冲动画
  this.element.classList.add('pulse');
  
  // 移除脉冲动画类
  setTimeout(() => {
    this.element.classList.remove('pulse');
  }, 500);
};

// 显示进度指示器
HUD.showProgress = function(progress, operation, estimatedTime) {
  this._progressValue = Math.max(0, Math.min(100, progress));
  
  var progressText = (operation || '处理中') + ': ' + this._progressValue + '%';
  if (estimatedTime && estimatedTime > 0) {
    var timeText = estimatedTime < 60 ? 
      Math.ceil(estimatedTime) + '秒' : 
      Math.ceil(estimatedTime / 60) + '分钟';
    progressText += ' (预计剩余: ' + timeText + ')';
  }
  
  this.display(progressText, 0, 'normal');
  this._updateProgressBar();
};

// 更新进度条显示
HUD._updateProgressBar = function() {
  if (!this.element) return;
  
  var progressBar = this.element.querySelector('.rVim-progress-bar');
  if (!progressBar) {
    var progressContainer = document.createElement('div');
    progressContainer.className = 'rVim-progress';
    
    progressBar = document.createElement('div');
    progressBar.className = 'rVim-progress-bar';
    
    progressContainer.appendChild(progressBar);
    this.element.appendChild(progressContainer);
  }
  
  progressBar.style.width = this._progressValue + '%';
  
  // 进度完成时自动隐藏
  if (this._progressValue >= 100) {
    var self = this;
    setTimeout(function() {
      self.hideProgress();
    }, 1000);
  }
};

// 隐藏进度指示器
HUD.hideProgress = function() {
  if (this.element) {
    var progressContainer = this.element.querySelector('.rVim-progress');
    if (progressContainer) {
      progressContainer.parentNode.removeChild(progressContainer);
    }
  }
  this._progressValue = 0;
};
