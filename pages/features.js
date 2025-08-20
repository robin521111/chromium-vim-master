// Features Page JavaScript

// Multi-language support
const translations = {
    en: {
        'features.title': 'Core Features',
        'features.hints.title': 'Link Hints',
        'features.hints.desc': 'Press \'f\' to show numbered hints for all clickable elements. Press \'F\' to open links in new tabs.',
        'features.hints.current': 'Current tab',
        'features.hints.new': 'New tab',
        'features.navigation.title': 'Vim Navigation',
        'features.navigation.desc': 'Navigate pages using familiar Vim keybindings for efficient browsing.',
        'features.navigation.scroll': 'Scroll down/up',
        'features.navigation.top': 'Top/Bottom',
        'features.navigation.history': 'Back/Forward',
        'features.search.title': 'Search & Find',
        'features.search.desc': 'Powerful search capabilities with regex support and quick navigation.',
        'features.search.page': 'Search in page',
        'features.search.omni': 'Omnibar search',
        'features.search.bookmarks': 'Search bookmarks',
        'features.tabs.title': 'Tab Management',
        'features.tabs.desc': 'Efficiently manage browser tabs with keyboard shortcuts.',
        'features.tabs.new': 'New tab',
        'features.tabs.close': 'Close tab',
        'features.tabs.switch': 'Switch tabs',
        'features.visual.title': 'Visual Mode',
        'features.visual.desc': 'Select and copy text using visual selection mode.',
        'features.visual.char': 'Character mode',
        'features.visual.line': 'Line mode',
        'features.visual.copy': 'Copy selection',
        'features.commands.title': 'Command Mode',
        'features.commands.desc': 'Execute powerful commands through the command bar.',
        'features.commands.open': 'Open command bar',
        'features.commands.url': 'Open URL',
        'features.commands.settings': 'Change settings',
        'appearance.title': 'Appearance Settings',
        'appearance.hints.title': 'Link Hints Style',
        'appearance.hints.bg_color': 'Background Color:',
        'appearance.hints.border_color': 'Border Color:',
        'appearance.hints.text_color': 'Text Color:',
        'appearance.hints.font_size': 'Font Size:',
        'appearance.hints.border_radius': 'Border Radius:',
        'appearance.hints.opacity': 'Opacity:',
        'appearance.hints.preview': 'Preview:',
        'appearance.command.title': 'Command Bar Style',
        'appearance.command.bg_color': 'Background Color:',
        'appearance.command.text_color': 'Text Color:',
        'appearance.command.font_family': 'Font Family:',
        'appearance.command.font_size': 'Font Size:',
        'appearance.theme.title': 'Theme Settings',
        'appearance.theme.mode': 'Theme Mode:',
        'appearance.theme.auto': 'Auto',
        'appearance.theme.light': 'Light',
        'appearance.theme.dark': 'Dark',
        'appearance.theme.accent': 'Accent Color:',
        'keyboard.title': 'Keyboard Settings',
        'keyboard.general.title': 'General Settings',
        'keyboard.general.scroll_speed': 'Scroll Speed:',
        'keyboard.general.smooth_scroll': 'Smooth Scrolling:',
        'keyboard.general.case_sensitive': 'Case Sensitive Search:',
        'keyboard.hints.title': 'Link Hints Settings',
        'keyboard.hints.characters': 'Hint Characters:',
        'keyboard.hints.delay': 'Hint Delay (ms):',
        'keyboard.hints.auto_follow': 'Auto Follow Single Hint:',
        'advanced.title': 'Advanced Settings',
        'advanced.performance.title': 'Performance',
        'advanced.performance.animation': 'Enable Animations:',
        'advanced.performance.prefetch': 'Prefetch Links:',
        'advanced.security.title': 'Security',
        'advanced.security.block_ads': 'Block Ads:',
        'advanced.security.safe_mode': 'Safe Mode:',
        'advanced.export.title': 'Import/Export',
        'advanced.export.export': 'Export Settings',
        'advanced.export.import': 'Import Settings',
        'advanced.export.reset': 'Reset All Settings',
        'common.save': 'Save Settings',
        'common.cancel': 'Cancel',
        'common.apply': 'Apply',
        'common.version': 'Version'
    },
    zh: {
        'features.title': '核心功能',
        'features.hints.title': '链接提示',
        'features.hints.desc': '按 \'f\' 键显示所有可点击元素的数字提示。按 \'F\' 键在新标签页中打开链接。',
        'features.hints.current': '当前标签页',
        'features.hints.new': '新标签页',
        'features.navigation.title': 'Vim 导航',
        'features.navigation.desc': '使用熟悉的 Vim 键位绑定进行高效的页面导航。',
        'features.navigation.scroll': '向下/向上滚动',
        'features.navigation.top': '顶部/底部',
        'features.navigation.history': '后退/前进',
        'features.search.title': '搜索与查找',
        'features.search.desc': '强大的搜索功能，支持正则表达式和快速导航。',
        'features.search.page': '页面内搜索',
        'features.search.omni': '地址栏搜索',
        'features.search.bookmarks': '搜索书签',
        'features.tabs.title': '标签页管理',
        'features.tabs.desc': '使用键盘快捷键高效管理浏览器标签页。',
        'features.tabs.new': '新建标签页',
        'features.tabs.close': '关闭标签页',
        'features.tabs.switch': '切换标签页',
        'features.visual.title': '可视化模式',
        'features.visual.desc': '使用可视化选择模式选择和复制文本。',
        'features.visual.char': '字符模式',
        'features.visual.line': '行模式',
        'features.visual.copy': '复制选择',
        'features.commands.title': '命令模式',
        'features.commands.desc': '通过命令栏执行强大的命令。',
        'features.commands.open': '打开命令栏',
        'features.commands.url': '打开网址',
        'features.commands.settings': '更改设置',
        'appearance.title': '外观设置',
        'appearance.hints.title': '链接提示样式',
        'appearance.hints.bg_color': '背景颜色：',
        'appearance.hints.border_color': '边框颜色：',
        'appearance.hints.text_color': '文字颜色：',
        'appearance.hints.font_size': '字体大小：',
        'appearance.hints.border_radius': '边框圆角：',
        'appearance.hints.opacity': '透明度：',
        'appearance.hints.preview': '预览：',
        'appearance.command.title': '命令栏样式',
        'appearance.command.bg_color': '背景颜色：',
        'appearance.command.text_color': '文字颜色：',
        'appearance.command.font_family': '字体系列：',
        'appearance.command.font_size': '字体大小：',
        'appearance.theme.title': '主题设置',
        'appearance.theme.mode': '主题模式：',
        'appearance.theme.auto': '自动',
        'appearance.theme.light': '浅色',
        'appearance.theme.dark': '深色',
        'appearance.theme.accent': '强调色：',
        'keyboard.title': '键盘设置',
        'keyboard.general.title': '常规设置',
        'keyboard.general.scroll_speed': '滚动速度：',
        'keyboard.general.smooth_scroll': '平滑滚动：',
        'keyboard.general.case_sensitive': '区分大小写搜索：',
        'keyboard.hints.title': '链接提示设置',
        'keyboard.hints.characters': '提示字符：',
        'keyboard.hints.delay': '提示延迟（毫秒）：',
        'keyboard.hints.auto_follow': '自动跟随单个提示：',
        'advanced.title': '高级设置',
        'advanced.performance.title': '性能',
        'advanced.performance.animation': '启用动画：',
        'advanced.performance.prefetch': '预取链接：',
        'advanced.security.title': '安全',
        'advanced.security.block_ads': '屏蔽广告：',
        'advanced.security.safe_mode': '安全模式：',
        'advanced.export.title': '导入/导出',
        'advanced.export.export': '导出设置',
        'advanced.export.import': '导入设置',
        'advanced.export.reset': '重置所有设置',
        'common.save': '保存设置',
        'common.cancel': '取消',
        'common.apply': '应用',
        'common.version': '版本'
    }
};

// Global variables
let currentLanguage = 'en';
let currentSettings = {};
let originalSettings = {};

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    initializeLanguage();
    initializeNavigation();
    initializeSettings();
    initializeEventListeners();
    loadCurrentSettings();
});

// Language functions
function initializeLanguage() {
    // Detect browser language
    const browserLang = navigator.language.toLowerCase();
    if (browserLang.startsWith('zh')) {
        currentLanguage = 'zh';
        document.getElementById('lang-zh').classList.add('active');
        document.getElementById('lang-en').classList.remove('active');
    }
    
    updateLanguage();
}

function updateLanguage() {
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (translations[currentLanguage] && translations[currentLanguage][key]) {
            element.textContent = translations[currentLanguage][key];
        }
    });
    
    // Update document title
    document.title = currentLanguage === 'zh' ? 'rVim 功能与配置' : 'rVim Features & Configuration';
}

function switchLanguage(lang) {
    currentLanguage = lang;
    
    // Update active language button
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.getElementById(`lang-${lang}`).classList.add('active');
    
    updateLanguage();
}

// Navigation functions
function initializeNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.getAttribute('data-section');
            showSection(section);
            
            // Update active nav link
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
        });
    });
}

function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show target section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
    }
}

// Settings functions
function initializeSettings() {
    // Initialize color previews
    updateColorPreviews();
    
    // Initialize range value displays
    updateRangeValues();
    
    // Initialize hint preview
    updateHintPreview();
}

function updateColorPreviews() {
    const colorInputs = document.querySelectorAll('input[type="color"]');
    colorInputs.forEach(input => {
        const previewId = input.id.replace('-color', '-preview');
        const preview = document.getElementById(previewId);
        if (preview) {
            preview.style.backgroundColor = input.value;
        }
    });
}

function updateRangeValues() {
    const rangeInputs = document.querySelectorAll('input[type="range"]');
    rangeInputs.forEach(input => {
        const valueId = input.id + '-value';
        const valueDisplay = document.getElementById(valueId);
        if (valueDisplay) {
            let value = input.value;
            if (input.id.includes('font-size') || input.id.includes('border-radius')) {
                value += 'px';
            } else if (input.id.includes('delay')) {
                value += 'ms';
            }
            valueDisplay.textContent = value;
        }
    });
}

function updateHintPreview() {
    const preview = document.getElementById('hint-preview');
    if (!preview) return;
    
    const bgColor = document.getElementById('hint-bg-color').value;
    const borderColor = document.getElementById('hint-border-color').value;
    const textColor = document.getElementById('hint-text-color').value;
    const fontSize = document.getElementById('hint-font-size').value + 'px';
    const borderRadius = document.getElementById('hint-border-radius').value + 'px';
    const opacity = document.getElementById('hint-opacity').value;
    
    preview.style.backgroundColor = bgColor;
    preview.style.borderColor = borderColor;
    preview.style.color = textColor;
    preview.style.fontSize = fontSize;
    preview.style.borderRadius = borderRadius;
    preview.style.opacity = opacity;
}

// Event listeners
function initializeEventListeners() {
    // Language switcher
    document.getElementById('lang-en').addEventListener('click', () => switchLanguage('en'));
    document.getElementById('lang-zh').addEventListener('click', () => switchLanguage('zh'));
    
    // Color inputs
    document.querySelectorAll('input[type="color"]').forEach(input => {
        input.addEventListener('input', function() {
            const previewId = this.id.replace('-color', '-preview');
            const preview = document.getElementById(previewId);
            if (preview) {
                preview.style.backgroundColor = this.value;
            }
            
            if (this.id.startsWith('hint-')) {
                updateHintPreview();
            }
        });
    });
    
    // Range inputs
    document.querySelectorAll('input[type="range"]').forEach(input => {
        input.addEventListener('input', function() {
            const valueId = this.id + '-value';
            const valueDisplay = document.getElementById(valueId);
            if (valueDisplay) {
                let value = this.value;
                if (this.id.includes('font-size') || this.id.includes('border-radius')) {
                    value += 'px';
                } else if (this.id.includes('delay')) {
                    value += 'ms';
                }
                valueDisplay.textContent = value;
            }
            
            if (this.id.startsWith('hint-')) {
                updateHintPreview();
            }
        });
    });
    
    // Action buttons
    document.getElementById('export-settings').addEventListener('click', exportSettings);
    document.getElementById('import-settings').addEventListener('click', () => {
        document.getElementById('import-file').click();
    });
    document.getElementById('import-file').addEventListener('change', importSettings);
    document.getElementById('reset-all').addEventListener('click', resetAllSettings);
    
    // Footer buttons
    document.getElementById('save-settings').addEventListener('click', saveSettings);
    document.getElementById('cancel-settings').addEventListener('click', cancelSettings);
    document.getElementById('apply-settings').addEventListener('click', applySettings);
}

// Settings management
function loadCurrentSettings() {
    // Load settings from chrome.storage or use defaults
    if (typeof chrome !== 'undefined' && chrome.storage) {
        chrome.storage.sync.get(null, function(items) {
            currentSettings = items;
            originalSettings = JSON.parse(JSON.stringify(items));
            applySettingsToUI();
        });
    } else {
        // Use default settings for demo
        currentSettings = getDefaultSettings();
        originalSettings = JSON.parse(JSON.stringify(currentSettings));
        applySettingsToUI();
    }
}

function getDefaultSettings() {
    return {
        hintBgColor: '#90EE90',
        hintBorderColor: '#32CD32',
        hintTextColor: '#000000',
        hintFontSize: 11,
        hintBorderRadius: 3,
        hintOpacity: 0.9,
        cmdBgColor: '#1e1e1e',
        cmdTextColor: '#ffffff',
        cmdFontFamily: 'monospace',
        cmdFontSize: 14,
        themeMode: 'auto',
        accentColor: '#007acc',
        scrollSpeed: 3,
        smoothScroll: true,
        caseSensitive: false,
        hintCharacters: 'asdfghjkl',
        hintDelay: 100,
        autoFollow: true,
        enableAnimations: true,
        prefetchLinks: false,
        blockAds: false,
        safeMode: true
    };
}

function applySettingsToUI() {
    // Apply settings to form elements
    Object.keys(currentSettings).forEach(key => {
        const element = document.getElementById(kebabCase(key));
        if (element) {
            if (element.type === 'checkbox') {
                element.checked = currentSettings[key];
            } else {
                element.value = currentSettings[key];
            }
        }
    });
    
    // Update previews and displays
    updateColorPreviews();
    updateRangeValues();
    updateHintPreview();
}

function collectSettingsFromUI() {
    const settings = {};
    
    // Collect all form values
    const inputs = document.querySelectorAll('input, select');
    inputs.forEach(input => {
        if (input.id && input.id !== 'import-file') {
            const key = camelCase(input.id);
            if (input.type === 'checkbox') {
                settings[key] = input.checked;
            } else if (input.type === 'range' || input.type === 'number') {
                settings[key] = parseFloat(input.value);
            } else {
                settings[key] = input.value;
            }
        }
    });
    
    return settings;
}

function saveSettings() {
    currentSettings = collectSettingsFromUI();
    
    if (typeof chrome !== 'undefined' && chrome.storage) {
        chrome.storage.sync.set(currentSettings, function() {
            showNotification(currentLanguage === 'zh' ? '设置已保存' : 'Settings saved', 'success');
            originalSettings = JSON.parse(JSON.stringify(currentSettings));
        });
    } else {
        showNotification(currentLanguage === 'zh' ? '设置已保存（演示模式）' : 'Settings saved (demo mode)', 'success');
        originalSettings = JSON.parse(JSON.stringify(currentSettings));
    }
    
    // Apply settings to extension
    applySettingsToExtension();
}

function applySettings() {
    currentSettings = collectSettingsFromUI();
    applySettingsToExtension();
    showNotification(currentLanguage === 'zh' ? '设置已应用' : 'Settings applied', 'info');
}

function cancelSettings() {
    currentSettings = JSON.parse(JSON.stringify(originalSettings));
    applySettingsToUI();
    showNotification(currentLanguage === 'zh' ? '已取消更改' : 'Changes cancelled', 'info');
}

function applySettingsToExtension() {
    // Generate CSS for hint styling
    const hintCSS = `
        .rVim-link-hint {
            background-color: ${currentSettings.hintBgColor} !important;
            border-color: ${currentSettings.hintBorderColor} !important;
            color: ${currentSettings.hintTextColor} !important;
            font-size: ${currentSettings.hintFontSize}px !important;
            border-radius: ${currentSettings.hintBorderRadius}px !important;
            opacity: ${currentSettings.hintOpacity} !important;
        }
        
        .rVim-command-bar {
            background-color: ${currentSettings.cmdBgColor} !important;
            color: ${currentSettings.cmdTextColor} !important;
            font-family: ${currentSettings.cmdFontFamily} !important;
            font-size: ${currentSettings.cmdFontSize}px !important;
        }
    `;
    
    // Send message to content scripts to update styles
    if (typeof chrome !== 'undefined' && chrome.tabs) {
        chrome.tabs.query({}, function(tabs) {
            tabs.forEach(tab => {
                if (tab.url && !tab.url.startsWith('chrome://') && !tab.url.startsWith('chrome-extension://')) {
                    chrome.tabs.sendMessage(tab.id, {
                        action: 'updateStyles',
                        css: hintCSS,
                        settings: currentSettings
                    }, function(response) {
                        // Handle response or errors silently
                        if (chrome.runtime.lastError) {
                            // Ignore errors for tabs that can't receive messages
                        }
                    });
                }
            });
        });
    }
    
    // Also update the main CSS file for future page loads
    updateMainCSS(hintCSS);
}

function updateMainCSS(additionalCSS) {
    // This function would ideally update the main.css file
    // For now, we'll store the custom styles in chrome.storage
    if (typeof chrome !== 'undefined' && chrome.storage) {
        chrome.storage.local.set({
            'customCSS': additionalCSS
        });
    }
}

// Import/Export functions
function exportSettings() {
    const settings = collectSettingsFromUI();
    const dataStr = JSON.stringify(settings, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = 'rvim-settings.json';
    link.click();
    
    showNotification(currentLanguage === 'zh' ? '设置已导出' : 'Settings exported', 'success');
}

function importSettings(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const settings = JSON.parse(e.target.result);
            currentSettings = {...getDefaultSettings(), ...settings};
            applySettingsToUI();
            showNotification(currentLanguage === 'zh' ? '设置已导入' : 'Settings imported', 'success');
        } catch (error) {
            showNotification(currentLanguage === 'zh' ? '导入失败：无效的文件格式' : 'Import failed: Invalid file format', 'error');
        }
    };
    reader.readAsText(file);
}

function resetAllSettings() {
    const message = currentLanguage === 'zh' 
        ? '确定要重置所有设置到默认值吗？此操作无法撤销。'
        : 'Are you sure you want to reset all settings to default values? This action cannot be undone.';
    
    if (confirm(message)) {
        currentSettings = getDefaultSettings();
        applySettingsToUI();
        showNotification(currentLanguage === 'zh' ? '设置已重置' : 'Settings reset', 'info');
    }
}

// Utility functions
function kebabCase(str) {
    return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
}

function camelCase(str) {
    return str.replace(/-([a-z])/g, function(g) { return g[1].toUpperCase(); });
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Style the notification
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '12px 24px',
        borderRadius: '6px',
        color: 'white',
        fontWeight: '500',
        zIndex: '10000',
        transform: 'translateX(100%)',
        transition: 'transform 0.3s ease',
        backgroundColor: type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#17a2b8'
    });
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Version info
function setVersionInfo() {
    const versionElement = document.getElementById('version-info');
    if (versionElement) {
        if (typeof chrome !== 'undefined' && chrome.runtime) {
            const manifest = chrome.runtime.getManifest();
            versionElement.textContent = manifest.version;
        } else {
            versionElement.textContent = '1.0.0';
        }
    }
}

// Call setVersionInfo after DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(setVersionInfo, 100);
});