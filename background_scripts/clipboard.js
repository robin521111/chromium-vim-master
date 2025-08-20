var Clipboard = {};

// Service Worker compatible clipboard operations
Clipboard.copy = function(text) {
  // In Service Worker, clipboard operations need to be handled differently
  // This will be handled by content scripts via messaging
  console.log('Clipboard copy requested:', text);
  // Send message to active tab to handle clipboard operation
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    if (tabs[0]) {
      chrome.tabs.sendMessage(tabs[0].id, {
        action: 'copyToClipboard',
        text: text
      });
    }
  });
};

Clipboard.paste = function(callback) {
  // In Service Worker, clipboard operations need to be handled differently
  console.log('Clipboard paste requested');
  // Send message to active tab to handle clipboard operation
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    if (tabs[0]) {
      chrome.tabs.sendMessage(tabs[0].id, {
        action: 'pasteFromClipboard'
      }, callback);
    }
  });
};

// Legacy methods for backward compatibility
Clipboard.createTextArea = function() {
  console.warn('createTextArea is not available in Service Worker');
  return null;
};
