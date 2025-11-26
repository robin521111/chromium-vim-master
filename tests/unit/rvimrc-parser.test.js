const fs = require('fs');
const path = require('path');
const { expect } = require('chai');

// 加载解析器
const RCParser = require('../../rvimrc_parser/rvimrc_parser.js').RCParser;

describe('rVimrc Parser', () => {
  describe('基本解析功能', () => {
    it('应该能解析空配置', () => {
      const result = RCParser.parse('');
      expect(result).to.be.an('object');
    });

    it('应该能解析注释', () => {
      const config = '" This is a comment\nset smoothscroll';
      const result = RCParser.parse(config);
      expect(result.smoothscroll).to.be.true;
    });

    it('应该能解析 set 命令', () => {
      const config = 'set smoothscroll\nset nosmoothscroll';
      const result = RCParser.parse(config);
      expect(result.smoothscroll).to.be.false;
    });

    it('应该能解析 let 变量', () => {
      const config = 'let scrollduration = 500\nlet homedirectory = "/home/user"';
      const result = RCParser.parse(config);
      expect(result.scrollduration).to.equal(500);
      expect(result.homedirectory).to.equal('/home/user');
    });

    it('应该能解析数组变量', () => {
      const config = 'let completionengines = ["google", "wikipedia", "duckduckgo"]';
      const result = RCParser.parse(config);
      expect(result.completionengines).to.deep.equal(['google', 'wikipedia', 'duckduckgo']);
    });

    it('应该能解析嵌套数组', () => {
      const config = 'let array = [1, [2, 3], 4]';
      const result = RCParser.parse(config);
      expect(result.array).to.deep.equal([1, [2, 3], 4]);
    });
  });

  describe('映射解析', () => {
    it('应该能解析基本映射', () => {
      const config = 'map j scrollDown\nmap k scrollUp';
      const result = RCParser.parse(config);
      expect(result.MAPPINGS).to.include('map j scrollDown');
      expect(result.MAPPINGS).to.include('map k scrollUp');
    });

    it('应该能解析插入模式映射', () => {
      const config = 'imap <C-o> editWithVim';
      const result = RCParser.parse(config);
      expect(result.MAPPINGS).to.include('imap <C-o> editWithVim');
    });

    it('应该能解析复杂按键组合', () => {
      const config = 'map <C-A-j> nextTab\nmap <S-Space> previousTab';
      const result = RCParser.parse(config);
      expect(result.MAPPINGS).to.include('map <C-A-j> nextTab');
      expect(result.MAPPINGS).to.include('map <S-Space> previousTab');
    });

    it('应该能解析 unmap 命令', () => {
      const config = 'unmap j k h l';
      const result = RCParser.parse(config);
      expect(result.MAPPINGS).to.include('unmap j k h l');
    });
  });

  describe('QuickMark 解析', () => {
    it('应该能解析单个 QuickMark', () => {
      const config = 'let qmark a = "http://google.com"';
      const result = RCParser.parse(config);
      expect(result.qmarks).to.have.property('a');
      expect(result.qmarks.a).to.equal('http://google.com');
    });

    it('应该能解析 QuickMark 数组', () => {
      const config = 'let qmark b = ["http://reddit.com", "http://github.com"]';
      const result = RCParser.parse(config);
      expect(result.qmarks).to.have.property('b');
      expect(result.qmarks.b).to.deep.equal(['http://reddit.com', 'http://github.com']);
    });
  });

  describe('站点特定配置', () => {
    it('应该能解析站点配置', () => {
      const config = 'site "*://github.com/*" {\n  map j scrollDown\n}';
      const result = RCParser.parse(config);
      expect(result.sites).to.have.property('*://github.com/*');
      expect(result.sites['*://github.com/*'].MAPPINGS).to.include('map j scrollDown');
    });

    it('应该能解析多个站点配置', () => {
      const config = `
        site "*://github.com/*" {
          map j scrollDown
        }
        site "*://reddit.com/*" {
          map k scrollUp
        }
      `;
      const result = RCParser.parse(config);
      expect(result.sites).to.have.property('*://github.com/*');
      expect(result.sites).to.have.property('*://reddit.com/*');
    });
  });

  describe('函数和命令', () => {
    it('应该能解析自定义函数', () => {
      const config = 'myFunc(x) -> {{\n  console.log(x);\n}}';
      const result = RCParser.parse(config);
      expect(result.FUNCTIONS).to.have.property('myFunc');
    });

    it('应该能解析自定义命令', () => {
      const config = 'command refresh open @%';
      const result = RCParser.parse(config);
      expect(result.COMMANDS).to.have.property('refresh');
      expect(result.COMMANDS.refresh).to.equal('open @%');
    });
  });

  describe('黑名单', () => {
    it('应该能解析黑名单', () => {
      const config = 'let blacklists = ["http://localhost/*", "https://mail.google.com/*"]';
      const result = RCParser.parse(config);
      expect(result.blacklists).to.deep.equal(['http://localhost/*', 'https://mail.google.com/*']);
    });
  });

  describe('错误处理', () => {
    it('应该处理语法错误', () => {
      const config = 'invalid syntax here';
      expect(() => RCParser.parse(config)).to.throw();
    });

    it('应该处理不完整的配置', () => {
      const config = 'let incomplete =';
      expect(() => RCParser.parse(config)).to.throw();
    });
  });

  describe('实际配置文件测试', () => {
    it('应该能解析测试配置文件', () => {
      const testConfig = fs.readFileSync(
        path.join(__dirname, './rvimrc-parser.test.vim'),
        'utf8'
      );
      const result = RCParser.parse(testConfig);
      
      // 验证关键配置项
      expect(result.smoothscroll).to.be.false;
      expect(result.scrollduration).to.equal(250);
      expect(result.homedirectory).to.equal('/home/jake');
      expect(result.completionengines).to.include('google');
      expect(result.qmarks).to.have.property('a');
      expect(result.blacklists).to.include('http://localhost/*');
    });
  });
});