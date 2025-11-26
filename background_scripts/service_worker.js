// Service Worker for rVim extension (Manifest V3)
// This file imports all the background scripts that were previously loaded in manifest v2

console.log('rVim Service Worker: Starting import of scripts...');

// Import all background scripts with error handling
try {
  importScripts(
    '../content_scripts/utils.js',
    '../content_scripts/rvimrc_parser.js',
    './options.js',
    './clipboard.js',
    './bookmarks.js',
    './sites.js',
    './files.js',
    './links.js',
    './history.js',
    './sessions.js',
    './frames.js',
    './tab_creation_order.js',
    './popup.js',
    './update.js',
    './actions.js',
    './main.js'
  );
  console.log('rVim Service Worker: All scripts imported successfully');
} catch (error) {
  console.error('rVim Service Worker: Error importing scripts:', error);
}

// Service worker event listeners
self.addEventListener('install', (event) => {
  console.log('rVim service worker installed');
});

self.addEventListener('activate', (event) => {
  console.log('rVim service worker activated');
});