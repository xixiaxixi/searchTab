# GitHub Actions 工作流说明

## Build and Release (release.yml)
**触发时机：**
- 推送 Git 标签时（格式：`v*`，例如 `v0.3.0`）

**功能：**
- 自动安装依赖
- 使用 Vite + crxjs 构建项目
- 将 `dist/` 目录打包为 `search_new_tab.zip`
- 创建 GitHub Release 并上传
- 自动生成 Release Notes

**使用方法：**

1. 确保代码已提交并推送
2. 创建并推送标签：
   ```bash
   git tag v0.3.0 -m "Release v0.3.0"
   git push origin v0.3.0
   ```
3. GitHub Actions 会自动运行，几分钟后在 Releases 页面就能看到新版本

**查看 Releases：**
访问 https://github.com/xixiaxixi/searchTab/releases

---

## 工作流状态徽章

可以在 README.md 中添加徽章显示构建状态：

```markdown
![Build and Release](https://github.com/xixiaxixi/searchTab/workflows/Build%20and%20Release/badge.svg)
```

---

## 注意事项

1. **权限**：这些工作流使用 `GITHUB_TOKEN`，它是 GitHub 自动提供的，无需手动配置
2. **标签格式**：Release 工作流只响应 `v` 开头的标签（如 `v1.0.0`，`v0.3.1`）
3. **发布策略**：建议使用语义化版本号（Semantic Versioning）：
   - 主版本号：不兼容的 API 修改
   - 次版本号：向下兼容的功能性新增
   - 修订号：向下兼容的问题修正
