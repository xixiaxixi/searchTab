# GitHub Actions 工作流说明

本项目包含两个 GitHub Actions 工作流：

## 1. Build Check (build.yml)
**触发时机：**
- 推送到 `main` 或 `dev` 分支时
- 创建针对 `main` 分支的 Pull Request 时

**功能：**
- 自动安装依赖并构建项目
- 验证代码是否能成功构建
- 将构建产物作为 Artifact 上传（保留 7 天）

**查看构建产物：**
在 GitHub Actions 运行页面，点击具体的工作流运行记录，可以在页面底部的 "Artifacts" 部分下载构建好的扩展包。

---

## 2. Build and Release (release.yml)
**触发时机：**
- 推送 Git 标签时（格式：`v*`，例如 `v0.3.0`）

**功能：**
- 自动构建项目
- 创建 GitHub Release
- 自动上传 `search_new_tab.zip` 到 Release
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
![Build Check](https://github.com/xixiaxixi/searchTab/workflows/Build%20Check/badge.svg)
```

---

## 注意事项

1. **权限**：这些工作流使用 `GITHUB_TOKEN`，它是 GitHub 自动提供的，无需手动配置
2. **标签格式**：Release 工作流只响应 `v` 开头的标签（如 `v1.0.0`，`v0.3.1`）
3. **构建缓存**：可以考虑添加 npm 缓存来加快构建速度
4. **发布策略**：建议使用语义化版本号（Semantic Versioning）：
   - 主版本号：不兼容的 API 修改
   - 次版本号：向下兼容的功能性新增
   - 修订号：向下兼容的问题修正
