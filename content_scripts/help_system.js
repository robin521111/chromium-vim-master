/**
 * 上下文相关帮助系统
 * 在关键操作节点提供分步骤指导说明
 */
var HelpSystem = {
  
  /**
   * 帮助内容数据库
   */
  helpDatabase: {
    search: {
      title: '搜索功能帮助',
      steps: [
        '1. 按 "/" 开始搜索',
        '2. 输入搜索词',
        '3. 按 Enter 确认搜索',
        '4. 使用 "n" 跳转到下一个结果',
        '5. 使用 "N" 跳转到上一个结果',
        '6. 使用 ":noh" 清除高亮'
      ],
      tips: [
        '提示：使用 "/\\r" 开启正则表达式搜索',
        '提示：搜索词区分大小写',
        '提示：空搜索会重复上次搜索'
      ]
    },
    
    command: {
      title: '命令模式帮助',
      steps: [
        '1. 按 ":" 进入命令模式',
        '2. 输入命令名称',
        '3. 添加必要的参数',
        '4. 按 Enter 执行命令',
        '5. 查看执行结果'
      ],
      commonCommands: [
        ':help - 显示帮助信息',
        ':settings - 打开设置页面',
        ':noh - 清除搜索高亮',
        ':duplicate - 复制当前标签页',
        ':stop - 停止页面加载'
      ]
    },
    
    navigation: {
      title: '页面导航帮助',
      steps: [
        '1. 使用 "j" 向下滚动',
        '2. 使用 "k" 向上滚动',
        '3. 使用 "h" 向左滚动',
        '4. 使用 "l" 向右滚动',
        '5. 使用 "gg" 跳转到页面顶部',
        '6. 使用 "G" 跳转到页面底部'
      ],
      tips: [
        '提示：可以在按键前加数字表示重复次数',
        '提示：使用 Ctrl+d/u 进行半页滚动',
        '提示：使用 f 进行链接快速跳转'
      ]
    },
    
    quickstart: {
      title: '快速入门指南',
      steps: [
        '1. 基础导航：j(下) k(上) h(左) l(右)',
        '2. 搜索功能：/ 开始搜索，n/N 切换结果',
        '3. 命令模式：: 开始命令，Tab 自动补全',
        '4. 链接跳转：f 显示链接标签，输入字母跳转',
        '5. 标签管理：t 新标签，x 关闭标签',
        '6. 获取帮助：:help 查看完整帮助'
      ]
    }
  },
  
  /**
   * 当前帮助状态
   */
  currentContext: null,
  isVisible: false,
  helpElement: null,
  iconElement: null,
  
  /**
   * 显示上下文帮助
   * @param {string} context - 帮助上下文
   * @param {Object} options - 显示选项
   */
  showContextHelp: function(context, options) {
    options = options || {};
    
    var helpData = this.helpDatabase[context];
    if (!helpData) {
      console.warn('未找到帮助内容:', context);
      return;
    }
    
    this.currentContext = context;
    
    // 只显示图标，不显示大黑框
    this.createHelpIcon(helpData.title);
    
    // 自动隐藏（如果设置了持续时间）
    if (options.duration) {
      setTimeout(() => {
        this.hideHelp();
      }, options.duration);
    }
  },
  
  /**
   * 创建帮助图标
   * @param {string} title - 帮助标题
   */
  createHelpIcon: function(title) {
    if (this.iconElement) {
      this.iconElement.remove();
    }
    
    this.iconElement = document.createElement('div');
    this.iconElement.className = 'rvim-help-icon';
    this.iconElement.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 32px;
      height: 32px;
      background: rgba(76, 175, 80, 0.8);
      color: #fff;
      border-radius: 50%;
      text-align: center;
      line-height: 32px;
      font-size: 18px;
      cursor: pointer;
      z-index: 999994;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
      transition: all 0.2s ease;
      opacity: 0.7;
    `;
    
    this.iconElement.innerHTML = '?';
    this.iconElement.title = title || '帮助提示';
    
    // 添加事件监听
    this.iconElement.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.toggleFullHelp();
    });
    
    // 添加鼠标悬停效果
    this.iconElement.addEventListener('mouseover', () => {
      this.iconElement.style.opacity = '1';
      this.iconElement.style.transform = 'scale(1.1)';
    });
    
    this.iconElement.addEventListener('mouseout', () => {
      this.iconElement.style.opacity = '0.7';
      this.iconElement.style.transform = 'scale(1)';
    });
    
    document.body.appendChild(this.iconElement);
  },
  
  /**
   * 切换完整帮助显示
   */
  toggleFullHelp: function() {
    if (this.helpElement && this.isVisible) {
      this.hideHelp();
    } else {
      var helpData = this.helpDatabase[this.currentContext];
      if (helpData) {
        this.createHelpElement(helpData, {});
        this.showHelp();
      }
    }
  },
  
  /**
   * 创建帮助元素
   * @param {Object} helpData - 帮助数据
   * @param {Object} options - 选项
   */
  createHelpElement: function(helpData, options) {
    if (this.helpElement) {
      this.helpElement.remove();
    }
    
    this.helpElement = document.createElement('div');
    this.helpElement.className = 'rvim-help-overlay';
    this.helpElement.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      width: 350px;
      max-height: 80vh;
      background: rgba(0, 0, 0, 0.9);
      color: #fff;
      border: 2px solid #4CAF50;
      border-radius: 8px;
      padding: 20px;
      font-family: 'Courier New', monospace;
      font-size: 14px;
      line-height: 1.5;
      z-index: 999993;
      isolation: isolate;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
      overflow-y: auto;
      animation: slideInRight 0.3s ease-out;
    `;
    
    var content = `
      <div style="border-bottom: 1px solid #4CAF50; padding-bottom: 10px; margin-bottom: 15px;">
        <h3 style="margin: 0; color: #4CAF50; font-size: 16px;">${helpData.title}</h3>
        <button onclick="HelpSystem.hideHelp()" style="
          position: absolute;
          top: 15px;
          right: 15px;
          background: none;
          border: none;
          color: #fff;
          font-size: 18px;
          cursor: pointer;
          padding: 0;
          width: 20px;
          height: 20px;
        ">×</button>
      </div>
    `;
    
    // 添加步骤
    if (helpData.steps) {
      content += '<div style="margin-bottom: 15px;">';
      content += '<h4 style="margin: 0 0 8px 0; color: #81C784;">操作步骤：</h4>';
      helpData.steps.forEach(step => {
        content += `<div style="margin: 5px 0; padding-left: 10px;">${step}</div>`;
      });
      content += '</div>';
    }
    
    // 添加常用命令
    if (helpData.commonCommands) {
      content += '<div style="margin-bottom: 15px;">';
      content += '<h4 style="margin: 0 0 8px 0; color: #81C784;">常用命令：</h4>';
      helpData.commonCommands.forEach(cmd => {
        content += `<div style="margin: 3px 0; padding-left: 10px; font-family: monospace; background: rgba(255,255,255,0.1); padding: 2px 6px; border-radius: 3px;">${cmd}</div>`;
      });
      content += '</div>';
    }
    
    // 添加提示
    if (helpData.tips) {
      content += '<div>';
      content += '<h4 style="margin: 0 0 8px 0; color: #FFB74D;">实用提示：</h4>';
      helpData.tips.forEach(tip => {
        content += `<div style="margin: 5px 0; padding-left: 10px; color: #FFE082;">${tip}</div>`;
      });
      content += '</div>';
    }
    
    this.helpElement.innerHTML = content;
    
    // 添加动画样式
    var style = document.createElement('style');
    style.textContent = `
      /* 帮助系统样式隔离 */
      .rvim-help-overlay, .rvim-help-icon {
        all: unset;
        box-sizing: border-box;
        font-family: 'Courier New', monospace;
      }
      
      .rvim-help-overlay *, .rvim-help-icon * {
        all: unset;
        box-sizing: border-box;
      }
      
      @keyframes slideInRight {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      
      @keyframes slideOutRight {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(100%);
          opacity: 0;
        }
      }
      
      @keyframes fadeIn {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }
      
      @keyframes fadeOut {
        from {
          opacity: 1;
        }
        to {
          opacity: 0;
        }
      }
      
      .rvim-help-icon {
        pointer-events: auto;
      }
      
      /* 确保帮助图标不会阻碍用户输入 */
      .rvim-help-icon.minimized {
        pointer-events: none;
        opacity: 0.3;
        transform: scale(0.8);
      }
    `;
    
    if (!document.querySelector('#rvim-help-styles')) {
      style.id = 'rvim-help-styles';
      document.head.appendChild(style);
    }
  },
  
  /**
   * 显示帮助
   */
  showHelp: function() {
    if (this.helpElement && !this.isVisible) {
      document.body.appendChild(this.helpElement);
      this.isVisible = true;
      
      // 添加ESC键监听，允许用户按ESC关闭帮助
      this._addEscapeKeyListener();
    }
  },
  
  /**
   * 隐藏帮助
   */
  hideHelp: function() {
    // 隐藏帮助面板
    if (this.helpElement && this.isVisible) {
      this.helpElement.style.animation = 'slideOutRight 0.3s ease-in';
      setTimeout(() => {
        if (this.helpElement && this.helpElement.parentNode) {
          this.helpElement.parentNode.removeChild(this.helpElement);
        }
        this.isVisible = false;
      }, 300);
    }
    
    // 隐藏帮助图标
    if (this.iconElement && this.iconElement.parentNode) {
      this.iconElement.style.animation = 'fadeOut 0.3s ease-in';
      setTimeout(() => {
        if (this.iconElement && this.iconElement.parentNode) {
          this.iconElement.parentNode.removeChild(this.iconElement);
        }
      }, 300);
    }
    
    // 移除ESC键监听
    this._removeEscapeKeyListener();
  },
  
  /**
   * 添加ESC键监听
   * @private
   */
  _addEscapeKeyListener: function() {
    this._escKeyHandler = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        this.hideHelp();
      }
    };
    document.addEventListener('keydown', this._escKeyHandler);
  },
  
  /**
   * 移除ESC键监听
   * @private
   */
  _removeEscapeKeyListener: function() {
    if (this._escKeyHandler) {
      document.removeEventListener('keydown', this._escKeyHandler);
      this._escKeyHandler = null;
    }
  },
  
  /**
   * 切换帮助显示状态
   */
  toggleHelp: function(context) {
    if (this.isVisible) {
      this.hideHelp();
    } else {
      this.showContextHelp(context || 'quickstart');
    }
  },
  
  /**
   * 智能帮助建议
   * 根据用户行为自动显示相关帮助
   */
  smartSuggest: function(action, context) {
    // 检查是否需要显示帮助
    var shouldShow = false;
    var helpContext = null;
    
    switch (action) {
      case 'search_no_results':
        helpContext = 'search';
        shouldShow = true;
        break;
      case 'invalid_command':
        helpContext = 'command';
        shouldShow = true;
        break;
      case 'first_visit':
        helpContext = 'quickstart';
        shouldShow = true;
        break;
    }
    
    if (shouldShow && helpContext) {
      // 延迟显示，避免干扰用户操作
      setTimeout(() => {
        this.showContextHelp(helpContext, { duration: 5000 });
        
        // 在搜索模式下，将图标设为最小化状态，避免阻碍输入
        if (action === 'search_no_results' && this.iconElement) {
          this.iconElement.classList.add('minimized');
          
          // 监听用户输入，当用户开始输入时隐藏图标
          const inputHandler = () => {
            this.hideHelp();
            document.removeEventListener('keydown', inputHandler);
          };
          
          document.addEventListener('keydown', inputHandler);
        }
      }, 800);
    }
  },
  
  /**
   * 注册帮助快捷键
   */
  registerShortcuts: function() {
    document.addEventListener('keydown', (e) => {
      // F1 或 ? 显示帮助
      if (e.key === 'F1' || (e.key === '?' && !e.ctrlKey && !e.altKey)) {
        e.preventDefault();
        this.toggleHelp();
      }
      
      // Esc 隐藏帮助
      if (e.key === 'Escape' && this.isVisible) {
        e.preventDefault();
        this.hideHelp();
      }
    });
  },
  
  /**
   * 初始化帮助系统
   */
  init: function() {
    this.registerShortcuts();
    
    // 检查是否是首次访问
    if (!localStorage.getItem('rvim_help_shown')) {
      setTimeout(() => {
        this.smartSuggest('first_visit');
        localStorage.setItem('rvim_help_shown', 'true');
      }, 2000);
    }
  }
};

// 自动初始化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    HelpSystem.init();
  });
} else {
  HelpSystem.init();
}