// Service Worker for rVim extension (Manifest V3)
// This file imports all the background scripts that were previously loaded in manifest v2

console.log('rVim Service Worker: Starting import of scripts...');

// Import Service Worker compatible utilities and background scripts
try {
  // Import Service Worker compatible utilities first
  importScripts(
    'background_scripts/security_utils.js',
    'background_scripts/utils_sw.js',
    'background_scripts/rvimrc_parser_sw.js'
  );
  
  // Then import background scripts
  importScripts(
    'background_scripts/options.js',
    'background_scripts/clipboard.js',
    'background_scripts/bookmarks.js',
    'background_scripts/sites.js',
    'background_scripts/files.js',
    'background_scripts/links.js',
    'background_scripts/history.js',
    'background_scripts/sessions.js',
    'background_scripts/frames.js',
    'background_scripts/tab_creation_order.js',
    'background_scripts/popup.js',
    'background_scripts/update.js',
    'background_scripts/actions.js',
    'background_scripts/main.js'
  );
  console.log('rVim Service Worker: All scripts imported successfully');
} catch (error) {
  console.error('rVim Service Worker: Error importing scripts:', error);
  console.error('Error details:', error.message, 'at', error.filename + ':' + error.lineno);
}

// Service worker event listeners
self.addEventListener('install', (event) => {
  console.log('rVim service worker installed');
});

self.addEventListener('activate', (event) => {
  console.log('rVim service worker activated');
});