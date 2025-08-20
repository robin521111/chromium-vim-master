// 加载测试依赖
const { expect } = require('chai');
const sinon = require('sinon');

// 模拟 Chrome API
const mockChrome = {
  tabs: {
    create: sinon.stub(),
    update: sinon.stub(),
    query: sinon.stub(),
    remove: sinon.stub(),
    move: sinon.stub(),
    reload: sinon.stub(),
    duplicate: sinon.stub(),
    sendMessage: sinon.stub()
  },
  windows: {
    create: sinon.stub()
  },
  scripting: {
    executeScript: sinon.stub(),
    insertCSS: sinon.stub()
  },
  storage: {
    local: {
      get: sinon.stub(),
      set: sinon.stub()
    }
  },
  downloads: {
    setShelfEnabled: sinon.stub()
  },
  bookmarks: {
    create: sinon.stub(),
    remove: sinon.stub()
  },
  runtime: {
    lastError: null
  }
};

// 模拟全局变量
global.chrome = mockChrome;
global.activePorts = [];
global.Frames = {
  add: sinon.stub()
};

// 确保chrome对象在window中也可用
if (typeof global.window === 'undefined') {
  global.window = {};
}
global.window.chrome = mockChrome;

// 模拟 Object.clone 函数
global.Object.clone = function(obj) {
  return JSON.parse(JSON.stringify(obj));
};

// 模拟 getTabOrderIndex 函数
global.getTabOrderIndex = function(tab) {
  return tab.index + 1;
};

// 读取并执行 actions.js
const fs = require('fs');
const path = require('path');

// 确保全局对象存在
if (typeof global.document === 'undefined') {
  global.document = {};
}

const actionsCode = fs.readFileSync(
  path.join(__dirname, '../../background_scripts/actions.js'),
  'utf8'
);

// 在正确的上下文中执行actions.js
(function() {
  const chrome = global.chrome;
  const Frames = global.Frames;
  const getTabOrderIndex = global.getTabOrderIndex;
  // 确保activePorts在全局作用域中可访问
  global.activePorts = global.activePorts || [];
  eval(actionsCode);
})();

describe('Actions 后台脚本功能', () => {
  beforeEach(() => {
    // 重置所有 stub
    Object.values(mockChrome.tabs).forEach(stub => stub.resetHistory());
    Object.values(mockChrome.windows).forEach(stub => stub.resetHistory());
    Object.values(mockChrome.scripting).forEach(stub => stub.resetHistory());
    Object.values(mockChrome.storage.local).forEach(stub => stub.resetHistory());
    Object.values(mockChrome.downloads).forEach(stub => stub.resetHistory());
    Object.values(mockChrome.bookmarks).forEach(stub => stub.resetHistory());
    global.Frames.add.resetHistory();
    global.activePorts = [];
    mockChrome.runtime.lastError = null;
  });

  describe('updateLastCommand', () => {
    it('应该更新最后执行的命令', () => {
      const mockPort = {
        postMessage: sinon.stub()
      };
      global.activePorts = [mockPort];
      
      const request = {
        request: {
          data: 'testCommand'
        }
      };
      
      Actions.updateLastCommand(request);
      
      expect(mockPort.postMessage.calledOnce).to.be.true;
      expect(mockPort.postMessage.firstCall.args[0]).to.deep.equal({
        type: 'updateLastCommand',
        data: 'testCommand'
      });
    });

    it('应该处理空的命令数据', () => {
      const mockPort = {
        postMessage: sinon.stub()
      };
      global.activePorts = [mockPort];
      
      const request = {
        request: {
          data: null
        }
      };
      
      Actions.updateLastCommand(request);
      
      expect(mockPort.postMessage.called).to.be.false;
    });

    it('应该向所有活动端口发送消息', () => {
      const mockPort1 = { postMessage: sinon.stub() };
      const mockPort2 = { postMessage: sinon.stub() };
      global.activePorts = [mockPort1, mockPort2];
      
      const request = {
        request: {
          data: 'testCommand'
        }
      };
      
      Actions.updateLastCommand(request);
      
      expect(mockPort1.postMessage.calledOnce).to.be.true;
      expect(mockPort2.postMessage.calledOnce).to.be.true;
    });
  });

  describe('getRootUrl', () => {
    it('应该返回发送者标签页的 URL', () => {
      const callback = sinon.stub();
      const request = {
        sender: {
          tab: {
            url: 'https://example.com'
          }
        },
        callback: callback
      };
      
      Actions.getRootUrl(request);
      
      expect(callback.calledWith('https://example.com')).to.be.true;
    });
  });

  describe('viewSource', () => {
    it('应该打开页面源码', (done) => {
      const request = {
        sender: {
          tab: {
            url: 'https://example.com',
            index: 0
          }
        },
        request: {
          tab: {
            tabbed: true,
            active: true
          },
          repeats: 1
        }
      };
      
      Actions.viewSource(request);
      
      // 由于active为true，会有80ms延迟
      setTimeout(() => {
        expect(mockChrome.tabs.create.calledOnce).to.be.true;
        const createArgs = mockChrome.tabs.create.firstCall.args[0];
        expect(createArgs.url).to.equal('view-source:https://example.com');
        done();
      }, 100);
    });
  });

  describe('openLink', () => {
    it('应该在新窗口中打开链接', () => {
      const request = {
        url: 'https://example.com',
        sender: {
          tab: {
            index: 0
          }
        },
        request: {
          tab: {
            newWindow: true,
            active: true,
            incognito: false
          },
          repeats: 1
        }
      };
      
      Actions.openLink(request);
      
      expect(mockChrome.windows.create.calledOnce).to.be.true;
      const createArgs = mockChrome.windows.create.firstCall.args[0];
      expect(createArgs.url).to.equal('https://example.com');
      expect(createArgs.focused).to.be.true;
      expect(createArgs.incognito).to.be.false;
    });

    it('应该在新标签页中打开链接', (done) => {
      const request = {
        url: 'https://example.com',
        sender: {
          tab: {
            index: 0
          }
        },
        request: {
          tab: {
            tabbed: true,
            active: true,
            pinned: true
          },
          repeats: 1
        }
      };
      
      Actions.openLink(request);
      
      // 由于active为true，会有80ms延迟
      setTimeout(() => {
        expect(mockChrome.tabs.create.calledOnce).to.be.true;
        const createArgs = mockChrome.tabs.create.firstCall.args[0];
        expect(createArgs.url).to.equal('https://example.com');
        expect(createArgs.active).to.be.true;
        expect(createArgs.pinned).to.be.true;
        done();
      }, 100);
    });

    it('应该在当前标签页中打开链接', () => {
      const request = {
        url: 'https://example.com',
        sender: {
          tab: {
            index: 0,
            pinned: false
          }
        },
        request: {
          tab: {
            pinned: true
          },
          repeats: 1
        }
      };
      
      Actions.openLink(request);
      
      expect(mockChrome.tabs.update.calledOnce).to.be.true;
      const updateArgs = mockChrome.tabs.update.firstCall.args[0];
      expect(updateArgs.url).to.equal('https://example.com');
      expect(updateArgs.pinned).to.be.true;
    });

    it('应该处理多次重复', () => {
      const request = {
        url: 'https://example.com',
        sender: {
          tab: {
            index: 0
          }
        },
        request: {
          tab: {
            newWindow: true,
            active: true,
            incognito: false
          },
          repeats: 3
        }
      };
      
      Actions.openLink(request);
      
      expect(mockChrome.windows.create.callCount).to.equal(3);
    });
  });

  describe('openLinkTab', () => {
    it('应该在新标签页中打开链接（有发送者标签页）', (done) => {
      const request = {
        url: 'https://example.com',
        sender: {
          tab: {
            index: 0
          }
        },
        request: {
          active: true,
          pinned: false,
          repeats: 1
        }
      };
      
      Actions.openLinkTab(request);
      
      // 由于active为true，会有80ms延迟
      setTimeout(() => {
        expect(mockChrome.tabs.create.calledOnce).to.be.true;
        const createArgs = mockChrome.tabs.create.firstCall.args[0];
        expect(createArgs.url).to.equal('https://example.com');
        expect(createArgs.active).to.be.true;
        done();
      }, 100);
    });

    it('应该处理没有发送者标签页的情况', (done) => {
      const request = {
        url: 'https://example.com',
        sender: {},
        request: {
          active: true,
          pinned: false,
          repeats: 1
        }
      };
      
      // 模拟 chrome.tabs.query 回调
      mockChrome.tabs.query.callsArgWith(1, [{ index: 0 }]);
      
      Actions.openLinkTab(request);
      
      // 由于active为true，会有80ms延迟
      setTimeout(() => {
        expect(mockChrome.tabs.query.calledOnce).to.be.true;
        expect(mockChrome.tabs.create.calledOnce).to.be.true;
        done();
      }, 100);
    });
  });

  describe('addFrame', () => {
    it('应该添加框架到 Frames 管理器', () => {
      const request = {
        sender: {
          tab: {
            id: 123
          }
        },
        port: 'mockPort',
        request: {
          isCommandFrame: true
        }
      };
      
      Actions.addFrame(request);
      
      expect(global.Frames.add.calledOnce).to.be.true;
      expect(global.Frames.add.firstCall.args).to.deep.equal([
        123,
        'mockPort',
        true
      ]);
    });
  });

  describe('portCallback', () => {
    it('应该能添加和执行回调', () => {
      const callback = sinon.stub();
      const callbackId = Actions.portCallback.addCallback(callback);
      
      expect(callbackId).to.be.a('string');
      
      const request = {
        request: {
          id: callbackId,
          data: 'test'
        }
      };
      
      Actions.portCallback(request);
      
      expect(callback.calledOnce).to.be.true;
      expect(callback.firstCall.args[0]).to.deep.equal({
        id: callbackId,
        data: 'test'
      });
    });

    it('应该在执行后删除回调', () => {
      const callback = sinon.stub();
      const callbackId = Actions.portCallback.addCallback(callback);
      
      const request = {
        request: {
          id: callbackId,
          data: 'test'
        }
      };
      
      // 第一次调用
      Actions.portCallback(request);
      expect(callback.calledOnce).to.be.true;
      
      // 第二次调用应该不会执行回调
      callback.resetHistory();
      Actions.portCallback(request);
      expect(callback.called).to.be.false;
    });
  });

  describe('Quickmarks', () => {
    it('应该初始化为空对象', () => {
      expect(Quickmarks).to.be.an('object');
      expect(Object.keys(Quickmarks).length).to.equal(0);
    });
  });
});