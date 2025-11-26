// Service Worker compatible RC parser
// This is a simplified version of content_scripts/rvimrc_parser.js for background scripts

var RCParser = {
  parse: function(config) {
    if (!config || typeof config !== 'string') {
      return {};
    }
    
    var lines = config.split('\n');
    var result = {};
    
    for (var i = 0; i < lines.length; i++) {
      var line = lines[i].trim();
      
      // Skip empty lines and comments
      if (!line || line.charAt(0) === '"') {
        continue;
      }
      
      // Parse simple key-value pairs
      var parts = line.split(/\s+/);
      if (parts.length >= 2) {
        var command = parts[0];
        var value = parts.slice(1).join(' ');
        
        switch (command) {
          case 'set':
            this.parseSet(value, result);
            break;
          case 'map':
          case 'unmap':
          case 'imap':
          case 'iunmap':
            this.parseMapping(command, value, result);
            break;
          case 'site':
            this.parseSite(value, result);
            break;
          default:
            // Store unknown commands as-is
            if (!result.commands) result.commands = [];
            result.commands.push(line);
        }
      }
    }
    
    return result;
  },
  
  parseSet: function(value, result) {
    var parts = value.split('=');
    if (parts.length === 2) {
      var key = parts[0].trim();
      var val = parts[1].trim();
      
      if (!result.settings) result.settings = {};
      result.settings[key] = val;
    }
  },
  
  parseMapping: function(command, value, result) {
    var parts = value.split(/\s+/);
    if (parts.length >= 2) {
      var key = parts[0];
      var action = parts.slice(1).join(' ');
      
      if (!result.mappings) result.mappings = {};
      if (!result.mappings[command]) result.mappings[command] = {};
      result.mappings[command][key] = action;
    }
  },
  
  parseSite: function(value, result) {
    var parts = value.split(/\s+/);
    if (parts.length >= 2) {
      var pattern = parts[0];
      var config = parts.slice(1).join(' ');
      
      if (!result.sites) result.sites = {};
      result.sites[pattern] = config;
    }
  }
};

// Export for Service Worker
if (typeof self !== 'undefined' && typeof window === 'undefined') {
  self.RCParser = RCParser;
}

// Also create parseConfig function for compatibility
var parseConfig = function(data) {
  return RCParser.parse(data);
};

if (typeof self !== 'undefined' && typeof window === 'undefined') {
  self.parseConfig = parseConfig;
}