// src/stores/langStore.js

// import globalTranslations from '../i18n/translations/global.js'

// Cached elements
let elsText, elsHtml, elsAttr, tmplLists
let rebindCallbacks = [], debounceTimer = null;

const resolve = (obj, path) => {
  if (!obj || !path) return undefined
  const keys = path.split('.')
  let val = obj;
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
  let translations = { ...globalTranslations }
  let currentLang =
    localStorage.getItem('lang') ||
    navigator.language?.split('-')[0] || 'en'

  if (!translations[currentLang]) {
    const fallback = Object.keys(translations)[0] || 'en'
    currentLang = fallback
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
    for (const [lang, data] of Object.entries(pageTranslations)) {
      if (!translations[lang]) translations[lang] = {}
      Object.assign(translations[lang], globalTranslations[lang] || {}, data)
    }
  }

  const onRebind = cb => {
    if (typeof cb === 'function') rebindCallbacks.push(cb)
  }

  const triggerRebind = () => {
    clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => {
      for (const fn of rebindCallbacks) fn()
    }, 50) // adjust delay if needed
  }

  const updateI18nElements = () => {
    // Regular text nodes
    for (const e of elsText) {
      const keys = e.dataset.i18n.split(',')
      const sep = e.dataset.i18nSep ?? ' '
      e.textContent = keys.map(k => t(k.trim())).join(sep)
    }

    // HTML replacements
    for (const e of elsHtml) {
      const keys = e.dataset.i18nHtml.split(',')
      e.innerHTML = keys.map(k => t(k.trim())).join(' ')
    }

    // Attribute replacements
    for (const e of elsAttr) {
      const pairs = e.dataset.i18nAttr.split(';').map(p => p.split(':'))
      for (const [attr, key] of pairs) {
        if (!attr || !key) continue
        const val = t(key.trim())
        if (val) e.setAttribute(attr, val)
      }
    }

    // List templates
    for (const tmpl of tmplLists) {
      const key = tmpl.dataset.i18nList
      const list = t(key)
      if (!Array.isArray(list)) continue

      const parent = tmpl.parentElement
      // Clear existing rendered elements (faster than querySelectorAll)
      for (let i = parent.children.length - 1; i >= 0; i--) {
        const el = parent.children[i]
        if (el.tagName !== 'TEMPLATE') parent.removeChild(el)
      }

      for (const item of list) {
        const clone = tmpl.content.cloneNode(true)
        const i18nItems = clone.querySelectorAll('[data-i18n-item]')
        const subTmpls = clone.querySelectorAll('template[data-i18n-sublist]')

        for (const elItem of i18nItems) {
          const itemKey = elItem.dataset.i18nItem
          const val =
            itemKey && typeof item === 'object'
              ? resolve(item, itemKey)
              : typeof item === 'string'
              ? item
              : ''

          if ('i18nHtml' in elItem.dataset) elItem.innerHTML = val
          else elItem.textContent = val
        }

        for (const sub of subTmpls) {
          const subKey = sub.dataset.i18nSublist
          const subList = item[subKey]
          if (!Array.isArray(subList)) continue

          const subParent = sub.parentElement
          // same clear logic for subitems
          for (let i = subParent.children.length - 1; i >= 0; i--) {
            const el = subParent.children[i]
            if (el.tagName !== 'TEMPLATE') subParent.removeChild(el)
          }

          for (const subItem of subList) {
            const subClone = sub.content.cloneNode(true)
            const elSubs = subClone.querySelectorAll('[data-i18n-item]')

            for (const elSub of elSubs) {
              const subItemKey = elSub.dataset.i18nItem
              const val =
                subItemKey && typeof subItem === 'object'
                  ? resolve(subItem, subItemKey)
                  : typeof subItem === 'string'
                  ? subItem
                  : ''

              if ('i18nHtml' in elSub.dataset) elSub.innerHTML = val
              else elSub.textContent = val
            }

            subParent.appendChild(subClone)
          }
        }

        parent.appendChild(clone)
      }
    }

    // Rebind events from modified elements
    for (const fn of rebindCallbacks) fn()
  }

  const init = () => {
    // Single DOM query pass
    elsText = document.querySelectorAll('[data-i18n]')
    elsHtml = document.querySelectorAll('[data-i18n-html]')
    elsAttr = document.querySelectorAll('[data-i18n-attr]')
    tmplLists = document.querySelectorAll('template[data-i18n-list]')
    updateI18nElements()
  }

  const setLanguage = lang => {
    if (!translations[lang]) return
    currentLang = lang
    localStorage.setItem('lang', lang)
    updateI18nElements()
    triggerRebind() // run callbacks safely
  }

  const next = () => {
    const langs = Object.keys(translations)
    if (!langs.length) return
    const next = langs[(langs.indexOf(currentLang) + 1) % langs.length]
    setLanguage(next)
  }

  return {
    registerTranslations,
    updateI18nElements,
    setLanguage,
    next, init, t,
    getLanguages: () => Object.keys(translations),
    get current() { return currentLang },
    onRebind,
  }
})()
