/**
 * 筛选语法解析器
 * 
 * 支持的语法：
 * - 默认：普通文本匹配标题和URL
 * - /regex/ - 正则表达式（两侧斜杠）
 * - title:text - 仅匹配标题（普通文本）
 * - url:text - 仅匹配URL（普通文本）
 * - title:/regex/ - 仅匹配标题（正则表达式）
 * - url:/regex/ - 仅匹配URL（正则表达式）
 * 
 * 示例：
 * - "github" - 在标题和URL中搜索包含"github"的内容
 * - "/^https:\/\/github\.com/" - 使用正则匹配以github.com开头的URL
 * - "title:新闻" - 仅在标题中搜索"新闻"
 * - "url:/.com$/" - 仅在URL中匹配以.com结尾的内容
 */

export class FilterParser {
    constructor(filterString) {
        this.filterString = filterString.trim();
        this.field = null; // null表示全文搜索, 'title'或'url'表示特定字段
        this.isRegex = false;
        this.pattern = '';
        this.regex = null;
        
        this.parse();
    }
    
    /**
     * 解析筛选字符串
     */
    parse() {
        if (!this.filterString) {
            return;
        }
        
        // 检查是否有字段前缀 (title: 或 url:)
        const fieldMatch = this.filterString.match(/^(title|url):/i);
        if (fieldMatch) {
            this.field = fieldMatch[1].toLowerCase();
            // 移除前缀，获取剩余部分
            const remaining = this.filterString.substring(fieldMatch[0].length).trim();
            this.parsePattern(remaining);
        } else {
            // 没有字段前缀，全文搜索
            this.parsePattern(this.filterString);
        }
    }
    
    /**
     * 解析模式（正则或普通文本）
     */
    parsePattern(patternString) {
        // 检查是否是正则表达式（被/包裹）
        const regexMatch = patternString.match(/^\/(.+?)\/([gimuy]*)$/);
        
        if (regexMatch) {
            // 是正则表达式
            this.isRegex = true;
            this.pattern = regexMatch[1];
            const flags = regexMatch[2] || 'i'; // 默认不区分大小写
            
            try {
                this.regex = new RegExp(this.pattern, flags);
            } catch (e) {
                console.warn('Invalid regex pattern, falling back to text search:', e);
                this.isRegex = false;
                this.pattern = patternString; // 回退到普通文本
            }
        } else {
            // 是普通文本
            this.isRegex = false;
            this.pattern = patternString;
        }
    }
    
    /**
     * 测试项目是否匹配筛选条件
     * @param {Object} item - 要测试的项目，包含 title 和 url 属性
     * @returns {boolean} - 是否匹配
     */
    test(item) {
        if (!this.pattern) {
            return true; // 没有筛选条件，全部通过
        }
        
        const title = item.title || '';
        const url = item.url || '';
        
        if (this.isRegex) {
            // 正则匹配
            if (this.field === 'title') {
                return this.regex.test(title);
            } else if (this.field === 'url') {
                return this.regex.test(url);
            } else {
                // 全文匹配：标题或URL任一匹配即可
                return this.regex.test(title) || this.regex.test(url);
            }
        } else {
            // 普通文本匹配（不区分大小写）
            const lowerPattern = this.pattern.toLowerCase();
            const lowerTitle = title.toLowerCase();
            const lowerUrl = url.toLowerCase();
            
            if (this.field === 'title') {
                return lowerTitle.includes(lowerPattern);
            } else if (this.field === 'url') {
                return lowerUrl.includes(lowerPattern);
            } else {
                // 全文匹配：标题或URL任一匹配即可
                return lowerTitle.includes(lowerPattern) || lowerUrl.includes(lowerPattern);
            }
        }
    }
    
    /**
     * 获取筛选器的描述信息
     * @returns {string} - 筛选器的可读描述
     */
    getDescription() {
        if (!this.pattern) {
            return '无筛选';
        }
        
        let desc = '';
        
        if (this.field === 'title') {
            desc += '标题';
        } else if (this.field === 'url') {
            desc += 'URL';
        } else {
            desc += '标题或URL';
        }
        
        desc += this.isRegex ? '（正则）' : '（文本）';
        desc += `: ${this.pattern}`;
        
        return desc;
    }
    
    /**
     * 验证筛选字符串格式是否正确
     * @param {string} filterString - 要验证的字符串
     * @returns {Object} - {valid: boolean, error: string}
     */
    static validate(filterString) {
        if (!filterString || !filterString.trim()) {
            return { valid: true, error: '' };
        }
        
        const trimmed = filterString.trim();
        
        // 提取字段前缀后的部分
        let remaining = trimmed;
        const fieldMatch = trimmed.match(/^(title|url):/i);
        if (fieldMatch) {
            remaining = trimmed.substring(fieldMatch[0].length).trim();
        }
        
        // 检查是否是正则表达式
        const regexMatch = remaining.match(/^\/(.+?)\/([gimuy]*)$/);
        if (regexMatch) {
            const pattern = regexMatch[1];
            const flags = regexMatch[2] || '';
            
            try {
                new RegExp(pattern, flags);
                return { valid: true, error: '' };
            } catch (e) {
                return { 
                    valid: false, 
                    error: `正则表达式语法错误: ${e.message}` 
                };
            }
        }
        
        return { valid: true, error: '' };
    }
}

/**
 * 便捷函数：创建筛选器并测试项目
 * @param {string} filterString - 筛选字符串
 * @param {Object} item - 要测试的项目
 * @returns {boolean} - 是否匹配
 */
export function testFilter(filterString, item) {
    const parser = new FilterParser(filterString);
    return parser.test(item);
}

/**
 * 便捷函数：筛选项目数组
 * @param {string} filterString - 筛选字符串
 * @param {Array} items - 项目数组
 * @returns {Array} - 筛选后的项目数组
 */
export function filterItems(filterString, items) {
    if (!filterString || !filterString.trim()) {
        return items;
    }
    
    const parser = new FilterParser(filterString);
    return items.filter(item => parser.test(item));
}
