const { JSDOM } = require('jsdom');
const chai = require('chai');
const sinon = require('sinon');

// 设置全局变量
global.expect = chai.expect;
global.sinon = sinon;

// 模拟浏览器环境
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
  url: 'http://localhost',
  pretendToBeVisual: true,
  resources: 'usable'
});

global.window = dom.window;
global.document = dom.window.document;
global.navigator = dom.window.navigator;
global.HTMLElement = dom.window.HTMLElement;
global.Element = dom.window.Element;
global.Node = dom.window.Node;

// 模拟 Chrome 扩展 API
global.chrome = {
  runtime: {
    sendMessage: sinon.stub(),
    onMessage: {
      addListener: sinon.stub()
    },
    getURL: sinon.stub().returns('chrome-extension://test/')
  },
  tabs: {
    query: sinon.stub(),
    create: sinon.stub(),
    update: sinon.stub(),
    remove: sinon.stub()
  },
  storage: {
    local: {
      get: sinon.stub(),
      set: sinon.stub(),
      remove: sinon.stub()
    },
    sync: {
      get: sinon.stub(),
      set: sinon.stub(),
      remove: sinon.stub()
    }
  },
  bookmarks: {
    search: sinon.stub(),
    create: sinon.stub(),
    remove: sinon.stub()
  },
  history: {
    search: sinon.stub()
  }
};

// 模拟控制台
global.console = {
  log: sinon.stub(),
  error: sinon.stub(),
  warn: sinon.stub(),
  info: sinon.stub()
};

// 在每个测试前重置所有 stub
if (typeof beforeEach !== 'undefined') {
  beforeEach(() => {
    sinon.restore();
  });
}