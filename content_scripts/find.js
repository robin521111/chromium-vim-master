var Find = {
  highlights: [],
  matches:    [],
  index:      0,
  tries:      0,
  mode:       '/',
};

Find.setIndex = function() {
  if (this.matches.length === 0) {
    this.index = 0;
    // 使用错误处理器显示无匹配结果
    if (typeof ErrorHandler !== 'undefined') {
      ErrorHandler.handleSearchError(this.lastSearch, 0);
    } else {
      HUD.display('未找到匹配结果', 3);
    }
    return;
  }
  
  // 智能排序：按视口位置和相关性排序
  var sortedMatches = this.matches.slice().map(function(match, originalIndex) {
    var br = match.getBoundingClientRect();
    var viewportHeight = window.innerHeight;
    var viewportWidth = window.innerWidth;
    
    // 计算相关性分数
    var relevanceScore = 0;
    
    // 1. 视口内的元素优先级更高
    var inViewport = br.top >= 0 && br.left >= 0 && 
                    br.bottom <= viewportHeight && br.right <= viewportWidth;
    if (inViewport) relevanceScore += 100;
    
    // 2. 距离视口中心越近分数越高
    var centerX = viewportWidth / 2;
    var centerY = viewportHeight / 2;
    var elementCenterX = br.left + br.width / 2;
    var elementCenterY = br.top + br.height / 2;
    var distanceFromCenter = Math.sqrt(
      Math.pow(elementCenterX - centerX, 2) + 
      Math.pow(elementCenterY - centerY, 2)
    );
    var maxDistance = Math.sqrt(centerX * centerX + centerY * centerY);
    var proximityScore = (1 - distanceFromCenter / maxDistance) * 50;
    relevanceScore += proximityScore;
    
    // 3. 可见性检查
    if (DOM.isVisible(match)) relevanceScore += 25;
    
    // 4. 文档顺序（阅读顺序）
    var readingOrderScore = (this.matches.length - originalIndex) / this.matches.length * 10;
    relevanceScore += readingOrderScore;
    
    return {
      match: match,
      originalIndex: originalIndex,
      score: relevanceScore,
      rect: br,
      inViewport: inViewport
    };
  }.bind(this));
  
  // 按分数排序
  sortedMatches.sort(function(a, b) {
    return b.score - a.score;
  });
  
  // 重新排列matches数组
  this.matches = sortedMatches.map(function(item) {
    return item.match;
  });
  
  // 选择最佳匹配作为起始索引
  this.index = 0;
  var bestMatch = sortedMatches[0];
  
  // 如果最佳匹配在视口内，使用它；否则查找第一个在视口内的
  if (!bestMatch.inViewport) {
    for (var i = 0; i < sortedMatches.length; i++) {
      if (sortedMatches[i].inViewport) {
        this.index = i;
        break;
      }
    }
  }
  
  // 更新搜索进度为100%
  if (typeof HUD !== 'undefined' && HUD.showProgress) {
    HUD.showProgress(100, '搜索完成');
  }
  
  // 显示状态
  var statusText = (this.index + 1) + ' / ' + this.matches.length;
  if (bestMatch.inViewport) {
    statusText += ' (in view)';
  }
  
  // 延迟显示结果，让进度条完成动画
  setTimeout(function() {
    HUD.display(statusText);
  }, 500);
};

Find.getSelectedTextNode = function() {
  return (this.matches.length &&
          this.matches[this.index] &&
          this.matches[this.index].firstChild)
    || false;
};

Find.focusParentLink = function(node) {
  do {
    if (node.hasAttribute('href')) {
      node.focus();
      return true;
    }
  } while (node = node.parentElement);
  return false;
};

Find.getCurrentMatch = function() {
  return this.matches[this.index] || null;
};

Find.search = function(mode, repeats, ignoreFocus) {
  if (this.matches.length === 0) {
    HUD.display('No matches', 2);
    return;
  }
  mode = mode || '/';

  var reverse = repeats < 0;
  if (reverse)
    repeats = Math.abs(repeats);
  if (mode === '?')
    reverse = !reverse;

  if (this.index >= this.matches.length || this.index < 0)
    this.index = 0;
    
  if (this.index >= 0 && this.matches[this.index])
    this.matches[this.index].removeAttribute('active');

  var newIndex = this.index;
  if (reverse && repeats === 1 && this.index === 0) {
    newIndex = this.matches.length - 1;
  } else if (!reverse && repeats === 1 && this.index + 1 === this.matches.length) {
    newIndex = 0;
  } else {
    newIndex = (this.index + (reverse ? -1 : 1) * repeats);
    newIndex = Utils.trueModulo(newIndex, this.matches.length);
  }
  
  while (!DOM.isVisible(this.matches[newIndex]) && this.tries < this.matches.length) {
    this.matches.splice(newIndex, 1);
    this.tries++;
    
    if (this.matches.length === 0) {
      HUD.display('No visible matches', 2);
      return;
    }
    
    if (newIndex >= this.matches.length) {
      newIndex = 0;
    }
  }
  
  this.index = newIndex;
  this.tries = 0;
  
  var currentMatch = this.matches[this.index];
  if (!currentMatch) return;
  
  var br = currentMatch.getBoundingClientRect();
  var origTop = document.scrollingElement.scrollTop;
  
  if (!ignoreFocus) {
    if (document.activeElement && document.activeElement !== document.body) {
      document.activeElement.blur();
    }
    document.body.focus();
  }
  
  var isLink = ignoreFocus ? false : this.focusParentLink(currentMatch);
  currentMatch.setAttribute('active', '');
  
  // 增强的HUD显示
  var statusText = (this.index + 1) + ' / ' + this.matches.length;
  if (originalLength !== this.matches.length) {
    statusText += ' (cleaned ' + (originalLength - this.matches.length) + ')';
  }
  HUD.display(statusText);
  
  // 优化的滚动逻辑
  var paddingTop = 0, paddingBottom = 0;
  if (Command.active) {
    paddingBottom = Command.barPaddingBottom || 0;
    paddingTop = Command.barPaddingTop || 0;
  }
  
  var documentZoom = parseFloat(document.body.style.zoom) || 1;
  var viewportHeight = window.innerHeight;
  var elementTop = br.top * documentZoom;
  var elementBottom = elementTop + br.height * documentZoom;
  
  // 智能滚动：确保元素在视口中央
  var targetTop = elementTop + origTop;
  var viewportCenter = viewportHeight / 2;
  
  if (elementBottom > viewportHeight - paddingBottom || elementTop < paddingTop) {
    // 将元素滚动到视口中央
    var scrollTarget = targetTop - viewportCenter + (br.height * documentZoom / 2);
    
    // 平滑滚动优化
    if (Math.abs(scrollTarget - origTop) > viewportHeight) {
      // 大距离跳转
      window.scrollTo(0, scrollTarget);
    } else {
      // 小距离平滑滚动
      window.scrollTo({
        top: scrollTarget,
        behavior: 'smooth'
      });
    }
  }
  
  // 性能监控
  var endTime = performance.now();
  if (endTime - startTime > 50) { // 超过50ms记录警告
    console.warn('Search navigation took', (endTime - startTime).toFixed(2), 'ms');
  }
};

Find.highlight = function(params) {
  // params => {}
  //   base           -> node to search in
  //   search         -> text to look for
  //   mode           -> find mode
  //   setIndex       -> find the first match within the viewport
  //   executesearch  -> run Find.search after highlighting
  //   saveSearch     -> add search to search history
  
  return this._performHighlight(params)
};

Find._performHighlight = function(params) {
  params.base = params.base || document.body;
  
  if (!params || !params.search) {
    return;
  }
  
  if (params.saveSearch)
    this.lastSearch = params.search;
    
  var regexMode = '',
      containsCap = params.search.search(/[A-Z]/) !== -1,
      useRegex = settings.regexp,
      markBase = document.createElement('mark'),
      nodes = [],
      linksOnly = false;

  markBase.className = 'rVim-find-mark';

  this.mode = params.mode || '/';
  if (params.saveSearch)
    this.lastSearch = params.search;

  var search = params.search;

  if ((settings.ignorecase || /\/i$/.test(params.search)) &&
      !(settings.smartcase && containsCap)) {
    search = search.replace(/\/i$/, '');
    regexMode = 'i';
  }

  if (useRegex) {
    if (params.mode === '$') {
      linksOnly = true;
    }
    try {
      var rxp = new RegExp(search, 'g' + regexMode);
      var mts = rxp.exec('.');
      if (!mts || (mts && mts[0] !== '')) { // Avoid infinite loop
        search = rxp;
      } else {
        useRegex = false;
      }
    } catch (e) { // RegExp was invalid
      useRegex = false;
    }
  }

  var acceptNode = function(node) {
    if (!node.data.trim())
      return NodeFilter.FILTER_REJECT;
    switch (node.parentNode.localName.toLowerCase()) {
    case 'script':
    case 'style':
    case 'noscript':
    case 'mark':
      return NodeFilter.FILTER_REJECT;
    }
    return DOM.isVisible(node.parentNode) ?
      NodeFilter.FILTER_ACCEPT :
      NodeFilter.FILTER_REJECT;
  };

  var acceptLinkNode = function(node) {
    if (!node.data.trim())
      return NodeFilter.FILTER_REJECT;
    Hints.type = '';
    if (!node.parentNode)
      return NodeFilter.FILTER_REJECT;
    if (node.parentNode.nodeType !== Node.ELEMENT_NODE ||
        node.parentNode.localName !== 'a') {
      return NodeFilter.FILTER_REJECT;
    }
    return DOM.isVisible(node.parentNode) ?
      NodeFilter.FILTER_ACCEPT :
      NodeFilter.FILTER_REJECT;
  };

  var nodeIterator = document.createNodeIterator(
    params.base,
    NodeFilter.SHOW_TEXT, {
      acceptNode: linksOnly ? acceptLinkNode : acceptNode
    },
    false
  );

  for (var node; node = nodeIterator.nextNode(); nodes.push(node));

  nodes.forEach((function() {
    if (useRegex) {
      return function(node) {
        var matches = node.data.match(search) || [];
        matches.forEach(function(match) {
          var mark = markBase.cloneNode(false);
          var mid = node.splitText(node.data.indexOf(match));
          var end = mid.splitText(match.length);
          if (node.data.length === 0)
            node.remove();
          if (end.data.length === 0)
            end.remove();
          mark.appendChild(mid.cloneNode(true));
          mid.parentNode.replaceChild(mark, mid);
          self.matches.push(mark);
          node = mark.nextSibling;
        });
      };
    }

    return function(node) {
      var pos = containsCap || !settings.ignorecase ?
        node.data.indexOf(search) :
        node.data.toLowerCase().indexOf(search);
      if (~pos) {
        var mark = markBase.cloneNode(false),
            mid = node.splitText(pos);
        mid.splitText(search.length);
        mark.appendChild(mid.cloneNode(true));
        mid.parentNode.replaceChild(mark, mid);
        self.matches.push(mark);
      }
    };
  })());

  document.body.normalize();
  
  // 性能优化：批量DOM更新
  document.body.normalize();
  
  // 智能结果处理和显示
  if (this.matches.length === 0) {
    if (typeof ErrorHandler !== 'undefined') {
      ErrorHandler.handleSearchError(this.lastSearch, '没有找到匹配结果');
    } else {
      HUD.display('No matches found', 2);
    }
    
    // 智能帮助建议
    if (typeof HelpSystem !== 'undefined') {
      HelpSystem.smartSuggest('search_no_results');
    }
    
    return;
  } else {
    // 去重处理：移除重复的匹配项
    var uniqueMatches = [];
    var seenTexts = new Set();
    
    this.matches.forEach(function(match) {
      var text = match.textContent;
      var rect = match.getBoundingClientRect();
      var key = text + '_' + Math.round(rect.top) + '_' + Math.round(rect.left);
      
      if (!seenTexts.has(key)) {
        seenTexts.add(key);
        uniqueMatches.push(match);
      } else {
        // 移除重复项
        if (match.parentNode) {
          match.parentNode.replaceChild(match.firstChild, match);
        }
      }
    });
    
    this.matches = uniqueMatches;
    
    // 性能监控
    var processingTime = performance.now() - (params._startTime || 0);
    
    // 显示结果统计
    var statusText = this.matches.length + ' matches';
    if (processingTime > 0) {
      statusText += ' (' + Math.round(processingTime) + 'ms)';
    }
    
    if (params.setIndex) {
      this.setIndex();
    } else {
      HUD.display(statusText);
    }
    
    // 性能警告
    if (processingTime > 200) {
      console.warn('Search highlighting took', processingTime.toFixed(2), 'ms for', this.matches.length, 'matches');
    }
  }
  
  // 执行搜索导航
  if (params.executeSearch && this.matches.length > 0) {
    this.search(params.mode, 1);
  }
};

Find._basicHighlight = function(params) {
  // 基础降级搜索功能，用于错误恢复
  this.matches = [];
  this.index = 0;
  
  if (!params || !params.search || params.search.trim() === '') {
    HUD.display('搜索词无效', 2);
    return;
  }
  
  try {
    var search = params.search.toLowerCase();
    var walker = document.createTreeWalker(
      params.base || document.body,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );
    
    var node;
    var markBase = document.createElement('mark');
    markBase.className = 'rVim-find-mark';
    
    while (node = walker.nextNode()) {
      if (node.nodeValue && node.nodeValue.toLowerCase().indexOf(search) !== -1) {
        var mark = markBase.cloneNode(false);
        mark.textContent = node.nodeValue;
        this.matches.push(mark);
      }
    }
    
    if (this.matches.length > 0) {
      HUD.display(this.matches.length + ' matches (basic mode)');
      if (params.setIndex) {
        this.setIndex();
      }
    } else {
      HUD.display('No matches found', 2);
    }
  } catch (e) {
    HUD.display('搜索失败', 2);
    console.error('Basic search failed:', e);
  }
};

Find.clear = function() {
  var nodes = this.matches;
  for (var i = 0; i < nodes.length; i++)
    if (nodes[i] && nodes[i].parentNode && nodes[i].firstChild)
      nodes[i].parentNode.replaceChild(nodes[i].firstChild, nodes[i]);
  document.documentElement.normalize();
  this.matches = [];
};
