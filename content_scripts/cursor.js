var Cursor = { // Hide the mouse cursor on keydown (Linux)
  // Jiggle the screen for CSS styles to take hold on pages with no overflow.
  // This still doesn't seem to work on new tabs until the mouse is touched
  wiggleWindow: function() {
    // 使用安全样式管理器，避免直接修改页面样式
    SafeStyleManager.setMinHeight(document.documentElement.clientHeight + 2 + 'px', true);
    var jiggleDirection =
      +(document.scrollingElement.scrollTop !== 0 &&
          document.body.scrollHeight -
          document.scrollingElement.scrollTop    -
          document.documentElement.clientHeight === 0);
    document.scrollingElement.scrollTop -= jiggleDirection;
    document.scrollingElement.scrollTop += jiggleDirection;
    SafeStyleManager.restoreBodyStyle('min-height');
  },
  init: function() {
    this.overlay = document.createElement('div');
    this.overlay.id = 'rVim-cursor';
    document.body.appendChild(this.overlay);
    var oldX, oldY;
    this.overlay.style.display = 'block';
    Cursor.wiggleWindow();
    this.overlay.style.display = 'none';
    document.addEventListener('mousemove', function(e) {
      if (!e.isTrusted)
        return true;
      if (oldX !== e.x || oldY !== e.y) {
        Cursor.overlay.style.display = 'none';
      }
      oldX = e.x;
      oldY = e.y;
    });
  }
};
