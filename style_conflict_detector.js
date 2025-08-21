/**
 * 样式冲突检测器
 * 用于检测Chromium Vim插件与网页样式的冲突问题
 */

class StyleConflictDetector {
  constructor() {
    this.conflicts = [];
    this.pluginElements = [];
    this.pageElements = [];
  }

  /**
   * 开始检测样式冲突
   */
  detect() {
    console.log('开始检测样式冲突...');
    
    this.findPluginElements();
    this.findPageElements();
    this.checkZIndexConflicts();
    this.checkPositionConflicts();
    this.checkOverlapConflicts();
    this.checkFontConflicts();
    this.checkColorContrastConflicts();
    
    this.generateReport();
    return this.conflicts;
  }

  /**
   * 查找插件元素
   */
  findPluginElements() {
    const selectors = [
      '[id^="rVim-"]',
      '[class^="rVim-"]',
      '[class*=" rVim-"]',
      '.rvim-help-overlay',
      '.rvim-help-icon'
    ];
    
    this.pluginElements = [];
    selectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      this.pluginElements.push(...elements);
    });
    
    console.log(`找到 ${this.pluginElements.length} 个插件元素`);
  }

  /**
   * 查找页面元素
   */
  findPageElements() {
    // 查找可能与插件冲突的页面元素
    const selectors = [
      '[style*="position: fixed"]',
      '[style*="position: absolute"]',
      '[style*="z-index"]',
      '.modal',
      '.overlay',
      '.popup',
      '.tooltip',
      '.dropdown',
      'header',
      'nav',
      '.header',
      '.navigation'
    ];
    
    this.pageElements = [];
    selectors.forEach(selector => {
      try {
        const elements = document.querySelectorAll(selector);
        this.pageElements.push(...elements);
      } catch (e) {
        // 忽略无效选择器
      }
    });
    
    console.log(`找到 ${this.pageElements.length} 个可能冲突的页面元素`);
  }

  /**
   * 检查z-index冲突
   */
  checkZIndexConflicts() {
    const pluginZIndexes = this.pluginElements.map(el => {
      const style = window.getComputedStyle(el);
      return {
        element: el,
        zIndex: parseInt(style.zIndex) || 0,
        position: style.position
      };
    }).filter(item => item.position === 'fixed' || item.position === 'absolute');
    
    const pageZIndexes = this.pageElements.map(el => {
      const style = window.getComputedStyle(el);
      return {
        element: el,
        zIndex: parseInt(style.zIndex) || 0,
        position: style.position
      };
    }).filter(item => item.position === 'fixed' || item.position === 'absolute');
    
    // 检查是否有页面元素的z-index高于插件元素
    pluginZIndexes.forEach(pluginItem => {
      pageZIndexes.forEach(pageItem => {
        if (pageItem.zIndex >= pluginItem.zIndex) {
          this.conflicts.push({
            type: 'z-index冲突',
            severity: 'high',
            description: `页面元素z-index(${pageItem.zIndex})可能覆盖插件元素z-index(${pluginItem.zIndex})`,
            pluginElement: pluginItem.element,
            pageElement: pageItem.element,
            suggestion: '建议调整插件元素的z-index值或使用CSS isolation'
          });
        }
      });
    });
  }

  /**
   * 检查定位冲突
   */
  checkPositionConflicts() {
    this.pluginElements.forEach(pluginEl => {
      const pluginStyle = window.getComputedStyle(pluginEl);
      const pluginRect = pluginEl.getBoundingClientRect();
      
      if (pluginStyle.position === 'fixed') {
        // 检查是否与固定定位的页面元素重叠
        this.pageElements.forEach(pageEl => {
          const pageStyle = window.getComputedStyle(pageEl);
          const pageRect = pageEl.getBoundingClientRect();
          
          if (pageStyle.position === 'fixed' && this.isOverlapping(pluginRect, pageRect)) {
            this.conflicts.push({
              type: '定位冲突',
              severity: 'medium',
              description: '插件固定定位元素与页面固定定位元素重叠',
              pluginElement: pluginEl,
              pageElement: pageEl,
              suggestion: '建议调整插件元素的位置或使用不同的定位策略'
            });
          }
        });
      }
    });
  }

  /**
   * 检查元素重叠
   */
  checkOverlapConflicts() {
    this.pluginElements.forEach(pluginEl => {
      const pluginRect = pluginEl.getBoundingClientRect();
      
      // 检查插件元素是否遮挡了重要的页面元素
      const importantElements = document.querySelectorAll('button, input, a, [role="button"], [tabindex]');
      
      importantElements.forEach(importantEl => {
        const importantRect = importantEl.getBoundingClientRect();
        
        if (this.isOverlapping(pluginRect, importantRect)) {
          this.conflicts.push({
            type: '元素遮挡',
            severity: 'high',
            description: '插件元素可能遮挡了重要的交互元素',
            pluginElement: pluginEl,
            pageElement: importantEl,
            suggestion: '建议调整插件元素位置或添加pointer-events: none'
          });
        }
      });
    });
  }

  /**
   * 检查字体冲突
   */
  checkFontConflicts() {
    this.pluginElements.forEach(pluginEl => {
      const style = window.getComputedStyle(pluginEl);
      const fontFamily = style.fontFamily;
      
      // 检查是否使用了预期的字体
      if (!fontFamily.includes('monospace') && !fontFamily.includes('Courier')) {
        this.conflicts.push({
          type: '字体冲突',
          severity: 'low',
          description: `插件元素未使用预期的等宽字体: ${fontFamily}`,
          pluginElement: pluginEl,
          suggestion: '建议在CSS中强制指定font-family: monospace !important'
        });
      }
    });
  }

  /**
   * 检查颜色对比度冲突
   */
  checkColorContrastConflicts() {
    this.pluginElements.forEach(pluginEl => {
      const style = window.getComputedStyle(pluginEl);
      const color = style.color;
      const backgroundColor = style.backgroundColor;
      
      // 简单的对比度检查
      if (color && backgroundColor && color !== 'rgba(0, 0, 0, 0)' && backgroundColor !== 'rgba(0, 0, 0, 0)') {
        const contrast = this.calculateContrast(color, backgroundColor);
        
        if (contrast < 4.5) {
          this.conflicts.push({
            type: '对比度不足',
            severity: 'medium',
            description: `插件元素颜色对比度不足: ${contrast.toFixed(2)}`,
            pluginElement: pluginEl,
            suggestion: '建议调整文字颜色或背景颜色以提高对比度'
          });
        }
      }
    });
  }

  /**
   * 检查两个矩形是否重叠
   */
  isOverlapping(rect1, rect2) {
    return !(rect1.right < rect2.left || 
             rect1.left > rect2.right || 
             rect1.bottom < rect2.top || 
             rect1.top > rect2.bottom);
  }

  /**
   * 计算颜色对比度（简化版本）
   */
  calculateContrast(color1, color2) {
    // 这是一个简化的对比度计算
    // 实际应用中应该使用更精确的WCAG对比度算法
    const rgb1 = this.parseColor(color1);
    const rgb2 = this.parseColor(color2);
    
    if (!rgb1 || !rgb2) return 21; // 假设对比度足够
    
    const l1 = this.getLuminance(rgb1);
    const l2 = this.getLuminance(rgb2);
    
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    
    return (lighter + 0.05) / (darker + 0.05);
  }

  /**
   * 解析颜色值
   */
  parseColor(color) {
    const div = document.createElement('div');
    div.style.color = color;
    document.body.appendChild(div);
    const computedColor = window.getComputedStyle(div).color;
    document.body.removeChild(div);
    
    const match = computedColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (match) {
      return {
        r: parseInt(match[1]),
        g: parseInt(match[2]),
        b: parseInt(match[3])
      };
    }
    return null;
  }

  /**
   * 计算亮度
   */
  getLuminance(rgb) {
    const { r, g, b } = rgb;
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  }

  /**
   * 生成检测报告
   */
  generateReport() {
    console.log('\n=== 样式冲突检测报告 ===');
    console.log(`总共发现 ${this.conflicts.length} 个潜在冲突`);
    
    const severityCount = {
      high: 0,
      medium: 0,
      low: 0
    };
    
    this.conflicts.forEach((conflict, index) => {
      severityCount[conflict.severity]++;
      
      console.log(`\n${index + 1}. ${conflict.type} (${conflict.severity})`);
      console.log(`   描述: ${conflict.description}`);
      console.log(`   建议: ${conflict.suggestion}`);
      
      if (conflict.pluginElement) {
        console.log(`   插件元素:`, conflict.pluginElement);
      }
      
      if (conflict.pageElement) {
        console.log(`   页面元素:`, conflict.pageElement);
      }
    });
    
    console.log('\n=== 冲突统计 ===');
    console.log(`高严重性: ${severityCount.high}`);
    console.log(`中严重性: ${severityCount.medium}`);
    console.log(`低严重性: ${severityCount.low}`);
    
    // 在页面上显示报告
    this.displayReportOnPage();
  }

  /**
   * 在页面上显示报告
   */
  displayReportOnPage() {
    // 移除之前的报告
    const existingReport = document.getElementById('style-conflict-report');
    if (existingReport) {
      existingReport.remove();
    }
    
    const reportDiv = document.createElement('div');
    reportDiv.id = 'style-conflict-report';
    reportDiv.style.cssText = `
      position: fixed;
      top: 10px;
      left: 10px;
      width: 400px;
      max-height: 80vh;
      background: rgba(0, 0, 0, 0.9);
      color: white;
      padding: 20px;
      border-radius: 8px;
      font-family: monospace;
      font-size: 12px;
      z-index: 999990;
      overflow-y: auto;
      border: 2px solid #ff6b6b;
    `;
    
    let html = `
      <h3 style="margin: 0 0 15px 0; color: #ff6b6b;">样式冲突检测报告</h3>
      <p>总共发现 <strong>${this.conflicts.length}</strong> 个潜在冲突</p>
      <button onclick="this.parentElement.remove()" style="
        position: absolute;
        top: 10px;
        right: 10px;
        background: none;
        border: none;
        color: white;
        font-size: 18px;
        cursor: pointer;
      ">×</button>
    `;
    
    if (this.conflicts.length === 0) {
      html += '<p style="color: #4CAF50;">✓ 未发现样式冲突问题</p>';
    } else {
      this.conflicts.forEach((conflict, index) => {
        const severityColor = {
          high: '#ff6b6b',
          medium: '#ffa726',
          low: '#ffeb3b'
        }[conflict.severity];
        
        html += `
          <div style="margin: 10px 0; padding: 10px; border-left: 3px solid ${severityColor}; background: rgba(255,255,255,0.1);">
            <strong>${conflict.type}</strong> (${conflict.severity})<br>
            ${conflict.description}<br>
            <small style="color: #ccc;">${conflict.suggestion}</small>
          </div>
        `;
      });
    }
    
    reportDiv.innerHTML = html;
    document.body.appendChild(reportDiv);
  }
}

// 自动运行检测
if (typeof window !== 'undefined') {
  // 等待页面加载完成后运行检测
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(() => {
        const detector = new StyleConflictDetector();
        detector.detect();
      }, 1000); // 延迟1秒确保插件元素已加载
    });
  } else {
    setTimeout(() => {
      const detector = new StyleConflictDetector();
      detector.detect();
    }, 1000);
  }
}

// 导出供手动使用
if (typeof module !== 'undefined' && module.exports) {
  module.exports = StyleConflictDetector;
} else if (typeof window !== 'undefined') {
  window.StyleConflictDetector = StyleConflictDetector;
}