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
    if (trimmed.startsWith('#### ')) {
      endParagraph()
      html += `<h4>${formatInline(trimmed.slice(5))}</h4>`
      continue
    } else if (trimmed.startsWith('### ')) {
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

    // Horizontal Line
    if (trimmed === '---') { endParagraph();html += '<hr>';continue }

    // Lists
    if (trimmed.startsWith('- ')) {
      endParagraph()
      if (!inList) { html += '<ul>'; inList = true }
      html += `<li>${formatInline(trimmed.slice(2))}</li>`
      continue
    }

    const isStandalone = /^(\*\*|\*|`|\[|!\[).*(\*\*|\*|`|\))$/.test(trimmed);

    // If it's a standalone element on its own line, output directly
    if (isStandalone && currentParagraph.length === 0) {
      html += formatInline(trimmed);
      continue;
    }

    // Regular text
    if (inList) { html += '</ul>'; inList = false }

    currentParagraph.push(trimmed)
  }

  endParagraph()
  if (inList) html += '</ul>'

  function endParagraph() {
    if (currentParagraph.length > 0) {
      html += `<p>${formatInline(currentParagraph.join(' '))}</p>`;
      currentParagraph = [];
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
