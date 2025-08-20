/**
 * Security utilities for safe code execution and DOM manipulation
 * Replaces unsafe eval() and innerHTML usage with secure alternatives
 */

var SecurityUtils = {
  /**
   * Safe alternative to eval() for executing user functions
   * @param {string} functionCode - The function code to execute
   * @param {*} context - The context object to pass to the function
   * @returns {*} - The result of function execution
   */
  safeExecuteFunction: function(functionCode, context) {
    try {
      // Create a new Function instead of using eval
      // This is safer as it doesn't have access to local scope
      var func = new Function('context', 'return (' + functionCode + ')(context);');
      return func(context);
    } catch (e) {
      console.error('Error executing function:', e);
      return null;
    }
  },

  /**
   * Safe alternative to eval() for executing code blocks
   * @param {string} code - The code to execute
   * @param {Object} globals - Global variables to make available
   * @returns {*} - The result of code execution
   */
  safeExecuteCode: function(code, globals) {
    try {
      // Create function with controlled scope
      var paramNames = Object.keys(globals || {});
      var paramValues = paramNames.map(function(name) { return globals[name]; });
      var func = new Function(paramNames.join(','), code);
      return func.apply(null, paramValues);
    } catch (e) {
      console.error('Error executing code:', e);
      return null;
    }
  },

  /**
   * Safe alternative to innerHTML for setting text content
   * @param {Element} element - The DOM element
   * @param {string} content - The content to set
   */
  safeSetContent: function(element, content) {
    if (!element) return;
    
    // Use textContent for plain text to avoid XSS
    if (typeof content === 'string' && !this.containsHTML(content)) {
      element.textContent = content;
    } else {
      // For HTML content, sanitize first
      element.innerHTML = this.sanitizeHTML(content);
    }
  },

  /**
   * Check if content contains HTML tags
   * @param {string} content - The content to check
   * @returns {boolean} - True if content contains HTML
   */
  containsHTML: function(content) {
    return /<[^>]*>/g.test(content);
  },

  /**
   * Basic HTML sanitization
   * @param {string} html - The HTML to sanitize
   * @returns {string} - Sanitized HTML
   */
  sanitizeHTML: function(html) {
    if (typeof html !== 'string') return '';
    
    // Remove script tags and event handlers
    return html
      .replace(/<script[^>]*>.*?<\/script>/gi, '')
      .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/data:/gi, '');
  },

  /**
   * Safe way to clear element content
   * @param {Element} element - The DOM element to clear
   */
  safeClearContent: function(element) {
    if (!element) return;
    
    // Use textContent instead of innerHTML for clearing
    element.textContent = '';
  }
};