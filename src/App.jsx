import { useEffect, useMemo, useRef, useState } from 'react'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import hljs from 'highlight.js/lib/common'
import 'highlight.js/styles/github.css'
import { FONTS, PALETTES, DEFAULT_MARKDOWN } from './themes'

marked.use({
  gfm: true,
  breaks: false,
  renderer: {
    code({ text, lang }) {
      const language = lang && hljs.getLanguage(lang) ? lang : null
      const html = language
        ? hljs.highlight(text, { language }).value
        : hljs.highlightAuto(text).value
      return `<pre><code class="hljs">${html}</code></pre>`
    },
  },
})

const STORAGE_KEY = 'md2pdf:doc'

function loadDoc() {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? DEFAULT_MARKDOWN
  } catch {
    return DEFAULT_MARKDOWN
  }
}

function beautify(md) {
  return (
    md
      .replace(/\r\n/g, '\n')
      .replace(/[ \t]+$/gm, '')
      // blank line before headings
      .replace(/([^\n])\n(#{1,6} )/g, '$1\n\n$2')
      // normalise bullet markers
      .replace(/^(\s*)[*+] (?!\[)/gm, '$1- ')
      .replace(/\n{3,}/g, '\n\n')
      .trim() + '\n'
  )
}

function fileNameFrom(md) {
  const h1 = md.match(/^#\s+(.+)$/m)
  const base = (h1 ? h1[1] : 'document')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
  return `${base || 'document'}.pdf`
}

export default function App() {
  const [doc, setDoc] = useState(loadDoc)
  const [fontFilter, setFontFilter] = useState('All')
  const [font, setFont] = useState(FONTS[0])
  const [palette, setPalette] = useState(0)
  const [downloading, setDownloading] = useState(false)
  const textareaRef = useRef(null)
  const gutterRef = useRef(null)
  const previewRef = useRef(null)

  useEffect(() => {
    const id = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, doc)
      } catch {
        /* storage unavailable */
      }
    }, 300)
    return () => clearTimeout(id)
  }, [doc])

  const html = useMemo(() => DOMPurify.sanitize(marked.parse(doc)), [doc])
  const lineCount = useMemo(() => doc.split('\n').length, [doc])
  const colors = PALETTES[palette]
  const visibleFonts = FONTS.filter((f) => fontFilter === 'All' || f.type === fontFilter)

  // Replace the current selection and restore a sensible caret position.
  function applyEdit(transform) {
    const ta = textareaRef.current
    const { selectionStart: start, selectionEnd: end, value } = ta
    const { text, selStart, selEnd, from = start, to = end } = transform(value, start, end)
    const next = value.slice(0, from) + text + value.slice(to)
    setDoc(next)
    requestAnimationFrame(() => {
      ta.focus()
      ta.setSelectionRange(selStart, selEnd)
    })
  }

  function wrap(before, after = before, placeholder = 'text') {
    applyEdit((value, start, end) => {
      const selected = value.slice(start, end) || placeholder
      return {
        text: before + selected + after,
        selStart: start + before.length,
        selEnd: start + before.length + selected.length,
      }
    })
  }

  function prefixLines(prefixFor) {
    applyEdit((value, start, end) => {
      const from = value.lastIndexOf('\n', start - 1) + 1
      let to = value.indexOf('\n', end)
      if (to === -1) to = value.length
      const lines = value.slice(from, to).split('\n')
      const text = lines
        .map((line, i) => prefixFor(i) + line.replace(/^(#{1,6} |[-*+] (\[[ x]\] )?|\d+\. |> )/, ''))
        .join('\n')
      return { text, from, to, selStart: from, selEnd: from + text.length }
    })
  }

  function insertBlock(block) {
    applyEdit((value, start, end) => {
      const lead = start > 0 && value[start - 1] !== '\n' ? '\n\n' : ''
      const text = lead + block + '\n'
      return { text, selStart: start + text.length, selEnd: start + text.length, from: start, to: end }
    })
  }

  const tools = [
    { label: 'B', title: 'Bold', className: 'bold', run: () => wrap('**') },
    { label: 'I', title: 'Italic', className: 'italic', run: () => wrap('*') },
    { label: 'U', title: 'Underline', className: 'underline', run: () => wrap('<u>', '</u>') },
    { label: 'S', title: 'Strikethrough', className: 'strike', run: () => wrap('~~') },
    'sep',
    { label: 'H1', title: 'Heading 1', run: () => prefixLines(() => '# ') },
    { label: 'H2', title: 'Heading 2', run: () => prefixLines(() => '## ') },
    { label: 'H3', title: 'Heading 3', run: () => prefixLines(() => '### ') },
    'sep',
    { label: '•', title: 'Bullet list', run: () => prefixLines(() => '- ') },
    { label: '1.', title: 'Numbered list', run: () => prefixLines((i) => `${i + 1}. `) },
    { label: '☑', title: 'Task list', run: () => prefixLines(() => '- [ ] ') },
    { label: '❝', title: 'Quote', run: () => prefixLines(() => '> ') },
    'sep',
    { label: '</>', title: 'Inline code', run: () => wrap('`', '`', 'code') },
    { label: '{ }', title: 'Code block', run: () => insertBlock('```js\n// code\n```') },
    { label: '🔗', title: 'Link', run: () => wrap('[', '](https://)', 'link text') },
    { label: '▦', title: 'Table', run: () => insertBlock('| Column | Column |\n| ------ | ------ |\n| Cell   | Cell   |') },
    { label: '―', title: 'Divider', run: () => insertBlock('---') },
  ]

  function onKeyDown(e) {
    const mod = e.metaKey || e.ctrlKey
    if (mod && e.key.toLowerCase() === 'b') {
      e.preventDefault()
      wrap('**')
    } else if (mod && e.key.toLowerCase() === 'i') {
      e.preventDefault()
      wrap('*')
    } else if (e.key === 'Tab') {
      e.preventDefault()
      applyEdit((value, start, end) => ({ text: '  ', selStart: start + 2, selEnd: start + 2, from: start, to: end }))
    }
  }

  async function downloadPdf() {
    setDownloading(true)
    try {
      await document.fonts.ready
      const { default: html2pdf } = await import('html2pdf.js')
      await html2pdf()
        .set({
          margin: [14, 14, 14, 14],
          filename: fileNameFrom(doc),
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true, windowWidth: 800 },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
          pagebreak: { mode: ['css', 'legacy'], avoid: ['pre', 'table', 'img', 'blockquote', 'h1', 'h2', 'h3'] },
        })
        .from(previewRef.current)
        .save()
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <img src="/logo.svg" alt="" width="32" height="32" />
          <span>Markdown to PDF</span>
        </div>
      </header>

      <main className="workspace">
        <section className="panel editor-panel">
          <div className="toolbar" role="toolbar" aria-label="Formatting">
            {tools.map((t, i) =>
              t === 'sep' ? (
                <span key={i} className="sep" />
              ) : (
                <button key={t.title} type="button" title={t.title} className={t.className} onClick={t.run}>
                  {t.label}
                </button>
              ),
            )}
            <span className="sep" />
            <button type="button" className="text-btn" title="Tidy spacing and list markers" onClick={() => setDoc(beautify(doc))}>
              Beautify
            </button>
            <button type="button" className="text-btn" title="Restore sample document" onClick={() => setDoc(DEFAULT_MARKDOWN)}>
              Reset
            </button>
          </div>
          <div className="editor">
            <div className="gutter" ref={gutterRef} aria-hidden="true">
              {Array.from({ length: lineCount }, (_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </div>
            <textarea
              ref={textareaRef}
              value={doc}
              onChange={(e) => setDoc(e.target.value)}
              onKeyDown={onKeyDown}
              onScroll={(e) => (gutterRef.current.scrollTop = e.target.scrollTop)}
              spellCheck={false}
              wrap="off"
              aria-label="Markdown input"
              placeholder="Type or paste Markdown here…"
            />
          </div>
        </section>

        <section className="panel preview-panel">
          <article
            ref={previewRef}
            className="markdown-body"
            style={{
              '--font': font.family,
              '--heading': colors.heading,
              '--text': colors.text,
              '--accent': colors.accent,
            }}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </section>

        <aside className="panel sidebar">
          <h2 className="label">Typeface</h2>
          <div className="chips">
            {['All', 'Sans', 'Serif', 'Mono'].map((f) => (
              <button key={f} type="button" className={f === fontFilter ? 'chip active' : 'chip'} onClick={() => setFontFilter(f)}>
                {f}
              </button>
            ))}
          </div>
          <div className="font-list">
            {visibleFonts.map((f) => (
              <button
                key={f.name}
                type="button"
                className={f.name === font.name ? 'font-card active' : 'font-card'}
                style={{ fontFamily: f.family }}
                onClick={() => setFont(f)}
              >
                <span>
                  <strong>{f.name}</strong>
                  <small>{f.note}</small>
                </span>
                <em>Aa</em>
              </button>
            ))}
          </div>

          <h2 className="label">Colours</h2>
          <div className="swatches">
            {PALETTES.map((p, i) => (
              <button
                key={i}
                type="button"
                title={`Palette ${i + 1}`}
                className={i === palette ? 'swatch active' : 'swatch'}
                onClick={() => setPalette(i)}
              >
                <i style={{ background: p.heading }} />
                <i style={{ background: p.text }} />
                <i style={{ background: p.accent }} />
              </button>
            ))}
          </div>

          <button type="button" className="download" onClick={downloadPdf} disabled={downloading}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 3v12m0 0-5-5m5 5 5-5M4 21h16" />
            </svg>
            {downloading ? 'Preparing…' : 'Download PDF'}
          </button>
          <p className="hint">Free, no watermark. Your text stays in your browser.</p>
        </aside>
      </main>
    </div>
  )
}
