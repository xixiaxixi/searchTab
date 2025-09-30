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

// ====== 设置面板 ======
function toggleEditMode() {
    isEditing = !isEditing;
    
    if (isEditing) {
        // 进入编辑模式
        editingConfigs = JSON.parse(JSON.stringify(searchBarData));
        document.getElementById('normal-view').style.display = 'none';
        document.getElementById('setting-panel').classList.add('active');
        renderConfigList();
    } else {
        // 退出编辑模式
        document.getElementById('normal-view').style.display = 'block';
        document.getElementById('setting-panel').classList.remove('active');
    }
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

    // 退出编辑模式
    toggleEditMode();
}

function resetConfig() {
    if (confirm('确定要重置为默认配置吗？')) {
        editingConfigs = JSON.parse(JSON.stringify(DEFAULT_SEARCH_BAR_DATA));
        renderConfigList();
    }
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

    // 如果在编辑模式，重新渲染配置列表
    if (isEditing) {
        renderConfigList();
    }
}

// ====== 初始化 ======
window.addEventListener('DOMContentLoaded', () => {
    // 渲染搜索栏
    renderSearchBars();

    // 更新UI语言
    updateUILanguage();

    // 绑定编辑按钮
    document.getElementById('edit-button').addEventListener('click', toggleEditMode);

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

