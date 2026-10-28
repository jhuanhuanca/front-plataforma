const allowedTags = new Set(['P', 'BR', 'STRONG', 'EM', 'A', 'UL', 'OL', 'LI', 'CODE', 'BLOCKQUOTE'])

export function argumentHtml(source: string): string {
  return sanitize(markdownToHtml(source))
}

function markdownToHtml(source: string): string {
  const escaped = escapeHtml(source).replace(/\r\n/g, '\n').trim()
  if (escaped.length === 0) {
    return ''
  }

  return escaped.split(/\n{2,}/).map(renderBlock).join('')
}

function renderBlock(block: string): string {
  const lines = block.split('\n')
  if (lines.every((line) => line.startsWith('- '))) {
    const items = lines.map((line) => `<li>${inline(line.slice(2))}</li>`).join('')

    return `<ul>${items}</ul>`
  }

  return `<p>${lines.map((line) => inline(line)).join('<br>')}</p>`
}

function inline(text: string): string {
  return text
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" rel="noopener noreferrer" target="_blank">$1</a>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function sanitize(html: string): string {
  const document = new DOMParser().parseFromString(html, 'text/html')
  const clean = document.createElement('div')

  document.body.childNodes.forEach((node) => {
    const next = cleanNode(document, node)
    if (next) {
      clean.appendChild(next)
    }
  })

  return clean.innerHTML
}

function cleanNode(document: Document, node: Node): Node | null {
  if (node.nodeType === Node.TEXT_NODE) {
    return document.createTextNode(node.textContent ?? '')
  }

  if (node.nodeType !== Node.ELEMENT_NODE) {
    return null
  }

  const element = node as Element
  if (!allowedTags.has(element.tagName)) {
    const fragment = document.createDocumentFragment()
    element.childNodes.forEach((child) => {
      const next = cleanNode(document, child)
      if (next) {
        fragment.appendChild(next)
      }
    })

    return fragment
  }

  const copy = document.createElement(element.tagName.toLowerCase())
  if (element.tagName === 'A') {
    const href = element.getAttribute('href') ?? ''
    if (/^https?:\/\//i.test(href)) {
      copy.setAttribute('href', href)
      copy.setAttribute('rel', 'noopener noreferrer')
      copy.setAttribute('target', '_blank')
    }
  }

  element.childNodes.forEach((child) => {
    const next = cleanNode(document, child)
    if (next) {
      copy.appendChild(next)
    }
  })

  return copy
}
