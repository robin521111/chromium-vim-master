// Service Worker compatible version of rvimrc_parser.js
// This is a wrapper that ensures the parser works in Service Worker environment

// Import the original parser
importScripts('../content_scripts/rvimrc_parser.js');

// Ensure RCParser is available in the global scope
if (typeof self !== 'undefined' && typeof self.RCParser !== 'undefined') {
  // RCParser is already available through the imported script
  var RCParser = self.RCParser;
} else if (typeof this !== 'undefined' && typeof this.RCParser !== 'undefined') {
  var RCParser = this.RCParser;
  // Also expose it to self for consistency
  if (typeof self !== 'undefined') {
    self.RCParser = RCParser;
  }
}

// parseConfig function - works in Service Worker environment
var parseConfig = (function() {
  var formatConfig = function(configText, config) {
    var result = {
      MAPPINGS: [],
    };
    for (var key in config) {
      if (key === 'MAPPINGS') {
        result.MAPPINGS.push(config[key]);
      } else if (config[key].constructor === Object) {
        result[key] = Object.extend(result[key], config[key]);
      } else {
        result[key] = config[key];
      }
    }
    result.MAPPINGS = result.MAPPINGS.join('\n');
    result.RC = configText;
    return result;
  };
  return function(value) {
    try {
      return {
        error: null,
        value: formatConfig(value, RCParser.parse(value))
      };
    } catch (e) {
      return {
        error: {
          lineno: e.line,
          message: e.message
        },
        value: null
      };
    }
  };
})();

// Expose parseConfig to global scope for service worker environment
if (typeof self !== 'undefined') {
  self.parseConfig = parseConfig;
}