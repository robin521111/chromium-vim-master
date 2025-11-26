var Clipboard = {
  store: '',
  copy: function(text, store) {
    if (!store) {
      this.store = text;
    } else {
      this.store += (this.store.length ? '\n' : '') + text;
    }

    var toCopy = this.store;

    // 优先使用现代异步剪贴板 API（需要用户手势）
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(toCopy).catch(function() {
        // 回退到 execCommand 方案
        try {
          var ta = document.createElement('textarea');
          ta.value = toCopy;
          ta.setAttribute('readonly', '');
          ta.style.position = 'absolute';
          ta.style.left = '-9999px';
          document.body.appendChild(ta);
          ta.select();
          document.execCommand('copy');
          document.body.removeChild(ta);
        } catch (e) {
          console.warn('复制失败：', e);
        }
      });
    } else {
      // 回退：execCommand
      try {
        var ta = document.createElement('textarea');
        ta.value = toCopy;
        ta.setAttribute('readonly', '');
        ta.style.position = 'absolute';
        ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      } catch (e) {
        console.warn('复制失败：', e);
      }
    }
  },

  paste: function(tabbed) {
    var engineUrl = Complete.getEngine(settings.defaultengine);
    engineUrl = engineUrl ? engineUrl.requestUrl :
      Complete.getEngine('google').requestUrl;

    var openWithText = function(text) {
      var payload = { engineUrl: engineUrl };
      if (text && typeof text === 'string') {
        payload.pastedText = text;
      }
      RUNTIME(tabbed ? 'openPasteTab' : 'openPaste', payload);
    };

    // 尝试读取剪贴板（需要用户手势）；失败则使用本地 store 作为回退
    if (navigator.clipboard && navigator.clipboard.readText) {
      navigator.clipboard.readText()
        .then(function(text) { openWithText(text); })
        .catch(function() { openWithText(Clipboard.store); });
    } else {
      openWithText(Clipboard.store);
    }
  }
};
