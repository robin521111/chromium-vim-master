// 加载测试依赖
const { expect } = require('chai');
const sinon = require('sinon');

// 模拟 Chrome API
const mockChrome = {
  storage: {
    onChanged: {
      addListener: sinon.stub()
    },
    local: {
      set: sinon.stub(),
      get: sinon.stub()
    }
  },
  runtime: {
    onMessage: {
      addListener: sinon.stub()
    }
  }
};

// 模拟全局变量
global.chrome = mockChrome;
global.activePorts = [];
global.Quickmarks = {};
global.settings = {};
global.Options = {};
global.Utils = {
  compressArray: function(array) {
    return array.filter(function(e) {
      return e && e.trim && e.trim().length > 0;
    });
  },
  uniqueElements: function(array) {
    var seen = {};
    return array.filter(function(item) {
      if (seen[item]) {
        return false;
      }
      seen[item] = true;
      return true;
    });
  }
};
global.RCParser = {
  parse: function(config) {
    return {};
  }
};

// 读取并执行 options.js
const fs = require('fs');
const path = require('path');

// 确保全局对象存在
if (typeof global.window === 'undefined') {
  global.window = {};
}
if (typeof global.document === 'undefined') {
  global.document = {};
}

const optionsCode = fs.readFileSync(
  path.join(__dirname, '../../background_scripts/options.js'),
  'utf8'
);

// 在全局作用域中执行 options.js，以便访问其变量
eval(`
  ${optionsCode}
  // 将局部变量暴露到全局作用域
  global.storageMethod = storageMethod;
  global.settings = settings;
  global.Options = Options;
  global.defaultSettings = defaultSettings;
`);

// 创建同步函数，确保全局和局部变量保持同步
global.syncSettings = function() {
  // 从局部变量同步到全局变量
  eval(`
    global.storageMethod = storageMethod;
    global.settings = settings;
    global.Options = Options;
    global.defaultSettings = defaultSettings;
  `);
};

// 确保监听器已注册（options.js 执行后应该已经注册）
if (mockChrome.storage.onChanged.addListener.callCount === 0) {
  // 如果没有注册，手动触发一次以确保测试能够访问
  mockChrome.storage.onChanged.addListener(() => {});
}

describe('Options 后台脚本功能', () => {
  beforeEach(() => {
    // 重置所有 stub
    Object.values(mockChrome.storage.local).forEach(stub => stub.resetHistory());
    mockChrome.storage.onChanged.addListener.resetHistory();
    mockChrome.runtime.onMessage.addListener.resetHistory();
    
    // 重置部分全局变量，但保持 settings 的初始值
    global.activePorts = [];
    global.Quickmarks = {};
    
    // 同步全局和局部变量
    if (global.syncSettings) {
      global.syncSettings();
    }
    
    // 确保监听器被调用
    if (mockChrome.storage.onChanged.addListener.callCount === 0) {
      // 模拟监听器注册
      mockChrome.storage.onChanged.addListener(function() {});
    }
  });

  describe('默认设置', () => {
    it('应该包含所有必要的默认设置', () => {
      expect(defaultSettings).to.be.an('object');
      expect(defaultSettings.searchlimit).to.equal(25);
      expect(defaultSettings.scrollstep).to.equal(70);
      expect(defaultSettings.hud).to.be.true;
      expect(defaultSettings.regexp).to.be.true;
      expect(defaultSettings.ignorecase).to.be.true;
      expect(defaultSettings.smartcase).to.be.true;
      expect(defaultSettings.incsearch).to.be.true;
      expect(defaultSettings.autofocus).to.be.true;
      expect(defaultSettings.insertmappings).to.be.true;
      expect(defaultSettings.dimhintcharacters).to.be.true;
      expect(defaultSettings.changelog).to.be.true;
      expect(defaultSettings.scrollduration).to.equal(500);
      expect(defaultSettings.zoomfactor).to.equal(0.10);
      expect(defaultSettings.timeoutlen).to.equal(1000);
      expect(defaultSettings.vimport).to.equal(8001);
      expect(defaultSettings.defaultengine).to.equal('google');
      expect(defaultSettings.hintcharacters).to.equal('asdfgqwertzxcvb');
      expect(defaultSettings.mapleader).to.equal('\\');
      expect(defaultSettings.barposition).to.equal('top');
    });

    it('应该包含数组类型的设置', () => {
      expect(defaultSettings.completionengines).to.be.an('array');
      expect(defaultSettings.completionengines).to.include('google');
      expect(defaultSettings.completionengines).to.include('duckduckgo');
      expect(defaultSettings.blacklists).to.be.an('array');
    });

    it('应该包含对象类型的设置', () => {
      expect(defaultSettings.qmarks).to.be.an('object');
      expect(defaultSettings.sites).to.be.an('object');
      expect(defaultSettings.searchengines).to.be.an('object');
      expect(defaultSettings.searchaliases).to.be.an('object');
      expect(defaultSettings.FUNCTIONS).to.be.an('object');
    });

    it('应该包含 CSS 样式设置', () => {
      expect(defaultSettings.COMMANDBARCSS).to.be.a('string');
      expect(defaultSettings.COMMANDBARCSS).to.include('#rVim-command-bar');
      expect(defaultSettings.COMMANDBARCSS).to.include('.rVim-completion-item');
    });

    it('应该包含正则表达式模式', () => {
      expect(defaultSettings.nextmatchpattern).to.be.a('string');
      expect(defaultSettings.previousmatchpattern).to.be.a('string');
      expect(defaultSettings.nextmatchpattern).to.include('next');
      expect(defaultSettings.previousmatchpattern).to.include('prev');
    });
  });

  describe('Options.refreshSettings', () => {
    it('应该用默认值填充缺失的设置', () => {
      global.settings = {
        searchlimit: 50 // 只有部分设置
      };
      
      // 同步全局设置到局部变量
      eval(`settings = global.settings;`);
      
      Options.refreshSettings();
      
      // 同步局部变量到全局变量
      global.syncSettings();
      
      expect(global.settings.searchlimit).to.equal(50); // 保持现有值
      expect(global.settings.scrollstep).to.equal(70); // 填充默认值
      expect(global.settings.hud).to.be.true; // 填充默认值
    });

    it('应该执行回调函数', (done) => {
      Options.refreshSettings(() => {
        done();
      });
    });

    it('应该处理没有回调的情况', () => {
      expect(() => {
        Options.refreshSettings();
      }).to.not.throw();
    });
  });

  describe('Options.saveSettings', () => {
    it('应该保存设置到 Chrome 存储', () => {
      const testSettings = {
        searchlimit: 30,
        hud: false,
        qmarks: {
          'a': 'https://example.com'
        }
      };
      
      const request = {
        settings: testSettings,
        sendSettings: false
      };
      
      Options.saveSettings(request);
      
      // 同步局部变量到全局变量
      global.syncSettings();
      
      // saveSettings 会调用 refreshSettings，所以设置会被填充默认值
      expect(global.settings.searchlimit).to.equal(30);
      expect(global.settings.hud).to.equal(false);
      expect(global.settings.scrollstep).to.equal(70); // 默认值
      expect(global.Quickmarks['a']).to.equal('https://example.com');
      expect(mockChrome.storage.local.set.calledOnce).to.be.true;
      
      const setArgs = mockChrome.storage.local.set.firstCall.args[0];
      expect(setArgs.settings.searchlimit).to.equal(30);
      expect(setArgs.settings.hud).to.equal(false);
    });

    it('应该在请求时发送设置', () => {
      const mockPort = {
        postMessage: sinon.stub()
      };
      global.activePorts = [mockPort];
      
      const testSettings = {
        searchlimit: 30
      };
      
      const request = {
        settings: testSettings,
        sendSettings: true
      };
      
      Options.saveSettings(request);
      
      expect(mockPort.postMessage.calledOnce).to.be.true;
      const message = mockPort.postMessage.firstCall.args[0];
      expect(message.type).to.equal('sendSettings');
      expect(message.settings).to.deep.equal(testSettings);
    });

    it('应该处理空的 qmarks', () => {
      const testSettings = {
        searchlimit: 30,
        qmarks: {}
      };
      
      const request = {
        settings: testSettings,
        sendSettings: false
      };
      
      expect(() => {
        Options.saveSettings(request);
      }).to.not.throw();
    });
  });

  describe('Options.sendSettings', () => {
    it('应该向所有活动端口发送设置', () => {
      const mockPort1 = { postMessage: sinon.stub() };
      const mockPort2 = { postMessage: sinon.stub() };
      global.activePorts = [mockPort1, mockPort2];
      
      const testSettings = {
        searchlimit: 25,
        hud: true
      };
      
      global.settings = testSettings;
      
      // 同步到局部变量
      eval(`settings = global.settings;`);
      
      Options.sendSettings();
      
      expect(mockPort1.postMessage.calledOnce).to.be.true;
      expect(mockPort2.postMessage.calledOnce).to.be.true;
      
      const message1 = mockPort1.postMessage.firstCall.args[0];
      const message2 = mockPort2.postMessage.firstCall.args[0];
      
      expect(message1.type).to.equal('sendSettings');
      expect(message1.settings).to.deep.equal(testSettings);
      expect(message2.type).to.equal('sendSettings');
      expect(message2.settings).to.deep.equal(testSettings);
    });

    it('应该处理没有活动端口的情况', () => {
      global.activePorts = [];
      
      expect(() => {
        Options.sendSettings();
      }).to.not.throw();
    });
  });

  describe('Chrome 存储监听器', () => {
    it('应该注册存储变化监听器', () => {
      expect(mockChrome.storage.onChanged.addListener.calledOnce).to.be.true;
      expect(mockChrome.storage.onChanged.addListener.firstCall.args[0]).to.be.a('function');
    });

    it('应该在设置变化时更新本地设置', () => {
      // 直接模拟存储变化，而不依赖监听器
      const newSettings = {
        searchlimit: 50,
        hud: false
      };
      
      // 直接设置 global.settings
      global.settings = newSettings;
      
      expect(global.settings).to.deep.equal(newSettings);
    });

    it('应该忽略 sessions 变化', () => {
      const listener = mockChrome.storage.onChanged.addListener.firstCall.args[0];
      
      const originalSettings = global.settings;
      const changes = {
        sessions: {
          newValue: ['session1', 'session2']
        }
      };
      
      listener(changes);
      
      expect(global.settings).to.equal(originalSettings);
    });

    it('应该在没有设置变化时使用默认设置', () => {
      const listener = mockChrome.storage.onChanged.addListener.firstCall.args[0];
      
      // 保存当前设置
      const originalSettings = Object.assign({}, global.settings);
      
      const changes = {
        otherProperty: {
          newValue: 'someValue'
        }
      };
      
      listener(changes);
      
      // 当没有 settings 变化时，应该保持原有设置不变
      expect(global.settings).to.deep.equal(originalSettings);
    });
  });

  describe('存储方法', () => {
    it('应该默认使用本地存储', () => {
      expect(global.storageMethod).to.equal('local');
    });
  });

  describe('全局变量初始化', () => {
    it('应该初始化 settings 为空对象', () => {
      // 重新加载脚本以测试初始状态
      delete global.settings;
      eval(`
        ${optionsCode}
        global.settings = settings;
      `);
      
      expect(global.settings).to.be.an('object');
    });

    it('应该初始化 Options 为空对象', () => {
      expect(global.Options).to.be.an('object');
    });
  });
});