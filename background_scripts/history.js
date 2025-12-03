var History = {

  historyTypes: ['action', 'url', 'search'],
  searchResults: null,
  historyStore: [],
  commandHistory: {},
  shouldRefresh: false,

  saveCommandHistory: function() {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      if (!settings || !settings.consentData || !settings.collectHistory) {
        return;
      }
      Object.keys(this.commandHistory).forEach(function(e) {
        var data = {};
        data[e] = JSON.stringify(this.commandHistory[e]);
        chrome.storage.local.set(data);
      }.bind(this));
    }
  },

  clear: function() {
    this.commandHistory = {};
    this.historyTypes.forEach(function(type) {
      this.commandHistory[type] = [];
    }.bind(this));
  },

  sendToTabs: function() {
    chrome.tabs.query({}, function(tabs) {
      tabs.forEach(function(tab) {
        chrome.tabs.sendMessage(tab.id, {
          action: 'commandHistory',
          history: History.commandHistory
        });
      });
    });
  },

  append: function(value, type) {
    if (~this.historyTypes.indexOf(type)) {
      if (settings && settings.consentData && settings.collectHistory) {
        this.commandHistory[type].push('' + value);
        this.commandHistory[type] = this.commandHistory[type].splice(-500);
        this.saveCommandHistory();
      }
    }
  },

  retrieve: function(type) {
    return [type, this.commandHistory[type]];
  },

  refreshStore: (function() {
    var utime;
    var calculateWeight = function(item) {
      var weight = 1;
      var points = 0;
      var delta = utime - item.lastVisitTime;
      switch (true) {
      case delta < 345600000:  // 0-4 days
        break;
      case delta < 1209600000: // 5-14 days
        weight = 0.7; break;
      case delta < 2678400000: // 15-31 days
        weight = 0.5; break;
      case delta < 7776000000: // 32-90 days
        weight = 0.3; break;
      default: weight = 0.1;
      }
      points += item.visitCount * 100 * weight;
      points += item.typedCount * 200 * weight;
      return points;
    };
    return function() {
      utime = new Date().getTime();
      this.shouldRefresh = false;
      chrome.history.search({
        text: '',
        startTime: 0,
        maxResults: 2147483647,
      }, function(results) {
        History.historyStore = results.sort(function(a, b) {
          return calculateWeight(b) - calculateWeight(a);
        });
      });
    };
  })(),

  retrieveSearchHistory: function(search, limit, callback) {
    if (History.shouldRefresh) {
      History.refreshStore();
    }
    callback(searchArray({
      array: this.historyStore,
      search: search,
      limit: limit,
      fn: function(item) {
        return item.title + ' ' + item.url;
      }
    }), true);
  }

};

(function() {
  if (typeof chrome !== 'undefined' && chrome.storage) {
    // Use chrome.storage in Service Worker environment
    History.historyTypes.forEach(function(type) {
      chrome.storage.local.get([type], function(result) {
        var data = result[type];
        try {
          data = JSON.parse(data);
        } catch (e) {
          data = typeof data === 'string' ? data.split(',') : [];
        }
        History.commandHistory[type] = data || [];
      });
    });
  } else {
    // Fallback for non-Service Worker environments
    History.historyTypes.forEach(function(type) {
      History.commandHistory[type] = [];
    });
  }
})();

History.refreshStore();
