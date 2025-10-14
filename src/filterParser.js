/**
 * 筛选语法解析器
 * 
 * 支持的语法（类似 Android Studio Logcat）：
 * - 支持多个tag输入，同tag为"或"关系，不同tag为"且"关系
 *   例: url:github.io url:gitlab.io title:fooA title:fooB
 *   (url包含github.io或gitlab.io) AND (title包含fooA或fooB)
 * 
 * - 支持负向筛选 -tag:
 *   例: -title:fooC (排除标题包含fooC的项)
 * 
 * - 支持dir: 用于收藏夹文件夹筛选
 *   - dir: 无值时搜索所有收藏夹
 *   - dir: 支持通配符 * 和 ** (* 匹配单级, ** 匹配多级)
 *   - dir: 仅应用于收藏夹，历史记录忽略dir
 *   例: dir:工作/* (匹配工作下的直接子文件夹)
 *       dir:工作/** (匹配工作下的所有子文件夹)
 * 
 * - 支持正则表达式（用/包裹）
 *   例: title:/^GitHub/ url:/\.com$/
 * 
 * - 当有任意tag在场时，不支持无tag的筛选方式
 */

/**
 * 单个筛选标签
 */
class FilterTag {
    constructor(field, value, isNegative = false, isRegex = false) {
        this.field = field; // 'title', 'url', 'dir', 或 null(无tag时的普通文本)
        this.value = value;
        this.isNegative = isNegative;
        this.isRegex = isRegex;
        this.regex = null;
        
        if (this.isRegex) {
            try {
                this.regex = new RegExp(value, 'i');
            } catch (e) {
                console.warn('Invalid regex pattern:', e);
                this.isRegex = false;
            }
        }
    }
    
    /**
     * 测试项目是否匹配此标签
     */
    test(item) {
        const title = item.title || '';
        const url = item.url || '';
        const folder = item.folder || '';
        
        let matches = false;
        
        if (this.field === 'title') {
            matches = this.isRegex 
                ? this.regex.test(title)
                : title.toLowerCase().includes(this.value.toLowerCase());
        } else if (this.field === 'url') {
            matches = this.isRegex 
                ? this.regex.test(url)
                : url.toLowerCase().includes(this.value.toLowerCase());
        } else if (this.field === 'domain') {
            // domain 标签匹配域名
            const domain = this.extractDomain(url);
            if (!domain) {
                matches = false;
            } else {
                matches = this.isRegex 
                    ? this.regex.test(domain)
                    : this.matchDomainPattern(domain, this.value);
            }
        } else if (this.field === 'dir') {
            // dir 标签只对收藏夹有效
            if (!item.folder) {
                // 不是收藏夹项，忽略 dir 标签（总是返回true，由其他标签决定）
                return !this.isNegative;
            }
            matches = this.matchGlobPattern(folder, this.value);
        } else {
            // 无 field 的普通文本搜索（在有tag时不应出现）
            matches = this.isRegex 
                ? (this.regex.test(title) || this.regex.test(url))
                : (title.toLowerCase().includes(this.value.toLowerCase()) || 
                   url.toLowerCase().includes(this.value.toLowerCase()));
        }
        
        return this.isNegative ? !matches : matches;
    }
    
    /**
     * 从URL中提取域名
     */
    extractDomain(url) {
        try {
            const urlObj = new URL(url);
            return urlObj.hostname;
        } catch (e) {
            return '';
        }
    }
    
    /**
     * 域名通配符匹配（类似广告拦截规则）
     * 支持 * 和 **
     * * 匹配单个部分（不包含点）
     * ** 匹配多个部分（包含点）
     * 
     * 示例：
     * *.example.com 匹配 www.example.com, api.example.com
     * **.example.com 匹配 a.b.example.com, www.example.com
     * example.* 匹配 example.com, example.org
     */
    matchDomainPattern(domain, pattern) {
        if (!pattern) {
            return true;
        }
        
        const lowerDomain = domain.toLowerCase();
        const lowerPattern = pattern.toLowerCase();
        
        // 转义特殊字符，但保留 *
        let regexPattern = lowerPattern
            .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
            .replace(/\*\*/g, '___DOUBLESTAR___')
            .replace(/\*/g, '[^.]*')
            .replace(/___DOUBLESTAR___/g, '.*');
        
        regexPattern = '^' + regexPattern + '$';
        
        try {
            const regex = new RegExp(regexPattern);
            return regex.test(lowerDomain);
        } catch (e) {
            console.warn('Invalid domain pattern:', e);
            return lowerDomain.includes(lowerPattern);
        }
    }
    
    /**
     * Glob 模式匹配（简化版，支持 * 和 **）
     * * 匹配单级路径
     * ** 匹配多级路径
     */
    matchGlobPattern(path, pattern) {
        if (!pattern) {
            return true; // 空pattern匹配所有
        }
        
        // 将 pattern 转换为正则表达式
        // 注意：分隔符可能是 > 或 /
        const normalizedPath = path.replace(/\s*>\s*/g, '/');
        const normalizedPattern = pattern.replace(/\s*>\s*/g, '/');
        
        // 转义特殊字符，但保留 * 
        let regexPattern = normalizedPattern
            .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
            .replace(/\*\*/g, '___DOUBLESTAR___')
            .replace(/\*/g, '[^/]*')
            .replace(/___DOUBLESTAR___/g, '.*');
        
        regexPattern = '^' + regexPattern + '$';
        
        try {
            const regex = new RegExp(regexPattern, 'i');
            return regex.test(normalizedPath);
        } catch (e) {
            console.warn('Invalid glob pattern:', e);
            return normalizedPath.toLowerCase().includes(normalizedPattern.toLowerCase());
        }
    }
}

export class FilterParser {
    constructor(filterString) {
        this.filterString = filterString.trim();
        this.tags = []; // 所有标签的列表
        this.tagGroups = {}; // 按字段分组的标签 { field: [tags] }
        this.hasAnyTag = false; // 是否有任何tag
        
        this.parse();
    }
    
    /**
     * 解析筛选字符串
     */
    parse() {
        if (!this.filterString) {
            return;
        }
        
        // 分词：按空格分割，但保留引号内的内容和正则表达式
        const tokens = this.tokenize(this.filterString);
        
        for (const token of tokens) {
            const tag = this.parseToken(token);
            if (tag) {
                this.tags.push(tag);
                
                // 按字段分组
                const groupKey = tag.field || '_default';
                if (!this.tagGroups[groupKey]) {
                    this.tagGroups[groupKey] = [];
                }
                this.tagGroups[groupKey].push(tag);
                
                if (tag.field) {
                    this.hasAnyTag = true;
                }
            }
        }
    }
    
    /**
     * 分词：按空格分割，保留引号内容和正则表达式的完整性
     */
    tokenize(str) {
        const tokens = [];
        let current = '';
        let inQuotes = false;
        let inRegex = false;
        let quoteChar = '';
        
        for (let i = 0; i < str.length; i++) {
            const char = str[i];
            
            if ((char === '"' || char === "'") && !inRegex) {
                if (!inQuotes) {
                    inQuotes = true;
                    quoteChar = char;
                } else if (char === quoteChar) {
                    inQuotes = false;
                    quoteChar = '';
                }
                current += char;
            } else if (char === '/' && !inQuotes) {
                current += char;
                if (inRegex && str[i - 1] !== '\\') {
                    // 可能是正则结束，继续读取flag
                    let j = i + 1;
                    while (j < str.length && /[gimuy]/.test(str[j])) {
                        current += str[j];
                        j++;
                    }
                    i = j - 1;
                    inRegex = false;
                } else if (!inRegex && (i === 0 || str[i - 1] === ' ' || str[i - 1] === ':')) {
                    inRegex = true;
                }
            } else if (char === ' ' && !inQuotes && !inRegex) {
                if (current.trim()) {
                    tokens.push(current.trim());
                    current = '';
                }
            } else {
                current += char;
            }
        }
        
        if (current.trim()) {
            tokens.push(current.trim());
        }
        
        return tokens;
    }
    
    /**
     * 解析单个token为FilterTag
     */
    parseToken(token) {
        // 移除引号
        token = token.replace(/^["']|["']$/g, '');
        
        if (!token) return null;
        
        // 检查是否是负向筛选
        const isNegative = token.startsWith('-');
        if (isNegative) {
            token = token.substring(1);
        }
        
        // 检查是否有字段前缀 (title:, url:, domain:, dir:)
        const fieldMatch = token.match(/^(title|url|domain|dir):/i);
        
        if (fieldMatch) {
            const field = fieldMatch[1].toLowerCase();
            let value = token.substring(fieldMatch[0].length);
            
            // 检查值是否是正则表达式
            const regexMatch = value.match(/^\/(.+?)\/([gimuy]*)$/);
            if (regexMatch) {
                return new FilterTag(field, regexMatch[1], isNegative, true);
            } else {
                return new FilterTag(field, value, isNegative, false);
            }
        } else {
            // 无字段前缀
            // 如果有任何tag存在，则忽略无tag的文本
            // 但在解析时我们还不知道是否有其他tag，所以先创建，在test时再判断
            const regexMatch = token.match(/^\/(.+?)\/([gimuy]*)$/);
            if (regexMatch) {
                return new FilterTag(null, regexMatch[1], isNegative, true);
            } else {
                return new FilterTag(null, token, isNegative, false);
            }
        }
    }
    
    /**
     * 测试项目是否匹配筛选条件
     * @param {Object} item - 要测试的项目，包含 title, url, folder 属性
     * @returns {boolean} - 是否匹配
     */
    test(item) {
        if (this.tags.length === 0) {
            return true; // 没有筛选条件，全部通过
        }
        
        // 如果有任何带字段的tag，则忽略无字段的tag
        const effectiveTags = this.hasAnyTag 
            ? this.tags.filter(tag => tag.field !== null)
            : this.tags;
        
        if (effectiveTags.length === 0) {
            return true;
        }
        
        // 按字段分组，每组内是"或"关系，组间是"且"关系
        const groups = {};
        for (const tag of effectiveTags) {
            const key = tag.field || '_default';
            if (!groups[key]) {
                groups[key] = [];
            }
            groups[key].push(tag);
        }
        
        // 每个组都必须至少有一个tag匹配（且关系）
        for (const groupTags of Object.values(groups)) {
            // 分离正向和负向tag
            const positiveTags = groupTags.filter(tag => !tag.isNegative);
            const negativeTags = groupTags.filter(tag => tag.isNegative);
            
            // 正向tag：至少有一个匹配（或关系）
            if (positiveTags.length > 0) {
                const anyPositiveMatch = positiveTags.some(tag => tag.test(item));
                if (!anyPositiveMatch) {
                    return false; // 该组没有任何正向匹配
                }
            }
            
            // 负向tag：全部都要匹配（即全部都要排除成功）
            for (const tag of negativeTags) {
                if (!tag.test(item)) {
                    return false; // 有负向tag未排除成功
                }
            }
        }
        
        return true;
    }
    
    /**
     * 获取筛选器的描述信息
     * @returns {string} - 筛选器的可读描述
     */
    getDescription() {
        if (this.tags.length === 0) {
            return '无筛选';
        }
        
        // 过滤掉无效的tag（当有字段tag时，无字段tag会被忽略）
        const effectiveTags = this.hasAnyTag 
            ? this.tags.filter(tag => tag.field !== null)
            : this.tags;
        
        if (effectiveTags.length === 0) {
            return '无筛选';
        }
        
        // 按字段分组
        const groups = {};
        for (const tag of effectiveTags) {
            const key = tag.field || '_default';
            if (!groups[key]) {
                groups[key] = [];
            }
            groups[key].push(tag);
        }
        
        const parts = [];
        for (const [field, tags] of Object.entries(groups)) {
            const tagDescs = tags.map(tag => {
                let desc = '';
                
                // 字段名
                if (field === 'title') {
                    desc = '标题';
                } else if (field === 'url') {
                    desc = '网址';
                } else if (field === 'domain') {
                    desc = '域名';
                } else if (field === 'dir') {
                    desc = '文件夹';
                } else {
                    desc = '标题或网址';
                }
                
                // 匹配类型
                if (tag.isNegative) {
                    desc += tag.isRegex ? '不匹配' : '不包含';
                } else {
                    desc += tag.isRegex ? '匹配' : '包含';
                }
                
                // 值
                desc += tag.value;
                
                return desc;
            });
            
            parts.push(tagDescs.join(' '));
        }
        
        return parts.join(' ');
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
        
        try {
            const parser = new FilterParser(filterString);
            
            // 检查是否有不支持的tag
            const supportedFields = ['title', 'url', 'domain', 'dir'];
            const invalidTags = [];
            const invalidNoTagTokens = [];
            
            for (const tag of parser.tags) {
                // 检查正则表达式是否有效
                if (tag.isRegex && !tag.regex) {
                    return { 
                        valid: false, 
                        error: `正则表达式语法错误: ${tag.value}` 
                    };
                }
                
                // 检查字段是否支持
                if (tag.field && !supportedFields.includes(tag.field)) {
                    invalidTags.push(tag.field);
                }
                
                // 检查是否有无字段的tag（当有其他字段tag存在时）
                if (!tag.field && parser.hasAnyTag) {
                    invalidNoTagTokens.push(tag.value);
                }
            }
            
            // 报告不支持的tag
            if (invalidTags.length > 0) {
                const uniqueInvalid = [...new Set(invalidTags)];
                return {
                    valid: false,
                    error: `不支持的标签: ${uniqueInvalid.join(', ')}`
                };
            }
            
            // 报告无效的无tag token
            if (invalidNoTagTokens.length > 0) {
                return {
                    valid: false,
                    error: `存在标签时不支持无标签的文本: "${invalidNoTagTokens[0]}"`
                };
            }
            
            return { valid: true, error: '' };
        } catch (e) {
            return { 
                valid: false, 
                error: `解析错误: ${e.message}` 
            };
        }
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
