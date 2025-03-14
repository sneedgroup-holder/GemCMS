# GemCMS

A simple CLI-based CMS for creating and managing Gemtext blog sites.

## Installation

```bash
npm install
npm link  # To make the 'gemcms' command available globally
```

## Usage

### Create a new post
```bash
gemcms new "My First Post"
```

To create a draft:
```bash
gemcms new "Draft Post" --draft
```

### List posts
```bash
gemcms list
```

To list drafts:
```bash
gemcms list --drafts
```

### Delete a post
```bash
gemcms delete "My First Post"
```

### Build the site
```bash
gemcms build
```

## Directory Structure

- `content/` - Contains published posts
- `content/drafts/` - Contains draft posts
- `public/` - Contains the built site

## File Format

Posts are written in Gemtext format (.gmi files). Here's a quick reference:

```gemtext
# Heading 1
## Heading 2
### Heading 3

* List item 1
* List item 2
* List item 3

> This is a blockquote

=> https://example.com Link description
=> gemini://example.com Gemini link

\```
This is preformatted text
It preserves whitespace
\```

Regular text is just written as-is.
No special formatting needed.
```

## License

MIT 