/**
 * 测试页面管理器
 * 用于自动化管理、组织和维护所有测试页面
 */

class TestPagesManager {
    constructor() {
        this.testPages = {
            // 核心功能测试
            core: [
                {
                    name: 'test_functionality.html',
                    title: '综合功能测试',
                    description: '测试所有核心Vim功能，包括导航、编辑、搜索等基本操作',
                    status: 'stable',
                    category: 'core',
                    priority: 'high'
                },
                {
                    name: 'command_mode_test.html',
                    title: '命令模式测试',
                    description: '验证命令行模式的各种命令执行和参数处理',
                    status: 'stable',
                    category: 'core',
                    priority: 'high'
                },
                {
                    name: 'visual_mode_test.html',
                    title: '可视模式测试',
                    description: '测试文本选择、复制、粘贴等可视模式功能',
                    status: 'stable',
                    category: 'core',
                    priority: 'high'
                },
                {
                    name: 'test_f_key.html',
                    title: 'F键链接跳转测试',
                    description: '验证F键快速链接跳转功能的准确性和响应速度',
                    status: 'stable',
                    category: 'core',
                    priority: 'medium'
                }
            ],
            
            // 搜索功能测试
            search: [
                {
                    name: 'search_test.html',
                    title: '基础搜索测试',
                    description: '测试基本的文本搜索功能，包括正向和反向搜索',
                    status: 'stable',
                    category: 'search',
                    priority: 'high'
                },
                {
                    name: 'search_function_test.html',
                    title: '搜索功能测试',
                    description: '详细的搜索功能验证，包括正则表达式和高级搜索',
                    status: 'development',
                    category: 'search',
                    priority: 'medium'
                },
                {
                    name: 'search_debug.html',
                    title: '搜索调试页面',
                    description: '用于调试搜索功能问题的专用测试页面',
                    status: 'debug',
                    category: 'search',
                    priority: 'low'
                }
            ],
            
            // 样式与兼容性测试
            style: [
                {
                    name: 'style_conflict_test.html',
                    title: '样式冲突测试',
                    description: '检测插件与网页样式的冲突问题',
                    status: 'stable',
                    category: 'style',
                    priority: 'high'
                },
                {
                    name: 'style_conflict_test_with_detector.html',
                    title: '样式冲突检测器',
                    description: '带自动检测功能的样式冲突测试页面',
                    status: 'stable',
                    category: 'style',
                    priority: 'high'
                },
                {
                    name: 'icon_preview.html',
                    title: '图标预览测试',
                    description: '测试扩展图标在不同状态下的显示效果',
                    status: 'stable',
                    category: 'style',
                    priority: 'low'
                },
                {
                    name: 'icon_disable_test.html',
                    title: '图标禁用测试',
                    description: '测试扩展禁用状态下的图标显示',
                    status: 'stable',
                    category: 'style',
                    priority: 'low'
                }
            ],
            
            // 综合测试套件
            comprehensive: [
                {
                    name: 'comprehensive_test_suite.html',
                    title: '完整测试套件',
                    description: '包含所有功能的综合测试页面，一站式验证',
                    status: 'stable',
                    category: 'comprehensive',
                    priority: 'high'
                },
                {
                    name: 'comprehensive_test_demo.html',
                    title: '测试演示页面',
                    description: '展示插件各项功能的演示和说明',
                    status: 'stable',
                    category: 'comprehensive',
                    priority: 'medium'
                },
                {
                    name: 'comprehensive_test_report.html',
                    title: '测试报告页面',
                    description: '查看详细的测试执行结果和报告',
                    status: 'stable',
                    category: 'comprehensive',
                    priority: 'medium'
                }
            ],
            
            // 扩展管理页面
            extension: [
                {
                    name: 'pages/options.html',
                    title: '选项设置页面',
                    description: '扩展的配置和设置管理界面',
                    status: 'stable',
                    category: 'extension',
                    priority: 'high'
                },
                {
                    name: 'pages/popup.html',
                    title: '弹出窗口页面',
                    description: '扩展图标点击后的弹出界面',
                    status: 'stable',
                    category: 'extension',
                    priority: 'medium'
                },
                {
                    name: 'pages/features.html',
                    title: '功能特性页面',
                    description: '展示扩展所有功能特性的说明页面',
                    status: 'stable',
                    category: 'extension',
                    priority: 'medium'
                },
                {
                    name: 'pages/mappings.html',
                    title: '键盘映射页面',
                    description: '查看和管理键盘快捷键映射',
                    status: 'stable',
                    category: 'extension',
                    priority: 'medium'
                }
            ],
            
            // 历史与书签测试
            history: [
                {
                    name: 'bookmark_history_test.html',
                    title: '书签历史测试',
                    description: '测试书签管理和历史记录功能',
                    status: 'stable',
                    category: 'history',
                    priority: 'medium'
                },
                {
                    name: 'extension_basic_test.html',
                    title: '扩展基础测试',
                    description: '验证扩展的基本加载和初始化功能',
                    status: 'stable',
                    category: 'history',
                    priority: 'high'
                }
            ],
            
            // 其他测试页面
            misc: [
                {
                    name: 'test_page.html',
                    title: '基础测试页面',
                    description: '简单的测试页面，用于基本功能验证',
                    status: 'stable',
                    category: 'misc',
                    priority: 'low'
                },
                {
                    name: 'cmdline_frame.html',
                    title: '命令行框架',
                    description: '测试命令行输入框的显示和交互',
                    status: 'stable',
                    category: 'misc',
                    priority: 'medium'
                },
                {
                    name: 'pages/blank.html',
                    title: '空白页面',
                    description: '用于测试的空白页面',
                    status: 'stable',
                    category: 'misc',
                    priority: 'low'
                },
                {
                    name: 'pages/changelog.html',
                    title: '更新日志',
                    description: '查看扩展的版本更新历史',
                    status: 'stable',
                    category: 'misc',
                    priority: 'low'
                },
                {
                    name: 'bug_fixes_and_solutions.html',
                    title: '问题修复方案',
                    description: '常见问题的修复方案和解决方法',
                    status: 'stable',
                    category: 'misc',
                    priority: 'medium'
                },
                {
                    name: 'privacy_policy.html',
                    title: '隐私政策',
                    description: '扩展的隐私政策和数据使用说明',
                    status: 'stable',
                    category: 'misc',
                    priority: 'low'
                }
            ]
        };
        
        this.categories = {
            core: '核心功能测试',
            search: '搜索功能测试',
            style: '样式与兼容性测试',
            comprehensive: '综合测试套件',
            extension: '扩展管理页面',
            history: '历史与书签测试',
            misc: '其他测试页面'
        };
        
        this.statusTypes = {
            stable: { label: '稳定', class: 'functional', color: '#28a745' },
            development: { label: '开发中', class: 'development', color: '#ffc107' },
            debug: { label: '调试', class: 'development', color: '#fd7e14' },
            experimental: { label: '实验性', class: 'experimental', color: '#dc3545' }
        };
    }
    
    /**
     * 获取所有测试页面
     */
    getAllPages() {
        const allPages = [];
        Object.values(this.testPages).forEach(category => {
            allPages.push(...category);
        });
        return allPages;
    }
    
    /**
     * 按类别获取测试页面
     */
    getPagesByCategory(category) {
        return this.testPages[category] || [];
    }
    
    /**
     * 按状态获取测试页面
     */
    getPagesByStatus(status) {
        return this.getAllPages().filter(page => page.status === status);
    }
    
    /**
     * 按优先级获取测试页面
     */
    getPagesByPriority(priority) {
        return this.getAllPages().filter(page => page.priority === priority);
    }
    
    /**
     * 搜索测试页面
     */
    searchPages(query) {
        const searchTerm = query.toLowerCase();
        return this.getAllPages().filter(page => 
            page.title.toLowerCase().includes(searchTerm) ||
            page.description.toLowerCase().includes(searchTerm) ||
            page.name.toLowerCase().includes(searchTerm)
        );
    }
    
    /**
     * 获取统计信息
     */
    getStatistics() {
        const allPages = this.getAllPages();
        const stats = {
            total: allPages.length,
            byCategory: {},
            byStatus: {},
            byPriority: {}
        };
        
        // 按类别统计
        Object.keys(this.testPages).forEach(category => {
            stats.byCategory[category] = this.testPages[category].length;
        });
        
        // 按状态统计
        Object.keys(this.statusTypes).forEach(status => {
            stats.byStatus[status] = this.getPagesByStatus(status).length;
        });
        
        // 按优先级统计
        ['high', 'medium', 'low'].forEach(priority => {
            stats.byPriority[priority] = this.getPagesByPriority(priority).length;
        });
        
        return stats;
    }
    
    /**
     * 生成测试页面清单
     */
    generateManifest() {
        const manifest = {
            version: '1.0.0',
            generated: new Date().toISOString(),
            categories: this.categories,
            statusTypes: this.statusTypes,
            statistics: this.getStatistics(),
            pages: this.testPages
        };
        
        return JSON.stringify(manifest, null, 2);
    }
    
    /**
     * 验证测试页面完整性
     */
    validatePages() {
        const results = {
            valid: [],
            invalid: [],
            missing: []
        };
        
        this.getAllPages().forEach(page => {
            // 这里可以添加实际的文件存在性检查
            // 由于在浏览器环境中无法直接访问文件系统，
            // 这个方法主要用于数据结构验证
            
            if (page.name && page.title && page.description && page.status && page.category) {
                results.valid.push(page);
            } else {
                results.invalid.push(page);
            }
        });
        
        return results;
    }
    
    /**
     * 生成测试执行计划
     */
    generateTestPlan(options = {}) {
        const { priority = 'all', category = 'all', status = 'stable' } = options;
        
        let pages = this.getAllPages();
        
        // 按优先级过滤
        if (priority !== 'all') {
            pages = pages.filter(page => page.priority === priority);
        }
        
        // 按类别过滤
        if (category !== 'all') {
            pages = pages.filter(page => page.category === category);
        }
        
        // 按状态过滤
        if (status !== 'all') {
            pages = pages.filter(page => page.status === status);
        }
        
        // 按优先级排序
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        pages.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
        
        return {
            plan: {
                generated: new Date().toISOString(),
                filters: { priority, category, status },
                totalPages: pages.length,
                estimatedTime: pages.length * 5 + ' 分钟' // 假设每个测试5分钟
            },
            pages: pages
        };
    }
    
    /**
     * 导出为CSV格式
     */
    exportToCSV() {
        const pages = this.getAllPages();
        const headers = ['名称', '标题', '描述', '状态', '类别', '优先级'];
        
        let csv = headers.join(',') + '\n';
        
        pages.forEach(page => {
            const row = [
                page.name,
                `"${page.title}"`,
                `"${page.description}"`,
                page.status,
                page.category,
                page.priority
            ];
            csv += row.join(',') + '\n';
        });
        
        return csv;
    }
    
    /**
     * 生成README文档
     */
    generateReadme() {
        const stats = this.getStatistics();
        let readme = `# Chromium Vim 测试页面文档\n\n`;
        
        readme += `## 概览\n\n`;
        readme += `- 总测试页面数: ${stats.total}\n`;
        readme += `- 稳定页面: ${stats.byStatus.stable || 0}\n`;
        readme += `- 开发中页面: ${stats.byStatus.development || 0}\n`;
        readme += `- 实验性页面: ${stats.byStatus.experimental || 0}\n\n`;
        
        readme += `## 分类统计\n\n`;
        Object.entries(this.categories).forEach(([key, name]) => {
            readme += `- ${name}: ${stats.byCategory[key] || 0} 个\n`;
        });
        
        readme += `\n## 测试页面列表\n\n`;
        
        Object.entries(this.testPages).forEach(([categoryKey, pages]) => {
            readme += `### ${this.categories[categoryKey]}\n\n`;
            
            pages.forEach(page => {
                const statusInfo = this.statusTypes[page.status];
                readme += `- **${page.title}** (${statusInfo.label})\n`;
                readme += `  - 文件: \`${page.name}\`\n`;
                readme += `  - 描述: ${page.description}\n`;
                readme += `  - 优先级: ${page.priority}\n\n`;
            });
        });
        
        readme += `\n---\n\n`;
        readme += `*文档生成时间: ${new Date().toLocaleString('zh-CN')}*\n`;
        
        return readme;
    }
}

// 如果在Node.js环境中
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TestPagesManager;
}

// 如果在浏览器环境中
if (typeof window !== 'undefined') {
    window.TestPagesManager = TestPagesManager;
}

// 使用示例
if (typeof window !== 'undefined') {
    // 创建管理器实例
    const manager = new TestPagesManager();
    
    // 在控制台中提供便捷方法
    window.testManager = manager;
    
    console.log('测试页面管理器已加载');
    console.log('使用 testManager 访问管理功能');
    console.log('例如: testManager.getStatistics()');
}