// rVim扩展初始化修复脚本
// 这个脚本修复了扩展初始化时设置加载的问题

console.log('rVim初始化修复脚本开始执行...');

// 修复后的refreshSettings函数
function fixedRefreshSettings(callback) {
    console.log('开始修复设置加载...');
    
    // 从chrome.storage加载设置
    chrome.storage.local.get('settings', function(result) {
        console.log('从storage加载的设置:', result);
        
        if (result.settings) {
            // 合并加载的设置和默认设置
            for (var key in result.settings) {
                if (typeof window.settings === 'object') {
                    window.settings[key] = result.settings[key];
                }
            }
            console.log('设置已合并:', window.settings);
        } else {
            console.log('未找到保存的设置，使用默认设置');
            // 如果没有保存的设置，使用默认设置
            if (typeof window.defaultSettings === 'object') {
                window.settings = Object.assign({}, window.defaultSettings);
            }
        }
        
        // 确保所有默认设置都存在
        if (typeof window.defaultSettings === 'object' && typeof window.settings === 'object') {
            for (var key in window.defaultSettings) {
                if (window.settings[key] === undefined) {
                    window.settings[key] = window.defaultSettings[key];
                }
            }
        }
        
        console.log('最终设置对象:', window.settings);
        
        if (callback) {
            callback();
        }
    });
}

// 修复后的扩展初始化函数
function forceExtensionInitialization() {
    console.log('强制初始化扩展...');
    
    try {
        // 1. 确保基本对象存在
        if (typeof window.settings === 'undefined') {
            window.settings = {
                hintcharacters: 'asdfghjklqwertyuiopzxcvbnm',
                numerichints: false,
                linkanimations: true,
                scalehints: true,
                hud: true,
                searchlimit: 25,
                scrollstep: 70
            };
            console.log('创建了基本settings对象');
        }
        
        // 2. 修复Options.refreshSettings
        if (typeof window.Options === 'object') {
            window.Options.refreshSettings = fixedRefreshSettings;
            console.log('已修复Options.refreshSettings函数');
        }
        
        // 3. 手动加载设置
        fixedRefreshSettings(function() {
            console.log('设置加载完成，开始初始化Command...');
            
            // 4. 初始化Command对象
            if (typeof window.Command === 'object' && typeof window.Command.init === 'function') {
                window.Command.init(true);
                console.log('Command.init(true)已调用');
            }
            
            // 5. 确保键盘监听器已添加
            if (typeof window.addListeners === 'function') {
                window.addListeners();
                console.log('键盘监听器已添加');
            }
            
            // 6. 设置扩展为已加载状态
            if (typeof window.Command === 'object') {
                window.Command.loaded = true;
                window.Command.initialLoadStarted = true;
                window.Command.domElementsLoaded = true;
                console.log('Command状态已设置为已加载');
            }
            
            console.log('扩展初始化修复完成！');
        });
        
    } catch (error) {
        console.error('扩展初始化修复失败:', error);
    }
}

// 修复messenger连接问题
function fixMessengerConnection() {
    console.log('修复messenger连接...');
    
    try {
        // 重新建立与后台脚本的连接
        if (typeof chrome !== 'undefined' && chrome.runtime) {
            var port = chrome.runtime.connect({name: 'rVim'});
            
            port.onMessage.addListener(function(response) {
                console.log('收到后台消息:', response);
                
                if (response.type === 'hello') {
                    console.log('与后台脚本连接成功');
                }
                
                if (response.type === 'sendSettings') {
                    console.log('收到设置:', response.settings);
                    if (response.settings) {
                        window.settings = response.settings;
                        console.log('设置已更新');
                    }
                }
            });
            
            port.onDisconnect.addListener(function() {
                console.log('与后台脚本连接断开');
            });
            
            // 保存端口引用
            window.port = port;
            
            // 创建RUNTIME函数
            window.RUNTIME = function(action, data, callback) {
                console.log('RUNTIME调用:', action, data);
                
                if (action === 'getSettings') {
                    chrome.runtime.sendMessage({action: 'getSettings'}, function(response) {
                        console.log('getSettings响应:', response);
                        if (callback && response && response.settings) {
                            callback(response.settings);
                        }
                    });
                } else if (action === 'getActiveState') {
                    chrome.runtime.sendMessage({action: 'getActiveState'}, function(response) {
                        console.log('getActiveState响应:', response);
                        if (callback) {
                            callback(response !== false);
                        }
                    });
                } else {
                    chrome.runtime.sendMessage({action: action, data: data}, callback);
                }
            };
            
            console.log('RUNTIME函数已创建');
            
        } else {
            console.error('Chrome扩展API不可用');
        }
        
    } catch (error) {
        console.error('修复messenger连接失败:', error);
    }
}

// 主修复函数
function runExtensionFix() {
    console.log('=== rVim扩展修复开始 ===');
    
    // 等待DOM加载完成
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(function() {
                fixMessengerConnection();
                setTimeout(forceExtensionInitialization, 500);
            }, 100);
        });
    } else {
        setTimeout(function() {
            fixMessengerConnection();
            setTimeout(forceExtensionInitialization, 500);
        }, 100);
    }
}

// 导出修复函数供外部调用
window.runExtensionFix = runExtensionFix;
window.forceExtensionInitialization = forceExtensionInitialization;
window.fixMessengerConnection = fixMessengerConnection;

// 自动运行修复
runExtensionFix();

console.log('rVim扩展修复脚本已加载');