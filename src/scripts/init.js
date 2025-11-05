const
  xBtn = document.getElementById('xBtn'),
  menu = document.getElementById('menuBtn'),
  overlay = document.getElementById('overlay'),
  mobileSidebar = document.getElementById('mobileSidebar');

for (const b of document.querySelectorAll('#langBtn'))
  b.onclick = langStore.next

// Theme
for (const b of document.querySelectorAll('#themeBtn'))
  b.onclick = themeStore.next

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

langStore.init()
themeStore.apply()
