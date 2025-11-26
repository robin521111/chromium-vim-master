/**
 * 安全样式管理器 - 避免直接修改页面原始样式
 * 通过创建独立的样式层来管理rVim相关的样式修改
 */
var SafeStyleManager = {
  // 存储原始样式值
  originalStyles: new Map(),
  
  // 样式修改记录
  modifications: new Map(),
  
  // 样式元素ID
  styleElementId: 'rVim-safe-style-overrides',
  
  /**
   * 初始化安全样式管理器
   */
  init: function() {
    this.createStyleElement();
  },
  
  /**
   * 创建专用的样式元素
   */
  createStyleElement: function() {
    if (document.getElementById(this.styleElementId)) {
      return;
    }
    
    const styleElement = document.createElement('style');
    styleElement.id = this.styleElementId;
    styleElement.setAttribute('data-rvim-safe', 'true');
    document.head.appendChild(styleElement);
  },
  
  /**
   * 安全地设置body样式（通过CSS而不是直接修改style属性）
   */
  setBodyStyle: function(property, value, temporary = false) {
    const key = `body-${property}`;
    
    // 记录原始值（仅在第一次修改时）
    if (!this.originalStyles.has(key)) {
      const computedStyle = getComputedStyle(document.body);
      this.originalStyles.set(key, computedStyle[property]);
    }
    
    // 记录修改
    this.modifications.set(key, { property, value, temporary });
    
    // 应用样式
    this.updateStyleElement();
  },
  
  /**
   * 安全地获取body样式值
   */
  getBodyStyle: function(property) {
    const key = `body-${property}`;
    
    // 如果有修改记录，返回修改后的值
    if (this.modifications.has(key)) {
      return this.modifications.get(key).value;
    }
    
    // 否则返回计算后的样式值
    return getComputedStyle(document.body)[property];
  },
  
  /**
   * 恢复body样式
   */
  restoreBodyStyle: function(property) {
    const key = `body-${property}`;
    
    if (this.modifications.has(key)) {
      this.modifications.delete(key);
      this.updateStyleElement();
    }
  },
  
  /**
   * 恢复所有临时样式
   */
  restoreTemporaryStyles: function() {
    const toRemove = [];
    
    for (const [key, modification] of this.modifications) {
      if (modification.temporary) {
        toRemove.push(key);
      }
    }
    
    toRemove.forEach(key => this.modifications.delete(key));
    this.updateStyleElement();
  },
  
  /**
   * 更新样式元素内容
   */
  updateStyleElement: function() {
    const styleElement = document.getElementById(this.styleElementId);
    if (!styleElement) {
      this.createStyleElement();
      return;
    }
    
    let cssRules = [];
    
    // 生成body样式规则
    const bodyStyles = [];
    for (const [key, modification] of this.modifications) {
      if (key.startsWith('body-')) {
        const property = modification.property;
        const value = modification.value;
        bodyStyles.push(`${property}: ${value} !important`);
      }
    }
    
    if (bodyStyles.length > 0) {
      cssRules.push(`body { ${bodyStyles.join('; ')} }`);
    }
    
    styleElement.textContent = cssRules.join('\n');
  },
  
  /**
   * 清理所有样式修改
   */
  cleanup: function() {
    this.modifications.clear();
    this.originalStyles.clear();
    
    const styleElement = document.getElementById(this.styleElementId);
    if (styleElement) {
      styleElement.remove();
    }
  },
  
  /**
   * 安全的zoom操作
   */
  setZoom: function(zoomValue) {
    // 使用CSS transform代替直接修改zoom属性
    this.setBodyStyle('transform', `scale(${zoomValue})`);
    this.setBodyStyle('transform-origin', '0 0');
  },
  
  /**
   * 获取当前zoom值
   */
  getZoom: function() {
    const transform = this.getBodyStyle('transform');
    if (transform && transform.includes('scale')) {
      const match = transform.match(/scale\(([^)]+)\)/);
      return match ? parseFloat(match[1]) : 1;
    }
    return 1;
  },
  
  /**
   * 安全的minHeight操作（用于wiggleWindow）
   */
  setMinHeight: function(height, temporary = true) {
    this.setBodyStyle('min-height', height, temporary);
  },
  
  /**
   * 安全的overflow操作
   */
  setOverflow: function(axis, value, temporary = true) {
    const property = axis === 'x' ? 'overflow-x' : axis === 'y' ? 'overflow-y' : 'overflow';
    this.setBodyStyle(property, value, temporary);
  },
  
  /**
   * 获取overflow值
   */
  getOverflow: function(axis) {
    const property = axis === 'x' ? 'overflow-x' : axis === 'y' ? 'overflow-y' : 'overflow';
    return this.getBodyStyle(property);
  }
};

// 在DOM加载完成后初始化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function() {
    SafeStyleManager.init();
  });
} else {
  SafeStyleManager.init();
}

// 导出到全局
window.SafeStyleManager = SafeStyleManager;