/**
 * rVim 样式优化器 - 动态检测和修复样式冲突
 * 解决插件与网页样式冲突的问题
 */

class StyleOptimizer {
  constructor() {
    this.conflictDetector = new StyleConflictDetector();
    this.isOptimized = false;
    this.originalStyles = new Map();
    this.optimizedStyleSheet = null;
    this.mutationObserver = null;
    
    // 缓存相关属性
    this.cachedMaxZIndex = null;
    this.lastZIndexCheck = 0;
    
    // 监控相关属性
    this.realTimeObserver = null;
    this.styleObserver = null;
    
    // 配置选项
    this.config = {
      enableAutoDetection: true,
      enableAutoFix: true,
      checkInterval: 2000, // 2秒检查一次
      maxZIndex: 10007,    // 最大z-index值
      minZIndex: 10000,    // 最小z-index值
      debugMode: false
    };
    
    this.init();
  }
  
  /**
   * 初始化样式优化器
   */
  init() {
    this.log('StyleOptimizer 初始化中...');
    
    // 等待DOM加载完成
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.start());
    } else {
      this.start();
    }
  }
  
  /**
   * 启动样式优化器
   */
  start() {
    this.log('启动样式优化器');
    
    // 应用优化的CSS
    this.applyOptimizedStyles();
    
    // 启动冲突检测
    if (this.config.enableAutoDetection) {
      this.startConflictDetection();
    }
    
    // 监听DOM变化
    this.startMutationObserver();
    
    // 监听页面样式变化
    this.monitorStyleChanges();
    
    this.isOptimized = true;
    this.log('样式优化器启动完成');
  }
  
  /**
   * 应用优化的CSS样式
   */
  applyOptimizedStyles() {
    // 检查是否已经应用了优化样式
    if (document.getElementById('rvim-optimized-styles')) {
      return;
    }
    
    // 创建优化的样式表
    const styleElement = document.createElement('style');
    styleElement.id = 'rvim-optimized-styles';
    styleElement.setAttribute('data-rvim-optimizer', 'true');
    
    // 加载优化的CSS内容
    fetch(chrome.runtime.getURL('content_scripts/main_optimized.css'))
      .then(response => response.text())
      .then(css => {
        styleElement.textContent = css;
        
        // 插入到head的最后，确保优先级
        document.head.appendChild(styleElement);
        this.optimizedStyleSheet = styleElement.sheet;
        
        this.log('优化样式已应用');
        
        // 禁用原始样式表
        this.disableOriginalStyles();
        
        // 应用网站特定的样式修复
        this.applySiteSpecificFixes();
      })
      .catch(error => {
        this.log('加载优化样式失败:', error);
        // 如果加载失败，应用内联的关键样式
        this.applyFallbackStyles(styleElement);
      });
  }
  
  /**
   * 禁用原始样式表
   */
  disableOriginalStyles() {
    // 只禁用rVim相关的原始样式表，不影响网页本身的样式
    const rVimStyleSheets = document.querySelectorAll('style[data-rvim="true"], link[href*="content_scripts/main.css"]');
    rVimStyleSheets.forEach(sheet => {
      if (sheet.sheet && !sheet.hasAttribute('data-rvim-optimizer')) {
        this.originalStyles.set(sheet, sheet.disabled);
        sheet.disabled = true;
        this.log('禁用rVim原始样式表:', sheet.href || 'inline');
      }
    });
  }
  
  /**
   * 应用智能样式修复
   */
  applySiteSpecificFixes() {
    // 启动智能样式冲突检测和修复
    this.startIntelligentStyleFix();
  }
  
  /**
   * 启动智能样式修复系统
   */
  startIntelligentStyleFix() {
    this.log('启动智能样式修复系统');
    
    // 检测页面环境
    const pageContext = this.analyzePageContext();
    
    // 应用自适应z-index管理
    this.applyAdaptiveZIndex(pageContext);
    
    // 应用智能样式隔离
    this.applyIntelligentIsolation(pageContext);
    
    // 启动实时监控
    this.startRealTimeMonitoring();
  }
  
  /**
   * 分析页面环境
   */
  analyzePageContext() {
    const hostname = window.location.hostname;
    const context = {
      hostname: hostname,
      isVideoSite: this.isVideoSite(hostname),
      isSocialMedia: this.isSocialMedia(hostname),
      isSearchEngine: this.isSearchEngine(hostname),
      maxZIndex: this.detectMaxZIndex(),
      hasFixedElements: this.hasFixedPositionElements(),
      hasOverlays: this.hasOverlayElements(),
      theme: this.detectTheme()
    };
    
    this.log('页面环境分析:', context);
    return context;
  }
  
  /**
   * 检测是否为视频网站
   */
  isVideoSite(hostname) {
    const videoSites = ['youtube.com', 'vimeo.com', 'dailymotion.com', 'twitch.tv', 'bilibili.com'];
    return videoSites.some(site => hostname.includes(site));
  }
  
  /**
   * 检测是否为社交媒体
   */
  isSocialMedia(hostname) {
    const socialSites = ['facebook.com', 'twitter.com', 'instagram.com', 'linkedin.com', 'github.com'];
    return socialSites.some(site => hostname.includes(site));
  }
  
  /**
   * 检测是否为搜索引擎
   */
  isSearchEngine(hostname) {
    const searchSites = ['google.com', 'bing.com', 'duckduckgo.com', 'baidu.com'];
    return searchSites.some(site => hostname.includes(site));
  }
  
  /**
   * 检测页面最大z-index（优化版本）
   */
  detectMaxZIndex() {
    // 使用缓存避免重复计算
    if (this.cachedMaxZIndex && Date.now() - this.lastZIndexCheck < 5000) {
      return this.cachedMaxZIndex;
    }
    
    let maxZ = 0;
    // 只检查可能有高z-index的元素类型
    const selectors = [
      '[style*="z-index"]',
      '.modal', '.popup', '.overlay', '.dropdown', '.tooltip',
      '[class*="modal"]', '[class*="popup"]', '[class*="overlay"]',
      '[id*="modal"]', '[id*="popup"]', '[id*="overlay"]'
    ];
    
    try {
      for (const selector of selectors) {
        const elements = document.querySelectorAll(selector);
        for (let element of elements) {
          try {
            const zIndex = parseInt(window.getComputedStyle(element).zIndex);
            if (!isNaN(zIndex) && zIndex > maxZ) {
              maxZ = zIndex;
            }
          } catch (e) {
            // 忽略单个元素的错误
          }
        }
      }
    } catch (e) {
      this.log('检测z-index时出错:', e);
    }
    
    this.cachedMaxZIndex = Math.max(maxZ, 1000);
    this.lastZIndexCheck = Date.now();
    return this.cachedMaxZIndex;
  }
  
  /**
   * 检测是否有固定定位元素
   */
  hasFixedPositionElements() {
    const fixedElements = document.querySelectorAll('*');
    for (let element of fixedElements) {
      if (window.getComputedStyle(element).position === 'fixed') {
        return true;
      }
    }
    return false;
  }
  
  /**
   * 检测是否有覆盖层元素
   */
  hasOverlayElements() {
    const overlaySelectors = ['.overlay', '.modal', '.popup', '.dropdown', '.tooltip'];
    return overlaySelectors.some(selector => document.querySelector(selector));
  }
  
  /**
   * 检测页面主题
   */
  detectTheme() {
    const html = document.documentElement;
    const body = document.body;
    
    // 检查常见的主题属性
    if (html.hasAttribute('data-theme')) {
      return html.getAttribute('data-theme');
    }
    
    if (html.classList.contains('dark') || body.classList.contains('dark')) {
      return 'dark';
    }
    
    if (html.classList.contains('light') || body.classList.contains('light')) {
      return 'light';
    }
    
    // 通过背景色判断
    const bgColor = window.getComputedStyle(body).backgroundColor;
    const rgb = bgColor.match(/\d+/g);
    if (rgb) {
      const brightness = (parseInt(rgb[0]) * 299 + parseInt(rgb[1]) * 587 + parseInt(rgb[2]) * 114) / 1000;
      return brightness < 128 ? 'dark' : 'light';
    }
    
    return 'auto';
  }
  
  /**
   * 应用自适应z-index管理
   */
  applyAdaptiveZIndex(context) {
    const adaptiveZIndex = Math.max(context.maxZIndex + 1000, 2147483647);
    
    const adaptiveStyles = `
      /* 自适应z-index管理 */
      [id^="rVim-"], [class^="rVim-"], [class*=" rVim-"] {
        z-index: ${adaptiveZIndex} !important;
      }
      
      /* 确保命令栏始终在最顶层 */
      #rVim-command-bar, #rVim-command-frame {
        z-index: ${adaptiveZIndex + 100} !important;
      }
      
      /* 确保链接提示在所有元素之上 */
      .rVim-link-hint {
        z-index: ${adaptiveZIndex + 200} !important;
      }
    `;
    
    this.injectAdaptiveStyles('rvim-adaptive-zindex', adaptiveStyles);
    this.log('自适应z-index已应用，基础值:', adaptiveZIndex);
  }
  
  /**
   * 应用智能样式隔离
   */
  applyIntelligentIsolation(context) {
    const isolationStyles = `
      /* 精确的样式隔离 - 只针对真正的rVim元素 */
      #rVim-hud, #rVim-command-line, #rVim-status, #rVim-hints,
      .rVim-hint, .rVim-link-hint, .rVim-command-line, .rVim-hud,
      [data-rvim="true"], [data-rvim-element="true"] {
        /* 创建独立的层叠上下文 */
        isolation: isolate !important;
        contain: layout style paint !important;
        
        /* 基础字体和布局 */
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important;
        font-size: 14px !important;
        line-height: 1.4 !important;
        font-weight: normal !important;
        font-style: normal !important;
        
        /* 重置可能冲突的属性 */
        text-decoration: none !important;
        text-transform: none !important;
        letter-spacing: normal !important;
        text-shadow: none !important;
        
        /* 确保正确的定位 */
        margin: 0 !important;
        padding: 0 !important;
        border: none !important;
        outline: none !important;
        
        /* 防止动画干扰 */
        transform: none !important;
        transition: none !important;
        animation: none !important;
        
        /* 确保可见性 */
        opacity: 1 !important;
        visibility: visible !important;
        
        /* 防止滤镜影响 */
        filter: none !important;
        backdrop-filter: none !important;
        
        /* 盒模型 */
        box-sizing: border-box !important;
      }
      
      /* 确保SafeStyleManager的样式不被覆盖 */
      #rVim-safe-style-overrides {
        isolation: isolate !important;
        contain: strict !important;
      }
    `;
    
    this.injectAdaptiveStyles('rvim-intelligent-isolation', isolationStyles);
    this.log('精确样式隔离已应用，包含SafeStyleManager保护');
  }
  
  /**
   * 启动实时监控（优化版本）
   */
  startRealTimeMonitoring() {
    // 防止重复启动
    if (this.realTimeObserver) {
      return;
    }
    
    // 使用节流避免频繁更新
    let updateTimeout = null;
    
    const observer = new MutationObserver((mutations) => {
      // 清除之前的超时
      if (updateTimeout) {
        clearTimeout(updateTimeout);
      }
      
      let needsUpdate = false;
      
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              // 只检查可能影响rVim的元素
              if (this.isHighPriorityElement(node)) {
                needsUpdate = true;
              }
            }
          });
        }
      });
      
      if (needsUpdate) {
        // 使用节流，避免频繁更新
        updateTimeout = setTimeout(() => {
          this.log('检测到重要页面变化，更新z-index缓存');
          this.cachedMaxZIndex = null; // 清除缓存
          this.lastZIndexCheck = 0;
        }, 500);
      }
    });
    
    try {
      observer.observe(document.body, {
        childList: true,
        subtree: false // 只监控直接子元素，减少性能开销
      });
      
      this.realTimeObserver = observer;
      this.log('实时监控已启动');
    } catch (e) {
      this.log('启动实时监控失败:', e);
    }
  }
  
  /**
   * 检查是否为高优先级元素
   */
  isHighPriorityElement(element) {
    if (!element.className && !element.id) {
      return false;
    }
    
    const className = element.className.toString().toLowerCase();
    const id = element.id.toLowerCase();
    
    const highPriorityKeywords = ['modal', 'popup', 'overlay', 'dropdown', 'tooltip', 'menu'];
    
    return highPriorityKeywords.some(keyword => 
      className.includes(keyword) || id.includes(keyword)
    );
  }
  
  /**
   * 注入自适应样式
   */
  injectAdaptiveStyles(id, styles) {
    // 移除旧的样式
    const existingStyle = document.getElementById(id);
    if (existingStyle) {
      existingStyle.remove();
    }
    
    // 注入新样式
    const styleElement = document.createElement('style');
    styleElement.id = id;
    styleElement.setAttribute('data-rvim-adaptive', 'true');
    styleElement.textContent = styles;
    
    // 插入到head的最后，确保最高优先级
    document.head.appendChild(styleElement);
  }
  
  /**
   * 应用备用样式（当优化样式加载失败时）
   */
  applyFallbackStyles(styleElement) {
    const fallbackCSS = `
      /* rVim 备用样式 - 安全的关键样式修复 */
      #rVim-hud, #rVim-command-line, #rVim-status, #rVim-hints,
      .rVim-hint, .rVim-link-hint, .rVim-command-line, .rVim-hud,
      [data-rvim="true"], [data-rvim-element="true"] {
        /* 移除危险的 all: unset，只设置必要属性 */
        isolation: isolate !important;
        box-sizing: border-box !important;
        font-family: 'SF Mono', 'Monaco', 'Inconsolata', monospace !important;
        font-size: 13px !important;
      }
      
      #rVim-command-bar {
        position: fixed !important;
        bottom: 0 !important;
        left: 0 !important;
        width: 100% !important;
        z-index: 10005 !important;
        background: #121212 !important;
        color: #ffffff !important;
        padding: 12px 16px !important;
        border-top: 2px solid #4caf50 !important;
      }
      
      .rVim-link-hint {
        position: absolute !important;
        z-index: 10004 !important;
        background: #2e7d32 !important;
        color: #ffffff !important;
        padding: 3px 6px !important;
        border-radius: 4px !important;
        font-size: 12px !important;
        font-weight: bold !important;
      }
      
      #rVim-hud {
        position: fixed !important;
        top: 20px !important;
        right: 20px !important;
        z-index: 10003 !important;
        background: rgba(18, 18, 18, 0.95) !important;
        color: #ffffff !important;
        padding: 8px 12px !important;
        border-radius: 6px !important;
      }
      
      .rVim-find-mark {
        background-color: rgba(255, 255, 0, 0.6) !important;
        color: #000000 !important;
        border: 1px solid #ffa500 !important;
        border-radius: 2px !important;
        padding: 1px 2px !important;
      }
    `;
    
    styleElement.textContent = fallbackCSS;
    document.head.appendChild(styleElement);
    this.log('应用备用样式');
  }
  
  /**
   * 启动冲突检测
   */
  startConflictDetection() {
    // 立即检测一次
    this.detectAndFixConflicts();
    
    // 定期检测
    setInterval(() => {
      this.detectAndFixConflicts();
    }, this.config.checkInterval);
  }
  
  /**
   * 检测并修复样式冲突
   */
  detectAndFixConflicts() {
    const conflicts = this.conflictDetector.detectConflicts();
    
    if (conflicts.length > 0) {
      this.log(`检测到 ${conflicts.length} 个样式冲突`);
      
      if (this.config.enableAutoFix) {
        this.fixConflicts(conflicts);
      }
    }
  }
  
  /**
   * 修复样式冲突
   */
  fixConflicts(conflicts) {
    conflicts.forEach(conflict => {
      switch (conflict.type) {
        case 'z-index':
          this.fixZIndexConflict(conflict);
          break;
        case 'positioning':
          this.fixPositioningConflict(conflict);
          break;
        case 'visibility':
          this.fixVisibilityConflict(conflict);
          break;
        case 'font':
          this.fixFontConflict(conflict);
          break;
        default:
          this.log('未知冲突类型:', conflict.type);
      }
    });
  }
  
  /**
   * 修复z-index冲突
   */
  fixZIndexConflict(conflict) {
    const element = conflict.element;
    const currentZIndex = parseInt(getComputedStyle(element).zIndex) || 0;
    
    // 如果z-index过高，调整到合理范围
    if (currentZIndex > this.config.maxZIndex) {
      const newZIndex = this.getOptimalZIndex(element);
      element.style.setProperty('z-index', newZIndex.toString(), 'important');
      this.log(`修复z-index冲突: ${currentZIndex} -> ${newZIndex}`, element);
    }
  }
  
  /**
   * 获取最优的z-index值
   */
  getOptimalZIndex(element) {
    const elementType = this.getElementType(element);
    
    const zIndexMap = {
      'cursor': 10001,
      'status': 10002,
      'hud': 10003,
      'hints': 10004,
      'command': 10005,
      'modal': 10006,
      'overlay': 10007
    };
    
    return zIndexMap[elementType] || 10000;
  }
  
  /**
   * 获取元素类型
   */
  getElementType(element) {
    const id = element.id;
    const className = element.className;
    
    if (id.includes('cursor')) return 'cursor';
    if (id.includes('status')) return 'status';
    if (id.includes('hud')) return 'hud';
    if (id.includes('command')) return 'command';
    if (className.includes('link-hint')) return 'hints';
    if (className.includes('modal')) return 'modal';
    if (className.includes('overlay')) return 'overlay';
    
    return 'default';
  }
  
  /**
   * 修复定位冲突
   */
  fixPositioningConflict(conflict) {
    const element = conflict.element;
    const computedStyle = getComputedStyle(element);
    
    // 确保插件元素使用正确的定位
    if (computedStyle.position === 'static') {
      element.style.setProperty('position', 'absolute', 'important');
      this.log('修复定位冲突: static -> absolute', element);
    }
    
    // 修复被页面transform影响的问题
    if (computedStyle.transform !== 'none' && !element.style.transform) {
      element.style.setProperty('transform', 'none', 'important');
      this.log('修复transform冲突', element);
    }
  }
  
  /**
   * 修复可见性冲突
   */
  fixVisibilityConflict(conflict) {
    const element = conflict.element;
    const computedStyle = getComputedStyle(element);
    
    // 确保元素可见
    if (computedStyle.visibility === 'hidden') {
      element.style.setProperty('visibility', 'visible', 'important');
      this.log('修复可见性冲突: hidden -> visible', element);
    }
    
    if (parseFloat(computedStyle.opacity) < 0.1) {
      element.style.setProperty('opacity', '1', 'important');
      this.log('修复透明度冲突', element);
    }
  }
  
  /**
   * 修复字体冲突
   */
  fixFontConflict(conflict) {
    const element = conflict.element;
    const expectedFont = "'SF Mono', 'Monaco', 'Inconsolata', monospace";
    
    element.style.setProperty('font-family', expectedFont, 'important');
    element.style.setProperty('font-size', '13px', 'important');
    this.log('修复字体冲突', element);
  }
  
  /**
   * 启动DOM变化监听
   */
  startMutationObserver() {
    this.mutationObserver = new MutationObserver((mutations) => {
      let needsCheck = false;
      
      mutations.forEach(mutation => {
        // 检查是否有新的插件元素添加
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              if (this.isRVimElement(node) || node.querySelector('[id^="rVim-"], [class^="rVim-"]')) {
                needsCheck = true;
              }
            }
          });
        }
        
        // 检查样式属性变化
        if (mutation.type === 'attributes' && 
            (mutation.attributeName === 'style' || mutation.attributeName === 'class')) {
          if (this.isRVimElement(mutation.target)) {
            needsCheck = true;
          }
        }
      });
      
      if (needsCheck) {
        // 延迟检测，避免频繁触发
        setTimeout(() => this.detectAndFixConflicts(), 100);
      }
    });
    
    this.mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class', 'id']
    });
  }
  
  /**
   * 监听页面样式变化
   */
  monitorStyleChanges() {
    // 监听新样式表的添加
    const observer = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === Node.ELEMENT_NODE && 
              (node.tagName === 'STYLE' || node.tagName === 'LINK')) {
            // 新样式表可能影响插件样式，重新检测
            setTimeout(() => this.detectAndFixConflicts(), 500);
          }
        });
      });
    });
    
    observer.observe(document.head, {
      childList: true,
      subtree: true
    });
  }
  
  /**
   * 检查是否为rVim元素
   */
  isRVimElement(element) {
    return element.id && element.id.startsWith('rVim-') ||
           element.className && (element.className.includes('rVim-') || element.className.startsWith('rVim-'));
  }
  
  /**
   * 恢复原始样式
   */
  restoreOriginalStyles() {
    // 移除优化样式
    const optimizedStyle = document.getElementById('rvim-optimized-styles');
    if (optimizedStyle) {
      optimizedStyle.remove();
    }
    
    // 恢复原始样式表
    this.originalStyles.forEach((wasDisabled, sheet) => {
      sheet.disabled = wasDisabled;
    });
    
    this.originalStyles.clear();
    this.isOptimized = false;
    
    this.log('已恢复原始样式');
  }
  
  /**
   * 停止样式优化器
   */
  stop() {
    // 停止所有监控
    if (this.realTimeObserver) {
      this.realTimeObserver.disconnect();
      this.realTimeObserver = null;
    }
    
    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
      this.mutationObserver = null;
    }
    
    if (this.styleObserver) {
      this.styleObserver.disconnect();
      this.styleObserver = null;
    }
    
    // 清除缓存
    this.cachedMaxZIndex = null;
    this.lastZIndexCheck = 0;
    
    // 恢复原始样式
    this.restoreOriginalStyles();
    this.log('样式优化器已停止');
  }
  
  /**
   * 获取优化状态报告
   */
  getStatusReport() {
    const conflicts = this.conflictDetector.detectConflicts();
    
    return {
      isOptimized: this.isOptimized,
      conflictsDetected: conflicts.length,
      conflicts: conflicts,
      config: this.config,
      timestamp: new Date().toISOString()
    };
  }
  
  /**
   * 更新配置
   */
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    this.log('配置已更新:', this.config);
  }
  
  /**
   * 日志输出
   */
  log(...args) {
    if (this.config.debugMode) {
      console.log('[StyleOptimizer]', ...args);
    }
  }
}

/**
 * 样式冲突检测器
 */
class StyleConflictDetector {
  constructor() {
    this.conflictTypes = {
      Z_INDEX: 'z-index',
      POSITIONING: 'positioning',
      VISIBILITY: 'visibility',
      FONT: 'font',
      OVERLAP: 'overlap'
    };
  }
  
  /**
   * 检测所有样式冲突
   */
  detectConflicts() {
    const conflicts = [];
    const rVimElements = this.findRVimElements();
    
    rVimElements.forEach(element => {
      conflicts.push(...this.detectElementConflicts(element));
    });
    
    return conflicts;
  }
  
  /**
   * 查找所有rVim元素
   */
  findRVimElements() {
    return document.querySelectorAll('[id^="rVim-"], [class^="rVim-"], [class*=" rVim-"]');
  }
  
  /**
   * 检测单个元素的冲突
   */
  detectElementConflicts(element) {
    const conflicts = [];
    const computedStyle = getComputedStyle(element);
    
    // 检测z-index冲突
    const zIndexConflict = this.detectZIndexConflict(element, computedStyle);
    if (zIndexConflict) conflicts.push(zIndexConflict);
    
    // 检测定位冲突
    const positionConflict = this.detectPositioningConflict(element, computedStyle);
    if (positionConflict) conflicts.push(positionConflict);
    
    // 检测可见性冲突
    const visibilityConflict = this.detectVisibilityConflict(element, computedStyle);
    if (visibilityConflict) conflicts.push(visibilityConflict);
    
    // 检测字体冲突
    const fontConflict = this.detectFontConflict(element, computedStyle);
    if (fontConflict) conflicts.push(fontConflict);
    
    return conflicts;
  }
  
  /**
   * 检测z-index冲突
   */
  detectZIndexConflict(element, computedStyle) {
    const zIndex = parseInt(computedStyle.zIndex) || 0;
    
    // 检查z-index是否过高
    if (zIndex > 50000) {
      return {
        type: this.conflictTypes.Z_INDEX,
        element: element,
        severity: 'high',
        description: `z-index过高: ${zIndex}`,
        currentValue: zIndex,
        recommendedValue: this.getRecommendedZIndex(element)
      };
    }
    
    return null;
  }
  
  /**
   * 检测定位冲突
   */
  detectPositioningConflict(element, computedStyle) {
    const position = computedStyle.position;
    
    // 检查关键元素是否使用了错误的定位
    if (element.id.includes('command-bar') || element.id.includes('hud')) {
      if (position !== 'fixed') {
        return {
          type: this.conflictTypes.POSITIONING,
          element: element,
          severity: 'medium',
          description: `关键元素应使用fixed定位，当前: ${position}`,
          currentValue: position,
          recommendedValue: 'fixed'
        };
      }
    }
    
    return null;
  }
  
  /**
   * 检测可见性冲突
   */
  detectVisibilityConflict(element, computedStyle) {
    const visibility = computedStyle.visibility;
    const opacity = parseFloat(computedStyle.opacity);
    const display = computedStyle.display;
    
    // 检查元素是否被意外隐藏
    if (visibility === 'hidden' || opacity < 0.1 || display === 'none') {
      // 排除故意隐藏的元素
      if (!element.hasAttribute('data-hidden') && !element.style.display) {
        return {
          type: this.conflictTypes.VISIBILITY,
          element: element,
          severity: 'high',
          description: `元素可能被意外隐藏: visibility=${visibility}, opacity=${opacity}, display=${display}`,
          currentValue: { visibility, opacity, display },
          recommendedValue: { visibility: 'visible', opacity: 1, display: 'block' }
        };
      }
    }
    
    return null;
  }
  
  /**
   * 检测字体冲突
   */
  detectFontConflict(element, computedStyle) {
    const fontFamily = computedStyle.fontFamily;
    const expectedFonts = ['SF Mono', 'Monaco', 'Inconsolata', 'monospace'];
    
    // 检查是否使用了预期的字体
    const hasExpectedFont = expectedFonts.some(font => 
      fontFamily.toLowerCase().includes(font.toLowerCase())
    );
    
    if (!hasExpectedFont && element.className.includes('rVim-')) {
      return {
        type: this.conflictTypes.FONT,
        element: element,
        severity: 'low',
        description: `字体不匹配，当前: ${fontFamily}`,
        currentValue: fontFamily,
        recommendedValue: "'SF Mono', 'Monaco', 'Inconsolata', monospace"
      };
    }
    
    return null;
  }
  
  /**
   * 获取推荐的z-index值
   */
  getRecommendedZIndex(element) {
    const id = element.id;
    
    if (id.includes('cursor')) return 10001;
    if (id.includes('status')) return 10002;
    if (id.includes('hud')) return 10003;
    if (id.includes('hint') || element.className.includes('link-hint')) return 10004;
    if (id.includes('command')) return 10005;
    if (id.includes('modal')) return 10006;
    if (id.includes('overlay')) return 10007;
    
    return 10000;
  }
}

// 导出类
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { StyleOptimizer, StyleConflictDetector };
} else {
  window.StyleOptimizer = StyleOptimizer;
  window.StyleConflictDetector = StyleConflictDetector;
}

// 条件启动样式优化器（只在检测到rVim元素时启动）
if (typeof window !== 'undefined' && window.document) {
  // 等待其他脚本加载完成后检查是否需要启动
  setTimeout(() => {
    // 只有在检测到rVim相关元素或者明确需要时才启动
    const hasRVimElements = document.querySelector('[id*="rVim"], [class*="rVim"], [data-rvim]');
    if (hasRVimElements && !window.rVimStyleOptimizer) {
      window.rVimStyleOptimizer = new StyleOptimizer();
    }
  }, 2000); // 延长等待时间，确保rVim元素已经创建
}