// 加载测试依赖
const { expect } = require('chai');
const sinon = require('sinon');

// 读取并执行 utils.js
const fs = require('fs');
const path = require('path');

// 确保全局对象存在
if (typeof global.window === 'undefined') {
  global.window = {};
}
if (typeof global.document === 'undefined') {
  global.document = {};
}

const utilsCode = fs.readFileSync(
  path.join(__dirname, '../../content_scripts/utils.js'),
  'utf8'
);

eval(utilsCode);

describe('Utils 工具函数', () => {
  describe('cacheFunction', () => {
    it('应该缓存函数结果', () => {
      let callCount = 0;
      const testFunc = Utils.cacheFunction((x) => {
        callCount++;
        return x * 2;
      });

      expect(testFunc(5)).to.equal(10);
      expect(testFunc(5)).to.equal(10);
      expect(callCount).to.equal(1); // 只调用一次
    });

    it('应该能清除缓存', () => {
      let callCount = 0;
      const testFunc = Utils.cacheFunction((x) => {
        callCount++;
        return x * 2;
      });

      testFunc(5);
      testFunc.clearCache();
      testFunc(5);
      expect(callCount).to.equal(2); // 清除缓存后重新调用
    });
  });

  describe('trueModulo', () => {
    it('应该正确处理正数取模', () => {
      expect(Utils.trueModulo(7, 3)).to.equal(1);
      expect(Utils.trueModulo(9, 4)).to.equal(1);
    });

    it('应该正确处理负数取模', () => {
      expect(Utils.trueModulo(-1, 3)).to.equal(2);
      expect(Utils.trueModulo(-5, 3)).to.equal(1);
    });

    it('应该处理零值', () => {
      expect(Utils.trueModulo(0, 5)).to.equal(0);
    });
  });

  describe('uniqueElements', () => {
    it('应该移除重复元素', () => {
      const input = [1, 2, 2, 3, 1, 4];
      const result = Utils.uniqueElements(input);
      expect(result).to.deep.equal([1, 2, 3, 4]);
    });

    it('应该处理空数组', () => {
      expect(Utils.uniqueElements([])).to.deep.equal([]);
    });

    it('应该处理字符串数组', () => {
      const input = ['a', 'b', 'a', 'c'];
      const result = Utils.uniqueElements(input);
      expect(result).to.deep.equal(['a', 'b', 'c']);
    });
  });

  describe('compressArray', () => {
    it('应该移除假值', () => {
      const input = [1, 0, 'hello', '', null, 'world', undefined, false];
      const result = Utils.compressArray(input);
      expect(result).to.deep.equal([1, 'hello', 'world']);
    });

    it('应该处理空数组', () => {
      expect(Utils.compressArray([])).to.deep.equal([]);
    });
  });

  describe('split', () => {
    it('应该分割字符串并移除空字符串', () => {
      const result = Utils.split('a,,b,c,', ',');
      expect(result).to.deep.equal(['a', 'b', 'c']);
    });

    it('应该处理连续分隔符', () => {
      const result = Utils.split('hello  world', ' ');
      expect(result).to.deep.equal(['hello', 'world']);
    });
  });

  describe('trim', () => {
    it('应该移除首尾空白字符', () => {
      expect(Utils.trim('  hello world  ')).to.equal('hello world');
      expect(Utils.trim('\t\nhello\t\n')).to.equal('hello');
    });

    it('应该处理只有空白字符的字符串', () => {
      expect(Utils.trim('   ')).to.equal('');
    });

    it('应该处理空字符串', () => {
      expect(Utils.trim('')).to.equal('');
    });
  });

  describe('format', () => {
    it('应该替换最后一个 %s', () => {
      expect(Utils.format('Hello %s world %s', 'beautiful'))
        .to.equal('Hello %s world beautiful');
    });

    it('应该在末尾添加值如果没有 %s', () => {
      expect(Utils.format('Hello world', ' test'))
        .to.equal('Hello world test');
    });

    it('应该处理空字符串', () => {
      expect(Utils.format('', 'test')).to.equal('test');
    });
  });

  describe('toSearchURL', () => {
    it('应该识别有效 URL 并添加协议', () => {
      const result = Utils.toSearchURL('google.com');
      expect(result).to.equal('http://google.com');
    });

    it('应该保持已有协议的 URL', () => {
      const result = Utils.toSearchURL('https://google.com');
      expect(result).to.equal('https://google.com');
    });

    it('应该为搜索查询生成搜索 URL', () => {
      const result = Utils.toSearchURL('test query');
      expect(result).to.include('https://www.google.com/search?q=');
      expect(result).to.include('test%20query');
    });

    it('应该使用自定义搜索引擎', () => {
      const result = Utils.toSearchURL('test', 'https://bing.com/search?q=%s');
      expect(result).to.equal('https://bing.com/search?q=test');
    });
  });

  describe('isValidURL', () => {
    it('应该识别有效的 HTTP URL', () => {
      expect(Utils.isValidURL('http://google.com')).to.be.true;
      expect(Utils.isValidURL('https://github.com/user/repo')).to.be.true;
    });

    it('应该识别有效的域名', () => {
      expect(Utils.isValidURL('google.com')).to.be.true;
      expect(Utils.isValidURL('subdomain.example.org')).to.be.true;
    });

    it('应该识别 IP 地址', () => {
      expect(Utils.isValidURL('192.168.1.1')).to.be.true;
      expect(Utils.isValidURL('http://127.0.0.1:8080')).to.be.true;
    });

    it('应该识别 localhost', () => {
      expect(Utils.isValidURL('localhost')).to.be.true;
      expect(Utils.isValidURL('http://localhost:3000')).to.be.true;
    });

    it('应该识别 Chrome 特殊 URL', () => {
      expect(Utils.isValidURL('chrome://settings')).to.be.true;
      expect(Utils.isValidURL('chrome-extension://abc123')).to.be.true;
    });

    it('应该识别文件 URL', () => {
      expect(Utils.isValidURL('file:///path/to/file')).to.be.true;
      expect(Utils.isValidURL('about:blank')).to.be.true;
    });

    it('应该拒绝无效 URL', () => {
      expect(Utils.isValidURL('not a url')).to.be.false;
      expect(Utils.isValidURL('space in url.com')).to.be.false;
      expect(Utils.isValidURL('')).to.be.false;
    });

    it('应该拒绝无效的 IP 地址', () => {
      expect(Utils.isValidURL('256.256.256.256')).to.be.false;
      expect(Utils.isValidURL('192.168.1')).to.be.false;
    });

    it('应该拒绝无效的域名', () => {
      expect(Utils.isValidURL('invalid.invalidtld')).to.be.false;
      expect(Utils.isValidURL('just-text')).to.be.false;
    });
  });
});

describe('Object.clone', () => {
  it('应该深度克隆对象', () => {
    const original = {
      a: 1,
      b: {
        c: 2,
        d: [3, 4]
      }
    };
    const cloned = Object.clone(original);
    
    expect(cloned).to.deep.equal(original);
    expect(cloned).to.not.equal(original);
    expect(cloned.b).to.not.equal(original.b);
    expect(cloned.b.d).to.not.equal(original.b.d);
  });

  it('应该深度克隆数组', () => {
    const original = [1, [2, 3], { a: 4 }];
    const cloned = Object.clone(original);
    
    expect(cloned).to.deep.equal(original);
    expect(cloned).to.not.equal(original);
    expect(cloned[1]).to.not.equal(original[1]);
    expect(cloned[2]).to.not.equal(original[2]);
  });

  it('应该处理原始类型', () => {
    expect(Object.clone(42)).to.equal(42);
    expect(Object.clone('hello')).to.equal('hello');
    expect(Object.clone(true)).to.equal(true);
    expect(Object.clone(null)).to.equal(null);
    expect(Object.clone(undefined)).to.equal(undefined);
  });
});