// import {langStore} from './langStore'

const themeStore = (() => {
  const THEMES = ['system', 'light', 'dark']
  let current = localStorage.getItem('theme') ||
    (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')

  function set(theme) {
    if (!THEMES.includes(theme)) return
    current = theme
    localStorage.setItem('theme', theme)
    apply()
  }

  function apply() {
    document.documentElement.dataset.theme = current
    langStore.updateI18nElements()
  }

  function next() {
    set(THEMES[
      (THEMES.indexOf(current) + 1) % THEMES.length
    ])
  }

  const store = { apply, next, get current() { return current; } };
  window.themeStore = store
  return store
})()

