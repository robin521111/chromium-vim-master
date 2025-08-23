/**
 * 测试页面清理脚本
 * 用于整理、清理和优化测试页面结构
 */

class TestPagesCleanup {
    constructor() {
        this.duplicatePatterns = [
            // 可能重复的文件模式
            { pattern: /test.*\.html$/, category: 'general_test' },
            { pattern: /search.*test.*\.html$/, category: 'search_test' },
            { pattern: /comprehensive.*test.*\.html$/, category: 'comprehensive_test' },
            { pattern: /style.*test.*\.html$/, category: 'style_test' }
        ];
        
        this.obsoleteFiles = [
            // 可能过时的文件
            'old_test.html',
            'temp_test.html',
            'backup_test.html',
            'test_backup.html'
        ];
        
        this.recommendedStructure = {
            'tests/': {
                'core/': [
                    'functionality.html',
                    'command_mode.html',
                    'visual_mode.html',
                    'navigation.html'
                ],
                'search/': [
                    'basic_search.html',
                    'advanced_search.html',
                    'regex_search.html'
                ],
                'style/': [
                    'conflict_detection.html',
                    'compatibility.html',
                    'responsive.html'
                ],
                'integration/': [
                    'comprehensive_suite.html',
                    'performance.html',
                    'accessibility.html'
                ],
                'utils/': [
                    'test_manager.html',
                    'report_viewer.html',
                    'debug_tools.html'
                ]
            }
        };
    }
    
    /**
     * 分析当前测试页面结构
     */
    analyzeCurrentStructure(fileList) {
        const analysis = {
            totalFiles: fileList.length,
            categories: {},
            duplicates: [],
            obsolete: [],
            recommendations: []
        };
        
        // 按模式分类文件
        fileList.forEach(file => {
            let categorized = false;
            
            this.duplicatePatterns.forEach(({ pattern, category }) => {
                if (pattern.test(file)) {
                    if (!analysis.categories[category]) {
                        analysis.categories[category] = [];
                    }
                    analysis.categories[category].push(file);
                    categorized = true;
                }
            });
            
            if (!categorized) {
                if (!analysis.categories.uncategorized) {
                    analysis.categories.uncategorized = [];
                }
                analysis.categories.uncategorized.push(file);
            }
        });
        
        // 检测重复文件
        Object.entries(analysis.categories).forEach(([category, files]) => {
            if (files.length > 1 && category !== 'uncategorized') {
                analysis.duplicates.push({
                    category,
                    files,
                    suggestion: `考虑合并 ${category} 类别中的 ${files.length} 个文件`
                });
            }
        });
        
        // 检测过时文件
        fileList.forEach(file => {
            if (this.obsoleteFiles.some(obsolete => file.includes(obsolete))) {
                analysis.obsolete.push(file);
            }
        });
        
        // 生成建议
        this.generateRecommendations(analysis);
        
        return analysis;
    }
    
    /**
     * 生成整理建议
     */
    generateRecommendations(analysis) {
        // 结构优化建议
        if (analysis.totalFiles > 15) {
            analysis.recommendations.push({
                type: 'structure',
                priority: 'high',
                message: '建议创建子目录来组织测试页面，当前文件数量较多',
                action: 'create_subdirectories'
            });
        }
        
        // 重复文件建议
        if (analysis.duplicates.length > 0) {
            analysis.recommendations.push({
                type: 'duplicates',
                priority: 'medium',
                message: `发现 ${analysis.duplicates.length} 组可能重复的文件`,
                action: 'merge_duplicates'
            });
        }
        
        // 过时文件建议
        if (analysis.obsolete.length > 0) {
            analysis.recommendations.push({
                type: 'obsolete',
                priority: 'low',
                message: `发现 ${analysis.obsolete.length} 个可能过时的文件`,
                action: 'remove_obsolete'
            });
        }
        
        // 命名规范建议
        const inconsistentNaming = this.checkNamingConsistency(Object.values(analysis.categories).flat());
        if (inconsistentNaming.length > 0) {
            analysis.recommendations.push({
                type: 'naming',
                priority: 'medium',
                message: '发现命名不一致的文件',
                action: 'standardize_naming',
                files: inconsistentNaming
            });
        }
    }
    
    /**
     * 检查命名一致性
     */
    checkNamingConsistency(files) {
        const inconsistent = [];
        const patterns = {
            camelCase: /^[a-z][a-zA-Z0-9]*\.html$/,
            snake_case: /^[a-z][a-z0-9_]*\.html$/,
            kebab_case: /^[a-z][a-z0-9-]*\.html$/
        };
        
        const patternCounts = { camelCase: 0, snake_case: 0, kebab_case: 0, other: 0 };
        
        files.forEach(file => {
            const filename = file.split('/').pop();
            let matched = false;
            
            Object.entries(patterns).forEach(([pattern, regex]) => {
                if (regex.test(filename)) {
                    patternCounts[pattern]++;
                    matched = true;
                }
            });
            
            if (!matched) {
                patternCounts.other++;
                inconsistent.push(file);
            }
        });
        
        // 如果没有主导模式，标记为不一致
        const maxCount = Math.max(...Object.values(patternCounts));
        const dominantPatterns = Object.entries(patternCounts)
            .filter(([, count]) => count === maxCount)
            .map(([pattern]) => pattern);
        
        if (dominantPatterns.length > 1 || patternCounts.other > 0) {
            return inconsistent;
        }
        
        return [];
    }
    
    /**
     * 生成清理计划
     */
    generateCleanupPlan(analysis) {
        const plan = {
            timestamp: new Date().toISOString(),
            summary: {
                totalFiles: analysis.totalFiles,
                duplicateGroups: analysis.duplicates.length,
                obsoleteFiles: analysis.obsolete.length,
                recommendations: analysis.recommendations.length
            },
            actions: []
        };
        
        // 基于建议生成具体行动
        analysis.recommendations.forEach(rec => {
            switch (rec.action) {
                case 'create_subdirectories':
                    plan.actions.push({
                        type: 'create_directory',
                        priority: rec.priority,
                        description: '创建测试页面子目录结构',
                        steps: this.generateDirectoryStructure()
                    });
                    break;
                    
                case 'merge_duplicates':
                    analysis.duplicates.forEach(dup => {
                        plan.actions.push({
                            type: 'merge_files',
                            priority: rec.priority,
                            description: `合并 ${dup.category} 类别的重复文件`,
                            files: dup.files,
                            targetFile: this.suggestMergedFilename(dup.files)
                        });
                    });
                    break;
                    
                case 'remove_obsolete':
                    plan.actions.push({
                        type: 'remove_files',
                        priority: rec.priority,
                        description: '删除过时的测试文件',
                        files: analysis.obsolete
                    });
                    break;
                    
                case 'standardize_naming':
                    plan.actions.push({
                        type: 'rename_files',
                        priority: rec.priority,
                        description: '标准化文件命名',
                        files: rec.files,
                        namingConvention: 'snake_case'
                    });
                    break;
            }
        });
        
        return plan;
    }
    
    /**
     * 生成目录结构创建步骤
     */
    generateDirectoryStructure() {
        const steps = [];
        
        Object.entries(this.recommendedStructure).forEach(([dir, contents]) => {
            steps.push({
                action: 'create_directory',
                path: dir,
                description: `创建 ${dir} 目录`
            });
            
            if (typeof contents === 'object' && !Array.isArray(contents)) {
                Object.entries(contents).forEach(([subdir, files]) => {
                    steps.push({
                        action: 'create_directory',
                        path: `${dir}${subdir}`,
                        description: `创建 ${dir}${subdir} 子目录`
                    });
                });
            }
        });
        
        return steps;
    }
    
    /**
     * 建议合并后的文件名
     */
    suggestMergedFilename(files) {
        // 提取公共前缀或主题
        const basenames = files.map(f => f.replace(/\.html$/, ''));
        const commonWords = this.findCommonWords(basenames);
        
        if (commonWords.length > 0) {
            return `${commonWords.join('_')}_test.html`;
        }
        
        // 如果没有公共词，使用第一个文件名作为基础
        return `merged_${basenames[0]}.html`;
    }
    
    /**
     * 查找公共词汇
     */
    findCommonWords(names) {
        const wordSets = names.map(name => 
            new Set(name.toLowerCase().split(/[_-]/))
        );
        
        if (wordSets.length === 0) return [];
        
        // 找到所有名称中都包含的词汇
        const commonWords = [...wordSets[0]].filter(word => 
            wordSets.every(set => set.has(word))
        );
        
        return commonWords.filter(word => word.length > 2); // 过滤掉太短的词
    }
    
    /**
     * 生成清理报告
     */
    generateCleanupReport(analysis, plan) {
        let report = `# 测试页面清理报告\n\n`;
        report += `生成时间: ${new Date().toLocaleString('zh-CN')}\n\n`;
        
        // 概览
        report += `## 概览\n\n`;
        report += `- 总文件数: ${analysis.totalFiles}\n`;
        report += `- 重复文件组: ${analysis.duplicates.length}\n`;
        report += `- 过时文件: ${analysis.obsolete.length}\n`;
        report += `- 建议操作: ${analysis.recommendations.length}\n\n`;
        
        // 文件分类
        report += `## 文件分类\n\n`;
        Object.entries(analysis.categories).forEach(([category, files]) => {
            report += `### ${category}\n`;
            files.forEach(file => {
                report += `- ${file}\n`;
            });
            report += `\n`;
        });
        
        // 重复文件
        if (analysis.duplicates.length > 0) {
            report += `## 重复文件\n\n`;
            analysis.duplicates.forEach(dup => {
                report += `### ${dup.category}\n`;
                dup.files.forEach(file => {
                    report += `- ${file}\n`;
                });
                report += `**建议**: ${dup.suggestion}\n\n`;
            });
        }
        
        // 建议操作
        report += `## 建议操作\n\n`;
        analysis.recommendations.forEach((rec, index) => {
            report += `${index + 1}. **${rec.type}** (优先级: ${rec.priority})\n`;
            report += `   ${rec.message}\n\n`;
        });
        
        // 清理计划
        report += `## 清理计划\n\n`;
        plan.actions.forEach((action, index) => {
            report += `${index + 1}. **${action.type}** (优先级: ${action.priority})\n`;
            report += `   ${action.description}\n`;
            
            if (action.files) {
                report += `   文件: ${action.files.join(', ')}\n`;
            }
            
            if (action.targetFile) {
                report += `   目标文件: ${action.targetFile}\n`;
            }
            
            report += `\n`;
        });
        
        return report;
    }
    
    /**
     * 执行清理操作（模拟）
     */
    executeCleanup(plan, dryRun = true) {
        const results = {
            executed: [],
            skipped: [],
            errors: []
        };
        
        plan.actions.forEach(action => {
            try {
                if (dryRun) {
                    results.executed.push({
                        action: action.type,
                        description: action.description,
                        status: 'simulated'
                    });
                } else {
                    // 这里可以添加实际的文件操作逻辑
                    // 由于在浏览器环境中无法直接操作文件系统，
                    // 这个方法主要用于生成操作指令
                    results.executed.push({
                        action: action.type,
                        description: action.description,
                        status: 'would_execute'
                    });
                }
            } catch (error) {
                results.errors.push({
                    action: action.type,
                    error: error.message
                });
            }
        });
        
        return results;
    }
}

// 导出类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TestPagesCleanup;
}

if (typeof window !== 'undefined') {
    window.TestPagesCleanup = TestPagesCleanup;
}

// 使用示例
if (typeof window !== 'undefined') {
    console.log('测试页面清理工具已加载');
    console.log('使用方法:');
    console.log('const cleanup = new TestPagesCleanup();');
    console.log('const analysis = cleanup.analyzeCurrentStructure(fileList);');
    console.log('const plan = cleanup.generateCleanupPlan(analysis);');
}