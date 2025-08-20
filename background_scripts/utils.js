// Service Worker compatible utilities
// This is a simplified version of content_scripts/utils.js for background scripts

var Utils = {
  compressArray: function(array) {
    return array.filter(function(e) {
      return e && e.trim && e.trim().length > 0;
    });
  },

  uniqueElements: function(array) {
    var seen = {};
    return array.filter(function(item) {
      if (seen[item]) {
        return false;
      }
      seen[item] = true;
      return true;
    });
  },

  trueModulo: function(n, m) {
    return ((n % m) + m) % m;
  },

  toSearchURL: function(url, engineUrl) {
    if (!url) return '';
    
    // If it's already a URL, return as is
    if (url.indexOf('://') !== -1) {
      return url;
    }
    
    // Use the engine URL if provided
    if (engineUrl) {
      return engineUrl.replace('%s', encodeURIComponent(url));
    }
    
    // Default to Google search
    return 'https://www.google.com/search?q=' + encodeURIComponent(url);
  }
};

// matchLocation function for URL pattern matching
var matchLocation = function(url, pattern) { // Uses @match syntax
  // See https://code.google.com/p/chromium/codesearch#chromium/src/extensions/common/url_pattern.h&sq=package:chromium
  if (typeof pattern !== 'string' || !pattern.trim()) {
    return false;
  }
  var protocol = (pattern.match(/.*:\/\//) || [''])[0].slice(0, -2),
      hostname, path, pathMatch, hostMatch;
  try {
    url = new URL(url);
  } catch (e) {
    return false;
  }
  if (/\*\*/.test(pattern)) {
    console.error('rVim Error: Invalid pattern: "%s"', pattern);
    return false;
  }
  if (protocol && url.protocol.slice(0, -1) !== protocol) {
    return false;
  }
  hostname = pattern.replace(/.*:\/\//, '').replace(/\/.*/, '');
  path = '/' + pattern.replace(/.*:\/\//, '').replace(/[^\/]*/, '').replace(/^\//, '');
  pathMatch = new RegExp('^' + path.replace(/\*/g, '.*') + '$').test(url.pathname);
  hostMatch = new RegExp('^' + hostname.replace(/\*/g, '[^\.]*') + '$').test(url.hostname);
  return hostMatch && pathMatch;
};

// Export for Service Worker
if (typeof self !== 'undefined' && typeof window === 'undefined') {
  self.Utils = Utils;
  self.matchLocation = matchLocation;
}