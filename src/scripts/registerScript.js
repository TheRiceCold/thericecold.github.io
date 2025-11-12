import {minify} from 'terser'
import {loadYaml} from './loadYaml'

import langStore from './langStore.js?raw'

export const registerTranslations = page => `langStore.registerTranslations(${loadYaml(`./src/i18n/translations/${page}.yml`)})`

const themeStore = (lang = '') => `
const themeStore = (() => {
  const THEMES = ['system', 'light', 'dark']
  let current = localStorage.getItem('theme') ||
    (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')

  const set = theme => {
    if (!THEMES.includes(theme)) return
    current = theme
    localStorage.setItem('theme', theme)
    apply()
  }

  const apply = () => {
    document.documentElement.dataset.theme = current
    ${lang !== ''
      ? `for (const b of themeBtns) b.textContent = translations.${lang}.theme+': '+translations.${lang}[current]`
      : 'langStore.updateI18nElements()'}
  }

  const next = () => {
    set(THEMES[
      (THEMES.indexOf(current) + 1) % THEMES.length
    ])
  }

  const store = { apply, next, get current() { return current; } };
  window.themeStore = store
  return store
})()`

// INFO: Why? To inline every script in one page/html.
export const registerScript = async({
  lang = '', page = '', extraScript = '',
} = {}) => {
  const isBlog = page === '' || page === undefined

  return await minify(`(()=>{
  const themeBtns = document.querySelectorAll('#themeBtn')

  ${themeStore(lang)}

  // Dynamic Translations
  ${isBlog ? `const translations = ${loadYaml(`./src/i18n/translations/global.yml`)}` : `
    ${langStore}
    ${registerTranslations('sidebar-blog')}
    ${registerTranslations('global')}
    ${registerTranslations(page)}

    // Lang Buttons
    for (const b of document.querySelectorAll('#langBtn')) b.onclick = langStore.next

    // Sidebar Dropdown Menu
    langStore.onRebind(() => {
      for(const b of document.querySelectorAll('#dropdownBtn'))
        b.onclick = () => b.nextElementSibling.classList.toggle('show')
    })

    langStore.init()`}

  // Theme Buttons
  for (const b of themeBtns) b.onclick = themeStore.next

  // Sidebar
  const
    xBtn = document.getElementById('xBtn'),
    menu = document.getElementById('menuBtn'),
    overlay = document.getElementById('overlay'),
    mobileSidebar = document.getElementById('mobileSidebar');

  // Mobile Sidebar
  //menu.onclick = () => { mobileSidebar.classList.toggle('show'); overlay.classList.toggle('show') }
  //const hideSidebar = () => { mobileSidebar.classList.remove('show'); overlay.classList.remove('show') }
  //xBtn.onclick = hideSidebar
  //overlay.onclick = hideSidebar

  themeStore.apply()

  ${extraScript}
  })()`, { toplevel: true, compress: true, mangle: true })
}
