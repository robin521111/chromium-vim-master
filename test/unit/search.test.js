// 加载测试依赖
const { expect } = require('chai');
const sinon = require('sinon');

// 模拟依赖
const fs = require('fs');
const path = require('path');

// 模拟全局变量
global.settings = {
  searchlimit: 10
};

global.Command = {
  dataElements: [],
  input: { value: '' },
  typed: '',
  complete: sinon.stub(),
  completionResults: []
};

// 创建模拟 DOM 元素的辅助函数
function createMockElement() {
  return {
    setAttribute: sinon.stub(),
    getAttribute: sinon.stub(),
    removeAttribute: sinon.stub(),
    classList: {
      add: sinon.stub(),
      remove: sinon.stub(),
      contains: sinon.stub()
    }
  };
}

// 模拟 searchArray 函数
global.searchArray = function(options) {
  const { array, search, limit } = options;
  const searchLimit = typeof limit === 'number' ? limit : (global.settings.searchlimit || 10);
  return array
    .filter(item => item.toLowerCase().includes(search.toLowerCase()))
    .slice(0, searchLimit)
    .map(item => [item]);
};

// 读取并执行 search.js
// 确保全局对象存在
if (typeof global.window === 'undefined') {
  global.window = {};
}
if (typeof global.document === 'undefined') {
  global.document = {};
}

// 确保 settings 在全局作用域中可用
global.settings = global.settings || { searchlimit: 10 };

const searchCode = fs.readFileSync(
  path.join(__dirname, '../../content_scripts/search.js'),
  'utf8'
);

eval(searchCode);

describe('Search 搜索功能', () => {
  beforeEach(() => {
    Search.index = null;
    Command.dataElements = [];
    Command.input.value = '';
    Command.typed = '';
    Command.complete.resetHistory();
  });

  describe('chromeMatch', () => {
    it('应该搜索 Chrome URL', (done) => {
      Search.chromeMatch('settings', (results) => {
        expect(results).to.be.an('array');
        expect(results.length).to.be.greaterThan(0);
        expect(results[0][0]).to.include('settings');
        done();
      });
    });

    it('应该限制搜索结果数量', (done) => {
      Search.chromeMatch('', (results) => {
        expect(results.length).to.be.at.most(settings.searchlimit);
        done();
      });
    });

    it('应该处理不匹配的搜索', (done) => {
      Search.chromeMatch('nonexistent', (results) => {
        expect(results).to.be.an('array');
        expect(results.length).to.equal(0);
        done();
      });
    });
  });

  describe('settingsMatch', () => {
    beforeEach(() => {
      Search.settings = ['smoothscroll', 'autofocus', 'hud', 'typelinkhints'];
    });

    it('应该搜索设置项', (done) => {
      Search.settingsMatch('scroll', (results) => {
        expect(results).to.be.an('array');
        expect(results.length).to.be.greaterThan(0);
        expect(results[0][0]).to.include('scroll');
        done();
      });
    });

    it('应该处理 no 前缀', (done) => {
      Search.settingsMatch('noscroll', (results) => {
        expect(results).to.be.an('array');
        expect(results.length).to.be.greaterThan(0);
        expect(results[0][0]).to.include('scroll');
        done();
      });
    });
  });

  describe('nextResult', () => {
    it('应该在没有数据元素时调用 complete', () => {
      Command.dataElements = [];
      Command.input.value = '';
      
      const result = Search.nextResult();
      expect(Command.complete.calledWith('')).to.be.true;
    });

    it('应该在没有数据元素但有输入时返回 false', () => {
      Command.dataElements = [];
      Command.input.value = 'test';
      
      const result = Search.nextResult();
      expect(result).to.be.false;
    });

    it('应该正确设置第一个索引', () => {
      Command.dataElements = [
        createMockElement(),
        createMockElement(),
        createMockElement()
      ];
      Command.completionResults = [
        ['chrome', 'settings'],
        ['chrome', 'bookmarks'],
        ['chrome', 'history']
      ];
      Command.input.value = 'open ';
      
      Search.nextResult();
      expect(Search.index).to.equal(0);
    });

    it('应该在反向搜索时设置最后一个索引', () => {
      Command.dataElements = [
        createMockElement(),
        createMockElement(),
        createMockElement()
      ];
      Command.completionResults = [
        ['chrome', 'settings'],
        ['chrome', 'bookmarks'],
        ['chrome', 'history']
      ];
      Command.input.value = 'open ';
      
      Search.nextResult(true);
      expect(Search.index).to.equal(2);
    });

    it('应该正确递增索引', () => {
      Command.dataElements = [createMockElement(), createMockElement()];
      Command.completionResults = [
        ['chrome', 'settings'],
        ['chrome', 'bookmarks']
      ];
      Command.input.value = 'open ';
      Search.index = 0;
      
      Search.nextResult();
      expect(Search.index).to.equal(1);
      expect(Command.dataElements[0].removeAttribute.calledWith('active')).to.be.true;
      expect(Command.dataElements[1].setAttribute.calledWith('active', '')).to.be.true;
    });

    it('应该在到达末尾时重置索引', () => {
      Command.dataElements = [
        { removeAttribute: sinon.stub() },
        { removeAttribute: sinon.stub() }
      ];
      Search.index = 1;
      Command.typed = 'test';
      
      Search.nextResult();
      expect(Search.index).to.be.null;
      expect(Command.input.value).to.equal('test');
    });

    it('应该在反向搜索时正确递减索引', () => {
      Command.dataElements = [createMockElement(), createMockElement()];
      Command.completionResults = [
        ['chrome', 'settings'],
        ['chrome', 'bookmarks']
      ];
      Command.input.value = 'open ';
      Search.index = 1;
      
      Search.nextResult(true);
      expect(Search.index).to.equal(0);
      expect(Command.dataElements[1].removeAttribute.calledWith('active')).to.be.true;
      expect(Command.dataElements[0].setAttribute.calledWith('active', '')).to.be.true;
    });

    it('应该在反向搜索到达开头时重置索引', () => {
      Command.dataElements = [
        { removeAttribute: sinon.stub() },
        { removeAttribute: sinon.stub() }
      ];
      Search.index = 0;
      Command.typed = 'test';
      
      Search.nextResult(true);
      expect(Search.index).to.be.null;
      expect(Command.input.value).to.equal('test');
    });
  });

  describe('Chrome URLs 列表', () => {
    it('应该包含常用的 Chrome URL', () => {
      expect(Search.chromeUrls).to.include('settings');
      expect(Search.chromeUrls).to.include('extensions');
      expect(Search.chromeUrls).to.include('bookmarks');
      expect(Search.chromeUrls).to.include('history');
      expect(Search.chromeUrls).to.include('downloads');
    });

    it('应该是一个数组', () => {
      expect(Search.chromeUrls).to.be.an('array');
      expect(Search.chromeUrls.length).to.be.greaterThan(0);
    });

    it('所有 URL 应该是字符串', () => {
      Search.chromeUrls.forEach(url => {
        expect(url).to.be.a('string');
        expect(url.length).to.be.greaterThan(0);
      });
    });
  });

  describe('初始状态', () => {
    it('应该有正确的初始值', () => {
      expect(Search.index).to.be.null;
      expect(Search.topSites).to.be.an('array');
      expect(Search.topSites.length).to.equal(0);
    });
  });
});