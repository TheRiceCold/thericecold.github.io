let currentThemeIndex = 0
const
  themeStates = ['system','dark','light'],
  themeBtns = document.querySelectorAll('#themeBtn'),
  savedTheme = localStorage.getItem('theme') || 'system'

const applyTheme = state => {
  document.documentElement.setAttribute('data-theme', state)
  localStorage.setItem('theme', state)
  themeBtns.forEach(b => b.textContent = 'Theme: '+state)
}

(() => {
  if(savedTheme && themeStates.includes(savedTheme))
    currentThemeIndex = themeStates.indexOf(savedTheme)

  themeBtns.forEach(b => b.onclick = () => {
    currentThemeIndex = (currentThemeIndex+1) % themeStates.length
    applyTheme(themeStates[currentThemeIndex])
  })

  applyTheme(themeStates[currentThemeIndex])
})()
