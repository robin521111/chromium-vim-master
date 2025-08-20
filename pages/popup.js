var pause = document.getElementById('pause'),
    blacklist = document.getElementById('blacklist'),
    settings = document.getElementById('settings'),
    isEnabled = true,
    isBlacklisted = false;

var port = chrome.runtime.connect({name: 'popup'});
port.onMessage.addListener(function(data) {
  if (data === true) {
    blacklist.textContent = 'Enable rVim on this domain';
    isBlacklisted = true;
  }
});
port.postMessage({action: 'getBlacklisted'});

chrome.runtime.sendMessage({action: 'getActiveState'}, function(response) {
  isEnabled = response;
  if (isEnabled) {
    pause.textContent = 'Disable rVim';
  } else {
    pause.textContent = 'Enable rVim';
  }
});

settings.addEventListener('click', function() {
  chrome.runtime.sendMessage({
    action: 'openLinkTab',
    active: true,
    url: chrome.runtime.getURL('/pages/options.html')
  });
}, false);

pause.addEventListener('click', function() {
  isEnabled = !isEnabled;
  if (isEnabled) {
    pause.textContent = 'Disable rVim';
  } else {
    pause.textContent = 'Enable rVim';
  }
  port.postMessage({action: 'toggleEnabled', blacklisted: isBlacklisted});
}, false);

blacklist.addEventListener('click', function() {
  isBlacklisted = !isBlacklisted;
  if (blacklist.textContent === 'Disable rVim on this domain') {
    blacklist.textContent = 'Enable rVim on this domain';
  } else {
    blacklist.textContent = 'Disable rVim on this domain';
  }
  port.postMessage({action: 'toggleBlacklisted'});
  if (isEnabled) {
    port.postMessage({
      action: 'toggleEnabled',
      singleTab: true,
      blacklisted: isBlacklisted
    });
  }
}, false);
