// ====== 卡片管理模块 ======
// 负责卡片的数据加载、渲染、配置管理和布局设置

import { FilterParser, filterItems } from './filterParser.js';

// ====== 常量 ======
const BOOKMARK_ROOT_SENTINEL = '__BOOKMARK_ROOT__';

// ====== 状态 ======
let allBookmarks = [];
let allHistory = [];
let cardsConfig = [];
let layoutConfig = { cardsPerRow: 2, cardHeight: 250 };
let currentEditingCardId = null;
let openInNewTab = true; // 从 searchSettings 导入

// ====== 本地存储 ======
function loadCardsConfig() {
    const data = localStorage.getItem("cardsConfig");
    if (data) {
        return JSON.parse(data);
    }
    return [];
}

function saveCardsConfig(config) {
    localStorage.setItem("cardsConfig", JSON.stringify(config));
}

function loadLayoutConfig() {
    const data = localStorage.getItem("layoutConfig");
    if (data) {
        return JSON.parse(data);
    }
    return { cardsPerRow: 2, cardHeight: 250 };
}

function saveLayoutConfig(config) {
    localStorage.setItem("layoutConfig", JSON.stringify(config));
}

function generateCardId() {
    return 'card_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
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
                folder: folderPath || BOOKMARK_ROOT_SENTINEL
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
        container.innerHTML = `<div class="empty-message">暂无卡片，点击"添加卡片"开始创建</div>`;
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
    card.setAttribute('data-card-id', cardConfig.id);
    card.setAttribute('draggable', 'true');
    
    // 添加拖拽事件监听器
    card.addEventListener('dragstart', handleDragStart);
    card.addEventListener('dragend', handleDragEnd);
    card.addEventListener('dragover', handleDragOver);
    card.addEventListener('drop', handleDrop);
    card.addEventListener('dragenter', handleDragEnter);
    card.addEventListener('dragleave', handleDragLeave);
    
    // 卡片头部
    const cardHeader = document.createElement('div');
    cardHeader.className = 'card-header';
    
    const cardHeaderLeft = document.createElement('div');
    cardHeaderLeft.className = 'card-header-left';
    
    // 添加拖拽手柄
    const dragHandle = document.createElement('div');
    dragHandle.className = 'card-drag-handle';
    dragHandle.innerHTML = '⋮⋮';
    dragHandle.title = '拖动以调整顺序';
    cardHeaderLeft.appendChild(dragHandle);
    
    // 创建可编辑的标题
    const titleContainer = document.createElement('div');
    titleContainer.className = 'card-title-container';
    
    const titleDisplay = document.createElement('h4');
    titleDisplay.className = 'card-title';
    titleDisplay.textContent = cardConfig.title;
    
    const titleInput = document.createElement('input');
    titleInput.type = 'text';
    titleInput.className = 'card-title-input';
    titleInput.value = cardConfig.title || '';
    titleInput.style.display = 'none';
    
    // 标题点击进入编辑模式
    titleDisplay.addEventListener('click', (e) => {
        e.stopPropagation();
        titleDisplay.style.display = 'none';
        titleInput.style.display = 'block';
        titleInput.focus();
        titleInput.select();
    });
    
    // 标题保存
    const saveTitle = () => {
        const newTitle = titleInput.value.trim();
        if (!newTitle) {
            alert('标题不能为空');
            titleInput.focus();
            return;
        }
        
        const cardIndex = cardsConfig.findIndex(c => c.id === cardConfig.id);
        if (cardIndex !== -1) {
            cardsConfig[cardIndex].title = newTitle;
            saveCardsConfig(cardsConfig);
            renderAllCards();
        }
    };
    
    titleInput.addEventListener('blur', saveTitle);
    titleInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            titleInput.blur();
        } else if (e.key === 'Escape') {
            e.preventDefault();
            titleInput.value = cardConfig.title || '';
            titleDisplay.style.display = 'block';
            titleInput.style.display = 'none';
        }
    });
    
    titleContainer.appendChild(titleDisplay);
    titleContainer.appendChild(titleInput);
    cardHeaderLeft.appendChild(titleContainer);
    
    // 创建内联可编辑的过滤器
    const filterContainer = document.createElement('div');
    filterContainer.className = 'card-filter-container';
    
    const filterDisplay = document.createElement('span');
    filterDisplay.className = 'card-filter-display';
    filterDisplay.textContent = cardConfig.filter || '展示全部';
    
    const filterInput = document.createElement('input');
    filterInput.type = 'text';
    filterInput.className = 'card-filter-input';
    filterInput.value = cardConfig.filter || '';
    filterInput.style.display = 'none';
    
    let updateTimeout = null;
    
    // 点击容器进入编辑模式
    filterContainer.addEventListener('click', (e) => {
        e.stopPropagation();
        if (filterInput.style.display === 'none') {
            filterDisplay.style.display = 'none';
            filterInput.style.display = 'block';
            filterInput.focus();
            filterInput.select();
        }
    });
    
    // 实时更新搜索结果（带延迟）
    const updateResults = () => {
        const newFilter = filterInput.value.trim();
        
        // 验证筛选器语法
        if (newFilter) {
            const validation = FilterParser.validate(newFilter);
            if (!validation.valid) {
                // 语法错误时不更新
                return;
            }
        }
        
        // 临时更新配置以刷新显示
        const cardIndex = cardsConfig.findIndex(c => c.id === cardConfig.id);
        if (cardIndex !== -1) {
            const tempConfig = { ...cardsConfig[cardIndex], filter: newFilter };
            const cardContent = card.querySelector('.card-content');
            if (cardContent) {
                renderCardContent(cardContent, tempConfig);
            }
        }
    };
    
    // 输入时实时更新（带防抖）
    filterInput.addEventListener('input', () => {
        if (updateTimeout) {
            clearTimeout(updateTimeout);
        }
        updateTimeout = setTimeout(updateResults, 100);
    });
    
    // 失去焦点或按回车保存
    const saveFilter = () => {
        if (updateTimeout) {
            clearTimeout(updateTimeout);
        }
        
        const newFilter = filterInput.value.trim();
        
        // 验证筛选器语法
        if (newFilter) {
            const validation = FilterParser.validate(newFilter);
            if (!validation.valid) {
                alert(`筛选语法错误: ${validation.error}`);
                filterInput.focus();
                return;
            }
        }
        
        // 更新配置
        const cardIndex = cardsConfig.findIndex(c => c.id === cardConfig.id);
        if (cardIndex !== -1) {
            cardsConfig[cardIndex].filter = newFilter;
            saveCardsConfig(cardsConfig);
            renderAllCards();
        }
    };
    
    filterInput.addEventListener('blur', saveFilter);
    filterInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            filterInput.blur();
        } else if (e.key === 'Escape') {
            e.preventDefault();
            if (updateTimeout) {
                clearTimeout(updateTimeout);
            }
            filterInput.value = cardConfig.filter || '';
            filterDisplay.style.display = 'inline-block';
            filterInput.style.display = 'none';
            // 恢复原始内容
            const cardContent = card.querySelector('.card-content');
            if (cardContent) {
                renderCardContent(cardContent, cardConfig);
            }
        }
    });
    
    filterContainer.appendChild(filterDisplay);
    filterContainer.appendChild(filterInput);
    cardHeaderLeft.appendChild(filterContainer);
    
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
    
    cardHeader.appendChild(cardHeaderLeft);
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
        container.innerHTML = `<div class="card-empty">暂无内容</div>`;
        return;
    }
    
    const itemsList = document.createElement('div');
    itemsList.className = 'card-items-list';
    
    items.slice(0, cardConfig.maxItems).forEach(item => {
        const itemElement = createItemElement(item);
        itemsList.appendChild(itemElement);
    });
    
    container.innerHTML = '';
    container.appendChild(itemsList);
}

function createItemElement(item) {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'card-item';
    
    const favicon = document.createElement('img');
    favicon.className = 'card-item-favicon';
    
    try {
        // 使用 Chrome Favicon API
        const faviconUrl = new URL(chrome.runtime.getURL("/_favicon/"));
        faviconUrl.searchParams.set("pageUrl", item.url);
        faviconUrl.searchParams.set("size", "32");
        favicon.src = faviconUrl.toString();
    } catch (e) {
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
        const folderLabel = item.folder === BOOKMARK_ROOT_SENTINEL ? '根目录' : item.folder;
        meta.textContent = `📑 ${folderLabel}`;
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
    
    // 关键词筛选 - 使用筛选解析器
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
        title: `${cardConfig.title}（副本）`
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
    document.getElementById('card-history-days').value = '7';
    document.getElementById('card-max-items').value = '100';
    toggleCardTypeFields();
    updateFilterValidation(); // 清空验证提示
}

function fillCardConfigForm(cardConfig) {
    document.getElementById('card-title').value = cardConfig.title || '';
    
    // 支持旧版本单一 type 字段
    const types = cardConfig.types || (cardConfig.type ? [cardConfig.type] : []);
    document.getElementById('card-type-bookmarks').checked = types.includes('bookmarks');
    document.getElementById('card-type-history').checked = types.includes('history');
    
    document.getElementById('card-filter').value = cardConfig.filter || '';
    document.getElementById('card-history-days').value = cardConfig.historyDays || '7';
    document.getElementById('card-max-items').value = cardConfig.maxItems || '100';
    toggleCardTypeFields();
    updateFilterValidation(); // 验证已有的filter
}

function toggleCardTypeFields() {
    const bookmarksChecked = document.getElementById('card-type-bookmarks').checked;
    const historyChecked = document.getElementById('card-type-history').checked;
    const historyField = document.getElementById('history-time-field');
    
    // 显示/隐藏相关字段
    historyField.style.display = historyChecked ? 'block' : 'none';
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
        types,
        filter,
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

// ====== 设置 openInNewTab ======
export function setOpenInNewTab(value) {
    openInNewTab = value;
}

// ====== 筛选器实时验证 ======
function updateFilterValidation() {
    const filterInput = document.getElementById('card-filter');
    const filterHint = document.getElementById('card-filter-hint');
    
    if (!filterInput || !filterHint) return;
    
    const filterValue = filterInput.value.trim();
    
    if (!filterValue) {
        // 清空时移除所有状态
        filterInput.classList.remove('filter-valid', 'filter-invalid');
        filterHint.textContent = '支持语法: title:文本 url:文本 domain:域名 dir:路径 -tag:排除 支持多tag及正则 /regex/';
        filterHint.className = 'filter-hint';
        return;
    }
    
    const validation = FilterParser.validate(filterValue);
    
    if (validation.valid) {
        filterInput.classList.remove('filter-invalid');
        filterInput.classList.add('filter-valid');
        
        // 显示筛选器描述
        try {
            const parser = new FilterParser(filterValue);
            const desc = parser.getDescription();
            filterHint.textContent = `✓ ${desc}`;
            filterHint.className = 'filter-hint filter-hint-valid';
        } catch (e) {
            filterHint.textContent = '✓ 语法正确';
            filterHint.className = 'filter-hint filter-hint-valid';
        }
    } else {
        filterInput.classList.remove('filter-valid');
        filterInput.classList.add('filter-invalid');
        filterHint.textContent = `✗ ${validation.error}`;
        filterHint.className = 'filter-hint filter-hint-error';
    }
}

// ====== 初始化 ======
export function initCardManager() {
    // 加载配置
    cardsConfig = loadCardsConfig();
    layoutConfig = loadLayoutConfig();
    
    // 加载数据并渲染卡片
    loadAllData();
    
    // 绑定底部工具栏按钮
    document.getElementById('add-card-button').addEventListener('click', addCard);
    document.getElementById('layout-settings-button').addEventListener('click', showLayoutConfigModal);
    
    // 绑定卡片配置模态框事件
    document.getElementById('close-card-config').addEventListener('click', hideCardConfigModal);
    document.getElementById('cancel-card-config').addEventListener('click', hideCardConfigModal);
    document.getElementById('save-card-config').addEventListener('click', saveCardConfig);
    document.getElementById('card-type-bookmarks').addEventListener('change', toggleCardTypeFields);
    document.getElementById('card-type-history').addEventListener('change', toggleCardTypeFields);
    
    // 绑定筛选器输入的实时验证
    const filterInput = document.getElementById('card-filter');
    if (filterInput) {
        filterInput.addEventListener('input', updateFilterValidation);
        filterInput.addEventListener('blur', updateFilterValidation);
    }
    
    // 绑定布局配置模态框事件
    document.getElementById('close-layout-config').addEventListener('click', hideLayoutConfigModal);
    document.getElementById('cancel-layout-config').addEventListener('click', hideLayoutConfigModal);
    document.getElementById('save-layout-config').addEventListener('click', saveLayoutConfigFromModal);
    
    // 绑定ESC键关闭所有模态框
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            // 检查哪个模态框是打开的并关闭它
            const cardConfigModal = document.getElementById('card-config-modal');
            const layoutConfigModal = document.getElementById('layout-config-modal');
            
            if (cardConfigModal && cardConfigModal.style.display === 'block') {
                hideCardConfigModal();
            } else if (layoutConfigModal && layoutConfigModal.style.display === 'block') {
                hideLayoutConfigModal();
            }
        }
    });
}

// ====== 拖拽排序功能 ======
let draggedCard = null;
let draggedCardId = null;

function handleDragStart(e) {
    draggedCard = e.currentTarget;
    draggedCardId = draggedCard.getAttribute('data-card-id');
    draggedCard.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', draggedCard.innerHTML);
}

function handleDragEnd(e) {
    e.currentTarget.classList.remove('dragging');
    
    // 清除所有的 drag-over 样式
    document.querySelectorAll('.content-card').forEach(card => {
        card.classList.remove('drag-over');
    });
    
    draggedCard = null;
    draggedCardId = null;
}

function handleDragOver(e) {
    if (e.preventDefault) {
        e.preventDefault();
    }
    e.dataTransfer.dropEffect = 'move';
    return false;
}

function handleDragEnter(e) {
    const targetCard = e.currentTarget;
    if (targetCard !== draggedCard) {
        targetCard.classList.add('drag-over');
    }
}

function handleDragLeave(e) {
    e.currentTarget.classList.remove('drag-over');
}

function handleDrop(e) {
    if (e.stopPropagation) {
        e.stopPropagation();
    }
    
    const targetCard = e.currentTarget;
    const targetCardId = targetCard.getAttribute('data-card-id');
    
    if (draggedCard !== targetCard) {
        // 找到拖拽卡片和目标卡片在配置数组中的索引
        const draggedIndex = cardsConfig.findIndex(c => c.id === draggedCardId);
        const targetIndex = cardsConfig.findIndex(c => c.id === targetCardId);
        
        if (draggedIndex !== -1 && targetIndex !== -1) {
            // 从原位置移除
            const [draggedConfig] = cardsConfig.splice(draggedIndex, 1);
            
            // 插入到新位置
            cardsConfig.splice(targetIndex, 0, draggedConfig);
            
            // 保存配置并重新渲染
            saveCardsConfig(cardsConfig);
            renderAllCards();
        }
    }
    
    return false;
}
