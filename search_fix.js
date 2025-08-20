// rVim Search Function Fix Script
// This script diagnoses and fixes common search functionality issues

(function() {
    'use strict';
    
    console.log('🔧 rVim Search Fix Script Starting...');
    
    // Check if Find object exists and is properly initialized
    function checkFindObject() {
        if (typeof window.Find === 'undefined') {
            console.error('❌ Find object is not defined');
            return false;
        }
        
        const requiredProperties = ['matches', 'index', 'mode', 'highlight', 'search', 'clear'];
        const missingProperties = [];
        
        requiredProperties.forEach(prop => {
            if (typeof window.Find[prop] === 'undefined') {
                missingProperties.push(prop);
            }
        });
        
        if (missingProperties.length > 0) {
            console.error('❌ Find object missing properties:', missingProperties);
            return false;
        }
        
        console.log('✅ Find object is properly initialized');
        return true;
    }
    
    // Check if settings object exists
    function checkSettings() {
        if (typeof window.settings === 'undefined') {
            console.warn('⚠️ Settings object is not defined, using defaults');
            window.settings = {
                ignorecase: true,
                smartcase: false,
                regexp: false,
                incsearch: true
            };
            return false;
        }
        console.log('✅ Settings object exists');
        return true;
    }
    
    // Check if HUD object exists
    function checkHUD() {
        if (typeof window.HUD === 'undefined') {
            console.warn('⚠️ HUD object is not defined, creating minimal version');
            window.HUD = {
                display: function(message, timeout) {
                    console.log('HUD:', message);
                    // Create a simple HUD display
                    let hudElement = document.getElementById('rVim-hud-fix');
                    if (!hudElement) {
                        hudElement = document.createElement('div');
                        hudElement.id = 'rVim-hud-fix';
                        hudElement.style.cssText = `
                            position: fixed;
                            top: 10px;
                            right: 10px;
                            background: rgba(0, 0, 0, 0.8);
                            color: white;
                            padding: 8px 12px;
                            border-radius: 4px;
                            font-family: monospace;
                            font-size: 12px;
                            z-index: 10000;
                            pointer-events: none;
                        `;
                        document.body.appendChild(hudElement);
                    }
                    hudElement.textContent = message;
                    hudElement.style.display = 'block';
                    
                    if (timeout) {
                        setTimeout(() => {
                            hudElement.style.display = 'none';
                        }, timeout * 1000);
                    }
                },
                hide: function() {
                    const hudElement = document.getElementById('rVim-hud-fix');
                    if (hudElement) {
                        hudElement.style.display = 'none';
                    }
                }
            };
            return false;
        }
        console.log('✅ HUD object exists');
        return true;
    }
    
    // Check if DOM utility functions exist
    function checkDOM() {
        if (typeof window.DOM === 'undefined') {
            console.warn('⚠️ DOM object is not defined, creating minimal version');
            window.DOM = {
                isVisible: function(element) {
                    if (!element || !element.offsetParent) return false;
                    const style = window.getComputedStyle(element);
                    return style.display !== 'none' && 
                           style.visibility !== 'hidden' && 
                           style.opacity !== '0';
                },
                isEditable: function(element) {
                    if (!element) return false;
                    const tagName = element.tagName.toLowerCase();
                    return tagName === 'input' || 
                           tagName === 'textarea' || 
                           element.contentEditable === 'true';
                }
            };
            return false;
        }
        console.log('✅ DOM object exists');
        return true;
    }
    
    // Check if Utils object exists
    function checkUtils() {
        if (typeof window.Utils === 'undefined') {
            console.warn('⚠️ Utils object is not defined, creating minimal version');
            window.Utils = {
                trueModulo: function(n, m) {
                    return ((n % m) + m) % m;
                }
            };
            return false;
        }
        console.log('✅ Utils object exists');
        return true;
    }
    
    // Fix Find.highlight function if it has issues
    function fixFindHighlight() {
        if (!window.Find || typeof window.Find.highlight !== 'function') {
            console.error('❌ Find.highlight function is missing');
            return false;
        }
        
        // Store original function
        const originalHighlight = window.Find.highlight;
        
        // Create enhanced version with error handling
        window.Find.highlight = function(params) {
            try {
                // Ensure required parameters
                params = params || {};
                params.base = params.base || document.body;
                
                if (!params.search) {
                    console.warn('⚠️ No search term provided');
                    return;
                }
                
                // Clear previous matches
                this.clear();
                
                console.log('🔍 Searching for:', params.search);
                
                // Call original function
                return originalHighlight.call(this, params);
                
            } catch (error) {
                console.error('❌ Error in Find.highlight:', error);
                HUD.display('Search error: ' + error.message, 3);
            }
        };
        
        console.log('✅ Find.highlight function enhanced');
        return true;
    }
    
    // Fix Find.search function if it has issues
    function fixFindSearch() {
        if (!window.Find || typeof window.Find.search !== 'function') {
            console.error('❌ Find.search function is missing');
            return false;
        }
        
        // Store original function
        const originalSearch = window.Find.search;
        
        // Create enhanced version with error handling
        window.Find.search = function(mode, repeats, ignoreFocus) {
            try {
                if (this.matches.length === 0) {
                    console.warn('⚠️ No matches found for search');
                    HUD.display('No matches', 2);
                    return;
                }
                
                console.log('🎯 Navigating to match:', this.index + 1, 'of', this.matches.length);
                
                // Call original function
                return originalSearch.call(this, mode, repeats, ignoreFocus);
                
            } catch (error) {
                console.error('❌ Error in Find.search:', error);
                HUD.display('Navigation error: ' + error.message, 3);
            }
        };
        
        console.log('✅ Find.search function enhanced');
        return true;
    }
    
    // Test search functionality
    function testSearchFunction() {
        console.log('🧪 Testing search functionality...');
        
        try {
            // Test with a simple search
            window.Find.highlight({
                base: document.body,
                mode: '/',
                search: 'test',
                setIndex: true,
                executeSearch: false,
                saveSearch: true
            });
            
            if (window.Find.matches.length > 0) {
                console.log('✅ Search test passed:', window.Find.matches.length, 'matches found');
                HUD.display(`Search working: ${window.Find.matches.length} matches`, 2);
                
                // Test navigation
                window.Find.search('/', 1);
                console.log('✅ Navigation test passed');
                
                return true;
            } else {
                console.warn('⚠️ Search test found no matches');
                HUD.display('Search test: no matches found', 2);
                return false;
            }
        } catch (error) {
            console.error('❌ Search test failed:', error);
            HUD.display('Search test failed: ' + error.message, 3);
            return false;
        }
    }
    
    // Main fix function
    function runFixes() {
        console.log('🚀 Running rVim search fixes...');
        
        const checks = [
            { name: 'Settings', fn: checkSettings },
            { name: 'HUD', fn: checkHUD },
            { name: 'DOM', fn: checkDOM },
            { name: 'Utils', fn: checkUtils },
            { name: 'Find Object', fn: checkFindObject },
            { name: 'Find.highlight', fn: fixFindHighlight },
            { name: 'Find.search', fn: fixFindSearch }
        ];
        
        let allPassed = true;
        
        checks.forEach(check => {
            try {
                const result = check.fn();
                console.log(`${result ? '✅' : '⚠️'} ${check.name}: ${result ? 'OK' : 'Fixed/Created'}`);
                if (!result) allPassed = false;
            } catch (error) {
                console.error(`❌ ${check.name}: Error -`, error);
                allPassed = false;
            }
        });
        
        // Run test
        setTimeout(() => {
            const testResult = testSearchFunction();
            
            if (allPassed && testResult) {
                console.log('🎉 All fixes applied successfully! Search should now work.');
                HUD.display('rVim search fixed! Press / to search', 3);
            } else {
                console.log('⚠️ Some issues remain. Check console for details.');
                HUD.display('Search partially fixed. Check console.', 3);
            }
        }, 500);
    }
    
    // Add keyboard shortcut to manually trigger fixes
    document.addEventListener('keydown', function(event) {
        // Ctrl+Shift+F to trigger fixes
        if (event.ctrlKey && event.shiftKey && event.key === 'F') {
            event.preventDefault();
            console.log('🔧 Manual fix trigger activated');
            runFixes();
        }
    });
    
    // Run fixes immediately
    runFixes();
    
    // Also run fixes after a delay to ensure all scripts are loaded
    setTimeout(runFixes, 2000);
    
    console.log('🔧 rVim Search Fix Script Loaded. Press Ctrl+Shift+F to manually trigger fixes.');
    
})();