# Search New Tab

A simple chrome/edge extension that replaces new tab page with a page that contains **only** search bars.

## Features

- 🔍 Multiple search engines support
- 📑 Display bookmarks and history in customizable cards
- 🎯 **Powerful filtering with advanced syntax support**
  - Text matching (title, URL, or both)
  - Regular expressions
  - Field-specific filtering

### Filter Syntax

The extension supports powerful filtering capabilities:

- `keyword` - Search in both title and URL (default)
- `title:text` - Search only in title
- `url:text` - Search only in URL  
- `/regex/` - Use regular expression for both title and URL
- `title:/regex/` - Use regex for title only
- `url:/regex/` - Use regex for URL only

**Examples:**
- `github` - Find items with "github" in title or URL
- `title:新闻` - Find items with "新闻" in title only
- `url:.com` - Find items with ".com" in URL
- `/^https/` - Find items starting with "https"
- `url:/github\.com/` - Find items from github.com

See [FILTER_SYNTAX.md](FILTER_SYNTAX.md) for detailed documentation.

### Compile and Minify for Production

```sh
npm run build
```
`output/dist.zip` will then be generated.

## Testing

Open `test-filter.html` in your browser to test the filter functionality.

## License

GNU GPLv3