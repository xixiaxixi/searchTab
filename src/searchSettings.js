// ====== 搜索栏设置模块 ======
// 负责搜索栏的渲染、配置管理和搜索功能

import { FilterParser, filterItems } from './filterParser.js';

// ====== 默认配置 ======
const DEFAULT_SEARCH_BAR_DATA = [
    {
        buttonText: "百度一下",
        hint: "搜索 百度一下",
        query: "https://www.baidu.com/s?wd={}",
        enabled: true,
    },
    {
        buttonText: "Google",
        hint: "搜索 Google",
        query: "https://www.google.com/search?q={}",
        enabled: true,
    },
    {
        buttonText: "Bing",
        hint: "搜索 Bing",
        query: "https://www.bing.com/search?q={}",
        enabled: false,
    },
    {
        buttonText: "YouTube",
        hint: "搜索 YouTube",
        query: "https://www.youtube.com/results?search_query={}",
        enabled: false,
    },
    {
        buttonText: "Wikipedia",
        hint: "搜索 Wikipedia",
        query: "https://en.wikipedia.org/w/index.php?search={}",
        enabled: false,
    },
    {
        buttonText: "学术搜索",
        hint: "搜索 百度学术",
        query: "https://xueshu.baidu.com/s?wd={}",
        enabled: false,
    },
    {
        buttonText: "Scholar",
        hint: "搜索 Google Scholar",
        query: "https://scholar.google.com/scholar?q={}",
        enabled: false,
    },
    {
        buttonText: "Github",
        hint: "搜索 Github",
        query: "https://github.com/search?q={}",
        enabled: false,
    },
    {
        buttonText: "Stack Overflow",
        hint: "搜索 Stack Overflow",
        query: "https://stackoverflow.com/search?q={}",
        enabled: false,
    },
    {
        buttonText: "知乎",
        hint: "搜索 知乎",
        query: "https://www.zhihu.com/search?type=content&q={}",
        enabled: false,
    },
    {
        buttonText: "豆瓣",
        hint: "搜索 豆瓣",
        query: "https://www.douban.com/search?q={}",
        enabled: false,
    },
    {
        buttonText: "微博",
        hint: "搜索 微博",
        query: "https://s.weibo.com/weibo/{}",
        enabled: false,
    },
    {
        buttonText: "Twitter",
        hint: "搜索 Twitter",
        query: "https://twitter.com/search?q={}",
        enabled: false,
    },
    {
        buttonText: "Facebook",
        hint: "搜索 Facebook",
        query: "https://www.facebook.com/search/top/?q={}",
        enabled: false,
    },
    {
        buttonText: "Instagram",
        hint: "搜索 Instagram",
        query: "https://www.instagram.com/explore/tags/{}",
        enabled: false,
    },
    {
        buttonText: "Reddit",
        hint: "搜索 Reddit",
        query: "https://www.reddit.com/search?q={}",
        enabled: false,
    },
];

// ====== SVG 图标 ======
const SVG_DELETE = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20">
    <path fill="none" d="M0 0h24v24H0z"/>
    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/>
</svg>`;

const SVG_UP = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20">
    <path d="M7 14l5-5 5 5z"/>
    <path d="M0 0h24v24H0z" fill="none"/>
</svg>`;

const SVG_DOWN = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" style="transform: rotate(180deg)">
    <path d="M7 14l5-5 5 5z"/>
    <path d="M0 0h24v24H0z" fill="none"/>
</svg>`;

// ====== 状态 ======
let searchBarData = loadSearchBarData();
let openInNewTab = loadOpenInNewTab();
let syncSearchBar = loadSyncSearchBar();
let editingConfigs = [];
let browserHistory = [];
let browserBookmarks = [];

// ====== 本地存储 ======
function loadSearchBarData() {
    const data = localStorage.getItem("searchBarData");
    if (data) {
        return JSON.parse(data);
    }
    return JSON.parse(JSON.stringify(DEFAULT_SEARCH_BAR_DATA));
}

function saveSearchBarData(data) {
    localStorage.setItem("searchBarData", JSON.stringify(data));
}

function loadOpenInNewTab() {
    const data = localStorage.getItem("openInNewTab");
    return data ? JSON.parse(data) : true;
}

function saveOpenInNewTab(value) {
    localStorage.setItem("openInNewTab", JSON.stringify(value));
}

function loadSyncSearchBar() {
    const data = localStorage.getItem("syncSearchBar");
    return data ? JSON.parse(data) : true;
}

function saveSyncSearchBar(value) {
    localStorage.setItem("syncSearchBar", JSON.stringify(value));
}

// ====== 浏览器历史记录 ======
async function loadBrowserHistory() {
    try {
        // 获取历史记录
        const historyItems = await chrome.history.search({
            text: '',
            maxResults: 2000,
            startTime: 0
        });
        
        browserHistory = historyItems.map(item => ({
            title: item.title || item.url,
            url: item.url,
            lastVisitTime: new Date(item.lastVisitTime),
            visitCount: item.visitCount || 0,
            typedCount: item.typedCount || 0,
            source: 'history'
        }));
        
        // 获取收藏夹
        const bookmarkTree = await chrome.bookmarks.getTree();
        browserBookmarks = extractBookmarks(bookmarkTree);
        
        return browserHistory;
    } catch (error) {
        console.error('获取浏览器数据失败:', error);
        return [];
    }
}

function extractBookmarks(bookmarkNodes, folderPath = '') {
    let result = [];
    
    for (const node of bookmarkNodes) {
        if (node.children) {
            const currentPath = folderPath ? `${folderPath} > ${node.title}` : node.title;
            result = result.concat(extractBookmarks(node.children, currentPath));
        } else if (node.url) {
            result.push({
                title: node.title,
                url: node.url,
                folder: folderPath || '根目录',
                dateAdded: node.dateAdded ? new Date(node.dateAdded) : null
            });
        }
    }
    
    return result;
}

function formatTimeAgo(date) {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return '刚刚';
    if (diffMins < 60) return `${diffMins}分钟前`;
    if (diffHours < 24) return `${diffHours}小时前`;
    if (diffDays < 30) return `${diffDays}天前`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)}个月前`;
    return `${Math.floor(diffDays / 365)}年前`;
}

// ====== 搜索栏渲染 ======
async function renderSearchBars() {
    const container = document.getElementById('search_bar_container');
    container.innerHTML = '';

    const enabledBars = searchBarData.filter(bar => bar.enabled);

    // 渲染现有的搜索框
    enabledBars.forEach((bar, index) => {
        const barDiv = document.createElement('div');
        barDiv.className = 'search-bar-container';

        const input = document.createElement('input');
        input.className = 'search-input';
        input.type = 'text';
        input.placeholder = bar.hint;
        input.dataset.index = index;

        const button = document.createElement('button');
        button.className = 'search-button';
        button.textContent = bar.buttonText;
        button.dataset.index = index;
        button.title = bar.hint;

        barDiv.appendChild(input);
        barDiv.appendChild(button);
        container.appendChild(barDiv);
    });

    // 添加历史记录搜索框
    const historyBarDiv = document.createElement('div');
    historyBarDiv.className = 'search-bar-container';
    historyBarDiv.id = 'history-search-bar';

    const historyInput = document.createElement('input');
    historyInput.className = 'search-input';
    historyInput.type = 'text';
    historyInput.id = 'history-search-input';
    historyInput.placeholder = '搜索历史记录和收藏夹';

    const historyButton = document.createElement('button');
    historyButton.className = 'search-button search-button-disabled';
    historyButton.textContent = '历史记录';
    historyButton.title = '搜索浏览器历史记录和收藏夹，支持筛选器语法';
    historyButton.disabled = true;

    historyBarDiv.appendChild(historyInput);
    historyBarDiv.appendChild(historyButton);
    container.appendChild(historyBarDiv);

    // 加载浏览器历史记录
    await loadBrowserHistory();
    
    attachSearchBarEvents();
    attachHistorySearchEvents();
}

function attachSearchBarEvents() {
    const inputs = document.querySelectorAll('.search-input:not(#history-search-input)');
    const buttons = document.querySelectorAll('.search-button:not(.search-button-disabled)');
    const historyInput = document.getElementById('history-search-input');
    
    // 创建包含所有输入框的数组（用于Tab切换）
    const allInputs = [...inputs, historyInput];

    // 搜索功能
    buttons.forEach((button, index) => {
        button.addEventListener('click', () => {
            const input = inputs[index];
            performSearch(input.value.trim(), index);
        });
    });

    // 回车搜索和Tab切换
    inputs.forEach((input, index) => {
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                performSearch(input.value.trim(), index);
            } else if (e.key === 'Tab') {
                e.preventDefault();
                const currentIndexInAll = allInputs.indexOf(input);
                const nextIndex = (currentIndexInAll + 1) % allInputs.length;
                allInputs[nextIndex].focus();
            }
        });

        // 获得焦点时隐藏历史搜索结果
        input.addEventListener('focus', () => {
            hideHistoryResults();
            showCardsSection();
        });

        // 输入同步 - 同步到所有输入框（包括历史搜索框）
        if (syncSearchBar) {
            input.addEventListener('input', (e) => {
                const value = e.target.value;
                allInputs.forEach((otherInput) => {
                    if (otherInput !== input) {
                        otherInput.value = value;
                    }
                });
            });
        }
    });
}

// 历史记录搜索事件
function attachHistorySearchEvents() {
    const historyInput = document.getElementById('history-search-input');
    const historyResultsContainer = createHistoryResultsContainer();
    const inputs = document.querySelectorAll('.search-input:not(#history-search-input)');
    const allInputs = [...inputs, historyInput];
    
    if (!historyInput) return;

    const updateResults = () => {
        const query = historyInput.value.trim();
        
        if (query === '') {
            hideHistoryResults();
            showCardsSection();
        } else {
            // 合并所有数据源
            const allItems = [...browserHistory, ...browserBookmarks];
            
            // 直接使用 filterItems 筛选
            const results = filterItems(query, allItems);
            
            renderHistoryResults(results);
            showHistoryResults();
            hideCardsSection();
        }
    };

    // 输入同步 - 同步到所有输入框
    if (syncSearchBar) {
        historyInput.addEventListener('input', (e) => {
            const value = e.target.value;
            allInputs.forEach((otherInput) => {
                if (otherInput !== historyInput) {
                    otherInput.value = value;
                }
            });
            updateResults();
        });
    } else {
        historyInput.addEventListener('input', updateResults);
    }

    // Tab键切换到下一个输入框
    historyInput.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            e.preventDefault();
            const currentIndexInAll = allInputs.indexOf(historyInput);
            const nextIndex = (currentIndexInAll + 1) % allInputs.length;
            allInputs[nextIndex].focus();
        } else if (e.key === 'Escape') {
            historyInput.blur();
            hideHistoryResults();
            showCardsSection();
        }
    });

    // 焦点事件：获得焦点时显示搜索结果（如果有内容）
    historyInput.addEventListener('focus', () => {
        if (historyInput.value.trim() !== '') {
            updateResults();
        } else {
            hideHistoryResults();
            hideCardsSection();
        }
    });
}

// 创建历史记录结果容器
function createHistoryResultsContainer() {
    let container = document.getElementById('history-results-container');
    
    if (!container) {
        container = document.createElement('div');
        container.id = 'history-results-container';
        container.style.display = 'none';
        
        const cardsSection = document.getElementById('cards-section');
        if (cardsSection && cardsSection.parentNode) {
            cardsSection.parentNode.insertBefore(container, cardsSection);
        }
    }
    
    return container;
}

// 渲染历史记录结果
function renderHistoryResults(results) {
    const container = document.getElementById('history-results-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (results.length === 0) {
        const emptyDiv = document.createElement('div');
        emptyDiv.className = 'history-results-empty';
        emptyDiv.textContent = '无匹配的记录';
        container.appendChild(emptyDiv);
        return;
    }

    const listDiv = document.createElement('div');
    listDiv.className = 'history-results-list';

    results.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'history-result-item';
        
        // 图标
        const favicon = document.createElement('img');
        favicon.className = 'history-result-favicon';
        
        try {
            const faviconUrl = new URL(chrome.runtime.getURL("/_favicon/"));
            faviconUrl.searchParams.set("pageUrl", item.url);
            faviconUrl.searchParams.set("size", "32");
            favicon.src = faviconUrl.toString();
        } catch (e) {
            favicon.src = `chrome://favicon/${item.url}`;
        }
        
        favicon.onerror = function() {
            this.style.display = 'none';
        };
        
        // 内容区域
        const contentDiv = document.createElement('div');
        contentDiv.className = 'history-result-content';
        
        // 标题行（包含标题和元信息）
        const titleRowDiv = document.createElement('div');
        titleRowDiv.className = 'history-result-title-row';
        
        const titleDiv = document.createElement('div');
        titleDiv.className = 'history-result-title';
        titleDiv.textContent = item.title;
        
        const metaRightDiv = document.createElement('div');
        metaRightDiv.className = 'history-result-meta-right';
        
        // 根据来源显示不同的信息
        if (item.source === 'bookmark') {
            // 收藏夹项
            const sourceIcon = document.createElement('span');
            sourceIcon.className = 'history-result-source-icon';
            sourceIcon.textContent = '📑';
            sourceIcon.title = '收藏夹';
            metaRightDiv.appendChild(sourceIcon);
        } else if (item.source === 'history') {
            // 历史记录项 - 显示访问次数和时间
            if (item.visitCount > 0) {
                const visitSpan = document.createElement('span');
                visitSpan.className = 'history-result-visits';
                visitSpan.textContent = `访问${item.visitCount}次`;
                metaRightDiv.appendChild(visitSpan);
            }
            
            if (item.lastVisitTime) {
                const timeSpan = document.createElement('span');
                timeSpan.className = 'history-result-time';
                timeSpan.textContent = formatTimeAgo(item.lastVisitTime);
                metaRightDiv.appendChild(timeSpan);
            }
        }
        
        titleRowDiv.appendChild(titleDiv);
        titleRowDiv.appendChild(metaRightDiv);
        
        // URL和文件夹信息行
        const urlDiv = document.createElement('div');
        urlDiv.className = 'history-result-url';
        
        if (item.source === 'bookmark' && item.folder) {
            urlDiv.innerHTML = `<span class="history-result-folder">📁 ${item.folder}</span> · ${item.url}`;
        } else {
            urlDiv.textContent = item.url;
        }
        
        contentDiv.appendChild(titleRowDiv);
        contentDiv.appendChild(urlDiv);
        
        itemDiv.appendChild(favicon);
        itemDiv.appendChild(contentDiv);
        
        // 点击事件
        itemDiv.addEventListener('click', () => {
            if (openInNewTab) {
                window.open(item.url, '_blank');
            } else {
                window.open(item.url, '_self');
            }
        });
        
        listDiv.appendChild(itemDiv);
    });

    container.appendChild(listDiv);
}

// 显示/隐藏历史记录结果
function showHistoryResults() {
    const container = document.getElementById('history-results-container');
    if (container) {
        container.style.display = 'block';
    }
}

function hideHistoryResults() {
    const container = document.getElementById('history-results-container');
    if (container) {
        container.style.display = 'none';
    }
}

function hideCardsSection() {
    const cardsSection = document.getElementById('cards-section');
    if (cardsSection) {
        cardsSection.style.display = 'none';
    }
}

function showCardsSection() {
    const cardsSection = document.getElementById('cards-section');
    if (cardsSection) {
        cardsSection.style.display = 'block';
    }
}

function performSearch(query, index) {
    if (!query) return;

    const enabledBars = searchBarData.filter(bar => bar.enabled);
    const searchConfig = enabledBars[index];

    if (!searchConfig) return;

    const url = searchConfig.query.replace('{}', encodeURIComponent(query));

    if (openInNewTab) {
        window.open(url, '_blank');
    } else {
        window.open(url, '_self');
    }
}

// ====== 设置模态框 ======
function showSearchSettingsModal() {
    editingConfigs = JSON.parse(JSON.stringify(searchBarData));
    renderConfigList();
    document.getElementById('search-settings-modal').style.display = 'flex';
}

function hideSearchSettingsModal() {
    document.getElementById('search-settings-modal').style.display = 'none';
}

function renderConfigList() {
    const configList = document.getElementById('config-list');
    configList.innerHTML = '';

    editingConfigs.forEach((config, index) => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'search-config-item';

        // 启用复选框
        const enableCheckbox = document.createElement('input');
        enableCheckbox.type = 'checkbox';
        enableCheckbox.className = 'search-config-item-checkbox';
        enableCheckbox.checked = config.enabled;
        enableCheckbox.addEventListener('change', (e) => {
            editingConfigs[index].enabled = e.target.checked;
        });

        // 按钮文字输入
        const buttonTextInput = document.createElement('input');
        buttonTextInput.type = 'text';
        buttonTextInput.className = 'search-config-item-button-text';
        buttonTextInput.value = config.buttonText;
        buttonTextInput.placeholder = "按钮的文字";
        buttonTextInput.addEventListener('input', (e) => {
            editingConfigs[index].buttonText = e.target.value;
        });

        // URL 标签
        const urlLabel = document.createElement('label');
        urlLabel.textContent = "网址：";
        urlLabel.className = 'search-config-item-label';

        // URL 输入
        const queryInput = document.createElement('input');
        queryInput.type = 'text';
        queryInput.className = 'search-config-item-query';
        queryInput.value = config.query;
        queryInput.placeholder = '必须要带有"{}"，表示替换的字符';
        queryInput.title = '网址中必须包含"{}"，用于替换为搜索词';
        queryInput.addEventListener('input', (e) => {
            editingConfigs[index].query = e.target.value;
        });

        // 上移按钮
        const upButton = document.createElement('button');
        upButton.className = 'config-item-button';
        upButton.innerHTML = SVG_UP;
        upButton.addEventListener('click', () => moveItem(index, -1));

        // 删除按钮
        const deleteButton = document.createElement('button');
        deleteButton.className = 'config-item-button';
        deleteButton.innerHTML = SVG_DELETE;
        deleteButton.addEventListener('click', () => deleteItem(index));

        // 下移按钮
        const downButton = document.createElement('button');
        downButton.className = 'config-item-button';
        downButton.innerHTML = SVG_DOWN;
        downButton.addEventListener('click', () => moveItem(index, 1));

        itemDiv.appendChild(enableCheckbox);
        itemDiv.appendChild(buttonTextInput);
        itemDiv.appendChild(urlLabel);
        itemDiv.appendChild(queryInput);
        itemDiv.appendChild(upButton);
        itemDiv.appendChild(deleteButton);
        itemDiv.appendChild(downButton);

        configList.appendChild(itemDiv);
    });
}

function moveItem(index, direction) {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= editingConfigs.length) return;

    const temp = editingConfigs[index];
    editingConfigs[index] = editingConfigs[newIndex];
    editingConfigs[newIndex] = temp;

    renderConfigList();
}

function deleteItem(index) {
    editingConfigs.splice(index, 1);
    renderConfigList();
}

function addItem() {
    editingConfigs.push({
        hint: "",
        buttonText: "",
        query: "",
        enabled: true,
    });
    renderConfigList();
}

function saveConfig() {
    // 验证配置
    for (let i = 0; i < editingConfigs.length; i++) {
        if (editingConfigs[i].query.indexOf("{}") === -1) {
            alert(`第${i + 1}个配置的网址中没有"{}"！`);
            return;
        }
    }

    // 更新 hint
    editingConfigs.forEach(item => {
        const baseHint = `搜索 ${item.buttonText}`.trim();
        item.hint = baseHint;
    });

    // 保存配置
    searchBarData = JSON.parse(JSON.stringify(editingConfigs));
    saveSearchBarData(searchBarData);

    // 重新渲染搜索栏
    renderSearchBars();

    // 关闭模态框
    hideSearchSettingsModal();
}

function resetConfig() {
    if (confirm("确定要重置为默认配置吗？")) {
        editingConfigs = JSON.parse(JSON.stringify(DEFAULT_SEARCH_BAR_DATA));
        renderConfigList();
    }
}

// ====== 初始化 ======
export function initSearchSettings() {
    // 渲染搜索栏
    renderSearchBars();

    // 绑定设置按钮
    document.getElementById('search-settings-button').addEventListener('click', showSearchSettingsModal);
    
    // 绑定搜索设置模态框事件
    document.getElementById('close-search-settings').addEventListener('click', hideSearchSettingsModal);
    // 移除点击外部关闭功能
    // document.getElementById('search-settings-modal').addEventListener('click', (e) => {
    //     if (e.target.id === 'search-settings-modal') {
    //         hideSearchSettingsModal();
    //     }
    // });

    // 绑定设置面板按钮
    document.getElementById('save-button').addEventListener('click', saveConfig);
    document.getElementById('add-button').addEventListener('click', addItem);
    document.getElementById('reset-button').addEventListener('click', resetConfig);

    // 绑定其他设置
    const openInNewTabCheckbox = document.getElementById('openInNewTabCheckbox');
    openInNewTabCheckbox.checked = openInNewTab;
    openInNewTabCheckbox.addEventListener('change', (e) => {
        openInNewTab = e.target.checked;
        saveOpenInNewTab(openInNewTab);
    });

    const syncSearchBarCheckbox = document.getElementById('syncSearchBarCheckbox');
    syncSearchBarCheckbox.checked = syncSearchBar;
    syncSearchBarCheckbox.addEventListener('change', (e) => {
        syncSearchBar = e.target.checked;
        saveSyncSearchBar(syncSearchBar);
        // 重新渲染搜索栏以应用同步设置
        renderSearchBars();
    });
    
    // 绑定ESC键关闭搜索设置模态框
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const searchSettingsModal = document.getElementById('search-settings-modal');
            if (searchSettingsModal && searchSettingsModal.style.display === 'block') {
                hideSearchSettingsModal();
            }
        }
    });
}

// ====== 导出 ======
export function getOpenInNewTab() {
    return openInNewTab;
}

