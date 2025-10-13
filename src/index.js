// ====== 导入筛选解析器 ======
import { FilterParser, filterItems } from './filterParser.js';

// ====== 默认配置 ======
const DEFAULT_SEARCH_BAR_DATA = [
    {
        buttonText: "百度一下",
        hint: "Search 百度一下",
        query: "https://www.baidu.com/s?wd={}",
        enabled: true,
    },
    {
        buttonText: "Google",
        hint: "Search Google",
        query: "https://www.google.com/search?q={}",
        enabled: true,
    },
    {
        buttonText: "Bing",
        hint: "Search Bing",
        query: "https://www.bing.com/search?q={}",
        enabled: false,
    },
    {
        buttonText: "YouTube",
        hint: "Search YouTube",
        query: "https://www.youtube.com/results?search_query={}",
        enabled: false,
    },
    {
        buttonText: "Wikipedia",
        hint: "Search Wikipedia",
        query: "https://en.wikipedia.org/w/index.php?search={}",
        enabled: false,
    },
    {
        buttonText: "学术搜索",
        hint: "Search 百度学术",
        query: "https://xueshu.baidu.com/s?wd={}",
        enabled: false,
    },
    {
        buttonText: "Scholar",
        hint: "Search Google Scholar",
        query: "https://scholar.google.com/scholar?q={}",
        enabled: false,
    },
    {
        buttonText: "Github",
        hint: "Search Github",
        query: "https://github.com/search?q={}",
        enabled: false,
    },
    {
        buttonText: "Stack Overflow",
        hint: "Search Stack Overflow",
        query: "https://stackoverflow.com/search?q={}",
        enabled: false,
    },
    {
        buttonText: "知乎",
        hint: "Search 知乎",
        query: "https://www.zhihu.com/search?type=content&q={}",
        enabled: false,
    },
    {
        buttonText: "豆瓣",
        hint: "Search 豆瓣",
        query: "https://www.douban.com/search?q={}",
        enabled: false,
    },
    {
        buttonText: "微博",
        hint: "Search 微博",
        query: "https://s.weibo.com/weibo/{}",
        enabled: false,
    },
    {
        buttonText: "Twitter",
        hint: "Search Twitter",
        query: "https://twitter.com/search?q={}",
        enabled: false,
    },
    {
        buttonText: "Facebook",
        hint: "Search Facebook",
        query: "https://www.facebook.com/search/top/?q={}",
        enabled: false,
    },
    {
        buttonText: "Instagram",
        hint: "Search Instagram",
        query: "https://www.instagram.com/explore/tags/{}",
        enabled: false,
    },
    {
        buttonText: "Reddit",
        hint: "Search Reddit",
        query: "https://www.reddit.com/search?q={}",
        enabled: false,
    },
];

// ====== 国际化 ======
const TRANSLATIONS = {
    en: {
        save: "Save",
        add: "Add",
        reset: "Reset",
        buttonText: "Button Text",
        url: "URL:",
        openInNewTab: "Open in new tab",
        syncSearchBar: "Same input in all search bars",
    },
    zh: {
        save: "完成",
        add: "添加",
        reset: "重置",
        buttonText: "按钮的文字",
        url: "网址：",
        openInNewTab: "在新标签页打开",
        syncSearchBar: "输入同步",
    }
};

// ====== 工具函数 ======
function getLanguage() {
    const chosenLanguage = localStorage.getItem('lang');
    if (chosenLanguage) return chosenLanguage;
    const language = navigator.language.split(/[-_]/)[0];
    localStorage.setItem('lang', language);
    return language;
}

function setLanguage(lang) {
    localStorage.setItem('lang', lang);
    currentLanguage = lang;
    updateUILanguage();
}

function t(key) {
    return TRANSLATIONS[currentLanguage]?.[key] || TRANSLATIONS['en'][key] || key;
}

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

function loadCardsConfig() {
    const data = localStorage.getItem("cardsConfig");
    if (data) {
        return JSON.parse(data);
    }
    // 默认配置
    return [
        {
            id: generateCardId(),
            title: "常用收藏夹",
            types: ["bookmarks"], // 改为数组
            filter: "",
            folderFilter: "",
            maxItems: 10
        },
        {
            id: generateCardId(),
            title: "最近访问",
            types: ["history"], // 改为数组
            filter: "",
            historyDays: 7,
            maxItems: 10
        }
    ];
}

function saveCardsConfig(config) {
    localStorage.setItem("cardsConfig", JSON.stringify(config));
}

function loadLayoutConfig() {
    const data = localStorage.getItem("layoutConfig");
    if (data) {
        return JSON.parse(data);
    }
    return { cardsPerRow: 2, cardHeight: 250 }; // 默认高度从300改为250
}

function saveLayoutConfig(config) {
    localStorage.setItem("layoutConfig", JSON.stringify(config));
}

function generateCardId() {
    return 'card_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

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

// ====== 全局状态 ======
let currentLanguage = getLanguage();
let searchBarData = loadSearchBarData();
let openInNewTab = loadOpenInNewTab();
let syncSearchBar = loadSyncSearchBar();
let isEditing = false;
let editingConfigs = [];
let allBookmarks = [];
let allHistory = [];
let cardsConfig = [];
let layoutConfig = { cardsPerRow: 2, cardHeight: 250 };
let currentEditingCardId = null;

// ====== 搜索栏渲染 ======
function renderSearchBars() {
    const container = document.getElementById('search_bar_container');
    container.innerHTML = '';

    const enabledBars = searchBarData.filter(bar => bar.enabled);

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

        barDiv.appendChild(input);
        barDiv.appendChild(button);
        container.appendChild(barDiv);
    });

    attachSearchBarEvents();
}

function attachSearchBarEvents() {
    const inputs = document.querySelectorAll('.search-input');
    const buttons = document.querySelectorAll('.search-button');

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
                const nextIndex = (index + 1) % inputs.length;
                inputs[nextIndex].focus();
            }
        });

        // 输入同步
        if (syncSearchBar) {
            input.addEventListener('input', (e) => {
                const value = e.target.value;
                inputs.forEach((otherInput, otherIndex) => {
                    if (otherIndex !== index) {
                        otherInput.value = value;
                    }
                });
            });
        }
    });

    // 自动聚焦第一个输入框
    if (inputs.length > 0) {
        setTimeout(() => inputs[0].focus(), 100);
    }
}

function performSearch(query, index) {
    if (!query) return;

    const enabledBars = searchBarData.filter(bar => bar.enabled);
    if (index >= enabledBars.length) return;

    const searchUrl = enabledBars[index].query.replace("{}", encodeURIComponent(query));

    if (openInNewTab) {
        window.open(searchUrl, "_blank");
    } else {
        window.open(searchUrl, "_self");
    }
}

// ====== 搜索栏设置模态框 ======
function showSearchSettingsModal() {
    document.getElementById('search-settings-modal').style.display = 'block';
    // 初始化编辑配置
    editingConfigs = JSON.parse(JSON.stringify(searchBarData));
    renderConfigList();
}

function hideSearchSettingsModal() {
    document.getElementById('search-settings-modal').style.display = 'none';
}

// ====== 设置面板 ======
function toggleEditMode() {
    // 已废弃，保留用于兼容
    showSearchSettingsModal();
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
        enableCheckbox.checked = config.enabled;
        enableCheckbox.addEventListener('change', (e) => {
            editingConfigs[index].enabled = e.target.checked;
        });

        // 按钮文字输入
        const buttonTextInput = document.createElement('input');
        buttonTextInput.type = 'text';
        buttonTextInput.className = 'search-config-item-button-text';
        buttonTextInput.value = config.buttonText;
        buttonTextInput.placeholder = t('buttonText');
        buttonTextInput.addEventListener('input', (e) => {
            editingConfigs[index].buttonText = e.target.value;
        });

        // URL 标签
        const urlLabel = document.createElement('label');
        urlLabel.textContent = t('url');
        urlLabel.className = 'search-config-item-label';

        // URL 输入
        const queryInput = document.createElement('input');
        queryInput.type = 'text';
        queryInput.className = 'search-config-item-query';
        queryInput.value = config.query;
        queryInput.placeholder = '必须要带有"{}"，表示替换的字符';
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
        item.hint = `Search ${item.buttonText}`;
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
    if (confirm('确定要重置为默认配置吗？')) {
        editingConfigs = JSON.parse(JSON.stringify(DEFAULT_SEARCH_BAR_DATA));
        renderConfigList();
    }
}

// ====== 数据加载功能 ======
async function loadAllData() {
    await Promise.all([loadBookmarks(), loadHistory()]);
    renderAllCards();
}

async function loadBookmarks() {
    try {
        if (typeof chrome !== 'undefined' && chrome.bookmarks) {
            const bookmarks = await chrome.bookmarks.getTree();
            allBookmarks = extractBookmarks(bookmarks);
        } else {
            console.warn('Chrome bookmarks API not available');
        }
    } catch (error) {
        console.error('Error loading bookmarks:', error);
    }
}

async function loadHistory() {
    try {
        if (typeof chrome !== 'undefined' && chrome.history) {
            const historyItems = await chrome.history.search({
                text: '',
                startTime: 0,
                maxResults: 2000
            });
            
            allHistory = historyItems.map(item => ({
                title: item.title || item.url,
                url: item.url,
                visitCount: item.visitCount,
                lastVisitTime: new Date(item.lastVisitTime),
                typedCount: item.typedCount
            }));
            
            // 按最后访问时间降序排序
            allHistory.sort((a, b) => b.lastVisitTime - a.lastVisitTime);
        } else {
            console.warn('Chrome history API not available');
        }
    } catch (error) {
        console.error('Error loading history:', error);
    }
}

function extractBookmarks(bookmarkNodes, folderPath = '') {
    let result = [];
    
    for (const node of bookmarkNodes) {
        if (node.children) {
            // 这是一个文件夹
            const currentPath = folderPath ? `${folderPath} > ${node.title}` : node.title;
            result = result.concat(extractBookmarks(node.children, currentPath));
        } else if (node.url) {
            // 这是一个书签
            result.push({
                title: node.title,
                url: node.url,
                folder: folderPath || '根目录'
            });
        }
    }
    
    return result;
}

// ====== 卡片渲染功能 ======
function renderAllCards() {
    const container = document.getElementById('cards-container');
    container.innerHTML = '';
    
    if (cardsConfig.length === 0) {
        container.innerHTML = '<div class="empty-message">暂无卡片，点击"添加卡片"开始创建</div>';
        return;
    }
    
    // 创建卡片网格
    const cardsGrid = document.createElement('div');
    cardsGrid.className = 'cards-grid';
    cardsGrid.style.gridTemplateColumns = `repeat(${layoutConfig.cardsPerRow}, 1fr)`;
    
    cardsConfig.forEach(cardConfig => {
        const cardElement = createCardElement(cardConfig);
        cardsGrid.appendChild(cardElement);
    });
    
    container.appendChild(cardsGrid);
}

function createCardElement(cardConfig) {
    const card = document.createElement('div');
    card.className = 'content-card';
    card.style.height = `${layoutConfig.cardHeight}px`;
    
    // 卡片头部
    const cardHeader = document.createElement('div');
    cardHeader.className = 'card-header';
    
    const cardTitle = document.createElement('h4');
    cardTitle.className = 'card-title';
    cardTitle.textContent = cardConfig.title;
    
    const cardActions = document.createElement('div');
    cardActions.className = 'card-actions';
    
    const duplicateButton = document.createElement('button');
    duplicateButton.className = 'card-action-button';
    duplicateButton.innerHTML = '📋';
    duplicateButton.title = '复制卡片';
    duplicateButton.addEventListener('click', () => duplicateCard(cardConfig.id));
    
    const editButton = document.createElement('button');
    editButton.className = 'card-action-button';
    editButton.innerHTML = '⚙️';
    editButton.title = '编辑卡片';
    editButton.addEventListener('click', () => editCard(cardConfig.id));
    
    const deleteButton = document.createElement('button');
    deleteButton.className = 'card-action-button';
    deleteButton.innerHTML = '🗑️';
    deleteButton.title = '删除卡片';
    deleteButton.addEventListener('click', () => deleteCard(cardConfig.id));
    
    cardActions.appendChild(duplicateButton);
    cardActions.appendChild(editButton);
    cardActions.appendChild(deleteButton);
    
    cardHeader.appendChild(cardTitle);
    cardHeader.appendChild(cardActions);
    
    // 卡片内容
    const cardContent = document.createElement('div');
    cardContent.className = 'card-content';
    
    renderCardContent(cardContent, cardConfig);
    
    card.appendChild(cardHeader);
    card.appendChild(cardContent);
    
    return card;
}

function renderCardContent(container, cardConfig) {
    const items = getFilteredItems(cardConfig);
    
    if (items.length === 0) {
        container.innerHTML = '<div class="card-empty">暂无内容</div>';
        return;
    }
    
    const itemsList = document.createElement('div');
    itemsList.className = 'card-items-list';
    
    const types = cardConfig.types || (cardConfig.type ? [cardConfig.type] : []);
    
    items.slice(0, cardConfig.maxItems).forEach(item => {
        const itemElement = createItemElement(item, types);
        itemsList.appendChild(itemElement);
    });
    
    container.innerHTML = '';
    container.appendChild(itemsList);
}

function createItemElement(item, types) {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'card-item';
    
    const favicon = document.createElement('img');
    favicon.className = 'card-item-favicon';
    
    try {
        const hostname = new URL(item.url).hostname;
        // 使用 Google favicon 服务，但浏览器会自动缓存这些请求
        // 多个相同域名的图标会使用缓存，不会重复请求
        favicon.src = `https://www.google.com/s2/favicons?domain=${hostname}&sz=32`;
    } catch (e) {
        // 如果 URL 解析失败，隐藏图标
        favicon.style.display = 'none';
    }
    
    favicon.onerror = () => {
        favicon.style.display = 'none';
    };
    
    const itemInfo = document.createElement('div');
    itemInfo.className = 'card-item-info';
    
    const title = document.createElement('div');
    title.className = 'card-item-title';
    title.textContent = item.title || item.url;
    title.title = item.title || item.url;
    
    const meta = document.createElement('div');
    meta.className = 'card-item-meta';
    
    // 根据数据源类型显示不同的元信息
    if (item.folder) {
        // 来自收藏夹
        meta.textContent = `📑 ${item.folder}`;
    } else if (item.lastVisitTime) {
        // 来自历史记录
        const timeStr = formatTimeAgo(item.lastVisitTime);
        meta.textContent = `🕒 访问${item.visitCount}次 · ${timeStr}`;
    }
    
    itemInfo.appendChild(title);
    itemInfo.appendChild(meta);
    
    itemDiv.appendChild(favicon);
    itemDiv.appendChild(itemInfo);
    
    // 点击事件
    itemDiv.addEventListener('click', () => {
        if (openInNewTab) {
            window.open(item.url, '_blank');
        } else {
            window.open(item.url, '_self');
        }
    });
    
    return itemDiv;
}

function getFilteredItems(cardConfig) {
    let items = [];
    
    // 支持旧版本单一 type 字段
    const types = cardConfig.types || (cardConfig.type ? [cardConfig.type] : []);
    
    // 从选中的数据源收集数据
    if (types.includes('bookmarks')) {
        let bookmarkItems = [...allBookmarks];
        
        // 文件夹筛选
        if (cardConfig.folderFilter) {
            const folderFilter = cardConfig.folderFilter.toLowerCase();
            bookmarkItems = bookmarkItems.filter(item => 
                item.folder && item.folder.toLowerCase().includes(folderFilter)
            );
        }
        
        items = items.concat(bookmarkItems);
    }
    
    if (types.includes('history')) {
        let historyItems = [...allHistory];
        
        // 时间筛选
        if (cardConfig.historyDays && cardConfig.historyDays > 0) {
            const cutoffTime = Date.now() - (cardConfig.historyDays * 24 * 60 * 60 * 1000);
            historyItems = historyItems.filter(item => item.lastVisitTime.getTime() >= cutoffTime);
        }
        
        items = items.concat(historyItems);
    }
    
    // 去重（同一个 URL 可能既在收藏夹又在历史记录中）
    const uniqueItems = [];
    const seenUrls = new Set();
    
    for (const item of items) {
        if (!seenUrls.has(item.url)) {
            seenUrls.add(item.url);
            uniqueItems.push(item);
        }
    }
    
    items = uniqueItems;
    
    // 关键词筛选 - 使用新的筛选解析器
    if (cardConfig.filter) {
        items = filterItems(cardConfig.filter, items);
    }
    
    return items;
}

function formatTimeAgo(date) {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 1) return '刚刚';
    if (diffMins < 60) return `${diffMins}分钟前`;
    if (diffHours < 24) return `${diffHours}小时前`;
    if (diffDays < 7) return `${diffDays}天前`;
    
    return date.toLocaleDateString('zh-CN');
}

// ====== 卡片管理功能 ======
function addCard() {
    currentEditingCardId = null;
    clearCardConfigForm();
    showCardConfigModal('添加卡片');
}

function duplicateCard(cardId) {
    const cardConfig = cardsConfig.find(c => c.id === cardId);
    if (!cardConfig) return;
    
    // 创建副本
    const duplicatedCard = {
        ...cardConfig,
        id: generateCardId(),
        title: `${cardConfig.title} (副本)`
    };
    
    cardsConfig.push(duplicatedCard);
    saveCardsConfig(cardsConfig);
    renderAllCards();
}

function editCard(cardId) {
    currentEditingCardId = cardId;
    const cardConfig = cardsConfig.find(c => c.id === cardId);
    if (!cardConfig) return;
    
    fillCardConfigForm(cardConfig);
    showCardConfigModal('编辑卡片');
}

function deleteCard(cardId) {
    if (confirm('确定要删除这个卡片吗？')) {
        cardsConfig = cardsConfig.filter(c => c.id !== cardId);
        saveCardsConfig(cardsConfig);
        renderAllCards();
    }
}

function showCardConfigModal(title) {
    document.getElementById('modal-title').textContent = title;
    document.getElementById('card-config-modal').style.display = 'block';
}

function hideCardConfigModal() {
    document.getElementById('card-config-modal').style.display = 'none';
}

function clearCardConfigForm() {
    document.getElementById('card-title').value = '';
    document.getElementById('card-type-bookmarks').checked = false;
    document.getElementById('card-type-history').checked = false;
    document.getElementById('card-filter').value = '';
    document.getElementById('card-folder-filter').value = '';
    document.getElementById('card-history-days').value = '7';
    document.getElementById('card-max-items').value = '10';
    toggleCardTypeFields();
}

function fillCardConfigForm(cardConfig) {
    document.getElementById('card-title').value = cardConfig.title || '';
    
    // 支持旧版本单一 type 字段
    const types = cardConfig.types || (cardConfig.type ? [cardConfig.type] : []);
    document.getElementById('card-type-bookmarks').checked = types.includes('bookmarks');
    document.getElementById('card-type-history').checked = types.includes('history');
    
    document.getElementById('card-filter').value = cardConfig.filter || '';
    document.getElementById('card-folder-filter').value = cardConfig.folderFilter || '';
    document.getElementById('card-history-days').value = cardConfig.historyDays || '7';
    document.getElementById('card-max-items').value = cardConfig.maxItems || '10';
    toggleCardTypeFields();
}

function toggleCardTypeFields() {
    const bookmarksChecked = document.getElementById('card-type-bookmarks').checked;
    const historyChecked = document.getElementById('card-type-history').checked;
    const historyField = document.getElementById('history-time-field');
    const bookmarksField = document.getElementById('bookmarks-folder-field');
    
    // 显示/隐藏相关字段
    historyField.style.display = historyChecked ? 'block' : 'none';
    bookmarksField.style.display = bookmarksChecked ? 'block' : 'none';
}

function saveCardConfig() {
    const title = document.getElementById('card-title').value.trim();
    
    // 获取选中的数据源
    const types = [];
    if (document.getElementById('card-type-bookmarks').checked) {
        types.push('bookmarks');
    }
    if (document.getElementById('card-type-history').checked) {
        types.push('history');
    }
    
    const filter = document.getElementById('card-filter').value.trim();
    const folderFilter = document.getElementById('card-folder-filter').value.trim();
    const historyDays = parseInt(document.getElementById('card-history-days').value);
    const maxItems = parseInt(document.getElementById('card-max-items').value);
    
    if (!title) {
        alert('请输入卡片标题');
        return;
    }
    
    if (types.length === 0) {
        alert('请至少选择一个数据来源');
        return;
    }
    
    // 验证筛选器语法
    if (filter) {
        const validation = FilterParser.validate(filter);
        if (!validation.valid) {
            alert(`筛选语法错误: ${validation.error}`);
            return;
        }
    }
    
    const cardConfig = {
        id: currentEditingCardId || generateCardId(),
        title,
        types, // 使用 types 数组而不是单个 type
        filter,
        folderFilter,
        historyDays,
        maxItems
    };
    
    if (currentEditingCardId) {
        // 编辑现有卡片
        const index = cardsConfig.findIndex(c => c.id === currentEditingCardId);
        if (index !== -1) {
            cardsConfig[index] = cardConfig;
        }
    } else {
        // 添加新卡片
        cardsConfig.push(cardConfig);
    }
    
    saveCardsConfig(cardsConfig);
    renderAllCards();
    hideCardConfigModal();
}

// ====== 布局设置功能 ======
function showLayoutConfigModal() {
    document.getElementById('cards-per-row').value = layoutConfig.cardsPerRow;
    document.getElementById('card-height').value = layoutConfig.cardHeight;
    document.getElementById('layout-config-modal').style.display = 'block';
}

function hideLayoutConfigModal() {
    document.getElementById('layout-config-modal').style.display = 'none';
}

function saveLayoutConfigFromModal() {
    const cardsPerRow = parseInt(document.getElementById('cards-per-row').value);
    const cardHeight = parseInt(document.getElementById('card-height').value);
    
    layoutConfig = { cardsPerRow, cardHeight };
    saveLayoutConfig(layoutConfig);
    renderAllCards();
    hideLayoutConfigModal();
}

// ====== UI 语言更新 ======
function updateUILanguage() {
    // 更新按钮文字
    document.getElementById('save-button').textContent = t('save');
    document.getElementById('add-button').textContent = t('add');
    document.getElementById('reset-button').textContent = t('reset');
    document.getElementById('language-button').textContent = currentLanguage === 'zh' ? 'English' : '中文';
    document.getElementById('openInNewTabLabel').textContent = t('openInNewTab');
    document.getElementById('syncSearchBarLabel').textContent = t('syncSearchBar');
}

// ====== 初始化 ======
window.addEventListener('DOMContentLoaded', () => {
    // 加载配置
    cardsConfig = loadCardsConfig();
    layoutConfig = loadLayoutConfig();
    
    // 渲染搜索栏
    renderSearchBars();

    // 加载数据并渲染卡片
    loadAllData();

    // 更新UI语言
    updateUILanguage();

    // 绑定底部工具栏按钮
    document.getElementById('search-settings-button').addEventListener('click', showSearchSettingsModal);
    document.getElementById('add-card-button').addEventListener('click', addCard);
    document.getElementById('layout-settings-button').addEventListener('click', showLayoutConfigModal);

    // 绑定搜索设置模态框事件
    document.getElementById('close-search-settings').addEventListener('click', hideSearchSettingsModal);
    document.getElementById('search-settings-modal').addEventListener('click', (e) => {
        if (e.target.id === 'search-settings-modal') {
            hideSearchSettingsModal();
        }
    });

    // 绑定卡片配置模态框事件
    document.getElementById('close-card-config').addEventListener('click', hideCardConfigModal);
    document.getElementById('cancel-card-config').addEventListener('click', hideCardConfigModal);
    document.getElementById('save-card-config').addEventListener('click', saveCardConfig);
    document.getElementById('card-type-bookmarks').addEventListener('change', toggleCardTypeFields);
    document.getElementById('card-type-history').addEventListener('change', toggleCardTypeFields);

    // 绑定布局配置模态框事件
    document.getElementById('close-layout-config').addEventListener('click', hideLayoutConfigModal);
    document.getElementById('cancel-layout-config').addEventListener('click', hideLayoutConfigModal);
    document.getElementById('save-layout-config').addEventListener('click', saveLayoutConfigFromModal);

    // 绑定模态框点击外部关闭
    document.getElementById('card-config-modal').addEventListener('click', (e) => {
        if (e.target.id === 'card-config-modal') {
            hideCardConfigModal();
        }
    });
    document.getElementById('layout-config-modal').addEventListener('click', (e) => {
        if (e.target.id === 'layout-config-modal') {
            hideLayoutConfigModal();
        }
    });

    // 绑定设置面板按钮
    document.getElementById('save-button').addEventListener('click', saveConfig);
    document.getElementById('add-button').addEventListener('click', addItem);
    document.getElementById('reset-button').addEventListener('click', resetConfig);
    document.getElementById('language-button').addEventListener('click', () => {
        setLanguage(currentLanguage === 'zh' ? 'en' : 'zh');
    });

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
});

