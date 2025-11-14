// src/stores/langStore.js

let translations = { }
const resolve = (obj, path) => {
  if (!obj || !path) return undefined
  const keys = path.split('.')
  let val = obj
  for (let key of keys) {
    const [prop, index] = key.split(/[-.]/)
    val = val?.[prop]
    if (Array.isArray(val) && index !== undefined && index !== '')
      val = val[Number(index)]
    if (val === undefined) return undefined
  }
  return val
}
const langStore = (() => {
  let currentLang =
    localStorage.getItem('lang') ||
    navigator.language?.split('-')[0] || 'en'

  // Cached elements
  let elsText, elsHtml, elsAttr, templateLists
  let rebinders = [], debounceTimer = null

  const applyListItemAttr = (templateKey, list, listItem, el) => {
    const itemKey = el.dataset.i18nItem
    const fallbackVal =
      itemKey && typeof listItem === 'object'
      ? resolve(listItem, itemKey) :
      typeof listItem === 'string' ? listItem : ''

    const itemAttr = el.dataset.i18nItemAttr
    if (itemAttr) {
      const [attr, key] = itemAttr.split(':')
      let value = key ? key.trim() : fallbackVal

      // replace {en} with English translation
      if (value.includes('{en}')) {
        const enList = translations.en[templateKey]
        if (Array.isArray(enList))
          value = value.replace('{en}', (typeof listItem === 'string') ? enList[list.indexOf(listItem)] : '')
        el.setAttribute(attr, value.toLowerCase())
      }
      else el.setAttribute(attr, resolve(listItem, value))
    }

    if ('i18nHtml' in el.dataset) el.innerHTML = fallbackVal ?? ''
    else el.textContent = fallbackVal ?? ''
  }

  const t = (key, vars) => {
    if (key === 'themeVal' && window.themeStore) {
      const theme = window.themeStore.current
      return resolve(translations[currentLang], theme) || theme
    }

    const value = resolve(translations[currentLang], key)
    if (value === undefined) return key

    return typeof value === 'string' && vars
      ? value.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? `{${k}}`)
      : value
  }

  const registerTranslations = (pageTranslations = {}) => {
    for (const lang in pageTranslations) {
      if (!translations[lang]) translations[lang] = {}
      Object.assign(translations[lang], pageTranslations[lang])
    }
  }

  const onRebind = fn => rebinders.push(fn)

  const updateI18nElements = () => {
    // Text content
    for (const e of elsText) {
      const keys = e.dataset.i18n.split(',')
      const sep = e.dataset.i18nSep ?? ' '
      e.textContent = keys.map(k => t(k.trim())).join(sep)
    }

    // HTML content
    for (const e of elsHtml) {
      const keys = e.dataset.i18nHtml.split(',')
      e.innerHTML = keys.map(k => t(k.trim())).join(' ')
    }

    // Attributes
    for (const el of elsAttr) {
      const entries = el.dataset.i18nAttr.split(',')
      for (const entry of entries) {
        const [attr, key] = entry.split(':').map(s => s.trim())
        const val = t(key)
        el.setAttribute(attr, val)
      }
    }

    // List templates
    for (const template of templateLists) {
      const key = template.dataset.i18nList
      const list = t(key)
      if (!Array.isArray(list)) continue

      const parent = template.parentElement
      for (let i = parent.children.length - 1; i >= 0; i--) {
        const el = parent.children[i]
        if (el.tagName !== 'TEMPLATE') parent.removeChild(el)
      }

      // List
      for (const item of list) {
        const clone = template.content.cloneNode(true)
        const items = clone.querySelectorAll('[data-i18n-item]')
        const subTemplateLists = clone.querySelectorAll('template[data-i18n-sublist]')

        // List Items
        for (const el of items)
          applyListItemAttr(key, list, item, el)

        // SubList
        for (const sub of subTemplateLists) {
          const subKey = sub.dataset.i18nSublist
          const subList = item[subKey]
          if (!Array.isArray(subList)) continue

          const subParent = sub.parentElement
          for (let i = subParent.children.length - 1; i >= 0; i--) {
            const el = subParent.children[i]
            if (el.tagName !== 'TEMPLATE') subParent.removeChild(el)
          }

          // SubList Items
          for (const subItem of subList) {
            const subClone = sub.content.cloneNode(true)
            const subItems  = subClone.querySelectorAll('[data-i18n-item]')
            const attrItems = clone.querySelectorAll('[data-i18n-item-attr]')

            for (const subEl of subItems)
              applyListItemAttr(key, subList, subItem, subEl)

            subParent.appendChild(subClone)
          }
        }

        parent.appendChild(clone)
      }
    }

    clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => {
      for (const fn of rebinders) fn()
    }, 10)
  }

  const init = () => {
    elsText = document.querySelectorAll('[data-i18n]')
    elsHtml = document.querySelectorAll('[data-i18n-html]')
    elsAttr = document.querySelectorAll('[data-i18n-attr]')
    templateLists = document.querySelectorAll('template[data-i18n-list]')
  }

  const setLanguage = lang => {
    if (!translations[lang]) return
    currentLang = lang
    localStorage.setItem('lang', lang)
    updateI18nElements()

    // document.dispatchEvent(new CustomEvent('langchange',{detail:{lang: currentLang}}))
  }

  const next = () => {
    if (!languages.length) return
    const next = languages[(languages.indexOf(currentLang) + 1) % languages.length]
    setLanguage(next)
  }

  return {
    registerTranslations,
    updateI18nElements,
    setLanguage,
    next, init, t,
    getLanguages: () => Object.keys(translations),
    // get current() { return currentLang },
    onRebind,
  }
})()
