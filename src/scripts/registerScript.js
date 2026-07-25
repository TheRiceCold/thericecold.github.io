import {minify} from "terser"
import {loadYaml} from "./loadYaml"

import langStore from "./langStore.js?raw"

export const registerTranslations = page => `langStore.registerTranslations(${loadYaml(`./src/i18n/translations/${page}.yml`)})`

const glossary = (isBlog) => `
// Glossary Terms
const modal = document.getElementById("modal"),
      contentChild = modal.children[0].children

for (const t of document.querySelectorAll("#term"))
  t.onclick = e => {
    const term = e.target.textContent.toLowerCase()
    modal.style.display = "flex"
let item = translations[${!isBlog ? "langStore.current" : "localStorage.getItem('lang')"}].glossary.find(i => i.term === term)

    contentChild[0].textContent = item.title ?? item.term
    contentChild[1].innerHTML = item.description
    contentChild[2].innerHTML = "<p>Related: </p>"

    for (let i = 0; i < item.related.length; i++) {
      const relatedNode = document.createElement("a")
      relatedNode.textContent = item.related[i]
      contentChild[2].appendChild(relatedNode)
    }
  }`

const themeStore = isBlog => `
const themeStore = (() => {
  const THEMES = ["system", "light", "dark"]
  let current = localStorage.getItem("theme") ||
    (matchMedia('(prefers-color-scheme: dark)').matches ?
      "dark" : "light")

  const set = theme => {
    if (!THEMES.includes(theme)) return
    current = theme
    localStorage.setItem("theme", theme)
    apply()
  }

  const apply = () => {
    document.documentElement.dataset.theme = current
    ${!isBlog ? 'langStore.updateI18nElements()' :
      `const curTranslations = translations[localStorage.getItem("lang")];
      for (const b of themeBtns)
        b.textContent = curTranslations.theme+": "+curTranslations[current]`}
  }

  const next = () => {
    set(THEMES[(THEMES.indexOf(current) + 1) % THEMES.length])
  }

  const store = { apply, next, get current() { return current; } };
  window.themeStore = store
  return store
})()`

// INFO: Why? To inline every script in one page/html.
export const registerScript = async({
  page = "",
  extraScript = "",
  noSidebar = false,
} = {}) => {
  const isBlog = page === "" || page === undefined

  return await minify(`
(()=>{
  // Setup i18n
  const languages = ${loadYaml('./src/i18n/languages.yml')}
  ${isBlog ?
    `const translations = ${loadYaml("./src/i18n/translations/global.yml")}`
    : `${langStore}
       ${registerTranslations("sidebar-blog")}
       ${registerTranslations("global")}
       ${registerTranslations(page)}

      // Lang Buttons
      for (const b of document.querySelectorAll("#langBtn"))
        b.onclick = langStore.next

      langStore.init()`}

  // Theme Buttons
  const themeBtns = document.querySelectorAll("#themeBtn")
  ${themeStore(isBlog)}
  for (const b of themeBtns) b.onclick = themeStore.next
  themeStore.apply()

  ${!noSidebar ?
    `// Sidebar Elements
    const
      menu = document.getElementById("menuBtn"),
      overlay = document.getElementById("overlay"),
      mobileSidebar = document.getElementById('mobileSidebar')

    // Show/Hide Mobile Sidebar
    menu.onclick = () => {
      mobileSidebar.classList.toggle("show")
      overlay.classList.toggle("show")
    }

    overlay.onclick = () => {
      mobileSidebar.classList.remove("show")
      overlay.classList.remove("show")
    }` : ''}

  // Glossary Modal
  window.onclick = e => {
    const modal = document.getElementById("modal")
    if (e.target === modal)
      modal.style.display = "none"
  }

  // i18n Rebind Elements
  ${!isBlog ?
    `langStore.onRebind(() => {
      // Sidebar dropdown
      for (const b of document.querySelectorAll("#dropdownBtn"))
        b.onclick = () => b.nextElementSibling.classList.toggle("show")
      ${glossary(isBlog)}
    })` : ''}

    })();

${extraScript}
`,{toplevel:true,compress:true,mangle:true})
}
