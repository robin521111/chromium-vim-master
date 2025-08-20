// Chrome扩展自动化测试脚本
// 在Chrome控制台中运行此脚本来测试rVim扩展功能

const testResults = {
  extensionLoaded: false,
  iconVisible: false,
  popupAccessible: false,
  optionsPageAccessible: false,
  serviceWorkerActive: false,
  contentScriptsInjected: false,
  vimKeysWorking: false,
  errors: []
};

// 测试1: 检查扩展是否已加载
function testExtensionLoaded() {
  return new Promise((resolve) => {
    chrome.management.getAll((extensions) => {
      const rVimExtension = extensions.find(ext => ext.name === 'rVim');
      testResults.extensionLoaded = !!rVimExtension && rVimExtension.enabled;
      if (rVimExtension) {
        console.log('✅ rVim扩展已加载并启用');
        console.log('扩展ID:', rVimExtension.id);
        console.log('版本:', rVimExtension.version);
      } else {
        console.log('❌ rVim扩展未找到或未启用');
        testResults.errors.push('扩展未加载或未启用');
      }
      resolve();
    });
  });
}

// 测试2: 检查Service Worker状态
function testServiceWorker() {
  return new Promise((resolve) => {
    chrome.management.getAll((extensions) => {
      const rVimExtension = extensions.find(ext => ext.name === 'rVim');
      if (rVimExtension) {
        // 检查Service Worker是否活跃
        chrome.runtime.sendMessage(rVimExtension.id, {action: 'ping'}, (response) => {
          if (chrome.runtime.lastError) {
            console.log('⚠️ Service Worker可能未运行:', chrome.runtime.lastError.message);
            testResults.errors.push('Service Worker通信失败');
          } else {
            console.log('✅ Service Worker正在运行');
            testResults.serviceWorkerActive = true;
          }
          resolve();
        });
      } else {
        resolve();
      }
    });
  });
}

// 测试3: 检查内容脚本注入
function testContentScripts() {
  return new Promise((resolve) => {
    // 检查当前页面是否注入了rVim的内容脚本
    const hasrVimElements = document.querySelector('.rVim-hud') || 
                           document.querySelector('#rVim-command-line') ||
                           window.rVim !== undefined;
    
    if (hasrVimElements || window.rVim) {
      console.log('✅ 内容脚本已成功注入');
      testResults.contentScriptsInjected = true;
    } else {
      console.log('⚠️ 内容脚本可能未注入或页面需要刷新');
      testResults.errors.push('内容脚本未检测到');
    }
    resolve();
  });
}

// 测试4: 模拟键盘事件测试Vim功能
function testVimKeys() {
  return new Promise((resolve) => {
    console.log('🧪 测试Vim键盘功能...');
    
    // 模拟按下 'j' 键（向下滚动）
    const originalScrollY = window.scrollY;
    
    const keyEvent = new KeyboardEvent('keydown', {
      key: 'j',
      code: 'KeyJ',
      keyCode: 74,
      which: 74,
      bubbles: true,
      cancelable: true
    });
    
    document.dispatchEvent(keyEvent);
    
    // 等待一小段时间检查滚动是否发生
    setTimeout(() => {
      if (window.scrollY !== originalScrollY || window.rVim) {
        console.log('✅ Vim键盘功能响应正常');
        testResults.vimKeysWorking = true;
      } else {
        console.log('⚠️ Vim键盘功能可能未激活');
        testResults.errors.push('Vim键盘功能未响应');
      }
      resolve();
    }, 500);
  });
}

// 运行所有测试
async function runAllTests() {
  console.log('🚀 开始rVim扩展自动化测试...');
  console.log('='.repeat(50));
  
  await testExtensionLoaded();
  await testServiceWorker();
  await testContentScripts();
  await testVimKeys();
  
  console.log('='.repeat(50));
  console.log('📊 测试结果汇总:');
  console.log('扩展已加载:', testResults.extensionLoaded ? '✅' : '❌');
  console.log('Service Worker活跃:', testResults.serviceWorkerActive ? '✅' : '❌');
  console.log('内容脚本注入:', testResults.contentScriptsInjected ? '✅' : '❌');
  console.log('Vim键盘功能:', testResults.vimKeysWorking ? '✅' : '❌');
  
  if (testResults.errors.length > 0) {
    console.log('\n⚠️ 发现的问题:');
    testResults.errors.forEach((error, index) => {
      console.log(`${index + 1}. ${error}`);
    });
  }
  
  const passedTests = Object.values(testResults).filter(v => v === true).length;
  const totalTests = 4;
  console.log(`\n🎯 测试通过率: ${passedTests}/${totalTests} (${Math.round(passedTests/totalTests*100)}%)`);
  
  return testResults;
}

// 导出测试函数
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { runAllTests, testResults };
} else {
  // 在浏览器环境中自动运行
  window.rVimTestResults = testResults;
  window.runrVimTests = runAllTests;
  console.log('💡 在控制台中运行 runrVimTests() 开始测试');
}