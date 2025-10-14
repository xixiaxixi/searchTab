# 筛选语法说明

这个扩展支持强大的筛选功能，允许你使用多种方式筛选收藏夹和历史记录。筛选器的设计参考了 Android Studio 的 Logcat 筛选器。

## 核心规则

### 1. 多标签（Tag）支持
- 支持在一个筛选表达式中使用多个标签
- **同字段的标签是"或"关系**：`url:github.io url:gitlab.io` 表示 URL 包含 github.io **或** gitlab.io
- **不同字段的标签是"且"关系**：`url:github.io title:foo` 表示 URL 包含 github.io **且** 标题包含 foo

### 2. 负向筛选
- 使用 `-` 前缀排除匹配的项目
- 例：`-title:广告` 排除标题中包含"广告"的项目
- 例：`title:新闻 -title:娱乐` 包含"新闻"但排除"娱乐"

### 3. 当有任意标签时的行为
- 当输入中包含任何带字段的标签（如 `title:`、`url:`、`dir:`）时，无标签的文本将被忽略
- 例：`title:github foo` 中的 `foo` 会被忽略，只会筛选标题包含 github 的项目

---

## 支持的标签类型

### `title:` - 标题筛选
在书签或历史记录的标题中搜索。

**示例：**
```
title:GitHub
```
匹配标题中包含"GitHub"的项目。

```
title:新闻 title:资讯
```
匹配标题中包含"新闻"**或**"资讯"的项目。

---

### `url:` - URL筛选
在书签或历史记录的URL中搜索。

**示例：**
```
url:.com
```
匹配URL中包含".com"的项目。

```
url:github.io url:gitlab.io
```
匹配URL中包含"github.io"**或**"gitlab.io"的项目。

---

### `domain:` - 域名筛选
筛选特定域名的书签或历史记录。支持通配符匹配，类似广告拦截规则。

- **支持通配符**：
  - `*` - 匹配单个部分（不包含点）
  - `**` - 匹配多个部分（包含点）

**示例：**
```
domain:github.com
```
匹配域名为"github.com"的项目。

```
domain:*.github.com
```
匹配"github.com"的所有子域名，如"api.github.com"、"gist.github.com"。

```
domain:**.example.com
```
匹配"example.com"的所有多级子域名，如"a.b.example.com"。

```
domain:example.*
```
匹配所有"example"的顶级域名，如"example.com"、"example.org"。

```
domain:*.co.*
```
匹配如"github.co.jp"、"google.co.uk"等域名。

**注意**：`domain:` 在非正则模式下支持通配符，在正则模式（`/...../`）下使用标准正则语法。

---

### `dir:` - 文件夹筛选（仅收藏夹）
筛选特定文件夹下的书签。**此标签仅对收藏夹有效，历史记录会忽略此标签。**

- **空值**：`dir:` 无值时匹配所有收藏夹
- **支持通配符**：
  - `*` - 匹配单级路径
  - `**` - 匹配多级路径

**示例：**
```
dir:工作
```
匹配"工作"文件夹下的书签。

```
dir:工作/*
```
匹配"工作"文件夹的直接子文件夹下的书签。

```
dir:工作/**
```
匹配"工作"文件夹及其所有子文件夹下的书签。

```
dir:项目/前端
```
匹配"项目 > 前端"路径下的书签。

**注意**：历史记录没有文件夹概念，因此会自动忽略 `dir:` 标签。

---

## 正则表达式

使用 `/pattern/` 格式可以在任何标签中使用正则表达式。

**示例：**
```
title:/^GitHub/
```
匹配标题以"GitHub"开头的项目。

```
url:/\.com$/
```
匹配URL以".com"结尾的项目。

```
url:/^https:\/\/(github|gitlab)\.com/
```
匹配来自 GitHub 或 GitLab 的 HTTPS 链接。

---

## 组合示例

### 示例1: 筛选特定域名的新闻
```
domain:news.com title:科技
```
域名为"news.com" **且** 标题包含"科技"。

### 示例2: 排除广告内容
```
title:新闻 -title:广告 -title:推广
```
标题包含"新闻"，但排除包含"广告"或"推广"的项目。

### 示例3: 多个域名选项（使用通配符）
```
domain:*.github.io domain:*.gitlab.io
```
匹配所有 github.io 和 gitlab.io 的子域名。

### 示例4: 排除特定域名
```
-domain:ads.* -domain:tracker.*
```
排除所有广告和追踪器域名。

### 示例5: 文件夹和关键词组合
```
dir:工作/** title:项目
```
在"工作"文件夹及其所有子文件夹下，标题包含"项目"的书签。

### 示例6: 复杂组合
```
dir:开发/前端 domain:*.github.io -title:test title:vue title:react
```
- 在"开发 > 前端"文件夹下的书签
- 域名为 github.io 的子域名
- 标题包含"vue"或"react"
- 排除标题包含"test"的项目

### 示例7: 使用正则表达式
```
domain:/^https:/ title:/react|vue|angular/i
```
- HTTPS 协议的链接
- 标题包含 react、vue 或 angular（不区分大小写）

---

## 语法规则总结

1. **空格分隔**：多个标签用空格分隔
2. **同字段OR，不同字段AND**：
   - `url:A url:B` = URL是A或B
   - `url:A title:B` = URL是A且标题是B
3. **负向筛选**：`-tag:value` 排除匹配项
4. **域名通配符**（仅 domain）：
   - `*` 匹配单个部分（不含点）
   - `**` 匹配多个部分（含点）
5. **路径通配符**（仅 dir）：
   - `*` 匹配单级路径
   - `**` 匹配多级路径
6. **正则表达式**：`tag:/pattern/` 使用正则
7. **大小写**：文本匹配不区分大小写（除非使用正则）
8. **引号**：如果值包含空格，可以用引号包裹（如 `title:"foo bar"`）

---

## 实用技巧

### 快速查找GitHub项目
```
domain:github.com -domain:gist.github.com
```

### 屏蔽广告域名
```
-domain:ads.* -domain:*.ad.* -domain:tracker.*
```

### 查找最近的工作相关书签
```
dir:工作/** 
```
配合历史记录时间范围筛选使用效果更佳。

### 筛选特定国家/地区的网站
```
domain:*.cn domain:*.jp
```

### 搜索多个技术栈
```
title:python title:javascript title:rust
```

---

## 注意事项

1. **dir标签仅对收藏夹有效**：历史记录没有文件夹概念，会自动忽略 `dir:` 标签
2. **正则表达式需要转义特殊字符**：如 `.` 需要写成 `\.`
3. **通配符仅支持在dir标签中**：`*` 和 `**` 只能在 `dir:` 中使用
4. **默认不区分大小写**：除非在正则表达式中显式指定标志

---

## 快速参考表

| 语法 | 说明 | 示例 |
|------|------|------|
| `title:keyword` | 标题文本搜索 | `title:教程` |
| `url:keyword` | URL文本搜索 | `url:.com` |
| `dir:path` | 文件夹路径（仅收藏夹） | `dir:工作/*` |
| `-tag:value` | 负向筛选（排除） | `-title:广告` |
| `tag:/regex/` | 正则表达式 | `url:/\.com$/` |
| `tag:A tag:B` | 同字段OR关系 | `url:github.io url:gitlab.io` |
| `tagA:X tagB:Y` | 不同字段AND关系 | `url:github.com title:vue` |

---

## 常见问题

**Q: 如何匹配根文件夹下的书签？**  
A: 使用 `dir:` 无值，或者不使用dir标签

**Q: 通配符 * 和 ** 有什么区别？**  
A: `*` 匹配单级路径（如 `工作/*` 匹配 `工作/项目` 但不匹配 `工作/项目/前端`），`**` 匹配多级（`工作/**` 匹配所有子路径）

**Q: 为什么我的正则表达式不起作用？**  
A: 确保正则表达式用 `/` 包裹，如 `/pattern/`，并且特殊字符需要转义

**Q: 可以同时筛选收藏夹和历史记录吗？**  
A: 可以！在卡片配置中选择两个数据源。`dir:` 标签只会应用于收藏夹，不影响历史记录的筛选
