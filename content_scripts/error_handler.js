/**
 * 错误处理和提示信息管理器
 * 提供具体解决方案而不仅是问题描述
 */

var ErrorHandler = {
  // 错误类型和对应的解决方案
  errorSolutions: {
    'no_matches': {
      message: '未找到匹配结果',
      solution: '尝试使用更简短或通用的关键词，或检查拼写错误',
      type: 'warning'
    },
    'invalid_command': {
      message: '无效的命令',
      solution: '输入:help查看可用命令列表，或检查命令拼写',
      type: 'error'
    },
    'permission_denied': {
      message: '权限不足',
      solution: '请在扩展设置中启用所需权限，或重新安装扩展',
      type: 'error'
    },
    'syntax_error': {
      message: '语法错误',
      solution: '检查命令格式是否正确，参数是否完整',
      type: 'error'
    },
    'navigation_error': {
      message: '无法导航',
      solution: '请先执行搜索命令，或确认页面内容是否可搜索',
      type: 'warning'
    },
    'timeout_error': {
      message: '操作超时',
      solution: '页面内容过多，尝试在较小范围内搜索或刷新页面',
      type: 'warning'
    },
    'unknown_error': {
      message: '未知错误',
      solution: '尝试刷新页面或重启浏览器，如问题持续请报告Bug',
      type: 'error'
    }
  },
  
  /**
   * 显示带有解决方案的错误消息
   * @param {string} errorType - 错误类型
   * @param {string} [customMessage] - 可选的自定义消息
   * @param {number} [duration] - 显示持续时间（秒）
   */
  showError: function(errorType, customMessage, duration) {
    const error = this.errorSolutions[errorType] || this.errorSolutions.unknown_error;
    const message = customMessage || error.message;
    const solution = error.solution;
    const type = error.type;
    
    // 构建完整消息（问题 + 解决方案）
    const fullMessage = `${message} - ${solution}`;
    
    // 使用HUD显示错误和解决方案
    if (typeof HUD !== 'undefined') {
      HUD.display(fullMessage, duration || 5, type);
    } else {
      console.error(`${message} - ${solution}`);
    }
    
    // 同时在状态栏显示
    if (typeof Status !== 'undefined') {
      Status.setMessage(fullMessage, type);
    }
    
    return fullMessage;
  },
  
  /**
   * 处理搜索错误
   * @param {string} query - 搜索查询
   * @param {number} matchCount - 匹配数量
   */
  handleSearchError: function(query, matchCount) {
    if (matchCount === 0) {
      if (!query || query.trim() === '') {
        return this.showError('no_matches', '搜索词为空', 3);
      } else if (query.length > 50) {
        return this.showError('no_matches', '搜索词过长，未找到匹配', 3);
      } else if (/[^\w\s]/.test(query)) {
        return this.showError('no_matches', '包含特殊字符，未找到匹配', 3);
      } else {
        return this.showError('no_matches', `未找到"${query}"`, 3);
      }
    }
    return null;
  },
  
  /**
   * 处理命令错误
   * @param {string} command - 命令
   * @param {string} error - 错误信息
   */
  handleCommandError: function(command, error) {
    if (!command || command.trim() === '') {
      return this.showError('invalid_command', '命令为空', 3);
    } else if (error && error.includes('permission')) {
      return this.showError('permission_denied', `执行"${command}"需要权限`, 5);
    } else if (error && error.includes('syntax')) {
      return this.showError('syntax_error', `命令"${command}"语法错误`, 4);
    } else {
      return this.showError('invalid_command', `无效命令"${command}"`, 3);
    }
  },
  
  /**
   * 处理导航错误
   * @param {string} direction - 导航方向
   */
  handleNavigationError: function(direction) {
    const dirText = direction === 'next' ? '下一个' : direction === 'prev' ? '上一个' : direction;
    return this.showError('navigation_error', `无法导航到${dirText}结果`, 2);
  },

  /**
   * 优雅降级处理
   * @param {Error} error - 错误对象
   * @param {string} context - 错误上下文
   * @param {Function} fallback - 降级处理函数
   */
  gracefulFallback: function(error, context, fallback) {
    console.warn(`[${context}] 发生错误，启用降级模式:`, error);
    
    // 记录错误但不中断用户操作
    this.showError('unknown_error', `${context}功能暂时不可用，已启用基础模式`, 3);
    
    // 执行降级处理
    if (typeof fallback === 'function') {
      try {
        return fallback();
      } catch (fallbackError) {
        console.error(`[${context}] 降级处理也失败:`, fallbackError);
        return null;
      }
    }
    
    return null;
  },

  /**
   * 安全执行函数，带有错误捕获和降级
   * @param {Function} fn - 要执行的函数
   * @param {string} context - 执行上下文
   * @param {Function} fallback - 降级函数
   * @param {...any} args - 函数参数
   */
  safeExecute: function(fn, context, fallback) {
    var args = Array.prototype.slice.call(arguments, 3);
    
    try {
      if (typeof fn === 'function') {
        return fn.apply(null, args);
      } else {
        throw new Error('提供的不是有效函数');
      }
    } catch (error) {
      return this.gracefulFallback(error, context, fallback);
    }
  },

  /**
   * 检查依赖项是否可用
   * @param {Object} dependencies - 依赖项对象
   * @returns {Object} 检查结果
   */
  checkDependencies: function(dependencies) {
    var results = {
      available: [],
      missing: [],
      allAvailable: true
    };
    
    for (var name in dependencies) {
      if (dependencies.hasOwnProperty(name)) {
        var dep = dependencies[name];
        if (typeof dep !== 'undefined' && dep !== null) {
          results.available.push(name);
        } else {
          results.missing.push(name);
          results.allAvailable = false;
        }
      }
    }
    
    if (!results.allAvailable) {
      console.warn('缺少依赖项:', results.missing);
      this.showError('unknown_error', '部分功能不可用：' + results.missing.join(', '), 3);
    }
    
    return results;
  }
};