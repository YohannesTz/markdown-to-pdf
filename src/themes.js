export const FONTS = [
  { name: 'Roboto', family: "'Roboto', sans-serif", type: 'Sans', note: 'Familiar README look' },
  { name: 'Montserrat', family: "'Montserrat', sans-serif", type: 'Sans', note: 'Sans-serif for business docs' },
  { name: 'Lato', family: "'Lato', sans-serif", type: 'Sans', note: 'Friendly neutral sans' },
  { name: 'Inter', family: "'Inter', sans-serif", type: 'Sans', note: 'Clean UI-style sans' },
  { name: 'Libre Baskerville', family: "'Libre Baskerville', serif", type: 'Serif', note: 'Serif for papers & notes' },
  { name: 'Merriweather', family: "'Merriweather', serif", type: 'Serif', note: 'Readable long-form serif' },
  { name: 'Source Serif 4', family: "'Source Serif 4', serif", type: 'Serif', note: 'Modern editorial serif' },
  { name: 'JetBrains Mono', family: "'JetBrains Mono', monospace", type: 'Mono', note: 'Developer notes & logs' },
  { name: 'IBM Plex Mono', family: "'IBM Plex Mono', monospace", type: 'Mono', note: 'Technical typewriter feel' },
]

// heading, text, accent
export const PALETTES = [
  { heading: '#111827', text: '#1f2937', accent: '#079669' },
  { heading: '#111827', text: '#374151', accent: '#2563eb' },
  { heading: '#0f172a', text: '#1e293b', accent: '#4f46e5' },
  { heading: '#1c1917', text: '#44403c', accent: '#c2410c' },
  { heading: '#14532d', text: '#1f2937', accent: '#15803d' },
  { heading: '#1e3a8a', text: '#1f2937', accent: '#1d4ed8' },
  { heading: '#1f2937', text: '#374151', accent: '#be123c' },
  { heading: '#0c4a6e', text: '#1e293b', accent: '#0284c7' },
  { heading: '#292524', text: '#44403c', accent: '#b45309' },
  { heading: '#18181b', text: '#3f3f46', accent: '#e11d48' },
]

export const DEFAULT_MARKDOWN = `# Markdown to PDF
### Paste AI output, notes, or a README — download a polished PDF.

Beautiful Markdown PDFs in one click — **no CSS**, no DIY styling. Use *emphasis*, ~~strikethrough~~, \`inline code\`, and [links](https://www.markdownguide.org).

![Markdown to PDF](/logo.svg)

## Get started

1. Type or paste Markdown here
2. Pick a typeface — preview updates live
3. Click **Download PDF**

## Why people use it

- Export **ChatGPT / Claude / Gemini** answers to PDF
- Turn **Cursor** notes and specs into shareable docs
- Build a **Markdown resume** or status report
- Keep tables and code looking clean in print

### Checklist

- [x] Headings, lists, and tables
- [x] Syntax-highlighted code
- [x] Blockquotes and links
- [ ] Your document next

## Code

\`\`\`js
function greet(name) {
  return \`Hello, \${name}!\`
}

console.log(greet('world'))
\`\`\`

## Table

| Feature        | Supported |
| -------------- | :-------: |
| GFM tables     |    Yes    |
| Task lists     |    Yes    |
| Code highlight |    Yes    |

> Tip: your text is saved in this browser automatically.

---

Made with Markdown.
`
