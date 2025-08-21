var Status = {
  defaultTimeout: 3,
  setMessage: function(message, timeout, type) {
    if (!Command.domElementsLoaded) {
      Command.callOnRvimLoad(function() {
        Status.setMessage(message, timeout, type);
      });
      return;
    }
    window.clearTimeout(this.delay);
    this.hide();
    if (timeout === void 0) {
      timeout = this.defaultTimeout;
    }
    this.active = true;
    Command.statusBar.textContent = '';
    
    // 添加状态指示器
    var indicator = document.createElement('span');
    indicator.className = 'rVim-status-indicator';
    
    // 设置状态类型
    if (type === 'error') {
      indicator.className += ' error';
      Command.statusBar.style.borderTopColor = '#FF5252';
      var error = document.createElement('span');
      error.style.color = 'red';
      error.textContent = 'Error';
      error.className = 'rVim-error';
      Command.statusBar.appendChild(error);
      Command.statusBar.appendChild(document.createTextNode(': '));
    } else if (type === 'warning') {
      indicator.className += ' warning';
      Command.statusBar.style.borderTopColor = '#FFC107';
    } else {
      Command.statusBar.style.borderTopColor = '#4CAF50';
    }
    
    Command.statusBar.appendChild(indicator);
    Command.statusBar.appendChild(document.createTextNode(message));
    Command.statusBar.normalize();
    
    // 添加入场动画
    Command.statusBar.style.opacity = '0';
    Command.statusBar.style.transform = 'translateY(10px)';
    Command.statusBar.style.display = 'inline-block';
    
    // 强制重绘
    Command.statusBar.offsetHeight;
    
    // 应用动画
    Command.statusBar.style.opacity = '1';
    Command.statusBar.style.transform = 'translateY(0)';
    
    this.delay = window.setTimeout(function() {
      if (Status.active === true) {
        Command.statusBar.style.display = 'none';
        Status.active = false;
      }
    }, timeout * 1000);
  },
  hide: function() {
    Command.statusBar.style.display = 'none';
    this.active = false;
  }
};
