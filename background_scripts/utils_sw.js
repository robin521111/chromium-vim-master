// Service Worker compatible version of utils.js
// This file contains only the utility functions needed by background scripts
// without any window object dependencies

var Utils = {
  cacheFunction: function(callback) {
    var cache = new Map();
    var result = function(arg) {
      if (cache.has(arg))
        return cache.get(arg);
      var retval = callback(arg);
      cache.set(arg, retval);
      return retval;
    };
    result.clearCache = function() {
      cache.clear();
    };
    return result;
  },
  trueModulo: function(a, b) {
    return ((a % b) + b) % b;
  },
  uniqueElements: function(array) {
    var result = [];
    for (var i = 0; i < array.length; i++) {
      if (result.indexOf(array[i]) === -1)
        result.push(array[i]);
    }
    return result;
  },
  compressArray: function(array) {
    var result = [];
    // faster than using [].filter
    for (var i = 0; i < array.length; i++) {
      if (array[i])
        result.push(array[i]);
    }
    return result;
  },
  // splits a string without leaving empty strings in the resultant array
  split: function(string, pattern) {
    return this.compressArray(string.split(pattern));
  },
  trim: function(string) {
    return string.replace(/^(\s+)?(.*\S)?(\s+)?$/g, '$2');
  },
  format: function(string, value) {
    var index = string.lastIndexOf('%s');
    if (index < 0)
      return string + value;
    return string.slice(0, index) + value + string.slice(index + 2);
  },
  toSearchURL: (function() {
    var hasProtocol = /^[a-zA-Z]+:\/\//;
    var isValidDomain = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/;
    var isValidIP = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    var isValidURL = /^(https?:\/\/)?(([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}|localhost|\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})(:\d+)?(\/.*)?$/;
    
    return function(url, engine) {
      if (!url) return '';
      
      // If it already has a protocol, return as is
      if (hasProtocol.test(url)) {
        return url;
      }
      
      // Check if it looks like a URL
      if (isValidURL.test(url) || isValidDomain.test(url) || isValidIP.test(url) || url === 'localhost') {
        return 'http://' + url;
      }
      
      // Otherwise, treat as search query
      var searchEngine = engine || 'https://www.google.com/search?q=%s';
      return searchEngine.replace('%s', encodeURIComponent(url));
    };
  })()
};

// Object.clone function
Object.clone = function(node) {
  if (node === null || node === undefined) {
    return node;
  } else if (Array.isArray(node)) {
    return node.map(function(e) {
      return Object.clone(e);
    });
  } else if (typeof node === 'object') {
    var o = {};
    for (var key in node) {
      o[key] = Object.clone(node[key]);
    }
    return o;
  } else {
    return node;
  }
};

// Object.extend function
Object.extend = function(destination, source) {
  for (var key in source) {
    if (source.hasOwnProperty(key)) {
      destination[key] = source[key];
    }
  }
  return destination;
};