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
  HUD._performanceStats.displayCount++;
  HUD._performanceStats.totalTime += duration;
  HUD._performanceStats.maxTime = Math.max(HUD._performanceStats.maxTime, duration);
  HUD._performanceStats.minTime = Math.min(HUD._performanceStats.minTime, duration);
  
  // 性能警告
  if (duration > 50) {
    console.warn('⚠️ HUD display took', duration.toFixed(2), 'ms (target: <50ms)');
  }
};

// 获取性能统计
HUD.getPerformanceStats = function() {
  var stats = HUD._performanceStats;
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
  HUD._performanceStats = {
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
  var span = HUD.element.firstElementChild;
  if (span && span.textContent !== text) {
    span.textContent = text;
    HUD._lastMessage = text;
  }
};

HUD.transitionEvent = function() {
  if (HUD.overflowValue) {
    SafeStyleManager.setOverflow('x', HUD.overflowValue, true);
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
    if (!settings.hud || HUD.element === void 0) {
      return false;
    }
    if (Find.matches.length) {
      return HUD.display(Find.index + 1 + ' / ' + Find.matches.length);
    }
  }
  if (!HUD.element) {
    return false;
  }
  HUD.transition = true;
  HUD.element.addEventListener('transitionend', HUD.transitionEvent, true);
  var width = HUD.element.offsetWidth;
  HUD.element.style.right = -width + 'px';
};

HUD.setMessage = function(text, duration) {
  var startTime = performance.now();
  
  // 缓存检查：避免重复设置相同消息
  if (HUD._lastMessage === text && HUD._lastDuration === duration) {
    return true;
  }
  
  window.clearTimeout(HUD.hideTimeout);
  if (!settings.hud || HUD.element === void 0) {
    return false;
  }
  
  // 批量DOM更新
  requestAnimationFrame(() => {
    HUD.element.firstElementChild.textContent = text;
  });
  
  HUD._lastMessage = text;
  HUD._lastDuration = duration;
  
  if (duration) {
    HUD.hideTimeout = window.setTimeout(function() {
      HUD.hide();
    }, duration * 1000);
  }
  
  HUD._recordPerformance(performance.now() - startTime);
};

HUD.display = function(text, duration, statusType) {
  var startTime = performance.now();
  
  // 快速缓存检查
  if (HUD._lastMessage === text && HUD._statusType === statusType && HUD._lastDuration === duration && HUD.visible) {
    HUD._pulseHUD();
    return true;
  }
  
  if (HUD.visible && HUD.transition) {
    HUD.element.removeEventListener('transitionend', HUD.transitionEvent, true);
    if (HUD.element.parentNode) {
      HUD.element.parentNode.removeChild(HUD.element);
    }
    delete HUD.element;
  }
  
  HUD._statusType = statusType || 'normal';
  HUD.visible = true;
  if (!settings.hud || HUD.element !== void 0) {
    return HUD.setMessage(text, duration);
  }
  
  if (HUD.element) {
    HUD.element.removeEventListener('transitionend', HUD.transitionEvent, true);
    if (HUD.element.parentNode) {
      HUD.element.parentNode.removeChild(HUD.element);
    }
    delete HUD.element;
  }
  
  window.clearTimeout(HUD.hideTimeout);
  
  // 元素缓存和重用
  if (!HUD._elementCache) {
    HUD._elementCache = document.createElement('div');
    HUD._elementCache.id = 'rVim-hud';
    
    // 预设样式以减少重排
    HUD._elementCache.style.cssText = `
      position: fixed !important;
      right: 10px !important;
      bottom: 10px !important;
      z-index: 24724289 !important;
      will-change: transform, opacity !important;
      transition: opacity 0.15s ease-out, transform 0.2s ease-out !important;
    `;
  }
  
  HUD.element = HUD._elementCache;
  
  if (Command.onBottom) {
    HUD.element.style.bottom = 'initial';
    HUD.element.style.top = '0';
  } else {
    HUD.element.style.bottom = '10px';
    HUD.element.style.top = 'initial';
  }
  
  // 批量DOM操作
  if (HUD._animationFrame) {
    window.cancelAnimationFrame(HUD._animationFrame);
  }
  
  HUD._animationFrame = requestAnimationFrame(() => {
    if (typeof SecurityUtils !== 'undefined' && SecurityUtils.safeClearContent) {
      SecurityUtils.safeClearContent(HUD.element);
    } else {
      // Fallback to safe clearing
      HUD.element.textContent = '';
    }
    
    // 添加状态指示器
    var statusIndicator = document.createElement('span');
    statusIndicator.className = 'rVim-status-indicator';
    if (HUD._statusType === 'warning') {
      statusIndicator.classList.add('warning');
      HUD.element.style.borderLeftColor = '#FFC107';
    } else if (HUD._statusType === 'error') {
      statusIndicator.classList.add('error');
      HUD.element.style.borderLeftColor = '#FF5252';
    } else {
      HUD.element.style.borderLeftColor = '#4CAF50';
    }
    HUD.element.appendChild(statusIndicator);
    
    var span = document.createElement('span');
    span.textContent = text;
    HUD.element.appendChild(span);
    
    // 应用入场动画
    HUD.element.style.opacity = '0';
    HUD.element.style.transform = 'translateY(5px)';
    
    // 优化的DOM插入
    try {
      if (!HUD.element.parentNode) {
        (document.lastElementChild || document.body).appendChild(HUD.element);
      }
    } catch (e) {
      if (document.body) {
        document.body.appendChild(HUD.element);
      }
    }
    
    // 强制重绘并应用动画
    HUD.element.offsetHeight;
    HUD.element.style.opacity = '1';
    HUD.element.style.transform = 'translateY(0)';
    
    // 优化的溢出处理 - 使用安全样式管理器
    var screenWidth = document.documentElement.clientWidth;
    var pageWidth = document.body.scrollWidth;
    if (screenWidth === pageWidth) {
      HUD.overflowValue = SafeStyleManager.getOverflow('x');
      SafeStyleManager.setOverflow('x', 'hidden', true);
    }
    
    HUD._animationFrame = null;
  });
  
  HUD._lastMessage = text;
  HUD._lastDuration = duration;
  
  if (duration) {
    HUD.hideTimeout = window.setTimeout(function() {
      HUD.hide();
    }, duration * 1000);
  }
  
  HUD._recordPerformance(performance.now() - startTime);
};

HUD._pulseHUD = function() {
  if (!HUD.element) return;
  
  // 添加脉冲动画
  HUD.element.classList.add('pulse');
  
  // 移除脉冲动画类
  setTimeout(() => {
    HUD.element.classList.remove('pulse');
  }, 500);
};

// 显示进度指示器
HUD.showProgress = function(progress, operation, estimatedTime) {
  HUD._progressValue = Math.max(0, Math.min(100, progress));
  
  var progressText = (operation || '处理中') + ': ' + HUD._progressValue + '%';
  if (estimatedTime && estimatedTime > 0) {
    var timeText = estimatedTime < 60 ? 
      Math.ceil(estimatedTime) + '秒' : 
      Math.ceil(estimatedTime / 60) + '分钟';
    progressText += ' (预计剩余: ' + timeText + ')';
  }
  
  HUD.display(progressText, 0, 'normal');
  HUD._updateProgressBar();
};

// 更新进度条显示
HUD._updateProgressBar = function() {
  if (!HUD.element) return;
  
  var progressBar = HUD.element.querySelector('.rVim-progress-bar');
  if (!progressBar) {
    var progressContainer = document.createElement('div');
    progressContainer.className = 'rVim-progress';
    
    progressBar = document.createElement('div');
    progressBar.className = 'rVim-progress-bar';
    
    progressContainer.appendChild(progressBar);
    HUD.element.appendChild(progressContainer);
  }
  
  progressBar.style.width = HUD._progressValue + '%';
  
  // 进度完成时自动隐藏
  if (HUD._progressValue >= 100) {
    setTimeout(function() {
      HUD.hideProgress();
    }, 1000);
  }
};

// 隐藏进度指示器
HUD.hideProgress = function() {
  if (HUD.element) {
    var progressContainer = HUD.element.querySelector('.rVim-progress');
    if (progressContainer) {
      progressContainer.parentNode.removeChild(progressContainer);
    }
  }
  HUD._progressValue = 0;
};
