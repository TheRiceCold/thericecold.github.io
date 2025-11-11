export function tinyMd(md) {
  let html = '', inList = false, currentParagraph = []

  const lines = md.split('\n')

  for (const line of lines) {
    const trimmed = line.trim()

    if (trimmed === '') {
      endParagraph()
      if (inList) { html += '</ul>'; inList = false }
      continue
    }

    // Headers
    if (trimmed.startsWith('### ')) {
      endParagraph()
      html += `<h3>${formatInline(trimmed.slice(4))}</h3>`
      continue
    } else if (trimmed.startsWith('## ')) {
      endParagraph()
      html += `<h2>${formatInline(trimmed.slice(3))}</h2>`
      continue
    } else if (trimmed.startsWith('# ')) {
      endParagraph()
      html += `<h1>${formatInline(trimmed.slice(2))}</h1>`
      continue
    }

    // Lists
    if (trimmed.startsWith('- ')) {
      endParagraph()
      if (!inList) { html += '<ul>'; inList = true }
      html += `<li>${formatInline(trimmed.slice(2))}</li>`
      continue
    }

    // Check if line contains inline elements that should be block-level and don't wrap in paragraph
    if (/(\*\*|\[!\[|\`[^`]+\`)/.test(trimmed) && currentParagraph.length === 0) {
      html += formatInline(trimmed)
      continue
    }

    // Regular text
    if (inList) { html += '</ul>'; inList = false }

    currentParagraph.push(trimmed)
  }

  endParagraph()
  if (inList) html += '</ul>'

  function endParagraph() {
    if (currentParagraph.length > 0) {
      // Only wrap in <p> if it's plain text without block elements
      const content = currentParagraph.join(' ')
      if (/^[^*`\!\[].*[^*`\!\] ]$/.test(content))
        html += `<p>${formatInline(content)}</p>`
      else html += formatInline(content)
      currentParagraph = []
    }
  }

  return html
}

function formatInline(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
    .replace(/\*(.*?)\*/g, '<i>$1</i>')
    .replace(/`(.*?)`/g, '<code>$1</code>')
    .replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1">')
    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>')
}
