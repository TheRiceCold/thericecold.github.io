import {minify} from 'terser'
import {loadYaml} from './loadYaml'

import langStore from '../stores/langStore.js?raw'
import themeStore from '../stores/themeStore.js?raw'

export const registerTranslations = page => `langStore.registerTranslations(${loadYaml(`./src/i18n/translations/${page}.yml`)})`

// INFO: Why? To inline every script in one page/html.
export const registerScript = async({
  page = '',
  extraScript = '',
} = {}) => await minify(`(()=>{
${langStore}
${themeStore}

// Translations
${registerTranslations('global')}
${page === '' || page === undefined ? '': registerTranslations(page)}

// Lang Buttons
for (const b of document.querySelectorAll('#langBtn')) b.onclick = langStore.next
// Theme Buttons
for (const b of document.querySelectorAll('#themeBtn')) b.onclick = themeStore.next

// Sidebar
const
  xBtn = document.getElementById('xBtn'),
  menu = document.getElementById('menuBtn'),
  overlay = document.getElementById('overlay'),
  mobileSidebar = document.getElementById('mobileSidebar');

// Mobile Sidebar
menu.onclick = () => { mobileSidebar.classList.toggle('show'); overlay.classList.toggle('show') }
const hideSidebar = () => { mobileSidebar.classList.remove('show'); overlay.classList.remove('show') }
xBtn.onclick = hideSidebar
overlay.onclick = hideSidebar

// Sidebar Dropdown Menu
langStore.onRebind(() => {
  for(const b of document.querySelectorAll('#dropdownBtn'))
    b.onclick = () => b.nextElementSibling.classList.toggle('show')
})

${extraScript}

langStore.init()
themeStore.apply()
})()`, { toplevel: true, compress: true, mangle: true })
