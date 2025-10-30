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

const
    menu = document.getElementById('menuBtn'),
    overlay = document.getElementById('overlay'),
    mobileSidebar = document.getElementById('mobileSidebar');

(() => {
  if(savedTheme && themeStates.includes(savedTheme))
    currentThemeIndex = themeStates.indexOf(savedTheme)

  themeBtns.forEach(b => b.onclick = () => {
    currentThemeIndex = (currentThemeIndex+1) % themeStates.length
    applyTheme(themeStates[currentThemeIndex])
  })

  applyTheme(themeStates[currentThemeIndex])

  menu.onclick = () => { mobileSidebar.classList.toggle('show'); overlay.classList.toggle('show') }
  overlay.onclick = () => { mobileSidebar.classList.remove('show'); overlay.classList.remove('show') }

  // Sidebar Dropdown Menu
  document.querySelectorAll('#dropdownBtn')
    .forEach(b => b.onclick = e => {
      b.nextElementSibling.classList.toggle('show')
      b.classList.toggle('show')
    })
})()
