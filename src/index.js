// ====== 主入口文件 ======
// 负责协调各个模块

import { initSearchSettings, getOpenInNewTab } from './searchSettings.js';
import { initCardManager, setOpenInNewTab } from './cardManager.js';

// ====== 初始化 ======
window.addEventListener('DOMContentLoaded', () => {
    // 初始化搜索设置模块
    initSearchSettings();
    
    // 获取 openInNewTab 设置并传递给卡片管理器
    setOpenInNewTab(getOpenInNewTab());
    
    // 初始化卡片管理模块
    initCardManager();
});
