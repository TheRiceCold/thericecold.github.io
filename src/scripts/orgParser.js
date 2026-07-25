export function parseOrg (txt) {
  const lines = txt.split(/\r?\n/),
        properties = {},
        body = []

  let inProperties = false,
      propertiesDone = false,
      inSrc = false,
      srcLang = ""

  for (const line of lines) {
    if (!propertiesDone) {
      if (line.trim() === ":PROPERTIES:") {
        inProperties = true
        continue
      }

      if (inProperties) {
        if (line.trim() === ":END:") {
          inProperties = false
          propertiesDone = true
          continue
        }

        const match = line.match(/^:([^:]+):\s*(.*)$/)
        if (match) properties[match[1]] = match[2]
        continue
      }
    }

    body.push(line)
  }

  const html = []
  let inList = false

  for (const line of body) {
    // Source blocks
    if (line.startsWith("#+BEGIN_SRC")) {
      srcLang = line.split(/\s+/)[1] || ""
      html.push(`<pre><code class="language-${srcLang}">`)
      inSrc = true
      continue
    }

    if (line.startsWith("#+END_SRC")) {
      html.push("</code></pre>")
      inSrc = false
      continue
    }

    if (inSrc) {
      html.push(escapeHtml(line))
      continue
    }

    // Headings
    const heading = line.match(/^(\*+)\s+(.*)$/)
    if (heading) {
      if (inList) {
        html.push("</ul>")
        inList = false
      }

      const level = Math.min(heading[1].length, 6)
      html.push(`<h${level}>${inlineMarkup(heading[2])}</h${level}>`)
      continue
    }

    // Lists
    const list = line.match(/^[-+]\s+(.*)$/)

    if (list) {
      if (!inList) {
        html.push("<ul>")
        inList = true
      }

      html.push(`<li>${inlineMarkup(list[1])}</li>`)
      continue
    }

    if (inList && line.trim() === "") {
      html.push("</ul>")
      inList = false
      continue
    }

    // Paragraph
    if (line.trim()) html.push(`<p>${inlineMarkup(line)}</p>`)
  }

  if (inList) html.push("</ul>")

  return {
    properties,
    html: html.join("\n")
  };
}

function inlineMarkup(txt) {
  return escapeHtml(txt)
    .replace(/\*([^*]+)\*/g, "<b>$1</b>")
    .replace(/\/([^/]+)\//g, "<i>$1</i>")
    .replace(/=([^=]+)=/g, "<code>$1</code>")
    .replace(/\[\[(.*?)\]\[(.*?)\]\]/g, '<a href="$1">$2</a>')
}

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}
